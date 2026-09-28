#!/usr/bin/env node
"use strict";

var fs = require("fs");
var path = require("path");

var elmPath = path.join(__dirname, "elm.js");
var src = fs.readFileSync(elmPath, "utf8");

var helper = [
  "function $timeEval(label, fn) {",
  "\tvar t0 = performance.now();",
  "\tvar result = fn();",
  "\tconsole.log(label + \": \" + (performance.now() - t0).toFixed(3) + \" ms\");",
  "\treturn result;",
  "}",
  ""
].join("\n");

if (src.indexOf("function $timeEval(") === -1) {
  var header = "(function(scope){\n'use strict';\n\n";
  if (src.indexOf(header) !== 0) {
    console.error("patch_timing: unexpected elm.js header");
    process.exit(1);
  }
  src = header + helper + src.slice(header.length);
}

function wrapOnce(label, needle, wrapped) {
  if (src.indexOf(wrapped) !== -1) {
    return;
  }
  if (src.indexOf(needle) === -1) {
    console.error("patch_timing: missing " + label + " call site");
    process.exit(1);
  }
  src = src.replace(needle, wrapped);
}

var fwdNeedle =
  "\t\t\tvar res = A7($author$project$IMP$Eval$exec, funcEnv, model.startStore, model.holeBindings, _List_Nil, stmt_, $elm$core$Set$empty, 0);";
var fwdWrapped =
  "\t\t\tvar res = $timeEval(\"Forward evaluation\", function () {\n" +
  "\t\t\t\treturn A7($author$project$IMP$Eval$exec, funcEnv, model.startStore, model.holeBindings, _List_Nil, stmt_, $elm$core$Set$empty, 0);\n" +
  "\t\t\t});";

var bwdNeedle = [
  "\t\t\t\t\tvar res = A9(",
  "\t\t\t\t\t\t$author$project$IMP$Uneval$unexec,",
  "\t\t\t\t\t\tfuncEnv,",
  "\t\t\t\t\t\tmodel1.startStore,",
  "\t\t\t\t\t\tmodel1.holeBindings,",
  "\t\t\t\t\t\t_List_Nil,",
  "\t\t\t\t\t\t$elm$core$Set$empty,",
  "\t\t\t\t\t\tstmt_,",
  "\t\t\t\t\t\thcount,",
  "\t\t\t\t\t\t0,",
  "\t\t\t\t\t\t_Utils_Tuple2(newstore, model1.riStmts));"
].join("\n");

var bwdWrapped = [
  "\t\t\t\t\tvar res = $timeEval(\"Backward evaluation\", function () {",
  "\t\t\t\t\t\treturn A9(",
  "\t\t\t\t\t\t\t$author$project$IMP$Uneval$unexec,",
  "\t\t\t\t\t\t\tfuncEnv,",
  "\t\t\t\t\t\t\tmodel1.startStore,",
  "\t\t\t\t\t\t\tmodel1.holeBindings,",
  "\t\t\t\t\t\t\t_List_Nil,",
  "\t\t\t\t\t\t\t$elm$core$Set$empty,",
  "\t\t\t\t\t\t\tstmt_,",
  "\t\t\t\t\t\t\thcount,",
  "\t\t\t\t\t\t\t0,",
  "\t\t\t\t\t\t\t_Utils_Tuple2(newstore, model1.riStmts));",
  "\t\t\t\t\t});"
].join("\n");

var fillNeedle = [
  "\t\t\treturn A4(",
  "\t\t\t\t$author$project$IMP$Eval$fill,",
  "\t\t\t\tfuncEnv,",
  "\t\t\t\tholeDict,",
  "\t\t\t\tmodel.holeBindings,",
  "\t\t\t\t{",
  "\t\t\t\t\treadOnly: $elm$core$Set$empty,",
  "\t\t\t\t\triStmts: model.riStmts,",
  "\t\t\t\t\tscount: A2($author$project$IMP$Eval$nextScount, 0, model.riStmts),",
  "\t\t\t\t\tstore: model.store",
  "\t\t\t\t});"
].join("\n");

var fillWrapped = [
  "\t\t\treturn $timeEval(\"Fill-and-resume\", function () {",
  "\t\t\t\treturn A4(",
  "\t\t\t\t\t$author$project$IMP$Eval$fill,",
  "\t\t\t\t\tfuncEnv,",
  "\t\t\t\t\tholeDict,",
  "\t\t\t\t\tmodel.holeBindings,",
  "\t\t\t\t\t{",
  "\t\t\t\t\t\treadOnly: $elm$core$Set$empty,",
  "\t\t\t\t\t\triStmts: model.riStmts,",
  "\t\t\t\t\t\tscount: A2($author$project$IMP$Eval$nextScount, 0, model.riStmts),",
  "\t\t\t\t\t\tstore: model.store",
  "\t\t\t\t\t});",
  "\t\t\t});"
].join("\n");

wrapOnce("forward", fwdNeedle, fwdWrapped);
wrapOnce("backward", bwdNeedle, bwdWrapped);
wrapOnce("fill", fillNeedle, fillWrapped);

fs.writeFileSync(elmPath, src);
console.log("patched timing into elm.js");
