importScripts('require-config.js');
importScripts('//cdnjs.cloudflare.com/ajax/libs/require.js/2.1.20/require.min.js');

require({baseUrl: './'}, ['viz'], function(viz) {
    self.addEventListener('message', function(e) {
        var data = e.data;
        try {
            self.postMessage({status:'ok', sequence: data.sequence, data: viz(data.data, {format:'svg', engine:data.engine})});
        } catch (e) {
            self.postMessage({status:'ng', sequence: data.sequence, data: e});
        }
    }, false);
});
