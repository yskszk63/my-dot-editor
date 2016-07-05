'use strict';
define(['ace', 'pako', 'ace/mode-dot', 'ace/ext-language_tools'], function(ace, pako) {
    const worker = new Worker('js/worker.js');
    const editor = ace.edit('editor');
    editor.getSession().setMode('ace/mode/dot');
    editor.getSession().setUseSoftTabs(true);
    editor.$blockScrolling = Infinity;
    editor.focus();

    Array.from(document.querySelectorAll('#engine-selection a')).forEach(element => {
        element.addEventListener('click', event => {
            event.preventDefault();
            delete event.target.parentNode.querySelector('[data-checked="true"]').dataset.checked;
            event.target.dataset.checked = "true";
            update().then(text => storeState(text));
        }, false);
    });

    (() => {
        if (window.location.hash !== '') {
            const compressed = window.location.hash.substring(1);
            const value = pako.inflateRaw(window.atob(compressed));
            editor.getSession().setValue(new TextDecoder().decode(value));
        } else {
            editor.getSession().setValue("digraph G {\n}");
        }
        Promise.resolve().then(update);
    })();

    window.addEventListener('popstate', event => {
        editor.getSession().setValue(event.state);
        update();
    }, false);

    editor.getSession().on('change', debounce(() =>
        document.querySelector('#generate').dispatchEvent(new Event('click')), 1000));

    document.querySelector('#generate').addEventListener('click', event =>
        update().then(text => storeState(text)), false);

    function update() {
        const text = editor.getValue();
        const engine = document.querySelector('#engine-selection a[data-checked="true"]').textContent;

        document.querySelector('body').classList.add('processing');
        const result = dot(text, engine)
            .then(to_svg_dataurl).then(png)
            .then(url => {
                const image = document.querySelector('#image');
                image.src = url;
                image.classList.remove('mdl-badge');
                editor.getSession().clearAnnotations();
                return text;
            });
        result
            .catch(e => {
                const image = document.querySelector('#image');
                image.classList.add('mdl-badge');
                editor.getSession().setAnnotations([{
                    row: 0,
                    type: 'error',
                    text: String(e)
                }]);
            })
            .then(() => document.querySelector('body').classList.remove('processing'));
        return result;
    }

    function storeState(value) {
        const encoded = new TextEncoder().encode(value);
        const compressed = pako.deflateRaw(encoded, {to:'string'});
        window.history.pushState(value, '', '#' + window.btoa(compressed));
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
