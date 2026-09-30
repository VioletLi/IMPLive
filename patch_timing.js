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
  "var $fillFwdMs = 0;",
  "var $fillDpMs = 0;",
  "function $timeFillFwd(fn) {",
  "\tvar t0 = performance.now();",
  "\tvar result = fn();",
  "\t$fillFwdMs += performance.now() - t0;",
  "\treturn result;",
  "}",
  "function $timeFillDp(fn) {",
  "\tvar t0 = performance.now();",
  "\tvar result = fn();",
  "\t$fillDpMs += performance.now() - t0;",
  "\treturn result;",
  "}",
  ""
].join("\n");

function insertAfter(markerFn, snippet) {
  var idx = src.indexOf(markerFn);
  if (idx === -1) {
    return false;
  }
  var end = src.indexOf("\treturn result;\n}\n", idx);
  if (end === -1) {
    return false;
  }
  end += "\treturn result;\n}\n".length;
  src = src.slice(0, end) + snippet + src.slice(end);
  return true;
}

if (src.indexOf("function $timeEval(") === -1) {
  var header = "(function(scope){\n'use strict';\n\n";
  if (src.indexOf(header) !== 0) {
    console.error("patch_timing: unexpected elm.js header");
    process.exit(1);
  }
  src = header + helper + src.slice(header.length);
} else {
  if (src.indexOf("var $fillFwdMs = 0;") === -1) {
    if (!insertAfter("function $timeEval(", "var $fillFwdMs = 0;\nvar $fillDpMs = 0;\n")) {
      console.error("patch_timing: cannot insert $fillFwdMs");
      process.exit(1);
    }
  } else if (src.indexOf("var $fillDpMs = 0;") === -1) {
    src = src.replace("var $fillFwdMs = 0;", "var $fillFwdMs = 0;\nvar $fillDpMs = 0;");
  }
  if (src.indexOf("function $timeFillFwd(") === -1) {
    if (
      !insertAfter(
        "function $timeEval(",
        [
          "function $timeFillFwd(fn) {",
          "\tvar t0 = performance.now();",
          "\tvar result = fn();",
          "\t$fillFwdMs += performance.now() - t0;",
          "\treturn result;",
          "}",
          ""
        ].join("\n")
      )
    ) {
      console.error("patch_timing: cannot insert $timeFillFwd");
      process.exit(1);
    }
  }
  if (src.indexOf("function $timeFillDp(") === -1) {
    if (
      !insertAfter(
        "function $timeFillFwd(",
        [
          "function $timeFillDp(fn) {",
          "\tvar t0 = performance.now();",
          "\tvar result = fn();",
          "\t$fillDpMs += performance.now() - t0;",
          "\treturn result;",
          "}",
          ""
        ].join("\n")
      )
    ) {
      console.error("patch_timing: cannot insert $timeFillDp");
      process.exit(1);
    }
  }
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

var fillWrappedFwdOnly = [
  "\t\t\treturn $timeEval(\"Fill-and-resume\", function () {",
  "\t\t\t\t$fillFwdMs = 0;",
  "\t\t\t\tvar result = A4(",
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
  "\t\t\t\tconsole.log(\"Fill-and-resume forward: \" + $fillFwdMs.toFixed(3) + \" ms\");",
  "\t\t\t\treturn result;",
  "\t\t\t});"
].join("\n");

var fillWrappedOld = [
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

var fillWrapped = [
  "\t\t\treturn $timeEval(\"Fill-and-resume\", function () {",
  "\t\t\t\t$fillFwdMs = 0;",
  "\t\t\t\t$fillDpMs = 0;",
  "\t\t\t\tvar result = A4(",
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
  "\t\t\t\tconsole.log(\"Fill-and-resume DP: \" + $fillDpMs.toFixed(3) + \" ms\");",
  "\t\t\t\tconsole.log(\"Fill-and-resume forward: \" + $fillFwdMs.toFixed(3) + \" ms\");",
  "\t\t\t\treturn result;",
  "\t\t\t});"
].join("\n");

var fillBatchNeedle =
  "\t\t\tvar _v2 = A4($author$project$IMP$Eval$batchExec, funcEnv1, hb, toExec, fwdRes.scount);";
var fillBatchWrapped = [
  "\t\t\tvar _v2 = $timeFillFwd(function () {",
  "\t\t\t\treturn A4($author$project$IMP$Eval$batchExec, funcEnv1, hb, toExec, fwdRes.scount);",
  "\t\t\t});"
].join("\n");

var resumeBatchNeedle =
  "\t\t\t\tvar _v1 = A4($author$project$IMP$Eval$batchExec, funcEnv, hb, known, scount);";
var resumeBatchWrapped = [
  "\t\t\t\tvar _v1 = $timeFillFwd(function () {",
  "\t\t\t\t\treturn A4($author$project$IMP$Eval$batchExec, funcEnv, hb, known, scount);",
  "\t\t\t\t});"
].join("\n");

var fillDpNeedle = [
  "\t\t\tvar _v3 = A3(",
  "\t\t\t\t$author$project$IMP$Eval$substValinVal,",
  "\t\t\t\tfinished,",
  "\t\t\t\tfwdRes.store,",
  "\t\t\t\t_Utils_ap(",
  "\t\t\t\t\tremained,",
  "\t\t\t\t\t$author$project$IMP$Eval$recoverRiStmts(newlyResidual)));"
].join("\n");

var fillDpWrapped = [
  "\t\t\tvar _v3 = $timeFillDp(function () {",
  "\t\t\t\treturn A3(",
  "\t\t\t\t\t$author$project$IMP$Eval$substValinVal,",
  "\t\t\t\t\tfinished,",
  "\t\t\t\t\tfwdRes.store,",
  "\t\t\t\t\t_Utils_ap(",
  "\t\t\t\t\t\tremained,",
  "\t\t\t\t\t\t$author$project$IMP$Eval$recoverRiStmts(newlyResidual)));",
  "\t\t\t});"
].join("\n");

var resumeDpNeedle = [
  "\t\t\t\tvar _v2 = A3(",
  "\t\t\t\t\t$author$project$IMP$Eval$substValinVal,",
  "\t\t\t\t\tfinished,",
  "\t\t\t\t\tstore,",
  "\t\t\t\t\t_Utils_ap(",
  "\t\t\t\t\t\tunknown,",
  "\t\t\t\t\t\t$author$project$IMP$Eval$recoverRiStmts(newlyResidual)));"
].join("\n");

var resumeDpWrapped = [
  "\t\t\t\tvar _v2 = $timeFillDp(function () {",
  "\t\t\t\t\treturn A3(",
  "\t\t\t\t\t\t$author$project$IMP$Eval$substValinVal,",
  "\t\t\t\t\t\tfinished,",
  "\t\t\t\t\t\tstore,",
  "\t\t\t\t\t\t_Utils_ap(",
  "\t\t\t\t\t\t\tunknown,",
  "\t\t\t\t\t\t\t$author$project$IMP$Eval$recoverRiStmts(newlyResidual)));",
  "\t\t\t\t});"
].join("\n");

if (src.indexOf(fillWrapped) === -1 && src.indexOf(fillWrappedFwdOnly) !== -1) {
  src = src.replace(fillWrappedFwdOnly, fillWrapped);
}
if (src.indexOf(fillWrapped) === -1 && src.indexOf(fillWrappedOld) !== -1) {
  src = src.replace(fillWrappedOld, fillWrapped);
}

wrapOnce("forward", fwdNeedle, fwdWrapped);
wrapOnce("backward", bwdNeedle, bwdWrapped);
wrapOnce("fill", fillNeedle, fillWrapped);
wrapOnce("fill batchExec", fillBatchNeedle, fillBatchWrapped);
wrapOnce("resume batchExec", resumeBatchNeedle, resumeBatchWrapped);
wrapOnce("fill substValinVal", fillDpNeedle, fillDpWrapped);
wrapOnce("resume substValinVal", resumeDpNeedle, resumeDpWrapped);

fs.writeFileSync(elmPath, src);
console.log("patched timing into elm.js");
