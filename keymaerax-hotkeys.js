(function(){
document.hotkeystate={
	cur_sequence:"",
	cursor:undefined,
	/*
	 * Formula actions are specific to the formula scope.f (id can be found in scope.f.id)
	 * We can use scope.onTactic to apply a tactic to the formula.
	 * We have access to the div HTML element in f
	 * We have access to the click event in e
	 */
	formula_actions : {
		"h" : function(e,f,scope){scope.f.use=!scope.f.use}, /*hide*/
		"r" : function(e,f,scope){if(scope.f.id<0){scope.onTactic(scope.f.id,'hideL');}else{scope.onTactic(scope.f.id,'hideR');}}, /*remove*/
		"s" : function(e,f,scope){scope.onTactic(scope.f.id,'simplify')}, /*simplify*/
		"c" : function(e,f,scope){scope.onTactic(scope.f.id,'chase')}, /*simplify*/
		"x" : function(e,f,scope){f.getElementsByTagName("ul")[0].getElementsByTagName("a")[2].click()}, /*copy*/
		"a" : function(e,f,scope){scope.onTactic(scope.f.id,'andL')}, /*simplify*/
		/*"e" : function(e,f,scope){scope.setFormulaMode('edit');}, edit*/
	},
	/*
	 * Global actions are performed on the entire sequent
	 * We have access to the click event in e
	 * We have access to the scope of the proof navbar
	 * In particular scope contains: scope.undoLastProofStep, scope.toggleUseAllFmls, scope.doTactic([formula id], [tactic name]), scope.openTacticPosInputDialog
	 */
	global_actions : {
		"h" : function(e,scope){scope.toggleUseAllFmls();}, /* toggle hide for all */
		"z" : function(e,scope){scope.undoLastProofStep();}, /* undo */
		"a" : function(e,scope){scope.doTactic(undefined,'auto')}, /* auto */
		"q" : function(e,scope){scope.doTactic(undefined, 'QE')}, /* QE */
		"u" : function(e,scope){scope.doTactic(undefined, 'unfold')}, /* unfold */
		"s" : function(e,scope){scope.doTactic(undefined, 'fullSimplify')}, /* simplify */
		"c" : function(e,scope){
			scope.openTacticPosInputDialog("cut", undefined);
			setFocus("C", "C");
		}, /* cut */
		"l" : function(e,scope){
			scope.openTacticPosInputDialog("loop", 'R');
			setFocus("J", "J");
		}, /* loop */
	}
};
function formula_action(e,formula, action) {
	if (action in document.hotkeystate.formula_actions) {
		try{
			angular.element(formula).scope().$apply(
				document.hotkeystate.formula_actions[action].bind(null, e, formula)
			);
			f_id = ((document.hotkeystate.cursor.isAnte)?-1:1)*(document.hotkeystate.cursor.index+1);
			f_el = document.getElementById(f_id).getElementsByClassName("k4-has-step")[document.hotkeystate.cursor.subindex];
			angular.element(f_el).removeClass("k4-prove-hover");
			document.hotkeystate.cursor = undefined;
			$(document).scrollTop(0);
		} catch(e) {
			console.log(action+" might have failed on formula "+formula.id);
		}
	} else {
		console.log("Unknown formula action"+action);
	}
}

function perform_action(e,sequence){
	ante = sequence.match(/(-{0,1}\d+)(.*)+/);
	console.log(ante)
	if (ante != null) {
		formula_action(e,document.getElementById(ante[1]),ante[2]);
	} else {
		if (sequence in document.hotkeystate.global_actions) {
			angular.element(document.getElementsByClassName("navbar")[1]).scope().$apply(
				document.hotkeystate.global_actions[sequence].bind(null,e)
			);
			$(document).scrollTop(0);
		} else {
			console.log("Unknown formula action"+sequence);
		}
	}
}

function update_cursor(e, sequent) {
	// If cursor is not yet define -> initialize it
	if (document.hotkeystate.cursor == undefined) {
		if (sequent.ante.length > 0) {
			document.hotkeystate.cursor = {isAnte:true, index:0, subindex:0};
		} else if (sequent.succ.length > 0) {
			document.hotkeystate.cursor = {isAnte:false, index:0, subindex:0};
		} else {
			return false;
		}
	} else {
		// Switch side
		if (e.key == "ArrowLeft" || e.key == "ArrowRight") {
			document.hotkeystate.cursor.isAnte = !document.hotkeystate.cursor.isAnte;
			// Compute maximum formua number on side
			if (document.hotkeystate.cursor.isAnte) {
				max_f = sequent.ante.length;
			} else {
				max_f = sequent.succ.length;
			}
			if (document.hotkeystate.cursor.index >= max_f) {
				document.hotkeystate.cursor.index = max_f-1;
			}
			document.hotkeystate.cursor.subindex = 0;
			console.log("Cursor switched to "+document.hotkeystate.cursor.index);
		} else if (e.key == "ArrowUp" || e.key == "ArrowDown") {
			if (e.altKey) {
				// Switch between subformulas
				f_id = ((document.hotkeystate.cursor.isAnte)?-1:1)*(document.hotkeystate.cursor.index+1);
				max_f = document.getElementById(f_id).getElementsByClassName("k4-has-step").length
				if (e.key == "ArrowDown") {
					document.hotkeystate.cursor.subindex = (document.hotkeystate.cursor.subindex+1)%max_f;
				} else {
					document.hotkeystate.cursor.subindex = (document.hotkeystate.cursor.subindex-1+max_f)%max_f;
				}
			} else {
				// Compute maximum formua number on side
				if (document.hotkeystate.cursor.isAnte) {
					max_f = sequent.ante.length;
				} else {
					max_f = sequent.succ.length;
				}
				if (e.key == "ArrowUp") {
					document.hotkeystate.cursor.index = (document.hotkeystate.cursor.index-1+max_f)%max_f;
				} else {
					document.hotkeystate.cursor.index = (document.hotkeystate.cursor.index+1)%max_f;
				}
				document.hotkeystate.cursor.subindex = 0;
			}
		}
	}
	return true;
}

function navigate_cursor(e, sequent_scope) {
	// Obtain current sequent
	has_old = document.hotkeystate.cursor !== undefined
	if (has_old) {
		old_isAnte = document.hotkeystate.cursor.isAnte;
		old_index = document.hotkeystate.cursor.index;
		old_subindex = document.hotkeystate.cursor.subindex;
	}
	if (sequent_scope.sequent !== undefined) {
		sequent = sequent_scope.sequent;
	} else {
		sequent = sequent_scope.proofTree.nodesMap[sequent_scope.deductionPath.sections[0].path[0]].getSequent();
	}
	// Update cursor or return if not possible
	if (!update_cursor(e, sequent)) {
		return;
	}
	// Remove UI for old ID
	if (has_old) {
		old_id = ((old_isAnte)?-1:1)*(old_index+1);
		old_has_steps = document.getElementById(old_id).getElementsByClassName("k4-has-step")
		angular.element(old_has_steps[old_subindex]).removeClass("k4-prove-hover");
	}
	// Set UI for new ID
	new_id = ((document.hotkeystate.cursor.isAnte)?-1:1)*(document.hotkeystate.cursor.index+1);
	new_el = document.getElementById(new_id).getElementsByClassName("k4-has-step")[document.hotkeystate.cursor.subindex];
	angular.element(new_el).addClass("k4-prove-hover");
	$(document).scrollTop($(new_el).offset().top-80);
}
function cursor_click(e) {
	if (document.hotkeystate.cursor !== undefined) {
		f_id = ((document.hotkeystate.cursor.isAnte)?-1:1)*(document.hotkeystate.cursor.index+1);
		new_el = document.getElementById(f_id).getElementsByClassName("k4-has-step")[document.hotkeystate.cursor.subindex];
		new_el.click(e);
		$(document).scrollTop(0);
	}
}
/**
 * Set focus on recently opened pop-up input
 * @param {*} buttonId ID of button in pop-up to click
 * @param {*} inputName Name of input to set focus on
 */
function setFocus(buttonId, inputName) {
	window.setTimeout(function(){
		document.getElementById(buttonId).click();
	},200);
	window.setTimeout(function(){
		document.getElementsByName(inputName)[0].focus();
	},300);
}
document.onkeydown=function(e){
	console.log("Caught key")
	if (document.activeElement.tagName != "INPUT") {
		if (e.keyCode>=37 && e.keyCode<=40) { // Arrows
			console.log("Caught arrow key");
			angular.element(document.getElementsByTagName("k4-sequent")[0]).scope().$apply(
				navigate_cursor.bind(null,e)
			);
			e.preventDefault();
		} else if (e.keyCode == 32) { // Space
			console.log("Caught space key");
			//angular.element(document.getElementsByTagName("k4-sequent")[0]).scope().$apply(
			cursor_click(e)
			//);
			e.preventDefault();
		} else if (e.altKey) {
			if(e.keyCode!=18 /*alt*/ && e.keyCode!=16 /*shift*/){
				// Check if arrow keys
				cur_key = String.fromCharCode(e.keyCode);
				console.log("Adding "+cur_key+" to sequence");
				document.hotkeystate.cur_sequence += cur_key.toLowerCase();
			}
			e.preventDefault();
		} else if (e.keyCode == 9) {
			li = $("li.active");
			ul =  li.parent();
			next_index = (li.index()+1) % ul.children().length;
			console.log("Next index: "+next_index);
			ul.children()[next_index].getElementsByTagName("a")[0].click();
			console.log(ul.children()[0].getElementsByTagName("a")[next_index]);
			e.preventDefault();
		} else {
			f_id = ((document.hotkeystate.cursor.isAnte)?-1:1)*(document.hotkeystate.cursor.index+1);
			cur_key = String.fromCharCode(e.keyCode);
			perform_action(e,f_id+cur_key.toLowerCase());
			e.preventDefault();
		}
	}
}
document.onkeyup = function(e) {
	if (e.keyCode==18 /*alt*/) {
		actionCode = document.hotkeystate.cur_sequence
		console.log("Executing sequence "+actionCode);
		document.hotkeystate.cur_sequence="";
		perform_action(e,actionCode);
		
	}
}
})()