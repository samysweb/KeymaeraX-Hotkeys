# Bookmark
To use the hotkeys, add the following snippet as a bookmark in your browser:
```
javascript:(function(){function e(e,n){ante=n.match(/(-{0,1}\d+)(.*)+/),console.log(ante),null!=ante?function(e,n,o){if(o in document.hotkeystate.formula_actions)try{angular.element(n).scope().$apply(document.hotkeystate.formula_actions[o].bind(null,e,n))}catch(e){console.log(o+" might have failed on formula "+n.id)}else console.log("Unknown formula action"+o)}(e,document.getElementById(ante[1]),ante[2]):n in document.hotkeystate.global_actions?angular.element(document.getElementsByClassName("navbar")[1]).scope().$apply(document.hotkeystate.global_actions[n].bind(null,e)):console.log("Unknown formula action"+n)}function n(e,n){window.setTimeout((function(){document.getElementById(e).click()}),200),window.setTimeout((function(){document.getElementsByName(n)[0].focus()}),300)}document.hotkeystate={cur_sequence:"",formula_actions:{h:function(e,n,o){o.f.use=!o.f.use},r:function(e,n,o){o.f.id<0?o.onTactic(o.f.id,"hideL"):o.onTactic(o.f.id,"hideR")},s:function(e,n,o){o.onTactic(o.f.id,"simplify")},c:function(e,n,o){o.onTactic(o.f.id,"chase")},x:function(e,n,o){n.getElementsByTagName("ul")[0].getElementsByTagName("a")[2].click()},a:function(e,n,o){o.onTactic(o.f.id,"andL")},"":function(e,n,o){(o=angular.element(n.getElementsByTagName("span")[5]).scope()).exprClick(e,o.expr.id,o.expr.step,o.expr.editable)}},global_actions:{h:function(e,n){n.toggleUseAllFmls()},z:function(e,n){n.undoLastProofStep()},a:function(e,n){n.doTactic(void 0,"auto")},q:function(e,n){n.doTactic(void 0,"QE")},u:function(e,n){n.doTactic(void 0,"unfold")},s:function(e,n){n.doTactic(void 0,"fullSimplify")},c:function(e,o){o.openTacticPosInputDialog("cut",void 0),n("C","C")},l:function(e,o){o.openTacticPosInputDialog("loop","R"),n("J","J")}}},document.onkeydown=function(e){"INPUT"!=document.activeElement.tagName&&e.altKey&&(18!=e.keyCode&&16!=e.keyCode&&(curkey=String.fromCharCode(e.keyCode),num=curkey.match(/\d/),null!=num&&0==document.hotkeystate.cur_sequence.length&&e.shiftKey&&(console.log("Adding -"),document.hotkeystate.cur_sequence="-"),console.log("Adding "+curkey+" to sequence"),document.hotkeystate.cur_sequence+=curkey.toLowerCase()),e.preventDefault())},document.onkeyup=function(n){18==n.keyCode&&(actionCode=document.hotkeystate.cur_sequence,console.log("Executing sequence "+actionCode),document.hotkeystate.cur_sequence="",e(n,actionCode))}})()
```

## Alt Key Variant:

Global actions: \<alt\>+\<key\>
Succedent Actions \<alt\>+\<number\>(+\<key\>)
Antecedent Actions \<alt\>+\<shift\>+\<number\>(+\<key\>)

Actions are executed on the release of the alt key, so I can do something like:
- press down \<alt\>
- press down \<shift\>
- click \<1\>
- release \<shift\>
- click \<2\>
- click \<s\>
- release \<alt\>
=> Applies simplify to formula -12