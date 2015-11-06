'use strict';
define(['jquery', 'lodash', 'ace', 'pako', 'ace/mode-dot', 'ace/ext-language_tools', 'bootstrap'], function($, _, ace, pako) {
    var worker = new Worker('js/worker.js');
    var editor = ace.edit('editor');
    editor.getSession().setMode('ace/mode/dot');
    editor.getSession().setUseSoftTabs(true);
    editor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: false,
        fontSize: $('body').css('font-size')
    });
    editor.$blockScrolling = Infinity;
    editor.focus();

    $(window).on('popstate', e=> {
        editor.getSession().setValue(e.originalEvent.state);
    });

    if (window.location.hash !== '') {
        var compressed = window.location.hash.substring(1);
        var value = pako.inflateRaw(window.atob(compressed));
        var decoder = new TextDecoder();
        var v = decoder.decode(value);
        history.replaceState(v, '');
        editor.getSession().setValue(v);
    }

    $('a[href=#]').on('click', event => event.preventDefault());

    $('.app-engine').on('click', event => {
        $('#selected-engine').text($(event.target).data('app-engine'));
        $('#generate').on('click').trigger('click');
    });

    editor.getSession().on('change', _.debounce(() => $('#generate').on('click').trigger('click'), 300));

    $('#generate').on('click', () => {
        var text = editor.getValue();
        $('#image').css('opacity', '0.3');
        Promise.resolve(text)
            .then(dot).then(to_svg_dataurl)
            .then(png).then(url => {
                $('#save').attr('href', url);
                $('#image').attr('src', url);
                $('#image').removeClass('bg-danger');
                editor.getSession().clearAnnotations();
                storeState(text);
            })
            .catch(e=>{
                $('#image').addClass('bg-danger');
                editor.getSession().setAnnotations([{
                    row: 0,
                    type: 'error',
                    text: String(e)
                }]);
            })
            .then(() => {
                $('#image').css('opacity', '1.0');
            });
    });

    function storeState(value) {
        var encoder = new TextEncoder();
        var encoded = encoder.encode(value);
        var compressed = pako.deflateRaw(encoded, {to:'string'});
        window.history.pushState(value, '', '#' + window.btoa(compressed));
    }

    var sequence_generator = 0;
    function dot(source) {
        var sequence = sequence_generator++;
        return new Promise((resolve, reject) => {
            function handler(event) {
                var message = event.originalEvent.data;
                if (message.sequence === sequence) {
                    $(worker).off('message', handler);
                    if (message.status === 'ok') {
                        resolve(message.data);
                    } else {
                        reject(message.data);
                    }
                }
            }
            $(worker).on('message', handler);
            worker.postMessage({data:source, sequence:sequence, engine:$('#selected-engine').text()});
        });
    }

    function to_svg_dataurl(svg) {
        return new Promise((resolve, reject) => {
            var blob = new Blob([svg], {type:'image/svg+xml'});
            var reader = new FileReader();
            $(reader).on('load', event => resolve(event.target.result));
            $(reader).on('error', reject);
            reader.readAsDataURL(blob);
        });
    }

    function png(svg) {
        return new Promise((resolve, reject) => {
            var image = new Image();
            $(image).on('load', event => {
                try {
                    var canvas = $('<canvas>')[0];
                    var ctx = canvas.getContext("2d");
                    canvas.width = image.width;
                    canvas.height = image.height;
                    ctx.drawImage(image, 0, 0);
                    resolve(canvas.toDataURL('image/png'));
                } catch (e) {
                    reject(e);
                }
            });
            image.src = svg;
        });
    }

});
