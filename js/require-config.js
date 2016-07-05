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
    'viz': '//rawgit.com/mdaines/viz.js/gh-pages/bower_components/viz.js/viz',
    'pako': '//cdnjs.cloudflare.com/ajax/libs/pako/0.2.8/pako.min'
  }
};
