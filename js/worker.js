importScripts('require-config.js');
importScripts('//cdnjs.cloudflare.com/ajax/libs/require.js/2.1.20/require.min.js');

const lazyviz = new Promise((resolve, reject) => {
    require({baseUrl:'./'}, ['viz'], viz => resolve(viz));
});

self.addEventListener('message', event => {
    const data = event.data;
    lazyviz
        .then(viz => viz(data.data, {format:'svg', engine:data.engine, useta:true}))
        .then(
            result => self.postMessage({status:'ok', sequence: data.sequence, data: result}),
            e => self.postMessage({status:'ng', sequence: data.sequence, data: String(e)}))
}, false);

