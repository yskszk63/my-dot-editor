var require = {
  packages: [
    {
      name: 'codemirror',
      location: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.21.0/',
      main: 'codemirror.min'
    }
  ],
  map: {
    'codemirror': {
      'codemirror/lib/codemirror': 'codemirror'
    }
  },
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
