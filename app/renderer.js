const fs = require('fs')
const path = require('path')
const app = require('electron').remote.app

let webRoot = path.dirname(__dirname)
window.model = require(path.join(webRoot, 'model.js'))
window.model.db = path.join(app.getPath('userData'), 'example.db')
window.angular = require('angular')
window.Hammer = require('hammerjs')

const pdf = require(path.join(webRoot, 'generate-pdf.js'))

var angularApp = angular.module("questionBank", [require('angular-route')])

angularApp.factory('courses', function() {
  return {
    exist: function() {
    	return model.getCourses() ? true : false;
    }
  };
});

angularApp.directive('customOnChange', function() {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var onChangeHandler = scope.$eval(attrs.customOnChange);
      element.on('change', onChangeHandler);
      element.on('$destroy', function() {
        element.off();
      });

    }
  };
});

angularApp.config(function($routeProvider) {
  $routeProvider
		.when('/', {
			templateUrl: 'courses.html',
			controller: 'CoursesCtrl'
		})
		.when('/courses', {
			templateUrl: 'courses.html',
			controller: 'CoursesCtrl'
		})
		.when('/add-course', {
			templateUrl: 'add-course.html',
			controller: 'AddCourseCtrl'
		})
		.when('/add-course-courses', {
			templateUrl: 'add-course-courses.html',
			controller: 'AddCourseCtrl'
		})
		.when('/questions/:course_id', {
	    templateUrl: 'questions.html',
	    controller: 'QuestionsCtrl'
	  })
		.when('/add-question/:course_id', {
			templateUrl: 'add-question.html',
			controller: 'AddQuestionCtrl'
		})
		.when('/edit-question', {
			templateUrl: 'edit-question.html',
			controller: 'EditQuestionCtrl'
		})
		.when('/question-sets', {
			templateUrl: 'question-sets.html',
			controller: 'QuestionSetsCtrl'
		})
		.when('/question-sets/:course_id', {
			templateUrl: 'question-sets-for-course.html',
			controller: 'QuestionSetsForCourseCtrl'
		})
		.when('/view-questions-for-question-set/:question_set_id', {
			templateUrl: 'view-questions-for-question-set.html',
			controller: 'ViewQuestionsForQuestionSetCtrl'
		})
})

angularApp.controller('MainCtrl', ['$window', '$route', '$routeParams', '$location',
  function($window, $route, $routeParams, $location) {
  	this.$window = $window;
    this.$route = $route;
    this.$location = $location;
    this.$routeParams = $routeParams;
	}])

angularApp.controller('NavCtrl', function($scope, courses) {
	$scope.coursesExist = function() {
		return courses.exist();
	}
});

angularApp.controller('LandingCtrl', function($scope, courses) {
	$scope.coursesExist = function() {
		console.log('landing control', courses.exist());
		return courses.exist();
	}
});

angularApp.controller('CoursesCtrl', function($scope, courses, $location) {
	$scope.courses = model.getCourses();
	$scope.coursesExist = function() {
		return courses.exist();
	};
	$scope.deleteCourse = function(cid) {
		model.deleteCourse(cid);
		$scope.courses = model.getCourses();
		if (!model.getCourses()) {
			$location.path('/');
		}
	};
});

angularApp.controller('AddCourseCtrl', function($scope, $location) {
	$scope.course = {};
	$scope.submit = function() {
		let formData = {columns: ['course_name', 'course_number'], values: [$scope.course.name, $scope.course.id]};
		model.saveFormData('courses', formData);
		$location.path('/courses');
	};
});

