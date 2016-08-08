'use strict';
define(['ace', 'pako', 'ace/mode-dot', 'ace/ext-language_tools'], function(ace, pako) {
    const worker = new Worker('js/worker.js');

    class EventEmitter {
        constructor() {
            Object.defineProperty(this, '_listeners', {
                value: new Map()
            });
        }
        dispatch(type) {
            if (this._listeners.has(type)) {
                this._listeners.get(type)
                    .forEach(listener => listener(this));
            }
        }
        on(type, listener) {
            if (!this._listeners.has(type)) {
                this._listeners.set(type, new Set());
            }
            this._listeners.get(type).add(listener);
        }
        off(type, listener) {
            if (this._listeners.has(type)) {
                const listeners = this._listeners.get(type);
                listeners.delete(listener);
                if (!listeners.size) {
                    this._listeners.delete(type);
                }
            }
        }
    }

    const model = new (class Model extends EventEmitter {
        constructor(source="", engine="dot") {
            super();
            this._source = source;
            this._engine = engine;
        }
        get source() {
            return this._source;
        }
        set source(val) {
            this._source = val;
            this.dispatch('change');
        }
        get engine() {
            return this._engine;
        }
        set engine(val) {
            this._engine = val;
            this.dispatch('change');
        }
        get state() {
            return this._state;
        }
        set state(val) {
            this._state = val;
            this.dispatch('state_changed');
        }
        get result() {
            return this._result;
        }
        set result(val) {
            this._result = val;
            delete this._error;
            this.state = 'success';
        }
        get error() {
            return this._error;
        }
        set error(val) {
            delete this._result;
            this._error = val;
            this.state = 'error';
        }
    })()

    model.on('change', self => update(self).then(storeState));

    const editor = ((element) => {
        const editor = ace.edit(element);
        editor.getSession().setMode('ace/mode/dot');
        editor.getSession().setUseSoftTabs(true);
        editor.$blockScrolling = Infinity;
        return editor;
    })(document.querySelector('#editor'));
    editor.focus();

    editor.getSession().on('change',
            debounce(() => model.source = editor.getValue(), 1000));

    document.querySelector('html').addEventListener('click', event => {
        if (event.target.matches('a[href]')) {
            event.preventDefault();
        }
    }, false);

    document.querySelector('#engine-selection').addEventListener('click', event => {
        const self = event.currentTarget;
        const target = event.target.closest('a:not([data-checked])');

        if (!!target && self.contains(target)) {
            delete self.querySelector('a[data-checked]').dataset.checked;
            target.dataset.checked = "true";
            model.engine = target.textContent;
        }

        if (!!self.closest('.mdl-layout__drawer.is-visible')) {
            self.closest('.mdl-layout').MaterialLayout.toggleDrawer();
        }
    }, false);

    window.addEventListener('hashchange', event => {console.log("OK")}, false);
    (() => {
        const value = (() => {
            if (window.location.hash !== '') {
                try {
                    const compressed = window.location.hash.substring(1);
                    return new TextDecoder().decode(pako.inflateRaw(window.atob(compressed)));
                } catch (e) {
                }
            }
            return "digraph G {\n}";
        })();
        editor.setValue(value);
    })();

    window.addEventListener('popstate',
        event => editor.setValue(event.state), false);

    document.querySelector('#generate').addEventListener('click',
        () => model.source = editor.getValue(), false);

    model.on('state_changed', self => {
        switch(self.state) {
        case 'success':
        case 'error':
            document.querySelector('body').classList.remove('processing');
            break;
        default:
            document.querySelector('body').classList.add('processing');
            break;
        }
    });
    model.on('state_changed', self => {
        const image = document.querySelector('#image');

        switch(self.state) {
        case 'success':
            image.src = self.result;
            image.classList.remove('mdl-badge');
            editor.getSession().clearAnnotations();
            break;

        case 'error':
            image.classList.add('mdl-badge');
            editor.getSession().setAnnotations([{
                row: 0,
                type: 'error',
                text: String(self.error)
            }]);
            break;
        }
    });

    function update(model) {
        const text = model.source;
        const engine = model.engine;

        model.state = 'processing';
        return dot(text, engine)
            .then(to_svg_dataurl).then(png)
            .then(url => {
                model.result = url;
                return text;
            }, e => {
                model.error = e;
                throw e;
            });
    }

    function storeState(value) {
        if (history.state != value) {
            const encoded = new TextEncoder().encode(value);
            const compressed = pako.deflateRaw(encoded, {to:'string'});
            window.history.pushState(value, '', '#' + window.btoa(compressed));
        }
    }

    var sequence_generator = 0;
    function dot(source, engine) {
        const sequence = sequence_generator++;
        return new Promise((resolve, reject) => {
            function handler(event) {
                var message = event.data;
                if (message.sequence === sequence) {
                    worker.removeEventListener('message', handler, false);
                    if (message.status === 'ok') {
                        resolve(message.data);
                    } else {
                        reject(message.data);
                    }
                }
            }
            worker.addEventListener('message', handler, false);
            worker.postMessage({data:source, sequence, engine});
        });
    }

    function to_svg_dataurl(svg) {
        return new Promise((resolve, reject) => {
            const blob = new Blob([svg], {type:'image/svg+xml'});
            const reader = new FileReader();
            reader.addEventListener('load', event => resolve(event.target.result), false);
            reader.addEventListener('error', reject, false);
            reader.readAsDataURL(blob);
        });
    }

    function png(svg) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', event => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext("2d");
                    canvas.width = image.width;
                    canvas.height = image.height;
                    ctx.drawImage(image, 0, 0);
                    resolve(canvas.toDataURL('image/png'));
                } catch (e) {
                    reject(e);
                }
            }, false);
            image.src = svg;
        });
    }

    function debounce(fun, interval) {
        var timer;
        return () => {
            clearTimeout(timer);
            timer = setTimeout(fun, interval);
        };
    }

});
