(function(){
document.hotkeystate={
	cur_sequence:"",
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
		"" : function(e,f, scope){
			scope = angular.element(f.getElementsByTagName("span")[5]).scope();
			scope.exprClick(e, scope.expr.id, scope.expr.step, scope.expr.editable);
		}
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
		} else {
			console.log("Unknown formula action"+sequence);
		}
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
	if (document.activeElement.tagName != "INPUT") {
		if (e.altKey) {
			if(e.keyCode!=18 /*alt*/ && e.keyCode!=16 /*shift*/){
				curkey = String.fromCharCode(e.keyCode);
				num = curkey.match(/\d/);
				if (num != null && document.hotkeystate.cur_sequence.length==0 && e.shiftKey) {
					console.log("Adding -")
					document.hotkeystate.cur_sequence = "-";
				}
				console.log("Adding "+curkey+" to sequence");
				document.hotkeystate.cur_sequence += curkey.toLowerCase();
			}
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