angularApp.controller('QuestionsCtrl', function($scope, $routeParams) {
	$scope.questions = model.getQuestionsForCourse($routeParams.course_id);
	$scope.course_id = $routeParams.course_id;
	$scope.course = model.getCourse($routeParams.course_id)[0];
	$scope.questionSetName = "";
	$scope.imageForModal = "";

	$scope.getOptionForQuestion = function(qid){
		return model.getOptionsForQuestion(qid);
	}

	let questionSet = new Set();
	$scope.questionSetArr = [];

	$scope.toggleSelection = function(qid){
		if (questionSet.has(qid)){
			questionSet.delete(qid);
		} else {
			questionSet.add(qid);
		}
		$scope.questionSetArr = Array.from(questionSet);
	}

	$scope.openQuestionSetNameModal = function() {
		$('#questionSetName').modal();
		$('#questionSetName').modal('open');
	}

	$scope.generateQuestionSet = function(){
		let formData = {columns: ['course_id', 'question_set_name'], values: [$routeParams.course_id, $scope.questionSetName]};
		model.saveFormData('question_sets', formData, function(questionSetId) {
			$scope.questionSetArr.forEach(function(questionId) {
				let questionFormData = {columns: ['question_set_id', 'question_id'], values: [questionSetId, questionId]};
				model.saveFormData('question_set_items', questionFormData);
			});
		});
	}

	$scope.showEditModal = function(qid) {
		$('#modal' + qid).modal();
		$('#modal' + qid).modal('open');
	}

	$scope.showModalForImage = function(imagePath) {
		$scope.imageForModal = imagePath;

		$("#modal-for-image").modal();
		$("#modal-for-image").modal('open');
	}

	$scope.deleteQuestion = function(qid) {
		model.deleteQuestion(qid);
		$scope.questions = model.getQuestionsForCourse($routeParams.course_id);
	}

	$scope.getImagePath = function(img) {
		return path.join(app.getPath('userData'), 'images', img);
	}
});

angularApp.controller('AddQuestionCtrl', function($scope, $routeParams, $location) {
	$scope.question = {};
	$scope.hiddenDiv = false;
	$scope.options = [{context: "", isCorrect: 0, question_id: null}];
	$scope.images = [];
	$scope.textOption = {context: ""};
	$scope.submit = function() {
		let formData = {columns: ['question_text', 'question_type', 'question_point', 'course_id'], values: [$scope.question.text, $scope.question.type, $scope.question.point, $routeParams.course_id]};
		model.saveFormData('questions', formData, function(questionId) {
			if ($scope.question.type === "text"){
				let optionFormData = {columns: ['context', 'question_id', 'is_correct'], values: [$scope.textOption.context, questionId, true]};
				model.saveFormData('options', optionFormData);
			}
			else if ($scope.question.type === "multiple") {
				$scope.options.forEach(function(option) {
					let optionFormData = {columns: ['context', 'question_id', 'is_correct'], values: [option.context, questionId, option.isCorrect]};
					model.saveFormData('options', optionFormData);
				});
			} else if($scope.question.type === "image"){
				$scope.images.forEach(function(image) {
					model.copyImage(image.path, function(newImgPath) {
						console.log('newImgPath', newImgPath);
						newImgPath = path.join(app.getPath('userData'), 'images', newImgPath);
						let optionFormData = {columns: ['context', 'question_id', 'is_correct', 'image_path'], values: ["image", questionId, true, newImgPath]};
						model.saveFormData('options', optionFormData);
					});
				});
				console.log("adding question");
			}
			$scope.question = {};
			$scope.textOption = {};
			$scope.options = [{context: "", isCorrect: 0, question_id: null}];

		});
		$location.path('/questions/' + $routeParams.course_id);
	};
	$scope.cancel = function(){
		$location.path('/questions/' + $routeParams.course_id);
	}
	$scope.addOption = function() {
		$scope.options.push({context: "", isCorrect: 0, question_id: null});
	};
	$scope.deleteOption = function(index) {
		$scope.options.splice(index, 1);
	};
	$scope.showFreeform = function() {
		return $scope.question.type === 'text';
	};
	$scope.showOptions = function() {
		return $scope.question.type === 'multiple';
	};
	$scope.showImagePicker = function() {
		return $scope.question.type === 'image';
	}
	$scope.imagesSelected = function() {
		return $scope.images.length > 0;
	};
	$scope.uploadFile = function(event){
		$scope.$apply(function(){
			$scope.images = Array.from(event.target.files);
		});
	};
});


