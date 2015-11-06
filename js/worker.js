importScripts('require-config.js');
importScripts('//cdnjs.cloudflare.com/ajax/libs/require.js/2.1.20/require.min.js');

var lazyviz = new Promise((resolve, reject) => {
    require({baseUrl:'./'}, ['viz'], viz => resolve(viz));
});

self.addEventListener('message', event => {
    var data = event.data;
    lazyviz
        .then(viz => viz(data.data, {format:'svg', engine:data.engine}))
        .then(
            result => self.postMessage({status:'ok', sequence: data.sequence, data: result}),
            e => self.postMessage({status:'ng', sequence: data.sequence, data: e}))
}, false);

