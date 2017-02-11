import * as codemirror from 'codemirror';
import 'codemirror/mode/javascript/javascript';
import * as pako from 'pako';
import 'material-design-lite';
import {Model} from './Model';

const worker = new Worker('lib/worker.js');
const model = new Model();
const editor = codemirror.fromTextArea(
    document.querySelector('#editor'), {mode: 'javascript', lineNumbers: true});
editor.focus();

model.on('change', self => update(self).then(storeState));
editor.on('change',
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
document.querySelector('#fit').addEventListener('change',
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
        //editor.getSession().clearAnnotations();
        break;
    case 'error':
        document.querySelector('#error-output').MaterialSnackbar.showSnackbar({
            message: String(self.error)
        })
        //editor.getSession().setAnnotations([{
        //    row: 0,
        //    type: 'error',
        //    text: String(self.error)
        //}]);
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
            if (document.querySelector('#fit:checked')) {
                clone.setAttribute('width', '100%');
                clone.setAttribute('height', '100%');
            }
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
    if (window.history.state != value) {
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
        const data = source;
        worker.addEventListener('message', handler, false);
        worker.postMessage({data, sequence, engine});
    });
}

function debounce(fun, interval) {
    var timer;
    return () => {
        clearTimeout(timer);
        timer = setTimeout(fun, interval);
    };
}
