'use strict';
define(['ace', 'pako', 'ace/mode-dot', 'ace/ext-language_tools'], function(ace, pako) {
    const worker = new Worker('js/worker.js');

    const p = Symbol();
    class EventEmitter {
        constructor() {
            Object.defineProperty(this, p, {
                value: {
                    listeners: new Map()
                }
            });
        }
        dispatch(type) {
            const l = this[p].listeners;
            if (l.has(type)) {
                l.get(type).forEach(listener => listener(this));
            }
        }
        on(type, listener) {
            const l = this[p].listeners;
            (l.get(type) || l.set(type, new Set()).get(type)).add(listener);
        }
        off(type, listener) {
            const l = this[p].listeners;
            if (l.has(type)) {
                const listeners = l.get(type);
                listeners.delete(listener);
                if (!listeners.size) {
                    l.delete(type);
                }
            }
        }
    }

    const model = new (class Model extends EventEmitter {
        constructor(source="", engine="dot") {
            super();
            Object.assign(this[p], {source, engine});
        }
        get source() {
            return this[p].source;
        }
        set source(val) {
            this[p].source = val;
            this.dispatch('change');
        }
        get engine() {
            return this[p].engine;
        }
        set engine(val) {
            this[p].engine = val;
            this.dispatch('change');
        }
        get state() {
            return this[p].state;
        }
        set state(val) {
            this[p].state = val;
            this.dispatch('state_changed');
        }
        get result() {
            return this[p].result;
        }
        set result(val) {
            this[p].result = val;
            delete this[p].error;
            this.state = 'success';
        }
        get error() {
            return this[p].error;
        }
        set error(val) {
            delete this[p].result;
            this[p].error = val;
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

    window.addEventListener('click', event => {
        if (event.target.closest('nav a[href]')) {
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
        switch(self.state) {
        case 'success':
            editor.getSession().clearAnnotations();
            break;
        case 'error':
            editor.getSession().setAnnotations([{
                row: 0,
                type: 'error',
                text: String(self.error)
            }]);
            break;
        }
    });
    model.on('state_changed', self => {
        const target = document.querySelector('output a');

        switch(self.state) {
        case 'success':
            const url = URL.createObjectURL(self.result);
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'document';
            xhr.addEventListener('load', event => {
                URL.revokeObjectURL(target.href);
                target.href = url;
                Array.from(target.children, e => e.remove());
                const clone = document.importNode(
                    event.target.response.documentElement, true);
                target.appendChild(clone);
            }, false);
            xhr.send();
            break;
        }
    });

    function update(model) {
        const text = model.source;
        const engine = model.engine;

        model.state = 'processing';
        return dot(text, engine)
            .then(blob => {
                model.result = blob;
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
                        resolve(new Blob([message.data], {type:'image/svg+xml'}));
                    } else {
                        reject(message.data);
                    }
                }
            }
            worker.addEventListener('message', handler, false);
            worker.postMessage({data:source, sequence, engine});
        });
    }

/*
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
*/
    function debounce(fun, interval) {
        var timer;
        return () => {
            clearTimeout(timer);
            timer = setTimeout(fun, interval);
        };
    }

});
