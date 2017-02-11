/* global Viz */
importScripts('https://cdnjs.cloudflare.com/ajax/libs/viz.js/1.7.0/viz.js');

self.addEventListener('message', event => {
    const data = event.data;
    try {
        const result = Viz(data.data, {format:'svg', engine:data.engine, useta:true});
        self.postMessage({status:'ok', sequence: data.sequence, data: result});
    } catch (e) {
        self.postMessage({status:'ng', sequence: data.sequence, data: String(e)});
    }
}, false);
