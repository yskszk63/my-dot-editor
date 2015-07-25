var require = {
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
    'cm/lib/codemirror': '//cdnjs.cloudflare.com/ajax/libs/codemirror/4.8.0/codemirror.min',
    'cm/mode/javascript/javascript': '//cdnjs.cloudflare.com/ajax/libs/codemirror/4.8.0/mode/javascript/javascript.min',
    'viz': '//rawgit.com/mdaines/viz.js/gh-pages/viz',
    'canvgModule': '//rawgit.com/gabelerner/canvg/master/canvg',
    'rgbcolor': '//rawgit.com/gabelerner/canvg/master/rgbcolor',
    'stackblur': '//rawgit.com/gabelerner/canvg/master/StackBlur',
  }
};
