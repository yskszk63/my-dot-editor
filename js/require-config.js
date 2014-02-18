var require = {
	shim: {
		'bootstrap': {
			deps: ['jquery']
		},
		'ace': {
			exports: 'ace'
		},
		'viz': {
			exports: 'Viz'
		},
    'canvg': {
      deps: ['rgbcolor', 'StackBlur'],
      exports: 'canvg'
    },
    'rgbcolor': {
      exports: 'RGBColor'
    },
    'StackBlur': {
      exports: 'stackBlurImage'
    }
	},
	paths: {
		'jquery': 'http://code.jquery.com/jquery-2.1.0.min',
		'bootstrap': 'http://netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min',
		'ace': 'http://cdnjs.cloudflare.com/ajax/libs/ace/1.1.01/ace',
		//'viz': 'http://mdaines.github.io/viz.js/viz',
		'viz': 'viz',
    'rgbcolor': 'http://canvg.googlecode.com/svn/trunk/rgbcolor',
    'StackBlur': 'http://canvg.googlecode.com/svn/trunk/StackBlur',
    'canvg': 'http://canvg.googlecode.com/svn/trunk/canvg'
	}
};
