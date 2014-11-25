// starts when document is ready
$(document).ready(function() {
	
	// object that holds all vars and functions
	var funcs = {

		// has the position in the array
		arrayPos: 0,

		// holds answered questions
		answers: [],

		// holds all quiz question data
		Data: [],

		radio: [],

		// starts getting json data and displays the question
		Start: function() {

			var local_pos = parseInt(localStorage.getItem('arrayPos'));
			var local_data = JSON.parse(localStorage.getItem('data'));
			var local_answers = JSON.parse(localStorage.getItem('answers'));

			if(local_pos && local_data && local_answers){

				this.arrayPos = local_pos;
				this.Data   = local_data;
				this.answers    = local_answers;

				q = this.ShuffleArray(funcs.Data);

				$('.start').hide();
				$('.info').fadeIn('slow');
				$('.content').fadeIn('slow');
				$('.next').fadeIn('slow');

				this.DisplayCurrent();
				return false;
			}

			// ajax request for data from json file
			$.ajax({
		        url: 'data/questions.json',
		        type: "POST",
		        async: false,
		        dataType: 'json',
		        success: function (data) {
		            funcs.Data = data;
		        }
		    });

			// shuffles the question data
			q = this.ShuffleArray(funcs.Data);
			// shows and hides the buttons and info
			$('.start').hide();
			$('.info').fadeIn('slow');
			$('.content').fadeIn('slow');
			$('.next').fadeIn('slow');

			localStorage.setItem('data', JSON.stringify(funcs.Data));
			
			// displays current question
			funcs.DisplayCurrent();

		},

		// displays current question
		DisplayCurrent: function() {

			// checks if its the first question and hides the back button if it is 
			if (funcs.arrayPos >= 1) {
				$('.back').show();
			}
			else {
				$('.back').hide();
			};

			// removes old html if there is any and displays html questions and info
			$('.radio').remove();
			var qwestin = q[funcs.arrayPos];
			$('.info').html("Question " + (funcs.arrayPos+1) + "/" + q.length);
			$('.question').html(qwestin.question);
			var asd = this.ShuffleArray(qwestin.options);
			
			// creates radio buttons and labels for the questions
			for (var i = asd.length - 1; i >= 0; i--) {
				$('<div class="radio"><label class="answerlabel"><input type="radio" data-number="' + (funcs.arrayPos+1) + '" data-answer="' + asd[i].answer + '" data-correct="' + asd[i].correct + '" name="radiobuttons" value="' + i + '" id="answer' + i + '" class="answer"/>' + asd[i].answer + '</label></div>').appendTo('.options');
			};

			// loops through all inputs
			$('input[name=radiobuttons]').each(function() {

				for (var h = 0; h <= funcs.answers.length; h++) {
					// checks if radio localstorage is not null
					if (localStorage.getItem('radio' + (funcs.arrayPos+1)) !== null && funcs.answers[funcs.arrayPos] !== undefined) {

						var raddo = JSON.parse(localStorage.getItem('radio' + (funcs.arrayPos+1)));
			
				 		// checks if answer and current input is the same
					 	if (raddo.number === $(this).data('number') && raddo.answer === $(this).data('answer') && raddo.correct === $(this).data('correct')) {
					 		// checks radiobutton
					 		$(this).attr('checked', 'checked');
					 	}

				 	}
				 };
			});

		},

		// displays end of quiz if it is done
		DisplayEnd: function() {
			
			// removes keydown event listener
			$(document).off("keydown");

			var answered = funcs.answers;

			var correctTotal = 0;
			
			// checks if answer was correct
			answered.filter(function(obj){
				if (obj.correct === true){
					return correctTotal++;
				}
			});

			// shows correct questions and that the quiz is done
			$('.info').html("Finished!");
			$('.content').html("You got " + correctTotal + "/" + q.length + "  right");
			$('.next').hide();
			$('.back').hide();
		},

		// activates when answer is clicked
		click: function(){
			
			// gets data and pushes it to the answers array
			var dataset = $(this).data();
			var question = dataset.option;
			funcs.answers.push(dataset);

			// forEach to remove old answer from array
			funcs.answers.forEach(function(entry){
				console.log(entry.number);
				if (entry.number === (funcs.arrayPos+1)) {
					var index = funcs.answers.indexOf(entry);
					if (index > -1) {
						funcs.answers.splice(index,1);
						funcs.answers[index] = dataset;
					};
				};
			
			});
			
			//  gets data for selected input
			var basd = $('input[name=radiobuttons]:checked').data();

			// sets localstorage
			localStorage.setItem('radio' + basd.number, JSON.stringify(basd));
			localStorage.setItem('arrayPos', funcs.arrayPos);
			localStorage.setItem('answers', JSON.stringify(funcs.answers));
		},
		
		// goes back to the last question if it is not the first question
		Back: function() {
			
			if (funcs.arrayPos >= 1) {
				this.arrayPos--;
				this.DisplayCurrent();
			};

		},

		// goes to the next question if it is not the last question
		Next: function() {
			
			if (q.length >= (this.arrayPos+2)) {
				this.arrayPos++;
				this.DisplayCurrent();
			}
			else {
				this.DisplayEnd();
			}

		},

		// shuffles the array
		ShuffleArray: function(array) {
			
			for (var i = array.length - 1; i > 0; i--) {
		        var j = Math.floor(Math.random() * (i + 1));
		        var temp = array[i];
		        array[i] = array[j];
		        array[j] = temp;
		    }
		    return array;
		}
	}

	// click event to start the quiz
	$('.start').click(function(event) {
		funcs.Start();
	});

	// click event to go to the next question
	$('.next').click(function(event) {
		funcs.Next();
	});
	
	// click event to go back to the last question
	$('.back').click(function(event) {
		funcs.Back();
	});

	// click event to store answered question in the array
	$('body').on('click', '.answer', funcs.click);

	// keydown event to listen if arrow keys are clicked
	$(document).keydown(function(e){
	    if (e.keyCode == 37) { 
	       funcs.Back();
	       return false;
	    }
	    if (e.keyCode == 39) {
	    	funcs.Next();
	    	return false;
	    };
	    return false;
	});

});