angularApp.controller('QuestionSetsCtrl', function($scope, $location) {
	$scope.questionSets = model.getQuestionSets();
	$scope.courses = model.getCourses();
	$scope.questionSetForModal = "";


	$scope.getCourse = function(course_id){
		return model.getCourse(course_id)[0];
	}

	$scope.openAddQuestionSetModal = function() {

		$('#AddquestionSet').modal();
		$('#AddquestionSet').modal('open');
	}
	$scope.goToQuestionBank = function(course_id) {

		$('#AddquestionSet').modal('close');
		$location.path('/questions/' + course_id);
	}

	$scope.deleteQuestionSet = function(qset_id) {
		model.deleteQuestionSet(qset_id);
		$scope.questionSets = model.getQuestionSets();
		if(!model.getQuestionSets()){
			$location.path('/add-question-set')
		}
	}

	$scope.openModalForGeneratePDF = function(qset){
		$('#CreatePdf').modal();
		$('#CreatePdf').modal('open');
		$scope.questionSetForModal = qset;

	}

	$scope.generatePDF = function(includeAnswers){
		let dataForPDF = [];
		let questionSetItems = model.getQuestionSetItems($scope.questionSetForModal.question_set_id);
		for (var qsi in questionSetItems){
			console.log('qsi', qsi)
			let question = model.getQuestion(questionSetItems[qsi].question_id)[0];
			let options = model.getOptionsForQuestion(question.question_id);
			question.options = [];
			for (var option in options) {
				question.options.push(options[option]);
			}

			dataForPDF.push(question);
		}
		console.log(dataForPDF);
		pdf.exportPdf(dataForPDF, $scope.questionSetForModal.question_set_name, includeAnswers);
	}
});

angularApp.controller('QuestionSetsForCourseCtrl', function($scope, $routeParams) {
	$scope.questionSetsForCourse = model.getQuestionSetsForCourse($routeParams.course_id);
	$scope.course = model.getCourse($routeParams.course_id)[0];
	$scope.questionSetForModal = "";


	$scope.deleteQuestionSet = function(qset_id) {
		model.deleteQuestionSet(qset_id);
		$scope.questionSetsForCourse = model.getQuestionSetsForCourse($routeParams.course_id);
	}

/*Modal for generate pdf*/
	$scope.openModalForGeneratePDF = function(qset){
		$('#CreatePdf').modal();
		$('#CreatePdf').modal('open');
		$scope.questionSetForModal = qset;

	}

	$scope.generatePDF = function(includeAnswers){
		let dataForPDF = [];
		let questionSetItems = model.getQuestionSetItems($scope.questionSetForModal.question_set_id);
		for (var qsi in questionSetItems){
			console.log('qsi', qsi)
			let question = model.getQuestion(questionSetItems[qsi].question_id)[0];
			let options = model.getOptionsForQuestion(question.question_id);
			question.options = [];
			for (var option in options) {
				question.options.push(options[option]);
			}

			dataForPDF.push(question);
		}
		console.log(dataForPDF);
		pdf.exportPdf(dataForPDF, $scope.questionSetForModal.question_set_name, includeAnswers);
	}

});

angularApp.controller('ViewQuestionsForQuestionSetCtrl', function($scope, $routeParams) {
	$scope.questions = model.getQuestionsForQuestionSet($routeParams.question_set_id);
	$scope.questionSet = model.getQuestionSet($routeParams.question_set_id)[0];

	$scope.getCourse = function(course_id){
		return model.getCourse(course_id)[0];
	}

	$scope.showModalForImage = function(imagePath) {
		$scope.imageForModal = imagePath;

		$("#modal-for-image").modal();
		$("#modal-for-image").modal('open');
	}

	$scope.getImagePath = function(img) {
		return path.join(app.getPath('userData'), 'images', img);
	}
	/*$scope.course = model.getCourse($routeParams.course_id)[0];*/
	$scope.questionSetName = "";

	$scope.getOptionForQuestion = function(qid){
		return model.getOptionsForQuestion(qid);
	}

});
