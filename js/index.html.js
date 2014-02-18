define(['jquery', 'ace', 'viz', 'canvg', 'bootstrap'], function($, ace, viz, canvg) {
	var editor = ace.edit('editor');
	editor.setTheme("ace/theme/eclipse");
	editor.session.setMode("ace/mode/dot");
	editor.session.setUseWorker(false);
	editor.setFontSize($('body').css('font-size'));
	editor.commands.addCommand({
		name: 'generate',
		bindKey: {win: 'Ctrl+F11', mac: 'Ctrl+F11'},
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
		var svg = viz(dot, 'svg');
    var canvas = $('<canvas>');
    canvg(canvas[0], svg);
    var url = canvas[0].toDataURL();
		$('#save').attr('href', url);
    $('#image').attr('src', url);
		$('#output-modal').modal('show');
	});
});
