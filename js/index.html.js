'use strict';
define(['jquery', 'lodash', 'cm/lib/codemirror', 'canvgModule', 'bootstrap', 'cm/mode/javascript/javascript'], function($, _, codemirror, canvg) {
    var worker = new Worker('js/worker.js');
    var editor = codemirror.fromTextArea($('#editor')[0], {
        'mode': 'javascript',
        'indentWithTabs': true,
        'lineNumbers': true,
        'extraKeys': {
            'Ctrl-Enter': function(cm) {
                $('#generate').click();
            }
        }
    });

    $('a[href=#]').click(function(event) {
        event.preventDefault();
    });

    $('#open').click(function(event) {
        $('#file-open').click();
    });

    $('#file-open').change(function(event) {
        if (this.files.length) {
            var file = this.files[0];
            var reader = new FileReader();
            $(reader).on('load', function(event) {
                editor.session.setValue(event.target.result);
            });
            reader.readAsText(file);
        }
    });

    $(worker).on('message', function(e) {
        var svg = e.originalEvent.data;
        if (typeof svg === 'string') {
            var canvas = $('<canvas>');
            canvg(canvas[0], svg);
            var url = canvas[0].toDataURL();
            $('#save').attr('href', url);
            $('#image').attr('src', url);
        } else {
            console.log('x', svg);
        }
        $('#image').css('opacity', '1.0');
    });

    editor.on('change', _.debounce(function(editor, change) {
        $('#generate').click().trigger();
    }, 300));
    $('#generate').click(function(event) {
        $('#image').css('opacity', '0.3');
        var dot = editor.getValue();
        worker.postMessage(dot);
    });
});
