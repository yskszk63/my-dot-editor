'use strict';
define(['jquery', 'lodash', 'ace', 'canvgModule', 'ace/mode-dot', 'ace/ext-language_tools', 'bootstrap'], function($, _, ace, canvg) {
    var worker = new Worker('js/worker.js');
    var editor = ace.edit('editor');
    editor.getSession().setMode('ace/mode/dot');
    editor.getSession().setUseSoftTabs(true);
    editor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: false
    });
    editor.focus();

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
        var message = e.originalEvent.data;
        if (message.status === 'ok') {
            var canvas = $('<canvas>');
            canvg(canvas[0], message.data);
            var url = canvas[0].toDataURL();
            $('#save').attr('href', url);
            $('#image').attr('src', url);
            $('#image').removeClass('bg-danger');
        } else {
            $('#image').addClass('bg-danger');
        }
        $('#image').css('opacity', '1.0');
    });

    editor.getSession().on('change', _.debounce(function(editor) {
        $('#generate').click().trigger('click');
    }, 300));
    $('#generate').click(function(event) {
        $('#image').css('opacity', '0.3');
        var dot = editor.getValue();
        worker.postMessage(dot);
    });
});
