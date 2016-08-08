var require = {
  packages: [
    {
      name: 'ace',
      location: '//cdnjs.cloudflare.com/ajax/libs/ace/1.2.3',
      main: 'ace'
    }
  ],
  shim: {
    'viz': {
      exports: 'Viz'
    }
  },
  paths: {
    'viz': 'https://rawgit.com/yskszk63/viz.js/master/dist/viz',
    'pako': '//cdnjs.cloudflare.com/ajax/libs/pako/0.2.8/pako.min'
  }
};
