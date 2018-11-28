PDFDocument = require('pdfkit');
const os = require('os');
const path = require('path');

const dialog = require('electron').remote.dialog;

module.exports.exportPdf = function(questions, question_set_name, showAnswers) {
	dialog.showSaveDialog(function(fileName) {
		if (fileName === undefined) return;
		doc = new PDFDocument();
		doc.pipe(fs.createWriteStream(fileName));

		let text = ''
		questions.forEach(function(question, qIndex) {
			doc.text(`Q-${qIndex+1} [${question.question_point} pts] ${question.question_text}\n\n`);
			question.options.forEach(function(option, oIndex) {
				if (question.question_type === "text") {
					if (showAnswers) {
						doc.text(`Answer:\n${option.context}`);
					} else {
						doc.text("\n\n\n\n\n\n");
					}
				} else if (question.question_type === "multiple") {
					doc.text(`${String.fromCharCode(97 + oIndex)}) ${option.context} \n`);
				} else if (question.question_type === "image") {
					if (showAnswers) {
						doc.text("\n");
						doc.image(option.image_path,{width:300});
					} else {
						doc.text("\n\n\n\n\n\n");
					}
				}
			});

			if (showAnswers && question.question_type === "multiple") {
				doc.text("\nAnswer: \n");

				let answers = question.options.filter(function(option) {
					return option.is_correct;
				});

				let answerText = "";
				question.options.forEach(function(option, oIndex) {
					if (option.is_correct) {
						if (answers.length > 1 && answers.indexOf(option) === answers.length - 2) {
							answerText += `${String.fromCharCode(97 + oIndex)}) and `;
						} else {
							answerText += `${String.fromCharCode(97 + oIndex)})  `;
						}
					}
				});

				doc.text(answerText);
			}
			doc.text("\n\n");
		});

		doc.end()
	});
};
