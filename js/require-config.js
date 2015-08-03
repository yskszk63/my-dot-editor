var require = {
  packages: [
    {
      name: 'codemirror',
      location: '//cdnjs.cloudflare.com/ajax/libs/codemirror/5.5.0',
      main: 'lib/codemirror'
    }
  ],
  shim: {
    'bootstrap': {
      deps: ['jquery']
    },
    'viz': {
      exports: 'Viz'
    }
  },
  paths: {
    'jquery': '//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min',
    'bootstrap': '//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.5/js/bootstrap.min',
    'codemirror/lib/codemirror': '//cdnjs.cloudflare.com/ajax/libs/codemirror/5.5.0/codemirror.min',
    'viz': '//rawgit.com/mdaines/viz.js/gh-pages/viz',
    'canvgModule': '//rawgit.com/gabelerner/canvg/master/canvg',
    'rgbcolor': '//rawgit.com/gabelerner/canvg/master/rgbcolor',
    'stackblur': '//rawgit.com/gabelerner/canvg/master/StackBlur',
    'lodash': 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.0/lodash.min',
  }
};
