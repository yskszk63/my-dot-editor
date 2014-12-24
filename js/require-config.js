var require = {
  shim: {
    'bootstrap': {
      deps: ['jquery']
    },
    'viz': {
      exports: 'Viz'
    },
    'canvg/canvg': {
      deps: ['canvg/rgbcolor', 'canvg/StackBlur'],
      exports: 'canvg'
    },
    'canvg/rgbcolor': {
      exports: 'RGBColor'
    },
    'canvg/StackBlur': {
      exports: 'stackBlurImage'
    }
  },
  paths: {
    'jquery': '//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min',
    'bootstrap': '//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.1/js/bootstrap.min',
    'cm/lib/codemirror': '//cdnjs.cloudflare.com/ajax/libs/codemirror/4.8.0/codemirror.min',
    'cm/mode/javascript/javascript': '//cdnjs.cloudflare.com/ajax/libs/codemirror/4.8.0/mode/javascript/javascript.min',
    'viz': '//rawgit.com/mdaines/viz.js/gh-pages/viz',
    'canvg': '//rawgit.com/gabelerner/canvg/master'
	}
};
