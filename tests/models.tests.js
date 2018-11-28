/* jshint -W024 */
/* jshint expr:true */

const assert = require('assert')
const path = require('path')
const app = require('electron').remote.app
const expect = require('chai').expect

let webRoot = path.dirname(__dirname)
window.model = require(path.join(webRoot, 'app', 'model.js'))
window.model.db = path.join(app.getPath('userData'), 'example.db')

/* global describe it */

describe('model', function () {
	before(function() {
		window.model.wipeDb(app.getPath('userData'), function() {
			window.model.initDb(app.getPath('userData'))
		});
	})

	describe('courses', function() {
		it('should insert a course', function() {
			let course = {
				columns: ["course_name", "course_number"],
				values: ["Agile", "1234"]
			}
			window.model.saveFormData('courses', course)
		});

		it('should return all courses', function() {
			let coursesObj = window.model.getCourses();
			expect(coursesObj).to.be.an('object');
			let courses = Object.values(coursesObj);
			expect(courses).to.have.lengthOf(1);
		})

		it('should return a course by id', function() {
			let coursesObj = window.model.getCourses();
			expect(coursesObj).to.be.an('object');
			let courses = Object.values(coursesObj);
			expect(courses).to.have.lengthOf(1);
			let course = model.getCourse(courses[0].course_id);
			expect(course).to.be.an('object');
			expect(course[0].course_name).to.equal("Agile");
		})

		it('should delete a course', function() {
			let coursesObj = window.model.getCourses();
			let courses = Object.values(coursesObj);
			model.deleteCourse(courses[0].course_id);

			coursesObj = window.model.getCourses();
			expect(coursesObj).to.be.undefined;
		})
	})

	describe('questions', function() {
		before(function() {
			let course = {
				columns: ["course_name", "course_number"],
				values: ["Agile", "1234"]
			}
			window.model.saveFormData('courses', course)
		})

		it('should insert a question', function() {
			let coursesObj = window.model.getCourses();
			let courseId = coursesObj[0].course_id;

			let question = {
				columns: ["question_text", "question_type", "question_point", "course_id"],
				values: ["What is the capital of Louisiana?", "text", 3, courseId]
			}
			window.model.saveFormData('questions', question);
		});

		it('should get all questions', function() {
			let questionsObj = window.model.getQuestions();
			let questions = Object.values(questionsObj);
			expect(questions.length).to.equal(1);
		});

		it('should get a question by id', function() {
			let questionsObj = window.model.getQuestions();
			let questionByIdObj = window.model.getQuestion(questionsObj[0].question_id);
			expect(questionByIdObj).to.be.an('object');
			expect(questionByIdObj[0].question_text).to.equal("What is the capital of Louisiana?");
		});

		it('should get all questions for a course', function() {
			let coursesObj = window.model.getCourses();
			let courseId = coursesObj[0].course_id;

			let questionsForCourseObj = window.model.getQuestionsForCourse(courseId);
			let questionsForCourse = Object.values(questionsForCourseObj);
			expect(questionsForCourse.length).to.equal(1);
		});

		it('should delete a question', function() {
			let questionsObj = window.model.getQuestions();
			model.deleteQuestion(questionsObj[0].question_id);

			questionsObj = window.model.getQuestions();
			expect(questionsObj).to.be.undefined;
		});
	})

	describe('options', function() {
		before(function() {
			let course = {
				columns: ["course_name", "course_number"],
				values: ["Agile", "1234"]
			}
			window.model.saveFormData('courses', course, function(courseId) {
				let question = {
					columns: ["question_text", "question_type", "question_point", "course_id"],
					values: ["What is the capital of Louisiana?", "text", 3, courseId]
				}
				window.model.saveFormData('questions', question);
			});
		})

		it('should insert an option', function() {
			let questionsObj = window.model.getQuestions();
			let questionId = questionsObj[0].question_id;

			let option = {
				columns: ["context", "question_id", "is_correct"],
				values: ["Baton Rouge", questionId, true]
			}
			window.model.saveFormData('options', option);
		});

		it('should get all options', function() {
			let optionsObj = window.model.getOptions();
			let options = Object.values(optionsObj);
			expect(options.length).to.equal(1);
		});

		it('should get an option by id', function() {
			let optionsObj = window.model.getOptions();
			let optionByIdObj = window.model.getOption(optionsObj[0].option_id);
			expect(optionByIdObj).to.be.an('object');
			expect(optionByIdObj[0].context).to.equal("Baton Rouge");
		});

		it('should get all options for a question', function() {
			let questionsObj = window.model.getQuestions();
			let questionId = questionsObj[0].question_id;

			let optionsForQuestionObj = window.model.getOptionsForQuestion(questionId);
			let optionsForQuestion = Object.values(optionsForQuestionObj);
			expect(optionsForQuestion.length).to.equal(1);
		});

		it('should delete an option', function() {
			let optionsObj = window.model.getOptions();
			model.deleteOption(optionsObj[0].option_id);

			optionsObj = window.model.getOptions();
			expect(optionsObj).to.be.undefined;
		});
	})

	describe('questionSets', function() {
		before(function() {
			let course = {
				columns: ["course_name", "course_number"],
				values: ["Agile", "1234"]
			}
			window.model.saveFormData('courses', course)
		})

		it('should insert a question set', function() {
			let courseId = window.model.getCourses()[0].course_id;

			let qset = {
				columns: ["question_set_name", "course_id"],
				values: ["Question Set I", courseId]
			}
			window.model.saveFormData('question_sets', qset);
		});
		
		it('should get all question sets', function() {
			let questionSetsObj = window.model.getQuestionSets();
			let questionSets = Object.values(questionSetsObj);
			expect(questionSets.length).to.equal(1);
		});

		it('should get a question set by id', function() {
			let questionSetsObj = window.model.getQuestionSets();
			let questionSetByIdObj = window.model.getQuestionSet(questionSetsObj[0].question_set_id);
	
			expect(questionSetByIdObj[0]).to.be.an('object');
			
			expect(questionSetByIdObj[0].question_set_name).to.equal("Question Set I");

		});

		it('should delete a question set', function() {
			let questionSetsObj = window.model.getQuestionSets();
			model.deleteQuestionSet(questionSetsObj[0].question_set_id);

			questionSetsObj = window.model.getQuestionSets();
			expect(questionSetsObj).to.be.undefined;
		});
	})


	/*For QuestionSetItems*/
	/*describe('questionSetItems', function() {
		before(function() {
			let course = {
				columns: ["course_name", "course_number"],
				values: ["Agile", "1234"]
			}
			window.model.saveFormData('courses', course)
			
			let courseId = window.model.getCourses()[0].course_id;

			let question = {
					columns: ["question_text", "question_type", "question_point", "course_id"],
					values: ["What is the capital of Louisiana?", "text", 3, courseId]
			}
			window.model.saveFormData('questions', question);

			let qset = {
				columns: ["question_set_name", "course_id"],
				values: ["Question Set I", courseId]
			}
			window.model.saveFormData('question_sets', qset);
		})

			it('should get a question set items by id', function() {
				let questionSetsObj = window.model.getQuestionSets();
				let questionSetIdObj = window.model.getQuestionSet(questionSetsObj[0].question_set_id);
				let questionSetItemId = questionSetIdObj.question_set_id;
				let questionSetItemsObj = window.model.getQuestionSetItems(questionSetItemId);
				expect(questionSetItemsObj.length).to.equal(1);
			});


	})*/

})
