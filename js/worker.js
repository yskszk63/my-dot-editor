importScripts('require-config.js');
importScripts('//cdnjs.cloudflare.com/ajax/libs/require.js/2.1.20/require.min.js');

this.window = this;
require({baseUrl: './'}, ['viz'], function(viz) {
  self.addEventListener('message', function(e) {
    var data = e.data;
    try {
        var svg = viz(data, 'svg');
        self.postMessage({status:'ok', data:viz(data, 'svg')});
    } catch (e) {
        self.postMessage({status:'ng', data:e});
    }
  }, false);
});