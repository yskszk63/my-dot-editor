'use strict';
define(['jquery', 'cm/lib/codemirror', 'viz', 'canvgModule', 'bootstrap', 'cm/mode/javascript/javascript'], function($, codemirror, viz, canvg) {
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

    $('#generate').click(function(event) {
        var dot = editor.getValue();
        var svg = viz(dot, 'svg');
        var canvas = $('<canvas>');
        canvg(canvas[0], svg);
        var url = canvas[0].toDataURL();
        $('#save').attr('href', url);
        $('#image').attr('src', url);
        $('#output-modal').modal('show');
	});

});
