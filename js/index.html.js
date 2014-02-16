define(['jquery', 'ace', 'viz', 'bootstrap'], function($, ace, viz) {
	var editor = ace.edit('editor');
	editor.setTheme("ace/theme/eclipse");
	editor.session.setMode("ace/mode/dot");
	editor.session.setUseWorker(false);
	editor.setFontSize($('body').css('font-size'));
	editor.commands.addCommand({
		name: 'generate',
		bindKey: {win: 'Shift+Enter', mac: 'Ctrl+F11'},
		exec: function() {
			$('#generate').click();
		},
		readOnly: true
	});

	$('#open').click(function(event) {
		event.preventDefault();
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
		event.preventDefault();

		var dot = editor.getValue();
		var svg = viz(dot + new Array(dot.length).join(' '), 'svg');
		var image = $('#image');
		var old = image.attr('src');
		var url = URL.createObjectURL(new Blob([svg], {type:'image/svg+xml'}));
		image.attr('src', url);
		$('#save').attr('href', url);
		if (old) {
			URL.revokeObjectURL(old);
		}
		$('#output-modal').modal('show');
	});

});
