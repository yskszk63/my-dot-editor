var require = {
  packages: [
    {
      name: 'ace',
      location: '//cdnjs.cloudflare.com/ajax/libs/ace/1.2.0',
      main: 'ace'
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
    'viz': '../viz',
    'lodash': '//cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.0/lodash.min',
    'localforage': 'https://cdnjs.cloudflare.com/ajax/libs/localforage/1.3.0/localforage.min'
  }
};
