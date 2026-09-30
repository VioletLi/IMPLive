(function(scope){
'use strict';

function $timeEval(label, fn) {
	var t0 = performance.now();
	var result = fn();
	console.log(label + ": " + (performance.now() - t0).toFixed(3) + " ms");
	return result;
}
var $fillFwdMs = 0;
var $fillDpMs = 0;
function $timeFillFwd(fn) {
	var t0 = performance.now();
	var result = fn();
	$fillFwdMs += performance.now() - t0;
	return result;
}
function $timeFillDp(fn) {
	var t0 = performance.now();
	var result = fn();
	$fillDpMs += performance.now() - t0;
	return result;
}
function F(arity, fun, wrapper) {
  wrapper.a = arity;
  wrapper.f = fun;
  return wrapper;
}

function F2(fun) {
  return F(2, fun, function(a) { return function(b) { return fun(a,b); }; })
}
function F3(fun) {
  return F(3, fun, function(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  });
}
function F4(fun) {
  return F(4, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  });
}
function F5(fun) {
  return F(5, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  });
}
function F6(fun) {
  return F(6, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  });
}
function F7(fun) {
  return F(7, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  });
}
function F8(fun) {
  return F(8, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  });
}
function F9(fun) {
  return F(9, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  });
}

function A2(fun, a, b) {
  return fun.a === 2 ? fun.f(a, b) : fun(a)(b);
}
function A3(fun, a, b, c) {
  return fun.a === 3 ? fun.f(a, b, c) : fun(a)(b)(c);
}
function A4(fun, a, b, c, d) {
  return fun.a === 4 ? fun.f(a, b, c, d) : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e) {
  return fun.a === 5 ? fun.f(a, b, c, d, e) : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f) {
  return fun.a === 6 ? fun.f(a, b, c, d, e, f) : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g) {
  return fun.a === 7 ? fun.f(a, b, c, d, e, f, g) : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h) {
  return fun.a === 8 ? fun.f(a, b, c, d, e, f, g, h) : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i) {
  return fun.a === 9 ? fun.f(a, b, c, d, e, f, g, h, i) : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}

console.warn('Compiled in DEV mode. Follow the advice at https://elm-lang.org/0.19.1/optimize for better performance and smaller assets.');


// EQUALITY

function _Utils_eq(x, y)
{
	for (
		var pair, stack = [], isEqual = _Utils_eqHelp(x, y, 0, stack);
		isEqual && (pair = stack.pop());
		isEqual = _Utils_eqHelp(pair.a, pair.b, 0, stack)
		)
	{}

	return isEqual;
}

function _Utils_eqHelp(x, y, depth, stack)
{
	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object' || x === null || y === null)
	{
		typeof x === 'function' && _Debug_crash(5);
		return false;
	}

	if (depth > 100)
	{
		stack.push(_Utils_Tuple2(x,y));
		return true;
	}

	/**/
	if (x.$ === 'Set_elm_builtin')
	{
		x = $elm$core$Set$toList(x);
		y = $elm$core$Set$toList(y);
	}
	if (x.$ === 'RBNode_elm_builtin' || x.$ === 'RBEmpty_elm_builtin')
	{
		x = $elm$core$Dict$toList(x);
		y = $elm$core$Dict$toList(y);
	}
	//*/

	/**_UNUSED/
	if (x.$ < 0)
	{
		x = $elm$core$Dict$toList(x);
		y = $elm$core$Dict$toList(y);
	}
	//*/

	for (var key in x)
	{
		if (!_Utils_eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

var _Utils_equal = F2(_Utils_eq);
var _Utils_notEqual = F2(function(a, b) { return !_Utils_eq(a,b); });



// COMPARISONS

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

function _Utils_cmp(x, y, ord)
{
	if (typeof x !== 'object')
	{
		return x === y ? /*EQ*/ 0 : x < y ? /*LT*/ -1 : /*GT*/ 1;
	}

	/**/
	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? 0 : a < b ? -1 : 1;
	}
	//*/

	/**_UNUSED/
	if (typeof x.$ === 'undefined')
	//*/
	/**/
	if (x.$[0] === '#')
	//*/
	{
		return (ord = _Utils_cmp(x.a, y.a))
			? ord
			: (ord = _Utils_cmp(x.b, y.b))
				? ord
				: _Utils_cmp(x.c, y.c);
	}

	// traverse conses until end of a list or a mismatch
	for (; x.b && y.b && !(ord = _Utils_cmp(x.a, y.a)); x = x.b, y = y.b) {} // WHILE_CONSES
	return ord || (x.b ? /*GT*/ 1 : y.b ? /*LT*/ -1 : /*EQ*/ 0);
}

var _Utils_lt = F2(function(a, b) { return _Utils_cmp(a, b) < 0; });
var _Utils_le = F2(function(a, b) { return _Utils_cmp(a, b) < 1; });
var _Utils_gt = F2(function(a, b) { return _Utils_cmp(a, b) > 0; });
var _Utils_ge = F2(function(a, b) { return _Utils_cmp(a, b) >= 0; });

var _Utils_compare = F2(function(x, y)
{
	var n = _Utils_cmp(x, y);
	return n < 0 ? $elm$core$Basics$LT : n ? $elm$core$Basics$GT : $elm$core$Basics$EQ;
});


// COMMON VALUES

var _Utils_Tuple0_UNUSED = 0;
var _Utils_Tuple0 = { $: '#0' };

function _Utils_Tuple2_UNUSED(a, b) { return { a: a, b: b }; }
function _Utils_Tuple2(a, b) { return { $: '#2', a: a, b: b }; }

function _Utils_Tuple3_UNUSED(a, b, c) { return { a: a, b: b, c: c }; }
function _Utils_Tuple3(a, b, c) { return { $: '#3', a: a, b: b, c: c }; }

function _Utils_chr_UNUSED(c) { return c; }
function _Utils_chr(c) { return new String(c); }


// RECORDS

function _Utils_update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


// APPEND

var _Utils_append = F2(_Utils_ap);

function _Utils_ap(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (!xs.b)
	{
		return ys;
	}
	var root = _List_Cons(xs.a, ys);
	xs = xs.b
	for (var curr = root; xs.b; xs = xs.b) // WHILE_CONS
	{
		curr = curr.b = _List_Cons(xs.a, ys);
	}
	return root;
}



var _List_Nil_UNUSED = { $: 0 };
var _List_Nil = { $: '[]' };

function _List_Cons_UNUSED(hd, tl) { return { $: 1, a: hd, b: tl }; }
function _List_Cons(hd, tl) { return { $: '::', a: hd, b: tl }; }


var _List_cons = F2(_List_Cons);

function _List_fromArray(arr)
{
	var out = _List_Nil;
	for (var i = arr.length; i--; )
	{
		out = _List_Cons(arr[i], out);
	}
	return out;
}

function _List_toArray(xs)
{
	for (var out = []; xs.b; xs = xs.b) // WHILE_CONS
	{
		out.push(xs.a);
	}
	return out;
}

var _List_map2 = F3(function(f, xs, ys)
{
	for (var arr = []; xs.b && ys.b; xs = xs.b, ys = ys.b) // WHILE_CONSES
	{
		arr.push(A2(f, xs.a, ys.a));
	}
	return _List_fromArray(arr);
});

var _List_map3 = F4(function(f, xs, ys, zs)
{
	for (var arr = []; xs.b && ys.b && zs.b; xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A3(f, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map4 = F5(function(f, ws, xs, ys, zs)
{
	for (var arr = []; ws.b && xs.b && ys.b && zs.b; ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A4(f, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map5 = F6(function(f, vs, ws, xs, ys, zs)
{
	for (var arr = []; vs.b && ws.b && xs.b && ys.b && zs.b; vs = vs.b, ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A5(f, vs.a, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_sortBy = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		return _Utils_cmp(f(a), f(b));
	}));
});

var _List_sortWith = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		var ord = A2(f, a, b);
		return ord === $elm$core$Basics$EQ ? 0 : ord === $elm$core$Basics$LT ? -1 : 1;
	}));
});



var _JsArray_empty = [];

function _JsArray_singleton(value)
{
    return [value];
}

function _JsArray_length(array)
{
    return array.length;
}

var _JsArray_initialize = F3(function(size, offset, func)
{
    var result = new Array(size);

    for (var i = 0; i < size; i++)
    {
        result[i] = func(offset + i);
    }

    return result;
});

var _JsArray_initializeFromList = F2(function (max, ls)
{
    var result = new Array(max);

    for (var i = 0; i < max && ls.b; i++)
    {
        result[i] = ls.a;
        ls = ls.b;
    }

    result.length = i;
    return _Utils_Tuple2(result, ls);
});

var _JsArray_unsafeGet = F2(function(index, array)
{
    return array[index];
});

var _JsArray_unsafeSet = F3(function(index, value, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[index] = value;
    return result;
});

var _JsArray_push = F2(function(value, array)
{
    var length = array.length;
    var result = new Array(length + 1);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[length] = value;
    return result;
});

var _JsArray_foldl = F3(function(func, acc, array)
{
    var length = array.length;

    for (var i = 0; i < length; i++)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_foldr = F3(function(func, acc, array)
{
    for (var i = array.length - 1; i >= 0; i--)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_map = F2(function(func, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = func(array[i]);
    }

    return result;
});

var _JsArray_indexedMap = F3(function(func, offset, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = A2(func, offset + i, array[i]);
    }

    return result;
});

var _JsArray_slice = F3(function(from, to, array)
{
    return array.slice(from, to);
});

var _JsArray_appendN = F3(function(n, dest, source)
{
    var destLen = dest.length;
    var itemsToCopy = n - destLen;

    if (itemsToCopy > source.length)
    {
        itemsToCopy = source.length;
    }

    var size = destLen + itemsToCopy;
    var result = new Array(size);

    for (var i = 0; i < destLen; i++)
    {
        result[i] = dest[i];
    }

    for (var i = 0; i < itemsToCopy; i++)
    {
        result[i + destLen] = source[i];
    }

    return result;
});



// LOG

var _Debug_log_UNUSED = F2(function(tag, value)
{
	return value;
});

var _Debug_log = F2(function(tag, value)
{
	console.log(tag + ': ' + _Debug_toString(value));
	return value;
});


// TODOS

function _Debug_todo(moduleName, region)
{
	return function(message) {
		_Debug_crash(8, moduleName, region, message);
	};
}

function _Debug_todoCase(moduleName, region, value)
{
	return function(message) {
		_Debug_crash(9, moduleName, region, value, message);
	};
}


// TO STRING

function _Debug_toString_UNUSED(value)
{
	return '<internals>';
}

function _Debug_toString(value)
{
	return _Debug_toAnsiString(false, value);
}

function _Debug_toAnsiString(ansi, value)
{
	if (typeof value === 'function')
	{
		return _Debug_internalColor(ansi, '<function>');
	}

	if (typeof value === 'boolean')
	{
		return _Debug_ctorColor(ansi, value ? 'True' : 'False');
	}

	if (typeof value === 'number')
	{
		return _Debug_numberColor(ansi, value + '');
	}

	if (value instanceof String)
	{
		return _Debug_charColor(ansi, "'" + _Debug_addSlashes(value, true) + "'");
	}

	if (typeof value === 'string')
	{
		return _Debug_stringColor(ansi, '"' + _Debug_addSlashes(value, false) + '"');
	}

	if (typeof value === 'object' && '$' in value)
	{
		var tag = value.$;

		if (typeof tag === 'number')
		{
			return _Debug_internalColor(ansi, '<internals>');
		}

		if (tag[0] === '#')
		{
			var output = [];
			for (var k in value)
			{
				if (k === '$') continue;
				output.push(_Debug_toAnsiString(ansi, value[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (tag === 'Set_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Set')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Set$toList(value));
		}

		if (tag === 'RBNode_elm_builtin' || tag === 'RBEmpty_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Dict')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Dict$toList(value));
		}

		if (tag === 'Array_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Array')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Array$toList(value));
		}

		if (tag === '::' || tag === '[]')
		{
			var output = '[';

			value.b && (output += _Debug_toAnsiString(ansi, value.a), value = value.b)

			for (; value.b; value = value.b) // WHILE_CONS
			{
				output += ',' + _Debug_toAnsiString(ansi, value.a);
			}
			return output + ']';
		}

		var output = '';
		for (var i in value)
		{
			if (i === '$') continue;
			var str = _Debug_toAnsiString(ansi, value[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '[' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return _Debug_ctorColor(ansi, tag) + output;
	}

	if (typeof DataView === 'function' && value instanceof DataView)
	{
		return _Debug_stringColor(ansi, '<' + value.byteLength + ' bytes>');
	}

	if (typeof File !== 'undefined' && value instanceof File)
	{
		return _Debug_internalColor(ansi, '<' + value.name + '>');
	}

	if (typeof value === 'object')
	{
		var output = [];
		for (var key in value)
		{
			var field = key[0] === '_' ? key.slice(1) : key;
			output.push(_Debug_fadeColor(ansi, field) + ' = ' + _Debug_toAnsiString(ansi, value[key]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return _Debug_internalColor(ansi, '<internals>');
}

function _Debug_addSlashes(str, isChar)
{
	var s = str
		.replace(/\\/g, '\\\\')
		.replace(/\n/g, '\\n')
		.replace(/\t/g, '\\t')
		.replace(/\r/g, '\\r')
		.replace(/\v/g, '\\v')
		.replace(/\0/g, '\\0');

	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}

function _Debug_ctorColor(ansi, string)
{
	return ansi ? '\x1b[96m' + string + '\x1b[0m' : string;
}

function _Debug_numberColor(ansi, string)
{
	return ansi ? '\x1b[95m' + string + '\x1b[0m' : string;
}

function _Debug_stringColor(ansi, string)
{
	return ansi ? '\x1b[93m' + string + '\x1b[0m' : string;
}

function _Debug_charColor(ansi, string)
{
	return ansi ? '\x1b[92m' + string + '\x1b[0m' : string;
}

function _Debug_fadeColor(ansi, string)
{
	return ansi ? '\x1b[37m' + string + '\x1b[0m' : string;
}

function _Debug_internalColor(ansi, string)
{
	return ansi ? '\x1b[36m' + string + '\x1b[0m' : string;
}

function _Debug_toHexDigit(n)
{
	return String.fromCharCode(n < 10 ? 48 + n : 55 + n);
}


// CRASH


function _Debug_crash_UNUSED(identifier)
{
	throw new Error('https://github.com/elm/core/blob/1.0.0/hints/' + identifier + '.md');
}


function _Debug_crash(identifier, fact1, fact2, fact3, fact4)
{
	switch(identifier)
	{
		case 0:
			throw new Error('What node should I take over? In JavaScript I need something like:\n\n    Elm.Main.init({\n        node: document.getElementById("elm-node")\n    })\n\nYou need to do this with any Browser.sandbox or Browser.element program.');

		case 1:
			throw new Error('Browser.application programs cannot handle URLs like this:\n\n    ' + document.location.href + '\n\nWhat is the root? The root of your file system? Try looking at this program with `elm reactor` or some other server.');

		case 2:
			var jsonErrorString = fact1;
			throw new Error('Problem with the flags given to your Elm program on initialization.\n\n' + jsonErrorString);

		case 3:
			var portName = fact1;
			throw new Error('There can only be one port named `' + portName + '`, but your program has multiple.');

		case 4:
			var portName = fact1;
			var problem = fact2;
			throw new Error('Trying to send an unexpected type of value through port `' + portName + '`:\n' + problem);

		case 5:
			throw new Error('Trying to use `(==)` on functions.\nThere is no way to know if functions are "the same" in the Elm sense.\nRead more about this at https://package.elm-lang.org/packages/elm/core/latest/Basics#== which describes why it is this way and what the better version will look like.');

		case 6:
			var moduleName = fact1;
			throw new Error('Your page is loading multiple Elm scripts with a module named ' + moduleName + '. Maybe a duplicate script is getting loaded accidentally? If not, rename one of them so I know which is which!');

		case 8:
			var moduleName = fact1;
			var region = fact2;
			var message = fact3;
			throw new Error('TODO in module `' + moduleName + '` ' + _Debug_regionToString(region) + '\n\n' + message);

		case 9:
			var moduleName = fact1;
			var region = fact2;
			var value = fact3;
			var message = fact4;
			throw new Error(
				'TODO in module `' + moduleName + '` from the `case` expression '
				+ _Debug_regionToString(region) + '\n\nIt received the following value:\n\n    '
				+ _Debug_toString(value).replace('\n', '\n    ')
				+ '\n\nBut the branch that handles it says:\n\n    ' + message.replace('\n', '\n    ')
			);

		case 10:
			throw new Error('Bug in https://github.com/elm/virtual-dom/issues');

		case 11:
			throw new Error('Cannot perform mod 0. Division by zero error.');
	}
}

function _Debug_regionToString(region)
{
	if (region.start.line === region.end.line)
	{
		return 'on line ' + region.start.line;
	}
	return 'on lines ' + region.start.line + ' through ' + region.end.line;
}



// MATH

var _Basics_add = F2(function(a, b) { return a + b; });
var _Basics_sub = F2(function(a, b) { return a - b; });
var _Basics_mul = F2(function(a, b) { return a * b; });
var _Basics_fdiv = F2(function(a, b) { return a / b; });
var _Basics_idiv = F2(function(a, b) { return (a / b) | 0; });
var _Basics_pow = F2(Math.pow);

var _Basics_remainderBy = F2(function(b, a) { return a % b; });

// https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/divmodnote-letter.pdf
var _Basics_modBy = F2(function(modulus, x)
{
	var answer = x % modulus;
	return modulus === 0
		? _Debug_crash(11)
		:
	((answer > 0 && modulus < 0) || (answer < 0 && modulus > 0))
		? answer + modulus
		: answer;
});


// TRIGONOMETRY

var _Basics_pi = Math.PI;
var _Basics_e = Math.E;
var _Basics_cos = Math.cos;
var _Basics_sin = Math.sin;
var _Basics_tan = Math.tan;
var _Basics_acos = Math.acos;
var _Basics_asin = Math.asin;
var _Basics_atan = Math.atan;
var _Basics_atan2 = F2(Math.atan2);


// MORE MATH

function _Basics_toFloat(x) { return x; }
function _Basics_truncate(n) { return n | 0; }
function _Basics_isInfinite(n) { return n === Infinity || n === -Infinity; }

var _Basics_ceiling = Math.ceil;
var _Basics_floor = Math.floor;
var _Basics_round = Math.round;
var _Basics_sqrt = Math.sqrt;
var _Basics_log = Math.log;
var _Basics_isNaN = isNaN;


// BOOLEANS

function _Basics_not(bool) { return !bool; }
var _Basics_and = F2(function(a, b) { return a && b; });
var _Basics_or  = F2(function(a, b) { return a || b; });
var _Basics_xor = F2(function(a, b) { return a !== b; });



var _String_cons = F2(function(chr, str)
{
	return chr + str;
});

function _String_uncons(string)
{
	var word = string.charCodeAt(0);
	return !isNaN(word)
		? $elm$core$Maybe$Just(
			0xD800 <= word && word <= 0xDBFF
				? _Utils_Tuple2(_Utils_chr(string[0] + string[1]), string.slice(2))
				: _Utils_Tuple2(_Utils_chr(string[0]), string.slice(1))
		)
		: $elm$core$Maybe$Nothing;
}

var _String_append = F2(function(a, b)
{
	return a + b;
});

function _String_length(str)
{
	return str.length;
}

var _String_map = F2(function(func, string)
{
	var len = string.length;
	var array = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = string.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			array[i] = func(_Utils_chr(string[i] + string[i+1]));
			i += 2;
			continue;
		}
		array[i] = func(_Utils_chr(string[i]));
		i++;
	}
	return array.join('');
});

var _String_filter = F2(function(isGood, str)
{
	var arr = [];
	var len = str.length;
	var i = 0;
	while (i < len)
	{
		var char = str[i];
		var word = str.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += str[i];
			i++;
		}

		if (isGood(_Utils_chr(char)))
		{
			arr.push(char);
		}
	}
	return arr.join('');
});

function _String_reverse(str)
{
	var len = str.length;
	var arr = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = str.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			arr[len - i] = str[i + 1];
			i++;
			arr[len - i] = str[i - 1];
			i++;
		}
		else
		{
			arr[len - i] = str[i];
			i++;
		}
	}
	return arr.join('');
}

var _String_foldl = F3(function(func, state, string)
{
	var len = string.length;
	var i = 0;
	while (i < len)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += string[i];
			i++;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_foldr = F3(function(func, state, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_split = F2(function(sep, str)
{
	return str.split(sep);
});

var _String_join = F2(function(sep, strs)
{
	return strs.join(sep);
});

var _String_slice = F3(function(start, end, str) {
	return str.slice(start, end);
});

function _String_trim(str)
{
	return str.trim();
}

function _String_trimLeft(str)
{
	return str.replace(/^\s+/, '');
}

function _String_trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function _String_words(str)
{
	return _List_fromArray(str.trim().split(/\s+/g));
}

function _String_lines(str)
{
	return _List_fromArray(str.split(/\r\n|\r|\n/g));
}

function _String_toUpper(str)
{
	return str.toUpperCase();
}

function _String_toLower(str)
{
	return str.toLowerCase();
}

var _String_any = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (isGood(_Utils_chr(char)))
		{
			return true;
		}
	}
	return false;
});

var _String_all = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (!isGood(_Utils_chr(char)))
		{
			return false;
		}
	}
	return true;
});

var _String_contains = F2(function(sub, str)
{
	return str.indexOf(sub) > -1;
});

var _String_startsWith = F2(function(sub, str)
{
	return str.indexOf(sub) === 0;
});

var _String_endsWith = F2(function(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
});

var _String_indexes = F2(function(sub, str)
{
	var subLen = sub.length;

	if (subLen < 1)
	{
		return _List_Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}

	return _List_fromArray(is);
});


// TO STRING

function _String_fromNumber(number)
{
	return number + '';
}


// INT CONVERSIONS

function _String_toInt(str)
{
	var total = 0;
	var code0 = str.charCodeAt(0);
	var start = code0 == 0x2B /* + */ || code0 == 0x2D /* - */ ? 1 : 0;

	for (var i = start; i < str.length; ++i)
	{
		var code = str.charCodeAt(i);
		if (code < 0x30 || 0x39 < code)
		{
			return $elm$core$Maybe$Nothing;
		}
		total = 10 * total + code - 0x30;
	}

	return i == start
		? $elm$core$Maybe$Nothing
		: $elm$core$Maybe$Just(code0 == 0x2D ? -total : total);
}


// FLOAT CONVERSIONS

function _String_toFloat(s)
{
	// check if it is a hex, octal, or binary number
	if (s.length === 0 || /[\sxbo]/.test(s))
	{
		return $elm$core$Maybe$Nothing;
	}
	var n = +s;
	// faster isNaN check
	return n === n ? $elm$core$Maybe$Just(n) : $elm$core$Maybe$Nothing;
}

function _String_fromList(chars)
{
	return _List_toArray(chars).join('');
}




function _Char_toCode(char)
{
	var code = char.charCodeAt(0);
	if (0xD800 <= code && code <= 0xDBFF)
	{
		return (code - 0xD800) * 0x400 + char.charCodeAt(1) - 0xDC00 + 0x10000
	}
	return code;
}

function _Char_fromCode(code)
{
	return _Utils_chr(
		(code < 0 || 0x10FFFF < code)
			? '\uFFFD'
			:
		(code <= 0xFFFF)
			? String.fromCharCode(code)
			:
		(code -= 0x10000,
			String.fromCharCode(Math.floor(code / 0x400) + 0xD800, code % 0x400 + 0xDC00)
		)
	);
}

function _Char_toUpper(char)
{
	return _Utils_chr(char.toUpperCase());
}

function _Char_toLower(char)
{
	return _Utils_chr(char.toLowerCase());
}

function _Char_toLocaleUpper(char)
{
	return _Utils_chr(char.toLocaleUpperCase());
}

function _Char_toLocaleLower(char)
{
	return _Utils_chr(char.toLocaleLowerCase());
}



/**/
function _Json_errorToString(error)
{
	return $elm$json$Json$Decode$errorToString(error);
}
//*/


// CORE DECODERS

function _Json_succeed(msg)
{
	return {
		$: 0,
		a: msg
	};
}

function _Json_fail(msg)
{
	return {
		$: 1,
		a: msg
	};
}

function _Json_decodePrim(decoder)
{
	return { $: 2, b: decoder };
}

var _Json_decodeInt = _Json_decodePrim(function(value) {
	return (typeof value !== 'number')
		? _Json_expecting('an INT', value)
		:
	(-2147483647 < value && value < 2147483647 && (value | 0) === value)
		? $elm$core$Result$Ok(value)
		:
	(isFinite(value) && !(value % 1))
		? $elm$core$Result$Ok(value)
		: _Json_expecting('an INT', value);
});

var _Json_decodeBool = _Json_decodePrim(function(value) {
	return (typeof value === 'boolean')
		? $elm$core$Result$Ok(value)
		: _Json_expecting('a BOOL', value);
});

var _Json_decodeFloat = _Json_decodePrim(function(value) {
	return (typeof value === 'number')
		? $elm$core$Result$Ok(value)
		: _Json_expecting('a FLOAT', value);
});

var _Json_decodeValue = _Json_decodePrim(function(value) {
	return $elm$core$Result$Ok(_Json_wrap(value));
});

var _Json_decodeString = _Json_decodePrim(function(value) {
	return (typeof value === 'string')
		? $elm$core$Result$Ok(value)
		: (value instanceof String)
			? $elm$core$Result$Ok(value + '')
			: _Json_expecting('a STRING', value);
});

function _Json_decodeList(decoder) { return { $: 3, b: decoder }; }
function _Json_decodeArray(decoder) { return { $: 4, b: decoder }; }

function _Json_decodeNull(value) { return { $: 5, c: value }; }

var _Json_decodeField = F2(function(field, decoder)
{
	return {
		$: 6,
		d: field,
		b: decoder
	};
});

var _Json_decodeIndex = F2(function(index, decoder)
{
	return {
		$: 7,
		e: index,
		b: decoder
	};
});

function _Json_decodeKeyValuePairs(decoder)
{
	return {
		$: 8,
		b: decoder
	};
}

function _Json_mapMany(f, decoders)
{
	return {
		$: 9,
		f: f,
		g: decoders
	};
}

var _Json_andThen = F2(function(callback, decoder)
{
	return {
		$: 10,
		b: decoder,
		h: callback
	};
});

function _Json_oneOf(decoders)
{
	return {
		$: 11,
		g: decoders
	};
}


// DECODING OBJECTS

var _Json_map1 = F2(function(f, d1)
{
	return _Json_mapMany(f, [d1]);
});

var _Json_map2 = F3(function(f, d1, d2)
{
	return _Json_mapMany(f, [d1, d2]);
});

var _Json_map3 = F4(function(f, d1, d2, d3)
{
	return _Json_mapMany(f, [d1, d2, d3]);
});

var _Json_map4 = F5(function(f, d1, d2, d3, d4)
{
	return _Json_mapMany(f, [d1, d2, d3, d4]);
});

var _Json_map5 = F6(function(f, d1, d2, d3, d4, d5)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5]);
});

var _Json_map6 = F7(function(f, d1, d2, d3, d4, d5, d6)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6]);
});

var _Json_map7 = F8(function(f, d1, d2, d3, d4, d5, d6, d7)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
});

var _Json_map8 = F9(function(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
});


// DECODE

var _Json_runOnString = F2(function(decoder, string)
{
	try
	{
		var value = JSON.parse(string);
		return _Json_runHelp(decoder, value);
	}
	catch (e)
	{
		return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, 'This is not valid JSON! ' + e.message, _Json_wrap(string)));
	}
});

var _Json_run = F2(function(decoder, value)
{
	return _Json_runHelp(decoder, _Json_unwrap(value));
});

function _Json_runHelp(decoder, value)
{
	switch (decoder.$)
	{
		case 2:
			return decoder.b(value);

		case 5:
			return (value === null)
				? $elm$core$Result$Ok(decoder.c)
				: _Json_expecting('null', value);

		case 3:
			if (!_Json_isArray(value))
			{
				return _Json_expecting('a LIST', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _List_fromArray);

		case 4:
			if (!_Json_isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _Json_toElmArray);

		case 6:
			var field = decoder.d;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return _Json_expecting('an OBJECT with a field named `' + field + '`', value);
			}
			var result = _Json_runHelp(decoder.b, value[field]);
			return ($elm$core$Result$isOk(result)) ? result : $elm$core$Result$Err(A2($elm$json$Json$Decode$Field, field, result.a));

		case 7:
			var index = decoder.e;
			if (!_Json_isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			if (index >= value.length)
			{
				return _Json_expecting('a LONGER array. Need index ' + index + ' but only see ' + value.length + ' entries', value);
			}
			var result = _Json_runHelp(decoder.b, value[index]);
			return ($elm$core$Result$isOk(result)) ? result : $elm$core$Result$Err(A2($elm$json$Json$Decode$Index, index, result.a));

		case 8:
			if (typeof value !== 'object' || value === null || _Json_isArray(value))
			{
				return _Json_expecting('an OBJECT', value);
			}

			var keyValuePairs = _List_Nil;
			// TODO test perf of Object.keys and switch when support is good enough
			for (var key in value)
			{
				if (value.hasOwnProperty(key))
				{
					var result = _Json_runHelp(decoder.b, value[key]);
					if (!$elm$core$Result$isOk(result))
					{
						return $elm$core$Result$Err(A2($elm$json$Json$Decode$Field, key, result.a));
					}
					keyValuePairs = _List_Cons(_Utils_Tuple2(key, result.a), keyValuePairs);
				}
			}
			return $elm$core$Result$Ok($elm$core$List$reverse(keyValuePairs));

		case 9:
			var answer = decoder.f;
			var decoders = decoder.g;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = _Json_runHelp(decoders[i], value);
				if (!$elm$core$Result$isOk(result))
				{
					return result;
				}
				answer = answer(result.a);
			}
			return $elm$core$Result$Ok(answer);

		case 10:
			var result = _Json_runHelp(decoder.b, value);
			return (!$elm$core$Result$isOk(result))
				? result
				: _Json_runHelp(decoder.h(result.a), value);

		case 11:
			var errors = _List_Nil;
			for (var temp = decoder.g; temp.b; temp = temp.b) // WHILE_CONS
			{
				var result = _Json_runHelp(temp.a, value);
				if ($elm$core$Result$isOk(result))
				{
					return result;
				}
				errors = _List_Cons(result.a, errors);
			}
			return $elm$core$Result$Err($elm$json$Json$Decode$OneOf($elm$core$List$reverse(errors)));

		case 1:
			return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, decoder.a, _Json_wrap(value)));

		case 0:
			return $elm$core$Result$Ok(decoder.a);
	}
}

function _Json_runArrayDecoder(decoder, value, toElmValue)
{
	var len = value.length;
	var array = new Array(len);
	for (var i = 0; i < len; i++)
	{
		var result = _Json_runHelp(decoder, value[i]);
		if (!$elm$core$Result$isOk(result))
		{
			return $elm$core$Result$Err(A2($elm$json$Json$Decode$Index, i, result.a));
		}
		array[i] = result.a;
	}
	return $elm$core$Result$Ok(toElmValue(array));
}

function _Json_isArray(value)
{
	return Array.isArray(value) || (typeof FileList !== 'undefined' && value instanceof FileList);
}

function _Json_toElmArray(array)
{
	return A2($elm$core$Array$initialize, array.length, function(i) { return array[i]; });
}

function _Json_expecting(type, value)
{
	return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, 'Expecting ' + type, _Json_wrap(value)));
}


// EQUALITY

function _Json_equality(x, y)
{
	if (x === y)
	{
		return true;
	}

	if (x.$ !== y.$)
	{
		return false;
	}

	switch (x.$)
	{
		case 0:
		case 1:
			return x.a === y.a;

		case 2:
			return x.b === y.b;

		case 5:
			return x.c === y.c;

		case 3:
		case 4:
		case 8:
			return _Json_equality(x.b, y.b);

		case 6:
			return x.d === y.d && _Json_equality(x.b, y.b);

		case 7:
			return x.e === y.e && _Json_equality(x.b, y.b);

		case 9:
			return x.f === y.f && _Json_listEquality(x.g, y.g);

		case 10:
			return x.h === y.h && _Json_equality(x.b, y.b);

		case 11:
			return _Json_listEquality(x.g, y.g);
	}
}

function _Json_listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!_Json_equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

var _Json_encode = F2(function(indentLevel, value)
{
	return JSON.stringify(_Json_unwrap(value), null, indentLevel) + '';
});

function _Json_wrap(value) { return { $: 0, a: value }; }
function _Json_unwrap(value) { return value.a; }

function _Json_wrap_UNUSED(value) { return value; }
function _Json_unwrap_UNUSED(value) { return value; }

function _Json_emptyArray() { return []; }
function _Json_emptyObject() { return {}; }

var _Json_addField = F3(function(key, value, object)
{
	object[key] = _Json_unwrap(value);
	return object;
});

function _Json_addEntry(func)
{
	return F2(function(entry, array)
	{
		array.push(_Json_unwrap(func(entry)));
		return array;
	});
}

var _Json_encodeNull = _Json_wrap(null);



// TASKS

function _Scheduler_succeed(value)
{
	return {
		$: 0,
		a: value
	};
}

function _Scheduler_fail(error)
{
	return {
		$: 1,
		a: error
	};
}

function _Scheduler_binding(callback)
{
	return {
		$: 2,
		b: callback,
		c: null
	};
}

var _Scheduler_andThen = F2(function(callback, task)
{
	return {
		$: 3,
		b: callback,
		d: task
	};
});

var _Scheduler_onError = F2(function(callback, task)
{
	return {
		$: 4,
		b: callback,
		d: task
	};
});

function _Scheduler_receive(callback)
{
	return {
		$: 5,
		b: callback
	};
}


// PROCESSES

var _Scheduler_guid = 0;

function _Scheduler_rawSpawn(task)
{
	var proc = {
		$: 0,
		e: _Scheduler_guid++,
		f: task,
		g: null,
		h: []
	};

	_Scheduler_enqueue(proc);

	return proc;
}

function _Scheduler_spawn(task)
{
	return _Scheduler_binding(function(callback) {
		callback(_Scheduler_succeed(_Scheduler_rawSpawn(task)));
	});
}

function _Scheduler_rawSend(proc, msg)
{
	proc.h.push(msg);
	_Scheduler_enqueue(proc);
}

var _Scheduler_send = F2(function(proc, msg)
{
	return _Scheduler_binding(function(callback) {
		_Scheduler_rawSend(proc, msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});

function _Scheduler_kill(proc)
{
	return _Scheduler_binding(function(callback) {
		var task = proc.f;
		if (task.$ === 2 && task.c)
		{
			task.c();
		}

		proc.f = null;

		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
}


/* STEP PROCESSES

type alias Process =
  { $ : tag
  , id : unique_id
  , root : Task
  , stack : null | { $: SUCCEED | FAIL, a: callback, b: stack }
  , mailbox : [msg]
  }

*/


var _Scheduler_working = false;
var _Scheduler_queue = [];


function _Scheduler_enqueue(proc)
{
	_Scheduler_queue.push(proc);
	if (_Scheduler_working)
	{
		return;
	}
	_Scheduler_working = true;
	while (proc = _Scheduler_queue.shift())
	{
		_Scheduler_step(proc);
	}
	_Scheduler_working = false;
}


function _Scheduler_step(proc)
{
	while (proc.f)
	{
		var rootTag = proc.f.$;
		if (rootTag === 0 || rootTag === 1)
		{
			while (proc.g && proc.g.$ !== rootTag)
			{
				proc.g = proc.g.i;
			}
			if (!proc.g)
			{
				return;
			}
			proc.f = proc.g.b(proc.f.a);
			proc.g = proc.g.i;
		}
		else if (rootTag === 2)
		{
			proc.f.c = proc.f.b(function(newRoot) {
				proc.f = newRoot;
				_Scheduler_enqueue(proc);
			});
			return;
		}
		else if (rootTag === 5)
		{
			if (proc.h.length === 0)
			{
				return;
			}
			proc.f = proc.f.b(proc.h.shift());
		}
		else // if (rootTag === 3 || rootTag === 4)
		{
			proc.g = {
				$: rootTag === 3 ? 0 : 1,
				b: proc.f.b,
				i: proc.g
			};
			proc.f = proc.f.d;
		}
	}
}



function _Process_sleep(time)
{
	return _Scheduler_binding(function(callback) {
		var id = setTimeout(function() {
			callback(_Scheduler_succeed(_Utils_Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}




// PROGRAMS


var _Platform_worker = F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.init,
		impl.update,
		impl.subscriptions,
		function() { return function() {} }
	);
});



// INITIALIZE A PROGRAM


function _Platform_initialize(flagDecoder, args, init, update, subscriptions, stepperBuilder)
{
	var result = A2(_Json_run, flagDecoder, _Json_wrap(args ? args['flags'] : undefined));
	$elm$core$Result$isOk(result) || _Debug_crash(2 /**/, _Json_errorToString(result.a) /**/);
	var managers = {};
	var initPair = init(result.a);
	var model = initPair.a;
	var stepper = stepperBuilder(sendToApp, model);
	var ports = _Platform_setupEffects(managers, sendToApp);

	function sendToApp(msg, viewMetadata)
	{
		var pair = A2(update, msg, model);
		stepper(model = pair.a, viewMetadata);
		_Platform_enqueueEffects(managers, pair.b, subscriptions(model));
	}

	_Platform_enqueueEffects(managers, initPair.b, subscriptions(model));

	return ports ? { ports: ports } : {};
}



// TRACK PRELOADS
//
// This is used by code in elm/browser and elm/http
// to register any HTTP requests that are triggered by init.
//


var _Platform_preload;


function _Platform_registerPreload(url)
{
	_Platform_preload.add(url);
}



// EFFECT MANAGERS


var _Platform_effectManagers = {};


function _Platform_setupEffects(managers, sendToApp)
{
	var ports;

	// setup all necessary effect managers
	for (var key in _Platform_effectManagers)
	{
		var manager = _Platform_effectManagers[key];

		if (manager.a)
		{
			ports = ports || {};
			ports[key] = manager.a(key, sendToApp);
		}

		managers[key] = _Platform_instantiateManager(manager, sendToApp);
	}

	return ports;
}


function _Platform_createManager(init, onEffects, onSelfMsg, cmdMap, subMap)
{
	return {
		b: init,
		c: onEffects,
		d: onSelfMsg,
		e: cmdMap,
		f: subMap
	};
}


function _Platform_instantiateManager(info, sendToApp)
{
	var router = {
		g: sendToApp,
		h: undefined
	};

	var onEffects = info.c;
	var onSelfMsg = info.d;
	var cmdMap = info.e;
	var subMap = info.f;

	function loop(state)
	{
		return A2(_Scheduler_andThen, loop, _Scheduler_receive(function(msg)
		{
			var value = msg.a;

			if (msg.$ === 0)
			{
				return A3(onSelfMsg, router, value, state);
			}

			return cmdMap && subMap
				? A4(onEffects, router, value.i, value.j, state)
				: A3(onEffects, router, cmdMap ? value.i : value.j, state);
		}));
	}

	return router.h = _Scheduler_rawSpawn(A2(_Scheduler_andThen, loop, info.b));
}



// ROUTING


var _Platform_sendToApp = F2(function(router, msg)
{
	return _Scheduler_binding(function(callback)
	{
		router.g(msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});


var _Platform_sendToSelf = F2(function(router, msg)
{
	return A2(_Scheduler_send, router.h, {
		$: 0,
		a: msg
	});
});



// BAGS


function _Platform_leaf(home)
{
	return function(value)
	{
		return {
			$: 1,
			k: home,
			l: value
		};
	};
}


function _Platform_batch(list)
{
	return {
		$: 2,
		m: list
	};
}


var _Platform_map = F2(function(tagger, bag)
{
	return {
		$: 3,
		n: tagger,
		o: bag
	}
});



// PIPE BAGS INTO EFFECT MANAGERS
//
// Effects must be queued!
//
// Say your init contains a synchronous command, like Time.now or Time.here
//
//   - This will produce a batch of effects (FX_1)
//   - The synchronous task triggers the subsequent `update` call
//   - This will produce a batch of effects (FX_2)
//
// If we just start dispatching FX_2, subscriptions from FX_2 can be processed
// before subscriptions from FX_1. No good! Earlier versions of this code had
// this problem, leading to these reports:
//
//   https://github.com/elm/core/issues/980
//   https://github.com/elm/core/pull/981
//   https://github.com/elm/compiler/issues/1776
//
// The queue is necessary to avoid ordering issues for synchronous commands.


// Why use true/false here? Why not just check the length of the queue?
// The goal is to detect "are we currently dispatching effects?" If we
// are, we need to bail and let the ongoing while loop handle things.
//
// Now say the queue has 1 element. When we dequeue the final element,
// the queue will be empty, but we are still actively dispatching effects.
// So you could get queue jumping in a really tricky category of cases.
//
var _Platform_effectsQueue = [];
var _Platform_effectsActive = false;


function _Platform_enqueueEffects(managers, cmdBag, subBag)
{
	_Platform_effectsQueue.push({ p: managers, q: cmdBag, r: subBag });

	if (_Platform_effectsActive) return;

	_Platform_effectsActive = true;
	for (var fx; fx = _Platform_effectsQueue.shift(); )
	{
		_Platform_dispatchEffects(fx.p, fx.q, fx.r);
	}
	_Platform_effectsActive = false;
}


function _Platform_dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	_Platform_gatherEffects(true, cmdBag, effectsDict, null);
	_Platform_gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		_Scheduler_rawSend(managers[home], {
			$: 'fx',
			a: effectsDict[home] || { i: _List_Nil, j: _List_Nil }
		});
	}
}


function _Platform_gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.$)
	{
		case 1:
			var home = bag.k;
			var effect = _Platform_toEffect(isCmd, home, taggers, bag.l);
			effectsDict[home] = _Platform_insert(isCmd, effect, effectsDict[home]);
			return;

		case 2:
			for (var list = bag.m; list.b; list = list.b) // WHILE_CONS
			{
				_Platform_gatherEffects(isCmd, list.a, effectsDict, taggers);
			}
			return;

		case 3:
			_Platform_gatherEffects(isCmd, bag.o, effectsDict, {
				s: bag.n,
				t: taggers
			});
			return;
	}
}


function _Platform_toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		for (var temp = taggers; temp; temp = temp.t)
		{
			x = temp.s(x);
		}
		return x;
	}

	var map = isCmd
		? _Platform_effectManagers[home].e
		: _Platform_effectManagers[home].f;

	return A2(map, applyTaggers, value)
}


function _Platform_insert(isCmd, newEffect, effects)
{
	effects = effects || { i: _List_Nil, j: _List_Nil };

	isCmd
		? (effects.i = _List_Cons(newEffect, effects.i))
		: (effects.j = _List_Cons(newEffect, effects.j));

	return effects;
}



// PORTS


function _Platform_checkPortName(name)
{
	if (_Platform_effectManagers[name])
	{
		_Debug_crash(3, name)
	}
}



// OUTGOING PORTS


function _Platform_outgoingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		e: _Platform_outgoingPortMap,
		u: converter,
		a: _Platform_setupOutgoingPort
	};
	return _Platform_leaf(name);
}


var _Platform_outgoingPortMap = F2(function(tagger, value) { return value; });


function _Platform_setupOutgoingPort(name)
{
	var subs = [];
	var converter = _Platform_effectManagers[name].u;

	// CREATE MANAGER

	var init = _Process_sleep(0);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, cmdList, state)
	{
		for ( ; cmdList.b; cmdList = cmdList.b) // WHILE_CONS
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = _Json_unwrap(converter(cmdList.a));
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
		}
		return init;
	});

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}



// INCOMING PORTS


function _Platform_incomingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		f: _Platform_incomingPortMap,
		u: converter,
		a: _Platform_setupIncomingPort
	};
	return _Platform_leaf(name);
}


var _Platform_incomingPortMap = F2(function(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});


function _Platform_setupIncomingPort(name, sendToApp)
{
	var subs = _List_Nil;
	var converter = _Platform_effectManagers[name].u;

	// CREATE MANAGER

	var init = _Scheduler_succeed(null);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, subList, state)
	{
		subs = subList;
		return init;
	});

	// PUBLIC API

	function send(incomingValue)
	{
		var result = A2(_Json_run, converter, _Json_wrap(incomingValue));

		$elm$core$Result$isOk(result) || _Debug_crash(4, name, result.a);

		var value = result.a;
		for (var temp = subs; temp.b; temp = temp.b) // WHILE_CONS
		{
			sendToApp(temp.a(value));
		}
	}

	return { send: send };
}



// EXPORT ELM MODULES
//
// Have DEBUG and PROD versions so that we can (1) give nicer errors in
// debug mode and (2) not pay for the bits needed for that in prod mode.
//


function _Platform_export_UNUSED(exports)
{
	scope['Elm']
		? _Platform_mergeExportsProd(scope['Elm'], exports)
		: scope['Elm'] = exports;
}


function _Platform_mergeExportsProd(obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6)
				: _Platform_mergeExportsProd(obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}


function _Platform_export(exports)
{
	scope['Elm']
		? _Platform_mergeExportsDebug('Elm', scope['Elm'], exports)
		: scope['Elm'] = exports;
}


function _Platform_mergeExportsDebug(moduleName, obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6, moduleName)
				: _Platform_mergeExportsDebug(moduleName + '.' + name, obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}




// HELPERS


var _VirtualDom_divertHrefToApp;

var _VirtualDom_doc = typeof document !== 'undefined' ? document : {};


function _VirtualDom_appendChild(parent, child)
{
	parent.appendChild(child);
}

var _VirtualDom_init = F4(function(virtualNode, flagDecoder, debugMetadata, args)
{
	// NOTE: this function needs _Platform_export available to work

	/**_UNUSED/
	var node = args['node'];
	//*/
	/**/
	var node = args && args['node'] ? args['node'] : _Debug_crash(0);
	//*/

	node.parentNode.replaceChild(
		_VirtualDom_render(virtualNode, function() {}),
		node
	);

	return {};
});



// TEXT


function _VirtualDom_text(string)
{
	return {
		$: 0,
		a: string
	};
}



// NODE


var _VirtualDom_nodeNS = F2(function(namespace, tag)
{
	return F2(function(factList, kidList)
	{
		for (var kids = [], descendantsCount = 0; kidList.b; kidList = kidList.b) // WHILE_CONS
		{
			var kid = kidList.a;
			descendantsCount += (kid.b || 0);
			kids.push(kid);
		}
		descendantsCount += kids.length;

		return {
			$: 1,
			c: tag,
			d: _VirtualDom_organizeFacts(factList),
			e: kids,
			f: namespace,
			b: descendantsCount
		};
	});
});


var _VirtualDom_node = _VirtualDom_nodeNS(undefined);



// KEYED NODE


var _VirtualDom_keyedNodeNS = F2(function(namespace, tag)
{
	return F2(function(factList, kidList)
	{
		for (var kids = [], descendantsCount = 0; kidList.b; kidList = kidList.b) // WHILE_CONS
		{
			var kid = kidList.a;
			descendantsCount += (kid.b.b || 0);
			kids.push(kid);
		}
		descendantsCount += kids.length;

		return {
			$: 2,
			c: tag,
			d: _VirtualDom_organizeFacts(factList),
			e: kids,
			f: namespace,
			b: descendantsCount
		};
	});
});


var _VirtualDom_keyedNode = _VirtualDom_keyedNodeNS(undefined);



// CUSTOM


function _VirtualDom_custom(factList, model, render, diff)
{
	return {
		$: 3,
		d: _VirtualDom_organizeFacts(factList),
		g: model,
		h: render,
		i: diff
	};
}



// MAP


var _VirtualDom_map = F2(function(tagger, node)
{
	return {
		$: 4,
		j: tagger,
		k: node,
		b: 1 + (node.b || 0)
	};
});



// LAZY


function _VirtualDom_thunk(refs, thunk)
{
	return {
		$: 5,
		l: refs,
		m: thunk,
		k: undefined
	};
}

var _VirtualDom_lazy = F2(function(func, a)
{
	return _VirtualDom_thunk([func, a], function() {
		return func(a);
	});
});

var _VirtualDom_lazy2 = F3(function(func, a, b)
{
	return _VirtualDom_thunk([func, a, b], function() {
		return A2(func, a, b);
	});
});

var _VirtualDom_lazy3 = F4(function(func, a, b, c)
{
	return _VirtualDom_thunk([func, a, b, c], function() {
		return A3(func, a, b, c);
	});
});

var _VirtualDom_lazy4 = F5(function(func, a, b, c, d)
{
	return _VirtualDom_thunk([func, a, b, c, d], function() {
		return A4(func, a, b, c, d);
	});
});

var _VirtualDom_lazy5 = F6(function(func, a, b, c, d, e)
{
	return _VirtualDom_thunk([func, a, b, c, d, e], function() {
		return A5(func, a, b, c, d, e);
	});
});

var _VirtualDom_lazy6 = F7(function(func, a, b, c, d, e, f)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f], function() {
		return A6(func, a, b, c, d, e, f);
	});
});

var _VirtualDom_lazy7 = F8(function(func, a, b, c, d, e, f, g)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f, g], function() {
		return A7(func, a, b, c, d, e, f, g);
	});
});

var _VirtualDom_lazy8 = F9(function(func, a, b, c, d, e, f, g, h)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f, g, h], function() {
		return A8(func, a, b, c, d, e, f, g, h);
	});
});



// FACTS


var _VirtualDom_on = F2(function(key, handler)
{
	return {
		$: 'a0',
		n: key,
		o: handler
	};
});
var _VirtualDom_style = F2(function(key, value)
{
	return {
		$: 'a1',
		n: key,
		o: value
	};
});
var _VirtualDom_property = F2(function(key, value)
{
	return {
		$: 'a2',
		n: key,
		o: value
	};
});
var _VirtualDom_attribute = F2(function(key, value)
{
	return {
		$: 'a3',
		n: key,
		o: value
	};
});
var _VirtualDom_attributeNS = F3(function(namespace, key, value)
{
	return {
		$: 'a4',
		n: key,
		o: { f: namespace, o: value }
	};
});



// XSS ATTACK VECTOR CHECKS


function _VirtualDom_noScript(tag)
{
	return tag == 'script' ? 'p' : tag;
}

function _VirtualDom_noOnOrFormAction(key)
{
	return /^(on|formAction$)/i.test(key) ? 'data-' + key : key;
}

function _VirtualDom_noInnerHtmlOrFormAction(key)
{
	return key == 'innerHTML' || key == 'formAction' ? 'data-' + key : key;
}

function _VirtualDom_noJavaScriptUri_UNUSED(value)
{
	return /^javascript:/i.test(value.replace(/\s/g,'')) ? '' : value;
}

function _VirtualDom_noJavaScriptUri(value)
{
	return /^javascript:/i.test(value.replace(/\s/g,''))
		? 'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'
		: value;
}

function _VirtualDom_noJavaScriptOrHtmlUri_UNUSED(value)
{
	return /^\s*(javascript:|data:text\/html)/i.test(value) ? '' : value;
}

function _VirtualDom_noJavaScriptOrHtmlUri(value)
{
	return /^\s*(javascript:|data:text\/html)/i.test(value)
		? 'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'
		: value;
}



// MAP FACTS


var _VirtualDom_mapAttribute = F2(function(func, attr)
{
	return (attr.$ === 'a0')
		? A2(_VirtualDom_on, attr.n, _VirtualDom_mapHandler(func, attr.o))
		: attr;
});

function _VirtualDom_mapHandler(func, handler)
{
	var tag = $elm$virtual_dom$VirtualDom$toHandlerInt(handler);

	// 0 = Normal
	// 1 = MayStopPropagation
	// 2 = MayPreventDefault
	// 3 = Custom

	return {
		$: handler.$,
		a:
			!tag
				? A2($elm$json$Json$Decode$map, func, handler.a)
				:
			A3($elm$json$Json$Decode$map2,
				tag < 3
					? _VirtualDom_mapEventTuple
					: _VirtualDom_mapEventRecord,
				$elm$json$Json$Decode$succeed(func),
				handler.a
			)
	};
}

var _VirtualDom_mapEventTuple = F2(function(func, tuple)
{
	return _Utils_Tuple2(func(tuple.a), tuple.b);
});

var _VirtualDom_mapEventRecord = F2(function(func, record)
{
	return {
		message: func(record.message),
		stopPropagation: record.stopPropagation,
		preventDefault: record.preventDefault
	}
});



// ORGANIZE FACTS


function _VirtualDom_organizeFacts(factList)
{
	for (var facts = {}; factList.b; factList = factList.b) // WHILE_CONS
	{
		var entry = factList.a;

		var tag = entry.$;
		var key = entry.n;
		var value = entry.o;

		if (tag === 'a2')
		{
			(key === 'className')
				? _VirtualDom_addClass(facts, key, _Json_unwrap(value))
				: facts[key] = _Json_unwrap(value);

			continue;
		}

		var subFacts = facts[tag] || (facts[tag] = {});
		(tag === 'a3' && key === 'class')
			? _VirtualDom_addClass(subFacts, key, value)
			: subFacts[key] = value;
	}

	return facts;
}

function _VirtualDom_addClass(object, key, newClass)
{
	var classes = object[key];
	object[key] = classes ? classes + ' ' + newClass : newClass;
}



// RENDER


function _VirtualDom_render(vNode, eventNode)
{
	var tag = vNode.$;

	if (tag === 5)
	{
		return _VirtualDom_render(vNode.k || (vNode.k = vNode.m()), eventNode);
	}

	if (tag === 0)
	{
		return _VirtualDom_doc.createTextNode(vNode.a);
	}

	if (tag === 4)
	{
		var subNode = vNode.k;
		var tagger = vNode.j;

		while (subNode.$ === 4)
		{
			typeof tagger !== 'object'
				? tagger = [tagger, subNode.j]
				: tagger.push(subNode.j);

			subNode = subNode.k;
		}

		var subEventRoot = { j: tagger, p: eventNode };
		var domNode = _VirtualDom_render(subNode, subEventRoot);
		domNode.elm_event_node_ref = subEventRoot;
		return domNode;
	}

	if (tag === 3)
	{
		var domNode = vNode.h(vNode.g);
		_VirtualDom_applyFacts(domNode, eventNode, vNode.d);
		return domNode;
	}

	// at this point `tag` must be 1 or 2

	var domNode = vNode.f
		? _VirtualDom_doc.createElementNS(vNode.f, vNode.c)
		: _VirtualDom_doc.createElement(vNode.c);

	if (_VirtualDom_divertHrefToApp && vNode.c == 'a')
	{
		domNode.addEventListener('click', _VirtualDom_divertHrefToApp(domNode));
	}

	_VirtualDom_applyFacts(domNode, eventNode, vNode.d);

	for (var kids = vNode.e, i = 0; i < kids.length; i++)
	{
		_VirtualDom_appendChild(domNode, _VirtualDom_render(tag === 1 ? kids[i] : kids[i].b, eventNode));
	}

	return domNode;
}



// APPLY FACTS


function _VirtualDom_applyFacts(domNode, eventNode, facts)
{
	for (var key in facts)
	{
		var value = facts[key];

		key === 'a1'
			? _VirtualDom_applyStyles(domNode, value)
			:
		key === 'a0'
			? _VirtualDom_applyEvents(domNode, eventNode, value)
			:
		key === 'a3'
			? _VirtualDom_applyAttrs(domNode, value)
			:
		key === 'a4'
			? _VirtualDom_applyAttrsNS(domNode, value)
			:
		((key !== 'value' && key !== 'checked') || domNode[key] !== value) && (domNode[key] = value);
	}
}



// APPLY STYLES


function _VirtualDom_applyStyles(domNode, styles)
{
	var domNodeStyle = domNode.style;

	for (var key in styles)
	{
		domNodeStyle[key] = styles[key];
	}
}



// APPLY ATTRS


function _VirtualDom_applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		typeof value !== 'undefined'
			? domNode.setAttribute(key, value)
			: domNode.removeAttribute(key);
	}
}



// APPLY NAMESPACED ATTRS


function _VirtualDom_applyAttrsNS(domNode, nsAttrs)
{
	for (var key in nsAttrs)
	{
		var pair = nsAttrs[key];
		var namespace = pair.f;
		var value = pair.o;

		typeof value !== 'undefined'
			? domNode.setAttributeNS(namespace, key, value)
			: domNode.removeAttributeNS(namespace, key);
	}
}



// APPLY EVENTS


function _VirtualDom_applyEvents(domNode, eventNode, events)
{
	var allCallbacks = domNode.elmFs || (domNode.elmFs = {});

	for (var key in events)
	{
		var newHandler = events[key];
		var oldCallback = allCallbacks[key];

		if (!newHandler)
		{
			domNode.removeEventListener(key, oldCallback);
			allCallbacks[key] = undefined;
			continue;
		}

		if (oldCallback)
		{
			var oldHandler = oldCallback.q;
			if (oldHandler.$ === newHandler.$)
			{
				oldCallback.q = newHandler;
				continue;
			}
			domNode.removeEventListener(key, oldCallback);
		}

		oldCallback = _VirtualDom_makeCallback(eventNode, newHandler);
		domNode.addEventListener(key, oldCallback,
			_VirtualDom_passiveSupported
			&& { passive: $elm$virtual_dom$VirtualDom$toHandlerInt(newHandler) < 2 }
		);
		allCallbacks[key] = oldCallback;
	}
}



// PASSIVE EVENTS


var _VirtualDom_passiveSupported;

try
{
	window.addEventListener('t', null, Object.defineProperty({}, 'passive', {
		get: function() { _VirtualDom_passiveSupported = true; }
	}));
}
catch(e) {}



// EVENT HANDLERS


function _VirtualDom_makeCallback(eventNode, initialHandler)
{
	function callback(event)
	{
		var handler = callback.q;
		var result = _Json_runHelp(handler.a, event);

		if (!$elm$core$Result$isOk(result))
		{
			return;
		}

		var tag = $elm$virtual_dom$VirtualDom$toHandlerInt(handler);

		// 0 = Normal
		// 1 = MayStopPropagation
		// 2 = MayPreventDefault
		// 3 = Custom

		var value = result.a;
		var message = !tag ? value : tag < 3 ? value.a : value.message;
		var stopPropagation = tag == 1 ? value.b : tag == 3 && value.stopPropagation;
		var currentEventNode = (
			stopPropagation && event.stopPropagation(),
			(tag == 2 ? value.b : tag == 3 && value.preventDefault) && event.preventDefault(),
			eventNode
		);
		var tagger;
		var i;
		while (tagger = currentEventNode.j)
		{
			if (typeof tagger == 'function')
			{
				message = tagger(message);
			}
			else
			{
				for (var i = tagger.length; i--; )
				{
					message = tagger[i](message);
				}
			}
			currentEventNode = currentEventNode.p;
		}
		currentEventNode(message, stopPropagation); // stopPropagation implies isSync
	}

	callback.q = initialHandler;

	return callback;
}

function _VirtualDom_equalEvents(x, y)
{
	return x.$ == y.$ && _Json_equality(x.a, y.a);
}



// DIFF


// TODO: Should we do patches like in iOS?
//
// type Patch
//   = At Int Patch
//   | Batch (List Patch)
//   | Change ...
//
// How could it not be better?
//
function _VirtualDom_diff(x, y)
{
	var patches = [];
	_VirtualDom_diffHelp(x, y, patches, 0);
	return patches;
}


function _VirtualDom_pushPatch(patches, type, index, data)
{
	var patch = {
		$: type,
		r: index,
		s: data,
		t: undefined,
		u: undefined
	};
	patches.push(patch);
	return patch;
}


function _VirtualDom_diffHelp(x, y, patches, index)
{
	if (x === y)
	{
		return;
	}

	var xType = x.$;
	var yType = y.$;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (xType !== yType)
	{
		if (xType === 1 && yType === 2)
		{
			y = _VirtualDom_dekey(y);
			yType = 1;
		}
		else
		{
			_VirtualDom_pushPatch(patches, 0, index, y);
			return;
		}
	}

	// Now we know that both nodes are the same $.
	switch (yType)
	{
		case 5:
			var xRefs = x.l;
			var yRefs = y.l;
			var i = xRefs.length;
			var same = i === yRefs.length;
			while (same && i--)
			{
				same = xRefs[i] === yRefs[i];
			}
			if (same)
			{
				y.k = x.k;
				return;
			}
			y.k = y.m();
			var subPatches = [];
			_VirtualDom_diffHelp(x.k, y.k, subPatches, 0);
			subPatches.length > 0 && _VirtualDom_pushPatch(patches, 1, index, subPatches);
			return;

		case 4:
			// gather nested taggers
			var xTaggers = x.j;
			var yTaggers = y.j;
			var nesting = false;

			var xSubNode = x.k;
			while (xSubNode.$ === 4)
			{
				nesting = true;

				typeof xTaggers !== 'object'
					? xTaggers = [xTaggers, xSubNode.j]
					: xTaggers.push(xSubNode.j);

				xSubNode = xSubNode.k;
			}

			var ySubNode = y.k;
			while (ySubNode.$ === 4)
			{
				nesting = true;

				typeof yTaggers !== 'object'
					? yTaggers = [yTaggers, ySubNode.j]
					: yTaggers.push(ySubNode.j);

				ySubNode = ySubNode.k;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && xTaggers.length !== yTaggers.length)
			{
				_VirtualDom_pushPatch(patches, 0, index, y);
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !_VirtualDom_pairwiseRefEqual(xTaggers, yTaggers) : xTaggers !== yTaggers)
			{
				_VirtualDom_pushPatch(patches, 2, index, yTaggers);
			}

			// diff everything below the taggers
			_VirtualDom_diffHelp(xSubNode, ySubNode, patches, index + 1);
			return;

		case 0:
			if (x.a !== y.a)
			{
				_VirtualDom_pushPatch(patches, 3, index, y.a);
			}
			return;

		case 1:
			_VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKids);
			return;

		case 2:
			_VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKeyedKids);
			return;

		case 3:
			if (x.h !== y.h)
			{
				_VirtualDom_pushPatch(patches, 0, index, y);
				return;
			}

			var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
			factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

			var patch = y.i(x.g, y.g);
			patch && _VirtualDom_pushPatch(patches, 5, index, patch);

			return;
	}
}

// assumes the incoming arrays are the same length
function _VirtualDom_pairwiseRefEqual(as, bs)
{
	for (var i = 0; i < as.length; i++)
	{
		if (as[i] !== bs[i])
		{
			return false;
		}
	}

	return true;
}

function _VirtualDom_diffNodes(x, y, patches, index, diffKids)
{
	// Bail if obvious indicators have changed. Implies more serious
	// structural changes such that it's not worth it to diff.
	if (x.c !== y.c || x.f !== y.f)
	{
		_VirtualDom_pushPatch(patches, 0, index, y);
		return;
	}

	var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
	factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

	diffKids(x, y, patches, index);
}



// DIFF FACTS


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function _VirtualDom_diffFacts(x, y, category)
{
	var diff;

	// look for changes and removals
	for (var xKey in x)
	{
		if (xKey === 'a1' || xKey === 'a0' || xKey === 'a3' || xKey === 'a4')
		{
			var subDiff = _VirtualDom_diffFacts(x[xKey], y[xKey] || {}, xKey);
			if (subDiff)
			{
				diff = diff || {};
				diff[xKey] = subDiff;
			}
			continue;
		}

		// remove if not in the new facts
		if (!(xKey in y))
		{
			diff = diff || {};
			diff[xKey] =
				!category
					? (typeof x[xKey] === 'string' ? '' : null)
					:
				(category === 'a1')
					? ''
					:
				(category === 'a0' || category === 'a3')
					? undefined
					:
				{ f: x[xKey].f, o: undefined };

			continue;
		}

		var xValue = x[xKey];
		var yValue = y[xKey];

		// reference equal, so don't worry about it
		if (xValue === yValue && xKey !== 'value' && xKey !== 'checked'
			|| category === 'a0' && _VirtualDom_equalEvents(xValue, yValue))
		{
			continue;
		}

		diff = diff || {};
		diff[xKey] = yValue;
	}

	// add new stuff
	for (var yKey in y)
	{
		if (!(yKey in x))
		{
			diff = diff || {};
			diff[yKey] = y[yKey];
		}
	}

	return diff;
}



// DIFF KIDS


function _VirtualDom_diffKids(xParent, yParent, patches, index)
{
	var xKids = xParent.e;
	var yKids = yParent.e;

	var xLen = xKids.length;
	var yLen = yKids.length;

	// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

	if (xLen > yLen)
	{
		_VirtualDom_pushPatch(patches, 6, index, {
			v: yLen,
			i: xLen - yLen
		});
	}
	else if (xLen < yLen)
	{
		_VirtualDom_pushPatch(patches, 7, index, {
			v: xLen,
			e: yKids
		});
	}

	// PAIRWISE DIFF EVERYTHING ELSE

	for (var minLen = xLen < yLen ? xLen : yLen, i = 0; i < minLen; i++)
	{
		var xKid = xKids[i];
		_VirtualDom_diffHelp(xKid, yKids[i], patches, ++index);
		index += xKid.b || 0;
	}
}



// KEYED DIFF


function _VirtualDom_diffKeyedKids(xParent, yParent, patches, rootIndex)
{
	var localPatches = [];

	var changes = {}; // Dict String Entry
	var inserts = []; // Array { index : Int, entry : Entry }
	// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

	var xKids = xParent.e;
	var yKids = yParent.e;
	var xLen = xKids.length;
	var yLen = yKids.length;
	var xIndex = 0;
	var yIndex = 0;

	var index = rootIndex;

	while (xIndex < xLen && yIndex < yLen)
	{
		var x = xKids[xIndex];
		var y = yKids[yIndex];

		var xKey = x.a;
		var yKey = y.a;
		var xNode = x.b;
		var yNode = y.b;

		var newMatch = undefined;
		var oldMatch = undefined;

		// check if keys match

		if (xKey === yKey)
		{
			index++;
			_VirtualDom_diffHelp(xNode, yNode, localPatches, index);
			index += xNode.b || 0;

			xIndex++;
			yIndex++;
			continue;
		}

		// look ahead 1 to detect insertions and removals.

		var xNext = xKids[xIndex + 1];
		var yNext = yKids[yIndex + 1];

		if (xNext)
		{
			var xNextKey = xNext.a;
			var xNextNode = xNext.b;
			oldMatch = yKey === xNextKey;
		}

		if (yNext)
		{
			var yNextKey = yNext.a;
			var yNextNode = yNext.b;
			newMatch = xKey === yNextKey;
		}


		// swap x and y
		if (newMatch && oldMatch)
		{
			index++;
			_VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
			_VirtualDom_insertNode(changes, localPatches, xKey, yNode, yIndex, inserts);
			index += xNode.b || 0;

			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNextNode, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 2;
			continue;
		}

		// insert y
		if (newMatch)
		{
			index++;
			_VirtualDom_insertNode(changes, localPatches, yKey, yNode, yIndex, inserts);
			_VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
			index += xNode.b || 0;

			xIndex += 1;
			yIndex += 2;
			continue;
		}

		// remove x
		if (oldMatch)
		{
			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
			index += xNode.b || 0;

			index++;
			_VirtualDom_diffHelp(xNextNode, yNode, localPatches, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 1;
			continue;
		}

		// remove x, insert y
		if (xNext && xNextKey === yNextKey)
		{
			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
			_VirtualDom_insertNode(changes, localPatches, yKey, yNode, yIndex, inserts);
			index += xNode.b || 0;

			index++;
			_VirtualDom_diffHelp(xNextNode, yNextNode, localPatches, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 2;
			continue;
		}

		break;
	}

	// eat up any remaining nodes with removeNode and insertNode

	while (xIndex < xLen)
	{
		index++;
		var x = xKids[xIndex];
		var xNode = x.b;
		_VirtualDom_removeNode(changes, localPatches, x.a, xNode, index);
		index += xNode.b || 0;
		xIndex++;
	}

	while (yIndex < yLen)
	{
		var endInserts = endInserts || [];
		var y = yKids[yIndex];
		_VirtualDom_insertNode(changes, localPatches, y.a, y.b, undefined, endInserts);
		yIndex++;
	}

	if (localPatches.length > 0 || inserts.length > 0 || endInserts)
	{
		_VirtualDom_pushPatch(patches, 8, rootIndex, {
			w: localPatches,
			x: inserts,
			y: endInserts
		});
	}
}



// CHANGES FROM KEYED DIFF


var _VirtualDom_POSTFIX = '_elmW6BL';


function _VirtualDom_insertNode(changes, localPatches, key, vnode, yIndex, inserts)
{
	var entry = changes[key];

	// never seen this key before
	if (!entry)
	{
		entry = {
			c: 0,
			z: vnode,
			r: yIndex,
			s: undefined
		};

		inserts.push({ r: yIndex, A: entry });
		changes[key] = entry;

		return;
	}

	// this key was removed earlier, a match!
	if (entry.c === 1)
	{
		inserts.push({ r: yIndex, A: entry });

		entry.c = 2;
		var subPatches = [];
		_VirtualDom_diffHelp(entry.z, vnode, subPatches, entry.r);
		entry.r = yIndex;
		entry.s.s = {
			w: subPatches,
			A: entry
		};

		return;
	}

	// this key has already been inserted or moved, a duplicate!
	_VirtualDom_insertNode(changes, localPatches, key + _VirtualDom_POSTFIX, vnode, yIndex, inserts);
}


function _VirtualDom_removeNode(changes, localPatches, key, vnode, index)
{
	var entry = changes[key];

	// never seen this key before
	if (!entry)
	{
		var patch = _VirtualDom_pushPatch(localPatches, 9, index, undefined);

		changes[key] = {
			c: 1,
			z: vnode,
			r: index,
			s: patch
		};

		return;
	}

	// this key was inserted earlier, a match!
	if (entry.c === 0)
	{
		entry.c = 2;
		var subPatches = [];
		_VirtualDom_diffHelp(vnode, entry.z, subPatches, index);

		_VirtualDom_pushPatch(localPatches, 9, index, {
			w: subPatches,
			A: entry
		});

		return;
	}

	// this key has already been removed or moved, a duplicate!
	_VirtualDom_removeNode(changes, localPatches, key + _VirtualDom_POSTFIX, vnode, index);
}



// ADD DOM NODES
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function _VirtualDom_addDomNodes(domNode, vNode, patches, eventNode)
{
	_VirtualDom_addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.b, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function _VirtualDom_addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.r;

	while (index === low)
	{
		var patchType = patch.$;

		if (patchType === 1)
		{
			_VirtualDom_addDomNodes(domNode, vNode.k, patch.s, eventNode);
		}
		else if (patchType === 8)
		{
			patch.t = domNode;
			patch.u = eventNode;

			var subPatches = patch.s.w;
			if (subPatches.length > 0)
			{
				_VirtualDom_addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
			}
		}
		else if (patchType === 9)
		{
			patch.t = domNode;
			patch.u = eventNode;

			var data = patch.s;
			if (data)
			{
				data.A.s = domNode;
				var subPatches = data.w;
				if (subPatches.length > 0)
				{
					_VirtualDom_addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			}
		}
		else
		{
			patch.t = domNode;
			patch.u = eventNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.r) > high)
		{
			return i;
		}
	}

	var tag = vNode.$;

	if (tag === 4)
	{
		var subNode = vNode.k;

		while (subNode.$ === 4)
		{
			subNode = subNode.k;
		}

		return _VirtualDom_addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);
	}

	// tag must be 1 or 2 at this point

	var vKids = vNode.e;
	var childNodes = domNode.childNodes;
	for (var j = 0; j < vKids.length; j++)
	{
		low++;
		var vKid = tag === 1 ? vKids[j] : vKids[j].b;
		var nextLow = low + (vKid.b || 0);
		if (low <= index && index <= nextLow)
		{
			i = _VirtualDom_addDomNodesHelp(childNodes[j], vKid, patches, i, low, nextLow, eventNode);
			if (!(patch = patches[i]) || (index = patch.r) > high)
			{
				return i;
			}
		}
		low = nextLow;
	}
	return i;
}



// APPLY PATCHES


function _VirtualDom_applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	if (patches.length === 0)
	{
		return rootDomNode;
	}

	_VirtualDom_addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
	return _VirtualDom_applyPatchesHelp(rootDomNode, patches);
}

function _VirtualDom_applyPatchesHelp(rootDomNode, patches)
{
	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.t
		var newNode = _VirtualDom_applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}

function _VirtualDom_applyPatch(domNode, patch)
{
	switch (patch.$)
	{
		case 0:
			return _VirtualDom_applyPatchRedraw(domNode, patch.s, patch.u);

		case 4:
			_VirtualDom_applyFacts(domNode, patch.u, patch.s);
			return domNode;

		case 3:
			domNode.replaceData(0, domNode.length, patch.s);
			return domNode;

		case 1:
			return _VirtualDom_applyPatchesHelp(domNode, patch.s);

		case 2:
			if (domNode.elm_event_node_ref)
			{
				domNode.elm_event_node_ref.j = patch.s;
			}
			else
			{
				domNode.elm_event_node_ref = { j: patch.s, p: patch.u };
			}
			return domNode;

		case 6:
			var data = patch.s;
			for (var i = 0; i < data.i; i++)
			{
				domNode.removeChild(domNode.childNodes[data.v]);
			}
			return domNode;

		case 7:
			var data = patch.s;
			var kids = data.e;
			var i = data.v;
			var theEnd = domNode.childNodes[i];
			for (; i < kids.length; i++)
			{
				domNode.insertBefore(_VirtualDom_render(kids[i], patch.u), theEnd);
			}
			return domNode;

		case 9:
			var data = patch.s;
			if (!data)
			{
				domNode.parentNode.removeChild(domNode);
				return domNode;
			}
			var entry = data.A;
			if (typeof entry.r !== 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
			}
			entry.s = _VirtualDom_applyPatchesHelp(domNode, data.w);
			return domNode;

		case 8:
			return _VirtualDom_applyPatchReorder(domNode, patch);

		case 5:
			return patch.s(domNode);

		default:
			_Debug_crash(10); // 'Ran into an unknown patch!'
	}
}


function _VirtualDom_applyPatchRedraw(domNode, vNode, eventNode)
{
	var parentNode = domNode.parentNode;
	var newNode = _VirtualDom_render(vNode, eventNode);

	if (!newNode.elm_event_node_ref)
	{
		newNode.elm_event_node_ref = domNode.elm_event_node_ref;
	}

	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function _VirtualDom_applyPatchReorder(domNode, patch)
{
	var data = patch.s;

	// remove end inserts
	var frag = _VirtualDom_applyPatchReorderEndInsertsHelp(data.y, patch);

	// removals
	domNode = _VirtualDom_applyPatchesHelp(domNode, data.w);

	// inserts
	var inserts = data.x;
	for (var i = 0; i < inserts.length; i++)
	{
		var insert = inserts[i];
		var entry = insert.A;
		var node = entry.c === 2
			? entry.s
			: _VirtualDom_render(entry.z, patch.u);
		domNode.insertBefore(node, domNode.childNodes[insert.r]);
	}

	// add end inserts
	if (frag)
	{
		_VirtualDom_appendChild(domNode, frag);
	}

	return domNode;
}


function _VirtualDom_applyPatchReorderEndInsertsHelp(endInserts, patch)
{
	if (!endInserts)
	{
		return;
	}

	var frag = _VirtualDom_doc.createDocumentFragment();
	for (var i = 0; i < endInserts.length; i++)
	{
		var insert = endInserts[i];
		var entry = insert.A;
		_VirtualDom_appendChild(frag, entry.c === 2
			? entry.s
			: _VirtualDom_render(entry.z, patch.u)
		);
	}
	return frag;
}


function _VirtualDom_virtualize(node)
{
	// TEXT NODES

	if (node.nodeType === 3)
	{
		return _VirtualDom_text(node.textContent);
	}


	// WEIRD NODES

	if (node.nodeType !== 1)
	{
		return _VirtualDom_text('');
	}


	// ELEMENT NODES

	var attrList = _List_Nil;
	var attrs = node.attributes;
	for (var i = attrs.length; i--; )
	{
		var attr = attrs[i];
		var name = attr.name;
		var value = attr.value;
		attrList = _List_Cons( A2(_VirtualDom_attribute, name, value), attrList );
	}

	var tag = node.tagName.toLowerCase();
	var kidList = _List_Nil;
	var kids = node.childNodes;

	for (var i = kids.length; i--; )
	{
		kidList = _List_Cons(_VirtualDom_virtualize(kids[i]), kidList);
	}
	return A3(_VirtualDom_node, tag, attrList, kidList);
}

function _VirtualDom_dekey(keyedNode)
{
	var keyedKids = keyedNode.e;
	var len = keyedKids.length;
	var kids = new Array(len);
	for (var i = 0; i < len; i++)
	{
		kids[i] = keyedKids[i].b;
	}

	return {
		$: 1,
		c: keyedNode.c,
		d: keyedNode.d,
		e: kids,
		f: keyedNode.f,
		b: keyedNode.b
	};
}




// ELEMENT


var _Debugger_element;

var _Browser_element = _Debugger_element || F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.init,
		impl.update,
		impl.subscriptions,
		function(sendToApp, initialModel) {
			var view = impl.view;
			/**_UNUSED/
			var domNode = args['node'];
			//*/
			/**/
			var domNode = args && args['node'] ? args['node'] : _Debug_crash(0);
			//*/
			var currNode = _VirtualDom_virtualize(domNode);

			return _Browser_makeAnimator(initialModel, function(model)
			{
				var nextNode = view(model);
				var patches = _VirtualDom_diff(currNode, nextNode);
				domNode = _VirtualDom_applyPatches(domNode, currNode, patches, sendToApp);
				currNode = nextNode;
			});
		}
	);
});



// DOCUMENT


var _Debugger_document;

var _Browser_document = _Debugger_document || F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.init,
		impl.update,
		impl.subscriptions,
		function(sendToApp, initialModel) {
			var divertHrefToApp = impl.setup && impl.setup(sendToApp)
			var view = impl.view;
			var title = _VirtualDom_doc.title;
			var bodyNode = _VirtualDom_doc.body;
			var currNode = _VirtualDom_virtualize(bodyNode);
			return _Browser_makeAnimator(initialModel, function(model)
			{
				_VirtualDom_divertHrefToApp = divertHrefToApp;
				var doc = view(model);
				var nextNode = _VirtualDom_node('body')(_List_Nil)(doc.body);
				var patches = _VirtualDom_diff(currNode, nextNode);
				bodyNode = _VirtualDom_applyPatches(bodyNode, currNode, patches, sendToApp);
				currNode = nextNode;
				_VirtualDom_divertHrefToApp = 0;
				(title !== doc.title) && (_VirtualDom_doc.title = title = doc.title);
			});
		}
	);
});



// ANIMATION


var _Browser_cancelAnimationFrame =
	typeof cancelAnimationFrame !== 'undefined'
		? cancelAnimationFrame
		: function(id) { clearTimeout(id); };

var _Browser_requestAnimationFrame =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(callback) { return setTimeout(callback, 1000 / 60); };


function _Browser_makeAnimator(model, draw)
{
	draw(model);

	var state = 0;

	function updateIfNeeded()
	{
		state = state === 1
			? 0
			: ( _Browser_requestAnimationFrame(updateIfNeeded), draw(model), 1 );
	}

	return function(nextModel, isSync)
	{
		model = nextModel;

		isSync
			? ( draw(model),
				state === 2 && (state = 1)
				)
			: ( state === 0 && _Browser_requestAnimationFrame(updateIfNeeded),
				state = 2
				);
	};
}



// APPLICATION


function _Browser_application(impl)
{
	var onUrlChange = impl.onUrlChange;
	var onUrlRequest = impl.onUrlRequest;
	var key = function() { key.a(onUrlChange(_Browser_getUrl())); };

	return _Browser_document({
		setup: function(sendToApp)
		{
			key.a = sendToApp;
			_Browser_window.addEventListener('popstate', key);
			_Browser_window.navigator.userAgent.indexOf('Trident') < 0 || _Browser_window.addEventListener('hashchange', key);

			return F2(function(domNode, event)
			{
				if (!event.ctrlKey && !event.metaKey && !event.shiftKey && event.button < 1 && !domNode.target && !domNode.hasAttribute('download'))
				{
					event.preventDefault();
					var href = domNode.href;
					var curr = _Browser_getUrl();
					var next = $elm$url$Url$fromString(href).a;
					sendToApp(onUrlRequest(
						(next
							&& curr.protocol === next.protocol
							&& curr.host === next.host
							&& curr.port_.a === next.port_.a
						)
							? $elm$browser$Browser$Internal(next)
							: $elm$browser$Browser$External(href)
					));
				}
			});
		},
		init: function(flags)
		{
			return A3(impl.init, flags, _Browser_getUrl(), key);
		},
		view: impl.view,
		update: impl.update,
		subscriptions: impl.subscriptions
	});
}

function _Browser_getUrl()
{
	return $elm$url$Url$fromString(_VirtualDom_doc.location.href).a || _Debug_crash(1);
}

var _Browser_go = F2(function(key, n)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		n && history.go(n);
		key();
	}));
});

var _Browser_pushUrl = F2(function(key, url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		history.pushState({}, '', url);
		key();
	}));
});

var _Browser_replaceUrl = F2(function(key, url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		history.replaceState({}, '', url);
		key();
	}));
});



// GLOBAL EVENTS


var _Browser_fakeNode = { addEventListener: function() {}, removeEventListener: function() {} };
var _Browser_doc = typeof document !== 'undefined' ? document : _Browser_fakeNode;
var _Browser_window = typeof window !== 'undefined' ? window : _Browser_fakeNode;

var _Browser_on = F3(function(node, eventName, sendToSelf)
{
	return _Scheduler_spawn(_Scheduler_binding(function(callback)
	{
		function handler(event)	{ _Scheduler_rawSpawn(sendToSelf(event)); }
		node.addEventListener(eventName, handler, _VirtualDom_passiveSupported && { passive: true });
		return function() { node.removeEventListener(eventName, handler); };
	}));
});

var _Browser_decodeEvent = F2(function(decoder, event)
{
	var result = _Json_runHelp(decoder, event);
	return $elm$core$Result$isOk(result) ? $elm$core$Maybe$Just(result.a) : $elm$core$Maybe$Nothing;
});



// PAGE VISIBILITY


function _Browser_visibilityInfo()
{
	return (typeof _VirtualDom_doc.hidden !== 'undefined')
		? { hidden: 'hidden', change: 'visibilitychange' }
		:
	(typeof _VirtualDom_doc.mozHidden !== 'undefined')
		? { hidden: 'mozHidden', change: 'mozvisibilitychange' }
		:
	(typeof _VirtualDom_doc.msHidden !== 'undefined')
		? { hidden: 'msHidden', change: 'msvisibilitychange' }
		:
	(typeof _VirtualDom_doc.webkitHidden !== 'undefined')
		? { hidden: 'webkitHidden', change: 'webkitvisibilitychange' }
		: { hidden: 'hidden', change: 'visibilitychange' };
}



// ANIMATION FRAMES


function _Browser_rAF()
{
	return _Scheduler_binding(function(callback)
	{
		var id = _Browser_requestAnimationFrame(function() {
			callback(_Scheduler_succeed(Date.now()));
		});

		return function() {
			_Browser_cancelAnimationFrame(id);
		};
	});
}


function _Browser_now()
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(Date.now()));
	});
}



// DOM STUFF


function _Browser_withNode(id, doStuff)
{
	return _Scheduler_binding(function(callback)
	{
		_Browser_requestAnimationFrame(function() {
			var node = document.getElementById(id);
			callback(node
				? _Scheduler_succeed(doStuff(node))
				: _Scheduler_fail($elm$browser$Browser$Dom$NotFound(id))
			);
		});
	});
}


function _Browser_withWindow(doStuff)
{
	return _Scheduler_binding(function(callback)
	{
		_Browser_requestAnimationFrame(function() {
			callback(_Scheduler_succeed(doStuff()));
		});
	});
}


// FOCUS and BLUR


var _Browser_call = F2(function(functionName, id)
{
	return _Browser_withNode(id, function(node) {
		node[functionName]();
		return _Utils_Tuple0;
	});
});



// WINDOW VIEWPORT


function _Browser_getViewport()
{
	return {
		scene: _Browser_getScene(),
		viewport: {
			x: _Browser_window.pageXOffset,
			y: _Browser_window.pageYOffset,
			width: _Browser_doc.documentElement.clientWidth,
			height: _Browser_doc.documentElement.clientHeight
		}
	};
}

function _Browser_getScene()
{
	var body = _Browser_doc.body;
	var elem = _Browser_doc.documentElement;
	return {
		width: Math.max(body.scrollWidth, body.offsetWidth, elem.scrollWidth, elem.offsetWidth, elem.clientWidth),
		height: Math.max(body.scrollHeight, body.offsetHeight, elem.scrollHeight, elem.offsetHeight, elem.clientHeight)
	};
}

var _Browser_setViewport = F2(function(x, y)
{
	return _Browser_withWindow(function()
	{
		_Browser_window.scroll(x, y);
		return _Utils_Tuple0;
	});
});



// ELEMENT VIEWPORT


function _Browser_getViewportOf(id)
{
	return _Browser_withNode(id, function(node)
	{
		return {
			scene: {
				width: node.scrollWidth,
				height: node.scrollHeight
			},
			viewport: {
				x: node.scrollLeft,
				y: node.scrollTop,
				width: node.clientWidth,
				height: node.clientHeight
			}
		};
	});
}


var _Browser_setViewportOf = F3(function(id, x, y)
{
	return _Browser_withNode(id, function(node)
	{
		node.scrollLeft = x;
		node.scrollTop = y;
		return _Utils_Tuple0;
	});
});



// ELEMENT


function _Browser_getElement(id)
{
	return _Browser_withNode(id, function(node)
	{
		var rect = node.getBoundingClientRect();
		var x = _Browser_window.pageXOffset;
		var y = _Browser_window.pageYOffset;
		return {
			scene: _Browser_getScene(),
			viewport: {
				x: x,
				y: y,
				width: _Browser_doc.documentElement.clientWidth,
				height: _Browser_doc.documentElement.clientHeight
			},
			element: {
				x: x + rect.left,
				y: y + rect.top,
				width: rect.width,
				height: rect.height
			}
		};
	});
}



// LOAD and RELOAD


function _Browser_reload(skipCache)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function(callback)
	{
		_VirtualDom_doc.location.reload(skipCache);
	}));
}

function _Browser_load(url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function(callback)
	{
		try
		{
			_Browser_window.location = url;
		}
		catch(err)
		{
			// Only Firefox can throw a NS_ERROR_MALFORMED_URI exception here.
			// Other browsers reload the page, so let's be consistent about that.
			_VirtualDom_doc.location.reload(false);
		}
	}));
}




// STRINGS


var _Parser_isSubString = F5(function(smallString, offset, row, col, bigString)
{
	var smallLength = smallString.length;
	var isGood = offset + smallLength <= bigString.length;

	for (var i = 0; isGood && i < smallLength; )
	{
		var code = bigString.charCodeAt(offset);
		isGood =
			smallString[i++] === bigString[offset++]
			&& (
				code === 0x000A /* \n */
					? ( row++, col=1 )
					: ( col++, (code & 0xF800) === 0xD800 ? smallString[i++] === bigString[offset++] : 1 )
			)
	}

	return _Utils_Tuple3(isGood ? offset : -1, row, col);
});



// CHARS


var _Parser_isSubChar = F3(function(predicate, offset, string)
{
	return (
		string.length <= offset
			? -1
			:
		(string.charCodeAt(offset) & 0xF800) === 0xD800
			? (predicate(_Utils_chr(string.substr(offset, 2))) ? offset + 2 : -1)
			:
		(predicate(_Utils_chr(string[offset]))
			? ((string[offset] === '\n') ? -2 : (offset + 1))
			: -1
		)
	);
});


var _Parser_isAsciiCode = F3(function(code, offset, string)
{
	return string.charCodeAt(offset) === code;
});



// NUMBERS


var _Parser_chompBase10 = F2(function(offset, string)
{
	for (; offset < string.length; offset++)
	{
		var code = string.charCodeAt(offset);
		if (code < 0x30 || 0x39 < code)
		{
			return offset;
		}
	}
	return offset;
});


var _Parser_consumeBase = F3(function(base, offset, string)
{
	for (var total = 0; offset < string.length; offset++)
	{
		var digit = string.charCodeAt(offset) - 0x30;
		if (digit < 0 || base <= digit) break;
		total = base * total + digit;
	}
	return _Utils_Tuple2(offset, total);
});


var _Parser_consumeBase16 = F2(function(offset, string)
{
	for (var total = 0; offset < string.length; offset++)
	{
		var code = string.charCodeAt(offset);
		if (0x30 <= code && code <= 0x39)
		{
			total = 16 * total + code - 0x30;
		}
		else if (0x41 <= code && code <= 0x46)
		{
			total = 16 * total + code - 55;
		}
		else if (0x61 <= code && code <= 0x66)
		{
			total = 16 * total + code - 87;
		}
		else
		{
			break;
		}
	}
	return _Utils_Tuple2(offset, total);
});



// FIND STRING


var _Parser_findSubString = F5(function(smallString, offset, row, col, bigString)
{
	var newOffset = bigString.indexOf(smallString, offset);
	var target = newOffset < 0 ? bigString.length : newOffset + smallString.length;

	while (offset < target)
	{
		var code = bigString.charCodeAt(offset++);
		code === 0x000A /* \n */
			? ( col=1, row++ )
			: ( col++, (code & 0xF800) === 0xD800 && offset++ )
	}

	return _Utils_Tuple3(newOffset, row, col);
});
var $elm$core$Basics$EQ = {$: 'EQ'};
var $elm$core$Basics$GT = {$: 'GT'};
var $elm$core$Basics$LT = {$: 'LT'};
var $elm$core$List$cons = _List_cons;
var $elm$core$Dict$foldr = F3(
	function (func, acc, t) {
		foldr:
		while (true) {
			if (t.$ === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var key = t.b;
				var value = t.c;
				var left = t.d;
				var right = t.e;
				var $temp$func = func,
					$temp$acc = A3(
					func,
					key,
					value,
					A3($elm$core$Dict$foldr, func, acc, right)),
					$temp$t = left;
				func = $temp$func;
				acc = $temp$acc;
				t = $temp$t;
				continue foldr;
			}
		}
	});
var $elm$core$Dict$toList = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return A2(
					$elm$core$List$cons,
					_Utils_Tuple2(key, value),
					list);
			}),
		_List_Nil,
		dict);
};
var $elm$core$Dict$keys = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return A2($elm$core$List$cons, key, keyList);
			}),
		_List_Nil,
		dict);
};
var $elm$core$Set$toList = function (_v0) {
	var dict = _v0.a;
	return $elm$core$Dict$keys(dict);
};
var $elm$core$Elm$JsArray$foldr = _JsArray_foldr;
var $elm$core$Array$foldr = F3(
	function (func, baseCase, _v0) {
		var tree = _v0.c;
		var tail = _v0.d;
		var helper = F2(
			function (node, acc) {
				if (node.$ === 'SubTree') {
					var subTree = node.a;
					return A3($elm$core$Elm$JsArray$foldr, helper, acc, subTree);
				} else {
					var values = node.a;
					return A3($elm$core$Elm$JsArray$foldr, func, acc, values);
				}
			});
		return A3(
			$elm$core$Elm$JsArray$foldr,
			helper,
			A3($elm$core$Elm$JsArray$foldr, func, baseCase, tail),
			tree);
	});
var $elm$core$Array$toList = function (array) {
	return A3($elm$core$Array$foldr, $elm$core$List$cons, _List_Nil, array);
};
var $elm$core$Result$Err = function (a) {
	return {$: 'Err', a: a};
};
var $elm$json$Json$Decode$Failure = F2(
	function (a, b) {
		return {$: 'Failure', a: a, b: b};
	});
var $elm$json$Json$Decode$Field = F2(
	function (a, b) {
		return {$: 'Field', a: a, b: b};
	});
var $elm$json$Json$Decode$Index = F2(
	function (a, b) {
		return {$: 'Index', a: a, b: b};
	});
var $elm$core$Result$Ok = function (a) {
	return {$: 'Ok', a: a};
};
var $elm$json$Json$Decode$OneOf = function (a) {
	return {$: 'OneOf', a: a};
};
var $elm$core$Basics$False = {$: 'False'};
var $elm$core$Basics$add = _Basics_add;
var $elm$core$Maybe$Just = function (a) {
	return {$: 'Just', a: a};
};
var $elm$core$Maybe$Nothing = {$: 'Nothing'};
var $elm$core$String$all = _String_all;
var $elm$core$Basics$and = _Basics_and;
var $elm$core$Basics$append = _Utils_append;
var $elm$json$Json$Encode$encode = _Json_encode;
var $elm$core$String$fromInt = _String_fromNumber;
var $elm$core$String$join = F2(
	function (sep, chunks) {
		return A2(
			_String_join,
			sep,
			_List_toArray(chunks));
	});
var $elm$core$String$split = F2(
	function (sep, string) {
		return _List_fromArray(
			A2(_String_split, sep, string));
	});
var $elm$json$Json$Decode$indent = function (str) {
	return A2(
		$elm$core$String$join,
		'\n    ',
		A2($elm$core$String$split, '\n', str));
};
var $elm$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			if (!list.b) {
				return acc;
			} else {
				var x = list.a;
				var xs = list.b;
				var $temp$func = func,
					$temp$acc = A2(func, x, acc),
					$temp$list = xs;
				func = $temp$func;
				acc = $temp$acc;
				list = $temp$list;
				continue foldl;
			}
		}
	});
var $elm$core$List$length = function (xs) {
	return A3(
		$elm$core$List$foldl,
		F2(
			function (_v0, i) {
				return i + 1;
			}),
		0,
		xs);
};
var $elm$core$List$map2 = _List_map2;
var $elm$core$Basics$le = _Utils_le;
var $elm$core$Basics$sub = _Basics_sub;
var $elm$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_Utils_cmp(lo, hi) < 1) {
				var $temp$lo = lo,
					$temp$hi = hi - 1,
					$temp$list = A2($elm$core$List$cons, hi, list);
				lo = $temp$lo;
				hi = $temp$hi;
				list = $temp$list;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var $elm$core$List$range = F2(
	function (lo, hi) {
		return A3($elm$core$List$rangeHelp, lo, hi, _List_Nil);
	});
var $elm$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$map2,
			f,
			A2(
				$elm$core$List$range,
				0,
				$elm$core$List$length(xs) - 1),
			xs);
	});
var $elm$core$Char$toCode = _Char_toCode;
var $elm$core$Char$isLower = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (97 <= code) && (code <= 122);
};
var $elm$core$Char$isUpper = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (code <= 90) && (65 <= code);
};
var $elm$core$Basics$or = _Basics_or;
var $elm$core$Char$isAlpha = function (_char) {
	return $elm$core$Char$isLower(_char) || $elm$core$Char$isUpper(_char);
};
var $elm$core$Char$isDigit = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (code <= 57) && (48 <= code);
};
var $elm$core$Char$isAlphaNum = function (_char) {
	return $elm$core$Char$isLower(_char) || ($elm$core$Char$isUpper(_char) || $elm$core$Char$isDigit(_char));
};
var $elm$core$List$reverse = function (list) {
	return A3($elm$core$List$foldl, $elm$core$List$cons, _List_Nil, list);
};
var $elm$core$String$uncons = _String_uncons;
var $elm$json$Json$Decode$errorOneOf = F2(
	function (i, error) {
		return '\n\n(' + ($elm$core$String$fromInt(i + 1) + (') ' + $elm$json$Json$Decode$indent(
			$elm$json$Json$Decode$errorToString(error))));
	});
var $elm$json$Json$Decode$errorToString = function (error) {
	return A2($elm$json$Json$Decode$errorToStringHelp, error, _List_Nil);
};
var $elm$json$Json$Decode$errorToStringHelp = F2(
	function (error, context) {
		errorToStringHelp:
		while (true) {
			switch (error.$) {
				case 'Field':
					var f = error.a;
					var err = error.b;
					var isSimple = function () {
						var _v1 = $elm$core$String$uncons(f);
						if (_v1.$ === 'Nothing') {
							return false;
						} else {
							var _v2 = _v1.a;
							var _char = _v2.a;
							var rest = _v2.b;
							return $elm$core$Char$isAlpha(_char) && A2($elm$core$String$all, $elm$core$Char$isAlphaNum, rest);
						}
					}();
					var fieldName = isSimple ? ('.' + f) : ('[\'' + (f + '\']'));
					var $temp$error = err,
						$temp$context = A2($elm$core$List$cons, fieldName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 'Index':
					var i = error.a;
					var err = error.b;
					var indexName = '[' + ($elm$core$String$fromInt(i) + ']');
					var $temp$error = err,
						$temp$context = A2($elm$core$List$cons, indexName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 'OneOf':
					var errors = error.a;
					if (!errors.b) {
						return 'Ran into a Json.Decode.oneOf with no possibilities' + function () {
							if (!context.b) {
								return '!';
							} else {
								return ' at json' + A2(
									$elm$core$String$join,
									'',
									$elm$core$List$reverse(context));
							}
						}();
					} else {
						if (!errors.b.b) {
							var err = errors.a;
							var $temp$error = err,
								$temp$context = context;
							error = $temp$error;
							context = $temp$context;
							continue errorToStringHelp;
						} else {
							var starter = function () {
								if (!context.b) {
									return 'Json.Decode.oneOf';
								} else {
									return 'The Json.Decode.oneOf at json' + A2(
										$elm$core$String$join,
										'',
										$elm$core$List$reverse(context));
								}
							}();
							var introduction = starter + (' failed in the following ' + ($elm$core$String$fromInt(
								$elm$core$List$length(errors)) + ' ways:'));
							return A2(
								$elm$core$String$join,
								'\n\n',
								A2(
									$elm$core$List$cons,
									introduction,
									A2($elm$core$List$indexedMap, $elm$json$Json$Decode$errorOneOf, errors)));
						}
					}
				default:
					var msg = error.a;
					var json = error.b;
					var introduction = function () {
						if (!context.b) {
							return 'Problem with the given value:\n\n';
						} else {
							return 'Problem with the value at json' + (A2(
								$elm$core$String$join,
								'',
								$elm$core$List$reverse(context)) + ':\n\n    ');
						}
					}();
					return introduction + ($elm$json$Json$Decode$indent(
						A2($elm$json$Json$Encode$encode, 4, json)) + ('\n\n' + msg));
			}
		}
	});
var $elm$core$Array$branchFactor = 32;
var $elm$core$Array$Array_elm_builtin = F4(
	function (a, b, c, d) {
		return {$: 'Array_elm_builtin', a: a, b: b, c: c, d: d};
	});
var $elm$core$Elm$JsArray$empty = _JsArray_empty;
var $elm$core$Basics$ceiling = _Basics_ceiling;
var $elm$core$Basics$fdiv = _Basics_fdiv;
var $elm$core$Basics$logBase = F2(
	function (base, number) {
		return _Basics_log(number) / _Basics_log(base);
	});
var $elm$core$Basics$toFloat = _Basics_toFloat;
var $elm$core$Array$shiftStep = $elm$core$Basics$ceiling(
	A2($elm$core$Basics$logBase, 2, $elm$core$Array$branchFactor));
var $elm$core$Array$empty = A4($elm$core$Array$Array_elm_builtin, 0, $elm$core$Array$shiftStep, $elm$core$Elm$JsArray$empty, $elm$core$Elm$JsArray$empty);
var $elm$core$Elm$JsArray$initialize = _JsArray_initialize;
var $elm$core$Array$Leaf = function (a) {
	return {$: 'Leaf', a: a};
};
var $elm$core$Basics$apL = F2(
	function (f, x) {
		return f(x);
	});
var $elm$core$Basics$apR = F2(
	function (x, f) {
		return f(x);
	});
var $elm$core$Basics$eq = _Utils_equal;
var $elm$core$Basics$floor = _Basics_floor;
var $elm$core$Elm$JsArray$length = _JsArray_length;
var $elm$core$Basics$gt = _Utils_gt;
var $elm$core$Basics$max = F2(
	function (x, y) {
		return (_Utils_cmp(x, y) > 0) ? x : y;
	});
var $elm$core$Basics$mul = _Basics_mul;
var $elm$core$Array$SubTree = function (a) {
	return {$: 'SubTree', a: a};
};
var $elm$core$Elm$JsArray$initializeFromList = _JsArray_initializeFromList;
var $elm$core$Array$compressNodes = F2(
	function (nodes, acc) {
		compressNodes:
		while (true) {
			var _v0 = A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, nodes);
			var node = _v0.a;
			var remainingNodes = _v0.b;
			var newAcc = A2(
				$elm$core$List$cons,
				$elm$core$Array$SubTree(node),
				acc);
			if (!remainingNodes.b) {
				return $elm$core$List$reverse(newAcc);
			} else {
				var $temp$nodes = remainingNodes,
					$temp$acc = newAcc;
				nodes = $temp$nodes;
				acc = $temp$acc;
				continue compressNodes;
			}
		}
	});
var $elm$core$Tuple$first = function (_v0) {
	var x = _v0.a;
	return x;
};
var $elm$core$Array$treeFromBuilder = F2(
	function (nodeList, nodeListSize) {
		treeFromBuilder:
		while (true) {
			var newNodeSize = $elm$core$Basics$ceiling(nodeListSize / $elm$core$Array$branchFactor);
			if (newNodeSize === 1) {
				return A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, nodeList).a;
			} else {
				var $temp$nodeList = A2($elm$core$Array$compressNodes, nodeList, _List_Nil),
					$temp$nodeListSize = newNodeSize;
				nodeList = $temp$nodeList;
				nodeListSize = $temp$nodeListSize;
				continue treeFromBuilder;
			}
		}
	});
var $elm$core$Array$builderToArray = F2(
	function (reverseNodeList, builder) {
		if (!builder.nodeListSize) {
			return A4(
				$elm$core$Array$Array_elm_builtin,
				$elm$core$Elm$JsArray$length(builder.tail),
				$elm$core$Array$shiftStep,
				$elm$core$Elm$JsArray$empty,
				builder.tail);
		} else {
			var treeLen = builder.nodeListSize * $elm$core$Array$branchFactor;
			var depth = $elm$core$Basics$floor(
				A2($elm$core$Basics$logBase, $elm$core$Array$branchFactor, treeLen - 1));
			var correctNodeList = reverseNodeList ? $elm$core$List$reverse(builder.nodeList) : builder.nodeList;
			var tree = A2($elm$core$Array$treeFromBuilder, correctNodeList, builder.nodeListSize);
			return A4(
				$elm$core$Array$Array_elm_builtin,
				$elm$core$Elm$JsArray$length(builder.tail) + treeLen,
				A2($elm$core$Basics$max, 5, depth * $elm$core$Array$shiftStep),
				tree,
				builder.tail);
		}
	});
var $elm$core$Basics$idiv = _Basics_idiv;
var $elm$core$Basics$lt = _Utils_lt;
var $elm$core$Array$initializeHelp = F5(
	function (fn, fromIndex, len, nodeList, tail) {
		initializeHelp:
		while (true) {
			if (fromIndex < 0) {
				return A2(
					$elm$core$Array$builderToArray,
					false,
					{nodeList: nodeList, nodeListSize: (len / $elm$core$Array$branchFactor) | 0, tail: tail});
			} else {
				var leaf = $elm$core$Array$Leaf(
					A3($elm$core$Elm$JsArray$initialize, $elm$core$Array$branchFactor, fromIndex, fn));
				var $temp$fn = fn,
					$temp$fromIndex = fromIndex - $elm$core$Array$branchFactor,
					$temp$len = len,
					$temp$nodeList = A2($elm$core$List$cons, leaf, nodeList),
					$temp$tail = tail;
				fn = $temp$fn;
				fromIndex = $temp$fromIndex;
				len = $temp$len;
				nodeList = $temp$nodeList;
				tail = $temp$tail;
				continue initializeHelp;
			}
		}
	});
var $elm$core$Basics$remainderBy = _Basics_remainderBy;
var $elm$core$Array$initialize = F2(
	function (len, fn) {
		if (len <= 0) {
			return $elm$core$Array$empty;
		} else {
			var tailLen = len % $elm$core$Array$branchFactor;
			var tail = A3($elm$core$Elm$JsArray$initialize, tailLen, len - tailLen, fn);
			var initialFromIndex = (len - tailLen) - $elm$core$Array$branchFactor;
			return A5($elm$core$Array$initializeHelp, fn, initialFromIndex, len, _List_Nil, tail);
		}
	});
var $elm$core$Basics$True = {$: 'True'};
var $elm$core$Result$isOk = function (result) {
	if (result.$ === 'Ok') {
		return true;
	} else {
		return false;
	}
};
var $elm$json$Json$Decode$map = _Json_map1;
var $elm$json$Json$Decode$map2 = _Json_map2;
var $elm$json$Json$Decode$succeed = _Json_succeed;
var $elm$virtual_dom$VirtualDom$toHandlerInt = function (handler) {
	switch (handler.$) {
		case 'Normal':
			return 0;
		case 'MayStopPropagation':
			return 1;
		case 'MayPreventDefault':
			return 2;
		default:
			return 3;
	}
};
var $elm$browser$Browser$External = function (a) {
	return {$: 'External', a: a};
};
var $elm$browser$Browser$Internal = function (a) {
	return {$: 'Internal', a: a};
};
var $elm$core$Basics$identity = function (x) {
	return x;
};
var $elm$browser$Browser$Dom$NotFound = function (a) {
	return {$: 'NotFound', a: a};
};
var $elm$url$Url$Http = {$: 'Http'};
var $elm$url$Url$Https = {$: 'Https'};
var $elm$url$Url$Url = F6(
	function (protocol, host, port_, path, query, fragment) {
		return {fragment: fragment, host: host, path: path, port_: port_, protocol: protocol, query: query};
	});
var $elm$core$String$contains = _String_contains;
var $elm$core$String$length = _String_length;
var $elm$core$String$slice = _String_slice;
var $elm$core$String$dropLeft = F2(
	function (n, string) {
		return (n < 1) ? string : A3(
			$elm$core$String$slice,
			n,
			$elm$core$String$length(string),
			string);
	});
var $elm$core$String$indexes = _String_indexes;
var $elm$core$String$isEmpty = function (string) {
	return string === '';
};
var $elm$core$String$left = F2(
	function (n, string) {
		return (n < 1) ? '' : A3($elm$core$String$slice, 0, n, string);
	});
var $elm$core$String$toInt = _String_toInt;
var $elm$url$Url$chompBeforePath = F5(
	function (protocol, path, params, frag, str) {
		if ($elm$core$String$isEmpty(str) || A2($elm$core$String$contains, '@', str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, ':', str);
			if (!_v0.b) {
				return $elm$core$Maybe$Just(
					A6($elm$url$Url$Url, protocol, str, $elm$core$Maybe$Nothing, path, params, frag));
			} else {
				if (!_v0.b.b) {
					var i = _v0.a;
					var _v1 = $elm$core$String$toInt(
						A2($elm$core$String$dropLeft, i + 1, str));
					if (_v1.$ === 'Nothing') {
						return $elm$core$Maybe$Nothing;
					} else {
						var port_ = _v1;
						return $elm$core$Maybe$Just(
							A6(
								$elm$url$Url$Url,
								protocol,
								A2($elm$core$String$left, i, str),
								port_,
								path,
								params,
								frag));
					}
				} else {
					return $elm$core$Maybe$Nothing;
				}
			}
		}
	});
var $elm$url$Url$chompBeforeQuery = F4(
	function (protocol, params, frag, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '/', str);
			if (!_v0.b) {
				return A5($elm$url$Url$chompBeforePath, protocol, '/', params, frag, str);
			} else {
				var i = _v0.a;
				return A5(
					$elm$url$Url$chompBeforePath,
					protocol,
					A2($elm$core$String$dropLeft, i, str),
					params,
					frag,
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$url$Url$chompBeforeFragment = F3(
	function (protocol, frag, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '?', str);
			if (!_v0.b) {
				return A4($elm$url$Url$chompBeforeQuery, protocol, $elm$core$Maybe$Nothing, frag, str);
			} else {
				var i = _v0.a;
				return A4(
					$elm$url$Url$chompBeforeQuery,
					protocol,
					$elm$core$Maybe$Just(
						A2($elm$core$String$dropLeft, i + 1, str)),
					frag,
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$url$Url$chompAfterProtocol = F2(
	function (protocol, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '#', str);
			if (!_v0.b) {
				return A3($elm$url$Url$chompBeforeFragment, protocol, $elm$core$Maybe$Nothing, str);
			} else {
				var i = _v0.a;
				return A3(
					$elm$url$Url$chompBeforeFragment,
					protocol,
					$elm$core$Maybe$Just(
						A2($elm$core$String$dropLeft, i + 1, str)),
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$core$String$startsWith = _String_startsWith;
var $elm$url$Url$fromString = function (str) {
	return A2($elm$core$String$startsWith, 'http://', str) ? A2(
		$elm$url$Url$chompAfterProtocol,
		$elm$url$Url$Http,
		A2($elm$core$String$dropLeft, 7, str)) : (A2($elm$core$String$startsWith, 'https://', str) ? A2(
		$elm$url$Url$chompAfterProtocol,
		$elm$url$Url$Https,
		A2($elm$core$String$dropLeft, 8, str)) : $elm$core$Maybe$Nothing);
};
var $elm$core$Basics$never = function (_v0) {
	never:
	while (true) {
		var nvr = _v0.a;
		var $temp$_v0 = nvr;
		_v0 = $temp$_v0;
		continue never;
	}
};
var $elm$core$Task$Perform = function (a) {
	return {$: 'Perform', a: a};
};
var $elm$core$Task$succeed = _Scheduler_succeed;
var $elm$core$Task$init = $elm$core$Task$succeed(_Utils_Tuple0);
var $elm$core$List$foldrHelper = F4(
	function (fn, acc, ctr, ls) {
		if (!ls.b) {
			return acc;
		} else {
			var a = ls.a;
			var r1 = ls.b;
			if (!r1.b) {
				return A2(fn, a, acc);
			} else {
				var b = r1.a;
				var r2 = r1.b;
				if (!r2.b) {
					return A2(
						fn,
						a,
						A2(fn, b, acc));
				} else {
					var c = r2.a;
					var r3 = r2.b;
					if (!r3.b) {
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(fn, c, acc)));
					} else {
						var d = r3.a;
						var r4 = r3.b;
						var res = (ctr > 500) ? A3(
							$elm$core$List$foldl,
							fn,
							acc,
							$elm$core$List$reverse(r4)) : A4($elm$core$List$foldrHelper, fn, acc, ctr + 1, r4);
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(
									fn,
									c,
									A2(fn, d, res))));
					}
				}
			}
		}
	});
var $elm$core$List$foldr = F3(
	function (fn, acc, ls) {
		return A4($elm$core$List$foldrHelper, fn, acc, 0, ls);
	});
var $elm$core$List$map = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$foldr,
			F2(
				function (x, acc) {
					return A2(
						$elm$core$List$cons,
						f(x),
						acc);
				}),
			_List_Nil,
			xs);
	});
var $elm$core$Task$andThen = _Scheduler_andThen;
var $elm$core$Task$map = F2(
	function (func, taskA) {
		return A2(
			$elm$core$Task$andThen,
			function (a) {
				return $elm$core$Task$succeed(
					func(a));
			},
			taskA);
	});
var $elm$core$Task$map2 = F3(
	function (func, taskA, taskB) {
		return A2(
			$elm$core$Task$andThen,
			function (a) {
				return A2(
					$elm$core$Task$andThen,
					function (b) {
						return $elm$core$Task$succeed(
							A2(func, a, b));
					},
					taskB);
			},
			taskA);
	});
var $elm$core$Task$sequence = function (tasks) {
	return A3(
		$elm$core$List$foldr,
		$elm$core$Task$map2($elm$core$List$cons),
		$elm$core$Task$succeed(_List_Nil),
		tasks);
};
var $elm$core$Platform$sendToApp = _Platform_sendToApp;
var $elm$core$Task$spawnCmd = F2(
	function (router, _v0) {
		var task = _v0.a;
		return _Scheduler_spawn(
			A2(
				$elm$core$Task$andThen,
				$elm$core$Platform$sendToApp(router),
				task));
	});
var $elm$core$Task$onEffects = F3(
	function (router, commands, state) {
		return A2(
			$elm$core$Task$map,
			function (_v0) {
				return _Utils_Tuple0;
			},
			$elm$core$Task$sequence(
				A2(
					$elm$core$List$map,
					$elm$core$Task$spawnCmd(router),
					commands)));
	});
var $elm$core$Task$onSelfMsg = F3(
	function (_v0, _v1, _v2) {
		return $elm$core$Task$succeed(_Utils_Tuple0);
	});
var $elm$core$Task$cmdMap = F2(
	function (tagger, _v0) {
		var task = _v0.a;
		return $elm$core$Task$Perform(
			A2($elm$core$Task$map, tagger, task));
	});
_Platform_effectManagers['Task'] = _Platform_createManager($elm$core$Task$init, $elm$core$Task$onEffects, $elm$core$Task$onSelfMsg, $elm$core$Task$cmdMap);
var $elm$core$Task$command = _Platform_leaf('Task');
var $elm$core$Task$perform = F2(
	function (toMessage, task) {
		return $elm$core$Task$command(
			$elm$core$Task$Perform(
				A2($elm$core$Task$map, toMessage, task)));
	});
var $elm$browser$Browser$element = _Browser_element;
var $author$project$Model$Console = {$: 'Console'};
var $author$project$IMP$Syntax$VList = function (a) {
	return {$: 'VList', a: a};
};
var $elm$core$Dict$RBEmpty_elm_builtin = {$: 'RBEmpty_elm_builtin'};
var $elm$core$Dict$empty = $elm$core$Dict$RBEmpty_elm_builtin;
var $elm$core$Set$Set_elm_builtin = function (a) {
	return {$: 'Set_elm_builtin', a: a};
};
var $elm$core$Set$empty = $elm$core$Set$Set_elm_builtin($elm$core$Dict$empty);
var $elm$core$Basics$negate = function (n) {
	return -n;
};
var $author$project$Model$initModel = {
	code: '',
	codeBackup: '',
	contextDrafts: $elm$core$Dict$empty,
	currentContext: -1,
	editingInput: false,
	fillDraft: $elm$core$Dict$empty,
	fillSelected: $elm$core$Set$empty,
	filling: false,
	hbBackup: _List_Nil,
	holeBindings: _List_Nil,
	holeDict: $elm$core$Dict$empty,
	inputDraft: '',
	isOutputChange: false,
	mode: $author$project$Model$Console,
	oriHoles: _List_Nil,
	output: '',
	riStmts: _List_Nil,
	startStore: _List_fromArray(
		[
			_Utils_Tuple2(
			'input',
			$author$project$IMP$Syntax$VList(_List_Nil)),
			_Utils_Tuple2(
			'output',
			$author$project$IMP$Syntax$VList(_List_Nil))
		]),
	store: _List_Nil
};
var $elm$core$Platform$Cmd$batch = _Platform_batch;
var $elm$core$Platform$Cmd$none = $elm$core$Platform$Cmd$batch(_List_Nil);
var $author$project$Main$init = function (_v0) {
	return _Utils_Tuple2($author$project$Model$initModel, $elm$core$Platform$Cmd$none);
};
var $author$project$Model$OutputChange = function (a) {
	return {$: 'OutputChange', a: a};
};
var $author$project$Model$SaveCode = function (a) {
	return {$: 'SaveCode', a: a};
};
var $elm$core$Platform$Sub$batch = _Platform_batch;
var $elm$json$Json$Decode$string = _Json_decodeString;
var $author$project$Main$receiveCode = _Platform_incomingPort('receiveCode', $elm$json$Json$Decode$string);
var $author$project$Main$receiveOutput = _Platform_incomingPort('receiveOutput', $elm$json$Json$Decode$string);
var $author$project$Main$subscriptions = function (_v0) {
	return $elm$core$Platform$Sub$batch(
		_List_fromArray(
			[
				$author$project$Main$receiveCode($author$project$Model$SaveCode),
				$author$project$Main$receiveOutput($author$project$Model$OutputChange)
			]));
};
var $elm$core$Dict$Black = {$: 'Black'};
var $elm$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {$: 'RBNode_elm_builtin', a: a, b: b, c: c, d: d, e: e};
	});
var $elm$core$Dict$Red = {$: 'Red'};
var $elm$core$Dict$balance = F5(
	function (color, key, value, left, right) {
		if ((right.$ === 'RBNode_elm_builtin') && (right.a.$ === 'Red')) {
			var _v1 = right.a;
			var rK = right.b;
			var rV = right.c;
			var rLeft = right.d;
			var rRight = right.e;
			if ((left.$ === 'RBNode_elm_builtin') && (left.a.$ === 'Red')) {
				var _v3 = left.a;
				var lK = left.b;
				var lV = left.c;
				var lLeft = left.d;
				var lRight = left.e;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					$elm$core$Dict$Red,
					key,
					value,
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Black, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Black, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					color,
					rK,
					rV,
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, key, value, left, rLeft),
					rRight);
			}
		} else {
			if ((((left.$ === 'RBNode_elm_builtin') && (left.a.$ === 'Red')) && (left.d.$ === 'RBNode_elm_builtin')) && (left.d.a.$ === 'Red')) {
				var _v5 = left.a;
				var lK = left.b;
				var lV = left.c;
				var _v6 = left.d;
				var _v7 = _v6.a;
				var llK = _v6.b;
				var llV = _v6.c;
				var llLeft = _v6.d;
				var llRight = _v6.e;
				var lRight = left.e;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					$elm$core$Dict$Red,
					lK,
					lV,
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Black, llK, llV, llLeft, llRight),
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Black, key, value, lRight, right));
			} else {
				return A5($elm$core$Dict$RBNode_elm_builtin, color, key, value, left, right);
			}
		}
	});
var $elm$core$Basics$compare = _Utils_compare;
var $elm$core$Dict$insertHelp = F3(
	function (key, value, dict) {
		if (dict.$ === 'RBEmpty_elm_builtin') {
			return A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, key, value, $elm$core$Dict$RBEmpty_elm_builtin, $elm$core$Dict$RBEmpty_elm_builtin);
		} else {
			var nColor = dict.a;
			var nKey = dict.b;
			var nValue = dict.c;
			var nLeft = dict.d;
			var nRight = dict.e;
			var _v1 = A2($elm$core$Basics$compare, key, nKey);
			switch (_v1.$) {
				case 'LT':
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						A3($elm$core$Dict$insertHelp, key, value, nLeft),
						nRight);
				case 'EQ':
					return A5($elm$core$Dict$RBNode_elm_builtin, nColor, nKey, value, nLeft, nRight);
				default:
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						nLeft,
						A3($elm$core$Dict$insertHelp, key, value, nRight));
			}
		}
	});
var $elm$core$Dict$insert = F3(
	function (key, value, dict) {
		var _v0 = A3($elm$core$Dict$insertHelp, key, value, dict);
		if ((_v0.$ === 'RBNode_elm_builtin') && (_v0.a.$ === 'Red')) {
			var _v1 = _v0.a;
			var k = _v0.b;
			var v = _v0.c;
			var l = _v0.d;
			var r = _v0.e;
			return A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Black, k, v, l, r);
		} else {
			var x = _v0;
			return x;
		}
	});
var $elm$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			if (dict.$ === 'RBEmpty_elm_builtin') {
				return $elm$core$Maybe$Nothing;
			} else {
				var key = dict.b;
				var value = dict.c;
				var left = dict.d;
				var right = dict.e;
				var _v1 = A2($elm$core$Basics$compare, targetKey, key);
				switch (_v1.$) {
					case 'LT':
						var $temp$targetKey = targetKey,
							$temp$dict = left;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
					case 'EQ':
						return $elm$core$Maybe$Just(value);
					default:
						var $temp$targetKey = targetKey,
							$temp$dict = right;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
				}
			}
		}
	});
var $elm$core$Result$map = F2(
	function (func, ra) {
		if (ra.$ === 'Ok') {
			var a = ra.a;
			return $elm$core$Result$Ok(
				func(a));
		} else {
			var e = ra.a;
			return $elm$core$Result$Err(e);
		}
	});
var $elm$parser$Parser$ExpectingEnd = {$: 'ExpectingEnd'};
var $elm$parser$Parser$Advanced$Bad = F2(
	function (a, b) {
		return {$: 'Bad', a: a, b: b};
	});
var $elm$parser$Parser$Advanced$Good = F3(
	function (a, b, c) {
		return {$: 'Good', a: a, b: b, c: c};
	});
var $elm$parser$Parser$Advanced$Parser = function (a) {
	return {$: 'Parser', a: a};
};
var $elm$parser$Parser$Advanced$AddRight = F2(
	function (a, b) {
		return {$: 'AddRight', a: a, b: b};
	});
var $elm$parser$Parser$Advanced$DeadEnd = F4(
	function (row, col, problem, contextStack) {
		return {col: col, contextStack: contextStack, problem: problem, row: row};
	});
var $elm$parser$Parser$Advanced$Empty = {$: 'Empty'};
var $elm$parser$Parser$Advanced$fromState = F2(
	function (s, x) {
		return A2(
			$elm$parser$Parser$Advanced$AddRight,
			$elm$parser$Parser$Advanced$Empty,
			A4($elm$parser$Parser$Advanced$DeadEnd, s.row, s.col, x, s.context));
	});
var $elm$parser$Parser$Advanced$end = function (x) {
	return $elm$parser$Parser$Advanced$Parser(
		function (s) {
			return _Utils_eq(
				$elm$core$String$length(s.src),
				s.offset) ? A3($elm$parser$Parser$Advanced$Good, false, _Utils_Tuple0, s) : A2(
				$elm$parser$Parser$Advanced$Bad,
				false,
				A2($elm$parser$Parser$Advanced$fromState, s, x));
		});
};
var $elm$parser$Parser$end = $elm$parser$Parser$Advanced$end($elm$parser$Parser$ExpectingEnd);
var $elm$core$Basics$always = F2(
	function (a, _v0) {
		return a;
	});
var $elm$parser$Parser$Advanced$map2 = F3(
	function (func, _v0, _v1) {
		var parseA = _v0.a;
		var parseB = _v1.a;
		return $elm$parser$Parser$Advanced$Parser(
			function (s0) {
				var _v2 = parseA(s0);
				if (_v2.$ === 'Bad') {
					var p = _v2.a;
					var x = _v2.b;
					return A2($elm$parser$Parser$Advanced$Bad, p, x);
				} else {
					var p1 = _v2.a;
					var a = _v2.b;
					var s1 = _v2.c;
					var _v3 = parseB(s1);
					if (_v3.$ === 'Bad') {
						var p2 = _v3.a;
						var x = _v3.b;
						return A2($elm$parser$Parser$Advanced$Bad, p1 || p2, x);
					} else {
						var p2 = _v3.a;
						var b = _v3.b;
						var s2 = _v3.c;
						return A3(
							$elm$parser$Parser$Advanced$Good,
							p1 || p2,
							A2(func, a, b),
							s2);
					}
				}
			});
	});
var $elm$parser$Parser$Advanced$ignorer = F2(
	function (keepParser, ignoreParser) {
		return A3($elm$parser$Parser$Advanced$map2, $elm$core$Basics$always, keepParser, ignoreParser);
	});
var $elm$parser$Parser$ignorer = $elm$parser$Parser$Advanced$ignorer;
var $elm$parser$Parser$Advanced$keeper = F2(
	function (parseFunc, parseArg) {
		return A3($elm$parser$Parser$Advanced$map2, $elm$core$Basics$apL, parseFunc, parseArg);
	});
var $elm$parser$Parser$keeper = $elm$parser$Parser$Advanced$keeper;
var $elm$parser$Parser$Advanced$isSubChar = _Parser_isSubChar;
var $elm$parser$Parser$Advanced$chompWhileHelp = F5(
	function (isGood, offset, row, col, s0) {
		chompWhileHelp:
		while (true) {
			var newOffset = A3($elm$parser$Parser$Advanced$isSubChar, isGood, offset, s0.src);
			if (_Utils_eq(newOffset, -1)) {
				return A3(
					$elm$parser$Parser$Advanced$Good,
					_Utils_cmp(s0.offset, offset) < 0,
					_Utils_Tuple0,
					{col: col, context: s0.context, indent: s0.indent, offset: offset, row: row, src: s0.src});
			} else {
				if (_Utils_eq(newOffset, -2)) {
					var $temp$isGood = isGood,
						$temp$offset = offset + 1,
						$temp$row = row + 1,
						$temp$col = 1,
						$temp$s0 = s0;
					isGood = $temp$isGood;
					offset = $temp$offset;
					row = $temp$row;
					col = $temp$col;
					s0 = $temp$s0;
					continue chompWhileHelp;
				} else {
					var $temp$isGood = isGood,
						$temp$offset = newOffset,
						$temp$row = row,
						$temp$col = col + 1,
						$temp$s0 = s0;
					isGood = $temp$isGood;
					offset = $temp$offset;
					row = $temp$row;
					col = $temp$col;
					s0 = $temp$s0;
					continue chompWhileHelp;
				}
			}
		}
	});
var $elm$parser$Parser$Advanced$chompWhile = function (isGood) {
	return $elm$parser$Parser$Advanced$Parser(
		function (s) {
			return A5($elm$parser$Parser$Advanced$chompWhileHelp, isGood, s.offset, s.row, s.col, s);
		});
};
var $elm$parser$Parser$chompWhile = $elm$parser$Parser$Advanced$chompWhile;
var $elm$parser$Parser$Advanced$mapChompedString = F2(
	function (func, _v0) {
		var parse = _v0.a;
		return $elm$parser$Parser$Advanced$Parser(
			function (s0) {
				var _v1 = parse(s0);
				if (_v1.$ === 'Bad') {
					var p = _v1.a;
					var x = _v1.b;
					return A2($elm$parser$Parser$Advanced$Bad, p, x);
				} else {
					var p = _v1.a;
					var a = _v1.b;
					var s1 = _v1.c;
					return A3(
						$elm$parser$Parser$Advanced$Good,
						p,
						A2(
							func,
							A3($elm$core$String$slice, s0.offset, s1.offset, s0.src),
							a),
						s1);
				}
			});
	});
var $elm$parser$Parser$Advanced$getChompedString = function (parser) {
	return A2($elm$parser$Parser$Advanced$mapChompedString, $elm$core$Basics$always, parser);
};
var $elm$parser$Parser$getChompedString = $elm$parser$Parser$Advanced$getChompedString;
var $author$project$IMP$Parser_$isWhiteSpace = function (c) {
	return _Utils_eq(
		c,
		_Utils_chr(' ')) || (_Utils_eq(
		c,
		_Utils_chr('\n')) || _Utils_eq(
		c,
		_Utils_chr('\r')));
};
var $author$project$IMP$Parser_$mSpaces = $elm$parser$Parser$getChompedString(
	$elm$parser$Parser$chompWhile($author$project$IMP$Parser_$isWhiteSpace));
var $elm$parser$Parser$DeadEnd = F3(
	function (row, col, problem) {
		return {col: col, problem: problem, row: row};
	});
var $elm$parser$Parser$problemToDeadEnd = function (p) {
	return A3($elm$parser$Parser$DeadEnd, p.row, p.col, p.problem);
};
var $elm$parser$Parser$Advanced$bagToList = F2(
	function (bag, list) {
		bagToList:
		while (true) {
			switch (bag.$) {
				case 'Empty':
					return list;
				case 'AddRight':
					var bag1 = bag.a;
					var x = bag.b;
					var $temp$bag = bag1,
						$temp$list = A2($elm$core$List$cons, x, list);
					bag = $temp$bag;
					list = $temp$list;
					continue bagToList;
				default:
					var bag1 = bag.a;
					var bag2 = bag.b;
					var $temp$bag = bag1,
						$temp$list = A2($elm$parser$Parser$Advanced$bagToList, bag2, list);
					bag = $temp$bag;
					list = $temp$list;
					continue bagToList;
			}
		}
	});
var $elm$parser$Parser$Advanced$run = F2(
	function (_v0, src) {
		var parse = _v0.a;
		var _v1 = parse(
			{col: 1, context: _List_Nil, indent: 1, offset: 0, row: 1, src: src});
		if (_v1.$ === 'Good') {
			var value = _v1.b;
			return $elm$core$Result$Ok(value);
		} else {
			var bag = _v1.b;
			return $elm$core$Result$Err(
				A2($elm$parser$Parser$Advanced$bagToList, bag, _List_Nil));
		}
	});
var $elm$parser$Parser$run = F2(
	function (parser, source) {
		var _v0 = A2($elm$parser$Parser$Advanced$run, parser, source);
		if (_v0.$ === 'Ok') {
			var a = _v0.a;
			return $elm$core$Result$Ok(a);
		} else {
			var problems = _v0.a;
			return $elm$core$Result$Err(
				A2($elm$core$List$map, $elm$parser$Parser$problemToDeadEnd, problems));
		}
	});
var $elm$parser$Parser$Advanced$succeed = function (a) {
	return $elm$parser$Parser$Advanced$Parser(
		function (s) {
			return A3($elm$parser$Parser$Advanced$Good, false, a, s);
		});
};
var $elm$parser$Parser$succeed = $elm$parser$Parser$Advanced$succeed;
var $elm$parser$Parser$Done = function (a) {
	return {$: 'Done', a: a};
};
var $elm$parser$Parser$Loop = function (a) {
	return {$: 'Loop', a: a};
};
var $elm$parser$Parser$Advanced$lazy = function (thunk) {
	return $elm$parser$Parser$Advanced$Parser(
		function (s) {
			var _v0 = thunk(_Utils_Tuple0);
			var parse = _v0.a;
			return parse(s);
		});
};
var $elm$parser$Parser$lazy = $elm$parser$Parser$Advanced$lazy;
var $elm$parser$Parser$Advanced$loopHelp = F4(
	function (p, state, callback, s0) {
		loopHelp:
		while (true) {
			var _v0 = callback(state);
			var parse = _v0.a;
			var _v1 = parse(s0);
			if (_v1.$ === 'Good') {
				var p1 = _v1.a;
				var step = _v1.b;
				var s1 = _v1.c;
				if (step.$ === 'Loop') {
					var newState = step.a;
					var $temp$p = p || p1,
						$temp$state = newState,
						$temp$callback = callback,
						$temp$s0 = s1;
					p = $temp$p;
					state = $temp$state;
					callback = $temp$callback;
					s0 = $temp$s0;
					continue loopHelp;
				} else {
					var result = step.a;
					return A3($elm$parser$Parser$Advanced$Good, p || p1, result, s1);
				}
			} else {
				var p1 = _v1.a;
				var x = _v1.b;
				return A2($elm$parser$Parser$Advanced$Bad, p || p1, x);
			}
		}
	});
var $elm$parser$Parser$Advanced$loop = F2(
	function (state, callback) {
		return $elm$parser$Parser$Advanced$Parser(
			function (s) {
				return A4($elm$parser$Parser$Advanced$loopHelp, false, state, callback, s);
			});
	});
var $elm$parser$Parser$Advanced$map = F2(
	function (func, _v0) {
		var parse = _v0.a;
		return $elm$parser$Parser$Advanced$Parser(
			function (s0) {
				var _v1 = parse(s0);
				if (_v1.$ === 'Good') {
					var p = _v1.a;
					var a = _v1.b;
					var s1 = _v1.c;
					return A3(
						$elm$parser$Parser$Advanced$Good,
						p,
						func(a),
						s1);
				} else {
					var p = _v1.a;
					var x = _v1.b;
					return A2($elm$parser$Parser$Advanced$Bad, p, x);
				}
			});
	});
var $elm$parser$Parser$map = $elm$parser$Parser$Advanced$map;
var $elm$parser$Parser$Advanced$Done = function (a) {
	return {$: 'Done', a: a};
};
var $elm$parser$Parser$Advanced$Loop = function (a) {
	return {$: 'Loop', a: a};
};
var $elm$parser$Parser$toAdvancedStep = function (step) {
	if (step.$ === 'Loop') {
		var s = step.a;
		return $elm$parser$Parser$Advanced$Loop(s);
	} else {
		var a = step.a;
		return $elm$parser$Parser$Advanced$Done(a);
	}
};
var $elm$parser$Parser$loop = F2(
	function (state, callback) {
		return A2(
			$elm$parser$Parser$Advanced$loop,
			state,
			function (s) {
				return A2(
					$elm$parser$Parser$map,
					$elm$parser$Parser$toAdvancedStep,
					callback(s));
			});
	});
var $elm$parser$Parser$Advanced$Append = F2(
	function (a, b) {
		return {$: 'Append', a: a, b: b};
	});
var $elm$parser$Parser$Advanced$oneOfHelp = F3(
	function (s0, bag, parsers) {
		oneOfHelp:
		while (true) {
			if (!parsers.b) {
				return A2($elm$parser$Parser$Advanced$Bad, false, bag);
			} else {
				var parse = parsers.a.a;
				var remainingParsers = parsers.b;
				var _v1 = parse(s0);
				if (_v1.$ === 'Good') {
					var step = _v1;
					return step;
				} else {
					var step = _v1;
					var p = step.a;
					var x = step.b;
					if (p) {
						return step;
					} else {
						var $temp$s0 = s0,
							$temp$bag = A2($elm$parser$Parser$Advanced$Append, bag, x),
							$temp$parsers = remainingParsers;
						s0 = $temp$s0;
						bag = $temp$bag;
						parsers = $temp$parsers;
						continue oneOfHelp;
					}
				}
			}
		}
	});
var $elm$parser$Parser$Advanced$oneOf = function (parsers) {
	return $elm$parser$Parser$Advanced$Parser(
		function (s) {
			return A3($elm$parser$Parser$Advanced$oneOfHelp, s, $elm$parser$Parser$Advanced$Empty, parsers);
		});
};
var $elm$parser$Parser$oneOf = $elm$parser$Parser$Advanced$oneOf;
var $elm$parser$Parser$ExpectingSymbol = function (a) {
	return {$: 'ExpectingSymbol', a: a};
};
var $elm$parser$Parser$Advanced$Token = F2(
	function (a, b) {
		return {$: 'Token', a: a, b: b};
	});
var $elm$parser$Parser$Advanced$isSubString = _Parser_isSubString;
var $elm$core$Basics$not = _Basics_not;
var $elm$parser$Parser$Advanced$token = function (_v0) {
	var str = _v0.a;
	var expecting = _v0.b;
	var progress = !$elm$core$String$isEmpty(str);
	return $elm$parser$Parser$Advanced$Parser(
		function (s) {
			var _v1 = A5($elm$parser$Parser$Advanced$isSubString, str, s.offset, s.row, s.col, s.src);
			var newOffset = _v1.a;
			var newRow = _v1.b;
			var newCol = _v1.c;
			return _Utils_eq(newOffset, -1) ? A2(
				$elm$parser$Parser$Advanced$Bad,
				false,
				A2($elm$parser$Parser$Advanced$fromState, s, expecting)) : A3(
				$elm$parser$Parser$Advanced$Good,
				progress,
				_Utils_Tuple0,
				{col: newCol, context: s.context, indent: s.indent, offset: newOffset, row: newRow, src: s.src});
		});
};
var $elm$parser$Parser$Advanced$symbol = $elm$parser$Parser$Advanced$token;
var $elm$parser$Parser$symbol = function (str) {
	return $elm$parser$Parser$Advanced$symbol(
		A2(
			$elm$parser$Parser$Advanced$Token,
			str,
			$elm$parser$Parser$ExpectingSymbol(str)));
};
var $author$project$IMP$Syntax$VBool = function (a) {
	return {$: 'VBool', a: a};
};
var $elm$parser$Parser$ExpectingKeyword = function (a) {
	return {$: 'ExpectingKeyword', a: a};
};
var $elm$parser$Parser$Advanced$keyword = function (_v0) {
	var kwd = _v0.a;
	var expecting = _v0.b;
	var progress = !$elm$core$String$isEmpty(kwd);
	return $elm$parser$Parser$Advanced$Parser(
		function (s) {
			var _v1 = A5($elm$parser$Parser$Advanced$isSubString, kwd, s.offset, s.row, s.col, s.src);
			var newOffset = _v1.a;
			var newRow = _v1.b;
			var newCol = _v1.c;
			return (_Utils_eq(newOffset, -1) || (0 <= A3(
				$elm$parser$Parser$Advanced$isSubChar,
				function (c) {
					return $elm$core$Char$isAlphaNum(c) || _Utils_eq(
						c,
						_Utils_chr('_'));
				},
				newOffset,
				s.src))) ? A2(
				$elm$parser$Parser$Advanced$Bad,
				false,
				A2($elm$parser$Parser$Advanced$fromState, s, expecting)) : A3(
				$elm$parser$Parser$Advanced$Good,
				progress,
				_Utils_Tuple0,
				{col: newCol, context: s.context, indent: s.indent, offset: newOffset, row: newRow, src: s.src});
		});
};
var $elm$parser$Parser$keyword = function (kwd) {
	return $elm$parser$Parser$Advanced$keyword(
		A2(
			$elm$parser$Parser$Advanced$Token,
			kwd,
			$elm$parser$Parser$ExpectingKeyword(kwd)));
};
var $author$project$IMP$Parser_$vfalse = A2(
	$elm$parser$Parser$ignorer,
	A2(
		$elm$parser$Parser$ignorer,
		$elm$parser$Parser$succeed(
			$author$project$IMP$Syntax$VBool(false)),
		$elm$parser$Parser$keyword('false')),
	$author$project$IMP$Parser_$mSpaces);
var $author$project$IMP$Syntax$VHole = F2(
	function (a, b) {
		return {$: 'VHole', a: a, b: b};
	});
var $elm$parser$Parser$ExpectingInt = {$: 'ExpectingInt'};
var $elm$parser$Parser$Advanced$consumeBase = _Parser_consumeBase;
var $elm$parser$Parser$Advanced$consumeBase16 = _Parser_consumeBase16;
var $elm$parser$Parser$Advanced$bumpOffset = F2(
	function (newOffset, s) {
		return {col: s.col + (newOffset - s.offset), context: s.context, indent: s.indent, offset: newOffset, row: s.row, src: s.src};
	});
var $elm$parser$Parser$Advanced$chompBase10 = _Parser_chompBase10;
var $elm$parser$Parser$Advanced$isAsciiCode = _Parser_isAsciiCode;
var $elm$parser$Parser$Advanced$consumeExp = F2(
	function (offset, src) {
		if (A3($elm$parser$Parser$Advanced$isAsciiCode, 101, offset, src) || A3($elm$parser$Parser$Advanced$isAsciiCode, 69, offset, src)) {
			var eOffset = offset + 1;
			var expOffset = (A3($elm$parser$Parser$Advanced$isAsciiCode, 43, eOffset, src) || A3($elm$parser$Parser$Advanced$isAsciiCode, 45, eOffset, src)) ? (eOffset + 1) : eOffset;
			var newOffset = A2($elm$parser$Parser$Advanced$chompBase10, expOffset, src);
			return _Utils_eq(expOffset, newOffset) ? (-newOffset) : newOffset;
		} else {
			return offset;
		}
	});
var $elm$parser$Parser$Advanced$consumeDotAndExp = F2(
	function (offset, src) {
		return A3($elm$parser$Parser$Advanced$isAsciiCode, 46, offset, src) ? A2(
			$elm$parser$Parser$Advanced$consumeExp,
			A2($elm$parser$Parser$Advanced$chompBase10, offset + 1, src),
			src) : A2($elm$parser$Parser$Advanced$consumeExp, offset, src);
	});
var $elm$parser$Parser$Advanced$finalizeInt = F5(
	function (invalid, handler, startOffset, _v0, s) {
		var endOffset = _v0.a;
		var n = _v0.b;
		if (handler.$ === 'Err') {
			var x = handler.a;
			return A2(
				$elm$parser$Parser$Advanced$Bad,
				true,
				A2($elm$parser$Parser$Advanced$fromState, s, x));
		} else {
			var toValue = handler.a;
			return _Utils_eq(startOffset, endOffset) ? A2(
				$elm$parser$Parser$Advanced$Bad,
				_Utils_cmp(s.offset, startOffset) < 0,
				A2($elm$parser$Parser$Advanced$fromState, s, invalid)) : A3(
				$elm$parser$Parser$Advanced$Good,
				true,
				toValue(n),
				A2($elm$parser$Parser$Advanced$bumpOffset, endOffset, s));
		}
	});
var $elm$parser$Parser$Advanced$fromInfo = F4(
	function (row, col, x, context) {
		return A2(
			$elm$parser$Parser$Advanced$AddRight,
			$elm$parser$Parser$Advanced$Empty,
			A4($elm$parser$Parser$Advanced$DeadEnd, row, col, x, context));
	});
var $elm$core$String$toFloat = _String_toFloat;
var $elm$parser$Parser$Advanced$finalizeFloat = F6(
	function (invalid, expecting, intSettings, floatSettings, intPair, s) {
		var intOffset = intPair.a;
		var floatOffset = A2($elm$parser$Parser$Advanced$consumeDotAndExp, intOffset, s.src);
		if (floatOffset < 0) {
			return A2(
				$elm$parser$Parser$Advanced$Bad,
				true,
				A4($elm$parser$Parser$Advanced$fromInfo, s.row, s.col - (floatOffset + s.offset), invalid, s.context));
		} else {
			if (_Utils_eq(s.offset, floatOffset)) {
				return A2(
					$elm$parser$Parser$Advanced$Bad,
					false,
					A2($elm$parser$Parser$Advanced$fromState, s, expecting));
			} else {
				if (_Utils_eq(intOffset, floatOffset)) {
					return A5($elm$parser$Parser$Advanced$finalizeInt, invalid, intSettings, s.offset, intPair, s);
				} else {
					if (floatSettings.$ === 'Err') {
						var x = floatSettings.a;
						return A2(
							$elm$parser$Parser$Advanced$Bad,
							true,
							A2($elm$parser$Parser$Advanced$fromState, s, invalid));
					} else {
						var toValue = floatSettings.a;
						var _v1 = $elm$core$String$toFloat(
							A3($elm$core$String$slice, s.offset, floatOffset, s.src));
						if (_v1.$ === 'Nothing') {
							return A2(
								$elm$parser$Parser$Advanced$Bad,
								true,
								A2($elm$parser$Parser$Advanced$fromState, s, invalid));
						} else {
							var n = _v1.a;
							return A3(
								$elm$parser$Parser$Advanced$Good,
								true,
								toValue(n),
								A2($elm$parser$Parser$Advanced$bumpOffset, floatOffset, s));
						}
					}
				}
			}
		}
	});
var $elm$parser$Parser$Advanced$number = function (c) {
	return $elm$parser$Parser$Advanced$Parser(
		function (s) {
			if (A3($elm$parser$Parser$Advanced$isAsciiCode, 48, s.offset, s.src)) {
				var zeroOffset = s.offset + 1;
				var baseOffset = zeroOffset + 1;
				return A3($elm$parser$Parser$Advanced$isAsciiCode, 120, zeroOffset, s.src) ? A5(
					$elm$parser$Parser$Advanced$finalizeInt,
					c.invalid,
					c.hex,
					baseOffset,
					A2($elm$parser$Parser$Advanced$consumeBase16, baseOffset, s.src),
					s) : (A3($elm$parser$Parser$Advanced$isAsciiCode, 111, zeroOffset, s.src) ? A5(
					$elm$parser$Parser$Advanced$finalizeInt,
					c.invalid,
					c.octal,
					baseOffset,
					A3($elm$parser$Parser$Advanced$consumeBase, 8, baseOffset, s.src),
					s) : (A3($elm$parser$Parser$Advanced$isAsciiCode, 98, zeroOffset, s.src) ? A5(
					$elm$parser$Parser$Advanced$finalizeInt,
					c.invalid,
					c.binary,
					baseOffset,
					A3($elm$parser$Parser$Advanced$consumeBase, 2, baseOffset, s.src),
					s) : A6(
					$elm$parser$Parser$Advanced$finalizeFloat,
					c.invalid,
					c.expecting,
					c._int,
					c._float,
					_Utils_Tuple2(zeroOffset, 0),
					s)));
			} else {
				return A6(
					$elm$parser$Parser$Advanced$finalizeFloat,
					c.invalid,
					c.expecting,
					c._int,
					c._float,
					A3($elm$parser$Parser$Advanced$consumeBase, 10, s.offset, s.src),
					s);
			}
		});
};
var $elm$parser$Parser$Advanced$int = F2(
	function (expecting, invalid) {
		return $elm$parser$Parser$Advanced$number(
			{
				binary: $elm$core$Result$Err(invalid),
				expecting: expecting,
				_float: $elm$core$Result$Err(invalid),
				hex: $elm$core$Result$Err(invalid),
				_int: $elm$core$Result$Ok($elm$core$Basics$identity),
				invalid: invalid,
				octal: $elm$core$Result$Err(invalid)
			});
	});
var $elm$parser$Parser$int = A2($elm$parser$Parser$Advanced$int, $elm$parser$Parser$ExpectingInt, $elm$parser$Parser$ExpectingInt);
var $author$project$IMP$Parser_$holeId = $elm$parser$Parser$oneOf(
	_List_fromArray(
		[
			A2(
			$elm$parser$Parser$keeper,
			A2(
				$elm$parser$Parser$ignorer,
				$elm$parser$Parser$succeed($elm$core$Basics$negate),
				$elm$parser$Parser$symbol('-')),
			$elm$parser$Parser$int),
			$elm$parser$Parser$int
		]));
var $author$project$IMP$Syntax$HTmp = {$: 'HTmp'};
var $elm$parser$Parser$Advanced$andThen = F2(
	function (callback, _v0) {
		var parseA = _v0.a;
		return $elm$parser$Parser$Advanced$Parser(
			function (s0) {
				var _v1 = parseA(s0);
				if (_v1.$ === 'Bad') {
					var p = _v1.a;
					var x = _v1.b;
					return A2($elm$parser$Parser$Advanced$Bad, p, x);
				} else {
					var p1 = _v1.a;
					var a = _v1.b;
					var s1 = _v1.c;
					var _v2 = callback(a);
					var parseB = _v2.a;
					var _v3 = parseB(s1);
					if (_v3.$ === 'Bad') {
						var p2 = _v3.a;
						var x = _v3.b;
						return A2($elm$parser$Parser$Advanced$Bad, p1 || p2, x);
					} else {
						var p2 = _v3.a;
						var b = _v3.b;
						var s2 = _v3.c;
						return A3($elm$parser$Parser$Advanced$Good, p1 || p2, b, s2);
					}
				}
			});
	});
var $elm$parser$Parser$andThen = $elm$parser$Parser$Advanced$andThen;
var $author$project$IMP$Syntax$HOri = function (a) {
	return {$: 'HOri', a: a};
};
var $author$project$IMP$Syntax$HVar = function (a) {
	return {$: 'HVar', a: a};
};
var $elm$parser$Parser$ExpectingVariable = {$: 'ExpectingVariable'};
var $elm$core$Dict$member = F2(
	function (key, dict) {
		var _v0 = A2($elm$core$Dict$get, key, dict);
		if (_v0.$ === 'Just') {
			return true;
		} else {
			return false;
		}
	});
var $elm$core$Set$member = F2(
	function (key, _v0) {
		var dict = _v0.a;
		return A2($elm$core$Dict$member, key, dict);
	});
var $elm$parser$Parser$Advanced$varHelp = F7(
	function (isGood, offset, row, col, src, indent, context) {
		varHelp:
		while (true) {
			var newOffset = A3($elm$parser$Parser$Advanced$isSubChar, isGood, offset, src);
			if (_Utils_eq(newOffset, -1)) {
				return {col: col, context: context, indent: indent, offset: offset, row: row, src: src};
			} else {
				if (_Utils_eq(newOffset, -2)) {
					var $temp$isGood = isGood,
						$temp$offset = offset + 1,
						$temp$row = row + 1,
						$temp$col = 1,
						$temp$src = src,
						$temp$indent = indent,
						$temp$context = context;
					isGood = $temp$isGood;
					offset = $temp$offset;
					row = $temp$row;
					col = $temp$col;
					src = $temp$src;
					indent = $temp$indent;
					context = $temp$context;
					continue varHelp;
				} else {
					var $temp$isGood = isGood,
						$temp$offset = newOffset,
						$temp$row = row,
						$temp$col = col + 1,
						$temp$src = src,
						$temp$indent = indent,
						$temp$context = context;
					isGood = $temp$isGood;
					offset = $temp$offset;
					row = $temp$row;
					col = $temp$col;
					src = $temp$src;
					indent = $temp$indent;
					context = $temp$context;
					continue varHelp;
				}
			}
		}
	});
var $elm$parser$Parser$Advanced$variable = function (i) {
	return $elm$parser$Parser$Advanced$Parser(
		function (s) {
			var firstOffset = A3($elm$parser$Parser$Advanced$isSubChar, i.start, s.offset, s.src);
			if (_Utils_eq(firstOffset, -1)) {
				return A2(
					$elm$parser$Parser$Advanced$Bad,
					false,
					A2($elm$parser$Parser$Advanced$fromState, s, i.expecting));
			} else {
				var s1 = _Utils_eq(firstOffset, -2) ? A7($elm$parser$Parser$Advanced$varHelp, i.inner, s.offset + 1, s.row + 1, 1, s.src, s.indent, s.context) : A7($elm$parser$Parser$Advanced$varHelp, i.inner, firstOffset, s.row, s.col + 1, s.src, s.indent, s.context);
				var name = A3($elm$core$String$slice, s.offset, s1.offset, s.src);
				return A2($elm$core$Set$member, name, i.reserved) ? A2(
					$elm$parser$Parser$Advanced$Bad,
					false,
					A2($elm$parser$Parser$Advanced$fromState, s, i.expecting)) : A3($elm$parser$Parser$Advanced$Good, true, name, s1);
			}
		});
};
var $elm$parser$Parser$variable = function (i) {
	return $elm$parser$Parser$Advanced$variable(
		{expecting: $elm$parser$Parser$ExpectingVariable, inner: i.inner, reserved: i.reserved, start: i.start});
};
var $author$project$IMP$Parser_$holeVar = $elm$parser$Parser$variable(
	{
		inner: function (c) {
			return $elm$core$Char$isAlphaNum(c) || _Utils_eq(
				c,
				_Utils_chr('-'));
		},
		reserved: $elm$core$Set$empty,
		start: $elm$core$Char$isLower
	});
var $author$project$IMP$Parser_$holeNameBase = $elm$parser$Parser$oneOf(
	_List_fromArray(
		[
			A2(
			$elm$parser$Parser$keeper,
			$elm$parser$Parser$succeed($author$project$IMP$Syntax$HOri),
			$elm$parser$Parser$int),
			A2(
			$elm$parser$Parser$keeper,
			$elm$parser$Parser$succeed($author$project$IMP$Syntax$HVar),
			$author$project$IMP$Parser_$holeVar)
		]));
var $author$project$IMP$Syntax$HSub = F2(
	function (a, b) {
		return {$: 'HSub', a: a, b: b};
	});
var $author$project$IMP$Parser_$holeSubsHelper = function (acc) {
	return $elm$parser$Parser$oneOf(
		_List_fromArray(
			[
				A2(
				$elm$parser$Parser$keeper,
				A2(
					$elm$parser$Parser$ignorer,
					$elm$parser$Parser$succeed(
						function (n) {
							return $elm$parser$Parser$Loop(
								A2($author$project$IMP$Syntax$HSub, acc, n));
						}),
					$elm$parser$Parser$symbol('_')),
				$elm$parser$Parser$int),
				$elm$parser$Parser$succeed(
				$elm$parser$Parser$Done(acc))
			]));
};
var $author$project$IMP$Parser_$holeSubs = function (acc) {
	return A2($elm$parser$Parser$loop, acc, $author$project$IMP$Parser_$holeSubsHelper);
};
var $author$project$IMP$Parser_$holeNameAfterHash = A2($elm$parser$Parser$andThen, $author$project$IMP$Parser_$holeSubs, $author$project$IMP$Parser_$holeNameBase);
var $author$project$IMP$Parser_$holeName = $elm$parser$Parser$oneOf(
	_List_fromArray(
		[
			A2(
			$elm$parser$Parser$ignorer,
			$elm$parser$Parser$succeed($author$project$IMP$Syntax$HTmp),
			$elm$parser$Parser$symbol('*')),
			A2(
			$elm$parser$Parser$keeper,
			A2(
				$elm$parser$Parser$ignorer,
				$elm$parser$Parser$succeed($elm$core$Basics$identity),
				$elm$parser$Parser$symbol('#')),
			$author$project$IMP$Parser_$holeNameAfterHash)
		]));
var $author$project$IMP$Parser_$vhole = A2(
	$elm$parser$Parser$keeper,
	A2(
		$elm$parser$Parser$keeper,
		A2(
			$elm$parser$Parser$ignorer,
			A2(
				$elm$parser$Parser$ignorer,
				$elm$parser$Parser$succeed($author$project$IMP$Syntax$VHole),
				$elm$parser$Parser$symbol('{')),
			$author$project$IMP$Parser_$mSpaces),
		A2(
			$elm$parser$Parser$ignorer,
			A2(
				$elm$parser$Parser$ignorer,
				A2($elm$parser$Parser$ignorer, $author$project$IMP$Parser_$holeName, $author$project$IMP$Parser_$mSpaces),
				$elm$parser$Parser$symbol('@')),
			$author$project$IMP$Parser_$mSpaces)),
	A2(
		$elm$parser$Parser$ignorer,
		A2(
			$elm$parser$Parser$ignorer,
			A2($elm$parser$Parser$ignorer, $author$project$IMP$Parser_$holeId, $author$project$IMP$Parser_$mSpaces),
			$elm$parser$Parser$symbol('}')),
		$author$project$IMP$Parser_$mSpaces));
var $author$project$IMP$Syntax$VInt = function (a) {
	return {$: 'VInt', a: a};
};
var $author$project$IMP$Parser_$vint = $elm$parser$Parser$oneOf(
	_List_fromArray(
		[
			A2(
			$elm$parser$Parser$keeper,
			A2(
				$elm$parser$Parser$ignorer,
				$elm$parser$Parser$succeed(
					function (n) {
						return $author$project$IMP$Syntax$VInt(-n);
					}),
				$elm$parser$Parser$symbol('-')),
			A2($elm$parser$Parser$ignorer, $elm$parser$Parser$int, $author$project$IMP$Parser_$mSpaces)),
			A2(
			$elm$parser$Parser$keeper,
			$elm$parser$Parser$succeed($author$project$IMP$Syntax$VInt),
			A2($elm$parser$Parser$ignorer, $elm$parser$Parser$int, $author$project$IMP$Parser_$mSpaces))
		]));
var $author$project$IMP$Syntax$VString = function (a) {
	return {$: 'VString', a: a};
};
var $elm$parser$Parser$Advanced$findSubString = _Parser_findSubString;
var $elm$parser$Parser$Advanced$chompUntil = function (_v0) {
	var str = _v0.a;
	var expecting = _v0.b;
	return $elm$parser$Parser$Advanced$Parser(
		function (s) {
			var _v1 = A5($elm$parser$Parser$Advanced$findSubString, str, s.offset, s.row, s.col, s.src);
			var newOffset = _v1.a;
			var newRow = _v1.b;
			var newCol = _v1.c;
			return _Utils_eq(newOffset, -1) ? A2(
				$elm$parser$Parser$Advanced$Bad,
				false,
				A4($elm$parser$Parser$Advanced$fromInfo, newRow, newCol, expecting, s.context)) : A3(
				$elm$parser$Parser$Advanced$Good,
				_Utils_cmp(s.offset, newOffset) < 0,
				_Utils_Tuple0,
				{col: newCol, context: s.context, indent: s.indent, offset: newOffset, row: newRow, src: s.src});
		});
};
var $elm$parser$Parser$Expecting = function (a) {
	return {$: 'Expecting', a: a};
};
var $elm$parser$Parser$toToken = function (str) {
	return A2(
		$elm$parser$Parser$Advanced$Token,
		str,
		$elm$parser$Parser$Expecting(str));
};
var $elm$parser$Parser$chompUntil = function (str) {
	return $elm$parser$Parser$Advanced$chompUntil(
		$elm$parser$Parser$toToken(str));
};
var $author$project$IMP$Parser_$string_ = $elm$parser$Parser$getChompedString(
	$elm$parser$Parser$chompUntil('\"'));
var $author$project$IMP$Parser_$vstring = A2(
	$elm$parser$Parser$keeper,
	A2(
		$elm$parser$Parser$ignorer,
		$elm$parser$Parser$succeed($author$project$IMP$Syntax$VString),
		$elm$parser$Parser$symbol('\"')),
	A2(
		$elm$parser$Parser$ignorer,
		A2(
			$elm$parser$Parser$ignorer,
			$author$project$IMP$Parser_$string_,
			$elm$parser$Parser$symbol('\"')),
		$author$project$IMP$Parser_$mSpaces));
var $author$project$IMP$Parser_$vtrue = A2(
	$elm$parser$Parser$ignorer,
	A2(
		$elm$parser$Parser$ignorer,
		$elm$parser$Parser$succeed(
			$author$project$IMP$Syntax$VBool(true)),
		$elm$parser$Parser$keyword('true')),
	$author$project$IMP$Parser_$mSpaces);
var $author$project$IMP$Parser_$vlistTailHelper = function (revItems) {
	return $elm$parser$Parser$oneOf(
		_List_fromArray(
			[
				A2(
				$elm$parser$Parser$keeper,
				A2(
					$elm$parser$Parser$ignorer,
					A2(
						$elm$parser$Parser$ignorer,
						$elm$parser$Parser$succeed(
							function (v) {
								return $elm$parser$Parser$Loop(
									A2($elm$core$List$cons, v, revItems));
							}),
						$elm$parser$Parser$symbol(',')),
					$author$project$IMP$Parser_$mSpaces),
				$elm$parser$Parser$lazy(
					function (_v0) {
						return $author$project$IMP$Parser_$cyclic$value_();
					})),
				A2(
				$elm$parser$Parser$map,
				function (_v1) {
					return $elm$parser$Parser$Done(
						$elm$core$List$reverse(revItems));
				},
				$elm$parser$Parser$succeed(_Utils_Tuple0))
			]));
};
function $author$project$IMP$Parser_$cyclic$value_() {
	return $elm$parser$Parser$oneOf(
		_List_fromArray(
			[
				$author$project$IMP$Parser_$vhole,
				$author$project$IMP$Parser_$cyclic$vlist(),
				$author$project$IMP$Parser_$vstring,
				$author$project$IMP$Parser_$vtrue,
				$author$project$IMP$Parser_$vfalse,
				$author$project$IMP$Parser_$vint
			]));
}
function $author$project$IMP$Parser_$cyclic$vlist() {
	return A2(
		$elm$parser$Parser$keeper,
		A2(
			$elm$parser$Parser$ignorer,
			A2(
				$elm$parser$Parser$ignorer,
				$elm$parser$Parser$succeed($author$project$IMP$Syntax$VList),
				$elm$parser$Parser$symbol('[')),
			$author$project$IMP$Parser_$mSpaces),
		A2(
			$elm$parser$Parser$ignorer,
			A2(
				$elm$parser$Parser$ignorer,
				$author$project$IMP$Parser_$cyclic$vlistItems(),
				$elm$parser$Parser$symbol(']')),
			$author$project$IMP$Parser_$mSpaces));
}
function $author$project$IMP$Parser_$cyclic$vlistItems() {
	return $elm$parser$Parser$oneOf(
		_List_fromArray(
			[
				A2(
				$elm$parser$Parser$keeper,
				A2(
					$elm$parser$Parser$keeper,
					$elm$parser$Parser$succeed(
						F2(
							function (v, rest) {
								return A2($elm$core$List$cons, v, rest);
							})),
					$elm$parser$Parser$lazy(
						function (_v2) {
							return $author$project$IMP$Parser_$cyclic$value_();
						})),
				$author$project$IMP$Parser_$cyclic$vlistTail()),
				$elm$parser$Parser$succeed(_List_Nil)
			]));
}
function $author$project$IMP$Parser_$cyclic$vlistTail() {
	return A2($elm$parser$Parser$loop, _List_Nil, $author$project$IMP$Parser_$vlistTailHelper);
}
try {
	var $author$project$IMP$Parser_$value_ = $author$project$IMP$Parser_$cyclic$value_();
	$author$project$IMP$Parser_$cyclic$value_ = function () {
		return $author$project$IMP$Parser_$value_;
	};
	var $author$project$IMP$Parser_$vlist = $author$project$IMP$Parser_$cyclic$vlist();
	$author$project$IMP$Parser_$cyclic$vlist = function () {
		return $author$project$IMP$Parser_$vlist;
	};
	var $author$project$IMP$Parser_$vlistItems = $author$project$IMP$Parser_$cyclic$vlistItems();
	$author$project$IMP$Parser_$cyclic$vlistItems = function () {
		return $author$project$IMP$Parser_$vlistItems;
	};
	var $author$project$IMP$Parser_$vlistTail = $author$project$IMP$Parser_$cyclic$vlistTail();
	$author$project$IMP$Parser_$cyclic$vlistTail = function () {
		return $author$project$IMP$Parser_$vlistTail;
	};
} catch ($) {
	throw 'Some top-level definitions from `IMP.Parser_` are causing infinite recursion:\n\n  ┌─────┐\n  │    value_\n  │     ↓\n  │    vlist\n  │     ↓\n  │    vlistItems\n  │     ↓\n  │    vlistTail\n  │     ↓\n  │    vlistTailHelper\n  └─────┘\n\nThese errors are very tricky, so read https://elm-lang.org/0.19.1/bad-recursion to learn how to fix it!';}
var $author$project$IMP$Parser_$parseValue = $elm$parser$Parser$run(
	A2(
		$elm$parser$Parser$keeper,
		A2(
			$elm$parser$Parser$ignorer,
			$elm$parser$Parser$succeed($elm$core$Basics$identity),
			$author$project$IMP$Parser_$mSpaces),
		A2($elm$parser$Parser$ignorer, $author$project$IMP$Parser_$value_, $elm$parser$Parser$end)));
var $author$project$Controller$parseStoreDraftsWalk = F2(
	function (orig, drafts) {
		if (!orig.b) {
			return $elm$core$Result$Ok(_List_Nil);
		} else {
			var _v1 = orig.a;
			var x = _v1.a;
			var oldv = _v1.b;
			var rest = orig.b;
			var _v2 = A2($elm$core$Dict$get, x, drafts);
			if (_v2.$ === 'Just') {
				var src = _v2.a;
				var _v3 = $author$project$IMP$Parser_$parseValue(src);
				if (_v3.$ === 'Ok') {
					var v = _v3.a;
					return A2(
						$elm$core$Result$map,
						function (rest_) {
							return A2(
								$elm$core$List$cons,
								_Utils_Tuple2(x, v),
								rest_);
						},
						A2($author$project$Controller$parseStoreDraftsWalk, rest, drafts));
				} else {
					return $elm$core$Result$Err('Parse error in ' + x);
				}
			} else {
				return A2(
					$elm$core$Result$map,
					function (rest_) {
						return A2(
							$elm$core$List$cons,
							_Utils_Tuple2(x, oldv),
							rest_);
					},
					A2($author$project$Controller$parseStoreDraftsWalk, rest, drafts));
			}
		}
	});
var $author$project$Controller$parseStoreDrafts = F2(
	function (maybeStore, drafts) {
		if (maybeStore.$ === 'Nothing') {
			return $elm$core$Result$Err('No residual selected');
		} else {
			var orig = maybeStore.a;
			return A2($author$project$Controller$parseStoreDraftsWalk, orig, drafts);
		}
	});
var $elm$core$List$filter = F2(
	function (isGood, list) {
		return A3(
			$elm$core$List$foldr,
			F2(
				function (x, xs) {
					return isGood(x) ? A2($elm$core$List$cons, x, xs) : xs;
				}),
			_List_Nil,
			list);
	});
var $author$project$Controller$riStoreOf = F2(
	function (id, ris) {
		var _v0 = A2(
			$elm$core$List$filter,
			function (_v1) {
				var id_ = _v1.a;
				return _Utils_eq(id_, id);
			},
			ris);
		if (_v0.b) {
			var _v2 = _v0.a;
			var store = _v2.c;
			return $elm$core$Maybe$Just(store);
		} else {
			return $elm$core$Maybe$Nothing;
		}
	});
var $author$project$Controller$updateRiStore = F3(
	function (id, store, ris) {
		return A2(
			$elm$core$List$map,
			function (_v0) {
				var id_ = _v0.a;
				var s = _v0.b;
				var st = _v0.c;
				return _Utils_eq(id_, id) ? _Utils_Tuple3(id_, s, store) : _Utils_Tuple3(id_, s, st);
			},
			ris);
	});
var $author$project$Controller$contextValueChange = F3(
	function (x, text, model) {
		var drafts = A3($elm$core$Dict$insert, x, text, model.contextDrafts);
		var model1 = _Utils_update(
			model,
			{contextDrafts: drafts});
		var _v0 = A2(
			$author$project$Controller$parseStoreDrafts,
			A2($author$project$Controller$riStoreOf, model.currentContext, model.riStmts),
			drafts);
		if (_v0.$ === 'Ok') {
			var store = _v0.a;
			return _Utils_update(
				model1,
				{
					riStmts: A3($author$project$Controller$updateRiStore, model.currentContext, store, model.riStmts)
				});
		} else {
			return model1;
		}
	});
var $author$project$IMP$Syntax$EVar = F2(
	function (a, b) {
		return {$: 'EVar', a: a, b: b};
	});
var $author$project$IMP$Syntax$SAssign = F3(
	function (a, b, c) {
		return {$: 'SAssign', a: a, b: b, c: c};
	});
var $author$project$IMP$Syntax$SIf = F4(
	function (a, b, c, d) {
		return {$: 'SIf', a: a, b: b, c: c, d: d};
	});
var $author$project$IMP$Syntax$SPrint = F2(
	function (a, b) {
		return {$: 'SPrint', a: a, b: b};
	});
var $author$project$IMP$Syntax$SRead = F2(
	function (a, b) {
		return {$: 'SRead', a: a, b: b};
	});
var $author$project$IMP$Syntax$SSeq = F3(
	function (a, b, c) {
		return {$: 'SSeq', a: a, b: b, c: c};
	});
var $author$project$IMP$Syntax$SSkip = function (a) {
	return {$: 'SSkip', a: a};
};
var $author$project$IMP$Syntax$SWhile = F3(
	function (a, b, c) {
		return {$: 'SWhile', a: a, b: b, c: c};
	});
var $author$project$IMP$Syntax$VError = function (a) {
	return {$: 'VError', a: a};
};
var $author$project$IMP$Eval$defaultFwdRes = {readOnly: $elm$core$Set$empty, riStmts: _List_Nil, scount: 0, store: _List_Nil};
var $elm$core$Basics$ge = _Utils_ge;
var $elm$core$Basics$neq = _Utils_notEqual;
var $author$project$IMP$Eval$bop = F3(
	function (op, v1, v2) {
		switch (op) {
			case '+':
				var _v1 = _Utils_Tuple2(v1, v2);
				_v1$2:
				while (true) {
					_v1$3:
					while (true) {
						switch (_v1.a.$) {
							case 'VInt':
								switch (_v1.b.$) {
									case 'VInt':
										var i1 = _v1.a.a;
										var i2 = _v1.b.a;
										return $author$project$IMP$Syntax$VInt(i1 + i2);
									case 'VHole':
										break _v1$2;
									default:
										break _v1$3;
								}
							case 'VHole':
								var _v2 = _v1.a;
								return A2($author$project$IMP$Syntax$VHole, $author$project$IMP$Syntax$HTmp, -1);
							default:
								if (_v1.b.$ === 'VHole') {
									break _v1$2;
								} else {
									break _v1$3;
								}
						}
					}
					return $author$project$IMP$Syntax$VError('Unsupported operation');
				}
				var _v3 = _v1.b;
				return A2($author$project$IMP$Syntax$VHole, $author$project$IMP$Syntax$HTmp, -1);
			case '-':
				var _v4 = _Utils_Tuple2(v1, v2);
				_v4$2:
				while (true) {
					_v4$3:
					while (true) {
						switch (_v4.a.$) {
							case 'VInt':
								switch (_v4.b.$) {
									case 'VInt':
										var i1 = _v4.a.a;
										var i2 = _v4.b.a;
										return $author$project$IMP$Syntax$VInt(i1 - i2);
									case 'VHole':
										break _v4$2;
									default:
										break _v4$3;
								}
							case 'VHole':
								var _v5 = _v4.a;
								return A2($author$project$IMP$Syntax$VHole, $author$project$IMP$Syntax$HTmp, -1);
							default:
								if (_v4.b.$ === 'VHole') {
									break _v4$2;
								} else {
									break _v4$3;
								}
						}
					}
					return $author$project$IMP$Syntax$VError('Unsupported operation');
				}
				var _v6 = _v4.b;
				return A2($author$project$IMP$Syntax$VHole, $author$project$IMP$Syntax$HTmp, -1);
			case '*':
				var _v7 = _Utils_Tuple2(v1, v2);
				_v7$2:
				while (true) {
					_v7$3:
					while (true) {
						switch (_v7.a.$) {
							case 'VInt':
								switch (_v7.b.$) {
									case 'VInt':
										var i1 = _v7.a.a;
										var i2 = _v7.b.a;
										return $author$project$IMP$Syntax$VInt(i1 * i2);
									case 'VHole':
										break _v7$2;
									default:
										break _v7$3;
								}
							case 'VHole':
								var _v8 = _v7.a;
								return A2($author$project$IMP$Syntax$VHole, $author$project$IMP$Syntax$HTmp, -1);
							default:
								if (_v7.b.$ === 'VHole') {
									break _v7$2;
								} else {
									break _v7$3;
								}
						}
					}
					return $author$project$IMP$Syntax$VError('Unsupported operation');
				}
				var _v9 = _v7.b;
				return A2($author$project$IMP$Syntax$VHole, $author$project$IMP$Syntax$HTmp, -1);
			case '/':
				var _v10 = _Utils_Tuple2(v1, v2);
				_v10$2:
				while (true) {
					_v10$3:
					while (true) {
						switch (_v10.a.$) {
							case 'VInt':
								switch (_v10.b.$) {
									case 'VInt':
										var i1 = _v10.a.a;
										var i2 = _v10.b.a;
										return $author$project$IMP$Syntax$VInt((i1 / i2) | 0);
									case 'VHole':
										break _v10$2;
									default:
										break _v10$3;
								}
							case 'VHole':
								var _v11 = _v10.a;
								return A2($author$project$IMP$Syntax$VHole, $author$project$IMP$Syntax$HTmp, -1);
							default:
								if (_v10.b.$ === 'VHole') {
									break _v10$2;
								} else {
									break _v10$3;
								}
						}
					}
					return $author$project$IMP$Syntax$VError('Unsupported operation');
				}
				var _v12 = _v10.b;
				return A2($author$project$IMP$Syntax$VHole, $author$project$IMP$Syntax$HTmp, -1);
			case '==':
				var _v13 = _Utils_Tuple2(v1, v2);
				_v13$4:
				while (true) {
					_v13$5:
					while (true) {
						switch (_v13.a.$) {
							case 'VInt':
								switch (_v13.b.$) {
									case 'VInt':
										var i1 = _v13.a.a;
										var i2 = _v13.b.a;
										return $author$project$IMP$Syntax$VBool(
											_Utils_eq(i1, i2));
									case 'VHole':
										break _v13$4;
									default:
										break _v13$5;
								}
							case 'VBool':
								switch (_v13.b.$) {
									case 'VBool':
										var b1 = _v13.a.a;
										var b2 = _v13.b.a;
										return $author$project$IMP$Syntax$VBool(
											_Utils_eq(b1, b2));
									case 'VHole':
										break _v13$4;
									default:
										break _v13$5;
								}
							case 'VString':
								switch (_v13.b.$) {
									case 'VString':
										var s1 = _v13.a.a;
										var s2 = _v13.b.a;
										return $author$project$IMP$Syntax$VBool(
											_Utils_eq(s1, s2));
									case 'VHole':
										break _v13$4;
									default:
										break _v13$5;
								}
							case 'VHole':
								var _v14 = _v13.a;
								return A2($author$project$IMP$Syntax$VHole, $author$project$IMP$Syntax$HTmp, -1);
							default:
								if (_v13.b.$ === 'VHole') {
									break _v13$4;
								} else {
									break _v13$5;
								}
						}
					}
					return $author$project$IMP$Syntax$VError('Unsupported operation');
				}
				var _v15 = _v13.b;
				return A2($author$project$IMP$Syntax$VHole, $author$project$IMP$Syntax$HTmp, -1);
			case '!=':
				var _v16 = _Utils_Tuple2(v1, v2);
				_v16$4:
				while (true) {
					_v16$5:
					while (true) {
						switch (_v16.a.$) {
							case 'VInt':
								switch (_v16.b.$) {
									case 'VInt':
										var i1 = _v16.a.a;
										var i2 = _v16.b.a;
										return $author$project$IMP$Syntax$VBool(
											!_Utils_eq(i1, i2));
									case 'VHole':
										break _v16$4;
									default:
										break _v16$5;
								}
							case 'VBool':
								switch (_v16.b.$) {
									case 'VBool':
										var b1 = _v16.a.a;
										var b2 = _v16.b.a;
										return $author$project$IMP$Syntax$VBool(
											!_Utils_eq(b1, b2));
									case 'VHole':
										break _v16$4;
									default:
										break _v16$5;
								}
							case 'VString':
								switch (_v16.b.$) {
									case 'VString':
										var s1 = _v16.a.a;
										var s2 = _v16.b.a;
										return $author$project$IMP$Syntax$VBool(
											!_Utils_eq(s1, s2));
									case 'VHole':
										break _v16$4;
									default:
										break _v16$5;
								}
							case 'VHole':
								var _v17 = _v16.a;
								return A2($author$project$IMP$Syntax$VHole, $author$project$IMP$Syntax$HTmp, -1);
							default:
								if (_v16.b.$ === 'VHole') {
									break _v16$4;
								} else {
									break _v16$5;
								}
						}
					}
					return $author$project$IMP$Syntax$VError('Unsupported operation');
				}
				var _v18 = _v16.b;
				return A2($author$project$IMP$Syntax$VHole, $author$project$IMP$Syntax$HTmp, -1);
			case '<':
				var _v19 = _Utils_Tuple2(v1, v2);
				_v19$2:
				while (true) {
					_v19$3:
					while (true) {
						switch (_v19.a.$) {
							case 'VInt':
								switch (_v19.b.$) {
									case 'VInt':
										var i1 = _v19.a.a;
										var i2 = _v19.b.a;
										return $author$project$IMP$Syntax$VBool(
											_Utils_cmp(i1, i2) < 0);
									case 'VHole':
										break _v19$2;
									default:
										break _v19$3;
								}
							case 'VHole':
								var _v20 = _v19.a;
								return A2($author$project$IMP$Syntax$VHole, $author$project$IMP$Syntax$HTmp, -1);
							default:
								if (_v19.b.$ === 'VHole') {
									break _v19$2;
								} else {
									break _v19$3;
								}
						}
					}
					return $author$project$IMP$Syntax$VError('Unsupported operation');
				}
				var _v21 = _v19.b;
				return A2($author$project$IMP$Syntax$VHole, $author$project$IMP$Syntax$HTmp, -1);
			case '>':
				var _v22 = _Utils_Tuple2(v1, v2);
				_v22$2:
				while (true) {
					_v22$3:
					while (true) {
						switch (_v22.a.$) {
							case 'VInt':
								switch (_v22.b.$) {
									case 'VInt':
										var i1 = _v22.a.a;
										var i2 = _v22.b.a;
										return $author$project$IMP$Syntax$VBool(
											_Utils_cmp(i1, i2) > 0);
									case 'VHole':
										break _v22$2;
									default:
										break _v22$3;
								}
							case 'VHole':
								var _v23 = _v22.a;
								return A2($author$project$IMP$Syntax$VHole, $author$project$IMP$Syntax$HTmp, -1);
							default:
								if (_v22.b.$ === 'VHole') {
									break _v22$2;
								} else {
									break _v22$3;
								}
						}
					}
					return $author$project$IMP$Syntax$VError('Unsupported operation');
				}
				var _v24 = _v22.b;
				return A2($author$project$IMP$Syntax$VHole, $author$project$IMP$Syntax$HTmp, -1);
			case '<=':
				var _v25 = _Utils_Tuple2(v1, v2);
				_v25$2:
				while (true) {
					_v25$3:
					while (true) {
						switch (_v25.a.$) {
							case 'VInt':
								switch (_v25.b.$) {
									case 'VInt':
										var i1 = _v25.a.a;
										var i2 = _v25.b.a;
										return $author$project$IMP$Syntax$VBool(
											_Utils_cmp(i1, i2) < 1);
									case 'VHole':
										break _v25$2;
									default:
										break _v25$3;
								}
							case 'VHole':
								var _v26 = _v25.a;
								return A2($author$project$IMP$Syntax$VHole, $author$project$IMP$Syntax$HTmp, -1);
							default:
								if (_v25.b.$ === 'VHole') {
									break _v25$2;
								} else {
									break _v25$3;
								}
						}
					}
					return $author$project$IMP$Syntax$VError('Unsupported operation');
				}
				var _v27 = _v25.b;
				return A2($author$project$IMP$Syntax$VHole, $author$project$IMP$Syntax$HTmp, -1);
			case '>=':
				var _v28 = _Utils_Tuple2(v1, v2);
				_v28$2:
				while (true) {
					_v28$3:
					while (true) {
						switch (_v28.a.$) {
							case 'VInt':
								switch (_v28.b.$) {
									case 'VInt':
										var i1 = _v28.a.a;
										var i2 = _v28.b.a;
										return $author$project$IMP$Syntax$VBool(
											_Utils_cmp(i1, i2) > -1);
									case 'VHole':
										break _v28$2;
									default:
										break _v28$3;
								}
							case 'VHole':
								var _v29 = _v28.a;
								return A2($author$project$IMP$Syntax$VHole, $author$project$IMP$Syntax$HTmp, -1);
							default:
								if (_v28.b.$ === 'VHole') {
									break _v28$2;
								} else {
									break _v28$3;
								}
						}
					}
					return $author$project$IMP$Syntax$VError('Unsupported operation');
				}
				var _v30 = _v28.b;
				return A2($author$project$IMP$Syntax$VHole, $author$project$IMP$Syntax$HTmp, -1);
			case '&&':
				var _v31 = _Utils_Tuple2(v1, v2);
				_v31$0:
				while (true) {
					_v31$1:
					while (true) {
						_v31$3:
						while (true) {
							_v31$4:
							while (true) {
								_v31$5:
								while (true) {
									switch (_v31.a.$) {
										case 'VBool':
											switch (_v31.b.$) {
												case 'VBool':
													if (!_v31.a.a) {
														break _v31$0;
													} else {
														if (!_v31.b.a) {
															break _v31$1;
														} else {
															var b1 = _v31.a.a;
															var b2 = _v31.b.a;
															return $author$project$IMP$Syntax$VBool(b1 && b2);
														}
													}
												case 'VHole':
													if (!_v31.a.a) {
														break _v31$0;
													} else {
														break _v31$4;
													}
												default:
													if (!_v31.a.a) {
														break _v31$0;
													} else {
														break _v31$5;
													}
											}
										case 'VHole':
											switch (_v31.b.$) {
												case 'VBool':
													if (!_v31.b.a) {
														break _v31$1;
													} else {
														break _v31$3;
													}
												case 'VHole':
													break _v31$3;
												default:
													break _v31$3;
											}
										default:
											switch (_v31.b.$) {
												case 'VBool':
													if (!_v31.b.a) {
														break _v31$1;
													} else {
														break _v31$5;
													}
												case 'VHole':
													break _v31$4;
												default:
													break _v31$5;
											}
									}
								}
								return $author$project$IMP$Syntax$VError('Unsupported operation');
							}
							var _v33 = _v31.b;
							return A2($author$project$IMP$Syntax$VHole, $author$project$IMP$Syntax$HTmp, -1);
						}
						var _v32 = _v31.a;
						return A2($author$project$IMP$Syntax$VHole, $author$project$IMP$Syntax$HTmp, -1);
					}
					return $author$project$IMP$Syntax$VBool(false);
				}
				return $author$project$IMP$Syntax$VBool(false);
			case '||':
				var _v34 = _Utils_Tuple2(v1, v2);
				_v34$0:
				while (true) {
					_v34$1:
					while (true) {
						_v34$3:
						while (true) {
							_v34$4:
							while (true) {
								_v34$5:
								while (true) {
									switch (_v34.a.$) {
										case 'VBool':
											switch (_v34.b.$) {
												case 'VBool':
													if (_v34.a.a) {
														break _v34$0;
													} else {
														if (_v34.b.a) {
															break _v34$1;
														} else {
															var b1 = _v34.a.a;
															var b2 = _v34.b.a;
															return $author$project$IMP$Syntax$VBool(b1 || b2);
														}
													}
												case 'VHole':
													if (_v34.a.a) {
														break _v34$0;
													} else {
														break _v34$4;
													}
												default:
													if (_v34.a.a) {
														break _v34$0;
													} else {
														break _v34$5;
													}
											}
										case 'VHole':
											switch (_v34.b.$) {
												case 'VBool':
													if (_v34.b.a) {
														break _v34$1;
													} else {
														break _v34$3;
													}
												case 'VHole':
													break _v34$3;
												default:
													break _v34$3;
											}
										default:
											switch (_v34.b.$) {
												case 'VBool':
													if (_v34.b.a) {
														break _v34$1;
													} else {
														break _v34$5;
													}
												case 'VHole':
													break _v34$4;
												default:
													break _v34$5;
											}
									}
								}
								return $author$project$IMP$Syntax$VError('Unsupported operation');
							}
							var _v36 = _v34.b;
							return A2($author$project$IMP$Syntax$VHole, $author$project$IMP$Syntax$HTmp, -1);
						}
						var _v35 = _v34.a;
						return A2($author$project$IMP$Syntax$VHole, $author$project$IMP$Syntax$HTmp, -1);
					}
					return $author$project$IMP$Syntax$VBool(true);
				}
				return $author$project$IMP$Syntax$VBool(true);
			case '++':
				var _v37 = _Utils_Tuple2(v1, v2);
				_v37$3:
				while (true) {
					_v37$4:
					while (true) {
						switch (_v37.a.$) {
							case 'VString':
								switch (_v37.b.$) {
									case 'VString':
										var s1 = _v37.a.a;
										var s2 = _v37.b.a;
										return $author$project$IMP$Syntax$VString(
											_Utils_ap(s1, s2));
									case 'VHole':
										break _v37$3;
									default:
										break _v37$4;
								}
							case 'VList':
								switch (_v37.b.$) {
									case 'VList':
										var vs1 = _v37.a.a;
										var vs2 = _v37.b.a;
										return $author$project$IMP$Syntax$VList(
											_Utils_ap(vs1, vs2));
									case 'VHole':
										break _v37$3;
									default:
										break _v37$4;
								}
							case 'VHole':
								var _v38 = _v37.a;
								return A2($author$project$IMP$Syntax$VHole, $author$project$IMP$Syntax$HTmp, -1);
							default:
								if (_v37.b.$ === 'VHole') {
									break _v37$3;
								} else {
									break _v37$4;
								}
						}
					}
					return $author$project$IMP$Syntax$VError('Unsupported operation');
				}
				var _v39 = _v37.b;
				return A2($author$project$IMP$Syntax$VHole, $author$project$IMP$Syntax$HTmp, -1);
			default:
				return $author$project$IMP$Syntax$VError('Unsupported operation');
		}
	});
var $author$project$IMP$Eval$eraseHoleName = function (v) {
	if (v.$ === 'VHole') {
		return A2($author$project$IMP$Syntax$VHole, $author$project$IMP$Syntax$HTmp, -1);
	} else {
		return v;
	}
};
var $author$project$IMP$Utils$lookup = F2(
	function (x, store) {
		lookup:
		while (true) {
			if (store.b) {
				var _v1 = store.a;
				var x_ = _v1.a;
				var v = _v1.b;
				var rest = store.b;
				if (_Utils_eq(x, x_)) {
					return $elm$core$Maybe$Just(v);
				} else {
					var $temp$x = x,
						$temp$store = rest;
					x = $temp$x;
					store = $temp$store;
					continue lookup;
				}
			} else {
				return $elm$core$Maybe$Nothing;
			}
		}
	});
var $author$project$IMP$Utils$sameVars = F3(
	function (xs, s1, s2) {
		sameVars:
		while (true) {
			if (!xs.b) {
				return true;
			} else {
				var x = xs.a;
				var rest = xs.b;
				if (_Utils_eq(
					A2($author$project$IMP$Utils$lookup, x, s1),
					A2($author$project$IMP$Utils$lookup, x, s2))) {
					var $temp$xs = rest,
						$temp$s1 = s1,
						$temp$s2 = s2;
					xs = $temp$xs;
					s1 = $temp$s1;
					s2 = $temp$s2;
					continue sameVars;
				} else {
					return false;
				}
			}
		}
	});
var $author$project$IMP$Utils$isSameStore = F2(
	function (store1, store2) {
		return A3(
			$author$project$IMP$Utils$sameVars,
			A2($elm$core$List$map, $elm$core$Tuple$first, store1),
			store1,
			store2) && A3(
			$author$project$IMP$Utils$sameVars,
			A2($elm$core$List$map, $elm$core$Tuple$first, store2),
			store1,
			store2);
	});
var $author$project$IMP$Utils$lookupHB = F3(
	function (h, store, holeBindings) {
		lookupHB:
		while (true) {
			if (holeBindings.b) {
				var _v1 = holeBindings.a;
				var h_ = _v1.a;
				var store_ = _v1.b;
				var v = _v1.c;
				var rest = holeBindings.b;
				if (_Utils_eq(h, h_) && A2($author$project$IMP$Utils$isSameStore, store, store_)) {
					return $elm$core$Maybe$Just(v);
				} else {
					var $temp$h = h,
						$temp$store = store,
						$temp$holeBindings = rest;
					h = $temp$h;
					store = $temp$store;
					holeBindings = $temp$holeBindings;
					continue lookupHB;
				}
			} else {
				return $elm$core$Maybe$Nothing;
			}
		}
	});
var $author$project$IMP$Utils$nthValue = F2(
	function (vs, i) {
		nthValue:
		while (true) {
			if (i < 0) {
				return $author$project$IMP$Syntax$VError('Index out of range');
			} else {
				if (vs.b) {
					var v = vs.a;
					var rest = vs.b;
					if (!i) {
						return v;
					} else {
						var $temp$vs = rest,
							$temp$i = i - 1;
						vs = $temp$vs;
						i = $temp$i;
						continue nthValue;
					}
				} else {
					return $author$project$IMP$Syntax$VError('Index out of range');
				}
			}
		}
	});
var $author$project$IMP$Eval$eval = F3(
	function (store, holeBindings, expr) {
		return $author$project$IMP$Eval$eraseHoleName(
			A3($author$project$IMP$Eval$evalCore, store, holeBindings, expr));
	});
var $author$project$IMP$Eval$evalCore = F3(
	function (store, holeBindings, expr) {
		switch (expr.$) {
			case 'EVar':
				var x = expr.b;
				var _v1 = A2($author$project$IMP$Utils$lookup, x, store);
				if (_v1.$ === 'Just') {
					var v = _v1.a;
					return v;
				} else {
					return $author$project$IMP$Syntax$VError('Variable not found');
				}
			case 'EInt':
				var ws = expr.a;
				var i = expr.b;
				return $author$project$IMP$Syntax$VInt(i);
			case 'EBool':
				var ws = expr.a;
				var b = expr.b;
				return $author$project$IMP$Syntax$VBool(b);
			case 'EString':
				var ws = expr.a;
				var s = expr.b;
				return $author$project$IMP$Syntax$VString(s);
			case 'EHole':
				var ws = expr.a;
				var h = expr.b;
				var _v2 = A3($author$project$IMP$Utils$lookupHB, h, store, holeBindings);
				if (_v2.$ === 'Just') {
					var v = _v2.a;
					return v;
				} else {
					return A2($author$project$IMP$Syntax$VHole, $author$project$IMP$Syntax$HTmp, -1);
				}
			case 'Eop':
				var ws = expr.a;
				var op = expr.b;
				var e1 = expr.c;
				var e2 = expr.d;
				var v2 = A3($author$project$IMP$Eval$eval, store, holeBindings, e2);
				var v1 = A3($author$project$IMP$Eval$eval, store, holeBindings, e1);
				return A3($author$project$IMP$Eval$bop, op, v1, v2);
			case 'EParens':
				var ws = expr.a;
				var e = expr.b;
				return A3($author$project$IMP$Eval$eval, store, holeBindings, e);
			case 'ENot':
				var ws = expr.a;
				var e = expr.b;
				var v = A3($author$project$IMP$Eval$eval, store, holeBindings, e);
				switch (v.$) {
					case 'VBool':
						var b = v.a;
						return $author$project$IMP$Syntax$VBool(!b);
					case 'VHole':
						return A2($author$project$IMP$Syntax$VHole, $author$project$IMP$Syntax$HTmp, -1);
					default:
						return $author$project$IMP$Syntax$VError('Unsupported expression');
				}
			case 'EList':
				var ws = expr.a;
				var es = expr.b;
				return $author$project$IMP$Syntax$VList(
					A2(
						$elm$core$List$map,
						A2($author$project$IMP$Eval$eval, store, holeBindings),
						es));
			case 'EIndex':
				var ws = expr.a;
				var e1 = expr.b;
				var e2 = expr.c;
				var v1 = A3($author$project$IMP$Eval$eval, store, holeBindings, e1);
				var v2 = A3($author$project$IMP$Eval$eval, store, holeBindings, e2);
				switch (v1.$) {
					case 'VString':
						var s = v1.a;
						switch (v2.$) {
							case 'VInt':
								var i = v2.a;
								return $author$project$IMP$Syntax$VString(
									A3($elm$core$String$slice, i, i + 1, s));
							case 'VHole':
								return A2($author$project$IMP$Syntax$VHole, $author$project$IMP$Syntax$HTmp, -1);
							default:
								return $author$project$IMP$Syntax$VError('Unsupported expression');
						}
					case 'VList':
						var vs = v1.a;
						switch (v2.$) {
							case 'VInt':
								var i = v2.a;
								return ((i >= 0) && (_Utils_cmp(
									i,
									$elm$core$List$length(vs)) < 0)) ? A2($author$project$IMP$Utils$nthValue, vs, i) : $author$project$IMP$Syntax$VError('Index out of range');
							case 'VHole':
								return A2($author$project$IMP$Syntax$VHole, $author$project$IMP$Syntax$HTmp, -1);
							default:
								return $author$project$IMP$Syntax$VError('Unsupported expression');
						}
					case 'VHole':
						return A2($author$project$IMP$Syntax$VHole, $author$project$IMP$Syntax$HTmp, -1);
					default:
						return $author$project$IMP$Syntax$VError('Unsupported expression');
				}
			case 'ELength':
				var ws = expr.a;
				var e = expr.b;
				var v = A3($author$project$IMP$Eval$eval, store, holeBindings, e);
				switch (v.$) {
					case 'VString':
						var s = v.a;
						return $author$project$IMP$Syntax$VInt(
							$elm$core$String$length(s));
					case 'VList':
						var vs = v.a;
						return $author$project$IMP$Syntax$VInt(
							$elm$core$List$length(vs));
					case 'VHole':
						return A2($author$project$IMP$Syntax$VHole, $author$project$IMP$Syntax$HTmp, -1);
					default:
						return $author$project$IMP$Syntax$VError('Unsupported expression');
				}
			default:
				return $author$project$IMP$Syntax$VError('Unsupported expression');
		}
	});
var $author$project$IMP$Eval$findIndex = F3(
	function (store, holeBindings, e) {
		switch (e.$) {
			case 'EVar':
				var x = e.b;
				return _Utils_Tuple2(
					x,
					$author$project$IMP$Syntax$VList(_List_Nil));
			case 'EIndex':
				var e1 = e.b;
				var e2 = e.c;
				var _v1 = A3($author$project$IMP$Eval$findIndex, store, holeBindings, e1);
				var x = _v1.a;
				var path = _v1.b;
				var v = A3($author$project$IMP$Eval$eval, store, holeBindings, e2);
				switch (v.$) {
					case 'VInt':
						var i = v.a;
						switch (path.$) {
							case 'VList':
								var p = path.a;
								return _Utils_Tuple2(
									x,
									$author$project$IMP$Syntax$VList(
										_Utils_ap(
											p,
											_List_fromArray(
												[v]))));
							case 'VHole':
								return _Utils_Tuple2(
									x,
									A2($author$project$IMP$Syntax$VHole, $author$project$IMP$Syntax$HTmp, -1));
							default:
								return _Utils_Tuple2(
									'error',
									$author$project$IMP$Syntax$VError('Index invalid'));
						}
					case 'VHole':
						return _Utils_Tuple2(
							x,
							A2($author$project$IMP$Syntax$VHole, $author$project$IMP$Syntax$HTmp, -1));
					default:
						return _Utils_Tuple2(
							'error',
							$author$project$IMP$Syntax$VError('Index invalid'));
				}
			default:
				return _Utils_Tuple2(
					'error',
					$author$project$IMP$Syntax$VError('Index invalid'));
		}
	});
var $author$project$IMP$Utils$hasHole = function (vs) {
	hasHole:
	while (true) {
		if (!vs.b) {
			return false;
		} else {
			if ((vs.a.$ === 'VHole') && (vs.a.a.$ === 'HTmp')) {
				var _v1 = vs.a;
				var _v2 = _v1.a;
				return true;
			} else {
				var v = vs.a;
				var rest = vs.b;
				switch (v.$) {
					case 'VList':
						var vs_ = v.a;
						return $author$project$IMP$Utils$hasHole(vs_) || $author$project$IMP$Utils$hasHole(rest);
					case 'VHole':
						return true;
					default:
						var $temp$vs = rest;
						vs = $temp$vs;
						continue hasHole;
				}
			}
		}
	}
};
var $elm$core$Set$insert = F2(
	function (key, _v0) {
		var dict = _v0.a;
		return $elm$core$Set$Set_elm_builtin(
			A3($elm$core$Dict$insert, key, _Utils_Tuple0, dict));
	});
var $author$project$IMP$Utils$isErrorStore = function (store) {
	var _v0 = A2($author$project$IMP$Utils$lookup, 'error', store);
	if ((_v0.$ === 'Just') && (_v0.a.$ === 'VError')) {
		return true;
	} else {
		return false;
	}
};
var $author$project$IMP$Utils$lookupFunc = F2(
	function (name, env) {
		lookupFunc:
		while (true) {
			if (env.b) {
				var f = env.a;
				var rest = env.b;
				if (_Utils_eq(f.name, name)) {
					return $elm$core$Maybe$Just(
						_Utils_Tuple2(f.params, f.body));
				} else {
					var $temp$name = name,
						$temp$env = rest;
					name = $temp$name;
					env = $temp$env;
					continue lookupFunc;
				}
			} else {
				return $elm$core$Maybe$Nothing;
			}
		}
	});
var $author$project$IMP$Utils$findVar = function (e) {
	findVar:
	while (true) {
		switch (e.$) {
			case 'EVar':
				var x = e.b;
				return x;
			case 'EIndex':
				var e1 = e.b;
				var $temp$e = e1;
				e = $temp$e;
				continue findVar;
			default:
				return 'error';
		}
	}
};
var $elm$core$List$any = F2(
	function (isOkay, list) {
		any:
		while (true) {
			if (!list.b) {
				return false;
			} else {
				var x = list.a;
				var xs = list.b;
				if (isOkay(x)) {
					return true;
				} else {
					var $temp$isOkay = isOkay,
						$temp$list = xs;
					isOkay = $temp$isOkay;
					list = $temp$list;
					continue any;
				}
			}
		}
	});
var $elm$core$List$member = F2(
	function (x, xs) {
		return A2(
			$elm$core$List$any,
			function (a) {
				return _Utils_eq(a, x);
			},
			xs);
	});
var $author$project$IMP$Utils$modVarsSeen = F3(
	function (seen, env, s) {
		modVarsSeen:
		while (true) {
			switch (s.$) {
				case 'SAssign':
					var e = s.b;
					switch (e.$) {
						case 'EVar':
							var x = e.b;
							return _List_fromArray(
								[x]);
						case 'EIndex':
							var e1 = e.b;
							var e2 = e.c;
							return _List_fromArray(
								[
									$author$project$IMP$Utils$findVar(e1)
								]);
						default:
							return _List_Nil;
					}
				case 'SIf':
					var s1 = s.c;
					var s2 = s.d;
					return _Utils_ap(
						A3($author$project$IMP$Utils$modVarsSeen, seen, env, s1),
						A3($author$project$IMP$Utils$modVarsSeen, seen, env, s2));
				case 'SWhile':
					var s_ = s.c;
					var $temp$seen = seen,
						$temp$env = env,
						$temp$s = s_;
					seen = $temp$seen;
					env = $temp$env;
					s = $temp$s;
					continue modVarsSeen;
				case 'SRead':
					var x = s.b;
					return _List_fromArray(
						[x, 'input']);
				case 'SPrint':
					return _List_fromArray(
						['output']);
				case 'SSeq':
					var s1 = s.b;
					var s2 = s.c;
					return _Utils_ap(
						A3($author$project$IMP$Utils$modVarsSeen, seen, env, s1),
						A3($author$project$IMP$Utils$modVarsSeen, seen, env, s2));
				case 'SFuncCall':
					var name = s.b;
					var args = s.c;
					if (A2($elm$core$List$member, name, seen)) {
						return _List_Nil;
					} else {
						var _v2 = A2($author$project$IMP$Utils$lookupFunc, name, env);
						if (_v2.$ === 'Just') {
							var _v3 = _v2.a;
							var params = _v3.a;
							var body = _v3.b;
							return A2(
								$elm$core$List$filter,
								function (x) {
									return !A2($elm$core$List$member, x, params);
								},
								A3(
									$author$project$IMP$Utils$modVarsSeen,
									A2($elm$core$List$cons, name, seen),
									env,
									body));
						} else {
							return _List_Nil;
						}
					}
				default:
					return _List_Nil;
			}
		}
	});
var $author$project$IMP$Utils$modVars = F2(
	function (env, s) {
		return A3($author$project$IMP$Utils$modVarsSeen, _List_Nil, env, s);
	});
var $author$project$IMP$Utils$outputSuffixHole = F2(
	function (i, scount) {
		return A2(
			$author$project$IMP$Syntax$VHole,
			$author$project$IMP$Syntax$HVar(
				'output-' + $elm$core$String$fromInt(i)),
			scount);
	});
var $author$project$IMP$Utils$delStore = F2(
	function (x, store) {
		if (store.b) {
			var _v1 = store.a;
			var x_ = _v1.a;
			var v = _v1.b;
			var rest = store.b;
			return _Utils_eq(x, x_) ? rest : A2(
				$elm$core$List$cons,
				_Utils_Tuple2(x_, v),
				A2($author$project$IMP$Utils$delStore, x, rest));
		} else {
			return _List_Nil;
		}
	});
var $author$project$IMP$Utils$updateStore = F3(
	function (x, v, store) {
		if (store.b) {
			var _v1 = store.a;
			var x_ = _v1.a;
			var v_ = _v1.b;
			var rest = store.b;
			return _Utils_eq(x, x_) ? A2(
				$elm$core$List$cons,
				_Utils_Tuple2(x, v),
				rest) : A2(
				$elm$core$List$cons,
				_Utils_Tuple2(x_, v_),
				A3($author$project$IMP$Utils$updateStore, x, v, rest));
		} else {
			return A2(
				$elm$core$List$cons,
				_Utils_Tuple2(x, v),
				store);
		}
	});
var $author$project$IMP$Utils$overlayParams = F3(
	function (params, from, to) {
		overlayParams:
		while (true) {
			if (!params.b) {
				return to;
			} else {
				var p = params.a;
				var rest = params.b;
				var to_ = function () {
					var _v1 = A2($author$project$IMP$Utils$lookup, p, from);
					if (_v1.$ === 'Just') {
						var v = _v1.a;
						return A3($author$project$IMP$Utils$updateStore, p, v, to);
					} else {
						return A2($author$project$IMP$Utils$delStore, p, to);
					}
				}();
				var $temp$params = rest,
					$temp$from = from,
					$temp$to = to_;
				params = $temp$params;
				from = $temp$from;
				to = $temp$to;
				continue overlayParams;
			}
		}
	});
var $author$project$IMP$Utils$pathToName = F2(
	function (prefix, path) {
		pathToName:
		while (true) {
			_v0$2:
			while (true) {
				if (path.$ === 'VList') {
					if (!path.a.b) {
						return prefix;
					} else {
						if (path.a.a.$ === 'VInt') {
							var _v1 = path.a;
							var i = _v1.a.a;
							var rest = _v1.b;
							var $temp$prefix = A2($author$project$IMP$Syntax$HSub, prefix, i),
								$temp$path = $author$project$IMP$Syntax$VList(rest);
							prefix = $temp$prefix;
							path = $temp$path;
							continue pathToName;
						} else {
							break _v0$2;
						}
					}
				} else {
					break _v0$2;
				}
			}
			return prefix;
		}
	});
var $author$project$IMP$Utils$polluteState = F3(
	function (mod, store, scount) {
		polluteState:
		while (true) {
			if (!mod.b) {
				return store;
			} else {
				var x = mod.a;
				var rest = mod.b;
				if (x === 'output') {
					var oldval = A2($author$project$IMP$Utils$lookup, x, store);
					if (oldval.$ === 'Nothing') {
						return _List_fromArray(
							[
								_Utils_Tuple2(
								'error',
								$author$project$IMP$Syntax$VError('Variable not found'))
							]);
					} else {
						if (oldval.a.$ === 'VList') {
							var vs = oldval.a.a;
							var store_ = A3(
								$author$project$IMP$Utils$updateStore,
								x,
								$author$project$IMP$Syntax$VList(
									_Utils_ap(
										vs,
										_List_fromArray(
											[
												A2(
												$author$project$IMP$Utils$outputSuffixHole,
												$elm$core$List$length(vs),
												scount)
											]))),
								store);
							var $temp$mod = rest,
								$temp$store = store_,
								$temp$scount = scount;
							mod = $temp$mod;
							store = $temp$store;
							scount = $temp$scount;
							continue polluteState;
						} else {
							return _List_fromArray(
								[
									_Utils_Tuple2(
									'error',
									$author$project$IMP$Syntax$VError('Unsupported expression'))
								]);
						}
					}
				} else {
					var store_ = A3(
						$author$project$IMP$Utils$updateStore,
						x,
						A2(
							$author$project$IMP$Syntax$VHole,
							$author$project$IMP$Syntax$HVar(x),
							scount),
						store);
					var $temp$mod = rest,
						$temp$store = store_,
						$temp$scount = scount;
					mod = $temp$mod;
					store = $temp$store;
					scount = $temp$scount;
					continue polluteState;
				}
			}
		}
	});
var $author$project$IMP$Eval$processHoleAt = F4(
	function (v, x, scount, path) {
		_v2$2:
		while (true) {
			switch (v.$) {
				case 'VHole':
					if (v.a.$ === 'HTmp') {
						var _v3 = v.a;
						return A2(
							$author$project$IMP$Syntax$VHole,
							A2(
								$author$project$IMP$Utils$pathToName,
								$author$project$IMP$Syntax$HVar(x),
								path),
							scount);
					} else {
						break _v2$2;
					}
				case 'VList':
					var inner = v.a;
					return $author$project$IMP$Syntax$VList(
						A4($author$project$IMP$Eval$processHoleinList, inner, x, scount, path));
				default:
					break _v2$2;
			}
		}
		return v;
	});
var $author$project$IMP$Eval$processHoleinList = F4(
	function (vs, x, scount, path) {
		return A5($author$project$IMP$Eval$processHoleinListWalk, vs, x, scount, path, 0);
	});
var $author$project$IMP$Eval$processHoleinListWalk = F5(
	function (vs, x, scount, path, i) {
		if (!vs.b) {
			return _List_Nil;
		} else {
			var v = vs.a;
			var rest = vs.b;
			var path_ = function () {
				if (path.$ === 'VList') {
					var p = path.a;
					return $author$project$IMP$Syntax$VList(
						_Utils_ap(
							p,
							_List_fromArray(
								[
									$author$project$IMP$Syntax$VInt(i)
								])));
				} else {
					return $author$project$IMP$Syntax$VList(
						_List_fromArray(
							[
								$author$project$IMP$Syntax$VInt(i)
							]));
				}
			}();
			return A2(
				$elm$core$List$cons,
				A4($author$project$IMP$Eval$processHoleAt, v, x, scount, path_),
				A5($author$project$IMP$Eval$processHoleinListWalk, rest, x, scount, path, i + 1));
		}
	});
var $elm$core$Dict$getMin = function (dict) {
	getMin:
	while (true) {
		if ((dict.$ === 'RBNode_elm_builtin') && (dict.d.$ === 'RBNode_elm_builtin')) {
			var left = dict.d;
			var $temp$dict = left;
			dict = $temp$dict;
			continue getMin;
		} else {
			return dict;
		}
	}
};
var $elm$core$Dict$moveRedLeft = function (dict) {
	if (((dict.$ === 'RBNode_elm_builtin') && (dict.d.$ === 'RBNode_elm_builtin')) && (dict.e.$ === 'RBNode_elm_builtin')) {
		if ((dict.e.d.$ === 'RBNode_elm_builtin') && (dict.e.d.a.$ === 'Red')) {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v1 = dict.d;
			var lClr = _v1.a;
			var lK = _v1.b;
			var lV = _v1.c;
			var lLeft = _v1.d;
			var lRight = _v1.e;
			var _v2 = dict.e;
			var rClr = _v2.a;
			var rK = _v2.b;
			var rV = _v2.c;
			var rLeft = _v2.d;
			var _v3 = rLeft.a;
			var rlK = rLeft.b;
			var rlV = rLeft.c;
			var rlL = rLeft.d;
			var rlR = rLeft.e;
			var rRight = _v2.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				$elm$core$Dict$Red,
				rlK,
				rlV,
				A5(
					$elm$core$Dict$RBNode_elm_builtin,
					$elm$core$Dict$Black,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, lK, lV, lLeft, lRight),
					rlL),
				A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Black, rK, rV, rlR, rRight));
		} else {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v4 = dict.d;
			var lClr = _v4.a;
			var lK = _v4.b;
			var lV = _v4.c;
			var lLeft = _v4.d;
			var lRight = _v4.e;
			var _v5 = dict.e;
			var rClr = _v5.a;
			var rK = _v5.b;
			var rV = _v5.c;
			var rLeft = _v5.d;
			var rRight = _v5.e;
			if (clr.$ === 'Black') {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					$elm$core$Dict$Black,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					$elm$core$Dict$Black,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, rK, rV, rLeft, rRight));
			}
		}
	} else {
		return dict;
	}
};
var $elm$core$Dict$moveRedRight = function (dict) {
	if (((dict.$ === 'RBNode_elm_builtin') && (dict.d.$ === 'RBNode_elm_builtin')) && (dict.e.$ === 'RBNode_elm_builtin')) {
		if ((dict.d.d.$ === 'RBNode_elm_builtin') && (dict.d.d.a.$ === 'Red')) {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v1 = dict.d;
			var lClr = _v1.a;
			var lK = _v1.b;
			var lV = _v1.c;
			var _v2 = _v1.d;
			var _v3 = _v2.a;
			var llK = _v2.b;
			var llV = _v2.c;
			var llLeft = _v2.d;
			var llRight = _v2.e;
			var lRight = _v1.e;
			var _v4 = dict.e;
			var rClr = _v4.a;
			var rK = _v4.b;
			var rV = _v4.c;
			var rLeft = _v4.d;
			var rRight = _v4.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				$elm$core$Dict$Red,
				lK,
				lV,
				A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Black, llK, llV, llLeft, llRight),
				A5(
					$elm$core$Dict$RBNode_elm_builtin,
					$elm$core$Dict$Black,
					k,
					v,
					lRight,
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, rK, rV, rLeft, rRight)));
		} else {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v5 = dict.d;
			var lClr = _v5.a;
			var lK = _v5.b;
			var lV = _v5.c;
			var lLeft = _v5.d;
			var lRight = _v5.e;
			var _v6 = dict.e;
			var rClr = _v6.a;
			var rK = _v6.b;
			var rV = _v6.c;
			var rLeft = _v6.d;
			var rRight = _v6.e;
			if (clr.$ === 'Black') {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					$elm$core$Dict$Black,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					$elm$core$Dict$Black,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, rK, rV, rLeft, rRight));
			}
		}
	} else {
		return dict;
	}
};
var $elm$core$Dict$removeHelpPrepEQGT = F7(
	function (targetKey, dict, color, key, value, left, right) {
		if ((left.$ === 'RBNode_elm_builtin') && (left.a.$ === 'Red')) {
			var _v1 = left.a;
			var lK = left.b;
			var lV = left.c;
			var lLeft = left.d;
			var lRight = left.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				color,
				lK,
				lV,
				lLeft,
				A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, key, value, lRight, right));
		} else {
			_v2$2:
			while (true) {
				if ((right.$ === 'RBNode_elm_builtin') && (right.a.$ === 'Black')) {
					if (right.d.$ === 'RBNode_elm_builtin') {
						if (right.d.a.$ === 'Black') {
							var _v3 = right.a;
							var _v4 = right.d;
							var _v5 = _v4.a;
							return $elm$core$Dict$moveRedRight(dict);
						} else {
							break _v2$2;
						}
					} else {
						var _v6 = right.a;
						var _v7 = right.d;
						return $elm$core$Dict$moveRedRight(dict);
					}
				} else {
					break _v2$2;
				}
			}
			return dict;
		}
	});
var $elm$core$Dict$removeMin = function (dict) {
	if ((dict.$ === 'RBNode_elm_builtin') && (dict.d.$ === 'RBNode_elm_builtin')) {
		var color = dict.a;
		var key = dict.b;
		var value = dict.c;
		var left = dict.d;
		var lColor = left.a;
		var lLeft = left.d;
		var right = dict.e;
		if (lColor.$ === 'Black') {
			if ((lLeft.$ === 'RBNode_elm_builtin') && (lLeft.a.$ === 'Red')) {
				var _v3 = lLeft.a;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					color,
					key,
					value,
					$elm$core$Dict$removeMin(left),
					right);
			} else {
				var _v4 = $elm$core$Dict$moveRedLeft(dict);
				if (_v4.$ === 'RBNode_elm_builtin') {
					var nColor = _v4.a;
					var nKey = _v4.b;
					var nValue = _v4.c;
					var nLeft = _v4.d;
					var nRight = _v4.e;
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						$elm$core$Dict$removeMin(nLeft),
						nRight);
				} else {
					return $elm$core$Dict$RBEmpty_elm_builtin;
				}
			}
		} else {
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				color,
				key,
				value,
				$elm$core$Dict$removeMin(left),
				right);
		}
	} else {
		return $elm$core$Dict$RBEmpty_elm_builtin;
	}
};
var $elm$core$Dict$removeHelp = F2(
	function (targetKey, dict) {
		if (dict.$ === 'RBEmpty_elm_builtin') {
			return $elm$core$Dict$RBEmpty_elm_builtin;
		} else {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			if (_Utils_cmp(targetKey, key) < 0) {
				if ((left.$ === 'RBNode_elm_builtin') && (left.a.$ === 'Black')) {
					var _v4 = left.a;
					var lLeft = left.d;
					if ((lLeft.$ === 'RBNode_elm_builtin') && (lLeft.a.$ === 'Red')) {
						var _v6 = lLeft.a;
						return A5(
							$elm$core$Dict$RBNode_elm_builtin,
							color,
							key,
							value,
							A2($elm$core$Dict$removeHelp, targetKey, left),
							right);
					} else {
						var _v7 = $elm$core$Dict$moveRedLeft(dict);
						if (_v7.$ === 'RBNode_elm_builtin') {
							var nColor = _v7.a;
							var nKey = _v7.b;
							var nValue = _v7.c;
							var nLeft = _v7.d;
							var nRight = _v7.e;
							return A5(
								$elm$core$Dict$balance,
								nColor,
								nKey,
								nValue,
								A2($elm$core$Dict$removeHelp, targetKey, nLeft),
								nRight);
						} else {
							return $elm$core$Dict$RBEmpty_elm_builtin;
						}
					}
				} else {
					return A5(
						$elm$core$Dict$RBNode_elm_builtin,
						color,
						key,
						value,
						A2($elm$core$Dict$removeHelp, targetKey, left),
						right);
				}
			} else {
				return A2(
					$elm$core$Dict$removeHelpEQGT,
					targetKey,
					A7($elm$core$Dict$removeHelpPrepEQGT, targetKey, dict, color, key, value, left, right));
			}
		}
	});
var $elm$core$Dict$removeHelpEQGT = F2(
	function (targetKey, dict) {
		if (dict.$ === 'RBNode_elm_builtin') {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			if (_Utils_eq(targetKey, key)) {
				var _v1 = $elm$core$Dict$getMin(right);
				if (_v1.$ === 'RBNode_elm_builtin') {
					var minKey = _v1.b;
					var minValue = _v1.c;
					return A5(
						$elm$core$Dict$balance,
						color,
						minKey,
						minValue,
						left,
						$elm$core$Dict$removeMin(right));
				} else {
					return $elm$core$Dict$RBEmpty_elm_builtin;
				}
			} else {
				return A5(
					$elm$core$Dict$balance,
					color,
					key,
					value,
					left,
					A2($elm$core$Dict$removeHelp, targetKey, right));
			}
		} else {
			return $elm$core$Dict$RBEmpty_elm_builtin;
		}
	});
var $elm$core$Dict$remove = F2(
	function (key, dict) {
		var _v0 = A2($elm$core$Dict$removeHelp, key, dict);
		if ((_v0.$ === 'RBNode_elm_builtin') && (_v0.a.$ === 'Red')) {
			var _v1 = _v0.a;
			var k = _v0.b;
			var v = _v0.c;
			var l = _v0.d;
			var r = _v0.e;
			return A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Black, k, v, l, r);
		} else {
			var x = _v0;
			return x;
		}
	});
var $elm$core$Set$remove = F2(
	function (key, _v0) {
		var dict = _v0.a;
		return $elm$core$Set$Set_elm_builtin(
			A2($elm$core$Dict$remove, key, dict));
	});
var $author$project$IMP$Utils$restoreParams = F2(
	function (saved, store) {
		restoreParams:
		while (true) {
			if (!saved.b) {
				return store;
			} else {
				if (saved.a.b.$ === 'Just') {
					var _v1 = saved.a;
					var x = _v1.a;
					var v = _v1.b.a;
					var rest = saved.b;
					var $temp$saved = rest,
						$temp$store = A3($author$project$IMP$Utils$updateStore, x, v, store);
					saved = $temp$saved;
					store = $temp$store;
					continue restoreParams;
				} else {
					var _v2 = saved.a;
					var x = _v2.a;
					var _v3 = _v2.b;
					var rest = saved.b;
					var $temp$saved = rest,
						$temp$store = A2($author$project$IMP$Utils$delStore, x, store);
					saved = $temp$saved;
					store = $temp$store;
					continue restoreParams;
				}
			}
		}
	});
var $elm$core$Set$fromList = function (list) {
	return A3($elm$core$List$foldl, $elm$core$Set$insert, $elm$core$Set$empty, list);
};
var $elm$core$Dict$foldl = F3(
	function (func, acc, dict) {
		foldl:
		while (true) {
			if (dict.$ === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var key = dict.b;
				var value = dict.c;
				var left = dict.d;
				var right = dict.e;
				var $temp$func = func,
					$temp$acc = A3(
					func,
					key,
					value,
					A3($elm$core$Dict$foldl, func, acc, left)),
					$temp$dict = right;
				func = $temp$func;
				acc = $temp$acc;
				dict = $temp$dict;
				continue foldl;
			}
		}
	});
var $elm$core$Dict$filter = F2(
	function (isGood, dict) {
		return A3(
			$elm$core$Dict$foldl,
			F3(
				function (k, v, d) {
					return A2(isGood, k, v) ? A3($elm$core$Dict$insert, k, v, d) : d;
				}),
			$elm$core$Dict$empty,
			dict);
	});
var $elm$core$Dict$intersect = F2(
	function (t1, t2) {
		return A2(
			$elm$core$Dict$filter,
			F2(
				function (k, _v0) {
					return A2($elm$core$Dict$member, k, t2);
				}),
			t1);
	});
var $elm$core$Set$intersect = F2(
	function (_v0, _v1) {
		var dict1 = _v0.a;
		var dict2 = _v1.a;
		return $elm$core$Set$Set_elm_builtin(
			A2($elm$core$Dict$intersect, dict1, dict2));
	});
var $elm$core$Dict$union = F2(
	function (t1, t2) {
		return A3($elm$core$Dict$foldl, $elm$core$Dict$insert, t2, t1);
	});
var $elm$core$Set$union = F2(
	function (_v0, _v1) {
		var dict1 = _v0.a;
		var dict2 = _v1.a;
		return $elm$core$Set$Set_elm_builtin(
			A2($elm$core$Dict$union, dict1, dict2));
	});
var $author$project$IMP$Eval$restoreReadOnly = F3(
	function (params, before, after) {
		return A2(
			$elm$core$Set$union,
			A3($elm$core$List$foldl, $elm$core$Set$remove, after, params),
			A2(
				$elm$core$Set$intersect,
				before,
				$elm$core$Set$fromList(params)));
	});
var $author$project$IMP$Syntax$EBool = F2(
	function (a, b) {
		return {$: 'EBool', a: a, b: b};
	});
var $author$project$IMP$Syntax$EError = function (a) {
	return {$: 'EError', a: a};
};
var $author$project$IMP$Syntax$EIndex = F3(
	function (a, b, c) {
		return {$: 'EIndex', a: a, b: b, c: c};
	});
var $author$project$IMP$Syntax$EInt = F2(
	function (a, b) {
		return {$: 'EInt', a: a, b: b};
	});
var $author$project$IMP$Syntax$ELength = F2(
	function (a, b) {
		return {$: 'ELength', a: a, b: b};
	});
var $author$project$IMP$Syntax$EList = F2(
	function (a, b) {
		return {$: 'EList', a: a, b: b};
	});
var $author$project$IMP$Syntax$ENot = F2(
	function (a, b) {
		return {$: 'ENot', a: a, b: b};
	});
var $author$project$IMP$Syntax$EParens = F2(
	function (a, b) {
		return {$: 'EParens', a: a, b: b};
	});
var $author$project$IMP$Syntax$Eop = F4(
	function (a, b, c, d) {
		return {$: 'Eop', a: a, b: b, c: c, d: d};
	});
var $author$project$IMP$Utils$isIndet = function (v) {
	switch (v.$) {
		case 'VHole':
			return true;
		case 'VList':
			var vs = v.a;
			return $author$project$IMP$Utils$hasHole(vs);
		default:
			return false;
	}
};
var $author$project$IMP$Eval$isFullyDet = function (v) {
	if (v.$ === 'VError') {
		return false;
	} else {
		return !$author$project$IMP$Utils$isIndet(v);
	}
};
var $author$project$IMP$Syntax$EHole = F2(
	function (a, b) {
		return {$: 'EHole', a: a, b: b};
	});
var $author$project$IMP$Syntax$EString = F2(
	function (a, b) {
		return {$: 'EString', a: a, b: b};
	});
var $author$project$IMP$Utils$encodeHoleId = F2(
	function (h, id) {
		switch (h.$) {
			case 'HVar':
				var x = h.a;
				return $author$project$IMP$Syntax$HVar(
					x + ('-' + $elm$core$String$fromInt(id)));
			case 'HSub':
				var h_ = h.a;
				var n = h.b;
				return A2(
					$author$project$IMP$Syntax$HSub,
					A2($author$project$IMP$Utils$encodeHoleId, h_, id),
					n);
			default:
				return h;
		}
	});
var $author$project$IMP$Utils$value2Expr = function (v) {
	switch (v.$) {
		case 'VInt':
			var i = v.a;
			return A2($author$project$IMP$Syntax$EInt, _List_Nil, i);
		case 'VBool':
			var b = v.a;
			return A2($author$project$IMP$Syntax$EBool, _List_Nil, b);
		case 'VString':
			var s = v.a;
			return A2($author$project$IMP$Syntax$EString, _List_Nil, s);
		case 'VHole':
			var h = v.a;
			var id = v.b;
			return A2(
				$author$project$IMP$Syntax$EHole,
				_List_Nil,
				A2($author$project$IMP$Utils$encodeHoleId, h, id));
		case 'VList':
			var vs = v.a;
			return A2(
				$author$project$IMP$Syntax$EList,
				_List_Nil,
				A2($elm$core$List$map, $author$project$IMP$Utils$value2Expr, vs));
		default:
			return $author$project$IMP$Syntax$EError('Unsupported expression');
	}
};
var $author$project$IMP$Eval$simplifyExpr = F3(
	function (store, e, holeBindings) {
		switch (e.$) {
			case 'EVar':
				var x = e.b;
				var _v2 = A2($author$project$IMP$Utils$lookup, x, store);
				if (_v2.$ === 'Just') {
					var v = _v2.a;
					return $author$project$IMP$Eval$isFullyDet(v) ? $author$project$IMP$Utils$value2Expr(v) : A2($author$project$IMP$Syntax$EVar, _List_Nil, x);
				} else {
					return $author$project$IMP$Syntax$EError('Variable not found');
				}
			case 'EIndex':
				var e1 = e.b;
				var e2 = e.c;
				var e2_ = A3($author$project$IMP$Eval$simplifyExpr, store, e2, holeBindings);
				var v2 = A3($author$project$IMP$Eval$eval, store, holeBindings, e2_);
				var e1_ = A3($author$project$IMP$Eval$simplifyLhs, store, e1, holeBindings);
				var v1 = A3($author$project$IMP$Eval$eval, store, holeBindings, e1_);
				var _v3 = _Utils_Tuple2(v1, v2);
				_v3$2:
				while (true) {
					if (_v3.b.$ === 'VInt') {
						switch (_v3.a.$) {
							case 'VList':
								var vs = _v3.a.a;
								var i = _v3.b.a;
								if ((i >= 0) && (_Utils_cmp(
									i,
									$elm$core$List$length(vs)) < 0)) {
									var _v4 = A2($author$project$IMP$Utils$nthValue, vs, i);
									if (_v4.$ === 'VHole') {
										return A3($author$project$IMP$Syntax$EIndex, _List_Nil, e1_, e2_);
									} else {
										var v = _v4;
										return $author$project$IMP$Eval$isFullyDet(v) ? $author$project$IMP$Utils$value2Expr(v) : A3($author$project$IMP$Syntax$EIndex, _List_Nil, e1_, e2_);
									}
								} else {
									return $author$project$IMP$Syntax$EError('Index out of range');
								}
							case 'VString':
								var s = _v3.a.a;
								var i = _v3.b.a;
								return ((i >= 0) && (_Utils_cmp(
									i,
									$elm$core$String$length(s)) < 0)) ? $author$project$IMP$Utils$value2Expr(
									$author$project$IMP$Syntax$VString(
										A3($elm$core$String$slice, i, i + 1, s))) : $author$project$IMP$Syntax$EError('Index out of range');
							default:
								break _v3$2;
						}
					} else {
						break _v3$2;
					}
				}
				return A3($author$project$IMP$Syntax$EIndex, _List_Nil, e1_, e2_);
			case 'Eop':
				var ws = e.a;
				var op = e.b;
				var e1 = e.c;
				var e2 = e.d;
				var e2_ = A3($author$project$IMP$Eval$simplifyExpr, store, e2, holeBindings);
				var v2 = A3($author$project$IMP$Eval$eval, store, holeBindings, e2_);
				var e1_ = A3($author$project$IMP$Eval$simplifyExpr, store, e1, holeBindings);
				var v1 = A3($author$project$IMP$Eval$eval, store, holeBindings, e1_);
				if ($author$project$IMP$Eval$isFullyDet(v1) && $author$project$IMP$Eval$isFullyDet(v2)) {
					var v = A3($author$project$IMP$Eval$bop, op, v1, v2);
					return $author$project$IMP$Eval$isFullyDet(v) ? $author$project$IMP$Utils$value2Expr(v) : A4($author$project$IMP$Syntax$Eop, ws, op, e1_, e2_);
				} else {
					return A4($author$project$IMP$Syntax$Eop, ws, op, e1_, e2_);
				}
			case 'ENot':
				var ws = e.a;
				var e1 = e.b;
				var e1_ = A3($author$project$IMP$Eval$simplifyExpr, store, e1, holeBindings);
				var v1 = A3($author$project$IMP$Eval$eval, store, holeBindings, e1_);
				if ($author$project$IMP$Eval$isFullyDet(v1)) {
					if (v1.$ === 'VBool') {
						var b = v1.a;
						return A2($author$project$IMP$Syntax$EBool, _List_Nil, !b);
					} else {
						return A2($author$project$IMP$Syntax$ENot, ws, e1_);
					}
				} else {
					return A2($author$project$IMP$Syntax$ENot, ws, e1_);
				}
			case 'EParens':
				var ws = e.a;
				var e1 = e.b;
				var e1_ = A3($author$project$IMP$Eval$simplifyExpr, store, e1, holeBindings);
				var v = A3($author$project$IMP$Eval$eval, store, holeBindings, e1_);
				return $author$project$IMP$Eval$isFullyDet(v) ? $author$project$IMP$Utils$value2Expr(v) : A2($author$project$IMP$Syntax$EParens, ws, e1_);
			case 'EList':
				var ws = e.a;
				var es = e.b;
				return A2(
					$author$project$IMP$Syntax$EList,
					ws,
					A2(
						$elm$core$List$map,
						function (e_) {
							return A3($author$project$IMP$Eval$simplifyExpr, store, e_, holeBindings);
						},
						es));
			case 'ELength':
				var ws = e.a;
				var e1 = e.b;
				var e1_ = A3($author$project$IMP$Eval$simplifyExpr, store, e1, holeBindings);
				var v1 = A3($author$project$IMP$Eval$eval, store, holeBindings, e1_);
				if ($author$project$IMP$Eval$isFullyDet(v1)) {
					switch (v1.$) {
						case 'VString':
							var s = v1.a;
							return A2(
								$author$project$IMP$Syntax$EInt,
								_List_Nil,
								$elm$core$String$length(s));
						case 'VList':
							var vs = v1.a;
							return A2(
								$author$project$IMP$Syntax$EInt,
								_List_Nil,
								$elm$core$List$length(vs));
						default:
							return A2($author$project$IMP$Syntax$ELength, ws, e1_);
					}
				} else {
					return A2($author$project$IMP$Syntax$ELength, ws, e1_);
				}
			default:
				return e;
		}
	});
var $author$project$IMP$Eval$simplifyLhs = F3(
	function (store, e, holeBindings) {
		switch (e.$) {
			case 'EVar':
				var x = e.b;
				return A2($author$project$IMP$Syntax$EVar, _List_Nil, x);
			case 'EIndex':
				var e1 = e.b;
				var e2 = e.c;
				return A3(
					$author$project$IMP$Syntax$EIndex,
					_List_Nil,
					A3($author$project$IMP$Eval$simplifyLhs, store, e1, holeBindings),
					A3($author$project$IMP$Eval$simplifyExpr, store, e2, holeBindings));
			default:
				return e;
		}
	});
var $author$project$IMP$Utils$snapshotParams = F2(
	function (params, store) {
		return A2(
			$elm$core$List$map,
			function (x) {
				return _Utils_Tuple2(
					x,
					A2($author$project$IMP$Utils$lookup, x, store));
			},
			params);
	});
var $author$project$IMP$Utils$unique = function (ls) {
	unique:
	while (true) {
		if (!ls.b) {
			return _List_Nil;
		} else {
			var x = ls.a;
			var rest = ls.b;
			if (A2($elm$core$List$member, x, rest)) {
				var $temp$ls = rest;
				ls = $temp$ls;
				continue unique;
			} else {
				return A2(
					$elm$core$List$cons,
					x,
					$author$project$IMP$Utils$unique(rest));
			}
		}
	}
};
var $elm$core$List$drop = F2(
	function (n, list) {
		drop:
		while (true) {
			if (n <= 0) {
				return list;
			} else {
				if (!list.b) {
					return list;
				} else {
					var x = list.a;
					var xs = list.b;
					var $temp$n = n - 1,
						$temp$list = xs;
					n = $temp$n;
					list = $temp$list;
					continue drop;
				}
			}
		}
	});
var $elm$core$List$head = function (list) {
	if (list.b) {
		var x = list.a;
		var xs = list.b;
		return $elm$core$Maybe$Just(x);
	} else {
		return $elm$core$Maybe$Nothing;
	}
};
var $elm$core$List$takeReverse = F3(
	function (n, list, kept) {
		takeReverse:
		while (true) {
			if (n <= 0) {
				return kept;
			} else {
				if (!list.b) {
					return kept;
				} else {
					var x = list.a;
					var xs = list.b;
					var $temp$n = n - 1,
						$temp$list = xs,
						$temp$kept = A2($elm$core$List$cons, x, kept);
					n = $temp$n;
					list = $temp$list;
					kept = $temp$kept;
					continue takeReverse;
				}
			}
		}
	});
var $elm$core$List$takeTailRec = F2(
	function (n, list) {
		return $elm$core$List$reverse(
			A3($elm$core$List$takeReverse, n, list, _List_Nil));
	});
var $elm$core$List$takeFast = F3(
	function (ctr, n, list) {
		if (n <= 0) {
			return _List_Nil;
		} else {
			var _v0 = _Utils_Tuple2(n, list);
			_v0$1:
			while (true) {
				_v0$5:
				while (true) {
					if (!_v0.b.b) {
						return list;
					} else {
						if (_v0.b.b.b) {
							switch (_v0.a) {
								case 1:
									break _v0$1;
								case 2:
									var _v2 = _v0.b;
									var x = _v2.a;
									var _v3 = _v2.b;
									var y = _v3.a;
									return _List_fromArray(
										[x, y]);
								case 3:
									if (_v0.b.b.b.b) {
										var _v4 = _v0.b;
										var x = _v4.a;
										var _v5 = _v4.b;
										var y = _v5.a;
										var _v6 = _v5.b;
										var z = _v6.a;
										return _List_fromArray(
											[x, y, z]);
									} else {
										break _v0$5;
									}
								default:
									if (_v0.b.b.b.b && _v0.b.b.b.b.b) {
										var _v7 = _v0.b;
										var x = _v7.a;
										var _v8 = _v7.b;
										var y = _v8.a;
										var _v9 = _v8.b;
										var z = _v9.a;
										var _v10 = _v9.b;
										var w = _v10.a;
										var tl = _v10.b;
										return (ctr > 1000) ? A2(
											$elm$core$List$cons,
											x,
											A2(
												$elm$core$List$cons,
												y,
												A2(
													$elm$core$List$cons,
													z,
													A2(
														$elm$core$List$cons,
														w,
														A2($elm$core$List$takeTailRec, n - 4, tl))))) : A2(
											$elm$core$List$cons,
											x,
											A2(
												$elm$core$List$cons,
												y,
												A2(
													$elm$core$List$cons,
													z,
													A2(
														$elm$core$List$cons,
														w,
														A3($elm$core$List$takeFast, ctr + 1, n - 4, tl)))));
									} else {
										break _v0$5;
									}
							}
						} else {
							if (_v0.a === 1) {
								break _v0$1;
							} else {
								break _v0$5;
							}
						}
					}
				}
				return list;
			}
			var _v1 = _v0.b;
			var x = _v1.a;
			return _List_fromArray(
				[x]);
		}
	});
var $elm$core$List$take = F2(
	function (n, list) {
		return A3($elm$core$List$takeFast, 0, n, list);
	});
var $author$project$IMP$Utils$updateValue = F3(
	function (path, vs, v) {
		switch (vs.$) {
			case 'VList':
				var vs_ = vs.a;
				if (((path.$ === 'VList') && path.a.b) && (path.a.a.$ === 'VInt')) {
					if (!path.a.b.b) {
						var _v2 = path.a;
						var i = _v2.a.a;
						return $author$project$IMP$Syntax$VList(
							_Utils_ap(
								A2($elm$core$List$take, i, vs_),
								_Utils_ap(
									_List_fromArray(
										[v]),
									A2($elm$core$List$drop, i + 1, vs_))));
					} else {
						var _v3 = path.a;
						var i = _v3.a.a;
						var rest = _v3.b;
						var oriv = $elm$core$List$head(
							$elm$core$List$reverse(
								A2($elm$core$List$take, i + 1, vs_)));
						if (oriv.$ === 'Just') {
							var oriv_ = oriv.a;
							var newv = A3(
								$author$project$IMP$Utils$updateValue,
								$author$project$IMP$Syntax$VList(rest),
								oriv_,
								v);
							return $author$project$IMP$Syntax$VList(
								_Utils_ap(
									A2($elm$core$List$take, i, vs_),
									_Utils_ap(
										_List_fromArray(
											[newv]),
										A2($elm$core$List$drop, i + 1, vs_))));
						} else {
							return $author$project$IMP$Syntax$VError('Index out of range');
						}
					}
				} else {
					return $author$project$IMP$Syntax$VError('Unsupported expression');
				}
			case 'VHole':
				return vs;
			default:
				return $author$project$IMP$Syntax$VError('Unsupported expression');
		}
	});
var $author$project$IMP$Eval$bindParamsParallel = F8(
	function (funcEnv, evalStore, holeBindings, riStmts, readOnly, scount, params, args) {
		var _v24 = _Utils_Tuple2(params, args);
		_v24$2:
		while (true) {
			if (!_v24.a.b) {
				if (!_v24.b.b) {
					return _Utils_Tuple2(
						{readOnly: readOnly, riStmts: riStmts, scount: scount, store: evalStore},
						_List_Nil);
				} else {
					break _v24$2;
				}
			} else {
				if (_v24.b.b) {
					var _v25 = _v24.a;
					var p = _v25.a;
					var ps = _v25.b;
					var _v26 = _v24.b;
					var e = _v26.a;
					var es = _v26.b;
					var res = A7(
						$author$project$IMP$Eval$exec,
						funcEnv,
						evalStore,
						holeBindings,
						riStmts,
						A3(
							$author$project$IMP$Syntax$SAssign,
							_List_Nil,
							A2($author$project$IMP$Syntax$EVar, _List_Nil, p),
							e),
						readOnly,
						scount);
					if ($author$project$IMP$Utils$isErrorStore(res.store)) {
						return _Utils_Tuple2(res, _List_Nil);
					} else {
						var _v27 = A8($author$project$IMP$Eval$bindParamsParallel, funcEnv, evalStore, holeBindings, res.riStmts, readOnly, res.scount, ps, es);
						var rest = _v27.a;
						var steps = _v27.b;
						return $author$project$IMP$Utils$isErrorStore(rest.store) ? _Utils_Tuple2(rest, _List_Nil) : _Utils_Tuple2(
							_Utils_update(
								rest,
								{
									store: A3(
										$author$project$IMP$Utils$overlayParams,
										_List_fromArray(
											[p]),
										res.store,
										rest.store)
								}),
							A2(
								$elm$core$List$cons,
								{arg: e, param: p, scount: scount},
								steps));
					}
				} else {
					break _v24$2;
				}
			}
		}
		return _Utils_Tuple2(
			_Utils_update(
				$author$project$IMP$Eval$defaultFwdRes,
				{
					store: _List_fromArray(
						[
							_Utils_Tuple2(
							'error',
							$author$project$IMP$Syntax$VError('Argument count mismatch'))
						])
				}),
			_List_Nil);
	});
var $author$project$IMP$Eval$exec = F7(
	function (funcEnv, store, holeBindings, riStmts, stmt, readOnly, scount) {
		exec:
		while (true) {
			switch (stmt.$) {
				case 'SSkip':
					return {readOnly: readOnly, riStmts: riStmts, scount: scount, store: store};
				case 'SAssign':
					var e1 = stmt.b;
					var e2 = stmt.c;
					var v = A3($author$project$IMP$Eval$eval, store, holeBindings, e2);
					switch (e1.$) {
						case 'EVar':
							var x = e1.b;
							var newReadOnly = A2($elm$core$Set$member, x, readOnly) ? A2($elm$core$Set$remove, x, readOnly) : readOnly;
							_v5$3:
							while (true) {
								switch (v.$) {
									case 'VHole':
										if (v.a.$ === 'HTmp') {
											var _v6 = v.a;
											var e_ = A3($author$project$IMP$Eval$simplifyExpr, store, e2, holeBindings);
											return {
												readOnly: newReadOnly,
												riStmts: _Utils_ap(
													riStmts,
													_List_fromArray(
														[
															_Utils_Tuple3(
															scount,
															A3($author$project$IMP$Syntax$SAssign, _List_Nil, e1, e_),
															store)
														])),
												scount: scount + 1,
												store: A3(
													$author$project$IMP$Utils$updateStore,
													x,
													A2(
														$author$project$IMP$Syntax$VHole,
														$author$project$IMP$Syntax$HVar(x),
														scount),
													store)
											};
										} else {
											break _v5$3;
										}
									case 'VError':
										return _Utils_update(
											$author$project$IMP$Eval$defaultFwdRes,
											{
												store: _List_fromArray(
													[
														_Utils_Tuple2(
														'error',
														$author$project$IMP$Syntax$VError('Unsupported expression'))
													])
											});
									case 'VList':
										var vs = v.a;
										if ($author$project$IMP$Utils$hasHole(vs)) {
											var resv = A4(
												$author$project$IMP$Eval$processHoleinList,
												vs,
												x,
												scount,
												$author$project$IMP$Syntax$VList(_List_Nil));
											var rese = A3($author$project$IMP$Eval$simplifyExpr, store, e2, holeBindings);
											return {
												readOnly: newReadOnly,
												riStmts: _Utils_ap(
													riStmts,
													_List_fromArray(
														[
															_Utils_Tuple3(
															scount,
															A3($author$project$IMP$Syntax$SAssign, _List_Nil, e1, rese),
															store)
														])),
												scount: scount + 1,
												store: A3(
													$author$project$IMP$Utils$updateStore,
													x,
													$author$project$IMP$Syntax$VList(resv),
													store)
											};
										} else {
											return {
												readOnly: newReadOnly,
												riStmts: riStmts,
												scount: scount,
												store: A3(
													$author$project$IMP$Utils$updateStore,
													x,
													$author$project$IMP$Syntax$VList(vs),
													store)
											};
										}
									default:
										break _v5$3;
								}
							}
							return {
								readOnly: newReadOnly,
								riStmts: riStmts,
								scount: scount,
								store: A3($author$project$IMP$Utils$updateStore, x, v, store)
							};
						case 'EIndex':
							var _v7 = A3($author$project$IMP$Eval$findIndex, store, holeBindings, e1);
							var x = _v7.a;
							var path = _v7.b;
							var newReadOnly = A2($elm$core$Set$member, x, readOnly) ? A2($elm$core$Set$remove, x, readOnly) : readOnly;
							var residualizeLoc = function () {
								var e2_ = A3($author$project$IMP$Eval$simplifyExpr, store, e2, holeBindings);
								var e1_ = A3($author$project$IMP$Eval$simplifyLhs, store, e1, holeBindings);
								return {
									readOnly: newReadOnly,
									riStmts: _Utils_ap(
										riStmts,
										_List_fromArray(
											[
												_Utils_Tuple3(
												scount,
												A3($author$project$IMP$Syntax$SAssign, _List_Nil, e1_, e2_),
												store)
											])),
									scount: scount + 1,
									store: A3(
										$author$project$IMP$Utils$updateStore,
										x,
										A2(
											$author$project$IMP$Syntax$VHole,
											$author$project$IMP$Syntax$HVar(x),
											scount),
										store)
								};
							}();
							switch (path.$) {
								case 'VHole':
									return residualizeLoc;
								case 'VList':
									var p = path.a;
									var _v9 = A2($author$project$IMP$Utils$lookup, x, store);
									if ((_v9.$ === 'Just') && (_v9.a.$ === 'VList')) {
										var vs = _v9.a.a;
										switch (v.$) {
											case 'VHole':
												var newv = A3(
													$author$project$IMP$Utils$updateValue,
													path,
													$author$project$IMP$Syntax$VList(vs),
													A2(
														$author$project$IMP$Syntax$VHole,
														A2(
															$author$project$IMP$Utils$pathToName,
															$author$project$IMP$Syntax$HVar(x),
															path),
														scount));
												var e2_ = A3($author$project$IMP$Eval$simplifyExpr, store, e2, holeBindings);
												var e1_ = A3($author$project$IMP$Eval$simplifyLhs, store, e1, holeBindings);
												return {
													readOnly: newReadOnly,
													riStmts: _Utils_ap(
														riStmts,
														_List_fromArray(
															[
																_Utils_Tuple3(
																scount,
																A3($author$project$IMP$Syntax$SAssign, _List_Nil, e1_, e2_),
																store)
															])),
													scount: scount + 1,
													store: A3($author$project$IMP$Utils$updateStore, x, newv, store)
												};
											case 'VList':
												var vs_ = v.a;
												if ($author$project$IMP$Utils$hasHole(vs_)) {
													var resv = A4($author$project$IMP$Eval$processHoleinList, vs_, x, scount, path);
													var newv = A3(
														$author$project$IMP$Utils$updateValue,
														path,
														$author$project$IMP$Syntax$VList(vs),
														$author$project$IMP$Syntax$VList(resv));
													var e2_ = A3($author$project$IMP$Eval$simplifyExpr, store, e2, holeBindings);
													var e1_ = A3($author$project$IMP$Eval$simplifyLhs, store, e1, holeBindings);
													return {
														readOnly: newReadOnly,
														riStmts: _Utils_ap(
															riStmts,
															_List_fromArray(
																[
																	_Utils_Tuple3(
																	scount,
																	A3($author$project$IMP$Syntax$SAssign, _List_Nil, e1_, e2_),
																	store)
																])),
														scount: scount + 1,
														store: A3($author$project$IMP$Utils$updateStore, x, newv, store)
													};
												} else {
													return {
														readOnly: newReadOnly,
														riStmts: riStmts,
														scount: scount,
														store: A3(
															$author$project$IMP$Utils$updateStore,
															x,
															A3(
																$author$project$IMP$Utils$updateValue,
																path,
																$author$project$IMP$Syntax$VList(vs),
																v),
															store)
													};
												}
											default:
												return {
													readOnly: newReadOnly,
													riStmts: riStmts,
													scount: scount,
													store: A3(
														$author$project$IMP$Utils$updateStore,
														x,
														A3(
															$author$project$IMP$Utils$updateValue,
															path,
															$author$project$IMP$Syntax$VList(vs),
															v),
														store)
												};
										}
									} else {
										return residualizeLoc;
									}
								default:
									return residualizeLoc;
							}
						default:
							return _Utils_update(
								$author$project$IMP$Eval$defaultFwdRes,
								{
									store: _List_fromArray(
										[
											_Utils_Tuple2(
											'error',
											$author$project$IMP$Syntax$VError('Unsupported expression'))
										])
								});
					}
				case 'SSeq':
					var s1 = stmt.b;
					var s2 = stmt.c;
					var res1 = A7($author$project$IMP$Eval$exec, funcEnv, store, holeBindings, riStmts, s1, readOnly, scount);
					if ($author$project$IMP$Utils$isErrorStore(res1.store)) {
						return res1;
					} else {
						var $temp$funcEnv = funcEnv,
							$temp$store = res1.store,
							$temp$holeBindings = holeBindings,
							$temp$riStmts = res1.riStmts,
							$temp$stmt = s2,
							$temp$readOnly = res1.readOnly,
							$temp$scount = res1.scount;
						funcEnv = $temp$funcEnv;
						store = $temp$store;
						holeBindings = $temp$holeBindings;
						riStmts = $temp$riStmts;
						stmt = $temp$stmt;
						readOnly = $temp$readOnly;
						scount = $temp$scount;
						continue exec;
					}
				case 'SIf':
					var e = stmt.b;
					var s1 = stmt.c;
					var s2 = stmt.d;
					var v = A3($author$project$IMP$Eval$eval, store, holeBindings, e);
					_v11$3:
					while (true) {
						switch (v.$) {
							case 'VHole':
								if (v.a.$ === 'HTmp') {
									var _v12 = v.a;
									var mod = $author$project$IMP$Utils$unique(
										_Utils_ap(
											A2($author$project$IMP$Utils$modVars, funcEnv, s1),
											A2($author$project$IMP$Utils$modVars, funcEnv, s2)));
									var store_ = A3($author$project$IMP$Utils$polluteState, mod, store, scount);
									var e_ = A3($author$project$IMP$Eval$simplifyExpr, store, e, holeBindings);
									return {
										readOnly: readOnly,
										riStmts: _Utils_ap(
											riStmts,
											_List_fromArray(
												[
													_Utils_Tuple3(
													scount,
													A4($author$project$IMP$Syntax$SIf, _List_Nil, e_, s1, s2),
													store)
												])),
										scount: scount + 1,
										store: store_
									};
								} else {
									break _v11$3;
								}
							case 'VBool':
								if (v.a) {
									var $temp$funcEnv = funcEnv,
										$temp$store = store,
										$temp$holeBindings = holeBindings,
										$temp$riStmts = riStmts,
										$temp$stmt = s1,
										$temp$readOnly = readOnly,
										$temp$scount = scount;
									funcEnv = $temp$funcEnv;
									store = $temp$store;
									holeBindings = $temp$holeBindings;
									riStmts = $temp$riStmts;
									stmt = $temp$stmt;
									readOnly = $temp$readOnly;
									scount = $temp$scount;
									continue exec;
								} else {
									var $temp$funcEnv = funcEnv,
										$temp$store = store,
										$temp$holeBindings = holeBindings,
										$temp$riStmts = riStmts,
										$temp$stmt = s2,
										$temp$readOnly = readOnly,
										$temp$scount = scount;
									funcEnv = $temp$funcEnv;
									store = $temp$store;
									holeBindings = $temp$holeBindings;
									riStmts = $temp$riStmts;
									stmt = $temp$stmt;
									readOnly = $temp$readOnly;
									scount = $temp$scount;
									continue exec;
								}
							default:
								break _v11$3;
						}
					}
					return _Utils_update(
						$author$project$IMP$Eval$defaultFwdRes,
						{
							store: _List_fromArray(
								[
									_Utils_Tuple2(
									'error',
									$author$project$IMP$Syntax$VError('Unsupported guard of If'))
								])
						});
				case 'SWhile':
					var e = stmt.b;
					var s = stmt.c;
					var _v13 = A3($author$project$IMP$Eval$eval, store, holeBindings, e);
					_v13$3:
					while (true) {
						switch (_v13.$) {
							case 'VHole':
								if (_v13.a.$ === 'HTmp') {
									var _v14 = _v13.a;
									var mod = $author$project$IMP$Utils$unique(
										A2($author$project$IMP$Utils$modVars, funcEnv, s));
									var store_ = A3($author$project$IMP$Utils$polluteState, mod, store, scount);
									var e_ = A3($author$project$IMP$Eval$simplifyExpr, store, e, holeBindings);
									return {
										readOnly: readOnly,
										riStmts: _Utils_ap(
											riStmts,
											_List_fromArray(
												[
													_Utils_Tuple3(
													scount,
													A4(
														$author$project$IMP$Syntax$SIf,
														_List_Nil,
														e_,
														A3(
															$author$project$IMP$Syntax$SSeq,
															_List_Nil,
															s,
															A3($author$project$IMP$Syntax$SWhile, _List_Nil, e, s)),
														$author$project$IMP$Syntax$SSkip(_List_Nil)),
													store)
												])),
										scount: scount + 1,
										store: store_
									};
								} else {
									break _v13$3;
								}
							case 'VBool':
								if (_v13.a) {
									var $temp$funcEnv = funcEnv,
										$temp$store = store,
										$temp$holeBindings = holeBindings,
										$temp$riStmts = riStmts,
										$temp$stmt = A3($author$project$IMP$Syntax$SSeq, _List_Nil, s, stmt),
										$temp$readOnly = readOnly,
										$temp$scount = scount;
									funcEnv = $temp$funcEnv;
									store = $temp$store;
									holeBindings = $temp$holeBindings;
									riStmts = $temp$riStmts;
									stmt = $temp$stmt;
									readOnly = $temp$readOnly;
									scount = $temp$scount;
									continue exec;
								} else {
									return {readOnly: readOnly, riStmts: riStmts, scount: scount, store: store};
								}
							default:
								break _v13$3;
						}
					}
					return _Utils_update(
						$author$project$IMP$Eval$defaultFwdRes,
						{
							store: _List_fromArray(
								[
									_Utils_Tuple2(
									'error',
									$author$project$IMP$Syntax$VError('Unsupported guard of While'))
								])
						});
				case 'SRead':
					var x = stmt.b;
					var input = A2($author$project$IMP$Utils$lookup, 'input', store);
					_v15$2:
					while (true) {
						if (input.$ === 'Just') {
							switch (input.a.$) {
								case 'VList':
									if (input.a.a.b) {
										var _v16 = input.a.a;
										var v = _v16.a;
										var rest = _v16.b;
										var newstore = A3($author$project$IMP$Utils$updateStore, x, v, store);
										return {
											readOnly: A2($elm$core$Set$insert, x, readOnly),
											riStmts: riStmts,
											scount: scount,
											store: A3(
												$author$project$IMP$Utils$updateStore,
												'input',
												$author$project$IMP$Syntax$VList(rest),
												newstore)
										};
									} else {
										break _v15$2;
									}
								case 'VHole':
									var _v17 = input.a;
									var newstore = A3(
										$author$project$IMP$Utils$updateStore,
										x,
										A2(
											$author$project$IMP$Syntax$VHole,
											$author$project$IMP$Syntax$HVar(x),
											scount),
										store);
									return {
										readOnly: A2($elm$core$Set$insert, x, readOnly),
										riStmts: _Utils_ap(
											riStmts,
											_List_fromArray(
												[
													_Utils_Tuple3(
													scount,
													A2($author$project$IMP$Syntax$SRead, _List_Nil, x),
													store)
												])),
										scount: scount + 1,
										store: A3(
											$author$project$IMP$Utils$updateStore,
											'input',
											A2(
												$author$project$IMP$Syntax$VHole,
												$author$project$IMP$Syntax$HVar('input'),
												scount),
											newstore)
									};
								default:
									break _v15$2;
							}
						} else {
							break _v15$2;
						}
					}
					return _Utils_update(
						$author$project$IMP$Eval$defaultFwdRes,
						{
							store: _List_fromArray(
								[
									_Utils_Tuple2(
									'error',
									$author$project$IMP$Syntax$VError('Input not found'))
								])
						});
				case 'SPrint':
					var e = stmt.b;
					var oldval = A2($author$project$IMP$Utils$lookup, 'output', store);
					var _v18 = A3($author$project$IMP$Eval$eval, store, holeBindings, e);
					_v18$3:
					while (true) {
						switch (_v18.$) {
							case 'VHole':
								if (_v18.a.$ === 'HTmp') {
									var _v19 = _v18.a;
									var e_ = A3($author$project$IMP$Eval$simplifyExpr, store, e, holeBindings);
									if ((oldval.$ === 'Just') && (oldval.a.$ === 'VList')) {
										var vs = oldval.a.a;
										return {
											readOnly: readOnly,
											riStmts: _Utils_ap(
												riStmts,
												_List_fromArray(
													[
														_Utils_Tuple3(
														scount,
														A2($author$project$IMP$Syntax$SPrint, _List_Nil, e_),
														store)
													])),
											scount: scount + 1,
											store: A3(
												$author$project$IMP$Utils$updateStore,
												'output',
												$author$project$IMP$Syntax$VList(
													_Utils_ap(
														vs,
														_List_fromArray(
															[
																A2(
																$author$project$IMP$Utils$outputSuffixHole,
																$elm$core$List$length(vs),
																scount)
															]))),
												store)
										};
									} else {
										return _Utils_update(
											$author$project$IMP$Eval$defaultFwdRes,
											{
												store: _List_fromArray(
													[
														_Utils_Tuple2(
														'error',
														$author$project$IMP$Syntax$VError('Output not found'))
													])
											});
									}
								} else {
									break _v18$3;
								}
							case 'VError':
								return _Utils_update(
									$author$project$IMP$Eval$defaultFwdRes,
									{
										store: _List_fromArray(
											[
												_Utils_Tuple2(
												'error',
												$author$project$IMP$Syntax$VError('Unsupported expression'))
											])
									});
							case 'VList':
								var vs = _v18.a;
								if ($author$project$IMP$Utils$hasHole(vs)) {
									var e_ = A3($author$project$IMP$Eval$simplifyExpr, store, e, holeBindings);
									if ((oldval.$ === 'Just') && (oldval.a.$ === 'VList')) {
										var vs_ = oldval.a.a;
										var resv = A4(
											$author$project$IMP$Eval$processHoleinList,
											vs,
											'output',
											scount,
											$author$project$IMP$Syntax$VList(
												_List_fromArray(
													[
														$author$project$IMP$Syntax$VInt(
														$elm$core$List$length(vs_))
													])));
										return {
											readOnly: readOnly,
											riStmts: _Utils_ap(
												riStmts,
												_List_fromArray(
													[
														_Utils_Tuple3(
														scount,
														A2($author$project$IMP$Syntax$SPrint, _List_Nil, e_),
														store)
													])),
											scount: scount + 1,
											store: A3(
												$author$project$IMP$Utils$updateStore,
												'output',
												$author$project$IMP$Syntax$VList(
													_Utils_ap(
														vs_,
														_List_fromArray(
															[
																$author$project$IMP$Syntax$VList(resv)
															]))),
												store)
										};
									} else {
										return _Utils_update(
											$author$project$IMP$Eval$defaultFwdRes,
											{
												store: _List_fromArray(
													[
														_Utils_Tuple2(
														'error',
														$author$project$IMP$Syntax$VError('Output not found'))
													])
											});
									}
								} else {
									if ((oldval.$ === 'Just') && (oldval.a.$ === 'VList')) {
										var vs_ = oldval.a.a;
										return {
											readOnly: readOnly,
											riStmts: riStmts,
											scount: scount,
											store: A3(
												$author$project$IMP$Utils$updateStore,
												'output',
												$author$project$IMP$Syntax$VList(
													_Utils_ap(
														vs_,
														_List_fromArray(
															[
																$author$project$IMP$Syntax$VList(vs)
															]))),
												store)
										};
									} else {
										return _Utils_update(
											$author$project$IMP$Eval$defaultFwdRes,
											{
												store: _List_fromArray(
													[
														_Utils_Tuple2(
														'error',
														$author$project$IMP$Syntax$VError('Output not found'))
													])
											});
									}
								}
							default:
								break _v18$3;
						}
					}
					var v = _v18;
					if ((oldval.$ === 'Just') && (oldval.a.$ === 'VList')) {
						var vs = oldval.a.a;
						return {
							readOnly: readOnly,
							riStmts: riStmts,
							scount: scount,
							store: A3(
								$author$project$IMP$Utils$updateStore,
								'output',
								$author$project$IMP$Syntax$VList(
									_Utils_ap(
										vs,
										_List_fromArray(
											[v]))),
								store)
						};
					} else {
						return _Utils_update(
							$author$project$IMP$Eval$defaultFwdRes,
							{
								store: _List_fromArray(
									[
										_Utils_Tuple2(
										'error',
										$author$project$IMP$Syntax$VError('Output not found'))
									])
							});
					}
				case 'SFuncDef':
					return _Utils_update(
						$author$project$IMP$Eval$defaultFwdRes,
						{
							store: _List_fromArray(
								[
									_Utils_Tuple2(
									'error',
									$author$project$IMP$Syntax$VError('function definition is not allowed during execution'))
								])
						});
				case 'SFuncCall':
					var name = stmt.b;
					var args = stmt.c;
					return A8($author$project$IMP$Eval$execFuncCall, funcEnv, store, holeBindings, riStmts, readOnly, scount, name, args);
				default:
					var s = stmt.a;
					return _Utils_update(
						$author$project$IMP$Eval$defaultFwdRes,
						{
							store: _List_fromArray(
								[
									_Utils_Tuple2(
									'error',
									$author$project$IMP$Syntax$VError(s))
								])
						});
			}
		}
	});
var $author$project$IMP$Eval$execFuncCall = F8(
	function (funcEnv, store, holeBindings, riStmts, readOnly, scount, name, args) {
		var _v0 = A2($author$project$IMP$Utils$lookupFunc, name, funcEnv);
		if (_v0.$ === 'Nothing') {
			return _Utils_update(
				$author$project$IMP$Eval$defaultFwdRes,
				{
					store: _List_fromArray(
						[
							_Utils_Tuple2(
							'error',
							$author$project$IMP$Syntax$VError('Function not found'))
						])
				});
		} else {
			var _v1 = _v0.a;
			var params = _v1.a;
			var body = _v1.b;
			if (!_Utils_eq(
				$elm$core$List$length(params),
				$elm$core$List$length(args))) {
				return _Utils_update(
					$author$project$IMP$Eval$defaultFwdRes,
					{
						store: _List_fromArray(
							[
								_Utils_Tuple2(
								'error',
								$author$project$IMP$Syntax$VError('Argument count mismatch'))
							])
					});
			} else {
				var saved = A2($author$project$IMP$Utils$snapshotParams, params, store);
				var readOnlyBound = A3($elm$core$List$foldl, $elm$core$Set$remove, readOnly, params);
				var _v2 = A8($author$project$IMP$Eval$bindParamsParallel, funcEnv, store, holeBindings, riStmts, readOnlyBound, scount, params, args);
				var bound = _v2.a;
				if ($author$project$IMP$Utils$isErrorStore(bound.store)) {
					return bound;
				} else {
					var res = A7($author$project$IMP$Eval$exec, funcEnv, bound.store, holeBindings, bound.riStmts, body, bound.readOnly, bound.scount);
					return $author$project$IMP$Utils$isErrorStore(res.store) ? res : _Utils_update(
						res,
						{
							readOnly: A3($author$project$IMP$Eval$restoreReadOnly, params, readOnly, res.readOnly),
							store: A2($author$project$IMP$Utils$restoreParams, saved, res.store)
						});
				}
			}
		}
	});
var $author$project$IMP$Syntax$SFuncDef = F4(
	function (a, b, c, d) {
		return {$: 'SFuncDef', a: a, b: b, c: c, d: d};
	});
var $author$project$IMP$Parser_$AIndex = F3(
	function (a, b, c) {
		return {$: 'AIndex', a: a, b: b, c: c};
	});
var $author$project$IMP$Parser_$ALength = function (a) {
	return {$: 'ALength', a: a};
};
var $author$project$IMP$Parser_$applySuffix = F2(
	function (suf, acc) {
		if (suf.$ === 'AIndex') {
			var s1 = suf.a;
			var ix = suf.b;
			var s2 = suf.c;
			return A3(
				$author$project$IMP$Syntax$EIndex,
				_List_fromArray(
					[s1, s2]),
				acc,
				ix);
		} else {
			var s = suf.a;
			return A2(
				$author$project$IMP$Syntax$ELength,
				_List_fromArray(
					[s]),
				acc);
		}
	});
var $elm$parser$Parser$Advanced$backtrackable = function (_v0) {
	var parse = _v0.a;
	return $elm$parser$Parser$Advanced$Parser(
		function (s0) {
			var _v1 = parse(s0);
			if (_v1.$ === 'Bad') {
				var x = _v1.b;
				return A2($elm$parser$Parser$Advanced$Bad, false, x);
			} else {
				var a = _v1.b;
				var s1 = _v1.c;
				return A3($elm$parser$Parser$Advanced$Good, false, a, s1);
			}
		});
};
var $elm$parser$Parser$backtrackable = $elm$parser$Parser$Advanced$backtrackable;
var $Punie$elm_parser_extras$Parser$Expression$initOps = {lassoc: _List_Nil, nassoc: _List_Nil, postfix: _List_Nil, prefix: _List_Nil, rassoc: _List_Nil};
var $elm$core$Tuple$pair = F2(
	function (a, b) {
		return _Utils_Tuple2(a, b);
	});
var $elm$parser$Parser$Problem = function (a) {
	return {$: 'Problem', a: a};
};
var $elm$parser$Parser$Advanced$problem = function (x) {
	return $elm$parser$Parser$Advanced$Parser(
		function (s) {
			return A2(
				$elm$parser$Parser$Advanced$Bad,
				false,
				A2($elm$parser$Parser$Advanced$fromState, s, x));
		});
};
var $elm$parser$Parser$problem = function (msg) {
	return $elm$parser$Parser$Advanced$problem(
		$elm$parser$Parser$Problem(msg));
};
var $Punie$elm_parser_extras$Parser$Expression$splitOp = F2(
	function (operator, ops) {
		var rassoc = ops.rassoc;
		var lassoc = ops.lassoc;
		var nassoc = ops.nassoc;
		var prefix = ops.prefix;
		var postfix = ops.postfix;
		switch (operator.$) {
			case 'Infix':
				switch (operator.b.$) {
					case 'AssocNone':
						var op = operator.a;
						var _v1 = operator.b;
						return _Utils_update(
							ops,
							{
								nassoc: A2($elm$core$List$cons, op, ops.nassoc)
							});
					case 'AssocLeft':
						var op = operator.a;
						var _v2 = operator.b;
						return _Utils_update(
							ops,
							{
								lassoc: A2($elm$core$List$cons, op, ops.lassoc)
							});
					default:
						var op = operator.a;
						var _v3 = operator.b;
						return _Utils_update(
							ops,
							{
								rassoc: A2($elm$core$List$cons, op, ops.rassoc)
							});
				}
			case 'Prefix':
				var op = operator.a;
				return _Utils_update(
					ops,
					{
						prefix: A2($elm$core$List$cons, op, ops.prefix)
					});
			default:
				var op = operator.a;
				return _Utils_update(
					ops,
					{
						postfix: A2($elm$core$List$cons, op, ops.postfix)
					});
		}
	});
var $Punie$elm_parser_extras$Parser$Expression$makeParser = F2(
	function (ops, term) {
		var ambiguous = F2(
			function (assoc, op) {
				return $elm$parser$Parser$backtrackable(
					A2(
						$elm$parser$Parser$andThen,
						function (_v3) {
							return $elm$parser$Parser$problem('ambiguous use of a ' + (assoc + ' associative operator'));
						},
						op));
			});
		var _v0 = A3($elm$core$List$foldr, $Punie$elm_parser_extras$Parser$Expression$splitOp, $Punie$elm_parser_extras$Parser$Expression$initOps, ops);
		var rassoc = _v0.rassoc;
		var lassoc = _v0.lassoc;
		var nassoc = _v0.nassoc;
		var prefix = _v0.prefix;
		var postfix = _v0.postfix;
		var lassocOp = $elm$parser$Parser$oneOf(lassoc);
		var ambiguousLeft = A2(ambiguous, 'left', lassocOp);
		var nassocOp = $elm$parser$Parser$oneOf(nassoc);
		var ambiguousNon = A2(ambiguous, 'non', nassocOp);
		var postfixOp = $elm$parser$Parser$oneOf(postfix);
		var postfixP = $elm$parser$Parser$oneOf(
			_List_fromArray(
				[
					postfixOp,
					$elm$parser$Parser$succeed($elm$core$Basics$identity)
				]));
		var prefixOp = $elm$parser$Parser$oneOf(prefix);
		var prefixP = $elm$parser$Parser$oneOf(
			_List_fromArray(
				[
					prefixOp,
					$elm$parser$Parser$succeed($elm$core$Basics$identity)
				]));
		var termP = A2(
			$elm$parser$Parser$keeper,
			A2(
				$elm$parser$Parser$keeper,
				A2(
					$elm$parser$Parser$keeper,
					$elm$parser$Parser$succeed(
						F3(
							function (pre, x, post) {
								return post(
									pre(x));
							})),
					prefixP),
				term),
			postfixP);
		var rassocOp = $elm$parser$Parser$oneOf(rassoc);
		var ambiguousRight = A2(ambiguous, 'right', rassocOp);
		var lassocP = function (x) {
			return $elm$parser$Parser$oneOf(
				_List_fromArray(
					[
						A2(
						$elm$parser$Parser$andThen,
						function (_v2) {
							var f = _v2.a;
							var y = _v2.b;
							return lassocP1(
								A2(f, x, y));
						},
						A2(
							$elm$parser$Parser$keeper,
							A2(
								$elm$parser$Parser$keeper,
								$elm$parser$Parser$succeed($elm$core$Tuple$pair),
								lassocOp),
							termP)),
						ambiguousRight,
						ambiguousNon
					]));
		};
		var lassocP1 = function (x) {
			return $elm$parser$Parser$oneOf(
				_List_fromArray(
					[
						lassocP(x),
						$elm$parser$Parser$succeed(x)
					]));
		};
		var nassocP = function (x) {
			return A2(
				$elm$parser$Parser$andThen,
				function (_v1) {
					var f = _v1.a;
					var y = _v1.b;
					return $elm$parser$Parser$oneOf(
						_List_fromArray(
							[
								ambiguousRight,
								ambiguousLeft,
								ambiguousNon,
								$elm$parser$Parser$succeed(
								A2(f, x, y))
							]));
				},
				A2(
					$elm$parser$Parser$keeper,
					A2(
						$elm$parser$Parser$keeper,
						$elm$parser$Parser$succeed($elm$core$Tuple$pair),
						nassocOp),
					termP));
		};
		var rassocP = function (x) {
			return $elm$parser$Parser$oneOf(
				_List_fromArray(
					[
						A2(
						$elm$parser$Parser$keeper,
						A2(
							$elm$parser$Parser$keeper,
							$elm$parser$Parser$succeed(
								F2(
									function (f, y) {
										return A2(f, x, y);
									})),
							rassocOp),
						A2($elm$parser$Parser$andThen, rassocP1, termP)),
						ambiguousLeft,
						ambiguousNon
					]));
		};
		var rassocP1 = function (x) {
			return $elm$parser$Parser$oneOf(
				_List_fromArray(
					[
						rassocP(x),
						$elm$parser$Parser$succeed(x)
					]));
		};
		return A2(
			$elm$parser$Parser$andThen,
			function (x) {
				return $elm$parser$Parser$oneOf(
					_List_fromArray(
						[
							rassocP(x),
							lassocP(x),
							nassocP(x),
							$elm$parser$Parser$succeed(x)
						]));
			},
			termP);
	});
var $Punie$elm_parser_extras$Parser$Expression$buildExpressionParser = F2(
	function (operators, simpleExpr) {
		return A3($elm$core$List$foldl, $Punie$elm_parser_extras$Parser$Expression$makeParser, simpleExpr, operators);
	});
var $author$project$IMP$Parser_$false = A2(
	$elm$parser$Parser$keeper,
	A2(
		$elm$parser$Parser$ignorer,
		$elm$parser$Parser$succeed(
			function (s) {
				return A2(
					$author$project$IMP$Syntax$EBool,
					_List_fromArray(
						[s]),
					false);
			}),
		$elm$parser$Parser$keyword('false')),
	$author$project$IMP$Parser_$mSpaces);
var $author$project$IMP$Parser_$hole = A2(
	$elm$parser$Parser$keeper,
	A2(
		$elm$parser$Parser$ignorer,
		$elm$parser$Parser$succeed(
			function (s) {
				return A2(
					$author$project$IMP$Syntax$EHole,
					_List_fromArray(
						[s]),
					$author$project$IMP$Syntax$HOri(-1));
			}),
		$elm$parser$Parser$keyword('_')),
	$author$project$IMP$Parser_$mSpaces);
var $author$project$IMP$Parser_$int_ = A2(
	$elm$parser$Parser$keeper,
	A2(
		$elm$parser$Parser$keeper,
		$elm$parser$Parser$succeed(
			F2(
				function (n, s) {
					return A2(
						$author$project$IMP$Syntax$EInt,
						_List_fromArray(
							[s]),
						n);
				})),
		$elm$parser$Parser$int),
	$author$project$IMP$Parser_$mSpaces);
var $Punie$elm_parser_extras$Parser$Expression$AssocLeft = {$: 'AssocLeft'};
var $Punie$elm_parser_extras$Parser$Expression$AssocNone = {$: 'AssocNone'};
var $Punie$elm_parser_extras$Parser$Expression$Infix = F2(
	function (a, b) {
		return {$: 'Infix', a: a, b: b};
	});
var $Punie$elm_parser_extras$Parser$Expression$Prefix = function (a) {
	return {$: 'Prefix', a: a};
};
var $author$project$IMP$Parser_$bopParser = function (s) {
	return A2(
		$elm$parser$Parser$keeper,
		A2(
			$elm$parser$Parser$ignorer,
			$elm$parser$Parser$succeed(
				function (ws) {
					return A2(
						$author$project$IMP$Syntax$Eop,
						_List_fromArray(
							[ws]),
						s);
				}),
			$elm$parser$Parser$symbol(s)),
		$author$project$IMP$Parser_$mSpaces);
};
var $author$project$IMP$Parser_$uopParser = A2(
	$elm$parser$Parser$keeper,
	A2(
		$elm$parser$Parser$ignorer,
		$elm$parser$Parser$succeed(
			function (ws) {
				return $author$project$IMP$Syntax$ENot(
					_List_fromArray(
						[ws]));
			}),
		$elm$parser$Parser$symbol('!')),
	$author$project$IMP$Parser_$mSpaces);
var $author$project$IMP$Parser_$operators = _List_fromArray(
	[
		_List_fromArray(
		[
			$Punie$elm_parser_extras$Parser$Expression$Prefix($author$project$IMP$Parser_$uopParser)
		]),
		_List_fromArray(
		[
			A2(
			$Punie$elm_parser_extras$Parser$Expression$Infix,
			$author$project$IMP$Parser_$bopParser('*'),
			$Punie$elm_parser_extras$Parser$Expression$AssocLeft),
			A2(
			$Punie$elm_parser_extras$Parser$Expression$Infix,
			$author$project$IMP$Parser_$bopParser('/'),
			$Punie$elm_parser_extras$Parser$Expression$AssocLeft)
		]),
		_List_fromArray(
		[
			A2(
			$Punie$elm_parser_extras$Parser$Expression$Infix,
			$author$project$IMP$Parser_$bopParser('++'),
			$Punie$elm_parser_extras$Parser$Expression$AssocLeft),
			A2(
			$Punie$elm_parser_extras$Parser$Expression$Infix,
			$elm$parser$Parser$backtrackable(
				$author$project$IMP$Parser_$bopParser('+')),
			$Punie$elm_parser_extras$Parser$Expression$AssocLeft),
			A2(
			$Punie$elm_parser_extras$Parser$Expression$Infix,
			$author$project$IMP$Parser_$bopParser('-'),
			$Punie$elm_parser_extras$Parser$Expression$AssocLeft)
		]),
		_List_fromArray(
		[
			A2(
			$Punie$elm_parser_extras$Parser$Expression$Infix,
			$author$project$IMP$Parser_$bopParser('<='),
			$Punie$elm_parser_extras$Parser$Expression$AssocNone),
			A2(
			$Punie$elm_parser_extras$Parser$Expression$Infix,
			$author$project$IMP$Parser_$bopParser('>='),
			$Punie$elm_parser_extras$Parser$Expression$AssocNone),
			A2(
			$Punie$elm_parser_extras$Parser$Expression$Infix,
			$author$project$IMP$Parser_$bopParser('=='),
			$Punie$elm_parser_extras$Parser$Expression$AssocNone),
			A2(
			$Punie$elm_parser_extras$Parser$Expression$Infix,
			$author$project$IMP$Parser_$bopParser('!='),
			$Punie$elm_parser_extras$Parser$Expression$AssocNone),
			A2(
			$Punie$elm_parser_extras$Parser$Expression$Infix,
			$elm$parser$Parser$backtrackable(
				$author$project$IMP$Parser_$bopParser('<')),
			$Punie$elm_parser_extras$Parser$Expression$AssocNone),
			A2(
			$Punie$elm_parser_extras$Parser$Expression$Infix,
			$elm$parser$Parser$backtrackable(
				$author$project$IMP$Parser_$bopParser('>')),
			$Punie$elm_parser_extras$Parser$Expression$AssocNone)
		]),
		_List_fromArray(
		[
			A2(
			$Punie$elm_parser_extras$Parser$Expression$Infix,
			$author$project$IMP$Parser_$bopParser('&&'),
			$Punie$elm_parser_extras$Parser$Expression$AssocLeft)
		]),
		_List_fromArray(
		[
			A2(
			$Punie$elm_parser_extras$Parser$Expression$Infix,
			$author$project$IMP$Parser_$bopParser('||'),
			$Punie$elm_parser_extras$Parser$Expression$AssocLeft)
		])
	]);
var $elm$core$Tuple$second = function (_v0) {
	var y = _v0.b;
	return y;
};
var $author$project$IMP$Parser_$string = A2(
	$elm$parser$Parser$keeper,
	A2(
		$elm$parser$Parser$keeper,
		A2(
			$elm$parser$Parser$ignorer,
			$elm$parser$Parser$succeed(
				F2(
					function (s, ws) {
						return A2(
							$author$project$IMP$Syntax$EString,
							_List_fromArray(
								[ws]),
							s);
					})),
			$elm$parser$Parser$symbol('\"')),
		A2(
			$elm$parser$Parser$ignorer,
			$author$project$IMP$Parser_$string_,
			$elm$parser$Parser$symbol('\"'))),
	$author$project$IMP$Parser_$mSpaces);
var $author$project$IMP$Parser_$true = A2(
	$elm$parser$Parser$keeper,
	A2(
		$elm$parser$Parser$ignorer,
		$elm$parser$Parser$succeed(
			function (s) {
				return A2(
					$author$project$IMP$Syntax$EBool,
					_List_fromArray(
						[s]),
					true);
			}),
		$elm$parser$Parser$keyword('true')),
	$author$project$IMP$Parser_$mSpaces);
var $author$project$IMP$Parser_$varName = $elm$parser$Parser$variable(
	{
		inner: function (c) {
			return $elm$core$Char$isAlphaNum(c) || _Utils_eq(
				c,
				_Utils_chr('_'));
		},
		reserved: $elm$core$Set$fromList(
			_List_fromArray(
				['if', 'then', 'else', 'end', 'while', 'do', 'skip', 'read', 'print', 'true', 'false', 'length', 'input', 'output', 'func'])),
		start: $elm$core$Char$isLower
	});
var $author$project$IMP$Parser_$var = A2(
	$elm$parser$Parser$keeper,
	A2(
		$elm$parser$Parser$keeper,
		$elm$parser$Parser$succeed(
			F2(
				function (v, s) {
					return A2(
						$author$project$IMP$Syntax$EVar,
						_List_fromArray(
							[s]),
						v);
				})),
		$author$project$IMP$Parser_$varName),
	$author$project$IMP$Parser_$mSpaces);
var $author$project$IMP$Parser_$listTailHelper = function (revItems) {
	return $elm$parser$Parser$oneOf(
		_List_fromArray(
			[
				A2(
				$elm$parser$Parser$keeper,
				A2(
					$elm$parser$Parser$keeper,
					A2(
						$elm$parser$Parser$ignorer,
						$elm$parser$Parser$succeed(
							F2(
								function (s, e) {
									return $elm$parser$Parser$Loop(
										A2(
											$elm$core$List$cons,
											_Utils_Tuple2(s, e),
											revItems));
								})),
						$elm$parser$Parser$symbol(',')),
					$author$project$IMP$Parser_$mSpaces),
				$elm$parser$Parser$lazy(
					function (_v3) {
						return $author$project$IMP$Parser_$cyclic$expr();
					})),
				A2(
				$elm$parser$Parser$map,
				function (_v4) {
					return $elm$parser$Parser$Done(
						$elm$core$List$reverse(revItems));
				},
				$elm$parser$Parser$succeed(_Utils_Tuple0))
			]));
};
var $author$project$IMP$Parser_$suffixHelper = function (revSufs) {
	return $elm$parser$Parser$oneOf(
		_List_fromArray(
			[
				A2(
				$elm$parser$Parser$keeper,
				A2(
					$elm$parser$Parser$keeper,
					A2(
						$elm$parser$Parser$keeper,
						A2(
							$elm$parser$Parser$ignorer,
							$elm$parser$Parser$succeed(
								F3(
									function (s1, e, s2) {
										return $elm$parser$Parser$Loop(
											A2(
												$elm$core$List$cons,
												A3($author$project$IMP$Parser_$AIndex, s1, e, s2),
												revSufs));
									})),
							$elm$parser$Parser$symbol('[')),
						$author$project$IMP$Parser_$mSpaces),
					A2(
						$elm$parser$Parser$ignorer,
						$elm$parser$Parser$lazy(
							function (_v0) {
								return $author$project$IMP$Parser_$cyclic$expr();
							}),
						$elm$parser$Parser$symbol(']'))),
				$author$project$IMP$Parser_$mSpaces),
				A2(
				$elm$parser$Parser$keeper,
				A2(
					$elm$parser$Parser$ignorer,
					A2(
						$elm$parser$Parser$ignorer,
						$elm$parser$Parser$succeed(
							function (s) {
								return $elm$parser$Parser$Loop(
									A2(
										$elm$core$List$cons,
										$author$project$IMP$Parser_$ALength(s),
										revSufs));
							}),
						$elm$parser$Parser$symbol('.')),
					$elm$parser$Parser$keyword('length')),
				$author$project$IMP$Parser_$mSpaces),
				A2(
				$elm$parser$Parser$map,
				function (_v1) {
					return $elm$parser$Parser$Done(
						$elm$core$List$reverse(revSufs));
				},
				$elm$parser$Parser$succeed(_Utils_Tuple0))
			]));
};
function $author$project$IMP$Parser_$cyclic$aexpr() {
	return A2(
		$elm$parser$Parser$keeper,
		A2(
			$elm$parser$Parser$keeper,
			$elm$parser$Parser$succeed(
				F2(
					function (e, sufs) {
						return A3($elm$core$List$foldl, $author$project$IMP$Parser_$applySuffix, e, sufs);
					})),
			$author$project$IMP$Parser_$cyclic$atom()),
		$author$project$IMP$Parser_$cyclic$suffixes());
}
function $author$project$IMP$Parser_$cyclic$atom() {
	return $elm$parser$Parser$oneOf(
		_List_fromArray(
			[
				$author$project$IMP$Parser_$hole,
				$author$project$IMP$Parser_$true,
				$author$project$IMP$Parser_$false,
				$author$project$IMP$Parser_$int_,
				$author$project$IMP$Parser_$string,
				$author$project$IMP$Parser_$var,
				$author$project$IMP$Parser_$cyclic$parens_(),
				$author$project$IMP$Parser_$cyclic$list()
			]));
}
function $author$project$IMP$Parser_$cyclic$expr() {
	return A2(
		$Punie$elm_parser_extras$Parser$Expression$buildExpressionParser,
		$author$project$IMP$Parser_$operators,
		$elm$parser$Parser$lazy(
			function (_v7) {
				return $author$project$IMP$Parser_$cyclic$aexpr();
			}));
}
function $author$project$IMP$Parser_$cyclic$list() {
	return A2(
		$elm$parser$Parser$keeper,
		A2(
			$elm$parser$Parser$keeper,
			A2(
				$elm$parser$Parser$keeper,
				A2(
					$elm$parser$Parser$ignorer,
					$elm$parser$Parser$succeed(
						F3(
							function (sOpen, parts, sClose) {
								var _v6 = parts;
								var commaWs = _v6.a;
								var exprs = _v6.b;
								return A2(
									$author$project$IMP$Syntax$EList,
									A2(
										$elm$core$List$cons,
										sOpen,
										_Utils_ap(
											commaWs,
											_List_fromArray(
												[sClose]))),
									exprs);
							})),
					$elm$parser$Parser$symbol('[')),
				$author$project$IMP$Parser_$mSpaces),
			A2(
				$elm$parser$Parser$ignorer,
				$author$project$IMP$Parser_$cyclic$listItems(),
				$elm$parser$Parser$symbol(']'))),
		$author$project$IMP$Parser_$mSpaces);
}
function $author$project$IMP$Parser_$cyclic$listItems() {
	return $elm$parser$Parser$oneOf(
		_List_fromArray(
			[
				A2(
				$elm$parser$Parser$keeper,
				A2(
					$elm$parser$Parser$keeper,
					$elm$parser$Parser$succeed(
						F2(
							function (e, rest) {
								return _Utils_Tuple2(
									A2($elm$core$List$map, $elm$core$Tuple$first, rest),
									A2(
										$elm$core$List$cons,
										e,
										A2($elm$core$List$map, $elm$core$Tuple$second, rest)));
							})),
					$elm$parser$Parser$lazy(
						function (_v5) {
							return $author$project$IMP$Parser_$cyclic$expr();
						})),
				$author$project$IMP$Parser_$cyclic$listTail()),
				$elm$parser$Parser$succeed(
				_Utils_Tuple2(_List_Nil, _List_Nil))
			]));
}
function $author$project$IMP$Parser_$cyclic$listTail() {
	return A2($elm$parser$Parser$loop, _List_Nil, $author$project$IMP$Parser_$listTailHelper);
}
function $author$project$IMP$Parser_$cyclic$parens_() {
	return A2(
		$elm$parser$Parser$keeper,
		A2(
			$elm$parser$Parser$keeper,
			A2(
				$elm$parser$Parser$keeper,
				A2(
					$elm$parser$Parser$ignorer,
					$elm$parser$Parser$succeed(
						F3(
							function (s1, e, s2) {
								return A2(
									$author$project$IMP$Syntax$EParens,
									_List_fromArray(
										[s1, s2]),
									e);
							})),
					$elm$parser$Parser$symbol('(')),
				$author$project$IMP$Parser_$mSpaces),
			A2(
				$elm$parser$Parser$ignorer,
				$elm$parser$Parser$lazy(
					function (_v2) {
						return $author$project$IMP$Parser_$cyclic$expr();
					}),
				$elm$parser$Parser$symbol(')'))),
		$author$project$IMP$Parser_$mSpaces);
}
function $author$project$IMP$Parser_$cyclic$suffixes() {
	return A2($elm$parser$Parser$loop, _List_Nil, $author$project$IMP$Parser_$suffixHelper);
}
try {
	var $author$project$IMP$Parser_$aexpr = $author$project$IMP$Parser_$cyclic$aexpr();
	$author$project$IMP$Parser_$cyclic$aexpr = function () {
		return $author$project$IMP$Parser_$aexpr;
	};
	var $author$project$IMP$Parser_$atom = $author$project$IMP$Parser_$cyclic$atom();
	$author$project$IMP$Parser_$cyclic$atom = function () {
		return $author$project$IMP$Parser_$atom;
	};
	var $author$project$IMP$Parser_$expr = $author$project$IMP$Parser_$cyclic$expr();
	$author$project$IMP$Parser_$cyclic$expr = function () {
		return $author$project$IMP$Parser_$expr;
	};
	var $author$project$IMP$Parser_$list = $author$project$IMP$Parser_$cyclic$list();
	$author$project$IMP$Parser_$cyclic$list = function () {
		return $author$project$IMP$Parser_$list;
	};
	var $author$project$IMP$Parser_$listItems = $author$project$IMP$Parser_$cyclic$listItems();
	$author$project$IMP$Parser_$cyclic$listItems = function () {
		return $author$project$IMP$Parser_$listItems;
	};
	var $author$project$IMP$Parser_$listTail = $author$project$IMP$Parser_$cyclic$listTail();
	$author$project$IMP$Parser_$cyclic$listTail = function () {
		return $author$project$IMP$Parser_$listTail;
	};
	var $author$project$IMP$Parser_$parens_ = $author$project$IMP$Parser_$cyclic$parens_();
	$author$project$IMP$Parser_$cyclic$parens_ = function () {
		return $author$project$IMP$Parser_$parens_;
	};
	var $author$project$IMP$Parser_$suffixes = $author$project$IMP$Parser_$cyclic$suffixes();
	$author$project$IMP$Parser_$cyclic$suffixes = function () {
		return $author$project$IMP$Parser_$suffixes;
	};
} catch ($) {
	throw 'Some top-level definitions from `IMP.Parser_` are causing infinite recursion:\n\n  ┌─────┐\n  │    aexpr\n  │     ↓\n  │    atom\n  │     ↓\n  │    expr\n  │     ↓\n  │    list\n  │     ↓\n  │    listItems\n  │     ↓\n  │    listTail\n  │     ↓\n  │    listTailHelper\n  │     ↓\n  │    parens_\n  │     ↓\n  │    suffixes\n  │     ↓\n  │    suffixHelper\n  └─────┘\n\nThese errors are very tricky, so read https://elm-lang.org/0.19.1/bad-recursion to learn how to fix it!';}
var $author$project$IMP$Parser_$assign = A2(
	$elm$parser$Parser$keeper,
	A2(
		$elm$parser$Parser$keeper,
		A2(
			$elm$parser$Parser$keeper,
			$elm$parser$Parser$succeed(
				F3(
					function (e1, s, e2) {
						return A3(
							$author$project$IMP$Syntax$SAssign,
							_List_fromArray(
								[s]),
							e1,
							e2);
					})),
			A2(
				$elm$parser$Parser$ignorer,
				$elm$parser$Parser$lazy(
					function (_v0) {
						return $author$project$IMP$Parser_$expr;
					}),
				$elm$parser$Parser$symbol(':='))),
		$author$project$IMP$Parser_$mSpaces),
	$elm$parser$Parser$lazy(
		function (_v1) {
			return $author$project$IMP$Parser_$expr;
		}));
var $author$project$IMP$Syntax$SFuncCall = F3(
	function (a, b, c) {
		return {$: 'SFuncCall', a: a, b: b, c: c};
	});
var $author$project$IMP$Parser_$funcCall = A2(
	$elm$parser$Parser$andThen,
	function (_v0) {
		var name = _v0.a;
		var sOpen = _v0.b;
		return A2(
			$elm$parser$Parser$keeper,
			A2(
				$elm$parser$Parser$keeper,
				$elm$parser$Parser$succeed(
					F2(
						function (_v1, sClose) {
							var commaWs = _v1.a;
							var args = _v1.b;
							return A3(
								$author$project$IMP$Syntax$SFuncCall,
								A2(
									$elm$core$List$cons,
									sOpen,
									_Utils_ap(
										commaWs,
										_List_fromArray(
											[sClose]))),
								name,
								args);
						})),
				A2(
					$elm$parser$Parser$ignorer,
					$author$project$IMP$Parser_$listItems,
					$elm$parser$Parser$symbol(')'))),
			$author$project$IMP$Parser_$mSpaces);
	},
	$elm$parser$Parser$backtrackable(
		A2(
			$elm$parser$Parser$keeper,
			A2(
				$elm$parser$Parser$keeper,
				$elm$parser$Parser$succeed(
					F2(
						function (name, sOpen) {
							return _Utils_Tuple2(name, sOpen);
						})),
				A2(
					$elm$parser$Parser$ignorer,
					A2($elm$parser$Parser$ignorer, $author$project$IMP$Parser_$varName, $author$project$IMP$Parser_$mSpaces),
					$elm$parser$Parser$symbol('('))),
			$author$project$IMP$Parser_$mSpaces)));
var $author$project$IMP$Parser_$paramTailHelper = function (revItems) {
	return $elm$parser$Parser$oneOf(
		_List_fromArray(
			[
				A2(
				$elm$parser$Parser$keeper,
				A2(
					$elm$parser$Parser$keeper,
					A2(
						$elm$parser$Parser$ignorer,
						$elm$parser$Parser$succeed(
							F2(
								function (s, p) {
									return $elm$parser$Parser$Loop(
										A2(
											$elm$core$List$cons,
											_Utils_Tuple2(s, p),
											revItems));
								})),
						$elm$parser$Parser$symbol(',')),
					$author$project$IMP$Parser_$mSpaces),
				A2($elm$parser$Parser$ignorer, $author$project$IMP$Parser_$varName, $author$project$IMP$Parser_$mSpaces)),
				A2(
				$elm$parser$Parser$map,
				function (_v0) {
					return $elm$parser$Parser$Done(
						$elm$core$List$reverse(revItems));
				},
				$elm$parser$Parser$succeed(_Utils_Tuple0))
			]));
};
var $author$project$IMP$Parser_$paramTail = A2($elm$parser$Parser$loop, _List_Nil, $author$project$IMP$Parser_$paramTailHelper);
var $author$project$IMP$Parser_$paramItems = $elm$parser$Parser$oneOf(
	_List_fromArray(
		[
			A2(
			$elm$parser$Parser$keeper,
			A2(
				$elm$parser$Parser$keeper,
				$elm$parser$Parser$succeed(
					F2(
						function (p, rest) {
							return _Utils_Tuple2(
								A2($elm$core$List$map, $elm$core$Tuple$first, rest),
								A2(
									$elm$core$List$cons,
									p,
									A2($elm$core$List$map, $elm$core$Tuple$second, rest)));
						})),
				A2($elm$parser$Parser$ignorer, $author$project$IMP$Parser_$varName, $author$project$IMP$Parser_$mSpaces)),
			$author$project$IMP$Parser_$paramTail),
			$elm$parser$Parser$succeed(
			_Utils_Tuple2(_List_Nil, _List_Nil))
		]));
var $author$project$IMP$Parser_$print_ = A2(
	$elm$parser$Parser$keeper,
	A2(
		$elm$parser$Parser$keeper,
		A2(
			$elm$parser$Parser$ignorer,
			$elm$parser$Parser$succeed(
				F2(
					function (s, e) {
						return A2(
							$author$project$IMP$Syntax$SPrint,
							_List_fromArray(
								[s]),
							e);
					})),
			$elm$parser$Parser$keyword('print')),
		$author$project$IMP$Parser_$mSpaces),
	$elm$parser$Parser$lazy(
		function (_v0) {
			return $author$project$IMP$Parser_$expr;
		}));
var $author$project$IMP$Parser_$read_ = A2(
	$elm$parser$Parser$keeper,
	A2(
		$elm$parser$Parser$keeper,
		A2(
			$elm$parser$Parser$keeper,
			A2(
				$elm$parser$Parser$ignorer,
				$elm$parser$Parser$succeed(
					F3(
						function (s1, x, s2) {
							return A2(
								$author$project$IMP$Syntax$SRead,
								_List_fromArray(
									[s1, s2]),
								x);
						})),
				$elm$parser$Parser$keyword('read')),
			$author$project$IMP$Parser_$mSpaces),
		$author$project$IMP$Parser_$varName),
	$author$project$IMP$Parser_$mSpaces);
var $Punie$elm_parser_extras$Parser$Expression$AssocRight = {$: 'AssocRight'};
var $author$project$IMP$Parser_$seqOp = _List_fromArray(
	[
		_List_fromArray(
		[
			A2(
			$Punie$elm_parser_extras$Parser$Expression$Infix,
			A2(
				$elm$parser$Parser$keeper,
				A2(
					$elm$parser$Parser$ignorer,
					$elm$parser$Parser$succeed(
						function (s) {
							return $author$project$IMP$Syntax$SSeq(
								_List_fromArray(
									[s]));
						}),
					$elm$parser$Parser$symbol(';')),
				$author$project$IMP$Parser_$mSpaces),
			$Punie$elm_parser_extras$Parser$Expression$AssocRight)
		])
	]);
var $author$project$IMP$Parser_$skip = A2(
	$elm$parser$Parser$keeper,
	A2(
		$elm$parser$Parser$ignorer,
		$elm$parser$Parser$succeed(
			function (s) {
				return $author$project$IMP$Syntax$SSkip(
					_List_fromArray(
						[s]));
			}),
		$elm$parser$Parser$keyword('skip')),
	$author$project$IMP$Parser_$mSpaces);
function $author$project$IMP$Parser_$cyclic$astmt() {
	return $elm$parser$Parser$oneOf(
		_List_fromArray(
			[
				$author$project$IMP$Parser_$skip,
				$author$project$IMP$Parser_$cyclic$if_(),
				$author$project$IMP$Parser_$cyclic$while_(),
				$author$project$IMP$Parser_$read_,
				$author$project$IMP$Parser_$print_,
				$author$project$IMP$Parser_$cyclic$funcDef(),
				$author$project$IMP$Parser_$funcCall,
				$author$project$IMP$Parser_$assign
			]));
}
function $author$project$IMP$Parser_$cyclic$funcDef() {
	return A2(
		$elm$parser$Parser$keeper,
		A2(
			$elm$parser$Parser$keeper,
			A2(
				$elm$parser$Parser$keeper,
				A2(
					$elm$parser$Parser$keeper,
					A2(
						$elm$parser$Parser$keeper,
						A2(
							$elm$parser$Parser$keeper,
							A2(
								$elm$parser$Parser$keeper,
								A2(
									$elm$parser$Parser$ignorer,
									$elm$parser$Parser$succeed(
										F7(
											function (s1, name, sOpen, parts, sClose, body, sEnd) {
												var _v6 = parts;
												var commaWs = _v6.a;
												var params = _v6.b;
												return A4(
													$author$project$IMP$Syntax$SFuncDef,
													A2(
														$elm$core$List$cons,
														s1,
														A2(
															$elm$core$List$cons,
															sOpen,
															_Utils_ap(
																commaWs,
																_List_fromArray(
																	[sClose, sEnd])))),
													name,
													params,
													body);
											})),
									$elm$parser$Parser$keyword('func')),
								$author$project$IMP$Parser_$mSpaces),
							A2(
								$elm$parser$Parser$ignorer,
								A2($elm$parser$Parser$ignorer, $author$project$IMP$Parser_$varName, $author$project$IMP$Parser_$mSpaces),
								$elm$parser$Parser$symbol('('))),
						$author$project$IMP$Parser_$mSpaces),
					A2(
						$elm$parser$Parser$ignorer,
						$author$project$IMP$Parser_$paramItems,
						$elm$parser$Parser$symbol(')'))),
				$author$project$IMP$Parser_$mSpaces),
			A2(
				$elm$parser$Parser$ignorer,
				$elm$parser$Parser$lazy(
					function (_v7) {
						return $author$project$IMP$Parser_$cyclic$stmt();
					}),
				$elm$parser$Parser$keyword('end'))),
		$author$project$IMP$Parser_$mSpaces);
}
function $author$project$IMP$Parser_$cyclic$if_() {
	return A2(
		$elm$parser$Parser$keeper,
		A2(
			$elm$parser$Parser$keeper,
			A2(
				$elm$parser$Parser$keeper,
				A2(
					$elm$parser$Parser$keeper,
					A2(
						$elm$parser$Parser$keeper,
						A2(
							$elm$parser$Parser$keeper,
							A2(
								$elm$parser$Parser$keeper,
								A2(
									$elm$parser$Parser$ignorer,
									$elm$parser$Parser$succeed(
										F7(
											function (s1, e, s2, sThen, s3, sElse, s4) {
												return A4(
													$author$project$IMP$Syntax$SIf,
													_List_fromArray(
														[s1, s2, s3, s4]),
													e,
													sThen,
													sElse);
											})),
									$elm$parser$Parser$keyword('if')),
								$author$project$IMP$Parser_$mSpaces),
							A2(
								$elm$parser$Parser$ignorer,
								$elm$parser$Parser$lazy(
									function (_v3) {
										return $author$project$IMP$Parser_$expr;
									}),
								$elm$parser$Parser$keyword('then'))),
						$author$project$IMP$Parser_$mSpaces),
					A2(
						$elm$parser$Parser$ignorer,
						$elm$parser$Parser$lazy(
							function (_v4) {
								return $author$project$IMP$Parser_$cyclic$stmt();
							}),
						$elm$parser$Parser$keyword('else'))),
				$author$project$IMP$Parser_$mSpaces),
			A2(
				$elm$parser$Parser$ignorer,
				$elm$parser$Parser$lazy(
					function (_v5) {
						return $author$project$IMP$Parser_$cyclic$stmt();
					}),
				$elm$parser$Parser$keyword('end'))),
		$author$project$IMP$Parser_$mSpaces);
}
function $author$project$IMP$Parser_$cyclic$stmt() {
	return A2(
		$Punie$elm_parser_extras$Parser$Expression$buildExpressionParser,
		$author$project$IMP$Parser_$seqOp,
		$elm$parser$Parser$lazy(
			function (_v2) {
				return $author$project$IMP$Parser_$cyclic$astmt();
			}));
}
function $author$project$IMP$Parser_$cyclic$while_() {
	return A2(
		$elm$parser$Parser$keeper,
		A2(
			$elm$parser$Parser$keeper,
			A2(
				$elm$parser$Parser$keeper,
				A2(
					$elm$parser$Parser$keeper,
					A2(
						$elm$parser$Parser$keeper,
						A2(
							$elm$parser$Parser$ignorer,
							$elm$parser$Parser$succeed(
								F5(
									function (s1, e, s2, body, s3) {
										return A3(
											$author$project$IMP$Syntax$SWhile,
											_List_fromArray(
												[s1, s2, s3]),
											e,
											body);
									})),
							$elm$parser$Parser$keyword('while')),
						$author$project$IMP$Parser_$mSpaces),
					A2(
						$elm$parser$Parser$ignorer,
						$elm$parser$Parser$lazy(
							function (_v0) {
								return $author$project$IMP$Parser_$expr;
							}),
						$elm$parser$Parser$keyword('do'))),
				$author$project$IMP$Parser_$mSpaces),
			A2(
				$elm$parser$Parser$ignorer,
				$elm$parser$Parser$lazy(
					function (_v1) {
						return $author$project$IMP$Parser_$cyclic$stmt();
					}),
				$elm$parser$Parser$keyword('end'))),
		$author$project$IMP$Parser_$mSpaces);
}
try {
	var $author$project$IMP$Parser_$astmt = $author$project$IMP$Parser_$cyclic$astmt();
	$author$project$IMP$Parser_$cyclic$astmt = function () {
		return $author$project$IMP$Parser_$astmt;
	};
	var $author$project$IMP$Parser_$funcDef = $author$project$IMP$Parser_$cyclic$funcDef();
	$author$project$IMP$Parser_$cyclic$funcDef = function () {
		return $author$project$IMP$Parser_$funcDef;
	};
	var $author$project$IMP$Parser_$if_ = $author$project$IMP$Parser_$cyclic$if_();
	$author$project$IMP$Parser_$cyclic$if_ = function () {
		return $author$project$IMP$Parser_$if_;
	};
	var $author$project$IMP$Parser_$stmt = $author$project$IMP$Parser_$cyclic$stmt();
	$author$project$IMP$Parser_$cyclic$stmt = function () {
		return $author$project$IMP$Parser_$stmt;
	};
	var $author$project$IMP$Parser_$while_ = $author$project$IMP$Parser_$cyclic$while_();
	$author$project$IMP$Parser_$cyclic$while_ = function () {
		return $author$project$IMP$Parser_$while_;
	};
} catch ($) {
	throw 'Some top-level definitions from `IMP.Parser_` are causing infinite recursion:\n\n  ┌─────┐\n  │    astmt\n  │     ↓\n  │    funcDef\n  │     ↓\n  │    if_\n  │     ↓\n  │    stmt\n  │     ↓\n  │    while_\n  └─────┘\n\nThese errors are very tricky, so read https://elm-lang.org/0.19.1/bad-recursion to learn how to fix it!';}
var $author$project$IMP$Parser_$program = $author$project$IMP$Parser_$stmt;
var $author$project$IMP$Parser_$parse = $elm$parser$Parser$run(
	A2($elm$parser$Parser$ignorer, $author$project$IMP$Parser_$program, $elm$parser$Parser$end));
var $author$project$IMP$Syntax$SError = function (a) {
	return {$: 'SError', a: a};
};
var $author$project$IMP$Utils$hasFuncDef = function (s) {
	hasFuncDef:
	while (true) {
		switch (s.$) {
			case 'SFuncDef':
				return true;
			case 'SSeq':
				var s1 = s.b;
				var s2 = s.c;
				return $author$project$IMP$Utils$hasFuncDef(s1) || $author$project$IMP$Utils$hasFuncDef(s2);
			case 'SIf':
				var s1 = s.c;
				var s2 = s.d;
				return $author$project$IMP$Utils$hasFuncDef(s1) || $author$project$IMP$Utils$hasFuncDef(s2);
			case 'SWhile':
				var body = s.c;
				var $temp$s = body;
				s = $temp$s;
				continue hasFuncDef;
			default:
				return false;
		}
	}
};
var $author$project$IMP$Utils$preprocessExpr = F2(
	function (e, hcount) {
		switch (e.$) {
			case 'EVar':
				var ws = e.a;
				var x = e.b;
				return _Utils_Tuple2(
					A2($author$project$IMP$Syntax$EVar, ws, x),
					hcount);
			case 'Eop':
				var ws = e.a;
				var op = e.b;
				var e1 = e.c;
				var e2 = e.d;
				var _v4 = A2($author$project$IMP$Utils$preprocessExpr, e1, hcount);
				var e1_ = _v4.a;
				var hcount_ = _v4.b;
				var _v5 = A2($author$project$IMP$Utils$preprocessExpr, e2, hcount_);
				var e2_ = _v5.a;
				var hcount__ = _v5.b;
				return _Utils_Tuple2(
					A4($author$project$IMP$Syntax$Eop, ws, op, e1_, e2_),
					hcount__);
			case 'EInt':
				var ws = e.a;
				var i = e.b;
				return _Utils_Tuple2(
					A2($author$project$IMP$Syntax$EInt, ws, i),
					hcount);
			case 'EBool':
				var ws = e.a;
				var b = e.b;
				return _Utils_Tuple2(
					A2($author$project$IMP$Syntax$EBool, ws, b),
					hcount);
			case 'EString':
				var ws = e.a;
				var s = e.b;
				return _Utils_Tuple2(
					A2($author$project$IMP$Syntax$EString, ws, s),
					hcount);
			case 'EError':
				var info = e.a;
				return _Utils_Tuple2(
					$author$project$IMP$Syntax$EError(info),
					hcount);
			case 'ENot':
				var ws = e.a;
				var e_ = e.b;
				var _v6 = A2($author$project$IMP$Utils$preprocessExpr, e_, hcount);
				var e__ = _v6.a;
				var hcount_ = _v6.b;
				return _Utils_Tuple2(
					A2($author$project$IMP$Syntax$ENot, ws, e__),
					hcount_);
			case 'EParens':
				var ws = e.a;
				var e_ = e.b;
				var _v7 = A2($author$project$IMP$Utils$preprocessExpr, e_, hcount);
				var e__ = _v7.a;
				var hcount_ = _v7.b;
				return _Utils_Tuple2(
					A2($author$project$IMP$Syntax$EParens, ws, e__),
					hcount_);
			case 'EHole':
				var ws = e.a;
				return _Utils_Tuple2(
					A2(
						$author$project$IMP$Syntax$EHole,
						ws,
						$author$project$IMP$Syntax$HOri(hcount)),
					hcount + 1);
			case 'EList':
				var ws = e.a;
				var es = e.b;
				var _v8 = A2($author$project$IMP$Utils$preprocessList, es, hcount);
				var es_ = _v8.a;
				var hcount_ = _v8.b;
				return _Utils_Tuple2(
					A2($author$project$IMP$Syntax$EList, ws, es_),
					hcount_);
			case 'EIndex':
				var ws = e.a;
				var e1 = e.b;
				var e2 = e.c;
				var _v9 = A2($author$project$IMP$Utils$preprocessExpr, e1, hcount);
				var e1_ = _v9.a;
				var hcount_ = _v9.b;
				var _v10 = A2($author$project$IMP$Utils$preprocessExpr, e2, hcount_);
				var e2_ = _v10.a;
				var hcount__ = _v10.b;
				return _Utils_Tuple2(
					A3($author$project$IMP$Syntax$EIndex, ws, e1_, e2_),
					hcount__);
			default:
				var ws = e.a;
				var e_ = e.b;
				var _v11 = A2($author$project$IMP$Utils$preprocessExpr, e_, hcount);
				var e__ = _v11.a;
				var hcount_ = _v11.b;
				return _Utils_Tuple2(
					A2($author$project$IMP$Syntax$ELength, ws, e__),
					hcount_);
		}
	});
var $author$project$IMP$Utils$preprocessList = F2(
	function (es, hcount) {
		if (!es.b) {
			return _Utils_Tuple2(_List_Nil, hcount);
		} else {
			var e = es.a;
			var rest = es.b;
			var _v1 = A2($author$project$IMP$Utils$preprocessExpr, e, hcount);
			var e_ = _v1.a;
			var hcount_ = _v1.b;
			var _v2 = A2($author$project$IMP$Utils$preprocessList, rest, hcount_);
			var rest_ = _v2.a;
			var hcount__ = _v2.b;
			return _Utils_Tuple2(
				A2($elm$core$List$cons, e_, rest_),
				hcount__);
		}
	});
var $author$project$IMP$Utils$preprocessStmt = F2(
	function (s, hcount) {
		switch (s.$) {
			case 'SIf':
				var ws = s.a;
				var e = s.b;
				var s1 = s.c;
				var s2 = s.d;
				var _v1 = A2($author$project$IMP$Utils$preprocessExpr, e, hcount);
				var e_ = _v1.a;
				var hcount_ = _v1.b;
				var _v2 = A2($author$project$IMP$Utils$preprocessStmt, s1, hcount_);
				var s1_ = _v2.a;
				var hcount__ = _v2.b;
				var _v3 = A2($author$project$IMP$Utils$preprocessStmt, s2, hcount__);
				var s2_ = _v3.a;
				var hcount___ = _v3.b;
				return _Utils_Tuple2(
					A4($author$project$IMP$Syntax$SIf, ws, e_, s1_, s2_),
					hcount___);
			case 'SWhile':
				var ws = s.a;
				var e = s.b;
				var s_ = s.c;
				var _v4 = A2($author$project$IMP$Utils$preprocessExpr, e, hcount);
				var e_ = _v4.a;
				var hcount_ = _v4.b;
				var _v5 = A2($author$project$IMP$Utils$preprocessStmt, s_, hcount_);
				var s__ = _v5.a;
				var hcount__ = _v5.b;
				return _Utils_Tuple2(
					A3($author$project$IMP$Syntax$SWhile, ws, e_, s__),
					hcount__);
			case 'SAssign':
				var ws = s.a;
				var e1 = s.b;
				var e2 = s.c;
				var _v6 = A2($author$project$IMP$Utils$preprocessExpr, e1, hcount);
				var e1_ = _v6.a;
				var hcount_ = _v6.b;
				var _v7 = A2($author$project$IMP$Utils$preprocessExpr, e2, hcount_);
				var e2_ = _v7.a;
				var hcount__ = _v7.b;
				return _Utils_Tuple2(
					A3($author$project$IMP$Syntax$SAssign, ws, e1_, e2_),
					hcount__);
			case 'SRead':
				var ws = s.a;
				var x = s.b;
				return _Utils_Tuple2(
					A2($author$project$IMP$Syntax$SRead, ws, x),
					hcount);
			case 'SPrint':
				var ws = s.a;
				var e = s.b;
				var _v8 = A2($author$project$IMP$Utils$preprocessExpr, e, hcount);
				var e_ = _v8.a;
				var hcount_ = _v8.b;
				return _Utils_Tuple2(
					A2($author$project$IMP$Syntax$SPrint, ws, e_),
					hcount_);
			case 'SSeq':
				var ws = s.a;
				var s1 = s.b;
				var s2 = s.c;
				var _v9 = A2($author$project$IMP$Utils$preprocessStmt, s1, hcount);
				var s1_ = _v9.a;
				var hcount_ = _v9.b;
				var _v10 = A2($author$project$IMP$Utils$preprocessStmt, s2, hcount_);
				var s2_ = _v10.a;
				var hcount__ = _v10.b;
				return _Utils_Tuple2(
					A3($author$project$IMP$Syntax$SSeq, ws, s1_, s2_),
					hcount__);
			case 'SSkip':
				var ws = s.a;
				return _Utils_Tuple2(
					$author$project$IMP$Syntax$SSkip(ws),
					hcount);
			case 'SError':
				var info = s.a;
				return _Utils_Tuple2(
					$author$project$IMP$Syntax$SError(info),
					hcount);
			case 'SFuncDef':
				var ws = s.a;
				var name = s.b;
				var params = s.c;
				var body = s.d;
				var _v11 = A2($author$project$IMP$Utils$preprocessStmt, body, hcount);
				var body_ = _v11.a;
				var hcount_ = _v11.b;
				return _Utils_Tuple2(
					A4($author$project$IMP$Syntax$SFuncDef, ws, name, params, body_),
					hcount_);
			default:
				var ws = s.a;
				var name = s.b;
				var args = s.c;
				var _v12 = A2($author$project$IMP$Utils$preprocessList, args, hcount);
				var args_ = _v12.a;
				var hcount_ = _v12.b;
				return _Utils_Tuple2(
					A3($author$project$IMP$Syntax$SFuncCall, ws, name, args_),
					hcount_);
		}
	});
var $author$project$IMP$Utils$splitTopFuncs = function (s) {
	_v0$2:
	while (true) {
		switch (s.$) {
			case 'SSeq':
				if (s.b.$ === 'SFuncDef') {
					var ws = s.a;
					var _v1 = s.b;
					var defWs = _v1.a;
					var name = _v1.b;
					var params = _v1.c;
					var body = _v1.d;
					var rest = s.c;
					var entry = {body: body, name: name, params: params, seqWs: ws, ws: defWs};
					var _v2 = $author$project$IMP$Utils$splitTopFuncs(rest);
					var env = _v2.a;
					var bodyStmt = _v2.b;
					return _Utils_Tuple2(
						A2($elm$core$List$cons, entry, env),
						bodyStmt);
				} else {
					break _v0$2;
				}
			case 'SFuncDef':
				var defWs = s.a;
				var name = s.b;
				var params = s.c;
				var body = s.d;
				return _Utils_Tuple2(
					_List_fromArray(
						[
							{body: body, name: name, params: params, seqWs: _List_Nil, ws: defWs}
						]),
					$author$project$IMP$Syntax$SSkip(_List_Nil));
			default:
				break _v0$2;
		}
	}
	return _Utils_Tuple2(_List_Nil, s);
};
var $author$project$IMP$Utils$prepareStmt = function (s) {
	var _v0 = A2($author$project$IMP$Utils$preprocessStmt, s, 0);
	var s_ = _v0.a;
	var hcount = _v0.b;
	var _v1 = $author$project$IMP$Utils$splitTopFuncs(s_);
	var env = _v1.a;
	var rest = _v1.b;
	return $author$project$IMP$Utils$hasFuncDef(rest) ? _Utils_Tuple3(
		$author$project$IMP$Syntax$SError('function definition must be at the top of the program'),
		hcount,
		env) : _Utils_Tuple3(rest, hcount, env);
};
var $author$project$IMP$Printer$outputValue = function (store) {
	outputValue:
	while (true) {
		if (store.b) {
			if (store.a.a === 'output') {
				var _v1 = store.a;
				var v = _v1.b;
				return v;
			} else {
				var rest = store.b;
				var $temp$store = rest;
				store = $temp$store;
				continue outputValue;
			}
		} else {
			return $author$project$IMP$Syntax$VList(_List_Nil);
		}
	}
};
var $author$project$IMP$Printer$printHoleName = function (hn) {
	switch (hn.$) {
		case 'HOri':
			var n = hn.a;
			return '#' + $elm$core$String$fromInt(n);
		case 'HVar':
			var x = hn.a;
			return '#' + x;
		case 'HTmp':
			return '*';
		default:
			var h = hn.a;
			var id = hn.b;
			return $author$project$IMP$Printer$printHoleName(h) + ('_' + $elm$core$String$fromInt(id));
	}
};
var $author$project$IMP$Printer$printValue = function (v) {
	switch (v.$) {
		case 'VInt':
			var n = v.a;
			return $elm$core$String$fromInt(n);
		case 'VBool':
			if (v.a) {
				return 'true';
			} else {
				return 'false';
			}
		case 'VString':
			var s = v.a;
			return '\"' + (s + '\"');
		case 'VHole':
			var hn = v.a;
			var id = v.b;
			return '{ ' + ($author$project$IMP$Printer$printHoleName(hn) + ('@' + ($elm$core$String$fromInt(id) + ' }')));
		case 'VList':
			var vs = v.a;
			return '[' + (A2(
				$elm$core$String$join,
				', ',
				A2($elm$core$List$map, $author$project$IMP$Printer$printValue, vs)) + ']');
		default:
			var info = v.a;
			return info;
	}
};
var $author$project$IMP$Printer$printOutputList = function (vs) {
	return A2(
		$elm$core$String$join,
		'\n',
		A2($elm$core$List$map, $author$project$IMP$Printer$printValue, vs));
};
var $author$project$IMP$Printer$printOutput = function (store) {
	var _v0 = $author$project$IMP$Printer$outputValue(store);
	if (_v0.$ === 'VList') {
		var vs = _v0.a;
		return $author$project$IMP$Printer$printOutputList(vs);
	} else {
		var v = _v0;
		return $author$project$IMP$Printer$printValue(v);
	}
};
var $elm$core$Debug$toString = _Debug_toString;
var $author$project$Controller$evalCodeToModel = F2(
	function (code, model) {
		var _v0 = $author$project$IMP$Parser_$parse(code);
		if (_v0.$ === 'Ok') {
			var stmt = _v0.a;
			var _v1 = $author$project$IMP$Utils$prepareStmt(stmt);
			var stmt_ = _v1.a;
			var funcEnv = _v1.c;
			var res = $timeEval("Forward evaluation", function () {
				return A7($author$project$IMP$Eval$exec, funcEnv, model.startStore, model.holeBindings, _List_Nil, stmt_, $elm$core$Set$empty, 0);
			});
			return _Utils_update(
				model,
				{
					code: code,
					codeBackup: code,
					contextDrafts: $elm$core$Dict$empty,
					currentContext: -1,
					hbBackup: model.holeBindings,
					isOutputChange: false,
					output: $author$project$IMP$Printer$printOutput(res.store),
					riStmts: res.riStmts,
					store: res.store
				});
		} else {
			var info = _v0.a;
			return _Utils_update(
				model,
				{
					code: code,
					output: $elm$core$Debug$toString(info),
					riStmts: _List_Nil,
					store: _List_Nil
				});
		}
	});
var $author$project$Controller$parseContextDraft = function (model) {
	return (model.currentContext < 0) ? $elm$core$Result$Err('No residual selected') : A2(
		$author$project$Controller$parseStoreDrafts,
		A2($author$project$Controller$riStoreOf, model.currentContext, model.riStmts),
		model.contextDrafts);
};
var $author$project$Controller$commitContextDraft = function (model) {
	var _v0 = $author$project$Controller$parseContextDraft(model);
	if (_v0.$ === 'Ok') {
		var store = _v0.a;
		return _Utils_update(
			model,
			{
				riStmts: A3($author$project$Controller$updateRiStore, model.currentContext, store, model.riStmts)
			});
	} else {
		return model;
	}
};
var $elm$core$List$append = F2(
	function (xs, ys) {
		if (!ys.b) {
			return xs;
		} else {
			return A3($elm$core$List$foldr, $elm$core$List$cons, ys, xs);
		}
	});
var $elm$core$List$concat = function (lists) {
	return A3($elm$core$List$foldr, $elm$core$List$append, _List_Nil, lists);
};
var $elm$core$List$concatMap = F2(
	function (f, list) {
		return $elm$core$List$concat(
			A2($elm$core$List$map, f, list));
	});
var $author$project$Controller$collectOriInExpr = function (e) {
	collectOriInExpr:
	while (true) {
		_v0$7:
		while (true) {
			switch (e.$) {
				case 'EHole':
					if (e.b.$ === 'HOri') {
						var n = e.b.a;
						return _List_fromArray(
							[
								$author$project$IMP$Syntax$HOri(n)
							]);
					} else {
						break _v0$7;
					}
				case 'Eop':
					var e1 = e.c;
					var e2 = e.d;
					return _Utils_ap(
						$author$project$Controller$collectOriInExpr(e1),
						$author$project$Controller$collectOriInExpr(e2));
				case 'ENot':
					var e1 = e.b;
					var $temp$e = e1;
					e = $temp$e;
					continue collectOriInExpr;
				case 'EParens':
					var e1 = e.b;
					var $temp$e = e1;
					e = $temp$e;
					continue collectOriInExpr;
				case 'EList':
					var es = e.b;
					return A2($elm$core$List$concatMap, $author$project$Controller$collectOriInExpr, es);
				case 'EIndex':
					var e1 = e.b;
					var e2 = e.c;
					return _Utils_ap(
						$author$project$Controller$collectOriInExpr(e1),
						$author$project$Controller$collectOriInExpr(e2));
				case 'ELength':
					var e1 = e.b;
					var $temp$e = e1;
					e = $temp$e;
					continue collectOriInExpr;
				default:
					break _v0$7;
			}
		}
		return _List_Nil;
	}
};
var $author$project$Controller$collectOriInStmt = function (s) {
	collectOriInStmt:
	while (true) {
		switch (s.$) {
			case 'SAssign':
				var e1 = s.b;
				var e2 = s.c;
				return _Utils_ap(
					$author$project$Controller$collectOriInExpr(e1),
					$author$project$Controller$collectOriInExpr(e2));
			case 'SIf':
				var e = s.b;
				var s1 = s.c;
				var s2 = s.d;
				return _Utils_ap(
					$author$project$Controller$collectOriInExpr(e),
					_Utils_ap(
						$author$project$Controller$collectOriInStmt(s1),
						$author$project$Controller$collectOriInStmt(s2)));
			case 'SWhile':
				var e = s.b;
				var body = s.c;
				return _Utils_ap(
					$author$project$Controller$collectOriInExpr(e),
					$author$project$Controller$collectOriInStmt(body));
			case 'SPrint':
				var e = s.b;
				return $author$project$Controller$collectOriInExpr(e);
			case 'SSeq':
				var s1 = s.b;
				var s2 = s.c;
				return _Utils_ap(
					$author$project$Controller$collectOriInStmt(s1),
					$author$project$Controller$collectOriInStmt(s2));
			case 'SFuncDef':
				var body = s.d;
				var $temp$s = body;
				s = $temp$s;
				continue collectOriInStmt;
			case 'SFuncCall':
				var args = s.c;
				return A2($elm$core$List$concatMap, $author$project$Controller$collectOriInExpr, args);
			default:
				return _List_Nil;
		}
	}
};
var $author$project$Controller$collectOriInFuncEnv = function (env) {
	return A2(
		$elm$core$List$concatMap,
		function (f) {
			return $author$project$Controller$collectOriInStmt(f.body);
		},
		env);
};
var $author$project$IMP$Utils$exprHoleKey = function (h) {
	switch (h.$) {
		case 'HOri':
			var n = h.a;
			return 'o:' + $elm$core$String$fromInt(n);
		case 'HVar':
			var x = h.a;
			return 'v:' + x;
		case 'HTmp':
			return 't';
		default:
			var h_ = h.a;
			var n = h.b;
			return $author$project$IMP$Utils$exprHoleKey(h_) + ('. ' + $elm$core$String$fromInt(n));
	}
};
var $elm$core$List$sortBy = _List_sortBy;
var $author$project$Controller$uniqueOri = function (hs) {
	return A2(
		$elm$core$List$sortBy,
		function (h) {
			if (h.$ === 'HOri') {
				var n = h.a;
				return n;
			} else {
				return 0;
			}
		},
		A3(
			$elm$core$List$foldl,
			F2(
				function (h, acc) {
					return A2(
						$elm$core$List$any,
						function (h_) {
							return _Utils_eq(
								$author$project$IMP$Utils$exprHoleKey(h_),
								$author$project$IMP$Utils$exprHoleKey(h));
						},
						acc) ? acc : _Utils_ap(
						acc,
						_List_fromArray(
							[h]));
				}),
			_List_Nil,
			hs));
};
var $author$project$Controller$openFillWith = function (model) {
	var _v0 = $author$project$IMP$Parser_$parse(model.code);
	if (_v0.$ === 'Ok') {
		var stmt = _v0.a;
		var _v1 = $author$project$IMP$Utils$prepareStmt(stmt);
		var stmt_ = _v1.a;
		var funcEnv = _v1.c;
		var holes = $author$project$Controller$uniqueOri(
			_Utils_ap(
				$author$project$Controller$collectOriInStmt(stmt_),
				$author$project$Controller$collectOriInFuncEnv(funcEnv)));
		return _Utils_update(
			model,
			{fillDraft: $elm$core$Dict$empty, fillSelected: $elm$core$Set$empty, filling: true, oriHoles: holes});
	} else {
		var info = _v0.a;
		return _Utils_update(
			model,
			{
				output: $elm$core$Debug$toString(info)
			});
	}
};
var $author$project$Controller$openFill = function (model) {
	var model1 = $author$project$Controller$commitContextDraft(model);
	return $author$project$Controller$openFillWith(model1);
};
var $author$project$Controller$currentInput = function (model) {
	var _v0 = A2($author$project$IMP$Utils$lookup, 'input', model.startStore);
	if (_v0.$ === 'Just') {
		var v = _v0.a;
		return v;
	} else {
		return $author$project$IMP$Syntax$VList(_List_Nil);
	}
};
var $author$project$Controller$openInput = function (model) {
	return _Utils_update(
		model,
		{
			editingInput: true,
			inputDraft: $author$project$IMP$Printer$printValue(
				$author$project$Controller$currentInput(model))
		});
};
var $author$project$Controller$applyContextDraft = function (model) {
	if (model.currentContext < 0) {
		return $elm$core$Result$Ok(model);
	} else {
		var _v0 = $author$project$Controller$parseContextDraft(model);
		if (_v0.$ === 'Ok') {
			var store = _v0.a;
			return $elm$core$Result$Ok(
				_Utils_update(
					model,
					{
						riStmts: A3($author$project$Controller$updateRiStore, model.currentContext, store, model.riStmts)
					}));
		} else {
			var info = _v0.a;
			return $elm$core$Result$Err(info);
		}
	}
};
var $elm$core$Maybe$andThen = F2(
	function (callback, maybeValue) {
		if (maybeValue.$ === 'Just') {
			var value = maybeValue.a;
			return callback(value);
		} else {
			return $elm$core$Maybe$Nothing;
		}
	});
var $elm$core$List$isEmpty = function (xs) {
	if (!xs.b) {
		return true;
	} else {
		return false;
	}
};
var $author$project$IMP$Utils$isSkip = function (s) {
	if (s.$ === 'SSkip') {
		return true;
	} else {
		return false;
	}
};
var $author$project$IMP$Utils$attachFuncs = F2(
	function (env, body) {
		if (!env.b) {
			return body;
		} else {
			if (!env.b.b) {
				var f = env.a;
				var def = A4($author$project$IMP$Syntax$SFuncDef, f.ws, f.name, f.params, f.body);
				return ($author$project$IMP$Utils$isSkip(body) && $elm$core$List$isEmpty(f.seqWs)) ? def : A3($author$project$IMP$Syntax$SSeq, f.seqWs, def, body);
			} else {
				var f = env.a;
				var rest = env.b;
				return A3(
					$author$project$IMP$Syntax$SSeq,
					f.seqWs,
					A4($author$project$IMP$Syntax$SFuncDef, f.ws, f.name, f.params, f.body),
					A2($author$project$IMP$Utils$attachFuncs, rest, body));
			}
		}
	});
var $author$project$Controller$collectOriInRiStmts = function (ris) {
	return A2(
		$elm$core$List$concatMap,
		function (_v0) {
			var s = _v0.b;
			return $author$project$Controller$collectOriInStmt(s);
		},
		ris);
};
var $elm$core$Dict$fromList = function (assocs) {
	return A3(
		$elm$core$List$foldl,
		F2(
			function (_v0, dict) {
				var key = _v0.a;
				var value = _v0.b;
				return A3($elm$core$Dict$insert, key, value, dict);
			}),
		$elm$core$Dict$empty,
		assocs);
};
var $author$project$Controller$contextDraftsOf = F2(
	function (id, ris) {
		var _v0 = A2($author$project$Controller$riStoreOf, id, ris);
		if (_v0.$ === 'Just') {
			var store = _v0.a;
			return $elm$core$Dict$fromList(
				A2(
					$elm$core$List$map,
					function (_v1) {
						var x = _v1.a;
						var v = _v1.b;
						return _Utils_Tuple2(
							x,
							$author$project$IMP$Printer$printValue(v));
					},
					store));
		} else {
			return $elm$core$Dict$empty;
		}
	});
var $author$project$IMP$Eval$batchExec = F4(
	function (funcEnv, hb, ris0, scount0) {
		if (!ris0.b) {
			return _Utils_Tuple3(_List_Nil, _List_Nil, scount0);
		} else {
			var _v1 = ris0.a;
			var id = _v1.a;
			var s = _v1.b;
			var store = _v1.c;
			var rest = ris0.b;
			var res = A7($author$project$IMP$Eval$exec, funcEnv, store, hb, _List_Nil, s, $elm$core$Set$empty, scount0);
			var _v2 = A4($author$project$IMP$Eval$batchExec, funcEnv, hb, rest, res.scount);
			var stores = _v2.a;
			var newris = _v2.b;
			var scount = _v2.c;
			return _Utils_Tuple3(
				A2(
					$elm$core$List$cons,
					_Utils_Tuple2(id, res.store),
					stores),
				_Utils_ap(res.riStmts, newris),
				scount);
		}
	});
var $author$project$IMP$Eval$markDet = F2(
	function (isDet, _v0) {
		var hasDet = _v0.a;
		var hasIndet = _v0.b;
		return isDet ? _Utils_Tuple2(true, hasIndet) : _Utils_Tuple2(hasDet, true);
	});
var $author$project$IMP$Eval$canUpdatePath = F2(
	function (vs, path) {
		canUpdatePath:
		while (true) {
			switch (vs.$) {
				case 'VHole':
					return false;
				case 'VList':
					var vs_ = vs.a;
					if (!path.b) {
						return true;
					} else {
						if (path.a.$ === 'VInt') {
							if (!path.b.b) {
								var i = path.a.a;
								return (i >= 0) && (_Utils_cmp(
									i,
									$elm$core$List$length(vs_)) < 0);
							} else {
								var i = path.a.a;
								var rest = path.b;
								if ((i >= 0) && (_Utils_cmp(
									i,
									$elm$core$List$length(vs_)) < 0)) {
									var $temp$vs = A2($author$project$IMP$Utils$nthValue, vs_, i),
										$temp$path = rest;
									vs = $temp$vs;
									path = $temp$path;
									continue canUpdatePath;
								} else {
									return false;
								}
							}
						} else {
							return false;
						}
					}
				default:
					return false;
			}
		}
	});
var $author$project$IMP$Eval$lhsCanOverwrite = F2(
	function (store, e) {
		switch (e.$) {
			case 'EVar':
				return true;
			case 'EIndex':
				var _v1 = A3($author$project$IMP$Eval$findIndex, store, _List_Nil, e);
				var x = _v1.a;
				var path = _v1.b;
				if (path.$ === 'VList') {
					var p = path.a;
					var _v3 = A2($author$project$IMP$Utils$lookup, x, store);
					if (_v3.$ === 'Just') {
						var v = _v3.a;
						return A2($author$project$IMP$Eval$canUpdatePath, v, p);
					} else {
						return false;
					}
				} else {
					return false;
				}
			default:
				return false;
		}
	});
var $author$project$IMP$Eval$mergeFlags = F2(
	function (_v0, _v1) {
		var d1 = _v0.a;
		var i1 = _v0.b;
		var d2 = _v1.a;
		var i2 = _v1.b;
		return _Utils_Tuple2(d1 || d2, i1 || i2);
	});
var $author$project$IMP$Eval$varDet = F2(
	function (store, x) {
		var _v0 = A2($author$project$IMP$Utils$lookup, x, store);
		if (_v0.$ === 'Just') {
			var v = _v0.a;
			return $author$project$IMP$Eval$isFullyDet(v);
		} else {
			return false;
		}
	});
var $author$project$IMP$Eval$scanExpr = F3(
	function (store, e, flags) {
		scanExpr:
		while (true) {
			switch (e.$) {
				case 'EVar':
					var x = e.b;
					return A2(
						$author$project$IMP$Eval$markDet,
						A2($author$project$IMP$Eval$varDet, store, x),
						flags);
				case 'EIndex':
					var e1 = e.b;
					var e2 = e.c;
					return A2(
						$author$project$IMP$Eval$markDet,
						$author$project$IMP$Eval$isFullyDet(
							A3($author$project$IMP$Eval$eval, store, _List_Nil, e)),
						A3($author$project$IMP$Eval$scanIndexVars, store, e, flags));
				case 'Eop':
					var e1 = e.c;
					var e2 = e.d;
					var $temp$store = store,
						$temp$e = e2,
						$temp$flags = A3($author$project$IMP$Eval$scanExpr, store, e1, flags);
					store = $temp$store;
					e = $temp$e;
					flags = $temp$flags;
					continue scanExpr;
				case 'ENot':
					var e1 = e.b;
					var $temp$store = store,
						$temp$e = e1,
						$temp$flags = flags;
					store = $temp$store;
					e = $temp$e;
					flags = $temp$flags;
					continue scanExpr;
				case 'EParens':
					var e1 = e.b;
					var $temp$store = store,
						$temp$e = e1,
						$temp$flags = flags;
					store = $temp$store;
					e = $temp$e;
					flags = $temp$flags;
					continue scanExpr;
				case 'EList':
					var es = e.b;
					return A3(
						$elm$core$List$foldl,
						$author$project$IMP$Eval$scanExpr(store),
						flags,
						es);
				case 'ELength':
					var e1 = e.b;
					var $temp$store = store,
						$temp$e = e1,
						$temp$flags = flags;
					store = $temp$store;
					e = $temp$e;
					flags = $temp$flags;
					continue scanExpr;
				case 'EHole':
					return A2($author$project$IMP$Eval$markDet, false, flags);
				default:
					return flags;
			}
		}
	});
var $author$project$IMP$Eval$scanIndexVars = F3(
	function (store, e, flags) {
		scanIndexVars:
		while (true) {
			switch (e.$) {
				case 'EIndex':
					var e1 = e.b;
					var e2 = e.c;
					var $temp$store = store,
						$temp$e = e1,
						$temp$flags = A3($author$project$IMP$Eval$scanExpr, store, e2, flags);
					store = $temp$store;
					e = $temp$e;
					flags = $temp$flags;
					continue scanIndexVars;
				case 'EVar':
					return flags;
				default:
					return A3($author$project$IMP$Eval$scanExpr, store, e, flags);
			}
		}
	});
var $author$project$IMP$Eval$scanLhs = F3(
	function (store, e, flags) {
		scanLhs:
		while (true) {
			switch (e.$) {
				case 'EVar':
					return flags;
				case 'EIndex':
					var e1 = e.b;
					var e2 = e.c;
					var $temp$store = store,
						$temp$e = e1,
						$temp$flags = A3($author$project$IMP$Eval$scanExpr, store, e2, flags);
					store = $temp$store;
					e = $temp$e;
					flags = $temp$flags;
					continue scanLhs;
				default:
					return A3($author$project$IMP$Eval$scanExpr, store, e, flags);
			}
		}
	});
var $author$project$IMP$Eval$scanAssign = F4(
	function (store, e1, e2, flags) {
		var rhsFlags = A3(
			$author$project$IMP$Eval$scanExpr,
			store,
			e2,
			_Utils_Tuple2(false, false));
		var rhsDet = !rhsFlags.b;
		var lhsFlags = A3(
			$author$project$IMP$Eval$scanLhs,
			store,
			e1,
			_Utils_Tuple2(false, false));
		var merged = A2(
			$author$project$IMP$Eval$mergeFlags,
			flags,
			A2($author$project$IMP$Eval$mergeFlags, rhsFlags, lhsFlags));
		return A2($author$project$IMP$Eval$lhsCanOverwrite, store, e1) ? merged : (rhsDet ? A2(
			$author$project$IMP$Eval$mergeFlags,
			merged,
			_Utils_Tuple2(true, true)) : A2($author$project$IMP$Eval$markDet, false, merged));
	});
var $author$project$IMP$Eval$scanStmt = F3(
	function (store, s, flags) {
		scanStmt:
		while (true) {
			switch (s.$) {
				case 'SAssign':
					var e1 = s.b;
					var e2 = s.c;
					return A4($author$project$IMP$Eval$scanAssign, store, e1, e2, flags);
				case 'SIf':
					var e = s.b;
					return A3($author$project$IMP$Eval$scanExpr, store, e, flags);
				case 'SWhile':
					var e = s.b;
					return A3($author$project$IMP$Eval$scanExpr, store, e, flags);
				case 'SPrint':
					var e = s.b;
					return A3($author$project$IMP$Eval$scanExpr, store, e, flags);
				case 'SRead':
					return A2(
						$author$project$IMP$Eval$markDet,
						A2($author$project$IMP$Eval$varDet, store, 'input'),
						flags);
				case 'SSeq':
					var s1 = s.b;
					var s2 = s.c;
					var $temp$store = store,
						$temp$s = s2,
						$temp$flags = A3($author$project$IMP$Eval$scanStmt, store, s1, flags);
					store = $temp$store;
					s = $temp$s;
					flags = $temp$flags;
					continue scanStmt;
				case 'SFuncCall':
					var args = s.c;
					return A3(
						$elm$core$List$foldl,
						$author$project$IMP$Eval$scanExpr(store),
						flags,
						args);
				case 'SFuncDef':
					var body = s.d;
					var $temp$store = store,
						$temp$s = body,
						$temp$flags = flags;
					store = $temp$store;
					s = $temp$s;
					flags = $temp$flags;
					continue scanStmt;
				default:
					return flags;
			}
		}
	});
var $author$project$IMP$Eval$classifyStmt = F2(
	function (store, s) {
		var _v0 = A3(
			$author$project$IMP$Eval$scanStmt,
			store,
			s,
			_Utils_Tuple2(false, false));
		if ((!_v0.a) && _v0.b) {
			return false;
		} else {
			return true;
		}
	});
var $author$project$IMP$Eval$divideAfterFilled = function (filled) {
	if (!filled.b) {
		return _Utils_Tuple2(_List_Nil, _List_Nil);
	} else {
		var _v1 = filled.a;
		var id = _v1.a;
		var s = _v1.b;
		var store = _v1.c;
		var rest = filled.b;
		var item = _Utils_Tuple3(id, s, store);
		var _v2 = $author$project$IMP$Eval$divideAfterFilled(rest);
		var toExec = _v2.a;
		var remaining = _v2.b;
		return A2($author$project$IMP$Eval$classifyStmt, store, s) ? _Utils_Tuple2(
			A2($elm$core$List$cons, item, toExec),
			remaining) : _Utils_Tuple2(
			toExec,
			A2($elm$core$List$cons, item, remaining));
	}
};
var $author$project$IMP$Eval$exprEq = F2(
	function (a, b) {
		exprEq:
		while (true) {
			var _v3 = _Utils_Tuple2(a, b);
			_v3$12:
			while (true) {
				switch (_v3.a.$) {
					case 'EVar':
						if (_v3.b.$ === 'EVar') {
							var _v4 = _v3.a;
							var x = _v4.b;
							var _v5 = _v3.b;
							var y = _v5.b;
							return _Utils_eq(x, y);
						} else {
							break _v3$12;
						}
					case 'EInt':
						if (_v3.b.$ === 'EInt') {
							var _v6 = _v3.a;
							var i = _v6.b;
							var _v7 = _v3.b;
							var j = _v7.b;
							return _Utils_eq(i, j);
						} else {
							break _v3$12;
						}
					case 'EBool':
						if (_v3.b.$ === 'EBool') {
							var _v8 = _v3.a;
							var p = _v8.b;
							var _v9 = _v3.b;
							var q = _v9.b;
							return _Utils_eq(p, q);
						} else {
							break _v3$12;
						}
					case 'EString':
						if (_v3.b.$ === 'EString') {
							var _v10 = _v3.a;
							var s = _v10.b;
							var _v11 = _v3.b;
							var t = _v11.b;
							return _Utils_eq(s, t);
						} else {
							break _v3$12;
						}
					case 'EHole':
						if (_v3.b.$ === 'EHole') {
							var _v12 = _v3.a;
							var h1 = _v12.b;
							var _v13 = _v3.b;
							var h2 = _v13.b;
							return _Utils_eq(h1, h2);
						} else {
							break _v3$12;
						}
					case 'Eop':
						if (_v3.b.$ === 'Eop') {
							var _v14 = _v3.a;
							var op1 = _v14.b;
							var e1 = _v14.c;
							var e2 = _v14.d;
							var _v15 = _v3.b;
							var op2 = _v15.b;
							var f1 = _v15.c;
							var f2 = _v15.d;
							return _Utils_eq(op1, op2) && (A2($author$project$IMP$Eval$exprEq, e1, f1) && A2($author$project$IMP$Eval$exprEq, e2, f2));
						} else {
							break _v3$12;
						}
					case 'ENot':
						if (_v3.b.$ === 'ENot') {
							var _v16 = _v3.a;
							var e1 = _v16.b;
							var _v17 = _v3.b;
							var e2 = _v17.b;
							var $temp$a = e1,
								$temp$b = e2;
							a = $temp$a;
							b = $temp$b;
							continue exprEq;
						} else {
							break _v3$12;
						}
					case 'EParens':
						if (_v3.b.$ === 'EParens') {
							var _v18 = _v3.a;
							var e1 = _v18.b;
							var _v19 = _v3.b;
							var e2 = _v19.b;
							var $temp$a = e1,
								$temp$b = e2;
							a = $temp$a;
							b = $temp$b;
							continue exprEq;
						} else {
							break _v3$12;
						}
					case 'EList':
						if (_v3.b.$ === 'EList') {
							var _v20 = _v3.a;
							var xs = _v20.b;
							var _v21 = _v3.b;
							var ys = _v21.b;
							return A2($author$project$IMP$Eval$exprEqList, xs, ys);
						} else {
							break _v3$12;
						}
					case 'EIndex':
						if (_v3.b.$ === 'EIndex') {
							var _v22 = _v3.a;
							var e1 = _v22.b;
							var e2 = _v22.c;
							var _v23 = _v3.b;
							var f1 = _v23.b;
							var f2 = _v23.c;
							return A2($author$project$IMP$Eval$exprEq, e1, f1) && A2($author$project$IMP$Eval$exprEq, e2, f2);
						} else {
							break _v3$12;
						}
					case 'ELength':
						if (_v3.b.$ === 'ELength') {
							var _v24 = _v3.a;
							var e1 = _v24.b;
							var _v25 = _v3.b;
							var e2 = _v25.b;
							var $temp$a = e1,
								$temp$b = e2;
							a = $temp$a;
							b = $temp$b;
							continue exprEq;
						} else {
							break _v3$12;
						}
					default:
						if (_v3.b.$ === 'EError') {
							var s1 = _v3.a.a;
							var s2 = _v3.b.a;
							return _Utils_eq(s1, s2);
						} else {
							break _v3$12;
						}
				}
			}
			return false;
		}
	});
var $author$project$IMP$Eval$exprEqList = F2(
	function (xs, ys) {
		var _v0 = _Utils_Tuple2(xs, ys);
		_v0$2:
		while (true) {
			if (!_v0.a.b) {
				if (!_v0.b.b) {
					return true;
				} else {
					break _v0$2;
				}
			} else {
				if (_v0.b.b) {
					var _v1 = _v0.a;
					var x = _v1.a;
					var xt = _v1.b;
					var _v2 = _v0.b;
					var y = _v2.a;
					var yt = _v2.b;
					return A2($author$project$IMP$Eval$exprEq, x, y) && A2($author$project$IMP$Eval$exprEqList, xt, yt);
				} else {
					break _v0$2;
				}
			}
		}
		return false;
	});
var $author$project$IMP$Eval$recoverAsVar = F2(
	function (store, e) {
		recoverAsVar:
		while (true) {
			if (!store.b) {
				return $elm$core$Maybe$Nothing;
			} else {
				var _v1 = store.a;
				var x = _v1.a;
				var v = _v1.b;
				var rest = store.b;
				if ((x !== 'input') && ((x !== 'output') && ((!$author$project$IMP$Eval$isFullyDet(v)) && A2(
					$author$project$IMP$Eval$exprEq,
					$author$project$IMP$Utils$value2Expr(v),
					e)))) {
					return $elm$core$Maybe$Just(x);
				} else {
					var $temp$store = rest,
						$temp$e = e;
					store = $temp$store;
					e = $temp$e;
					continue recoverAsVar;
				}
			}
		}
	});
var $author$project$IMP$Eval$recoverExpr = F2(
	function (store, e) {
		var e_ = function () {
			switch (e.$) {
				case 'Eop':
					var ws = e.a;
					var op = e.b;
					var e1 = e.c;
					var e2 = e.d;
					return A4(
						$author$project$IMP$Syntax$Eop,
						ws,
						op,
						A2($author$project$IMP$Eval$recoverExpr, store, e1),
						A2($author$project$IMP$Eval$recoverExpr, store, e2));
				case 'ENot':
					var ws = e.a;
					var e1 = e.b;
					return A2(
						$author$project$IMP$Syntax$ENot,
						ws,
						A2($author$project$IMP$Eval$recoverExpr, store, e1));
				case 'EParens':
					var ws = e.a;
					var e1 = e.b;
					return A2(
						$author$project$IMP$Syntax$EParens,
						ws,
						A2($author$project$IMP$Eval$recoverExpr, store, e1));
				case 'EList':
					var ws = e.a;
					var es = e.b;
					return A2(
						$author$project$IMP$Syntax$EList,
						ws,
						A2(
							$elm$core$List$map,
							$author$project$IMP$Eval$recoverExpr(store),
							es));
				case 'EIndex':
					var ws = e.a;
					var e1 = e.b;
					var e2 = e.c;
					return A3(
						$author$project$IMP$Syntax$EIndex,
						ws,
						A2($author$project$IMP$Eval$recoverExpr, store, e1),
						A2($author$project$IMP$Eval$recoverExpr, store, e2));
				case 'ELength':
					var ws = e.a;
					var e1 = e.b;
					return A2(
						$author$project$IMP$Syntax$ELength,
						ws,
						A2($author$project$IMP$Eval$recoverExpr, store, e1));
				default:
					return e;
			}
		}();
		var _v0 = A2($author$project$IMP$Eval$recoverAsVar, store, e_);
		if (_v0.$ === 'Just') {
			var x = _v0.a;
			return A2($author$project$IMP$Syntax$EVar, _List_Nil, x);
		} else {
			return e_;
		}
	});
var $author$project$IMP$Eval$recoverStmt = F2(
	function (store, s) {
		switch (s.$) {
			case 'SAssign':
				var ws = s.a;
				var e1 = s.b;
				var e2 = s.c;
				return A3(
					$author$project$IMP$Syntax$SAssign,
					ws,
					A2($author$project$IMP$Eval$recoverExpr, store, e1),
					A2($author$project$IMP$Eval$recoverExpr, store, e2));
			case 'SIf':
				var ws = s.a;
				var e = s.b;
				var s1 = s.c;
				var s2 = s.d;
				return A4(
					$author$project$IMP$Syntax$SIf,
					ws,
					A2($author$project$IMP$Eval$recoverExpr, store, e),
					A2($author$project$IMP$Eval$recoverStmt, store, s1),
					A2($author$project$IMP$Eval$recoverStmt, store, s2));
			case 'SWhile':
				var ws = s.a;
				var e = s.b;
				var body = s.c;
				return A3(
					$author$project$IMP$Syntax$SWhile,
					ws,
					A2($author$project$IMP$Eval$recoverExpr, store, e),
					A2($author$project$IMP$Eval$recoverStmt, store, body));
			case 'SPrint':
				var ws = s.a;
				var e = s.b;
				return A2(
					$author$project$IMP$Syntax$SPrint,
					ws,
					A2($author$project$IMP$Eval$recoverExpr, store, e));
			case 'SSeq':
				var ws = s.a;
				var s1 = s.b;
				var s2 = s.c;
				return A3(
					$author$project$IMP$Syntax$SSeq,
					ws,
					A2($author$project$IMP$Eval$recoverStmt, store, s1),
					A2($author$project$IMP$Eval$recoverStmt, store, s2));
			case 'SFuncCall':
				var ws = s.a;
				var name = s.b;
				var args = s.c;
				return A3(
					$author$project$IMP$Syntax$SFuncCall,
					ws,
					name,
					A2(
						$elm$core$List$map,
						$author$project$IMP$Eval$recoverExpr(store),
						args));
			case 'SFuncDef':
				var ws = s.a;
				var name = s.b;
				var params = s.c;
				var body = s.d;
				return A4(
					$author$project$IMP$Syntax$SFuncDef,
					ws,
					name,
					params,
					A2($author$project$IMP$Eval$recoverStmt, store, body));
			default:
				return s;
		}
	});
var $author$project$IMP$Eval$recoverRiStmts = function (ris) {
	return A2(
		$elm$core$List$map,
		function (_v0) {
			var id = _v0.a;
			var s = _v0.b;
			var st = _v0.c;
			return _Utils_Tuple3(
				id,
				A2($author$project$IMP$Eval$recoverStmt, st, s),
				st);
		},
		ris);
};
var $author$project$IMP$Eval$neededVarsExpr = function (e) {
	neededVarsExpr:
	while (true) {
		switch (e.$) {
			case 'EVar':
				var x = e.b;
				return _List_fromArray(
					[x]);
			case 'EIndex':
				var e1 = e.b;
				var e2 = e.c;
				return _Utils_ap(
					$author$project$IMP$Eval$neededVarsExpr(e1),
					$author$project$IMP$Eval$neededVarsExpr(e2));
			case 'Eop':
				var e1 = e.c;
				var e2 = e.d;
				return _Utils_ap(
					$author$project$IMP$Eval$neededVarsExpr(e1),
					$author$project$IMP$Eval$neededVarsExpr(e2));
			case 'ENot':
				var e1 = e.b;
				var $temp$e = e1;
				e = $temp$e;
				continue neededVarsExpr;
			case 'EParens':
				var e1 = e.b;
				var $temp$e = e1;
				e = $temp$e;
				continue neededVarsExpr;
			case 'EList':
				var es = e.b;
				return A2($elm$core$List$concatMap, $author$project$IMP$Eval$neededVarsExpr, es);
			case 'ELength':
				var e1 = e.b;
				var $temp$e = e1;
				e = $temp$e;
				continue neededVarsExpr;
			default:
				return _List_Nil;
		}
	}
};
var $author$project$IMP$Eval$neededVarsBase = function (e) {
	switch (e.$) {
		case 'EVar':
			var x = e.b;
			return _List_fromArray(
				[x]);
		case 'EIndex':
			var e1 = e.b;
			var e2 = e.c;
			return _Utils_ap(
				$author$project$IMP$Eval$neededVarsBase(e1),
				$author$project$IMP$Eval$neededVarsExpr(e2));
		default:
			return $author$project$IMP$Eval$neededVarsExpr(e);
	}
};
var $author$project$IMP$Eval$neededVarsLhs = function (e) {
	switch (e.$) {
		case 'EVar':
			return _List_Nil;
		case 'EIndex':
			var e1 = e.b;
			var e2 = e.c;
			return _Utils_ap(
				$author$project$IMP$Eval$neededVarsBase(e1),
				$author$project$IMP$Eval$neededVarsExpr(e2));
		default:
			return $author$project$IMP$Eval$neededVarsExpr(e);
	}
};
var $author$project$IMP$Eval$neededVarsOf = function (s) {
	return $author$project$IMP$Utils$unique(
		function () {
			switch (s.$) {
				case 'SAssign':
					var e1 = s.b;
					var e2 = s.c;
					return _Utils_ap(
						$author$project$IMP$Eval$neededVarsLhs(e1),
						$author$project$IMP$Eval$neededVarsExpr(e2));
				case 'SIf':
					var e = s.b;
					return $author$project$IMP$Eval$neededVarsExpr(e);
				case 'SWhile':
					var e = s.b;
					return $author$project$IMP$Eval$neededVarsExpr(e);
				case 'SPrint':
					var e = s.b;
					return $author$project$IMP$Eval$neededVarsExpr(e);
				case 'SRead':
					return _List_fromArray(
						['input']);
				case 'SSeq':
					var s1 = s.b;
					var s2 = s.c;
					return _Utils_ap(
						$author$project$IMP$Eval$neededVarsOf(s1),
						$author$project$IMP$Eval$neededVarsOf(s2));
				case 'SFuncCall':
					var args = s.c;
					return A2($elm$core$List$concatMap, $author$project$IMP$Eval$neededVarsExpr, args);
				case 'SFuncDef':
					var body = s.d;
					return $author$project$IMP$Eval$neededVarsOf(body);
				default:
					return _List_Nil;
			}
		}());
};
var $author$project$IMP$Eval$isMorePrecise = F2(
	function (old, _new) {
		var _v3 = _Utils_Tuple2(old, _new);
		_v3$3:
		while (true) {
			switch (_v3.a.$) {
				case 'VHole':
					if (_v3.b.$ === 'VHole') {
						var _v4 = _v3.a;
						var _v5 = _v3.b;
						return false;
					} else {
						var _v6 = _v3.a;
						return true;
					}
				case 'VList':
					if (_v3.b.$ === 'VList') {
						var os = _v3.a.a;
						var ns = _v3.b.a;
						return A2($author$project$IMP$Eval$isMorePreciseList, os, ns);
					} else {
						break _v3$3;
					}
				default:
					break _v3$3;
			}
		}
		return false;
	});
var $author$project$IMP$Eval$isMorePreciseList = F2(
	function (os, ns) {
		var _v0 = _Utils_Tuple2(os, ns);
		if (_v0.a.b && _v0.b.b) {
			var _v1 = _v0.a;
			var o = _v1.a;
			var ot = _v1.b;
			var _v2 = _v0.b;
			var n = _v2.a;
			var nt = _v2.b;
			return A2($author$project$IMP$Eval$isMorePrecise, o, n) || A2($author$project$IMP$Eval$isMorePreciseList, ot, nt);
		} else {
			return false;
		}
	});
var $author$project$IMP$Eval$needsImproved = F3(
	function (oldStore, newStore, needs) {
		return A2(
			$elm$core$List$any,
			function (x) {
				var _v0 = _Utils_Tuple2(
					A2($author$project$IMP$Utils$lookup, x, oldStore),
					A2($author$project$IMP$Utils$lookup, x, newStore));
				_v0$2:
				while (true) {
					if (_v0.a.$ === 'Nothing') {
						if (_v0.b.$ === 'Just') {
							var _v1 = _v0.a;
							return true;
						} else {
							break _v0$2;
						}
					} else {
						if (_v0.b.$ === 'Just') {
							var ov = _v0.a.a;
							var nv = _v0.b.a;
							return A2($author$project$IMP$Eval$isMorePrecise, ov, nv);
						} else {
							break _v0$2;
						}
					}
				}
				return false;
			},
			needs);
	});
var $author$project$IMP$Eval$findStore = F2(
	function (id, execList) {
		findStore:
		while (true) {
			if (!execList.b) {
				return _List_Nil;
			} else {
				var _v1 = execList.a;
				var id_ = _v1.a;
				var store_ = _v1.b;
				var rest = execList.b;
				if (_Utils_eq(id_, id)) {
					return store_;
				} else {
					var $temp$id = id,
						$temp$execList = rest;
					id = $temp$id;
					execList = $temp$execList;
					continue findStore;
				}
			}
		}
	});
var $author$project$IMP$Eval$isCompleted = F2(
	function (id, execList) {
		return A2(
			$elm$core$List$any,
			function (_v0) {
				var id_ = _v0.a;
				return _Utils_eq(id_, id);
			},
			execList);
	});
var $author$project$IMP$Utils$outputDashIndex = function (x) {
	return A2($elm$core$String$startsWith, 'output-', x) ? $elm$core$String$toInt(
		A2($elm$core$String$dropLeft, 7, x)) : $elm$core$Maybe$Nothing;
};
var $author$project$IMP$Utils$outputIndexOfName = function (h) {
	_v0$2:
	while (true) {
		switch (h.$) {
			case 'HVar':
				var x = h.a;
				return $author$project$IMP$Utils$outputDashIndex(x);
			case 'HSub':
				if ((h.a.$ === 'HVar') && (h.a.a === 'output')) {
					var n = h.b;
					return $elm$core$Maybe$Just(n);
				} else {
					break _v0$2;
				}
			default:
				break _v0$2;
		}
	}
	return $elm$core$Maybe$Nothing;
};
var $author$project$IMP$Utils$isOutputSuffixHole = function (h) {
	if ((h.$ === 'HVar') && (h.a === 'output')) {
		return true;
	} else {
		return !_Utils_eq(
			$author$project$IMP$Utils$outputIndexOfName(h),
			$elm$core$Maybe$Nothing);
	}
};
var $author$project$IMP$Utils$shiftOutputHoleName = F2(
	function (delta, h) {
		var _v0 = $author$project$IMP$Utils$outputIndexOfName(h);
		if (_v0.$ === 'Just') {
			var i = _v0.a;
			_v1$2:
			while (true) {
				switch (h.$) {
					case 'HVar':
						return $author$project$IMP$Syntax$HVar(
							'output-' + $elm$core$String$fromInt(i + delta));
					case 'HSub':
						if ((h.a.$ === 'HVar') && (h.a.a === 'output')) {
							return A2(
								$author$project$IMP$Syntax$HSub,
								$author$project$IMP$Syntax$HVar('output'),
								i + delta);
						} else {
							break _v1$2;
						}
					default:
						break _v1$2;
				}
			}
			return h;
		} else {
			return h;
		}
	});
var $author$project$IMP$Utils$shiftOutputIndices = F2(
	function (delta, v) {
		switch (v.$) {
			case 'VHole':
				var h = v.a;
				var id = v.b;
				return A2(
					$author$project$IMP$Syntax$VHole,
					A2($author$project$IMP$Utils$shiftOutputHoleName, delta, h),
					id);
			case 'VList':
				var vs = v.a;
				return $author$project$IMP$Syntax$VList(
					A2(
						$elm$core$List$map,
						$author$project$IMP$Utils$shiftOutputIndices(delta),
						vs));
			default:
				return v;
		}
	});
var $author$project$IMP$Utils$findVal = F2(
	function (path, vs) {
		findVal:
		while (true) {
			_v0$2:
			while (true) {
				if (path.$ === 'VList') {
					if (!path.a.b) {
						return vs;
					} else {
						if (path.a.a.$ === 'VInt') {
							var _v1 = path.a;
							var i = _v1.a.a;
							var rest = _v1.b;
							switch (vs.$) {
								case 'VList':
									var nvs = vs.a;
									var $temp$path = $author$project$IMP$Syntax$VList(rest),
										$temp$vs = A2($author$project$IMP$Utils$nthValue, nvs, i);
									path = $temp$path;
									vs = $temp$vs;
									continue findVal;
								case 'VHole':
									return vs;
								default:
									return A2($author$project$IMP$Syntax$VHole, $author$project$IMP$Syntax$HTmp, -1);
							}
						} else {
							break _v0$2;
						}
					}
				} else {
					break _v0$2;
				}
			}
			if (vs.$ === 'VHole') {
				return vs;
			} else {
				return A2($author$project$IMP$Syntax$VHole, $author$project$IMP$Syntax$HTmp, -1);
			}
		}
	});
var $author$project$IMP$Utils$holeBaseVar = function (h) {
	holeBaseVar:
	while (true) {
		switch (h.$) {
			case 'HVar':
				var x = h.a;
				return $elm$core$Maybe$Just(x);
			case 'HSub':
				var h_ = h.a;
				var $temp$h = h_;
				h = $temp$h;
				continue holeBaseVar;
			default:
				return $elm$core$Maybe$Nothing;
		}
	}
};
var $author$project$IMP$Utils$nameToPathList = function (h) {
	if (h.$ === 'HSub') {
		var h_ = h.a;
		var n = h.b;
		return _Utils_ap(
			$author$project$IMP$Utils$nameToPathList(h_),
			_List_fromArray(
				[
					$author$project$IMP$Syntax$VInt(n)
				]));
	} else {
		return _List_Nil;
	}
};
var $author$project$IMP$Utils$nameToPath = function (h) {
	return $author$project$IMP$Syntax$VList(
		$author$project$IMP$Utils$nameToPathList(h));
};
var $author$project$IMP$Utils$lookupHoleVal = F2(
	function (h, store) {
		var _v0 = $author$project$IMP$Utils$holeBaseVar(h);
		if (_v0.$ === 'Just') {
			var x = _v0.a;
			var _v1 = A2($author$project$IMP$Utils$lookup, x, store);
			if (_v1.$ === 'Just') {
				var v = _v1.a;
				var _v2 = $author$project$IMP$Utils$nameToPath(h);
				if ((_v2.$ === 'VList') && (!_v2.a.b)) {
					return $elm$core$Maybe$Just(v);
				} else {
					var path = _v2;
					if (v.$ === 'VHole') {
						return $elm$core$Maybe$Just(v);
					} else {
						var _v4 = A2($author$project$IMP$Utils$findVal, path, v);
						if (_v4.$ === 'VError') {
							return $elm$core$Maybe$Nothing;
						} else {
							var v_ = _v4;
							return $elm$core$Maybe$Just(v_);
						}
					}
				}
			} else {
				return $elm$core$Maybe$Nothing;
			}
		} else {
			return $elm$core$Maybe$Nothing;
		}
	});
var $author$project$IMP$Eval$substValByFinished = F3(
	function (finished, seen, v) {
		substValByFinished:
		while (true) {
			switch (v.$) {
				case 'VHole':
					var h = v.a;
					var id = v.b;
					if (A2($elm$core$List$member, id, seen)) {
						return v;
					} else {
						if (A2($author$project$IMP$Eval$isCompleted, id, finished)) {
							var _v1 = A2(
								$author$project$IMP$Utils$lookupHoleVal,
								h,
								A2($author$project$IMP$Eval$findStore, id, finished));
							if (_v1.$ === 'Just') {
								var v_ = _v1.a;
								var $temp$finished = finished,
									$temp$seen = A2($elm$core$List$cons, id, seen),
									$temp$v = v_;
								finished = $temp$finished;
								seen = $temp$seen;
								v = $temp$v;
								continue substValByFinished;
							} else {
								return v;
							}
						} else {
							return v;
						}
					}
				case 'VList':
					var vs = v.a;
					return $author$project$IMP$Syntax$VList(
						A2(
							$elm$core$List$map,
							A2($author$project$IMP$Eval$substValByFinished, finished, seen),
							vs));
				default:
					return v;
			}
		}
	});
var $elm$core$Maybe$withDefault = F2(
	function (_default, maybe) {
		if (maybe.$ === 'Just') {
			var value = maybe.a;
			return value;
		} else {
			return _default;
		}
	});
var $author$project$IMP$Eval$substOutputList = F3(
	function (finished, seen, vs) {
		return A4($author$project$IMP$Eval$substOutputListWalk, finished, seen, vs, 0);
	});
var $author$project$IMP$Eval$substOutputListWalk = F4(
	function (finished, seen, vs, pos) {
		if (!vs.b) {
			return _List_Nil;
		} else {
			var v = vs.a;
			var rest = vs.b;
			var _v3 = A4($author$project$IMP$Eval$trySpliceOutputHole, finished, seen, v, pos);
			if (_v3.$ === 'Just') {
				var _v4 = _v3.a;
				var suffix = _v4.a;
				var delta = _v4.b;
				return _Utils_ap(
					suffix,
					A4(
						$author$project$IMP$Eval$substOutputListWalk,
						finished,
						seen,
						A2(
							$elm$core$List$map,
							$author$project$IMP$Utils$shiftOutputIndices(delta),
							rest),
						pos + $elm$core$List$length(suffix)));
			} else {
				return A2(
					$elm$core$List$cons,
					A3($author$project$IMP$Eval$substValByFinished, finished, seen, v),
					A4($author$project$IMP$Eval$substOutputListWalk, finished, seen, rest, pos + 1));
			}
		}
	});
var $author$project$IMP$Eval$trySpliceOutputHole = F4(
	function (finished, seen, v, pos) {
		if (v.$ === 'VHole') {
			var h = v.a;
			var id = v.b;
			if (A2($elm$core$List$member, id, seen) || ((!$author$project$IMP$Utils$isOutputSuffixHole(h)) || (!A2($author$project$IMP$Eval$isCompleted, id, finished)))) {
				return $elm$core$Maybe$Nothing;
			} else {
				var idx = A2(
					$elm$core$Maybe$withDefault,
					pos,
					$author$project$IMP$Utils$outputIndexOfName(h));
				var _v1 = A2(
					$author$project$IMP$Utils$lookup,
					'output',
					A2($author$project$IMP$Eval$findStore, id, finished));
				if ((_v1.$ === 'Just') && (_v1.a.$ === 'VList')) {
					var nvs = _v1.a.a;
					var nvs_ = A3(
						$author$project$IMP$Eval$substOutputList,
						finished,
						A2($elm$core$List$cons, id, seen),
						nvs);
					var suffix = A2($elm$core$List$drop, idx, nvs_);
					return $elm$core$Maybe$Just(
						_Utils_Tuple2(
							suffix,
							$elm$core$List$length(suffix) - 1));
				} else {
					return $elm$core$Maybe$Nothing;
				}
			}
		} else {
			return $elm$core$Maybe$Nothing;
		}
	});
var $author$project$IMP$Eval$substOutputVal = F2(
	function (finished, v) {
		if (v.$ === 'VList') {
			var vs = v.a;
			return $author$project$IMP$Syntax$VList(
				A3($author$project$IMP$Eval$substOutputList, finished, _List_Nil, vs));
		} else {
			return A3($author$project$IMP$Eval$substValByFinished, finished, _List_Nil, v);
		}
	});
var $author$project$IMP$Eval$substStoreByFinished = F2(
	function (finished, store) {
		return A2(
			$elm$core$List$map,
			function (_v0) {
				var x = _v0.a;
				var v = _v0.b;
				return (x === 'output') ? _Utils_Tuple2(
					x,
					A2($author$project$IMP$Eval$substOutputVal, finished, v)) : _Utils_Tuple2(
					x,
					A3($author$project$IMP$Eval$substValByFinished, finished, _List_Nil, v));
			},
			store);
	});
var $author$project$IMP$Eval$substRiStmts = F2(
	function (finished, ris) {
		if (!ris.b) {
			return _Utils_Tuple2(_List_Nil, _List_Nil);
		} else {
			var _v1 = ris.a;
			var id = _v1.a;
			var s = _v1.b;
			var st = _v1.c;
			var rest = ris.b;
			var newst = A2($author$project$IMP$Eval$substStoreByFinished, finished, st);
			var needs = $author$project$IMP$Eval$neededVarsOf(s);
			var _v2 = A2($author$project$IMP$Eval$substRiStmts, finished, rest);
			var known = _v2.a;
			var unknown = _v2.b;
			return A3($author$project$IMP$Eval$needsImproved, st, newst, needs) ? _Utils_Tuple2(
				A2(
					$elm$core$List$cons,
					_Utils_Tuple3(id, s, newst),
					known),
				unknown) : _Utils_Tuple2(
				known,
				A2(
					$elm$core$List$cons,
					_Utils_Tuple3(id, s, newst),
					unknown));
		}
	});
var $author$project$IMP$Eval$substValinVal = F3(
	function (finished, store, ris) {
		var _v0 = A2($author$project$IMP$Eval$substRiStmts, finished, ris);
		var known = _v0.a;
		var unknown = _v0.b;
		return _Utils_Tuple3(
			A2($author$project$IMP$Eval$substStoreByFinished, finished, store),
			known,
			unknown);
	});
var $author$project$IMP$Eval$resume = F6(
	function (funcEnv, hb, scount, store, known, unknown) {
		resume:
		while (true) {
			if (!known.b) {
				return {readOnly: $elm$core$Set$empty, riStmts: unknown, scount: scount, store: store};
			} else {
				var _v1 = $timeFillFwd(function () {
					return A4($author$project$IMP$Eval$batchExec, funcEnv, hb, known, scount);
				});
				var finished = _v1.a;
				var newlyResidual = _v1.b;
				var scount1 = _v1.c;
				var _v2 = $timeFillDp(function () {
					return A3(
						$author$project$IMP$Eval$substValinVal,
						finished,
						store,
						_Utils_ap(
							unknown,
							$author$project$IMP$Eval$recoverRiStmts(newlyResidual)));
				});
				var store1 = _v2.a;
				var known1 = _v2.b;
				var unknown1 = _v2.c;
				var $temp$funcEnv = funcEnv,
					$temp$hb = hb,
					$temp$scount = scount1,
					$temp$store = store1,
					$temp$known = known1,
					$temp$unknown = unknown1;
				funcEnv = $temp$funcEnv;
				hb = $temp$hb;
				scount = $temp$scount;
				store = $temp$store;
				known = $temp$known;
				unknown = $temp$unknown;
				continue resume;
			}
		}
	});
var $author$project$IMP$Utils$substHoleinExpr = F3(
	function (id, e, holes) {
		switch (e.$) {
			case 'EVar':
				var ws = e.a;
				var x = e.b;
				return A2($author$project$IMP$Syntax$EVar, ws, x);
			case 'Eop':
				var ws = e.a;
				var op = e.b;
				var e1 = e.c;
				var e2 = e.d;
				return A4(
					$author$project$IMP$Syntax$Eop,
					ws,
					op,
					A3($author$project$IMP$Utils$substHoleinExpr, id, e1, holes),
					A3($author$project$IMP$Utils$substHoleinExpr, id, e2, holes));
			case 'EInt':
				var ws = e.a;
				var i = e.b;
				return A2($author$project$IMP$Syntax$EInt, ws, i);
			case 'EHole':
				if (e.b.$ === 'HOri') {
					var ws = e.a;
					var n = e.b.a;
					var _v1 = A2($elm$core$Dict$get, n, holes);
					if (_v1.$ === 'Just') {
						var expr_ = _v1.a;
						return expr_;
					} else {
						return A2(
							$author$project$IMP$Syntax$EHole,
							ws,
							$author$project$IMP$Syntax$HOri(n));
					}
				} else {
					var ws = e.a;
					var h = e.b;
					return A2($author$project$IMP$Syntax$EHole, ws, h);
				}
			case 'EBool':
				var ws = e.a;
				var b = e.b;
				return A2($author$project$IMP$Syntax$EBool, ws, b);
			case 'EString':
				var ws = e.a;
				var s = e.b;
				return A2($author$project$IMP$Syntax$EString, ws, s);
			case 'EError':
				var s = e.a;
				return $author$project$IMP$Syntax$EError(s);
			case 'ENot':
				var ws = e.a;
				var e_ = e.b;
				return A2(
					$author$project$IMP$Syntax$ENot,
					ws,
					A3($author$project$IMP$Utils$substHoleinExpr, id, e_, holes));
			case 'EParens':
				var ws = e.a;
				var e_ = e.b;
				return A2(
					$author$project$IMP$Syntax$EParens,
					ws,
					A3($author$project$IMP$Utils$substHoleinExpr, id, e_, holes));
			case 'EList':
				var ws = e.a;
				var es = e.b;
				return A2(
					$author$project$IMP$Syntax$EList,
					ws,
					A2(
						$elm$core$List$map,
						function (e_) {
							return A3($author$project$IMP$Utils$substHoleinExpr, id, e_, holes);
						},
						es));
			case 'EIndex':
				var ws = e.a;
				var e1 = e.b;
				var e2 = e.c;
				return A3(
					$author$project$IMP$Syntax$EIndex,
					ws,
					A3($author$project$IMP$Utils$substHoleinExpr, id, e1, holes),
					A3($author$project$IMP$Utils$substHoleinExpr, id, e2, holes));
			default:
				var ws = e.a;
				var e_ = e.b;
				return A2(
					$author$project$IMP$Syntax$ELength,
					ws,
					A3($author$project$IMP$Utils$substHoleinExpr, id, e_, holes));
		}
	});
var $author$project$IMP$Utils$substHoleinStmt = F3(
	function (id, s, holes) {
		switch (s.$) {
			case 'SIf':
				var ws = s.a;
				var e = s.b;
				var s1 = s.c;
				var s2 = s.d;
				return A4(
					$author$project$IMP$Syntax$SIf,
					ws,
					A3($author$project$IMP$Utils$substHoleinExpr, id, e, holes),
					A3($author$project$IMP$Utils$substHoleinStmt, id, s1, holes),
					A3($author$project$IMP$Utils$substHoleinStmt, id, s2, holes));
			case 'SWhile':
				var ws = s.a;
				var e = s.b;
				var s_ = s.c;
				return A3(
					$author$project$IMP$Syntax$SWhile,
					ws,
					A3($author$project$IMP$Utils$substHoleinExpr, id, e, holes),
					A3($author$project$IMP$Utils$substHoleinStmt, id, s_, holes));
			case 'SAssign':
				var ws = s.a;
				var e1 = s.b;
				var e2 = s.c;
				return A3(
					$author$project$IMP$Syntax$SAssign,
					ws,
					A3($author$project$IMP$Utils$substHoleinExpr, id, e1, holes),
					A3($author$project$IMP$Utils$substHoleinExpr, id, e2, holes));
			case 'SRead':
				var ws = s.a;
				var x = s.b;
				return A2($author$project$IMP$Syntax$SRead, ws, x);
			case 'SPrint':
				var ws = s.a;
				var e = s.b;
				return A2(
					$author$project$IMP$Syntax$SPrint,
					ws,
					A3($author$project$IMP$Utils$substHoleinExpr, id, e, holes));
			case 'SSeq':
				var ws = s.a;
				var s1 = s.b;
				var s2 = s.c;
				return A3(
					$author$project$IMP$Syntax$SSeq,
					ws,
					A3($author$project$IMP$Utils$substHoleinStmt, id, s1, holes),
					A3($author$project$IMP$Utils$substHoleinStmt, id, s2, holes));
			case 'SSkip':
				var ws = s.a;
				return $author$project$IMP$Syntax$SSkip(ws);
			case 'SError':
				var info = s.a;
				return $author$project$IMP$Syntax$SError(info);
			case 'SFuncDef':
				var ws = s.a;
				var name = s.b;
				var params = s.c;
				var body = s.d;
				return A4(
					$author$project$IMP$Syntax$SFuncDef,
					ws,
					name,
					params,
					A3($author$project$IMP$Utils$substHoleinStmt, id, body, holes));
			default:
				var ws = s.a;
				var name = s.b;
				var args = s.c;
				return A3(
					$author$project$IMP$Syntax$SFuncCall,
					ws,
					name,
					A2(
						$elm$core$List$map,
						function (e) {
							return A3($author$project$IMP$Utils$substHoleinExpr, id, e, holes);
						},
						args));
		}
	});
var $author$project$IMP$Utils$substHole = F2(
	function (holes, ris) {
		if (!ris.b) {
			return _Utils_Tuple2(_List_Nil, _List_Nil);
		} else {
			var _v1 = ris.a;
			var id = _v1.a;
			var s = _v1.b;
			var store = _v1.c;
			var rest = ris.b;
			var news = A3($author$project$IMP$Utils$substHoleinStmt, id, s, holes);
			if (!_Utils_eq(news, s)) {
				var _v2 = A2($author$project$IMP$Utils$substHole, holes, rest);
				var restl = _v2.a;
				var restr = _v2.b;
				return _Utils_Tuple2(
					A2(
						$elm$core$List$cons,
						_Utils_Tuple3(id, news, store),
						restl),
					restr);
			} else {
				var _v3 = A2($author$project$IMP$Utils$substHole, holes, rest);
				var restl = _v3.a;
				var restr = _v3.b;
				return _Utils_Tuple2(
					restl,
					A2(
						$elm$core$List$cons,
						_Utils_Tuple3(id, news, store),
						restr));
			}
		}
	});
var $author$project$IMP$Utils$substHoleinFuncEnv = F3(
	function (id, env, holes) {
		return A2(
			$elm$core$List$map,
			function (f) {
				return _Utils_update(
					f,
					{
						body: A3($author$project$IMP$Utils$substHoleinStmt, id, f.body, holes)
					});
			},
			env);
	});
var $author$project$IMP$Eval$fill = F4(
	function (funcEnv, holes, hb, fwdRes) {
		var funcEnv1 = A3($author$project$IMP$Utils$substHoleinFuncEnv, 0, funcEnv, holes);
		var _v0 = A2($author$project$IMP$Utils$substHole, holes, fwdRes.riStmts);
		var filled0 = _v0.a;
		var unaffected0 = _v0.b;
		var filled = $author$project$IMP$Eval$recoverRiStmts(filled0);
		var unaffected = $author$project$IMP$Eval$recoverRiStmts(unaffected0);
		var _v1 = $author$project$IMP$Eval$divideAfterFilled(filled);
		var toExec = _v1.a;
		var remaining = _v1.b;
		var remained = _Utils_ap(remaining, unaffected);
		if ($elm$core$List$isEmpty(toExec)) {
			return _Utils_update(
				fwdRes,
				{riStmts: remained});
		} else {
			var _v2 = $timeFillFwd(function () {
				return A4($author$project$IMP$Eval$batchExec, funcEnv1, hb, toExec, fwdRes.scount);
			});
			var finished = _v2.a;
			var newlyResidual = _v2.b;
			var scount1 = _v2.c;
			var _v3 = $timeFillDp(function () {
				return A3(
					$author$project$IMP$Eval$substValinVal,
					finished,
					fwdRes.store,
					_Utils_ap(
						remained,
						$author$project$IMP$Eval$recoverRiStmts(newlyResidual)));
			});
			var store1 = _v3.a;
			var newlyKnown = _v3.b;
			var newlyUnknown = _v3.c;
			return A6($author$project$IMP$Eval$resume, funcEnv1, hb, scount1, store1, newlyKnown, newlyUnknown);
		}
	});
var $elm$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _v0 = f(mx);
		if (_v0.$ === 'Just') {
			var x = _v0.a;
			return A2($elm$core$List$cons, x, xs);
		} else {
			return xs;
		}
	});
var $elm$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$foldr,
			$elm$core$List$maybeCons(f),
			_List_Nil,
			xs);
	});
var $author$project$Controller$keepContextId = F2(
	function (id, ris) {
		return A2(
			$elm$core$List$any,
			function (_v0) {
				var id_ = _v0.a;
				return _Utils_eq(id_, id);
			},
			ris) ? id : (-1);
	});
var $author$project$IMP$Eval$nextScount = F2(
	function (scount, ris) {
		return A3(
			$elm$core$List$foldl,
			F2(
				function (_v0, acc) {
					var id = _v0.a;
					return (_Utils_cmp(id + 1, acc) > 0) ? (id + 1) : acc;
				}),
			scount,
			ris);
	});
var $author$project$IMP$Utils$oriCompactMap = function (hs) {
	return $elm$core$Dict$fromList(
		A2(
			$elm$core$List$indexedMap,
			F2(
				function (i, n) {
					return _Utils_Tuple2(n, i);
				}),
			A3(
				$elm$core$List$foldl,
				F2(
					function (n, acc) {
						return A2($elm$core$List$member, n, acc) ? acc : _Utils_ap(
							acc,
							_List_fromArray(
								[n]));
					}),
				_List_Nil,
				A2(
					$elm$core$List$filterMap,
					function (h) {
						if (h.$ === 'HOri') {
							var n = h.a;
							return $elm$core$Maybe$Just(n);
						} else {
							return $elm$core$Maybe$Nothing;
						}
					},
					hs))));
};
var $author$project$Controller$oriKeyToInt = function (key) {
	return A2($elm$core$String$startsWith, 'o:', key) ? $elm$core$String$toInt(
		A2($elm$core$String$dropLeft, 2, key)) : $elm$core$Maybe$Nothing;
};
var $author$project$IMP$Parser_$parseExpr = $elm$parser$Parser$run(
	A2(
		$elm$parser$Parser$keeper,
		A2(
			$elm$parser$Parser$ignorer,
			$elm$parser$Parser$succeed($elm$core$Basics$identity),
			$author$project$IMP$Parser_$mSpaces),
		A2($elm$parser$Parser$ignorer, $author$project$IMP$Parser_$expr, $elm$parser$Parser$end)));
var $author$project$IMP$Printer$printHoleExpr = function (h) {
	if (h.$ === 'HOri') {
		return '_';
	} else {
		return '{ ' + ($author$project$IMP$Printer$printHoleName(h) + ' }');
	}
};
var $author$project$IMP$Printer$printExpr = function (expr) {
	switch (expr.$) {
		case 'EInt':
			if (expr.a.b && (!expr.a.b.b)) {
				var _v6 = expr.a;
				var s = _v6.a;
				var n = expr.b;
				return _Utils_ap(
					$elm$core$String$fromInt(n),
					s);
			} else {
				var n = expr.b;
				return $elm$core$String$fromInt(n) + ' ';
			}
		case 'EBool':
			if (expr.b) {
				if (expr.a.b && (!expr.a.b.b)) {
					var _v7 = expr.a;
					var s = _v7.a;
					return 'true' + s;
				} else {
					return 'true ';
				}
			} else {
				if (expr.a.b && (!expr.a.b.b)) {
					var _v8 = expr.a;
					var s = _v8.a;
					return 'false' + s;
				} else {
					return 'false ';
				}
			}
		case 'EString':
			if (expr.a.b && (!expr.a.b.b)) {
				var _v9 = expr.a;
				var s = _v9.a;
				var str = expr.b;
				return '\"' + (str + ('\"' + s));
			} else {
				var str = expr.b;
				return '\"' + (str + '\" ');
			}
		case 'EVar':
			if (expr.a.b && (!expr.a.b.b)) {
				var _v10 = expr.a;
				var s = _v10.a;
				var x = expr.b;
				return _Utils_ap(x, s);
			} else {
				var x = expr.b;
				return x + ' ';
			}
		case 'EHole':
			if (expr.a.b && (!expr.a.b.b)) {
				var _v11 = expr.a;
				var s = _v11.a;
				var h = expr.b;
				return _Utils_ap(
					$author$project$IMP$Printer$printHoleExpr(h),
					s);
			} else {
				var h = expr.b;
				return $author$project$IMP$Printer$printHoleExpr(h);
			}
		case 'ENot':
			if (expr.a.b && (!expr.a.b.b)) {
				var _v12 = expr.a;
				var s = _v12.a;
				var e = expr.b;
				return '!' + (s + $author$project$IMP$Printer$printExpr(e));
			} else {
				var e = expr.b;
				return '!' + $author$project$IMP$Printer$printExpr(e);
			}
		case 'EParens':
			if ((expr.a.b && expr.a.b.b) && (!expr.a.b.b.b)) {
				var _v13 = expr.a;
				var s1 = _v13.a;
				var _v14 = _v13.b;
				var s2 = _v14.a;
				var e = expr.b;
				return '(' + (s1 + ($author$project$IMP$Printer$printExpr(e) + (')' + s2)));
			} else {
				var e = expr.b;
				return '(' + ($author$project$IMP$Printer$printExpr(e) + ')');
			}
		case 'Eop':
			if (expr.a.b && (!expr.a.b.b)) {
				var _v15 = expr.a;
				var s = _v15.a;
				var op = expr.b;
				var e1 = expr.c;
				var e2 = expr.d;
				return _Utils_ap(
					$author$project$IMP$Printer$printExpr(e1),
					_Utils_ap(
						op,
						_Utils_ap(
							s,
							$author$project$IMP$Printer$printExpr(e2))));
			} else {
				var op = expr.b;
				var e1 = expr.c;
				var e2 = expr.d;
				return $author$project$IMP$Printer$printExpr(e1) + (' ' + (op + (' ' + $author$project$IMP$Printer$printExpr(e2))));
			}
		case 'EList':
			if (expr.a.b) {
				var _v16 = expr.a;
				var sOpen = _v16.a;
				var rest = _v16.b;
				var es = expr.b;
				var _v17 = $elm$core$List$reverse(rest);
				if (_v17.b) {
					var sClose = _v17.a;
					var commasRev = _v17.b;
					return '[' + (sOpen + (A2(
						$author$project$IMP$Printer$printListBody,
						$elm$core$List$reverse(commasRev),
						es) + (']' + sClose)));
				} else {
					return '[' + (A2(
						$elm$core$String$join,
						', ',
						A2($elm$core$List$map, $author$project$IMP$Printer$printExpr, es)) + ']');
				}
			} else {
				var es = expr.b;
				return '[' + (A2(
					$elm$core$String$join,
					', ',
					A2($elm$core$List$map, $author$project$IMP$Printer$printExpr, es)) + '] ');
			}
		case 'EIndex':
			if ((expr.a.b && expr.a.b.b) && (!expr.a.b.b.b)) {
				var _v18 = expr.a;
				var s1 = _v18.a;
				var _v19 = _v18.b;
				var s2 = _v19.a;
				var e1 = expr.b;
				var e2 = expr.c;
				return $author$project$IMP$Printer$printExpr(e1) + ('[' + (s1 + ($author$project$IMP$Printer$printExpr(e2) + (']' + s2))));
			} else {
				var e1 = expr.b;
				var e2 = expr.c;
				return $author$project$IMP$Printer$printExpr(e1) + ('[' + ($author$project$IMP$Printer$printExpr(e2) + ']'));
			}
		case 'ELength':
			if (expr.a.b && (!expr.a.b.b)) {
				var _v20 = expr.a;
				var s = _v20.a;
				var e = expr.b;
				return $author$project$IMP$Printer$printExpr(e) + ('.length' + s);
			} else {
				var e = expr.b;
				return $author$project$IMP$Printer$printExpr(e) + '.length ';
			}
		default:
			var info = expr.a;
			return info;
	}
};
var $author$project$IMP$Printer$printListBody = F2(
	function (commas, es) {
		if (!es.b) {
			return '';
		} else {
			var e = es.a;
			var rest = es.b;
			return _Utils_ap(
				$author$project$IMP$Printer$printExpr(e),
				A2($author$project$IMP$Printer$printListTail, commas, rest));
		}
	});
var $author$project$IMP$Printer$printListTail = F2(
	function (commas, es) {
		var _v0 = _Utils_Tuple2(commas, es);
		if (_v0.b.b) {
			if (_v0.a.b) {
				var _v1 = _v0.a;
				var c = _v1.a;
				var cs = _v1.b;
				var _v2 = _v0.b;
				var e = _v2.a;
				var rest = _v2.b;
				return ',' + (c + ($author$project$IMP$Printer$printExpr(e) + A2($author$project$IMP$Printer$printListTail, cs, rest)));
			} else {
				var _v3 = _v0.b;
				var e = _v3.a;
				var rest = _v3.b;
				return ', ' + ($author$project$IMP$Printer$printExpr(e) + A2($author$project$IMP$Printer$printListTail, _List_Nil, rest));
			}
		} else {
			return '';
		}
	});
var $author$project$IMP$Printer$printIdentTail = F2(
	function (commas, names) {
		var _v0 = _Utils_Tuple2(commas, names);
		if (_v0.b.b) {
			if (_v0.a.b) {
				var _v1 = _v0.a;
				var c = _v1.a;
				var cs = _v1.b;
				var _v2 = _v0.b;
				var n = _v2.a;
				var rest = _v2.b;
				return ',' + (c + (n + A2($author$project$IMP$Printer$printIdentTail, cs, rest)));
			} else {
				var _v3 = _v0.b;
				var n = _v3.a;
				var rest = _v3.b;
				return ', ' + (n + A2($author$project$IMP$Printer$printIdentTail, _List_Nil, rest));
			}
		} else {
			return '';
		}
	});
var $author$project$IMP$Printer$printIdents = F2(
	function (commas, names) {
		if (!names.b) {
			return '';
		} else {
			var n = names.a;
			var rest = names.b;
			return _Utils_ap(
				n,
				A2($author$project$IMP$Printer$printIdentTail, commas, rest));
		}
	});
var $author$project$IMP$Printer$printStmt = function (stmt) {
	switch (stmt.$) {
		case 'SSkip':
			if (stmt.a.b && (!stmt.a.b.b)) {
				var _v1 = stmt.a;
				var s = _v1.a;
				return 'skip' + s;
			} else {
				return 'skip ';
			}
		case 'SAssign':
			if (stmt.a.b && (!stmt.a.b.b)) {
				var _v2 = stmt.a;
				var s = _v2.a;
				var e1 = stmt.b;
				var e2 = stmt.c;
				return $author$project$IMP$Printer$printExpr(e1) + (':=' + (s + $author$project$IMP$Printer$printExpr(e2)));
			} else {
				var e1 = stmt.b;
				var e2 = stmt.c;
				return $author$project$IMP$Printer$printExpr(e1) + (' := ' + $author$project$IMP$Printer$printExpr(e2));
			}
		case 'SRead':
			if ((stmt.a.b && stmt.a.b.b) && (!stmt.a.b.b.b)) {
				var _v3 = stmt.a;
				var s1 = _v3.a;
				var _v4 = _v3.b;
				var s2 = _v4.a;
				var x = stmt.b;
				return 'read' + (s1 + (x + s2));
			} else {
				var x = stmt.b;
				return 'read ' + (x + ' ');
			}
		case 'SPrint':
			if (stmt.a.b && (!stmt.a.b.b)) {
				var _v5 = stmt.a;
				var s = _v5.a;
				var e = stmt.b;
				return 'print' + (s + $author$project$IMP$Printer$printExpr(e));
			} else {
				var e = stmt.b;
				return 'print ' + $author$project$IMP$Printer$printExpr(e);
			}
		case 'SIf':
			if ((((stmt.a.b && stmt.a.b.b) && stmt.a.b.b.b) && stmt.a.b.b.b.b) && (!stmt.a.b.b.b.b.b)) {
				var _v6 = stmt.a;
				var s1 = _v6.a;
				var _v7 = _v6.b;
				var s2 = _v7.a;
				var _v8 = _v7.b;
				var s3 = _v8.a;
				var _v9 = _v8.b;
				var s4 = _v9.a;
				var e = stmt.b;
				var sThen = stmt.c;
				var sElse = stmt.d;
				return 'if' + (s1 + ($author$project$IMP$Printer$printExpr(e) + ('then' + (s2 + ($author$project$IMP$Printer$printStmt(sThen) + ('else' + (s3 + ($author$project$IMP$Printer$printStmt(sElse) + ('end' + s4)))))))));
			} else {
				var e = stmt.b;
				var sThen = stmt.c;
				var sElse = stmt.d;
				return 'if ' + ($author$project$IMP$Printer$printExpr(e) + ('then ' + ($author$project$IMP$Printer$printStmt(sThen) + ('else ' + ($author$project$IMP$Printer$printStmt(sElse) + 'end ')))));
			}
		case 'SWhile':
			if (((stmt.a.b && stmt.a.b.b) && stmt.a.b.b.b) && (!stmt.a.b.b.b.b)) {
				var _v10 = stmt.a;
				var s1 = _v10.a;
				var _v11 = _v10.b;
				var s2 = _v11.a;
				var _v12 = _v11.b;
				var s3 = _v12.a;
				var e = stmt.b;
				var body = stmt.c;
				return 'while' + (s1 + ($author$project$IMP$Printer$printExpr(e) + ('do' + (s2 + ($author$project$IMP$Printer$printStmt(body) + ('end' + s3))))));
			} else {
				var e = stmt.b;
				var body = stmt.c;
				return 'while ' + ($author$project$IMP$Printer$printExpr(e) + ('do ' + ($author$project$IMP$Printer$printStmt(body) + 'end ')));
			}
		case 'SSeq':
			if (stmt.a.b && (!stmt.a.b.b)) {
				var _v13 = stmt.a;
				var s = _v13.a;
				var s1 = stmt.b;
				var s2 = stmt.c;
				return $author$project$IMP$Printer$printStmt(s1) + (';' + (s + $author$project$IMP$Printer$printStmt(s2)));
			} else {
				var s1 = stmt.b;
				var s2 = stmt.c;
				return $author$project$IMP$Printer$printStmt(s1) + ('; ' + $author$project$IMP$Printer$printStmt(s2));
			}
		case 'SFuncDef':
			if (stmt.a.b && stmt.a.b.b) {
				var _v14 = stmt.a;
				var s1 = _v14.a;
				var _v15 = _v14.b;
				var sOpen = _v15.a;
				var rest = _v15.b;
				var name = stmt.b;
				var params = stmt.c;
				var body = stmt.d;
				var _v16 = $elm$core$List$reverse(rest);
				if (_v16.b && _v16.b.b) {
					var sEnd = _v16.a;
					var _v17 = _v16.b;
					var sClose = _v17.a;
					var commasRev = _v17.b;
					return 'func' + (s1 + (name + ('(' + (sOpen + (A2(
						$author$project$IMP$Printer$printIdents,
						$elm$core$List$reverse(commasRev),
						params) + (')' + (sClose + ($author$project$IMP$Printer$printStmt(body) + ('end' + sEnd)))))))));
				} else {
					return 'func ' + (name + ('(' + (A2($elm$core$String$join, ', ', params) + (') ' + ($author$project$IMP$Printer$printStmt(body) + 'end ')))));
				}
			} else {
				var name = stmt.b;
				var params = stmt.c;
				var body = stmt.d;
				return 'func ' + (name + ('(' + (A2($elm$core$String$join, ', ', params) + (') ' + ($author$project$IMP$Printer$printStmt(body) + 'end ')))));
			}
		case 'SFuncCall':
			if (stmt.a.b) {
				var _v18 = stmt.a;
				var sOpen = _v18.a;
				var rest = _v18.b;
				var name = stmt.b;
				var args = stmt.c;
				var _v19 = $elm$core$List$reverse(rest);
				if (_v19.b) {
					var sClose = _v19.a;
					var commasRev = _v19.b;
					return name + ('(' + (sOpen + (A2(
						$author$project$IMP$Printer$printListBody,
						$elm$core$List$reverse(commasRev),
						args) + (')' + sClose))));
				} else {
					return name + ('(' + (A2(
						$elm$core$String$join,
						', ',
						A2($elm$core$List$map, $author$project$IMP$Printer$printExpr, args)) + ') '));
				}
			} else {
				var name = stmt.b;
				var args = stmt.c;
				return name + ('(' + (A2(
					$elm$core$String$join,
					', ',
					A2($elm$core$List$map, $author$project$IMP$Printer$printExpr, args)) + ') '));
			}
		default:
			var info = stmt.a;
			return info;
	}
};
var $author$project$IMP$Utils$remapOriExpr = F2(
	function (mp, e) {
		_v0$7:
		while (true) {
			switch (e.$) {
				case 'EHole':
					if (e.b.$ === 'HOri') {
						var ws = e.a;
						var n = e.b.a;
						var _v1 = A2($elm$core$Dict$get, n, mp);
						if (_v1.$ === 'Just') {
							var n_ = _v1.a;
							return A2(
								$author$project$IMP$Syntax$EHole,
								ws,
								$author$project$IMP$Syntax$HOri(n_));
						} else {
							return A2(
								$author$project$IMP$Syntax$EHole,
								ws,
								$author$project$IMP$Syntax$HOri(n));
						}
					} else {
						break _v0$7;
					}
				case 'Eop':
					var ws = e.a;
					var op = e.b;
					var e1 = e.c;
					var e2 = e.d;
					return A4(
						$author$project$IMP$Syntax$Eop,
						ws,
						op,
						A2($author$project$IMP$Utils$remapOriExpr, mp, e1),
						A2($author$project$IMP$Utils$remapOriExpr, mp, e2));
				case 'ENot':
					var ws = e.a;
					var e1 = e.b;
					return A2(
						$author$project$IMP$Syntax$ENot,
						ws,
						A2($author$project$IMP$Utils$remapOriExpr, mp, e1));
				case 'EParens':
					var ws = e.a;
					var e1 = e.b;
					return A2(
						$author$project$IMP$Syntax$EParens,
						ws,
						A2($author$project$IMP$Utils$remapOriExpr, mp, e1));
				case 'EList':
					var ws = e.a;
					var es = e.b;
					return A2(
						$author$project$IMP$Syntax$EList,
						ws,
						A2(
							$elm$core$List$map,
							$author$project$IMP$Utils$remapOriExpr(mp),
							es));
				case 'EIndex':
					var ws = e.a;
					var e1 = e.b;
					var e2 = e.c;
					return A3(
						$author$project$IMP$Syntax$EIndex,
						ws,
						A2($author$project$IMP$Utils$remapOriExpr, mp, e1),
						A2($author$project$IMP$Utils$remapOriExpr, mp, e2));
				case 'ELength':
					var ws = e.a;
					var e1 = e.b;
					return A2(
						$author$project$IMP$Syntax$ELength,
						ws,
						A2($author$project$IMP$Utils$remapOriExpr, mp, e1));
				default:
					break _v0$7;
			}
		}
		return e;
	});
var $author$project$IMP$Utils$remapOriStmt = F2(
	function (mp, s) {
		switch (s.$) {
			case 'SAssign':
				var ws = s.a;
				var e1 = s.b;
				var e2 = s.c;
				return A3(
					$author$project$IMP$Syntax$SAssign,
					ws,
					A2($author$project$IMP$Utils$remapOriExpr, mp, e1),
					A2($author$project$IMP$Utils$remapOriExpr, mp, e2));
			case 'SIf':
				var ws = s.a;
				var e = s.b;
				var s1 = s.c;
				var s2 = s.d;
				return A4(
					$author$project$IMP$Syntax$SIf,
					ws,
					A2($author$project$IMP$Utils$remapOriExpr, mp, e),
					A2($author$project$IMP$Utils$remapOriStmt, mp, s1),
					A2($author$project$IMP$Utils$remapOriStmt, mp, s2));
			case 'SWhile':
				var ws = s.a;
				var e = s.b;
				var body = s.c;
				return A3(
					$author$project$IMP$Syntax$SWhile,
					ws,
					A2($author$project$IMP$Utils$remapOriExpr, mp, e),
					A2($author$project$IMP$Utils$remapOriStmt, mp, body));
			case 'SPrint':
				var ws = s.a;
				var e = s.b;
				return A2(
					$author$project$IMP$Syntax$SPrint,
					ws,
					A2($author$project$IMP$Utils$remapOriExpr, mp, e));
			case 'SSeq':
				var ws = s.a;
				var s1 = s.b;
				var s2 = s.c;
				return A3(
					$author$project$IMP$Syntax$SSeq,
					ws,
					A2($author$project$IMP$Utils$remapOriStmt, mp, s1),
					A2($author$project$IMP$Utils$remapOriStmt, mp, s2));
			case 'SFuncDef':
				var ws = s.a;
				var name = s.b;
				var params = s.c;
				var body = s.d;
				return A4(
					$author$project$IMP$Syntax$SFuncDef,
					ws,
					name,
					params,
					A2($author$project$IMP$Utils$remapOriStmt, mp, body));
			case 'SFuncCall':
				var ws = s.a;
				var name = s.b;
				var args = s.c;
				return A3(
					$author$project$IMP$Syntax$SFuncCall,
					ws,
					name,
					A2(
						$elm$core$List$map,
						$author$project$IMP$Utils$remapOriExpr(mp),
						args));
			default:
				return s;
		}
	});
var $author$project$IMP$Utils$remapOriFuncEnv = F2(
	function (mp, env) {
		return A2(
			$elm$core$List$map,
			function (f) {
				return _Utils_update(
					f,
					{
						body: A2($author$project$IMP$Utils$remapOriStmt, mp, f.body)
					});
			},
			env);
	});
var $author$project$IMP$Utils$remapOriRiStmts = F2(
	function (mp, ris) {
		return A2(
			$elm$core$List$map,
			function (_v0) {
				var id = _v0.a;
				var s = _v0.b;
				var store = _v0.c;
				return _Utils_Tuple3(
					id,
					A2($author$project$IMP$Utils$remapOriStmt, mp, s),
					store);
			},
			ris);
	});
var $elm$core$Dict$sizeHelp = F2(
	function (n, dict) {
		sizeHelp:
		while (true) {
			if (dict.$ === 'RBEmpty_elm_builtin') {
				return n;
			} else {
				var left = dict.d;
				var right = dict.e;
				var $temp$n = A2($elm$core$Dict$sizeHelp, n + 1, right),
					$temp$dict = left;
				n = $temp$n;
				dict = $temp$dict;
				continue sizeHelp;
			}
		}
	});
var $elm$core$Dict$size = function (dict) {
	return A2($elm$core$Dict$sizeHelp, 0, dict);
};
var $elm$core$Set$size = function (_v0) {
	var dict = _v0.a;
	return $elm$core$Dict$size(dict);
};
var $author$project$Controller$saveAndFillWith = function (model) {
	var parsed = A2(
		$elm$core$List$filterMap,
		function (key) {
			return A2(
				$elm$core$Maybe$andThen,
				function (src) {
					var _v5 = _Utils_Tuple2(
						$author$project$Controller$oriKeyToInt(key),
						$author$project$IMP$Parser_$parseExpr(src));
					if ((_v5.a.$ === 'Just') && (_v5.b.$ === 'Ok')) {
						var n = _v5.a.a;
						var e = _v5.b.a;
						return $elm$core$Maybe$Just(
							_Utils_Tuple2(n, e));
					} else {
						return $elm$core$Maybe$Nothing;
					}
				},
				A2($elm$core$Dict$get, key, model.fillDraft));
		},
		$elm$core$Set$toList(model.fillSelected));
	var holeDict = $elm$core$Dict$fromList(parsed);
	if (!_Utils_eq(
		$elm$core$Set$size(model.fillSelected),
		$elm$core$List$length(parsed))) {
		return _Utils_update(
			model,
			{output: 'Parse error in fill expression'});
	} else {
		var res = function () {
			var funcEnv = function () {
				var _v3 = $author$project$IMP$Parser_$parse(model.code);
				if (_v3.$ === 'Ok') {
					var stmt = _v3.a;
					var _v4 = $author$project$IMP$Utils$prepareStmt(stmt);
					var env = _v4.c;
					return env;
				} else {
					return _List_Nil;
				}
			}();
			return $timeEval("Fill-and-resume", function () {
				$fillFwdMs = 0;
				$fillDpMs = 0;
				var result = A4(
					$author$project$IMP$Eval$fill,
					funcEnv,
					holeDict,
					model.holeBindings,
					{
						readOnly: $elm$core$Set$empty,
						riStmts: model.riStmts,
						scount: A2($author$project$IMP$Eval$nextScount, 0, model.riStmts),
						store: model.store
					});
				console.log("Fill-and-resume DP: " + $fillDpMs.toFixed(3) + " ms");
				console.log("Fill-and-resume forward: " + $fillFwdMs.toFixed(3) + " ms");
				return result;
			});
		}();
		var _v0 = function () {
			var _v1 = $author$project$IMP$Parser_$parse(model.code);
			if (_v1.$ === 'Ok') {
				var stmt = _v1.a;
				var _v2 = $author$project$IMP$Utils$prepareStmt(stmt);
				var stmt_ = _v2.a;
				var funcEnv = _v2.c;
				var substEnv = A3($author$project$IMP$Utils$substHoleinFuncEnv, 0, funcEnv, holeDict);
				var substStmt = A3($author$project$IMP$Utils$substHoleinStmt, 0, stmt_, holeDict);
				var holeMap = $author$project$IMP$Utils$oriCompactMap(
					_Utils_ap(
						$author$project$Controller$collectOriInStmt(substStmt),
						_Utils_ap(
							$author$project$Controller$collectOriInFuncEnv(substEnv),
							$author$project$Controller$collectOriInRiStmts(res.riStmts))));
				var newEnv = A2($author$project$IMP$Utils$remapOriFuncEnv, holeMap, substEnv);
				var newStmt = A2($author$project$IMP$Utils$remapOriStmt, holeMap, substStmt);
				return _Utils_Tuple2(
					$author$project$IMP$Printer$printStmt(
						A2($author$project$IMP$Utils$attachFuncs, newEnv, newStmt)),
					A2($author$project$IMP$Utils$remapOriRiStmts, holeMap, res.riStmts));
			} else {
				return _Utils_Tuple2(model.code, res.riStmts);
			}
		}();
		var newCode = _v0.a;
		var newRi = _v0.b;
		var keepId = A2($author$project$Controller$keepContextId, model.currentContext, newRi);
		return _Utils_update(
			model,
			{
				code: newCode,
				codeBackup: newCode,
				contextDrafts: A2($author$project$Controller$contextDraftsOf, keepId, newRi),
				currentContext: keepId,
				fillDraft: $elm$core$Dict$empty,
				fillSelected: $elm$core$Set$empty,
				filling: false,
				hbBackup: _List_Nil,
				holeBindings: _List_Nil,
				holeDict: holeDict,
				oriHoles: _List_Nil,
				output: $author$project$IMP$Printer$printOutput(res.store),
				riStmts: newRi,
				store: res.store
			});
	}
};
var $author$project$Controller$saveAndFill = function (model) {
	var _v0 = $author$project$Controller$applyContextDraft(model);
	if (_v0.$ === 'Err') {
		var info = _v0.a;
		return _Utils_update(
			model,
			{output: info});
	} else {
		var model1 = _v0.a;
		return $author$project$Controller$saveAndFillWith(model1);
	}
};
var $author$project$Controller$saveInput = function (model) {
	var _v0 = $author$project$IMP$Parser_$parseValue(model.inputDraft);
	if (_v0.$ === 'Ok') {
		if (_v0.a.$ === 'VList') {
			var vs = _v0.a.a;
			var newInput = $author$project$IMP$Syntax$VList(vs);
			return _Utils_update(
				model,
				{
					editingInput: false,
					inputDraft: '',
					startStore: A3($author$project$IMP$Utils$updateStore, 'input', newInput, model.startStore),
					store: A3($author$project$IMP$Utils$updateStore, 'input', newInput, model.store)
				});
		} else {
			return _Utils_update(
				model,
				{output: 'Input must be a list, e.g. [1, 2, 3]'});
		}
	} else {
		return _Utils_update(
			model,
			{output: 'Parse error in input'});
	}
};
var $author$project$Controller$selectResidual = F2(
	function (id, model) {
		var model1 = $author$project$Controller$commitContextDraft(model);
		return _Utils_update(
			model1,
			{
				contextDrafts: A2($author$project$Controller$contextDraftsOf, id, model1.riStmts),
				currentContext: id
			});
	});
var $elm$json$Json$Encode$bool = _Json_wrap;
var $elm$json$Json$Encode$list = F2(
	function (func, entries) {
		return _Json_wrap(
			A3(
				$elm$core$List$foldl,
				_Json_addEntry(func),
				_Json_emptyArray(_Utils_Tuple0),
				entries));
	});
var $elm$json$Json$Encode$string = _Json_wrap;
var $author$project$Main$sendCode = _Platform_outgoingPort(
	'sendCode',
	function ($) {
		var a = $.a;
		var b = $.b;
		return A2(
			$elm$json$Json$Encode$list,
			$elm$core$Basics$identity,
			_List_fromArray(
				[
					$elm$json$Json$Encode$string(a),
					$elm$json$Json$Encode$bool(b)
				]));
	});
var $elm$json$Json$Encode$null = _Json_encodeNull;
var $author$project$Main$setAceRed = _Platform_outgoingPort(
	'setAceRed',
	function ($) {
		return $elm$json$Json$Encode$null;
	});
var $author$project$Main$setConsoleVisible = _Platform_outgoingPort('setConsoleVisible', $elm$json$Json$Encode$string);
var $elm$core$String$lines = _String_lines;
var $author$project$Controller$parseOutputLines = function (lines) {
	if (!lines.b) {
		return $elm$core$Result$Ok(_List_Nil);
	} else {
		var line = lines.a;
		var rest = lines.b;
		var _v1 = $author$project$IMP$Parser_$parseValue(line);
		if (_v1.$ === 'Ok') {
			var v = _v1.a;
			return A2(
				$elm$core$Result$map,
				function (vs) {
					return A2($elm$core$List$cons, v, vs);
				},
				$author$project$Controller$parseOutputLines(rest));
		} else {
			return $elm$core$Result$Err('Parse error in output');
		}
	}
};
var $elm$core$String$trim = _String_trim;
var $author$project$Controller$parseOutputText = function (src) {
	return $author$project$Controller$parseOutputLines(
		A2(
			$elm$core$List$filter,
			function (line) {
				return line !== '';
			},
			A2(
				$elm$core$List$map,
				$elm$core$String$trim,
				$elm$core$String$lines(src))));
};
var $author$project$IMP$Uneval$defaultUnexecRes = {
	funcEnv: _List_Nil,
	hcount: 0,
	holeBindings: _List_Nil,
	riStmts: _List_Nil,
	stmt: $author$project$IMP$Syntax$SSkip(_List_Nil),
	store: _List_Nil
};
var $author$project$IMP$Uneval$dropRiStmt = F2(
	function (id, ris) {
		return A2(
			$elm$core$List$filter,
			function (_v0) {
				var id_ = _v0.a;
				return !_Utils_eq(id_, id);
			},
			ris);
	});
var $author$project$IMP$Uneval$fmtStore = function (s) {
	return A2(
		$elm$core$String$join,
		' || ',
		A2(
			$elm$core$List$map,
			function (_v0) {
				var x = _v0.a;
				var v = _v0.b;
				return x + ('=' + $author$project$IMP$Printer$printValue(v));
			},
			s));
};
var $author$project$IMP$Uneval$getFinalRiStmtStore = function (riStmts) {
	getFinalRiStmtStore:
	while (true) {
		if (riStmts.b) {
			if (!riStmts.b.b) {
				var _v1 = riStmts.a;
				var store = _v1.c;
				return store;
			} else {
				var rest = riStmts.b;
				var $temp$riStmts = rest;
				riStmts = $temp$riStmts;
				continue getFinalRiStmtStore;
			}
		} else {
			return _List_Nil;
		}
	}
};
var $author$project$IMP$Utils$lookupFuncBody = F3(
	function (name, env, defaultBody) {
		var _v0 = A2($author$project$IMP$Utils$lookupFunc, name, env);
		if (_v0.$ === 'Just') {
			var _v1 = _v0.a;
			var body = _v1.b;
			return body;
		} else {
			return defaultBody;
		}
	});
var $author$project$IMP$Utils$mergeFuncEnv = F3(
	function (env1, env2, orig) {
		return A2(
			$elm$core$List$map,
			function (f) {
				var body2 = A3($author$project$IMP$Utils$lookupFuncBody, f.name, env2, f.body);
				var body1 = A3($author$project$IMP$Utils$lookupFuncBody, f.name, env1, f.body);
				return (!_Utils_eq(body1, f.body)) ? _Utils_update(
					f,
					{body: body1}) : _Utils_update(
					f,
					{body: body2});
			},
			orig);
	});
var $author$project$IMP$Uneval$getElem = F3(
	function (hn, store, hb) {
		if (hb.b) {
			var _v1 = hb.a;
			var hn_ = _v1.a;
			var store_ = _v1.b;
			var v_ = _v1.c;
			var hb_ = hb.b;
			if (_Utils_eq(hn, hn_) && A2($author$project$IMP$Utils$isSameStore, store, store_)) {
				return _Utils_Tuple2(v_, hb_);
			} else {
				var _v2 = A3($author$project$IMP$Uneval$getElem, hn, store, hb_);
				var resv = _v2.a;
				var reshb = _v2.b;
				return _Utils_Tuple2(
					resv,
					A2(
						$elm$core$List$cons,
						_Utils_Tuple3(hn_, store_, v_),
						reshb));
			}
		} else {
			return _Utils_Tuple2(
				$author$project$IMP$Syntax$VError('No such hole'),
				hb);
		}
	});
var $author$project$IMP$Uneval$mergeList = F3(
	function (os, vs1, vs2) {
		var _v1 = _Utils_Tuple3(os, vs1, vs2);
		_v1$2:
		while (true) {
			if (_v1.b.b) {
				if (_v1.c.b) {
					if (_v1.a.b) {
						var _v2 = _v1.a;
						var o = _v2.a;
						var os_ = _v2.b;
						var _v3 = _v1.b;
						var a = _v3.a;
						var as_ = _v3.b;
						var _v4 = _v1.c;
						var b = _v4.a;
						var bs_ = _v4.b;
						return A2(
							$elm$core$List$cons,
							A3($author$project$IMP$Uneval$mergeValue, o, a, b),
							A3($author$project$IMP$Uneval$mergeList, os_, as_, bs_));
					} else {
						var _v5 = _v1.b;
						var a = _v5.a;
						var as_ = _v5.b;
						var _v6 = _v1.c;
						var b = _v6.a;
						var bs_ = _v6.b;
						return A2(
							$elm$core$List$cons,
							(!_Utils_eq(a, b)) ? a : b,
							A3($author$project$IMP$Uneval$mergeList, _List_Nil, as_, bs_));
					}
				} else {
					if (!_v1.a.b) {
						break _v1$2;
					} else {
						var orest = _v1.a;
						var arest = _v1.b;
						return (!_Utils_eq(arest, orest)) ? arest : orest;
					}
				}
			} else {
				if (!_v1.c.b) {
					if (!_v1.a.b) {
						break _v1$2;
					} else {
						return _List_Nil;
					}
				} else {
					if (!_v1.a.b) {
						var bs_ = _v1.c;
						return bs_;
					} else {
						var orest = _v1.a;
						var brest = _v1.c;
						return (!_Utils_eq(brest, orest)) ? brest : orest;
					}
				}
			}
		}
		var as_ = _v1.b;
		return as_;
	});
var $author$project$IMP$Uneval$mergeValue = F3(
	function (orig, v1, v2) {
		var _v0 = _Utils_Tuple3(orig, v1, v2);
		if (((_v0.a.$ === 'VList') && (_v0.b.$ === 'VList')) && (_v0.c.$ === 'VList')) {
			var os = _v0.a.a;
			var vs1 = _v0.b.a;
			var vs2 = _v0.c.a;
			return $author$project$IMP$Syntax$VList(
				A3($author$project$IMP$Uneval$mergeList, os, vs1, vs2));
		} else {
			return (!_Utils_eq(v1, orig)) ? v1 : v2;
		}
	});
var $author$project$IMP$Uneval$elemIn = F3(
	function (hn, store, hb) {
		elemIn:
		while (true) {
			if (hb.b) {
				var _v1 = hb.a;
				var hn_ = _v1.a;
				var store_ = _v1.b;
				var hb_ = hb.b;
				if (_Utils_eq(hn, hn_) && A2($author$project$IMP$Utils$isSameStore, store, store_)) {
					return true;
				} else {
					var $temp$hn = hn,
						$temp$store = store,
						$temp$hb = hb_;
					hn = $temp$hn;
					store = $temp$store;
					hb = $temp$hb;
					continue elemIn;
				}
			} else {
				return false;
			}
		}
	});
var $author$project$IMP$Uneval$union = F2(
	function (hb1, hb2) {
		union:
		while (true) {
			if (hb2.b) {
				var _v1 = hb2.a;
				var hn2 = _v1.a;
				var store2 = _v1.b;
				var v2 = _v1.c;
				var hb2_ = hb2.b;
				if (A3($author$project$IMP$Uneval$elemIn, hn2, store2, hb1)) {
					var $temp$hb1 = hb1,
						$temp$hb2 = hb2_;
					hb1 = $temp$hb1;
					hb2 = $temp$hb2;
					continue union;
				} else {
					return A2(
						$elm$core$List$cons,
						_Utils_Tuple3(hn2, store2, v2),
						A2($author$project$IMP$Uneval$union, hb1, hb2_));
				}
			} else {
				return hb1;
			}
		}
	});
var $author$project$IMP$Uneval$mergeHoleBindings = F3(
	function (hb1, hb2, hb) {
		if (hb.b) {
			var _v1 = hb.a;
			var hn = _v1.a;
			var store = _v1.b;
			var v = _v1.c;
			var hb_ = hb.b;
			var _v2 = A3($author$project$IMP$Uneval$getElem, hn, store, hb2);
			var v2 = _v2.a;
			var hb2_ = _v2.b;
			var newE2 = _Utils_Tuple3(hn, store, v2);
			var _v3 = A3($author$project$IMP$Uneval$getElem, hn, store, hb1);
			var v1 = _v3.a;
			var hb1_ = _v3.b;
			var resMerge = A3($author$project$IMP$Uneval$mergeHoleBindings, hb1_, hb2_, hb_);
			var newE1 = _Utils_Tuple3(hn, store, v1);
			if (v1.$ === 'VError') {
				return A2($elm$core$List$cons, newE2, resMerge);
			} else {
				if (v2.$ === 'VError') {
					return (!_Utils_eq(v1, v)) ? A2($elm$core$List$cons, newE1, resMerge) : A2(
						$elm$core$List$cons,
						_Utils_Tuple3(hn, store, v),
						resMerge);
				} else {
					return A2(
						$elm$core$List$cons,
						_Utils_Tuple3(
							hn,
							store,
							A3($author$project$IMP$Uneval$mergeValue, v, v1, v2)),
						resMerge);
				}
			}
		} else {
			return A2($author$project$IMP$Uneval$union, hb1, hb2);
		}
	});
var $author$project$IMP$Uneval$mergeOutput = F3(
	function (orig, v1, v2) {
		var _v0 = _Utils_Tuple3(orig, v1, v2);
		_v0$3:
		while (true) {
			if (_v0.a.$ === 'VList') {
				if (_v0.b.$ === 'VList') {
					if (_v0.c.$ === 'VList') {
						var os = _v0.a.a;
						var as_ = _v0.b.a;
						var bs_ = _v0.c.a;
						return $author$project$IMP$Syntax$VList(
							A3($author$project$IMP$Uneval$mergeList, os, as_, bs_));
					} else {
						var os = _v0.a.a;
						var as_ = _v0.b.a;
						return $author$project$IMP$Syntax$VList(
							A3($author$project$IMP$Uneval$mergeList, os, as_, os));
					}
				} else {
					if (_v0.c.$ === 'VList') {
						var os = _v0.a.a;
						var bs_ = _v0.c.a;
						return $author$project$IMP$Syntax$VList(
							A3($author$project$IMP$Uneval$mergeList, os, os, bs_));
					} else {
						break _v0$3;
					}
				}
			} else {
				break _v0$3;
			}
		}
		return A3($author$project$IMP$Uneval$mergeValue, orig, v1, v2);
	});
var $author$project$IMP$Uneval$mergeStoreEntry = F4(
	function (store1, store2, store3, x) {
		var _v0 = A2($author$project$IMP$Utils$lookup, x, store3);
		if (_v0.$ === 'Just') {
			var v3 = _v0.a;
			var v2 = A2(
				$elm$core$Maybe$withDefault,
				v3,
				A2($author$project$IMP$Utils$lookup, x, store2));
			var v1 = A2(
				$elm$core$Maybe$withDefault,
				v3,
				A2($author$project$IMP$Utils$lookup, x, store1));
			return $elm$core$Maybe$Just(
				_Utils_Tuple2(
					x,
					(x === 'output') ? A3($author$project$IMP$Uneval$mergeOutput, v3, v1, v2) : A3($author$project$IMP$Uneval$mergeValue, v3, v1, v2)));
		} else {
			var _v1 = _Utils_Tuple2(
				A2($author$project$IMP$Utils$lookup, x, store1),
				A2($author$project$IMP$Utils$lookup, x, store2));
			if (_v1.a.$ === 'Just') {
				if (_v1.b.$ === 'Just') {
					var v1 = _v1.a.a;
					return $elm$core$Maybe$Just(
						_Utils_Tuple2(x, v1));
				} else {
					var v1 = _v1.a.a;
					var _v2 = _v1.b;
					return $elm$core$Maybe$Just(
						_Utils_Tuple2(x, v1));
				}
			} else {
				if (_v1.b.$ === 'Just') {
					var _v3 = _v1.a;
					var v2 = _v1.b.a;
					return $elm$core$Maybe$Just(
						_Utils_Tuple2(x, v2));
				} else {
					var _v4 = _v1.a;
					var _v5 = _v1.b;
					return $elm$core$Maybe$Nothing;
				}
			}
		}
	});
var $author$project$IMP$Uneval$storeKeyOrder = F3(
	function (store1, store2, store3) {
		var addKeys = F2(
			function (store, _v2) {
				var acc = _v2.a;
				var seen = _v2.b;
				return A3(
					$elm$core$List$foldl,
					F2(
						function (_v0, _v1) {
							var k = _v0.a;
							var acc2 = _v1.a;
							var s = _v1.b;
							return A2($elm$core$Set$member, k, s) ? _Utils_Tuple2(acc2, s) : _Utils_Tuple2(
								A2($elm$core$List$cons, k, acc2),
								A2($elm$core$Set$insert, k, s));
						}),
					_Utils_Tuple2(acc, seen),
					store);
			});
		return $elm$core$List$reverse(
			A3(
				$elm$core$List$foldl,
				addKeys,
				_Utils_Tuple2(_List_Nil, $elm$core$Set$empty),
				_List_fromArray(
					[store3, store1, store2])).a);
	});
var $author$project$IMP$Uneval$mergeStore = F3(
	function (store1, store2, store3) {
		return A2(
			$elm$core$List$filterMap,
			A3($author$project$IMP$Uneval$mergeStoreEntry, store1, store2, store3),
			A3($author$project$IMP$Uneval$storeKeyOrder, store1, store2, store3));
	});
var $author$project$IMP$Utils$findOutputRoundCell = F2(
	function (vs, scount) {
		findOutputRoundCell:
		while (true) {
			if (!vs.b) {
				return $elm$core$Maybe$Nothing;
			} else {
				if (vs.a.$ === 'VHole') {
					var v = vs.a;
					var h = v.a;
					var id = v.b;
					var rest = vs.b;
					if (_Utils_eq(id, scount) && $author$project$IMP$Utils$isOutputSuffixHole(h)) {
						return $elm$core$Maybe$Just(v);
					} else {
						var $temp$vs = rest,
							$temp$scount = scount;
						vs = $temp$vs;
						scount = $temp$scount;
						continue findOutputRoundCell;
					}
				} else {
					var rest = vs.b;
					var $temp$vs = rest,
						$temp$scount = scount;
					vs = $temp$vs;
					scount = $temp$scount;
					continue findOutputRoundCell;
				}
			}
		}
	});
var $author$project$IMP$Utils$outputRoundCellKept = F3(
	function (polluted, newstore, scount) {
		var _v0 = _Utils_Tuple2(
			A2($author$project$IMP$Utils$lookup, 'output', polluted),
			A2($author$project$IMP$Utils$lookup, 'output', newstore));
		if ((((_v0.a.$ === 'Just') && (_v0.a.a.$ === 'VList')) && (_v0.b.$ === 'Just')) && (_v0.b.a.$ === 'VList')) {
			var oldvs = _v0.a.a.a;
			var newvs = _v0.b.a.a;
			var _v1 = A2($author$project$IMP$Utils$findOutputRoundCell, oldvs, scount);
			if (_v1.$ === 'Just') {
				var cell = _v1.a;
				return A2($elm$core$List$member, cell, newvs);
			} else {
				return _Utils_eq(oldvs, newvs);
			}
		} else {
			var a = _v0.a;
			var b = _v0.b;
			return _Utils_eq(a, b);
		}
	});
var $author$project$IMP$Utils$sameMayMod = F4(
	function (xs, polluted, newstore, scount) {
		sameMayMod:
		while (true) {
			if (!xs.b) {
				return true;
			} else {
				if (xs.a === 'output') {
					var rest = xs.b;
					return A3($author$project$IMP$Utils$outputRoundCellKept, polluted, newstore, scount) && A4($author$project$IMP$Utils$sameMayMod, rest, polluted, newstore, scount);
				} else {
					var x = xs.a;
					var rest = xs.b;
					if (_Utils_eq(
						A2($author$project$IMP$Utils$lookup, x, polluted),
						A2($author$project$IMP$Utils$lookup, x, newstore))) {
						var $temp$xs = rest,
							$temp$polluted = polluted,
							$temp$newstore = newstore,
							$temp$scount = scount;
						xs = $temp$xs;
						polluted = $temp$polluted;
						newstore = $temp$newstore;
						scount = $temp$scount;
						continue sameMayMod;
					} else {
						return false;
					}
				}
			}
		}
	});
var $author$project$IMP$Uneval$stmtTag = function (stmt) {
	switch (stmt.$) {
		case 'SAssign':
			var e1 = stmt.b;
			return 'SAssign ' + $author$project$IMP$Printer$printExpr(e1);
		case 'SPrint':
			var e = stmt.b;
			return 'SPrint ' + $author$project$IMP$Printer$printExpr(e);
		case 'SWhile':
			var e = stmt.b;
			return 'SWhile ' + $author$project$IMP$Printer$printExpr(e);
		case 'SIf':
			var e = stmt.b;
			return 'SIf ' + $author$project$IMP$Printer$printExpr(e);
		case 'SSeq':
			return 'SSeq';
		case 'SFuncCall':
			var name = stmt.b;
			return 'SFuncCall ' + name;
		case 'SSkip':
			return 'SSkip';
		case 'SRead':
			var x = stmt.b;
			return 'SRead ' + x;
		case 'SFuncDef':
			var name = stmt.b;
			return 'SFuncDef ' + name;
		default:
			var s = stmt.a;
			return 'SError ' + s;
	}
};
var $author$project$IMP$Uneval$storeKeys = function (s) {
	return A2(
		$elm$core$String$join,
		',',
		A2($elm$core$List$map, $elm$core$Tuple$first, s));
};
var $elm$core$Debug$log = _Debug_log;
var $author$project$IMP$Uneval$traceOn = false;
var $author$project$IMP$Uneval$traceLog = F2(
	function (msg, val) {
		return $author$project$IMP$Uneval$traceOn ? A2($elm$core$Debug$log, msg, val) : val;
	});
var $elm$core$String$dropRight = F2(
	function (n, string) {
		return (n < 1) ? string : A3($elm$core$String$slice, 0, -n, string);
	});
var $author$project$IMP$Uneval$exprOk = function (e) {
	if (e.$ === 'EError') {
		return false;
	} else {
		return true;
	}
};
var $author$project$IMP$Uneval$insertHB = F2(
	function (_v0, hb) {
		var h = _v0.a;
		var s = _v0.b;
		var v = _v0.c;
		var _v1 = A3($author$project$IMP$Uneval$getElem, h, s, hb);
		if (_v1.a.$ === 'VError') {
			return A2(
				$elm$core$List$cons,
				_Utils_Tuple3(h, s, v),
				hb);
		} else {
			var hb_ = _v1.b;
			return A2(
				$elm$core$List$cons,
				_Utils_Tuple3(h, s, v),
				hb_);
		}
	});
var $elm$core$String$right = F2(
	function (n, string) {
		return (n < 1) ? '' : A3(
			$elm$core$String$slice,
			-n,
			$elm$core$String$length(string),
			string);
	});
var $author$project$IMP$Uneval$writeIndexValue = F3(
	function (path, xv, val) {
		_v0$3:
		while (true) {
			if (path.$ === 'VList') {
				if (!path.a.b) {
					return val;
				} else {
					if (path.a.a.$ === 'VInt') {
						if (!path.a.b.b) {
							var _v1 = path.a;
							var i = _v1.a.a;
							switch (xv.$) {
								case 'VList':
									var vs = xv.a;
									return ((i >= 0) && (_Utils_cmp(
										i,
										$elm$core$List$length(vs)) < 0)) ? A3($author$project$IMP$Utils$updateValue, path, xv, val) : $author$project$IMP$Syntax$VError('index out of range');
								case 'VString':
									var s = xv.a;
									if ((i >= 0) && (_Utils_cmp(
										i,
										$elm$core$String$length(s)) < 0)) {
										switch (val.$) {
											case 'VString':
												var s_ = val.a;
												return ($elm$core$String$length(s_) === 1) ? $author$project$IMP$Syntax$VString(
													_Utils_ap(
														A2($elm$core$String$left, i, s),
														_Utils_ap(
															s_,
															A2($elm$core$String$dropLeft, i + 1, s)))) : $author$project$IMP$Syntax$VError('index out of range or string length not 1');
											case 'VHole':
												return val;
											default:
												return $author$project$IMP$Syntax$VError('unsupported expression');
										}
									} else {
										return $author$project$IMP$Syntax$VError('index out of range');
									}
								case 'VHole':
									return xv;
								default:
									return $author$project$IMP$Syntax$VError('unsupported expression');
							}
						} else {
							var _v4 = path.a;
							var i = _v4.a.a;
							var rest = _v4.b;
							switch (xv.$) {
								case 'VList':
									var vs = xv.a;
									if ((i >= 0) && (_Utils_cmp(
										i,
										$elm$core$List$length(vs)) < 0)) {
										var inner_ = A3(
											$author$project$IMP$Uneval$writeIndexValue,
											$author$project$IMP$Syntax$VList(rest),
											A2($author$project$IMP$Utils$nthValue, vs, i),
											val);
										if (inner_.$ === 'VError') {
											var s = inner_.a;
											return $author$project$IMP$Syntax$VError(s);
										} else {
											return A3(
												$author$project$IMP$Utils$updateValue,
												$author$project$IMP$Syntax$VList(
													_List_fromArray(
														[
															$author$project$IMP$Syntax$VInt(i)
														])),
												xv,
												inner_);
										}
									} else {
										return $author$project$IMP$Syntax$VError('index out of range');
									}
								case 'VHole':
									return xv;
								default:
									return $author$project$IMP$Syntax$VError('unsupported expression');
							}
						}
					} else {
						break _v0$3;
					}
				}
			} else {
				break _v0$3;
			}
		}
		return $author$project$IMP$Syntax$VError('unsupported expression');
	});
var $author$project$IMP$Uneval$arith = F9(
	function (ws, e1, e2, holeBindings, store, readOnly, val, hcount, op) {
		var v1 = A3($author$project$IMP$Eval$eval, store, holeBindings, e1);
		var v2 = A3($author$project$IMP$Eval$eval, store, holeBindings, e2);
		var v = A3(
			$author$project$IMP$Eval$eval,
			store,
			holeBindings,
			A4($author$project$IMP$Syntax$Eop, ws, op, e1, e2));
		if (_Utils_eq(v, val)) {
			return _Utils_Tuple3(
				store,
				holeBindings,
				_Utils_Tuple2(
					A4($author$project$IMP$Syntax$Eop, ws, op, e1, e2),
					hcount));
		} else {
			var _v326 = $author$project$IMP$Uneval$tryupdearith(ws)(store)(holeBindings)(readOnly)(e1)(e2)(v1)(v2)(v)(val)(hcount)(op);
			var estore = _v326.a;
			var eholeBindings = _v326.b;
			var _v327 = _v326.c;
			var eexpr = _v327.a;
			var ehcount = _v327.b;
			if (eexpr.$ === 'EError') {
				var _v329 = $author$project$IMP$Uneval$tryupde1arith(ws)(store)(holeBindings)(readOnly)(e1)(e2)(v1)(v2)(v)(val)(hcount)(op);
				var e1store = _v329.a;
				var e1holeBindings = _v329.b;
				var _v330 = _v329.c;
				var e1expr = _v330.a;
				var e1hcount = _v330.b;
				if (e1expr.$ === 'EError') {
					var _v332 = $author$project$IMP$Uneval$tryupde2arith(ws)(store)(holeBindings)(readOnly)(e1)(e2)(v1)(v2)(v)(val)(hcount)(op);
					var e2store = _v332.a;
					var e2holeBindings = _v332.b;
					var _v333 = _v332.c;
					var e2expr = _v333.a;
					var e2hcount = _v333.b;
					if (e2expr.$ === 'EError') {
						return _Utils_Tuple3(
							_List_Nil,
							_List_Nil,
							_Utils_Tuple2(
								$author$project$IMP$Syntax$EError('error: uneval: both branches error'),
								0));
					} else {
						return _Utils_Tuple3(
							e2store,
							e2holeBindings,
							_Utils_Tuple2(e2expr, e2hcount));
					}
				} else {
					return _Utils_Tuple3(
						e1store,
						e1holeBindings,
						_Utils_Tuple2(e1expr, e1hcount));
				}
			} else {
				return _Utils_Tuple3(
					estore,
					eholeBindings,
					_Utils_Tuple2(eexpr, ehcount));
			}
		}
	});
var $author$project$IMP$Uneval$checkChange = function (ws) {
	return function (store) {
		return function (holeBindings) {
			return function (readOnly) {
				return function (e1) {
					return function (e2) {
						return function (v1) {
							return function (v2) {
								return function (newv1) {
									return function (newv2) {
										return function (hcount) {
											return function (op) {
												if (_Utils_eq(newv1, v1) && _Utils_eq(newv2, v2)) {
													return _Utils_Tuple3(
														store,
														holeBindings,
														_Utils_Tuple2(
															A4($author$project$IMP$Syntax$Eop, ws, op, e1, e2),
															hcount));
												} else {
													var rightChanged = !_Utils_eq(newv2, v2);
													var leftChanged = !_Utils_eq(newv1, v1);
													var fail = _Utils_Tuple3(
														_List_Nil,
														_List_Nil,
														_Utils_Tuple2(
															$author$project$IMP$Syntax$EError('error: uneval: operand update failed'),
															0));
													var _v322 = leftChanged ? A6($author$project$IMP$Uneval$uneval, store, holeBindings, e1, readOnly, newv1, hcount) : _Utils_Tuple3(
														store,
														holeBindings,
														_Utils_Tuple2(e1, hcount));
													var store1 = _v322.a;
													var holeBindings1 = _v322.b;
													var _v323 = _v322.c;
													var expr1 = _v323.a;
													var hcount1 = _v323.b;
													var ok1 = $author$project$IMP$Uneval$exprOk(expr1);
													var _v324 = rightChanged ? A6($author$project$IMP$Uneval$uneval, store, holeBindings, e2, readOnly, newv2, hcount1) : _Utils_Tuple3(
														store,
														holeBindings,
														_Utils_Tuple2(e2, hcount1));
													var store2 = _v324.a;
													var holeBindings2 = _v324.b;
													var _v325 = _v324.c;
													var expr2 = _v325.a;
													var hcount2 = _v325.b;
													var ok2 = $author$project$IMP$Uneval$exprOk(expr2);
													var rightOnly = _Utils_Tuple3(
														store2,
														holeBindings2,
														_Utils_Tuple2(
															A4($author$project$IMP$Syntax$Eop, ws, op, e1, expr2),
															hcount2));
													var both = _Utils_Tuple3(
														A3($author$project$IMP$Uneval$mergeStore, store1, store2, store),
														A3($author$project$IMP$Uneval$mergeHoleBindings, holeBindings1, holeBindings2, holeBindings),
														_Utils_Tuple2(
															A4($author$project$IMP$Syntax$Eop, ws, op, expr1, expr2),
															hcount2));
													var leftOnly = _Utils_Tuple3(
														store1,
														holeBindings1,
														_Utils_Tuple2(
															A4($author$project$IMP$Syntax$Eop, ws, op, expr1, e2),
															hcount1));
													return (leftChanged && rightChanged) ? ((ok1 && ok2) ? both : (ok1 ? leftOnly : rightOnly)) : (leftChanged ? (ok1 ? leftOnly : fail) : (ok2 ? rightOnly : fail));
												}
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var $author$project$IMP$Uneval$comp = F9(
	function (ws, e1, e2, holeBindings, store, readOnly, val, hcount, op) {
		var v1 = A3($author$project$IMP$Eval$eval, store, holeBindings, e1);
		var v2 = A3($author$project$IMP$Eval$eval, store, holeBindings, e2);
		var v = A3(
			$author$project$IMP$Eval$eval,
			store,
			holeBindings,
			A4($author$project$IMP$Syntax$Eop, ws, op, e1, e2));
		if (_Utils_eq(v, val)) {
			return _Utils_Tuple3(
				store,
				holeBindings,
				_Utils_Tuple2(
					A4($author$project$IMP$Syntax$Eop, ws, op, e1, e2),
					hcount));
		} else {
			var _v313 = $author$project$IMP$Uneval$tryupdecomp(ws)(store)(holeBindings)(readOnly)(e1)(e2)(v1)(v2)(v)(val)(hcount)(op);
			var estore = _v313.a;
			var eholeBindings = _v313.b;
			var _v314 = _v313.c;
			var eexpr = _v314.a;
			var ehcount = _v314.b;
			if (eexpr.$ === 'EError') {
				var _v316 = $author$project$IMP$Uneval$tryupde1comp(ws)(store)(holeBindings)(readOnly)(e1)(e2)(v1)(v2)(v)(val)(hcount)(op);
				var e1store = _v316.a;
				var e1holeBindings = _v316.b;
				var _v317 = _v316.c;
				var e1expr = _v317.a;
				var e1hcount = _v317.b;
				if (e1expr.$ === 'EError') {
					var _v319 = $author$project$IMP$Uneval$tryupde2comp(ws)(store)(holeBindings)(readOnly)(e1)(e2)(v1)(v2)(v)(val)(hcount)(op);
					var e2store = _v319.a;
					var e2holeBindings = _v319.b;
					var _v320 = _v319.c;
					var e2expr = _v320.a;
					var e2hcount = _v320.b;
					if (e2expr.$ === 'EError') {
						return _Utils_Tuple3(
							_List_Nil,
							_List_Nil,
							_Utils_Tuple2(
								$author$project$IMP$Syntax$EError('error: uneval: both branches error'),
								0));
					} else {
						return _Utils_Tuple3(
							e2store,
							e2holeBindings,
							_Utils_Tuple2(e2expr, e2hcount));
					}
				} else {
					return _Utils_Tuple3(
						e1store,
						e1holeBindings,
						_Utils_Tuple2(e1expr, e1hcount));
				}
			} else {
				return _Utils_Tuple3(
					estore,
					eholeBindings,
					_Utils_Tuple2(eexpr, ehcount));
			}
		}
	});
var $author$project$IMP$Uneval$logic = F9(
	function (ws, e1, e2, holeBindings, store, readOnly, val, hcount, op) {
		var v1 = A3($author$project$IMP$Eval$eval, store, holeBindings, e1);
		var v2 = A3($author$project$IMP$Eval$eval, store, holeBindings, e2);
		var v = A3(
			$author$project$IMP$Eval$eval,
			store,
			holeBindings,
			A4($author$project$IMP$Syntax$Eop, ws, op, e1, e2));
		if (_Utils_eq(v, val)) {
			return _Utils_Tuple3(
				store,
				holeBindings,
				_Utils_Tuple2(
					A4($author$project$IMP$Syntax$Eop, ws, op, e1, e2),
					hcount));
		} else {
			var _v304 = $author$project$IMP$Uneval$tryupdelogic(ws)(store)(holeBindings)(readOnly)(e1)(e2)(v1)(v2)(v)(val)(hcount)(op);
			var estore = _v304.a;
			var eholeBindings = _v304.b;
			var _v305 = _v304.c;
			var eexpr = _v305.a;
			var ehcount = _v305.b;
			if (eexpr.$ === 'EError') {
				var _v307 = $author$project$IMP$Uneval$tryupde1logic(ws)(store)(holeBindings)(readOnly)(e1)(e2)(v1)(v2)(v)(val)(hcount)(op);
				var e1store = _v307.a;
				var e1holeBindings = _v307.b;
				var _v308 = _v307.c;
				var e1expr = _v308.a;
				var e1hcount = _v308.b;
				if (e1expr.$ === 'EError') {
					var _v310 = $author$project$IMP$Uneval$tryupde2logic(ws)(store)(holeBindings)(readOnly)(e1)(e2)(v1)(v2)(v)(val)(hcount)(op);
					var e2store = _v310.a;
					var e2holeBindings = _v310.b;
					var _v311 = _v310.c;
					var e2expr = _v311.a;
					var e2hcount = _v311.b;
					if (e2expr.$ === 'EError') {
						return _Utils_Tuple3(
							_List_Nil,
							_List_Nil,
							_Utils_Tuple2(
								$author$project$IMP$Syntax$EError('error: uneval: both branches error'),
								0));
					} else {
						return _Utils_Tuple3(
							e2store,
							e2holeBindings,
							_Utils_Tuple2(e2expr, e2hcount));
					}
				} else {
					return _Utils_Tuple3(
						e1store,
						e1holeBindings,
						_Utils_Tuple2(e1expr, e1hcount));
				}
			} else {
				return _Utils_Tuple3(
					estore,
					eholeBindings,
					_Utils_Tuple2(eexpr, ehcount));
			}
		}
	});
var $author$project$IMP$Uneval$tryupde1arith = function (ws) {
	return function (store) {
		return function (holeBindings) {
			return function (readOnly) {
				return function (e1) {
					return function (e2) {
						return function (v1) {
							return function (v2) {
								return function (v) {
									return function (val) {
										return function (hcount) {
											return function (op) {
												switch (val.$) {
													case 'VHole':
														if (v1.$ === 'VHole') {
															return _Utils_Tuple3(
																store,
																holeBindings,
																_Utils_Tuple2(
																	A4($author$project$IMP$Syntax$Eop, ws, op, e1, e2),
																	hcount));
														} else {
															if (v2.$ === 'VHole') {
																return _Utils_Tuple3(
																	store,
																	holeBindings,
																	_Utils_Tuple2(
																		A4($author$project$IMP$Syntax$Eop, ws, op, e1, e2),
																		hcount));
															} else {
																var _v290 = A6($author$project$IMP$Uneval$uneval, store, holeBindings, e1, readOnly, val, hcount);
																var store_ = _v290.a;
																var holeBindings_ = _v290.b;
																var _v291 = _v290.c;
																var expr_ = _v291.a;
																var hcount_ = _v291.b;
																return _Utils_Tuple3(
																	store_,
																	holeBindings_,
																	_Utils_Tuple2(
																		A4($author$project$IMP$Syntax$Eop, ws, op, expr_, e2),
																		hcount_));
															}
														}
													case 'VInt':
														var n = val.a;
														var _v292 = function () {
															var _v293 = _Utils_Tuple2(v1, v2);
															if (_v293.b.$ === 'VInt') {
																var n2 = _v293.b.a;
																switch (op) {
																	case '+':
																		return _Utils_Tuple2(
																			$author$project$IMP$Syntax$VInt(n - n2),
																			$author$project$IMP$Syntax$VInt(n2));
																	case '-':
																		return _Utils_Tuple2(
																			$author$project$IMP$Syntax$VInt(n + n2),
																			$author$project$IMP$Syntax$VInt(n2));
																	case '*':
																		return _Utils_Tuple2(
																			$author$project$IMP$Syntax$VInt((n / n2) | 0),
																			$author$project$IMP$Syntax$VInt(n2));
																	case '/':
																		return _Utils_Tuple2(
																			$author$project$IMP$Syntax$VInt(n * n2),
																			$author$project$IMP$Syntax$VInt(n2));
																	default:
																		return _Utils_Tuple2(
																			$author$project$IMP$Syntax$VError('unsupported operation'),
																			$author$project$IMP$Syntax$VError('unsupported operation'));
																}
															} else {
																return _Utils_Tuple2(
																	$author$project$IMP$Syntax$VError('unsupported operation'),
																	$author$project$IMP$Syntax$VError('unsupported operation'));
															}
														}();
														var newv1 = _v292.a;
														var newv2 = _v292.b;
														var _v295 = _Utils_Tuple2(newv1, newv2);
														if ((_v295.a.$ === 'VError') && (_v295.b.$ === 'VError')) {
															return _Utils_Tuple3(
																_List_Nil,
																_List_Nil,
																_Utils_Tuple2(
																	$author$project$IMP$Syntax$EError('arith: ' + op),
																	0));
														} else {
															return $author$project$IMP$Uneval$checkChange(ws)(store)(holeBindings)(readOnly)(e1)(e2)(v1)(v2)(newv1)(newv2)(hcount)(op);
														}
													case 'VString':
														var s = val.a;
														if (op === '++') {
															var _v297 = function () {
																var _v298 = _Utils_Tuple2(v1, v2);
																if (_v298.b.$ === 'VString') {
																	var s2 = _v298.b.a;
																	if (_Utils_cmp(
																		$elm$core$String$length(s2),
																		$elm$core$String$length(s)) > 0) {
																		return _Utils_Tuple2(
																			$author$project$IMP$Syntax$VError('unsupported operation'),
																			$author$project$IMP$Syntax$VError('unsupported operation'));
																	} else {
																		var newv = A2(
																			$elm$core$String$right,
																			$elm$core$String$length(s2),
																			s);
																		return _Utils_eq(newv, s2) ? _Utils_Tuple2(
																			$author$project$IMP$Syntax$VString(
																				A2(
																					$elm$core$String$dropRight,
																					$elm$core$String$length(s2),
																					s)),
																			v2) : _Utils_Tuple2(
																			$author$project$IMP$Syntax$VError('unsupported operation'),
																			$author$project$IMP$Syntax$VError('unsupported operation'));
																	}
																} else {
																	return _Utils_Tuple2(
																		$author$project$IMP$Syntax$VError('unsupported operation'),
																		$author$project$IMP$Syntax$VError('unsupported operation'));
																}
															}();
															var newv1 = _v297.a;
															var newv2 = _v297.b;
															var _v299 = _Utils_Tuple2(newv1, newv2);
															if ((_v299.a.$ === 'VError') && (_v299.b.$ === 'VError')) {
																var info = _v299.a.a;
																return _Utils_Tuple3(
																	_List_Nil,
																	_List_Nil,
																	_Utils_Tuple2(
																		$author$project$IMP$Syntax$EError('arith: ' + info),
																		0));
															} else {
																return $author$project$IMP$Uneval$checkChange(ws)(store)(holeBindings)(readOnly)(e1)(e2)(v1)(v2)(newv1)(newv2)(hcount)(op);
															}
														} else {
															return _Utils_Tuple3(
																_List_Nil,
																_List_Nil,
																_Utils_Tuple2(
																	$author$project$IMP$Syntax$EError('arith: unsupported operation for string'),
																	0));
														}
													case 'VList':
														var vs = val.a;
														if (op === '++') {
															var _v301 = function () {
																var _v302 = _Utils_Tuple2(v1, v2);
																if (_v302.b.$ === 'VList') {
																	var vs2 = _v302.b.a;
																	if (_Utils_cmp(
																		$elm$core$List$length(vs2),
																		$elm$core$List$length(vs)) > 0) {
																		return _Utils_Tuple2(
																			$author$project$IMP$Syntax$VError('unsupported operation'),
																			$author$project$IMP$Syntax$VError('unsupported operation'));
																	} else {
																		var newv = A2(
																			$elm$core$List$take,
																			$elm$core$List$length(vs2),
																			vs);
																		return _Utils_eq(newv, vs2) ? _Utils_Tuple2(
																			$author$project$IMP$Syntax$VList(
																				A2(
																					$elm$core$List$drop,
																					$elm$core$List$length(vs2),
																					vs)),
																			v2) : _Utils_Tuple2(
																			$author$project$IMP$Syntax$VError('unsupported operation'),
																			$author$project$IMP$Syntax$VError('unsupported operation'));
																	}
																} else {
																	return _Utils_Tuple2(
																		$author$project$IMP$Syntax$VError('unsupported operation'),
																		$author$project$IMP$Syntax$VError('unsupported operation'));
																}
															}();
															var newv1 = _v301.a;
															var newv2 = _v301.b;
															var _v303 = _Utils_Tuple2(newv1, newv2);
															if ((_v303.a.$ === 'VError') && (_v303.b.$ === 'VError')) {
																var info = _v303.a.a;
																return _Utils_Tuple3(
																	_List_Nil,
																	_List_Nil,
																	_Utils_Tuple2(
																		$author$project$IMP$Syntax$EError('arith: ' + info),
																		0));
															} else {
																return $author$project$IMP$Uneval$checkChange(ws)(store)(holeBindings)(readOnly)(e1)(e2)(v1)(v2)(newv1)(newv2)(hcount)(op);
															}
														} else {
															return _Utils_Tuple3(
																_List_Nil,
																_List_Nil,
																_Utils_Tuple2(
																	$author$project$IMP$Syntax$EError('arith: unsupported operation for string'),
																	0));
														}
													default:
														return _Utils_Tuple3(
															_List_Nil,
															_List_Nil,
															_Utils_Tuple2(
																$author$project$IMP$Syntax$EError('arith: unsupported operation'),
																0));
												}
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var $author$project$IMP$Uneval$tryupde1comp = function (ws) {
	return function (store) {
		return function (holeBindings) {
			return function (readOnly) {
				return function (e1) {
					return function (e2) {
						return function (v1) {
							return function (v2) {
								return function (v) {
									return function (val) {
										return function (hcount) {
											return function (op) {
												switch (val.$) {
													case 'VHole':
														if (v1.$ === 'VHole') {
															return _Utils_Tuple3(
																store,
																holeBindings,
																_Utils_Tuple2(
																	A4($author$project$IMP$Syntax$Eop, ws, op, e1, e2),
																	hcount));
														} else {
															if (v2.$ === 'VHole') {
																return _Utils_Tuple3(
																	store,
																	holeBindings,
																	_Utils_Tuple2(
																		A4($author$project$IMP$Syntax$Eop, ws, op, e1, e2),
																		hcount));
															} else {
																var _v271 = A6($author$project$IMP$Uneval$uneval, store, holeBindings, e1, readOnly, val, hcount);
																var store_ = _v271.a;
																var holeBindings_ = _v271.b;
																var _v272 = _v271.c;
																var expr_ = _v272.a;
																var hcount_ = _v272.b;
																return _Utils_Tuple3(
																	store_,
																	holeBindings_,
																	_Utils_Tuple2(
																		A4($author$project$IMP$Syntax$Eop, ws, op, expr_, e2),
																		hcount_));
															}
														}
													case 'VBool':
														if (val.a) {
															switch (op) {
																case '==':
																	var _v274 = function () {
																		var _v275 = _Utils_Tuple2(v1, v2);
																		if (_v275.b.$ === 'VHole') {
																			var _v276 = _v275.b;
																			return _Utils_Tuple2(
																				$author$project$IMP$Syntax$VError('unsupported operation'),
																				$author$project$IMP$Syntax$VError('unsupported operation'));
																		} else {
																			return _Utils_Tuple2(v2, v2);
																		}
																	}();
																	var newv1 = _v274.a;
																	var newv2 = _v274.b;
																	var _v277 = _Utils_Tuple2(newv1, newv2);
																	if ((_v277.a.$ === 'VError') && (_v277.b.$ === 'VError')) {
																		return _Utils_Tuple3(
																			_List_Nil,
																			_List_Nil,
																			_Utils_Tuple2(
																				$author$project$IMP$Syntax$EError('unsupported operation'),
																				0));
																	} else {
																		return $author$project$IMP$Uneval$checkChange(ws)(store)(holeBindings)(readOnly)(e1)(e2)(v1)(v2)(newv1)(newv2)(hcount)(op);
																	}
																case '!=':
																	return (!_Utils_eq(v1, v2)) ? _Utils_Tuple3(
																		store,
																		holeBindings,
																		_Utils_Tuple2(
																			A4($author$project$IMP$Syntax$Eop, ws, op, e1, e2),
																			hcount)) : _Utils_Tuple3(
																		_List_Nil,
																		_List_Nil,
																		_Utils_Tuple2(
																			$author$project$IMP$Syntax$EError('Cannot infer in neq'),
																			0));
																default:
																	if (v.$ === 'VBool') {
																		if (v.a) {
																			return _Utils_Tuple3(
																				store,
																				holeBindings,
																				_Utils_Tuple2(
																					A4($author$project$IMP$Syntax$Eop, ws, op, e1, e2),
																					hcount));
																		} else {
																			switch (op) {
																				case '>':
																					return _Utils_Tuple3(
																						store,
																						holeBindings,
																						_Utils_Tuple2(
																							A4($author$project$IMP$Syntax$Eop, ws, '<=', e1, e2),
																							hcount));
																				case '<':
																					return _Utils_Tuple3(
																						store,
																						holeBindings,
																						_Utils_Tuple2(
																							A4($author$project$IMP$Syntax$Eop, ws, '>=', e1, e2),
																							hcount));
																				case '>=':
																					return _Utils_Tuple3(
																						store,
																						holeBindings,
																						_Utils_Tuple2(
																							A4($author$project$IMP$Syntax$Eop, ws, '<', e1, e2),
																							hcount));
																				case '<=':
																					return _Utils_Tuple3(
																						store,
																						holeBindings,
																						_Utils_Tuple2(
																							A4($author$project$IMP$Syntax$Eop, ws, '>', e1, e2),
																							hcount));
																				default:
																					return _Utils_Tuple3(
																						_List_Nil,
																						_List_Nil,
																						_Utils_Tuple2(
																							$author$project$IMP$Syntax$EError('Cannot infer in comp'),
																							0));
																			}
																		}
																	} else {
																		return _Utils_Tuple3(
																			_List_Nil,
																			_List_Nil,
																			_Utils_Tuple2(
																				$author$project$IMP$Syntax$EError('Cannot infer in comp'),
																				0));
																	}
															}
														} else {
															switch (op) {
																case '==':
																	return (!_Utils_eq(v1, v2)) ? _Utils_Tuple3(
																		store,
																		holeBindings,
																		_Utils_Tuple2(
																			A4($author$project$IMP$Syntax$Eop, ws, op, e1, e2),
																			hcount)) : _Utils_Tuple3(
																		_List_Nil,
																		_List_Nil,
																		_Utils_Tuple2(
																			$author$project$IMP$Syntax$EError('Cannot infer in eq'),
																			0));
																case '!=':
																	var _v281 = function () {
																		var _v282 = _Utils_Tuple2(v1, v2);
																		if (_v282.b.$ === 'VHole') {
																			var _v283 = _v282.b;
																			return _Utils_Tuple2(
																				$author$project$IMP$Syntax$VError('unsupported operation'),
																				$author$project$IMP$Syntax$VError('unsupported operation'));
																		} else {
																			return _Utils_Tuple2(v2, v2);
																		}
																	}();
																	var newv1 = _v281.a;
																	var newv2 = _v281.b;
																	var _v284 = _Utils_Tuple2(newv1, newv2);
																	if ((_v284.a.$ === 'VError') && (_v284.b.$ === 'VError')) {
																		return _Utils_Tuple3(
																			_List_Nil,
																			_List_Nil,
																			_Utils_Tuple2(
																				$author$project$IMP$Syntax$EError('unsupported operation'),
																				0));
																	} else {
																		return $author$project$IMP$Uneval$checkChange(ws)(store)(holeBindings)(readOnly)(e1)(e2)(v1)(v2)(newv1)(newv2)(hcount)(op);
																	}
																default:
																	if (v.$ === 'VBool') {
																		if (!v.a) {
																			return _Utils_Tuple3(
																				store,
																				holeBindings,
																				_Utils_Tuple2(
																					A4($author$project$IMP$Syntax$Eop, ws, op, e1, e2),
																					hcount));
																		} else {
																			switch (op) {
																				case '>':
																					return _Utils_Tuple3(
																						store,
																						holeBindings,
																						_Utils_Tuple2(
																							A4($author$project$IMP$Syntax$Eop, ws, '<=', e1, e2),
																							hcount));
																				case '<':
																					return _Utils_Tuple3(
																						store,
																						holeBindings,
																						_Utils_Tuple2(
																							A4($author$project$IMP$Syntax$Eop, ws, '>=', e1, e2),
																							hcount));
																				case '>=':
																					return _Utils_Tuple3(
																						store,
																						holeBindings,
																						_Utils_Tuple2(
																							A4($author$project$IMP$Syntax$Eop, ws, '<', e1, e2),
																							hcount));
																				case '<=':
																					return _Utils_Tuple3(
																						store,
																						holeBindings,
																						_Utils_Tuple2(
																							A4($author$project$IMP$Syntax$Eop, ws, '>', e1, e2),
																							hcount));
																				default:
																					return _Utils_Tuple3(
																						_List_Nil,
																						_List_Nil,
																						_Utils_Tuple2(
																							$author$project$IMP$Syntax$EError('Cannot infer in comp'),
																							0));
																			}
																		}
																	} else {
																		return _Utils_Tuple3(
																			_List_Nil,
																			_List_Nil,
																			_Utils_Tuple2(
																				$author$project$IMP$Syntax$EError('Cannot infer in comp'),
																				0));
																	}
															}
														}
													default:
														return _Utils_Tuple3(
															_List_Nil,
															_List_Nil,
															_Utils_Tuple2(
																$author$project$IMP$Syntax$EError('Unsupported value type for comp'),
																0));
												}
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var $author$project$IMP$Uneval$tryupde1logic = function (ws) {
	return function (store) {
		return function (holeBindings) {
			return function (readOnly) {
				return function (e1) {
					return function (e2) {
						return function (v1) {
							return function (v2) {
								return function (v) {
									return function (val) {
										return function (hcount) {
											return function (op) {
												var _v234 = function () {
													switch (v.$) {
														case 'VHole':
															var _v236 = _Utils_Tuple2(
																_Utils_Tuple3(v1, v2, val),
																op);
															_v236$9:
															while (true) {
																switch (_v236.a.c.$) {
																	case 'VBool':
																		if (!_v236.a.c.a) {
																			switch (_v236.a.a.$) {
																				case 'VBool':
																					if ((_v236.a.a.a && (_v236.a.b.$ === 'VHole')) && (_v236.b === '&&')) {
																						var _v241 = _v236.a;
																						var _v242 = _v241.b;
																						return _Utils_Tuple2(
																							$author$project$IMP$Syntax$VBool(false),
																							v2);
																					} else {
																						break _v236$9;
																					}
																				case 'VHole':
																					switch (_v236.a.b.$) {
																						case 'VHole':
																							if (_v236.b === '&&') {
																								var _v243 = _v236.a;
																								var _v244 = _v243.a;
																								var _v245 = _v243.b;
																								return _Utils_Tuple2(
																									$author$project$IMP$Syntax$VBool(false),
																									v2);
																							} else {
																								break _v236$9;
																							}
																						case 'VBool':
																							if (_v236.a.b.a) {
																								if (_v236.b === '&&') {
																									var _v239 = _v236.a;
																									var _v240 = _v239.a;
																									return _Utils_Tuple2(
																										$author$project$IMP$Syntax$VBool(false),
																										$author$project$IMP$Syntax$VBool(true));
																								} else {
																									break _v236$9;
																								}
																							} else {
																								if (_v236.b === '||') {
																									var _v246 = _v236.a;
																									var _v247 = _v246.a;
																									return _Utils_Tuple2(
																										$author$project$IMP$Syntax$VBool(false),
																										$author$project$IMP$Syntax$VBool(false));
																								} else {
																									break _v236$9;
																								}
																							}
																						default:
																							break _v236$9;
																					}
																				default:
																					break _v236$9;
																			}
																		} else {
																			switch (_v236.a.a.$) {
																				case 'VBool':
																					if (((!_v236.a.a.a) && (_v236.a.b.$ === 'VHole')) && (_v236.b === '||')) {
																						var _v250 = _v236.a;
																						var _v251 = _v250.b;
																						return _Utils_Tuple2(
																							$author$project$IMP$Syntax$VBool(true),
																							v2);
																					} else {
																						break _v236$9;
																					}
																				case 'VHole':
																					switch (_v236.a.b.$) {
																						case 'VBool':
																							if (_v236.a.b.a) {
																								if (_v236.b === '&&') {
																									var _v237 = _v236.a;
																									var _v238 = _v237.a;
																									return _Utils_Tuple2(
																										$author$project$IMP$Syntax$VBool(true),
																										$author$project$IMP$Syntax$VBool(true));
																								} else {
																									break _v236$9;
																								}
																							} else {
																								if (_v236.b === '||') {
																									var _v248 = _v236.a;
																									var _v249 = _v248.a;
																									return _Utils_Tuple2(
																										$author$project$IMP$Syntax$VBool(true),
																										$author$project$IMP$Syntax$VBool(false));
																								} else {
																									break _v236$9;
																								}
																							}
																						case 'VHole':
																							if (_v236.b === '||') {
																								var _v252 = _v236.a;
																								var _v253 = _v252.a;
																								var _v254 = _v252.b;
																								return _Utils_Tuple2(
																									$author$project$IMP$Syntax$VBool(true),
																									v2);
																							} else {
																								break _v236$9;
																							}
																						default:
																							break _v236$9;
																					}
																				default:
																					break _v236$9;
																			}
																		}
																	case 'VHole':
																		if (_v236.b === '&&') {
																			var _v255 = _v236.a;
																			var _v256 = _v255.c;
																			return _Utils_Tuple2(v1, v2);
																		} else {
																			break _v236$9;
																		}
																	default:
																		break _v236$9;
																}
															}
															return _Utils_Tuple2(
																$author$project$IMP$Syntax$VError('unsupported operation'),
																$author$project$IMP$Syntax$VError('unsupported operation'));
														case 'VBool':
															if (v.a) {
																switch (val.$) {
																	case 'VBool':
																		if (val.a) {
																			return _Utils_Tuple2(v1, v2);
																		} else {
																			switch (op) {
																				case '&&':
																					var _v259 = _Utils_Tuple2(v1, v2);
																					if ((((_v259.a.$ === 'VBool') && _v259.a.a) && (_v259.b.$ === 'VBool')) && _v259.b.a) {
																						return _Utils_Tuple2(
																							$author$project$IMP$Syntax$VBool(false),
																							$author$project$IMP$Syntax$VBool(true));
																					} else {
																						return _Utils_Tuple2(
																							$author$project$IMP$Syntax$VError('unsupported operation'),
																							$author$project$IMP$Syntax$VError('unsupported operation'));
																					}
																				case '||':
																					var _v260 = _Utils_Tuple2(v1, v2);
																					_v260$2:
																					while (true) {
																						if (_v260.b.$ === 'VBool') {
																							if (!_v260.b.a) {
																								if ((_v260.a.$ === 'VBool') && _v260.a.a) {
																									return _Utils_Tuple2(
																										$author$project$IMP$Syntax$VBool(false),
																										$author$project$IMP$Syntax$VBool(false));
																								} else {
																									break _v260$2;
																								}
																							} else {
																								if (_v260.a.$ === 'VHole') {
																									var _v261 = _v260.a;
																									return _Utils_Tuple2(
																										$author$project$IMP$Syntax$VBool(false),
																										$author$project$IMP$Syntax$VBool(false));
																								} else {
																									break _v260$2;
																								}
																							}
																						} else {
																							break _v260$2;
																						}
																					}
																					return _Utils_Tuple2(
																						$author$project$IMP$Syntax$VError('unsupported operation'),
																						$author$project$IMP$Syntax$VError('unsupported operation'));
																				default:
																					return _Utils_Tuple2(
																						$author$project$IMP$Syntax$VError('unsupported operation'),
																						$author$project$IMP$Syntax$VError('unsupported operation'));
																			}
																		}
																	case 'VHole':
																		var h = val.a;
																		return _Utils_Tuple2(val, v2);
																	default:
																		return _Utils_Tuple2(
																			$author$project$IMP$Syntax$VError('unsupported operation'),
																			$author$project$IMP$Syntax$VError('unsupported operation'));
																}
															} else {
																switch (val.$) {
																	case 'VBool':
																		if (!val.a) {
																			return _Utils_Tuple2(v1, v2);
																		} else {
																			switch (op) {
																				case '&&':
																					var _v264 = _Utils_Tuple2(v1, v2);
																					_v264$2:
																					while (true) {
																						if ((_v264.b.$ === 'VBool') && _v264.b.a) {
																							switch (_v264.a.$) {
																								case 'VBool':
																									if (!_v264.a.a) {
																										return _Utils_Tuple2(
																											$author$project$IMP$Syntax$VBool(true),
																											$author$project$IMP$Syntax$VBool(true));
																									} else {
																										break _v264$2;
																									}
																								case 'VHole':
																									var _v265 = _v264.a;
																									return _Utils_Tuple2(
																										$author$project$IMP$Syntax$VBool(true),
																										$author$project$IMP$Syntax$VBool(true));
																								default:
																									break _v264$2;
																							}
																						} else {
																							break _v264$2;
																						}
																					}
																					return _Utils_Tuple2(
																						$author$project$IMP$Syntax$VError('unsupported operation'),
																						$author$project$IMP$Syntax$VError('unsupported operation'));
																				case '||':
																					var _v266 = _Utils_Tuple2(v1, v2);
																					if ((((_v266.a.$ === 'VBool') && (!_v266.a.a)) && (_v266.b.$ === 'VBool')) && (!_v266.b.a)) {
																						return _Utils_Tuple2(
																							$author$project$IMP$Syntax$VBool(true),
																							$author$project$IMP$Syntax$VBool(false));
																					} else {
																						return _Utils_Tuple2(
																							$author$project$IMP$Syntax$VError('unsupported operation'),
																							$author$project$IMP$Syntax$VError('unsupported operation'));
																					}
																				default:
																					return _Utils_Tuple2(
																						$author$project$IMP$Syntax$VError('unsupported operation'),
																						$author$project$IMP$Syntax$VError('unsupported operation'));
																			}
																		}
																	case 'VHole':
																		var h = val.a;
																		return _Utils_Tuple2(val, v2);
																	default:
																		return _Utils_Tuple2(
																			$author$project$IMP$Syntax$VError('unsupported operation'),
																			$author$project$IMP$Syntax$VError('unsupported operation'));
																}
															}
														default:
															return _Utils_Tuple2(
																$author$project$IMP$Syntax$VError('unsupported operation'),
																$author$project$IMP$Syntax$VError('unsupported operation'));
													}
												}();
												var newv1 = _v234.a;
												var newv2 = _v234.b;
												var _v267 = _Utils_Tuple2(newv1, newv2);
												if ((_v267.a.$ === 'VError') && (_v267.b.$ === 'VError')) {
													var s = _v267.a.a;
													return _Utils_Tuple3(
														_List_Nil,
														_List_Nil,
														_Utils_Tuple2(
															$author$project$IMP$Syntax$EError('logic: ' + s),
															0));
												} else {
													return $author$project$IMP$Uneval$checkChange(ws)(store)(holeBindings)(readOnly)(e1)(e2)(v1)(v2)(newv1)(newv2)(hcount)(op);
												}
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var $author$project$IMP$Uneval$tryupde2arith = function (ws) {
	return function (store) {
		return function (holeBindings) {
			return function (readOnly) {
				return function (e1) {
					return function (e2) {
						return function (v1) {
							return function (v2) {
								return function (v) {
									return function (val) {
										return function (hcount) {
											return function (op) {
												switch (val.$) {
													case 'VHole':
														if (v1.$ === 'VHole') {
															return _Utils_Tuple3(
																store,
																holeBindings,
																_Utils_Tuple2(
																	A4($author$project$IMP$Syntax$Eop, ws, op, e1, e2),
																	hcount));
														} else {
															if (v2.$ === 'VHole') {
																return _Utils_Tuple3(
																	store,
																	holeBindings,
																	_Utils_Tuple2(
																		A4($author$project$IMP$Syntax$Eop, ws, op, e1, e2),
																		hcount));
															} else {
																var _v220 = A6($author$project$IMP$Uneval$uneval, store, holeBindings, e2, readOnly, val, hcount);
																var store_ = _v220.a;
																var holeBindings_ = _v220.b;
																var _v221 = _v220.c;
																var expr_ = _v221.a;
																var hcount_ = _v221.b;
																return _Utils_Tuple3(
																	store_,
																	holeBindings_,
																	_Utils_Tuple2(
																		A4($author$project$IMP$Syntax$Eop, ws, op, e1, expr_),
																		hcount_));
															}
														}
													case 'VInt':
														var n = val.a;
														var _v222 = function () {
															var _v223 = _Utils_Tuple2(v1, v2);
															if (_v223.a.$ === 'VInt') {
																var n1 = _v223.a.a;
																switch (op) {
																	case '+':
																		return _Utils_Tuple2(
																			$author$project$IMP$Syntax$VInt(n1),
																			$author$project$IMP$Syntax$VInt(n - n1));
																	case '-':
																		return _Utils_Tuple2(
																			$author$project$IMP$Syntax$VInt(n1),
																			$author$project$IMP$Syntax$VInt(n1 - n));
																	case '*':
																		return _Utils_Tuple2(
																			$author$project$IMP$Syntax$VInt(n1),
																			$author$project$IMP$Syntax$VInt(n1 * n));
																	case '/':
																		return _Utils_Tuple2(
																			$author$project$IMP$Syntax$VInt(n1),
																			$author$project$IMP$Syntax$VInt((n1 / n) | 0));
																	default:
																		return _Utils_Tuple2(
																			$author$project$IMP$Syntax$VError('unsupported operation'),
																			$author$project$IMP$Syntax$VError('unsupported operation'));
																}
															} else {
																return _Utils_Tuple2(
																	$author$project$IMP$Syntax$VError('unsupported operation'),
																	$author$project$IMP$Syntax$VError('unsupported operation'));
															}
														}();
														var newv1 = _v222.a;
														var newv2 = _v222.b;
														var _v225 = _Utils_Tuple2(newv1, newv2);
														if ((_v225.a.$ === 'VError') && (_v225.b.$ === 'VError')) {
															return _Utils_Tuple3(
																_List_Nil,
																_List_Nil,
																_Utils_Tuple2(
																	$author$project$IMP$Syntax$EError('arith: ' + op),
																	0));
														} else {
															return $author$project$IMP$Uneval$checkChange(ws)(store)(holeBindings)(readOnly)(e1)(e2)(v1)(v2)(newv1)(newv2)(hcount)(op);
														}
													case 'VString':
														var s = val.a;
														if (op === '++') {
															var _v227 = function () {
																var _v228 = _Utils_Tuple2(v1, v2);
																if (_v228.a.$ === 'VString') {
																	var s1 = _v228.a.a;
																	if (_Utils_cmp(
																		$elm$core$String$length(s1),
																		$elm$core$String$length(s)) > 0) {
																		return _Utils_Tuple2(
																			$author$project$IMP$Syntax$VError('unsupported operation'),
																			$author$project$IMP$Syntax$VError('unsupported operation'));
																	} else {
																		var newv = A2(
																			$elm$core$String$left,
																			$elm$core$String$length(s1),
																			s);
																		return _Utils_eq(newv, s1) ? _Utils_Tuple2(
																			v1,
																			$author$project$IMP$Syntax$VString(
																				A2(
																					$elm$core$String$dropLeft,
																					$elm$core$String$length(s1),
																					s))) : _Utils_Tuple2(
																			$author$project$IMP$Syntax$VError('unsupported operation'),
																			$author$project$IMP$Syntax$VError('unsupported operation'));
																	}
																} else {
																	return _Utils_Tuple2(
																		$author$project$IMP$Syntax$VError('unsupported operation'),
																		$author$project$IMP$Syntax$VError('unsupported operation'));
																}
															}();
															var newv1 = _v227.a;
															var newv2 = _v227.b;
															var _v229 = _Utils_Tuple2(newv1, newv2);
															if ((_v229.a.$ === 'VError') && (_v229.b.$ === 'VError')) {
																var info = _v229.a.a;
																return _Utils_Tuple3(
																	_List_Nil,
																	_List_Nil,
																	_Utils_Tuple2(
																		$author$project$IMP$Syntax$EError('arith: ' + info),
																		0));
															} else {
																return $author$project$IMP$Uneval$checkChange(ws)(store)(holeBindings)(readOnly)(e1)(e2)(v1)(v2)(newv1)(newv2)(hcount)(op);
															}
														} else {
															return _Utils_Tuple3(
																_List_Nil,
																_List_Nil,
																_Utils_Tuple2(
																	$author$project$IMP$Syntax$EError('arith: unsupported operation for string'),
																	0));
														}
													case 'VList':
														var vs = val.a;
														if (op === '++') {
															var _v231 = function () {
																var _v232 = _Utils_Tuple2(v1, v2);
																if (_v232.a.$ === 'VList') {
																	var vs1 = _v232.a.a;
																	if (_Utils_cmp(
																		$elm$core$List$length(vs1),
																		$elm$core$List$length(vs)) > 0) {
																		return _Utils_Tuple2(
																			$author$project$IMP$Syntax$VError('unsupported operation'),
																			$author$project$IMP$Syntax$VError('unsupported operation'));
																	} else {
																		var newv = A2(
																			$elm$core$List$take,
																			$elm$core$List$length(vs1),
																			vs);
																		return _Utils_eq(newv, vs1) ? _Utils_Tuple2(
																			v1,
																			$author$project$IMP$Syntax$VList(
																				A2(
																					$elm$core$List$drop,
																					$elm$core$List$length(vs1),
																					vs))) : _Utils_Tuple2(
																			$author$project$IMP$Syntax$VError('unsupported operation'),
																			$author$project$IMP$Syntax$VError('unsupported operation'));
																	}
																} else {
																	return _Utils_Tuple2(
																		$author$project$IMP$Syntax$VError('unsupported operation'),
																		$author$project$IMP$Syntax$VError('unsupported operation'));
																}
															}();
															var newv1 = _v231.a;
															var newv2 = _v231.b;
															var _v233 = _Utils_Tuple2(newv1, newv2);
															if ((_v233.a.$ === 'VError') && (_v233.b.$ === 'VError')) {
																var info = _v233.a.a;
																return _Utils_Tuple3(
																	_List_Nil,
																	_List_Nil,
																	_Utils_Tuple2(
																		$author$project$IMP$Syntax$EError('arith: ' + info),
																		0));
															} else {
																return $author$project$IMP$Uneval$checkChange(ws)(store)(holeBindings)(readOnly)(e1)(e2)(v1)(v2)(newv1)(newv2)(hcount)(op);
															}
														} else {
															return _Utils_Tuple3(
																_List_Nil,
																_List_Nil,
																_Utils_Tuple2(
																	$author$project$IMP$Syntax$EError('arith: unsupported operation for string'),
																	0));
														}
													default:
														return _Utils_Tuple3(
															_List_Nil,
															_List_Nil,
															_Utils_Tuple2(
																$author$project$IMP$Syntax$EError('arith: unsupported operation'),
																0));
												}
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var $author$project$IMP$Uneval$tryupde2comp = function (ws) {
	return function (store) {
		return function (holeBindings) {
			return function (readOnly) {
				return function (e1) {
					return function (e2) {
						return function (v1) {
							return function (v2) {
								return function (v) {
									return function (val) {
										return function (hcount) {
											return function (op) {
												switch (val.$) {
													case 'VHole':
														if (v1.$ === 'VHole') {
															return _Utils_Tuple3(
																store,
																holeBindings,
																_Utils_Tuple2(
																	A4($author$project$IMP$Syntax$Eop, ws, op, e1, e2),
																	hcount));
														} else {
															if (v2.$ === 'VHole') {
																return _Utils_Tuple3(
																	store,
																	holeBindings,
																	_Utils_Tuple2(
																		A4($author$project$IMP$Syntax$Eop, ws, op, e1, e2),
																		hcount));
															} else {
																var _v201 = A6($author$project$IMP$Uneval$uneval, store, holeBindings, e2, readOnly, val, hcount);
																var store_ = _v201.a;
																var holeBindings_ = _v201.b;
																var _v202 = _v201.c;
																var expr_ = _v202.a;
																var hcount_ = _v202.b;
																return _Utils_Tuple3(
																	store_,
																	holeBindings_,
																	_Utils_Tuple2(
																		A4($author$project$IMP$Syntax$Eop, ws, op, e1, expr_),
																		hcount_));
															}
														}
													case 'VBool':
														if (val.a) {
															switch (op) {
																case '==':
																	var _v204 = function () {
																		var _v205 = _Utils_Tuple2(v1, v2);
																		if (_v205.a.$ === 'VHole') {
																			var _v206 = _v205.a;
																			return _Utils_Tuple2(
																				$author$project$IMP$Syntax$VError('unsupported operation'),
																				$author$project$IMP$Syntax$VError('unsupported operation'));
																		} else {
																			return _Utils_Tuple2(v1, v1);
																		}
																	}();
																	var newv1 = _v204.a;
																	var newv2 = _v204.b;
																	var _v207 = _Utils_Tuple2(newv1, newv2);
																	if ((_v207.a.$ === 'VError') && (_v207.b.$ === 'VError')) {
																		return _Utils_Tuple3(
																			_List_Nil,
																			_List_Nil,
																			_Utils_Tuple2(
																				$author$project$IMP$Syntax$EError('unsupported operation'),
																				0));
																	} else {
																		return $author$project$IMP$Uneval$checkChange(ws)(store)(holeBindings)(readOnly)(e1)(e2)(v1)(v2)(newv1)(newv2)(hcount)(op);
																	}
																case '!=':
																	return (!_Utils_eq(v1, v2)) ? _Utils_Tuple3(
																		store,
																		holeBindings,
																		_Utils_Tuple2(
																			A4($author$project$IMP$Syntax$Eop, ws, op, e1, e2),
																			hcount)) : _Utils_Tuple3(
																		_List_Nil,
																		_List_Nil,
																		_Utils_Tuple2(
																			$author$project$IMP$Syntax$EError('Cannot infer in neq'),
																			0));
																default:
																	if (v.$ === 'VBool') {
																		if (v.a) {
																			return _Utils_Tuple3(
																				store,
																				holeBindings,
																				_Utils_Tuple2(
																					A4($author$project$IMP$Syntax$Eop, ws, op, e1, e2),
																					hcount));
																		} else {
																			switch (op) {
																				case '>':
																					return _Utils_Tuple3(
																						store,
																						holeBindings,
																						_Utils_Tuple2(
																							A4($author$project$IMP$Syntax$Eop, ws, '<=', e1, e2),
																							hcount));
																				case '<':
																					return _Utils_Tuple3(
																						store,
																						holeBindings,
																						_Utils_Tuple2(
																							A4($author$project$IMP$Syntax$Eop, ws, '>=', e1, e2),
																							hcount));
																				case '>=':
																					return _Utils_Tuple3(
																						store,
																						holeBindings,
																						_Utils_Tuple2(
																							A4($author$project$IMP$Syntax$Eop, ws, '<', e1, e2),
																							hcount));
																				case '<=':
																					return _Utils_Tuple3(
																						store,
																						holeBindings,
																						_Utils_Tuple2(
																							A4($author$project$IMP$Syntax$Eop, ws, '>', e1, e2),
																							hcount));
																				default:
																					return _Utils_Tuple3(
																						_List_Nil,
																						_List_Nil,
																						_Utils_Tuple2(
																							$author$project$IMP$Syntax$EError('Cannot infer in comp'),
																							0));
																			}
																		}
																	} else {
																		return _Utils_Tuple3(
																			_List_Nil,
																			_List_Nil,
																			_Utils_Tuple2(
																				$author$project$IMP$Syntax$EError('Cannot infer in comp'),
																				0));
																	}
															}
														} else {
															switch (op) {
																case '==':
																	return (!_Utils_eq(v1, v2)) ? _Utils_Tuple3(
																		store,
																		holeBindings,
																		_Utils_Tuple2(
																			A4($author$project$IMP$Syntax$Eop, ws, op, e1, e2),
																			hcount)) : _Utils_Tuple3(
																		_List_Nil,
																		_List_Nil,
																		_Utils_Tuple2(
																			$author$project$IMP$Syntax$EError('Cannot infer in eq'),
																			0));
																case '!=':
																	var _v211 = function () {
																		var _v212 = _Utils_Tuple2(v1, v2);
																		if (_v212.b.$ === 'VHole') {
																			var _v213 = _v212.b;
																			return _Utils_Tuple2(
																				$author$project$IMP$Syntax$VError('unsupported operation'),
																				$author$project$IMP$Syntax$VError('unsupported operation'));
																		} else {
																			return _Utils_Tuple2(v1, v1);
																		}
																	}();
																	var newv1 = _v211.a;
																	var newv2 = _v211.b;
																	var _v214 = _Utils_Tuple2(newv1, newv2);
																	if ((_v214.a.$ === 'VError') && (_v214.b.$ === 'VError')) {
																		return _Utils_Tuple3(
																			_List_Nil,
																			_List_Nil,
																			_Utils_Tuple2(
																				$author$project$IMP$Syntax$EError('unsupported operation'),
																				0));
																	} else {
																		return $author$project$IMP$Uneval$checkChange(ws)(store)(holeBindings)(readOnly)(e1)(e2)(v1)(v2)(newv1)(newv2)(hcount)(op);
																	}
																default:
																	if (v.$ === 'VBool') {
																		if (!v.a) {
																			return _Utils_Tuple3(
																				store,
																				holeBindings,
																				_Utils_Tuple2(
																					A4($author$project$IMP$Syntax$Eop, ws, op, e1, e2),
																					hcount));
																		} else {
																			switch (op) {
																				case '>':
																					return _Utils_Tuple3(
																						store,
																						holeBindings,
																						_Utils_Tuple2(
																							A4($author$project$IMP$Syntax$Eop, ws, '<=', e1, e2),
																							hcount));
																				case '<':
																					return _Utils_Tuple3(
																						store,
																						holeBindings,
																						_Utils_Tuple2(
																							A4($author$project$IMP$Syntax$Eop, ws, '>=', e1, e2),
																							hcount));
																				case '>=':
																					return _Utils_Tuple3(
																						store,
																						holeBindings,
																						_Utils_Tuple2(
																							A4($author$project$IMP$Syntax$Eop, ws, '<', e1, e2),
																							hcount));
																				case '<=':
																					return _Utils_Tuple3(
																						store,
																						holeBindings,
																						_Utils_Tuple2(
																							A4($author$project$IMP$Syntax$Eop, ws, '>', e1, e2),
																							hcount));
																				default:
																					return _Utils_Tuple3(
																						_List_Nil,
																						_List_Nil,
																						_Utils_Tuple2(
																							$author$project$IMP$Syntax$EError('Cannot infer in comp'),
																							0));
																			}
																		}
																	} else {
																		return _Utils_Tuple3(
																			_List_Nil,
																			_List_Nil,
																			_Utils_Tuple2(
																				$author$project$IMP$Syntax$EError('Cannot infer in comp'),
																				0));
																	}
															}
														}
													default:
														return _Utils_Tuple3(
															_List_Nil,
															_List_Nil,
															_Utils_Tuple2(
																$author$project$IMP$Syntax$EError('Unsupported value type for comp'),
																0));
												}
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var $author$project$IMP$Uneval$tryupde2logic = function (ws) {
	return function (store) {
		return function (holeBindings) {
			return function (readOnly) {
				return function (e1) {
					return function (e2) {
						return function (v1) {
							return function (v2) {
								return function (v) {
									return function (val) {
										return function (hcount) {
											return function (op) {
												var _v165 = function () {
													switch (v.$) {
														case 'VHole':
															var _v167 = _Utils_Tuple2(
																_Utils_Tuple3(v1, v2, val),
																op);
															_v167$9:
															while (true) {
																switch (_v167.a.c.$) {
																	case 'VBool':
																		if (!_v167.a.c.a) {
																			switch (_v167.a.a.$) {
																				case 'VHole':
																					if (_v167.b === '&&') {
																						switch (_v167.a.b.$) {
																							case 'VBool':
																								if (_v167.a.b.a) {
																									var _v170 = _v167.a;
																									var _v171 = _v170.a;
																									return _Utils_Tuple2(
																										v1,
																										$author$project$IMP$Syntax$VBool(false));
																								} else {
																									break _v167$9;
																								}
																							case 'VHole':
																								var _v174 = _v167.a;
																								var _v175 = _v174.a;
																								var _v176 = _v174.b;
																								return _Utils_Tuple2(
																									v1,
																									$author$project$IMP$Syntax$VBool(false));
																							default:
																								break _v167$9;
																						}
																					} else {
																						break _v167$9;
																					}
																				case 'VBool':
																					if (_v167.a.a.a) {
																						if ((_v167.a.b.$ === 'VHole') && (_v167.b === '&&')) {
																							var _v172 = _v167.a;
																							var _v173 = _v172.b;
																							return _Utils_Tuple2(
																								$author$project$IMP$Syntax$VBool(true),
																								$author$project$IMP$Syntax$VBool(false));
																						} else {
																							break _v167$9;
																						}
																					} else {
																						if ((_v167.a.b.$ === 'VHole') && (_v167.b === '||')) {
																							var _v177 = _v167.a;
																							var _v178 = _v177.b;
																							return _Utils_Tuple2(
																								$author$project$IMP$Syntax$VBool(false),
																								$author$project$IMP$Syntax$VBool(false));
																						} else {
																							break _v167$9;
																						}
																					}
																				default:
																					break _v167$9;
																			}
																		} else {
																			switch (_v167.a.a.$) {
																				case 'VBool':
																					if (_v167.a.a.a) {
																						if ((_v167.a.b.$ === 'VHole') && (_v167.b === '&&')) {
																							var _v168 = _v167.a;
																							var _v169 = _v168.b;
																							return _Utils_Tuple2(
																								$author$project$IMP$Syntax$VBool(true),
																								$author$project$IMP$Syntax$VBool(true));
																						} else {
																							break _v167$9;
																						}
																					} else {
																						if ((_v167.a.b.$ === 'VHole') && (_v167.b === '||')) {
																							var _v181 = _v167.a;
																							var _v182 = _v181.b;
																							return _Utils_Tuple2(
																								$author$project$IMP$Syntax$VBool(false),
																								$author$project$IMP$Syntax$VBool(true));
																						} else {
																							break _v167$9;
																						}
																					}
																				case 'VHole':
																					if (_v167.b === '||') {
																						switch (_v167.a.b.$) {
																							case 'VBool':
																								if (!_v167.a.b.a) {
																									var _v179 = _v167.a;
																									var _v180 = _v179.a;
																									return _Utils_Tuple2(
																										v1,
																										$author$project$IMP$Syntax$VBool(true));
																								} else {
																									break _v167$9;
																								}
																							case 'VHole':
																								var _v183 = _v167.a;
																								var _v184 = _v183.a;
																								var _v185 = _v183.b;
																								return _Utils_Tuple2(
																									v1,
																									$author$project$IMP$Syntax$VBool(true));
																							default:
																								break _v167$9;
																						}
																					} else {
																						break _v167$9;
																					}
																				default:
																					break _v167$9;
																			}
																		}
																	case 'VHole':
																		if (_v167.b === '&&') {
																			var _v186 = _v167.a;
																			var _v187 = _v186.c;
																			return _Utils_Tuple2(v1, v2);
																		} else {
																			break _v167$9;
																		}
																	default:
																		break _v167$9;
																}
															}
															return _Utils_Tuple2(
																$author$project$IMP$Syntax$VError('unsupported operation'),
																$author$project$IMP$Syntax$VError('unsupported operation'));
														case 'VBool':
															if (v.a) {
																switch (val.$) {
																	case 'VBool':
																		if (val.a) {
																			return _Utils_Tuple2(v1, v2);
																		} else {
																			switch (op) {
																				case '&&':
																					var _v190 = _Utils_Tuple2(v1, v2);
																					if ((((_v190.a.$ === 'VBool') && _v190.a.a) && (_v190.b.$ === 'VBool')) && _v190.b.a) {
																						return _Utils_Tuple2(
																							$author$project$IMP$Syntax$VBool(true),
																							$author$project$IMP$Syntax$VBool(false));
																					} else {
																						return _Utils_Tuple2(
																							$author$project$IMP$Syntax$VError('unsupported operation'),
																							$author$project$IMP$Syntax$VError('unsupported operation'));
																					}
																				case '||':
																					var _v191 = _Utils_Tuple2(v1, v2);
																					if ((((_v191.a.$ === 'VBool') && (!_v191.a.a)) && (_v191.b.$ === 'VBool')) && _v191.b.a) {
																						return _Utils_Tuple2(
																							$author$project$IMP$Syntax$VBool(false),
																							$author$project$IMP$Syntax$VBool(false));
																					} else {
																						return _Utils_Tuple2(
																							$author$project$IMP$Syntax$VError('unsupported operation'),
																							$author$project$IMP$Syntax$VError('unsupported operation'));
																					}
																				default:
																					return _Utils_Tuple2(
																						$author$project$IMP$Syntax$VError('unsupported operation'),
																						$author$project$IMP$Syntax$VError('unsupported operation'));
																			}
																		}
																	case 'VHole':
																		var h = val.a;
																		return _Utils_Tuple2(v1, val);
																	default:
																		return _Utils_Tuple2(
																			$author$project$IMP$Syntax$VError('unsupported operation'),
																			$author$project$IMP$Syntax$VError('unsupported operation'));
																}
															} else {
																switch (val.$) {
																	case 'VBool':
																		if (!val.a) {
																			return _Utils_Tuple2(v1, v2);
																		} else {
																			switch (op) {
																				case '&&':
																					var _v194 = _Utils_Tuple2(v1, v2);
																					_v194$2:
																					while (true) {
																						if ((_v194.a.$ === 'VBool') && _v194.a.a) {
																							switch (_v194.b.$) {
																								case 'VBool':
																									if (!_v194.b.a) {
																										return _Utils_Tuple2(
																											$author$project$IMP$Syntax$VBool(true),
																											$author$project$IMP$Syntax$VBool(true));
																									} else {
																										break _v194$2;
																									}
																								case 'VHole':
																									var _v195 = _v194.b;
																									return _Utils_Tuple2(
																										$author$project$IMP$Syntax$VBool(true),
																										$author$project$IMP$Syntax$VBool(true));
																								default:
																									break _v194$2;
																							}
																						} else {
																							break _v194$2;
																						}
																					}
																					return _Utils_Tuple2(
																						$author$project$IMP$Syntax$VError('unsupported operation'),
																						$author$project$IMP$Syntax$VError('unsupported operation'));
																				case '||':
																					var _v196 = _Utils_Tuple2(v1, v2);
																					if ((((_v196.a.$ === 'VBool') && (!_v196.a.a)) && (_v196.b.$ === 'VBool')) && (!_v196.b.a)) {
																						return _Utils_Tuple2(
																							$author$project$IMP$Syntax$VBool(false),
																							$author$project$IMP$Syntax$VBool(true));
																					} else {
																						return _Utils_Tuple2(
																							$author$project$IMP$Syntax$VError('unsupported operation'),
																							$author$project$IMP$Syntax$VError('unsupported operation'));
																					}
																				default:
																					return _Utils_Tuple2(
																						$author$project$IMP$Syntax$VError('unsupported operation'),
																						$author$project$IMP$Syntax$VError('unsupported operation'));
																			}
																		}
																	case 'VHole':
																		var h = val.a;
																		return _Utils_Tuple2(v1, val);
																	default:
																		return _Utils_Tuple2(
																			$author$project$IMP$Syntax$VError('unsupported operation'),
																			$author$project$IMP$Syntax$VError('unsupported operation'));
																}
															}
														default:
															return _Utils_Tuple2(
																$author$project$IMP$Syntax$VError('unsupported operation'),
																$author$project$IMP$Syntax$VError('unsupported operation'));
													}
												}();
												var newv1 = _v165.a;
												var newv2 = _v165.b;
												var _v197 = _Utils_Tuple2(newv1, newv2);
												if ((_v197.a.$ === 'VError') && (_v197.b.$ === 'VError')) {
													var s = _v197.a.a;
													return _Utils_Tuple3(
														_List_Nil,
														_List_Nil,
														_Utils_Tuple2(
															$author$project$IMP$Syntax$EError('logic: ' + s),
															0));
												} else {
													return $author$project$IMP$Uneval$checkChange(ws)(store)(holeBindings)(readOnly)(e1)(e2)(v1)(v2)(newv1)(newv2)(hcount)(op);
												}
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var $author$project$IMP$Uneval$tryupdearith = function (ws) {
	return function (store) {
		return function (holeBindings) {
			return function (readOnly) {
				return function (e1) {
					return function (e2) {
						return function (v1) {
							return function (v2) {
								return function (v) {
									return function (val) {
										return function (hcount) {
											return function (op) {
												switch (val.$) {
													case 'VHole':
														if (v1.$ === 'VHole') {
															return _Utils_Tuple3(
																store,
																holeBindings,
																_Utils_Tuple2(
																	A4($author$project$IMP$Syntax$Eop, ws, op, e1, e2),
																	hcount));
														} else {
															if (v2.$ === 'VHole') {
																return _Utils_Tuple3(
																	store,
																	holeBindings,
																	_Utils_Tuple2(
																		A4($author$project$IMP$Syntax$Eop, ws, op, e1, e2),
																		hcount));
															} else {
																var _v134 = A6($author$project$IMP$Uneval$uneval, store, holeBindings, e2, readOnly, val, hcount);
																var store_ = _v134.a;
																var holeBindings_ = _v134.b;
																var _v135 = _v134.c;
																var expr_ = _v135.a;
																var hcount_ = _v135.b;
																return _Utils_Tuple3(
																	store_,
																	holeBindings_,
																	_Utils_Tuple2(
																		A4($author$project$IMP$Syntax$Eop, ws, op, e1, expr_),
																		hcount_));
															}
														}
													case 'VInt':
														var n = val.a;
														var _v136 = function () {
															var _v137 = _Utils_Tuple2(v1, v2);
															_v137$4:
															while (true) {
																switch (_v137.a.$) {
																	case 'VHole':
																		switch (_v137.b.$) {
																			case 'VHole':
																				var _v138 = _v137.a;
																				var _v139 = _v137.b;
																				switch (op) {
																					case '+':
																						return _Utils_Tuple2(
																							$author$project$IMP$Syntax$VInt(n),
																							$author$project$IMP$Syntax$VInt(0));
																					case '-':
																						return _Utils_Tuple2(
																							$author$project$IMP$Syntax$VInt(n),
																							$author$project$IMP$Syntax$VInt(0));
																					case '*':
																						return _Utils_Tuple2(
																							$author$project$IMP$Syntax$VInt(n),
																							$author$project$IMP$Syntax$VInt(1));
																					case '/':
																						return _Utils_Tuple2(
																							$author$project$IMP$Syntax$VInt(n),
																							$author$project$IMP$Syntax$VInt(1));
																					default:
																						return _Utils_Tuple2(
																							$author$project$IMP$Syntax$VError('unsupported operation'),
																							$author$project$IMP$Syntax$VError('unsupported operation'));
																				}
																			case 'VInt':
																				var _v143 = _v137.a;
																				var n2 = _v137.b.a;
																				switch (op) {
																					case '+':
																						return _Utils_Tuple2(
																							$author$project$IMP$Syntax$VInt(n - n2),
																							$author$project$IMP$Syntax$VInt(n2));
																					case '-':
																						return _Utils_Tuple2(
																							$author$project$IMP$Syntax$VInt(n + n2),
																							$author$project$IMP$Syntax$VInt(n2));
																					case '*':
																						return _Utils_Tuple2(
																							$author$project$IMP$Syntax$VInt((n / n2) | 0),
																							$author$project$IMP$Syntax$VInt(n2));
																					case '/':
																						return _Utils_Tuple2(
																							$author$project$IMP$Syntax$VInt(n * n2),
																							$author$project$IMP$Syntax$VInt(n2));
																					default:
																						return _Utils_Tuple2(
																							$author$project$IMP$Syntax$VError('unsupported operation'),
																							$author$project$IMP$Syntax$VError('unsupported operation'));
																				}
																			default:
																				break _v137$4;
																		}
																	case 'VInt':
																		switch (_v137.b.$) {
																			case 'VHole':
																				var n1 = _v137.a.a;
																				var _v141 = _v137.b;
																				switch (op) {
																					case '+':
																						return _Utils_Tuple2(
																							$author$project$IMP$Syntax$VInt(n1),
																							$author$project$IMP$Syntax$VInt(n - n1));
																					case '-':
																						return _Utils_Tuple2(
																							$author$project$IMP$Syntax$VInt(n1),
																							$author$project$IMP$Syntax$VInt(n1 - n));
																					case '*':
																						return _Utils_Tuple2(
																							$author$project$IMP$Syntax$VInt(n1),
																							$author$project$IMP$Syntax$VInt(n1 * n));
																					case '/':
																						return _Utils_Tuple2(
																							$author$project$IMP$Syntax$VInt(n1),
																							$author$project$IMP$Syntax$VInt((n1 / n) | 0));
																					default:
																						return _Utils_Tuple2(
																							$author$project$IMP$Syntax$VError('unsupported operation'),
																							$author$project$IMP$Syntax$VError('unsupported operation'));
																				}
																			case 'VInt':
																				var n1 = _v137.a.a;
																				switch (op) {
																					case '+':
																						return _Utils_Tuple2(
																							$author$project$IMP$Syntax$VInt(n1),
																							$author$project$IMP$Syntax$VInt(n - n1));
																					case '-':
																						return _Utils_Tuple2(
																							$author$project$IMP$Syntax$VInt(n1),
																							$author$project$IMP$Syntax$VInt(n1 - n));
																					case '*':
																						return _Utils_Tuple2(
																							$author$project$IMP$Syntax$VInt(n1),
																							$author$project$IMP$Syntax$VInt((n / n1) | 0));
																					case '/':
																						return _Utils_Tuple2(
																							$author$project$IMP$Syntax$VInt(n1),
																							$author$project$IMP$Syntax$VInt(n1 * n));
																					default:
																						return _Utils_Tuple2(
																							$author$project$IMP$Syntax$VError('unsupported operation'),
																							$author$project$IMP$Syntax$VError('unsupported operation'));
																				}
																			default:
																				break _v137$4;
																		}
																	default:
																		break _v137$4;
																}
															}
															return _Utils_Tuple2(
																$author$project$IMP$Syntax$VError('unsupported operation'),
																$author$project$IMP$Syntax$VError('unsupported operation'));
														}();
														var newv1 = _v136.a;
														var newv2 = _v136.b;
														var _v146 = _Utils_Tuple2(newv1, newv2);
														if ((_v146.a.$ === 'VError') && (_v146.b.$ === 'VError')) {
															return _Utils_Tuple3(
																_List_Nil,
																_List_Nil,
																_Utils_Tuple2(
																	$author$project$IMP$Syntax$EError('arith: ' + op),
																	0));
														} else {
															return $author$project$IMP$Uneval$checkChange(ws)(store)(holeBindings)(readOnly)(e1)(e2)(v1)(v2)(newv1)(newv2)(hcount)(op);
														}
													case 'VList':
														var vs = val.a;
														if (op === '++') {
															var _v148 = function () {
																var _v149 = _Utils_Tuple2(v1, v2);
																_v149$4:
																while (true) {
																	switch (_v149.a.$) {
																		case 'VHole':
																			switch (_v149.b.$) {
																				case 'VHole':
																					var _v150 = _v149.a;
																					var _v151 = _v149.b;
																					return _Utils_Tuple2(
																						$author$project$IMP$Syntax$VList(vs),
																						$author$project$IMP$Syntax$VList(_List_Nil));
																				case 'VList':
																					var _v153 = _v149.a;
																					var vs2 = _v149.b.a;
																					return ((_Utils_cmp(
																						$elm$core$List$length(vs2),
																						$elm$core$List$length(vs)) < 1) && _Utils_eq(
																						A2(
																							$elm$core$List$drop,
																							$elm$core$List$length(vs) - $elm$core$List$length(vs2),
																							vs),
																						vs2)) ? _Utils_Tuple2(
																						$author$project$IMP$Syntax$VList(
																							A2(
																								$elm$core$List$take,
																								$elm$core$List$length(vs) - $elm$core$List$length(vs2),
																								vs)),
																						v2) : _Utils_Tuple2(
																						$author$project$IMP$Syntax$VList(vs),
																						$author$project$IMP$Syntax$VList(_List_Nil));
																				default:
																					break _v149$4;
																			}
																		case 'VList':
																			switch (_v149.b.$) {
																				case 'VHole':
																					var vs1 = _v149.a.a;
																					var _v152 = _v149.b;
																					return ((_Utils_cmp(
																						$elm$core$List$length(vs1),
																						$elm$core$List$length(vs)) < 1) && _Utils_eq(
																						A2(
																							$elm$core$List$take,
																							$elm$core$List$length(vs1),
																							vs),
																						vs1)) ? _Utils_Tuple2(
																						v1,
																						$author$project$IMP$Syntax$VList(
																							A2(
																								$elm$core$List$drop,
																								$elm$core$List$length(vs1),
																								vs))) : _Utils_Tuple2(
																						$author$project$IMP$Syntax$VList(vs),
																						$author$project$IMP$Syntax$VList(_List_Nil));
																				case 'VList':
																					var vs1 = _v149.a.a;
																					var vs2 = _v149.b.a;
																					var _v154 = (_Utils_cmp(
																						$elm$core$List$length(vs1),
																						$elm$core$List$length(vs)) > 0) ? _Utils_Tuple2(vs, _List_Nil) : _Utils_Tuple2(
																						A2(
																							$elm$core$List$take,
																							$elm$core$List$length(vs1),
																							vs),
																						A2(
																							$elm$core$List$drop,
																							$elm$core$List$length(vs1),
																							vs));
																					var vs1_ = _v154.a;
																					var vs2_ = _v154.b;
																					return _Utils_Tuple2(
																						$author$project$IMP$Syntax$VList(vs1_),
																						$author$project$IMP$Syntax$VList(vs2_));
																				default:
																					break _v149$4;
																			}
																		default:
																			break _v149$4;
																	}
																}
																return _Utils_Tuple2(
																	$author$project$IMP$Syntax$VError('unsupported operation'),
																	$author$project$IMP$Syntax$VError('unsupported operation'));
															}();
															var newv1 = _v148.a;
															var newv2 = _v148.b;
															var _v155 = _Utils_Tuple2(newv1, newv2);
															if ((_v155.a.$ === 'VError') && (_v155.b.$ === 'VError')) {
																var info = _v155.a.a;
																return _Utils_Tuple3(
																	_List_Nil,
																	_List_Nil,
																	_Utils_Tuple2(
																		$author$project$IMP$Syntax$EError('arith: ' + info),
																		0));
															} else {
																return $author$project$IMP$Uneval$checkChange(ws)(store)(holeBindings)(readOnly)(e1)(e2)(v1)(v2)(newv1)(newv2)(hcount)(op);
															}
														} else {
															return _Utils_Tuple3(
																_List_Nil,
																_List_Nil,
																_Utils_Tuple2(
																	$author$project$IMP$Syntax$EError('arith: unsupported operation for list'),
																	0));
														}
													case 'VString':
														var s = val.a;
														if (op === '++') {
															var _v157 = function () {
																var _v158 = _Utils_Tuple2(v1, v2);
																_v158$4:
																while (true) {
																	switch (_v158.a.$) {
																		case 'VHole':
																			switch (_v158.b.$) {
																				case 'VHole':
																					var _v159 = _v158.a;
																					var _v160 = _v158.b;
																					return _Utils_Tuple2(
																						$author$project$IMP$Syntax$VString(s),
																						$author$project$IMP$Syntax$VString(''));
																				case 'VString':
																					var _v162 = _v158.a;
																					var s2 = _v158.b.a;
																					return ((_Utils_cmp(
																						$elm$core$String$length(s2),
																						$elm$core$String$length(s)) < 1) && _Utils_eq(
																						A2(
																							$elm$core$String$right,
																							$elm$core$String$length(s2),
																							s),
																						s2)) ? _Utils_Tuple2(
																						$author$project$IMP$Syntax$VString(
																							A2(
																								$elm$core$String$dropRight,
																								$elm$core$String$length(s2),
																								s)),
																						v2) : _Utils_Tuple2(
																						$author$project$IMP$Syntax$VString(s),
																						$author$project$IMP$Syntax$VString(''));
																				default:
																					break _v158$4;
																			}
																		case 'VString':
																			switch (_v158.b.$) {
																				case 'VHole':
																					var s1 = _v158.a.a;
																					var _v161 = _v158.b;
																					return ((_Utils_cmp(
																						$elm$core$String$length(s1),
																						$elm$core$String$length(s)) < 1) && _Utils_eq(
																						A2(
																							$elm$core$String$left,
																							$elm$core$String$length(s1),
																							s),
																						s1)) ? _Utils_Tuple2(
																						v1,
																						$author$project$IMP$Syntax$VString(
																							A2(
																								$elm$core$String$dropLeft,
																								$elm$core$String$length(s1),
																								s))) : _Utils_Tuple2(
																						$author$project$IMP$Syntax$VString(s),
																						$author$project$IMP$Syntax$VString(''));
																				case 'VString':
																					var s1 = _v158.a.a;
																					var _v163 = (_Utils_cmp(
																						$elm$core$String$length(s1),
																						$elm$core$String$length(s)) > 0) ? _Utils_Tuple2(s, '') : _Utils_Tuple2(
																						A2(
																							$elm$core$String$left,
																							$elm$core$String$length(s1),
																							s),
																						A2(
																							$elm$core$String$dropLeft,
																							$elm$core$String$length(s1),
																							s));
																					var s1_ = _v163.a;
																					var s2_ = _v163.b;
																					return _Utils_Tuple2(
																						$author$project$IMP$Syntax$VString(s1_),
																						$author$project$IMP$Syntax$VString(s2_));
																				default:
																					break _v158$4;
																			}
																		default:
																			break _v158$4;
																	}
																}
																return _Utils_Tuple2(
																	$author$project$IMP$Syntax$VError('unsupported operation'),
																	$author$project$IMP$Syntax$VError('unsupported operation'));
															}();
															var newv1 = _v157.a;
															var newv2 = _v157.b;
															var _v164 = _Utils_Tuple2(newv1, newv2);
															if ((_v164.a.$ === 'VError') && (_v164.b.$ === 'VError')) {
																var info = _v164.a.a;
																return _Utils_Tuple3(
																	_List_Nil,
																	_List_Nil,
																	_Utils_Tuple2(
																		$author$project$IMP$Syntax$EError('arith: ' + info),
																		0));
															} else {
																return $author$project$IMP$Uneval$checkChange(ws)(store)(holeBindings)(readOnly)(e1)(e2)(v1)(v2)(newv1)(newv2)(hcount)(op);
															}
														} else {
															return _Utils_Tuple3(
																_List_Nil,
																_List_Nil,
																_Utils_Tuple2(
																	$author$project$IMP$Syntax$EError('arith: unsupported operation for string'),
																	0));
														}
													default:
														return _Utils_Tuple3(
															_List_Nil,
															_List_Nil,
															_Utils_Tuple2(
																$author$project$IMP$Syntax$EError('arith: unsupported operation'),
																0));
												}
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var $author$project$IMP$Uneval$tryupdecomp = function (ws) {
	return function (store) {
		return function (holeBindings) {
			return function (readOnly) {
				return function (e1) {
					return function (e2) {
						return function (v1) {
							return function (v2) {
								return function (v) {
									return function (val) {
										return function (hcount) {
											return function (op) {
												switch (val.$) {
													case 'VHole':
														if (v1.$ === 'VHole') {
															return _Utils_Tuple3(
																store,
																holeBindings,
																_Utils_Tuple2(
																	A4($author$project$IMP$Syntax$Eop, ws, op, e1, e2),
																	hcount));
														} else {
															if (v2.$ === 'VHole') {
																return _Utils_Tuple3(
																	store,
																	holeBindings,
																	_Utils_Tuple2(
																		A4($author$project$IMP$Syntax$Eop, ws, op, e1, e2),
																		hcount));
															} else {
																var _v91 = A6($author$project$IMP$Uneval$uneval, store, holeBindings, e2, readOnly, val, hcount);
																var store_ = _v91.a;
																var holeBindings_ = _v91.b;
																var _v92 = _v91.c;
																var expr_ = _v92.a;
																var hcount_ = _v92.b;
																return _Utils_Tuple3(
																	store_,
																	holeBindings_,
																	_Utils_Tuple2(
																		A4($author$project$IMP$Syntax$Eop, ws, op, e1, expr_),
																		hcount_));
															}
														}
													case 'VBool':
														if (val.a) {
															switch (op) {
																case '==':
																	var _v94 = function () {
																		var _v95 = _Utils_Tuple2(v1, v2);
																		_v95$12:
																		while (true) {
																			switch (_v95.a.$) {
																				case 'VHole':
																					switch (_v95.b.$) {
																						case 'VInt':
																							var _v96 = _v95.a;
																							var n = _v95.b.a;
																							return _Utils_Tuple2(
																								$author$project$IMP$Syntax$VInt(n),
																								$author$project$IMP$Syntax$VInt(n));
																						case 'VString':
																							var _v98 = _v95.a;
																							var s = _v95.b.a;
																							return _Utils_Tuple2(
																								$author$project$IMP$Syntax$VString(s),
																								$author$project$IMP$Syntax$VString(s));
																						case 'VBool':
																							if (_v95.b.a) {
																								var _v100 = _v95.a;
																								return _Utils_Tuple2(
																									$author$project$IMP$Syntax$VBool(true),
																									$author$project$IMP$Syntax$VBool(true));
																							} else {
																								var _v102 = _v95.a;
																								return _Utils_Tuple2(
																									$author$project$IMP$Syntax$VBool(false),
																									$author$project$IMP$Syntax$VBool(false));
																							}
																						default:
																							break _v95$12;
																					}
																				case 'VInt':
																					switch (_v95.b.$) {
																						case 'VHole':
																							var n = _v95.a.a;
																							var _v97 = _v95.b;
																							return _Utils_Tuple2(
																								$author$project$IMP$Syntax$VInt(n),
																								$author$project$IMP$Syntax$VInt(n));
																						case 'VInt':
																							var n1 = _v95.a.a;
																							var n2 = _v95.b.a;
																							return _Utils_eq(n1, n2) ? _Utils_Tuple2(v1, v2) : _Utils_Tuple2(
																								$author$project$IMP$Syntax$VInt(n1),
																								$author$project$IMP$Syntax$VInt(n1));
																						default:
																							break _v95$12;
																					}
																				case 'VBool':
																					if (_v95.a.a) {
																						switch (_v95.b.$) {
																							case 'VHole':
																								var _v101 = _v95.b;
																								return _Utils_Tuple2(
																									$author$project$IMP$Syntax$VBool(true),
																									$author$project$IMP$Syntax$VBool(true));
																							case 'VBool':
																								if (!_v95.b.a) {
																									return _Utils_Tuple2(
																										$author$project$IMP$Syntax$VBool(true),
																										$author$project$IMP$Syntax$VBool(true));
																								} else {
																									break _v95$12;
																								}
																							default:
																								break _v95$12;
																						}
																					} else {
																						switch (_v95.b.$) {
																							case 'VHole':
																								var _v103 = _v95.b;
																								return _Utils_Tuple2(
																									$author$project$IMP$Syntax$VBool(false),
																									$author$project$IMP$Syntax$VBool(false));
																							case 'VBool':
																								if (_v95.b.a) {
																									return _Utils_Tuple2(
																										$author$project$IMP$Syntax$VBool(false),
																										$author$project$IMP$Syntax$VBool(false));
																								} else {
																									break _v95$12;
																								}
																							default:
																								break _v95$12;
																						}
																					}
																				case 'VString':
																					switch (_v95.b.$) {
																						case 'VHole':
																							var s = _v95.a.a;
																							var _v99 = _v95.b;
																							return _Utils_Tuple2(
																								$author$project$IMP$Syntax$VString(s),
																								$author$project$IMP$Syntax$VString(s));
																						case 'VString':
																							var s1 = _v95.a.a;
																							var s2 = _v95.b.a;
																							return _Utils_eq(s1, s2) ? _Utils_Tuple2(v1, v2) : _Utils_Tuple2(
																								$author$project$IMP$Syntax$VString(s1),
																								$author$project$IMP$Syntax$VString(s1));
																						default:
																							break _v95$12;
																					}
																				default:
																					break _v95$12;
																			}
																		}
																		return _Utils_Tuple2(
																			$author$project$IMP$Syntax$VError('unsupported operation'),
																			$author$project$IMP$Syntax$VError('unsupported operation'));
																	}();
																	var newv1 = _v94.a;
																	var newv2 = _v94.b;
																	var _v104 = _Utils_Tuple2(newv1, newv2);
																	if ((_v104.a.$ === 'VError') && (_v104.b.$ === 'VError')) {
																		return _Utils_Tuple3(
																			_List_Nil,
																			_List_Nil,
																			_Utils_Tuple2(
																				$author$project$IMP$Syntax$EError('unsupported operation'),
																				0));
																	} else {
																		return $author$project$IMP$Uneval$checkChange(ws)(store)(holeBindings)(readOnly)(e1)(e2)(v1)(v2)(newv1)(newv2)(hcount)(op);
																	}
																case '!=':
																	var _v105 = _Utils_Tuple2(v1, v2);
																	if (_v105.a.$ === 'VHole') {
																		if (_v105.b.$ === 'VHole') {
																			var _v106 = _v105.a;
																			var _v107 = _v105.b;
																			return _Utils_Tuple3(
																				_List_Nil,
																				_List_Nil,
																				_Utils_Tuple2(
																					$author$project$IMP$Syntax$EError('Cannot infer in neq'),
																					0));
																		} else {
																			var _v108 = _v105.a;
																			return _Utils_Tuple3(
																				_List_Nil,
																				_List_Nil,
																				_Utils_Tuple2(
																					$author$project$IMP$Syntax$EError('Cannot infer in neq'),
																					0));
																		}
																	} else {
																		if (_v105.b.$ === 'VHole') {
																			var _v109 = _v105.b;
																			return _Utils_Tuple3(
																				_List_Nil,
																				_List_Nil,
																				_Utils_Tuple2(
																					$author$project$IMP$Syntax$EError('Cannot infer in neq'),
																					0));
																		} else {
																			return (!_Utils_eq(v1, v2)) ? _Utils_Tuple3(
																				store,
																				holeBindings,
																				_Utils_Tuple2(
																					A4($author$project$IMP$Syntax$Eop, ws, op, e1, e2),
																					hcount)) : _Utils_Tuple3(
																				_List_Nil,
																				_List_Nil,
																				_Utils_Tuple2(
																					$author$project$IMP$Syntax$EError('Cannot infer in neq'),
																					0));
																		}
																	}
																default:
																	if (v.$ === 'VBool') {
																		if (v.a) {
																			return _Utils_Tuple3(
																				store,
																				holeBindings,
																				_Utils_Tuple2(
																					A4($author$project$IMP$Syntax$Eop, ws, op, e1, e2),
																					hcount));
																		} else {
																			switch (op) {
																				case '>':
																					return _Utils_Tuple3(
																						store,
																						holeBindings,
																						_Utils_Tuple2(
																							A4($author$project$IMP$Syntax$Eop, ws, '<=', e1, e2),
																							hcount));
																				case '<':
																					return _Utils_Tuple3(
																						store,
																						holeBindings,
																						_Utils_Tuple2(
																							A4($author$project$IMP$Syntax$Eop, ws, '>=', e1, e2),
																							hcount));
																				case '>=':
																					return _Utils_Tuple3(
																						store,
																						holeBindings,
																						_Utils_Tuple2(
																							A4($author$project$IMP$Syntax$Eop, ws, '<', e1, e2),
																							hcount));
																				case '<=':
																					return _Utils_Tuple3(
																						store,
																						holeBindings,
																						_Utils_Tuple2(
																							A4($author$project$IMP$Syntax$Eop, ws, '>', e1, e2),
																							hcount));
																				default:
																					return _Utils_Tuple3(
																						_List_Nil,
																						_List_Nil,
																						_Utils_Tuple2(
																							$author$project$IMP$Syntax$EError('Cannot infer in comp'),
																							0));
																			}
																		}
																	} else {
																		return _Utils_Tuple3(
																			_List_Nil,
																			_List_Nil,
																			_Utils_Tuple2(
																				$author$project$IMP$Syntax$EError('Cannot infer in comp'),
																				0));
																	}
															}
														} else {
															switch (op) {
																case '==':
																	var _v113 = _Utils_Tuple2(v1, v2);
																	if (_v113.a.$ === 'VHole') {
																		if (_v113.b.$ === 'VHole') {
																			var _v114 = _v113.a;
																			var _v115 = _v113.b;
																			return _Utils_Tuple3(
																				_List_Nil,
																				_List_Nil,
																				_Utils_Tuple2(
																					$author$project$IMP$Syntax$EError('Cannot infer in eq'),
																					0));
																		} else {
																			var _v116 = _v113.a;
																			return _Utils_Tuple3(
																				_List_Nil,
																				_List_Nil,
																				_Utils_Tuple2(
																					$author$project$IMP$Syntax$EError('Cannot infer in eq'),
																					0));
																		}
																	} else {
																		if (_v113.b.$ === 'VHole') {
																			var _v117 = _v113.b;
																			return _Utils_Tuple3(
																				_List_Nil,
																				_List_Nil,
																				_Utils_Tuple2(
																					$author$project$IMP$Syntax$EError('Cannot infer in eq'),
																					0));
																		} else {
																			return (!_Utils_eq(v1, v2)) ? _Utils_Tuple3(
																				store,
																				holeBindings,
																				_Utils_Tuple2(
																					A4($author$project$IMP$Syntax$Eop, ws, op, e1, e2),
																					hcount)) : _Utils_Tuple3(
																				_List_Nil,
																				_List_Nil,
																				_Utils_Tuple2(
																					$author$project$IMP$Syntax$EError('Cannot infer in eq'),
																					0));
																		}
																	}
																case '!=':
																	var _v118 = function () {
																		var _v119 = _Utils_Tuple2(v1, v2);
																		_v119$12:
																		while (true) {
																			switch (_v119.a.$) {
																				case 'VHole':
																					switch (_v119.b.$) {
																						case 'VInt':
																							var _v120 = _v119.a;
																							var n = _v119.b.a;
																							return _Utils_Tuple2(
																								$author$project$IMP$Syntax$VInt(n),
																								$author$project$IMP$Syntax$VInt(n));
																						case 'VString':
																							var _v122 = _v119.a;
																							var s = _v119.b.a;
																							return _Utils_Tuple2(
																								$author$project$IMP$Syntax$VString(s),
																								$author$project$IMP$Syntax$VString(s));
																						case 'VBool':
																							if (_v119.b.a) {
																								var _v124 = _v119.a;
																								return _Utils_Tuple2(
																									$author$project$IMP$Syntax$VBool(true),
																									$author$project$IMP$Syntax$VBool(true));
																							} else {
																								var _v126 = _v119.a;
																								return _Utils_Tuple2(
																									$author$project$IMP$Syntax$VBool(false),
																									$author$project$IMP$Syntax$VBool(false));
																							}
																						default:
																							break _v119$12;
																					}
																				case 'VInt':
																					switch (_v119.b.$) {
																						case 'VHole':
																							var n = _v119.a.a;
																							var _v121 = _v119.b;
																							return _Utils_Tuple2(
																								$author$project$IMP$Syntax$VInt(n),
																								$author$project$IMP$Syntax$VInt(n));
																						case 'VInt':
																							var n1 = _v119.a.a;
																							var n2 = _v119.b.a;
																							return _Utils_eq(n1, n2) ? _Utils_Tuple2(v1, v2) : _Utils_Tuple2(
																								$author$project$IMP$Syntax$VInt(n1),
																								$author$project$IMP$Syntax$VInt(n1));
																						default:
																							break _v119$12;
																					}
																				case 'VBool':
																					if (_v119.a.a) {
																						switch (_v119.b.$) {
																							case 'VHole':
																								var _v125 = _v119.b;
																								return _Utils_Tuple2(
																									$author$project$IMP$Syntax$VBool(true),
																									$author$project$IMP$Syntax$VBool(true));
																							case 'VBool':
																								if (!_v119.b.a) {
																									return _Utils_Tuple2(
																										$author$project$IMP$Syntax$VBool(true),
																										$author$project$IMP$Syntax$VBool(true));
																								} else {
																									break _v119$12;
																								}
																							default:
																								break _v119$12;
																						}
																					} else {
																						switch (_v119.b.$) {
																							case 'VHole':
																								var _v127 = _v119.b;
																								return _Utils_Tuple2(
																									$author$project$IMP$Syntax$VBool(false),
																									$author$project$IMP$Syntax$VBool(false));
																							case 'VBool':
																								if (_v119.b.a) {
																									return _Utils_Tuple2(
																										$author$project$IMP$Syntax$VBool(false),
																										$author$project$IMP$Syntax$VBool(false));
																								} else {
																									break _v119$12;
																								}
																							default:
																								break _v119$12;
																						}
																					}
																				case 'VString':
																					switch (_v119.b.$) {
																						case 'VHole':
																							var s = _v119.a.a;
																							var _v123 = _v119.b;
																							return _Utils_Tuple2(
																								$author$project$IMP$Syntax$VString(s),
																								$author$project$IMP$Syntax$VString(s));
																						case 'VString':
																							var s1 = _v119.a.a;
																							var s2 = _v119.b.a;
																							return _Utils_eq(s1, s2) ? _Utils_Tuple2(v1, v2) : _Utils_Tuple2(
																								$author$project$IMP$Syntax$VString(s1),
																								$author$project$IMP$Syntax$VString(s1));
																						default:
																							break _v119$12;
																					}
																				default:
																					break _v119$12;
																			}
																		}
																		return _Utils_Tuple2(
																			$author$project$IMP$Syntax$VError('unsupported operation'),
																			$author$project$IMP$Syntax$VError('unsupported operation'));
																	}();
																	var newv1 = _v118.a;
																	var newv2 = _v118.b;
																	var _v128 = _Utils_Tuple2(newv1, newv2);
																	if ((_v128.a.$ === 'VError') && (_v128.b.$ === 'VError')) {
																		return _Utils_Tuple3(
																			_List_Nil,
																			_List_Nil,
																			_Utils_Tuple2(
																				$author$project$IMP$Syntax$EError('unsupported operation'),
																				0));
																	} else {
																		return $author$project$IMP$Uneval$checkChange(ws)(store)(holeBindings)(readOnly)(e1)(e2)(v1)(v2)(newv1)(newv2)(hcount)(op);
																	}
																default:
																	if (v.$ === 'VBool') {
																		if (!v.a) {
																			return _Utils_Tuple3(
																				store,
																				holeBindings,
																				_Utils_Tuple2(
																					A4($author$project$IMP$Syntax$Eop, ws, op, e1, e2),
																					hcount));
																		} else {
																			switch (op) {
																				case '>':
																					return _Utils_Tuple3(
																						store,
																						holeBindings,
																						_Utils_Tuple2(
																							A4($author$project$IMP$Syntax$Eop, ws, '<=', e1, e2),
																							hcount));
																				case '<':
																					return _Utils_Tuple3(
																						store,
																						holeBindings,
																						_Utils_Tuple2(
																							A4($author$project$IMP$Syntax$Eop, ws, '>=', e1, e2),
																							hcount));
																				case '>=':
																					return _Utils_Tuple3(
																						store,
																						holeBindings,
																						_Utils_Tuple2(
																							A4($author$project$IMP$Syntax$Eop, ws, '<', e1, e2),
																							hcount));
																				case '<=':
																					return _Utils_Tuple3(
																						store,
																						holeBindings,
																						_Utils_Tuple2(
																							A4($author$project$IMP$Syntax$Eop, ws, '>', e1, e2),
																							hcount));
																				default:
																					return _Utils_Tuple3(
																						_List_Nil,
																						_List_Nil,
																						_Utils_Tuple2(
																							$author$project$IMP$Syntax$EError('Cannot infer in comp'),
																							0));
																			}
																		}
																	} else {
																		return _Utils_Tuple3(
																			_List_Nil,
																			_List_Nil,
																			_Utils_Tuple2(
																				$author$project$IMP$Syntax$EError('Cannot infer in comp'),
																				0));
																	}
															}
														}
													default:
														return _Utils_Tuple3(
															_List_Nil,
															_List_Nil,
															_Utils_Tuple2(
																$author$project$IMP$Syntax$EError('Unsupported value type for comp'),
																0));
												}
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var $author$project$IMP$Uneval$tryupdelogic = function (ws) {
	return function (store) {
		return function (holeBindings) {
			return function (readOnly) {
				return function (e1) {
					return function (e2) {
						return function (v1) {
							return function (v2) {
								return function (v) {
									return function (val) {
										return function (hcount) {
											return function (op) {
												var _v42 = function () {
													switch (v.$) {
														case 'VHole':
															var _v44 = _Utils_Tuple2(
																_Utils_Tuple3(v1, v2, val),
																op);
															_v44$13:
															while (true) {
																switch (_v44.a.c.$) {
																	case 'VBool':
																		if (!_v44.a.c.a) {
																			switch (_v44.a.a.$) {
																				case 'VBool':
																					if (_v44.a.a.a) {
																						if ((_v44.a.b.$ === 'VHole') && (_v44.b === '&&')) {
																							var _v54 = _v44.a;
																							var _v55 = _v54.b;
																							return _Utils_Tuple2(
																								$author$project$IMP$Syntax$VBool(true),
																								$author$project$IMP$Syntax$VBool(false));
																						} else {
																							break _v44$13;
																						}
																					} else {
																						if ((_v44.a.b.$ === 'VHole') && (_v44.b === '||')) {
																							var _v61 = _v44.a;
																							var _v62 = _v61.b;
																							return _Utils_Tuple2(
																								$author$project$IMP$Syntax$VBool(false),
																								$author$project$IMP$Syntax$VBool(false));
																						} else {
																							break _v44$13;
																						}
																					}
																				case 'VHole':
																					switch (_v44.a.b.$) {
																						case 'VBool':
																							if (_v44.a.b.a) {
																								if (_v44.b === '&&') {
																									var _v52 = _v44.a;
																									var _v53 = _v52.a;
																									return _Utils_Tuple2(
																										$author$project$IMP$Syntax$VBool(false),
																										$author$project$IMP$Syntax$VBool(true));
																								} else {
																									break _v44$13;
																								}
																							} else {
																								if (_v44.b === '||') {
																									var _v59 = _v44.a;
																									var _v60 = _v59.a;
																									return _Utils_Tuple2(
																										$author$project$IMP$Syntax$VBool(false),
																										$author$project$IMP$Syntax$VBool(false));
																								} else {
																									break _v44$13;
																								}
																							}
																						case 'VHole':
																							switch (_v44.b) {
																								case '&&':
																									var _v56 = _v44.a;
																									var _v57 = _v56.a;
																									var _v58 = _v56.b;
																									return _Utils_Tuple2(
																										v1,
																										$author$project$IMP$Syntax$VBool(false));
																								case '||':
																									var _v63 = _v44.a;
																									var _v64 = _v63.a;
																									var _v65 = _v63.b;
																									return _Utils_Tuple2(
																										$author$project$IMP$Syntax$VBool(false),
																										$author$project$IMP$Syntax$VBool(false));
																								default:
																									break _v44$13;
																							}
																						default:
																							break _v44$13;
																					}
																				default:
																					break _v44$13;
																			}
																		} else {
																			switch (_v44.a.a.$) {
																				case 'VBool':
																					if (_v44.a.a.a) {
																						if ((_v44.a.b.$ === 'VHole') && (_v44.b === '&&')) {
																							var _v47 = _v44.a;
																							var _v48 = _v47.b;
																							return _Utils_Tuple2(
																								$author$project$IMP$Syntax$VBool(true),
																								$author$project$IMP$Syntax$VBool(true));
																						} else {
																							break _v44$13;
																						}
																					} else {
																						if ((_v44.a.b.$ === 'VHole') && (_v44.b === '||')) {
																							var _v68 = _v44.a;
																							var _v69 = _v68.b;
																							return _Utils_Tuple2(
																								$author$project$IMP$Syntax$VBool(false),
																								$author$project$IMP$Syntax$VBool(true));
																						} else {
																							break _v44$13;
																						}
																					}
																				case 'VHole':
																					switch (_v44.a.b.$) {
																						case 'VBool':
																							if (_v44.a.b.a) {
																								if (_v44.b === '&&') {
																									var _v45 = _v44.a;
																									var _v46 = _v45.a;
																									return _Utils_Tuple2(
																										$author$project$IMP$Syntax$VBool(true),
																										$author$project$IMP$Syntax$VBool(true));
																								} else {
																									break _v44$13;
																								}
																							} else {
																								if (_v44.b === '||') {
																									var _v66 = _v44.a;
																									var _v67 = _v66.a;
																									return _Utils_Tuple2(
																										$author$project$IMP$Syntax$VBool(true),
																										$author$project$IMP$Syntax$VBool(false));
																								} else {
																									break _v44$13;
																								}
																							}
																						case 'VHole':
																							switch (_v44.b) {
																								case '&&':
																									var _v49 = _v44.a;
																									var _v50 = _v49.a;
																									var _v51 = _v49.b;
																									return _Utils_Tuple2(
																										$author$project$IMP$Syntax$VBool(true),
																										$author$project$IMP$Syntax$VBool(true));
																								case '||':
																									var _v70 = _v44.a;
																									var _v71 = _v70.a;
																									var _v72 = _v70.b;
																									return _Utils_Tuple2(
																										v1,
																										$author$project$IMP$Syntax$VBool(true));
																								default:
																									break _v44$13;
																							}
																						default:
																							break _v44$13;
																					}
																				default:
																					break _v44$13;
																			}
																		}
																	case 'VHole':
																		if (_v44.b === '&&') {
																			var _v73 = _v44.a;
																			var _v74 = _v73.c;
																			return _Utils_Tuple2(v1, v2);
																		} else {
																			break _v44$13;
																		}
																	default:
																		break _v44$13;
																}
															}
															return _Utils_Tuple2(
																$author$project$IMP$Syntax$VError('unsupported operation'),
																$author$project$IMP$Syntax$VError('unsupported operation'));
														case 'VBool':
															if (v.a) {
																switch (val.$) {
																	case 'VBool':
																		if (val.a) {
																			return _Utils_Tuple2(v1, v2);
																		} else {
																			switch (op) {
																				case '&&':
																					var _v77 = _Utils_Tuple2(v1, v2);
																					if ((((_v77.a.$ === 'VBool') && _v77.a.a) && (_v77.b.$ === 'VBool')) && _v77.b.a) {
																						return _Utils_Tuple2(
																							$author$project$IMP$Syntax$VBool(false),
																							$author$project$IMP$Syntax$VBool(true));
																					} else {
																						return _Utils_Tuple2(
																							$author$project$IMP$Syntax$VError('unsupported operation'),
																							$author$project$IMP$Syntax$VError('unsupported operation'));
																					}
																				case '||':
																					var _v78 = _Utils_Tuple2(v1, v2);
																					_v78$5:
																					while (true) {
																						switch (_v78.a.$) {
																							case 'VHole':
																								if ((_v78.b.$ === 'VBool') && _v78.b.a) {
																									var _v79 = _v78.a;
																									return _Utils_Tuple2(
																										$author$project$IMP$Syntax$VBool(false),
																										$author$project$IMP$Syntax$VBool(false));
																								} else {
																									break _v78$5;
																								}
																							case 'VBool':
																								if (!_v78.a.a) {
																									if ((_v78.b.$ === 'VBool') && _v78.b.a) {
																										return _Utils_Tuple2(
																											$author$project$IMP$Syntax$VBool(false),
																											$author$project$IMP$Syntax$VBool(false));
																									} else {
																										break _v78$5;
																									}
																								} else {
																									switch (_v78.b.$) {
																										case 'VBool':
																											if (_v78.b.a) {
																												return _Utils_Tuple2(
																													$author$project$IMP$Syntax$VBool(false),
																													$author$project$IMP$Syntax$VBool(false));
																											} else {
																												return _Utils_Tuple2(
																													$author$project$IMP$Syntax$VBool(false),
																													$author$project$IMP$Syntax$VBool(false));
																											}
																										case 'VHole':
																											var _v80 = _v78.b;
																											return _Utils_Tuple2(
																												$author$project$IMP$Syntax$VBool(false),
																												$author$project$IMP$Syntax$VBool(false));
																										default:
																											break _v78$5;
																									}
																								}
																							default:
																								break _v78$5;
																						}
																					}
																					return _Utils_Tuple2(
																						$author$project$IMP$Syntax$VError('unsupported operation'),
																						$author$project$IMP$Syntax$VError('unsupported operation'));
																				default:
																					return _Utils_Tuple2(
																						$author$project$IMP$Syntax$VError('unsupported operation'),
																						$author$project$IMP$Syntax$VError('unsupported operation'));
																			}
																		}
																	case 'VHole':
																		var h = val.a;
																		return _Utils_Tuple2(v1, val);
																	default:
																		return _Utils_Tuple2(
																			$author$project$IMP$Syntax$VError('unsupported operation'),
																			$author$project$IMP$Syntax$VError('unsupported operation'));
																}
															} else {
																switch (val.$) {
																	case 'VBool':
																		if (!val.a) {
																			return _Utils_Tuple2(v1, v2);
																		} else {
																			switch (op) {
																				case '&&':
																					var _v83 = _Utils_Tuple2(v1, v2);
																					_v83$5:
																					while (true) {
																						switch (_v83.a.$) {
																							case 'VHole':
																								if ((_v83.b.$ === 'VBool') && _v83.b.a) {
																									var _v84 = _v83.a;
																									return _Utils_Tuple2(
																										$author$project$IMP$Syntax$VBool(true),
																										$author$project$IMP$Syntax$VBool(true));
																								} else {
																									break _v83$5;
																								}
																							case 'VBool':
																								if (!_v83.a.a) {
																									if (_v83.b.$ === 'VBool') {
																										if (!_v83.b.a) {
																											return _Utils_Tuple2(
																												$author$project$IMP$Syntax$VBool(true),
																												$author$project$IMP$Syntax$VBool(true));
																										} else {
																											return _Utils_Tuple2(
																												$author$project$IMP$Syntax$VBool(true),
																												$author$project$IMP$Syntax$VBool(true));
																										}
																									} else {
																										break _v83$5;
																									}
																								} else {
																									switch (_v83.b.$) {
																										case 'VBool':
																											if (!_v83.b.a) {
																												return _Utils_Tuple2(
																													$author$project$IMP$Syntax$VBool(true),
																													$author$project$IMP$Syntax$VBool(true));
																											} else {
																												break _v83$5;
																											}
																										case 'VHole':
																											var _v85 = _v83.b;
																											return _Utils_Tuple2(
																												$author$project$IMP$Syntax$VBool(true),
																												$author$project$IMP$Syntax$VBool(true));
																										default:
																											break _v83$5;
																									}
																								}
																							default:
																								break _v83$5;
																						}
																					}
																					return _Utils_Tuple2(
																						$author$project$IMP$Syntax$VError('unsupported operation'),
																						$author$project$IMP$Syntax$VError('unsupported operation'));
																				case '||':
																					var _v86 = _Utils_Tuple2(v1, v2);
																					if ((((_v86.a.$ === 'VBool') && (!_v86.a.a)) && (_v86.b.$ === 'VBool')) && (!_v86.b.a)) {
																						return _Utils_Tuple2(
																							$author$project$IMP$Syntax$VBool(true),
																							$author$project$IMP$Syntax$VBool(false));
																					} else {
																						return _Utils_Tuple2(
																							$author$project$IMP$Syntax$VError('unsupported operation'),
																							$author$project$IMP$Syntax$VError('unsupported operation'));
																					}
																				default:
																					return _Utils_Tuple2(
																						$author$project$IMP$Syntax$VError('unsupported operation'),
																						$author$project$IMP$Syntax$VError('unsupported operation'));
																			}
																		}
																	case 'VHole':
																		var h = val.a;
																		return _Utils_Tuple2(v1, val);
																	default:
																		return _Utils_Tuple2(
																			$author$project$IMP$Syntax$VError('unsupported operation'),
																			$author$project$IMP$Syntax$VError('unsupported operation'));
																}
															}
														default:
															return _Utils_Tuple2(
																$author$project$IMP$Syntax$VError('unsupported operation'),
																$author$project$IMP$Syntax$VError('unsupported operation'));
													}
												}();
												var newv1 = _v42.a;
												var newv2 = _v42.b;
												var _v87 = _Utils_Tuple2(newv1, newv2);
												if ((_v87.a.$ === 'VError') && (_v87.b.$ === 'VError')) {
													var s = _v87.a.a;
													return _Utils_Tuple3(
														_List_Nil,
														_List_Nil,
														_Utils_Tuple2(
															$author$project$IMP$Syntax$EError('logic: ' + s),
															0));
												} else {
													return $author$project$IMP$Uneval$checkChange(ws)(store)(holeBindings)(readOnly)(e1)(e2)(v1)(v2)(newv1)(newv2)(hcount)(op);
												}
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var $author$project$IMP$Uneval$uneval = F6(
	function (store, holeBindings, expr, readOnly, val, hcount) {
		switch (expr.$) {
			case 'ENot':
				var ws = expr.a;
				var e = expr.b;
				var v = A3($author$project$IMP$Eval$eval, store, holeBindings, e);
				var _v8 = _Utils_Tuple2(v, val);
				_v8$4:
				while (true) {
					switch (_v8.a.$) {
						case 'VHole':
							switch (_v8.b.$) {
								case 'VHole':
									var _v9 = _v8.a;
									var _v10 = _v8.b;
									return _Utils_Tuple3(
										store,
										holeBindings,
										_Utils_Tuple2(
											A2($author$project$IMP$Syntax$ENot, ws, e),
											hcount));
								case 'VBool':
									var _v13 = _v8.a;
									var b = _v8.b.a;
									var _v14 = A6(
										$author$project$IMP$Uneval$uneval,
										store,
										holeBindings,
										e,
										readOnly,
										$author$project$IMP$Syntax$VBool(!b),
										hcount);
									var newstore = _v14.a;
									var newhb = _v14.b;
									var _v15 = _v14.c;
									var newexpr = _v15.a;
									var hcount_ = _v15.b;
									return _Utils_Tuple3(
										newstore,
										newhb,
										_Utils_Tuple2(
											A2($author$project$IMP$Syntax$ENot, ws, newexpr),
											hcount_));
								default:
									break _v8$4;
							}
						case 'VBool':
							switch (_v8.b.$) {
								case 'VBool':
									var b1 = _v8.a.a;
									var b2 = _v8.b.a;
									if (!_Utils_eq(b1, b2)) {
										return _Utils_Tuple3(
											store,
											holeBindings,
											_Utils_Tuple2(
												A2($author$project$IMP$Syntax$ENot, ws, e),
												hcount));
									} else {
										var _v11 = A6(
											$author$project$IMP$Uneval$uneval,
											store,
											holeBindings,
											e,
											readOnly,
											$author$project$IMP$Syntax$VBool(!b2),
											hcount);
										var newstore = _v11.a;
										var newhb = _v11.b;
										var _v12 = _v11.c;
										var newexpr = _v12.a;
										var hcount_ = _v12.b;
										return _Utils_Tuple3(
											newstore,
											newhb,
											_Utils_Tuple2(
												A2($author$project$IMP$Syntax$ENot, ws, newexpr),
												hcount_));
									}
								case 'VHole':
									var _v16 = _v8.b;
									var _v17 = A6($author$project$IMP$Uneval$uneval, store, holeBindings, e, readOnly, val, hcount);
									var newstore = _v17.a;
									var newhb = _v17.b;
									var _v18 = _v17.c;
									var newexpr = _v18.a;
									var hcount_ = _v18.b;
									return _Utils_Tuple3(
										newstore,
										newhb,
										_Utils_Tuple2(
											A2($author$project$IMP$Syntax$ENot, ws, newexpr),
											hcount_));
								default:
									break _v8$4;
							}
						default:
							break _v8$4;
					}
				}
				return _Utils_Tuple3(
					_List_Nil,
					_List_Nil,
					_Utils_Tuple2(
						$author$project$IMP$Syntax$EError('unsupported value type for ENot'),
						0));
			case 'EParens':
				var ws = expr.a;
				var e = expr.b;
				var _v19 = A6($author$project$IMP$Uneval$uneval, store, holeBindings, e, readOnly, val, hcount);
				var newstore = _v19.a;
				var newhb = _v19.b;
				var _v20 = _v19.c;
				var newexpr = _v20.a;
				var hcount_ = _v20.b;
				return _Utils_Tuple3(
					newstore,
					newhb,
					_Utils_Tuple2(
						A2($author$project$IMP$Syntax$EParens, ws, newexpr),
						hcount_));
			case 'EHole':
				var u = expr.b;
				if (val.$ === 'VHole') {
					return _Utils_Tuple3(
						store,
						holeBindings,
						_Utils_Tuple2(expr, hcount));
				} else {
					return _Utils_Tuple3(
						store,
						A2(
							$author$project$IMP$Uneval$insertHB,
							_Utils_Tuple3(u, store, val),
							holeBindings),
						_Utils_Tuple2(expr, hcount));
				}
			case 'EVar':
				var x = expr.b;
				var oriv = A2($author$project$IMP$Utils$lookup, x, store);
				if (oriv.$ === 'Just') {
					var v = oriv.a;
					return _Utils_eq(v, val) ? _Utils_Tuple3(
						store,
						holeBindings,
						_Utils_Tuple2(expr, hcount)) : (A2($elm$core$Set$member, x, readOnly) ? _Utils_Tuple3(
						_List_Nil,
						_List_Nil,
						_Utils_Tuple2(
							$author$project$IMP$Syntax$EError('variable is read only'),
							0)) : _Utils_Tuple3(
						A3($author$project$IMP$Utils$updateStore, x, val, store),
						holeBindings,
						_Utils_Tuple2(expr, hcount)));
				} else {
					return _Utils_Tuple3(
						_List_Nil,
						_List_Nil,
						_Utils_Tuple2(
							$author$project$IMP$Syntax$EError('variable not found when updating'),
							0));
				}
			case 'EInt':
				var ws = expr.a;
				switch (val.$) {
					case 'VInt':
						var n_ = val.a;
						return _Utils_Tuple3(
							store,
							holeBindings,
							_Utils_Tuple2(
								A2($author$project$IMP$Syntax$EInt, ws, n_),
								hcount));
					case 'VHole':
						return _Utils_Tuple3(
							store,
							holeBindings,
							_Utils_Tuple2(
								A2(
									$author$project$IMP$Syntax$EHole,
									ws,
									$author$project$IMP$Syntax$HOri(hcount)),
								hcount + 1));
					default:
						return _Utils_Tuple3(
							_List_Nil,
							_List_Nil,
							_Utils_Tuple2(
								$author$project$IMP$Syntax$EError('unsupported value type for EInt'),
								0));
				}
			case 'EBool':
				var ws = expr.a;
				switch (val.$) {
					case 'VBool':
						var b_ = val.a;
						return _Utils_Tuple3(
							store,
							holeBindings,
							_Utils_Tuple2(
								A2($author$project$IMP$Syntax$EBool, ws, b_),
								hcount));
					case 'VHole':
						return _Utils_Tuple3(
							store,
							holeBindings,
							_Utils_Tuple2(
								A2(
									$author$project$IMP$Syntax$EHole,
									ws,
									$author$project$IMP$Syntax$HOri(hcount)),
								hcount + 1));
					default:
						return _Utils_Tuple3(
							_List_Nil,
							_List_Nil,
							_Utils_Tuple2(
								$author$project$IMP$Syntax$EError('unsupported value type for EBool'),
								0));
				}
			case 'EString':
				var ws = expr.a;
				switch (val.$) {
					case 'VString':
						var s_ = val.a;
						return _Utils_Tuple3(
							store,
							holeBindings,
							_Utils_Tuple2(
								A2($author$project$IMP$Syntax$EString, ws, s_),
								hcount));
					case 'VHole':
						return _Utils_Tuple3(
							store,
							holeBindings,
							_Utils_Tuple2(
								A2(
									$author$project$IMP$Syntax$EHole,
									ws,
									$author$project$IMP$Syntax$HOri(hcount)),
								hcount + 1));
					default:
						return _Utils_Tuple3(
							_List_Nil,
							_List_Nil,
							_Utils_Tuple2(
								$author$project$IMP$Syntax$EError('unsupported value type for EString'),
								0));
				}
			case 'Eop':
				var ws = expr.a;
				var op = expr.b;
				var e1 = expr.c;
				var e2 = expr.d;
				var logic_ = A8($author$project$IMP$Uneval$logic, ws, e1, e2, holeBindings, store, readOnly, val, hcount);
				var comp_ = A8($author$project$IMP$Uneval$comp, ws, e1, e2, holeBindings, store, readOnly, val, hcount);
				var arith_ = A8($author$project$IMP$Uneval$arith, ws, e1, e2, holeBindings, store, readOnly, val, hcount);
				switch (op) {
					case '+':
						return arith_('+');
					case '-':
						return arith_('-');
					case '*':
						return arith_('*');
					case '/':
						return arith_('/');
					case '==':
						return comp_('==');
					case '!=':
						return comp_('!=');
					case '<':
						return comp_('<');
					case '>':
						return comp_('>');
					case '<=':
						return comp_('<=');
					case '>=':
						return comp_('>=');
					case '&&':
						return logic_('&&');
					case '||':
						return logic_('||');
					case '++':
						return arith_('++');
					default:
						return _Utils_Tuple3(
							_List_Nil,
							_List_Nil,
							_Utils_Tuple2(
								$author$project$IMP$Syntax$EError('unsupported operation'),
								0));
				}
			case 'EError':
				var s = expr.a;
				return _Utils_Tuple3(
					_List_Nil,
					_List_Nil,
					_Utils_Tuple2(
						$author$project$IMP$Syntax$EError(s),
						0));
			case 'EList':
				var ws = expr.a;
				var es = expr.b;
				switch (val.$) {
					case 'VList':
						var vs = val.a;
						if (_Utils_eq(
							$elm$core$List$length(vs),
							$elm$core$List$length(es))) {
							var _v28 = A6($author$project$IMP$Uneval$unevalList, store, holeBindings, readOnly, es, vs, hcount);
							var newstore = _v28.a;
							var newhb = _v28.b;
							var _v29 = _v28.c;
							var newexprs = _v29.a;
							var hcount_ = _v29.b;
							return _Utils_Tuple3(
								newstore,
								newhb,
								_Utils_Tuple2(
									A2($author$project$IMP$Syntax$EList, ws, newexprs),
									hcount_));
						} else {
							if (_Utils_cmp(
								$elm$core$List$length(vs),
								$elm$core$List$length(es)) > 0) {
								var _v30 = A6(
									$author$project$IMP$Uneval$unevalList,
									store,
									holeBindings,
									readOnly,
									es,
									A2(
										$elm$core$List$take,
										$elm$core$List$length(es),
										vs),
									hcount);
								var newstore = _v30.a;
								var newhb = _v30.b;
								var _v31 = _v30.c;
								var newexprs = _v31.a;
								var hcount_ = _v31.b;
								return _Utils_Tuple3(
									newstore,
									newhb,
									_Utils_Tuple2(
										A2(
											$author$project$IMP$Syntax$EList,
											ws,
											_Utils_ap(
												newexprs,
												A2(
													$elm$core$List$map,
													$author$project$IMP$Utils$value2Expr,
													A2(
														$elm$core$List$drop,
														$elm$core$List$length(es),
														vs)))),
										hcount_));
							} else {
								var _v32 = A6(
									$author$project$IMP$Uneval$unevalList,
									store,
									holeBindings,
									readOnly,
									A2(
										$elm$core$List$take,
										$elm$core$List$length(vs),
										es),
									vs,
									hcount);
								var newstore = _v32.a;
								var newhb = _v32.b;
								var _v33 = _v32.c;
								var newexprs = _v33.a;
								var hcount_ = _v33.b;
								return _Utils_Tuple3(
									newstore,
									newhb,
									_Utils_Tuple2(
										A2($author$project$IMP$Syntax$EList, ws, newexprs),
										hcount_));
							}
						}
					case 'VHole':
						return _Utils_Tuple3(
							store,
							holeBindings,
							_Utils_Tuple2(
								A2(
									$author$project$IMP$Syntax$EHole,
									ws,
									$author$project$IMP$Syntax$HOri(hcount)),
								hcount + 1));
					default:
						return _Utils_Tuple3(
							_List_Nil,
							_List_Nil,
							_Utils_Tuple2(
								$author$project$IMP$Syntax$EError('unsupported value type for EList'),
								0));
				}
			case 'EIndex':
				var _v34 = A3($author$project$IMP$Eval$findIndex, store, holeBindings, expr);
				var x = _v34.a;
				var path = _v34.b;
				switch (path.$) {
					case 'VHole':
						return _Utils_Tuple3(
							store,
							holeBindings,
							_Utils_Tuple2(expr, hcount));
					case 'VList':
						if (x === 'error') {
							return _Utils_Tuple3(
								_List_Nil,
								_List_Nil,
								_Utils_Tuple2(
									$author$project$IMP$Syntax$EError('error'),
									0));
						} else {
							if (A2($elm$core$Set$member, x, readOnly)) {
								return _Utils_Tuple3(
									_List_Nil,
									_List_Nil,
									_Utils_Tuple2(
										$author$project$IMP$Syntax$EError('variable is read only'),
										0));
							} else {
								var _v36 = A2($author$project$IMP$Utils$lookup, x, store);
								if (_v36.$ === 'Just') {
									if (_v36.a.$ === 'VHole') {
										var _v37 = _v36.a;
										return _Utils_Tuple3(
											store,
											holeBindings,
											_Utils_Tuple2(expr, hcount));
									} else {
										var xv = _v36.a;
										var newx = A3($author$project$IMP$Uneval$writeIndexValue, path, xv, val);
										if (newx.$ === 'VError') {
											return _Utils_Tuple3(
												store,
												holeBindings,
												_Utils_Tuple2(expr, hcount));
										} else {
											return _Utils_Tuple3(
												A3($author$project$IMP$Utils$updateStore, x, newx, store),
												holeBindings,
												_Utils_Tuple2(expr, hcount));
										}
									}
								} else {
									return _Utils_Tuple3(
										_List_Nil,
										_List_Nil,
										_Utils_Tuple2(
											$author$project$IMP$Syntax$EError('variable not found when updating'),
											0));
								}
							}
						}
					default:
						return _Utils_Tuple3(
							_List_Nil,
							_List_Nil,
							_Utils_Tuple2(
								$author$project$IMP$Syntax$EError('unsupported expression'),
								0));
				}
			default:
				var ws = expr.a;
				var e = expr.b;
				var v = A3($author$project$IMP$Eval$eval, store, holeBindings, e);
				var _v39 = _Utils_Tuple2(v, val);
				_v39$3:
				while (true) {
					switch (_v39.b.$) {
						case 'VInt':
							switch (_v39.a.$) {
								case 'VString':
									var s = _v39.a.a;
									var n = _v39.b.a;
									return _Utils_eq(
										n,
										$elm$core$String$length(s)) ? _Utils_Tuple3(
										store,
										holeBindings,
										_Utils_Tuple2(expr, hcount)) : _Utils_Tuple3(
										_List_Nil,
										_List_Nil,
										_Utils_Tuple2(
											$author$project$IMP$Syntax$EError('length mismatch'),
											0));
								case 'VList':
									var vs = _v39.a.a;
									var n = _v39.b.a;
									return _Utils_eq(
										n,
										$elm$core$List$length(vs)) ? _Utils_Tuple3(
										store,
										holeBindings,
										_Utils_Tuple2(expr, hcount)) : _Utils_Tuple3(
										_List_Nil,
										_List_Nil,
										_Utils_Tuple2(
											$author$project$IMP$Syntax$EError('length mismatch'),
											0));
								default:
									break _v39$3;
							}
						case 'VHole':
							if (_v39.a.$ === 'VHole') {
								var _v40 = _v39.a;
								var _v41 = _v39.b;
								return _Utils_Tuple3(
									store,
									holeBindings,
									_Utils_Tuple2(expr, hcount));
							} else {
								break _v39$3;
							}
						default:
							break _v39$3;
					}
				}
				return _Utils_Tuple3(
					_List_Nil,
					_List_Nil,
					_Utils_Tuple2(
						$author$project$IMP$Syntax$EError('unsupported update for list length'),
						0));
		}
	});
var $author$project$IMP$Uneval$unevalList = F6(
	function (store, holeBindings, readOnly, es, vs, hcount) {
		var _v0 = _Utils_Tuple2(es, vs);
		if (_v0.a.b && _v0.b.b) {
			var _v1 = _v0.a;
			var e = _v1.a;
			var es_ = _v1.b;
			var _v2 = _v0.b;
			var v = _v2.a;
			var vs_ = _v2.b;
			var _v3 = A6($author$project$IMP$Uneval$unevalList, store, holeBindings, readOnly, es_, vs_, hcount);
			var storeTail = _v3.a;
			var hbTail = _v3.b;
			var _v4 = _v3.c;
			var exprs = _v4.a;
			var hcount_ = _v4.b;
			var _v5 = A6($author$project$IMP$Uneval$uneval, store, holeBindings, e, readOnly, v, hcount_);
			var storeHead = _v5.a;
			var hbHead = _v5.b;
			var _v6 = _v5.c;
			var eexpr = _v6.a;
			var hcount__ = _v6.b;
			return _Utils_Tuple3(
				A3($author$project$IMP$Uneval$mergeStore, storeHead, storeTail, store),
				A3($author$project$IMP$Uneval$mergeHoleBindings, hbHead, hbTail, holeBindings),
				_Utils_Tuple2(
					A2($elm$core$List$cons, eexpr, exprs),
					hcount__));
		} else {
			return _Utils_Tuple3(
				store,
				holeBindings,
				_Utils_Tuple2(_List_Nil, hcount));
		}
	});
var $author$project$IMP$Utils$dropOutputRoundCell = F2(
	function (vs, scount) {
		return A2(
			$elm$core$List$filter,
			function (v) {
				if (v.$ === 'VHole') {
					var h = v.a;
					var id = v.b;
					return !(_Utils_eq(id, scount) && $author$project$IMP$Utils$isOutputSuffixHole(h));
				} else {
					return true;
				}
			},
			vs);
	});
var $author$project$IMP$Uneval$unpollute = F3(
	function (store, oristore, scount) {
		unpollute:
		while (true) {
			_v0$2:
			while (true) {
				if (store.b) {
					switch (store.a.b.$) {
						case 'VList':
							if (store.a.a === 'output') {
								var _v1 = store.a;
								var vs = _v1.b.a;
								var store_ = store.b;
								return A2(
									$elm$core$List$cons,
									_Utils_Tuple2(
										'output',
										$author$project$IMP$Syntax$VList(
											A2($author$project$IMP$Utils$dropOutputRoundCell, vs, scount))),
									A3($author$project$IMP$Uneval$unpollute, store_, oristore, scount));
							} else {
								break _v0$2;
							}
						case 'VHole':
							if (store.a.b.a.$ === 'HVar') {
								var _v2 = store.a;
								var x = _v2.a;
								var _v3 = _v2.b;
								var x_ = _v3.a.a;
								var id = _v3.b;
								var store_ = store.b;
								if (_Utils_eq(x_, x) && _Utils_eq(id, scount)) {
									var _v4 = A2($author$project$IMP$Utils$lookup, x, oristore);
									if (_v4.$ === 'Just') {
										var v = _v4.a;
										return A2(
											$elm$core$List$cons,
											_Utils_Tuple2(x, v),
											A3($author$project$IMP$Uneval$unpollute, store_, oristore, scount));
									} else {
										var $temp$store = store_,
											$temp$oristore = oristore,
											$temp$scount = scount;
										store = $temp$store;
										oristore = $temp$oristore;
										scount = $temp$scount;
										continue unpollute;
									}
								} else {
									return A2(
										$elm$core$List$cons,
										_Utils_Tuple2(
											x,
											A2(
												$author$project$IMP$Syntax$VHole,
												$author$project$IMP$Syntax$HVar(x_),
												id)),
										A3($author$project$IMP$Uneval$unpollute, store_, oristore, scount));
								}
							} else {
								break _v0$2;
							}
						default:
							break _v0$2;
					}
				} else {
					return _List_Nil;
				}
			}
			var _v5 = store.a;
			var x = _v5.a;
			var v = _v5.b;
			var store_ = store.b;
			return A2(
				$elm$core$List$cons,
				_Utils_Tuple2(x, v),
				A3($author$project$IMP$Uneval$unpollute, store_, oristore, scount));
		}
	});
var $author$project$IMP$Utils$updateFuncEnv = F3(
	function (name, body, env) {
		return A2(
			$elm$core$List$map,
			function (f) {
				return _Utils_eq(f.name, name) ? _Utils_update(
					f,
					{body: body}) : f;
			},
			env);
	});
var $author$project$IMP$Uneval$unexec = F9(
	function (funcEnv, store, holeBindings, riStmts, readOnly, stmt, hcount, scount, _v12) {
		var newstore = _v12.a;
		var newriStmts = _v12.b;
		var _v13 = A2(
			$author$project$IMP$Uneval$traceLog,
			'UNEXEC',
			$author$project$IMP$Uneval$stmtTag(stmt) + (' scount=' + ($elm$core$String$fromInt(scount) + ('\n  old.keys ' + ($author$project$IMP$Uneval$storeKeys(store) + ('\n  new.keys ' + ($author$project$IMP$Uneval$storeKeys(newstore) + ('\n  old ' + ($author$project$IMP$Uneval$fmtStore(store) + ('\n  new ' + $author$project$IMP$Uneval$fmtStore(newstore)))))))))));
		switch (stmt.$) {
			case 'SAssign':
				var ws = stmt.a;
				var e1 = stmt.b;
				var e2 = stmt.c;
				switch (e1.$) {
					case 'EVar':
						var ws1 = e1.a;
						var x = e1.b;
						var newval = A2($author$project$IMP$Utils$lookup, x, newstore);
						var val = A3($author$project$IMP$Eval$eval, store, holeBindings, e2);
						var oldval = A2($author$project$IMP$Utils$lookup, x, store);
						var _v16 = _Utils_Tuple3(val, newval, oldval);
						if (_v16.b.$ === 'Just') {
							if (_v16.c.$ === 'Just') {
								switch (_v16.a.$) {
									case 'VHole':
										var _v17 = _v16.a;
										var nv = _v16.b.a;
										var ov = _v16.c.a;
										if ((nv.$ === 'VHole') && (nv.a.$ === 'HVar')) {
											var x_ = nv.a.a;
											var id_ = nv.b;
											if (_Utils_eq(x_, x) && _Utils_eq(id_, scount)) {
												var userstore = $author$project$IMP$Uneval$getFinalRiStmtStore(newriStmts);
												return {
													funcEnv: funcEnv,
													hcount: hcount,
													holeBindings: holeBindings,
													riStmts: A2(
														$elm$core$List$take,
														$elm$core$List$length(newriStmts) - 1,
														newriStmts),
													stmt: stmt,
													store: A3(
														$author$project$IMP$Uneval$mergeStore,
														userstore,
														A3($author$project$IMP$Utils$updateStore, x, ov, newstore),
														store)
												};
											} else {
												var userstore = $author$project$IMP$Uneval$getFinalRiStmtStore(newriStmts);
												var _v19 = A6(
													$author$project$IMP$Uneval$uneval,
													A3($author$project$IMP$Utils$updateStore, x, ov, newstore),
													holeBindings,
													e2,
													readOnly,
													nv,
													hcount);
												var finalstore = _v19.a;
												var newhb = _v19.b;
												var _v20 = _v19.c;
												var newexpr = _v20.a;
												var hcount_ = _v20.b;
												return {
													funcEnv: funcEnv,
													hcount: hcount_,
													holeBindings: newhb,
													riStmts: A2(
														$elm$core$List$take,
														$elm$core$List$length(newriStmts) - 1,
														newriStmts),
													stmt: A3(
														$author$project$IMP$Syntax$SAssign,
														ws,
														A2($author$project$IMP$Syntax$EVar, ws1, x),
														newexpr),
													store: A3($author$project$IMP$Uneval$mergeStore, userstore, finalstore, store)
												};
											}
										} else {
											var userstore = $author$project$IMP$Uneval$getFinalRiStmtStore(newriStmts);
											var _v21 = A6(
												$author$project$IMP$Uneval$uneval,
												A3($author$project$IMP$Utils$updateStore, x, ov, newstore),
												holeBindings,
												e2,
												readOnly,
												nv,
												hcount);
											var finalstore = _v21.a;
											var newhb = _v21.b;
											var _v22 = _v21.c;
											var newexpr = _v22.a;
											var hcount_ = _v22.b;
											return {
												funcEnv: funcEnv,
												hcount: hcount_,
												holeBindings: newhb,
												riStmts: A2(
													$elm$core$List$take,
													$elm$core$List$length(newriStmts) - 1,
													newriStmts),
												stmt: A3(
													$author$project$IMP$Syntax$SAssign,
													ws,
													A2($author$project$IMP$Syntax$EVar, ws1, x),
													newexpr),
												store: A3($author$project$IMP$Uneval$mergeStore, userstore, finalstore, store)
											};
										}
									case 'VList':
										var vs = _v16.a.a;
										var nv = _v16.b.a;
										var ov = _v16.c.a;
										if ($author$project$IMP$Utils$hasHole(vs)) {
											var userstore = $author$project$IMP$Uneval$getFinalRiStmtStore(newriStmts);
											var _v23 = A6(
												$author$project$IMP$Uneval$uneval,
												A3($author$project$IMP$Utils$updateStore, x, ov, newstore),
												holeBindings,
												e2,
												readOnly,
												nv,
												hcount);
											var finalstore = _v23.a;
											var newhb = _v23.b;
											var _v24 = _v23.c;
											var newexpr = _v24.a;
											var hcount_ = _v24.b;
											return {
												funcEnv: funcEnv,
												hcount: hcount_,
												holeBindings: newhb,
												riStmts: A2(
													$elm$core$List$take,
													$elm$core$List$length(newriStmts) - 1,
													newriStmts),
												stmt: A3(
													$author$project$IMP$Syntax$SAssign,
													ws,
													A2($author$project$IMP$Syntax$EVar, ws1, x),
													newexpr),
												store: A3($author$project$IMP$Uneval$mergeStore, userstore, finalstore, store)
											};
										} else {
											var _v25 = A6(
												$author$project$IMP$Uneval$uneval,
												A3($author$project$IMP$Utils$updateStore, x, ov, newstore),
												holeBindings,
												e2,
												readOnly,
												nv,
												hcount);
											var finalstore = _v25.a;
											var newhb = _v25.b;
											var _v26 = _v25.c;
											var newexpr = _v26.a;
											var hcount_ = _v26.b;
											return {
												funcEnv: funcEnv,
												hcount: hcount_,
												holeBindings: newhb,
												riStmts: newriStmts,
												stmt: A3(
													$author$project$IMP$Syntax$SAssign,
													ws,
													A2($author$project$IMP$Syntax$EVar, ws1, x),
													newexpr),
												store: finalstore
											};
										}
									default:
										var nv = _v16.b.a;
										var ov = _v16.c.a;
										var _v27 = A6(
											$author$project$IMP$Uneval$uneval,
											A3($author$project$IMP$Utils$updateStore, x, ov, newstore),
											holeBindings,
											e2,
											readOnly,
											nv,
											hcount);
										var finalstore = _v27.a;
										var newhb = _v27.b;
										var _v28 = _v27.c;
										var newexpr = _v28.a;
										var hcount_ = _v28.b;
										return {
											funcEnv: funcEnv,
											hcount: hcount_,
											holeBindings: newhb,
											riStmts: newriStmts,
											stmt: A3(
												$author$project$IMP$Syntax$SAssign,
												ws,
												A2($author$project$IMP$Syntax$EVar, ws1, x),
												newexpr),
											store: finalstore
										};
								}
							} else {
								switch (_v16.a.$) {
									case 'VHole':
										var _v29 = _v16.a;
										var nv = _v16.b.a;
										var _v30 = _v16.c;
										if ((nv.$ === 'VHole') && (nv.a.$ === 'HVar')) {
											var x_ = nv.a.a;
											var id_ = nv.b;
											if (_Utils_eq(x_, x) && _Utils_eq(id_, scount)) {
												var userstore = $author$project$IMP$Uneval$getFinalRiStmtStore(newriStmts);
												return {
													funcEnv: funcEnv,
													hcount: hcount,
													holeBindings: holeBindings,
													riStmts: A2(
														$elm$core$List$take,
														$elm$core$List$length(newriStmts) - 1,
														newriStmts),
													stmt: stmt,
													store: A3(
														$author$project$IMP$Uneval$mergeStore,
														userstore,
														A2($author$project$IMP$Utils$delStore, x, newstore),
														store)
												};
											} else {
												var userstore = $author$project$IMP$Uneval$getFinalRiStmtStore(newriStmts);
												var _v32 = A6(
													$author$project$IMP$Uneval$uneval,
													A2($author$project$IMP$Utils$delStore, x, newstore),
													holeBindings,
													e2,
													readOnly,
													nv,
													hcount);
												var finalstore = _v32.a;
												var newhb = _v32.b;
												var _v33 = _v32.c;
												var newexpr = _v33.a;
												var hcount_ = _v33.b;
												return {
													funcEnv: funcEnv,
													hcount: hcount_,
													holeBindings: newhb,
													riStmts: A2(
														$elm$core$List$take,
														$elm$core$List$length(newriStmts) - 1,
														newriStmts),
													stmt: A3(
														$author$project$IMP$Syntax$SAssign,
														ws,
														A2($author$project$IMP$Syntax$EVar, ws1, x),
														newexpr),
													store: A3($author$project$IMP$Uneval$mergeStore, userstore, finalstore, store)
												};
											}
										} else {
											var userstore = $author$project$IMP$Uneval$getFinalRiStmtStore(newriStmts);
											var _v34 = A6(
												$author$project$IMP$Uneval$uneval,
												A2($author$project$IMP$Utils$delStore, x, newstore),
												holeBindings,
												e2,
												readOnly,
												nv,
												hcount);
											var finalstore = _v34.a;
											var newhb = _v34.b;
											var _v35 = _v34.c;
											var newexpr = _v35.a;
											var hcount_ = _v35.b;
											return {
												funcEnv: funcEnv,
												hcount: hcount_,
												holeBindings: newhb,
												riStmts: A2(
													$elm$core$List$take,
													$elm$core$List$length(newriStmts) - 1,
													newriStmts),
												stmt: A3(
													$author$project$IMP$Syntax$SAssign,
													ws,
													A2($author$project$IMP$Syntax$EVar, ws1, x),
													newexpr),
												store: A3($author$project$IMP$Uneval$mergeStore, userstore, finalstore, store)
											};
										}
									case 'VList':
										var vs = _v16.a.a;
										var nv = _v16.b.a;
										var _v36 = _v16.c;
										if ($author$project$IMP$Utils$hasHole(vs)) {
											var userstore = $author$project$IMP$Uneval$getFinalRiStmtStore(newriStmts);
											var _v37 = A6(
												$author$project$IMP$Uneval$uneval,
												A2($author$project$IMP$Utils$delStore, x, newstore),
												holeBindings,
												e2,
												readOnly,
												nv,
												hcount);
											var finalstore = _v37.a;
											var newhb = _v37.b;
											var _v38 = _v37.c;
											var newexpr = _v38.a;
											var hcount_ = _v38.b;
											return {
												funcEnv: funcEnv,
												hcount: hcount_,
												holeBindings: newhb,
												riStmts: A2(
													$elm$core$List$take,
													$elm$core$List$length(newriStmts) - 1,
													newriStmts),
												stmt: A3(
													$author$project$IMP$Syntax$SAssign,
													ws,
													A2($author$project$IMP$Syntax$EVar, ws1, x),
													newexpr),
												store: A3($author$project$IMP$Uneval$mergeStore, userstore, finalstore, store)
											};
										} else {
											var _v39 = A6(
												$author$project$IMP$Uneval$uneval,
												A2($author$project$IMP$Utils$delStore, x, newstore),
												holeBindings,
												e2,
												readOnly,
												nv,
												hcount);
											var finalstore = _v39.a;
											var newhb = _v39.b;
											var _v40 = _v39.c;
											var newexpr = _v40.a;
											var hcount_ = _v40.b;
											return {
												funcEnv: funcEnv,
												hcount: hcount_,
												holeBindings: newhb,
												riStmts: newriStmts,
												stmt: A3(
													$author$project$IMP$Syntax$SAssign,
													ws,
													A2($author$project$IMP$Syntax$EVar, ws1, x),
													newexpr),
												store: finalstore
											};
										}
									default:
										var nv = _v16.b.a;
										var _v41 = _v16.c;
										var _v42 = A6(
											$author$project$IMP$Uneval$uneval,
											A2($author$project$IMP$Utils$delStore, x, newstore),
											holeBindings,
											e2,
											readOnly,
											nv,
											hcount);
										var finalstore = _v42.a;
										var newhb = _v42.b;
										var _v43 = _v42.c;
										var newexpr = _v43.a;
										var hcount_ = _v43.b;
										return {
											funcEnv: funcEnv,
											hcount: hcount_,
											holeBindings: newhb,
											riStmts: newriStmts,
											stmt: A3(
												$author$project$IMP$Syntax$SAssign,
												ws,
												A2($author$project$IMP$Syntax$EVar, ws1, x),
												newexpr),
											store: finalstore
										};
								}
							}
						} else {
							return _Utils_update(
								$author$project$IMP$Uneval$defaultUnexecRes,
								{
									funcEnv: funcEnv,
									stmt: $author$project$IMP$Syntax$SError('Error: unexecStmt: SAssign: newval not found')
								});
						}
					case 'EIndex':
						var _v44 = A3($author$project$IMP$Eval$findIndex, store, holeBindings, e1);
						var x = _v44.a;
						var path = _v44.b;
						var oldv = A2($author$project$IMP$Utils$lookup, x, store);
						var newv = A2($author$project$IMP$Utils$lookup, x, newstore);
						var val = A3($author$project$IMP$Eval$eval, store, holeBindings, e2);
						var _v45 = _Utils_Tuple3(path, oldv, newv);
						if ((_v45.b.$ === 'Just') && (_v45.c.$ === 'Just')) {
							switch (_v45.a.$) {
								case 'VHole':
									var _v46 = _v45.a;
									var ov = _v45.b.a;
									var userstore = $author$project$IMP$Uneval$getFinalRiStmtStore(newriStmts);
									return {
										funcEnv: funcEnv,
										hcount: hcount,
										holeBindings: holeBindings,
										riStmts: A2(
											$elm$core$List$take,
											$elm$core$List$length(newriStmts) - 1,
											newriStmts),
										stmt: stmt,
										store: A3(
											$author$project$IMP$Uneval$mergeStore,
											userstore,
											A3($author$project$IMP$Utils$updateStore, x, ov, newstore),
											store)
									};
								case 'VList':
									if (_v45.b.a.$ === 'VHole') {
										var ov = _v45.b.a;
										var userstore = $author$project$IMP$Uneval$getFinalRiStmtStore(newriStmts);
										return {
											funcEnv: funcEnv,
											hcount: hcount,
											holeBindings: holeBindings,
											riStmts: A2(
												$elm$core$List$take,
												$elm$core$List$length(newriStmts) - 1,
												newriStmts),
											stmt: stmt,
											store: A3(
												$author$project$IMP$Uneval$mergeStore,
												userstore,
												A3($author$project$IMP$Utils$updateStore, x, ov, newstore),
												store)
										};
									} else {
										var p = _v45.a.a;
										var ov = _v45.b.a;
										var nv = _v45.c.a;
										var vprime = A2(
											$author$project$IMP$Utils$findVal,
											$author$project$IMP$Syntax$VList(p),
											nv);
										var vo = A2(
											$author$project$IMP$Utils$findVal,
											$author$project$IMP$Syntax$VList(p),
											ov);
										var userstore = $author$project$IMP$Uneval$getFinalRiStmtStore(newriStmts);
										var store1 = A3(
											$author$project$IMP$Utils$updateStore,
											x,
											A3(
												$author$project$IMP$Utils$updateValue,
												$author$project$IMP$Syntax$VList(p),
												nv,
												vo),
											newstore);
										var pop = A2(
											$elm$core$List$take,
											$elm$core$List$length(newriStmts) - 1,
											newriStmts);
										var _v47 = _Utils_Tuple2(val, vprime);
										switch (_v47.a.$) {
											case 'VHole':
												if (_v47.b.$ === 'VHole') {
													var _v48 = _v47.a;
													var _v49 = _v47.b;
													var id = _v49.b;
													if (_Utils_eq(id, scount)) {
														return {
															funcEnv: funcEnv,
															hcount: hcount,
															holeBindings: holeBindings,
															riStmts: pop,
															stmt: stmt,
															store: A3($author$project$IMP$Uneval$mergeStore, userstore, store1, store)
														};
													} else {
														var _v50 = A6($author$project$IMP$Uneval$uneval, store1, holeBindings, e2, readOnly, vprime, hcount);
														var finalstore = _v50.a;
														var newhb = _v50.b;
														var _v51 = _v50.c;
														var newexpr = _v51.a;
														var hcount_ = _v51.b;
														return {
															funcEnv: funcEnv,
															hcount: hcount_,
															holeBindings: newhb,
															riStmts: pop,
															stmt: A3($author$project$IMP$Syntax$SAssign, ws, e1, newexpr),
															store: A3($author$project$IMP$Uneval$mergeStore, userstore, finalstore, store)
														};
													}
												} else {
													var _v52 = _v47.a;
													var _v53 = A6($author$project$IMP$Uneval$uneval, store1, holeBindings, e2, readOnly, vprime, hcount);
													var finalstore = _v53.a;
													var newhb = _v53.b;
													var _v54 = _v53.c;
													var newexpr = _v54.a;
													var hcount_ = _v54.b;
													return {
														funcEnv: funcEnv,
														hcount: hcount_,
														holeBindings: newhb,
														riStmts: pop,
														stmt: A3($author$project$IMP$Syntax$SAssign, ws, e1, newexpr),
														store: A3($author$project$IMP$Uneval$mergeStore, userstore, finalstore, store)
													};
												}
											case 'VList':
												var vs = _v47.a.a;
												if ($author$project$IMP$Utils$hasHole(vs)) {
													var _v55 = A6($author$project$IMP$Uneval$uneval, store1, holeBindings, e2, readOnly, vprime, hcount);
													var finalstore = _v55.a;
													var newhb = _v55.b;
													var _v56 = _v55.c;
													var newexpr = _v56.a;
													var hcount_ = _v56.b;
													return {
														funcEnv: funcEnv,
														hcount: hcount_,
														holeBindings: newhb,
														riStmts: pop,
														stmt: A3($author$project$IMP$Syntax$SAssign, ws, e1, newexpr),
														store: A3($author$project$IMP$Uneval$mergeStore, userstore, finalstore, store)
													};
												} else {
													var _v57 = A6($author$project$IMP$Uneval$uneval, store1, holeBindings, e2, readOnly, vprime, hcount);
													var finalstore = _v57.a;
													var newhb = _v57.b;
													var _v58 = _v57.c;
													var newexpr = _v58.a;
													var hcount_ = _v58.b;
													return {
														funcEnv: funcEnv,
														hcount: hcount_,
														holeBindings: newhb,
														riStmts: newriStmts,
														stmt: A3($author$project$IMP$Syntax$SAssign, ws, e1, newexpr),
														store: finalstore
													};
												}
											default:
												var _v59 = A6($author$project$IMP$Uneval$uneval, store1, holeBindings, e2, readOnly, vprime, hcount);
												var finalstore = _v59.a;
												var newhb = _v59.b;
												var _v60 = _v59.c;
												var newexpr = _v60.a;
												var hcount_ = _v60.b;
												return {
													funcEnv: funcEnv,
													hcount: hcount_,
													holeBindings: newhb,
													riStmts: newriStmts,
													stmt: A3($author$project$IMP$Syntax$SAssign, ws, e1, newexpr),
													store: finalstore
												};
										}
									}
								default:
									var ov = _v45.b.a;
									var userstore = $author$project$IMP$Uneval$getFinalRiStmtStore(newriStmts);
									return {
										funcEnv: funcEnv,
										hcount: hcount,
										holeBindings: holeBindings,
										riStmts: A2(
											$elm$core$List$take,
											$elm$core$List$length(newriStmts) - 1,
											newriStmts),
										stmt: stmt,
										store: A3(
											$author$project$IMP$Uneval$mergeStore,
											userstore,
											A3($author$project$IMP$Utils$updateStore, x, ov, newstore),
											store)
									};
							}
						} else {
							return {funcEnv: funcEnv, hcount: hcount, holeBindings: holeBindings, riStmts: newriStmts, stmt: stmt, store: newstore};
						}
					default:
						return _Utils_update(
							$author$project$IMP$Uneval$defaultUnexecRes,
							{
								funcEnv: funcEnv,
								stmt: $author$project$IMP$Syntax$SError('Error: unexecStmt: SAssign: unsupported lhs')
							});
				}
			case 'SSkip':
				return {funcEnv: funcEnv, hcount: hcount, holeBindings: holeBindings, riStmts: newriStmts, stmt: stmt, store: newstore};
			case 'SSeq':
				var ws = stmt.a;
				var s1 = stmt.b;
				var s2 = stmt.c;
				var fres1 = A7($author$project$IMP$Eval$exec, funcEnv, store, holeBindings, riStmts, s1, readOnly, scount);
				var bres2 = A9(
					$author$project$IMP$Uneval$unexec,
					funcEnv,
					fres1.store,
					holeBindings,
					fres1.riStmts,
					fres1.readOnly,
					s2,
					hcount,
					fres1.scount,
					_Utils_Tuple2(newstore, newriStmts));
				var bres1 = A9(
					$author$project$IMP$Uneval$unexec,
					funcEnv,
					store,
					bres2.holeBindings,
					bres2.riStmts,
					readOnly,
					s1,
					bres2.hcount,
					scount,
					_Utils_Tuple2(bres2.store, bres2.riStmts));
				return {
					funcEnv: A3($author$project$IMP$Utils$mergeFuncEnv, bres1.funcEnv, bres2.funcEnv, funcEnv),
					hcount: bres1.hcount,
					holeBindings: bres1.holeBindings,
					riStmts: bres1.riStmts,
					stmt: A3($author$project$IMP$Syntax$SSeq, ws, bres1.stmt, bres2.stmt),
					store: bres1.store
				};
			case 'SRead':
				var ws = stmt.a;
				var x = stmt.b;
				var newinput = A2($author$project$IMP$Utils$lookup, 'input', newstore);
				var oldinput = A2($author$project$IMP$Utils$lookup, 'input', store);
				var newx = A2($author$project$IMP$Utils$lookup, x, newstore);
				var oldx = A2($author$project$IMP$Utils$lookup, x, store);
				var _v61 = _Utils_Tuple2(newinput, oldinput);
				_v61$2:
				while (true) {
					if ((_v61.a.$ === 'Just') && (_v61.b.$ === 'Just')) {
						switch (_v61.a.a.$) {
							case 'VHole':
								if (((((_v61.a.a.a.$ === 'HVar') && (_v61.a.a.a.a === 'input')) && (_v61.b.a.$ === 'VHole')) && (_v61.b.a.a.$ === 'HVar')) && (_v61.b.a.a.a === 'input')) {
									var _v62 = _v61.a.a;
									var newid = _v62.b;
									var _v63 = _v61.b.a;
									var id = _v63.b;
									if (newx.$ === 'Just') {
										var v = newx.a;
										if (_Utils_eq(newid, scount) && _Utils_eq(
											v,
											A2(
												$author$project$IMP$Syntax$VHole,
												$author$project$IMP$Syntax$HVar(x),
												scount))) {
											if (oldx.$ === 'Just') {
												var ov = oldx.a;
												var userstore = $author$project$IMP$Uneval$getFinalRiStmtStore(newriStmts);
												var store_ = A3($author$project$IMP$Utils$updateStore, x, ov, newstore);
												return {
													funcEnv: funcEnv,
													hcount: hcount,
													holeBindings: holeBindings,
													riStmts: A2(
														$elm$core$List$take,
														$elm$core$List$length(newriStmts) - 1,
														newriStmts),
													stmt: stmt,
													store: A3(
														$author$project$IMP$Uneval$mergeStore,
														userstore,
														A3(
															$author$project$IMP$Utils$updateStore,
															'input',
															A2(
																$author$project$IMP$Syntax$VHole,
																$author$project$IMP$Syntax$HVar('input'),
																id),
															newstore),
														store)
												};
											} else {
												var userstore = $author$project$IMP$Uneval$getFinalRiStmtStore(newriStmts);
												var store_ = A2($author$project$IMP$Utils$delStore, x, newstore);
												return {
													funcEnv: funcEnv,
													hcount: hcount,
													holeBindings: holeBindings,
													riStmts: A2(
														$elm$core$List$take,
														$elm$core$List$length(newriStmts) - 1,
														newriStmts),
													stmt: stmt,
													store: A3(
														$author$project$IMP$Uneval$mergeStore,
														userstore,
														A3(
															$author$project$IMP$Utils$updateStore,
															'input',
															A2(
																$author$project$IMP$Syntax$VHole,
																$author$project$IMP$Syntax$HVar('input'),
																id),
															store_),
														store)
												};
											}
										} else {
											return _Utils_update(
												$author$project$IMP$Uneval$defaultUnexecRes,
												{
													funcEnv: funcEnv,
													stmt: $author$project$IMP$Syntax$SError('Error: unexecStmt: SRead: input updated')
												});
										}
									} else {
										return _Utils_update(
											$author$project$IMP$Uneval$defaultUnexecRes,
											{
												funcEnv: funcEnv,
												stmt: $author$project$IMP$Syntax$SError('Error: unexecStmt: SRead: input variable not found')
											});
									}
								} else {
									break _v61$2;
								}
							case 'VList':
								if (_v61.b.a.$ === 'VList') {
									var vs = _v61.a.a.a;
									var os = _v61.b.a.a;
									var _v66 = _Utils_Tuple2(newx, oldx);
									if (_v66.a.$ === 'Just') {
										if (_v66.b.$ === 'Just') {
											var v = _v66.a.a;
											var ov = _v66.b.a;
											if (_Utils_eq(
												A2($elm$core$List$cons, v, vs),
												os)) {
												var store_ = A3($author$project$IMP$Utils$updateStore, x, ov, newstore);
												return {
													funcEnv: funcEnv,
													hcount: hcount,
													holeBindings: holeBindings,
													riStmts: newriStmts,
													stmt: stmt,
													store: A3(
														$author$project$IMP$Utils$updateStore,
														'input',
														$author$project$IMP$Syntax$VList(os),
														store_)
												};
											} else {
												return _Utils_update(
													$author$project$IMP$Uneval$defaultUnexecRes,
													{
														funcEnv: funcEnv,
														stmt: $author$project$IMP$Syntax$SError('Error: unexecStmt: SRead: input length mismatch')
													});
											}
										} else {
											var v = _v66.a.a;
											var _v67 = _v66.b;
											if (_Utils_eq(
												A2($elm$core$List$cons, v, vs),
												os)) {
												var store_ = A2($author$project$IMP$Utils$delStore, x, newstore);
												return {
													funcEnv: funcEnv,
													hcount: hcount,
													holeBindings: holeBindings,
													riStmts: newriStmts,
													stmt: stmt,
													store: A3(
														$author$project$IMP$Utils$updateStore,
														'input',
														$author$project$IMP$Syntax$VList(os),
														store_)
												};
											} else {
												return _Utils_update(
													$author$project$IMP$Uneval$defaultUnexecRes,
													{
														funcEnv: funcEnv,
														stmt: $author$project$IMP$Syntax$SError('Error: unexecStmt: SRead: input length mismatch')
													});
											}
										}
									} else {
										return _Utils_update(
											$author$project$IMP$Uneval$defaultUnexecRes,
											{
												funcEnv: funcEnv,
												stmt: $author$project$IMP$Syntax$SError('Error: unexecStmt: SRead: input not found')
											});
									}
								} else {
									break _v61$2;
								}
							default:
								break _v61$2;
						}
					} else {
						break _v61$2;
					}
				}
				return _Utils_update(
					$author$project$IMP$Uneval$defaultUnexecRes,
					{
						funcEnv: funcEnv,
						stmt: $author$project$IMP$Syntax$SError('Error: unexecStmt: SRead: input not found')
					});
			case 'SPrint':
				var ws = stmt.a;
				var e = stmt.b;
				var val = A3($author$project$IMP$Eval$eval, store, holeBindings, e);
				var oldout = A2($author$project$IMP$Utils$lookup, 'output', store);
				var newout = A2($author$project$IMP$Utils$lookup, 'output', newstore);
				var _v68 = _Utils_Tuple2(newout, oldout);
				if ((((_v68.a.$ === 'Just') && (_v68.a.a.$ === 'VList')) && (_v68.b.$ === 'Just')) && (_v68.b.a.$ === 'VList')) {
					var vs = _v68.a.a.a;
					var os = _v68.b.a.a;
					if (_Utils_eq(
						$elm$core$List$length(vs),
						$elm$core$List$length(os) + 1)) {
						var _v69 = $elm$core$List$head(
							$elm$core$List$reverse(vs));
						if (_v69.$ === 'Just') {
							var vprime = _v69.a;
							var userstore = $author$project$IMP$Uneval$getFinalRiStmtStore(newriStmts);
							var store1 = A3(
								$author$project$IMP$Utils$updateStore,
								'output',
								$author$project$IMP$Syntax$VList(
									A2(
										$elm$core$List$take,
										$elm$core$List$length(os),
										vs)),
								newstore);
							var pop = A2(
								$elm$core$List$take,
								$elm$core$List$length(newriStmts) - 1,
								newriStmts);
							var goUneval = F2(
								function (merge, pop_) {
									var _v74 = A6($author$project$IMP$Uneval$uneval, store1, holeBindings, e, readOnly, vprime, hcount);
									var finalstore = _v74.a;
									var newhb = _v74.b;
									var _v75 = _v74.c;
									var newexpr = _v75.a;
									var hcount_ = _v75.b;
									if (newexpr.$ === 'EError') {
										var info = newexpr.a;
										return _Utils_update(
											$author$project$IMP$Uneval$defaultUnexecRes,
											{
												funcEnv: funcEnv,
												stmt: $author$project$IMP$Syntax$SError(info)
											});
									} else {
										return {
											funcEnv: funcEnv,
											hcount: hcount_,
											holeBindings: newhb,
											riStmts: pop_,
											stmt: A2($author$project$IMP$Syntax$SPrint, ws, newexpr),
											store: merge ? A3($author$project$IMP$Uneval$mergeStore, userstore, finalstore, store) : finalstore
										};
									}
								});
							var _v70 = _Utils_Tuple2(val, vprime);
							switch (_v70.a.$) {
								case 'VHole':
									if (_v70.b.$ === 'VHole') {
										var _v71 = _v70.a;
										var _v72 = _v70.b;
										var id = _v72.b;
										return _Utils_eq(id, scount) ? {
											funcEnv: funcEnv,
											hcount: hcount,
											holeBindings: holeBindings,
											riStmts: pop,
											stmt: stmt,
											store: A3($author$project$IMP$Uneval$mergeStore, userstore, store1, store)
										} : A2(goUneval, true, pop);
									} else {
										var _v73 = _v70.a;
										return A2(goUneval, true, pop);
									}
								case 'VList':
									var vs2 = _v70.a.a;
									return $author$project$IMP$Utils$hasHole(vs2) ? A2(goUneval, true, pop) : A2(goUneval, false, newriStmts);
								default:
									return A2(goUneval, false, newriStmts);
							}
						} else {
							return _Utils_update(
								$author$project$IMP$Uneval$defaultUnexecRes,
								{
									funcEnv: funcEnv,
									stmt: $author$project$IMP$Syntax$SError('Error: unexecStmt: SPrint: newval not found')
								});
						}
					} else {
						return _Utils_update(
							$author$project$IMP$Uneval$defaultUnexecRes,
							{
								funcEnv: funcEnv,
								stmt: $author$project$IMP$Syntax$SError('Error: unexecStmt: SPrint: output length mismatch')
							});
					}
				} else {
					return _Utils_update(
						$author$project$IMP$Uneval$defaultUnexecRes,
						{
							funcEnv: funcEnv,
							stmt: $author$project$IMP$Syntax$SError('Error: unexecStmt: SPrint: output not found')
						});
				}
			case 'SIf':
				var ws = stmt.a;
				var e = stmt.b;
				var s1 = stmt.c;
				var s2 = stmt.d;
				var guard = A3($author$project$IMP$Eval$eval, store, holeBindings, e);
				switch (guard.$) {
					case 'VHole':
						var oldres = A7($author$project$IMP$Eval$exec, funcEnv, store, holeBindings, riStmts, stmt, readOnly, scount);
						var userstore = $author$project$IMP$Uneval$getFinalRiStmtStore(newriStmts);
						var maymod = $author$project$IMP$Utils$unique(
							_Utils_ap(
								A2($author$project$IMP$Utils$modVars, funcEnv, s1),
								A2($author$project$IMP$Utils$modVars, funcEnv, s2)));
						if (A4($author$project$IMP$Utils$sameMayMod, maymod, oldres.store, newstore, scount)) {
							var unpollutedstore = A3($author$project$IMP$Uneval$unpollute, newstore, store, scount);
							return {
								funcEnv: funcEnv,
								hcount: hcount,
								holeBindings: holeBindings,
								riStmts: A2($author$project$IMP$Uneval$dropRiStmt, scount, newriStmts),
								stmt: A4($author$project$IMP$Syntax$SIf, ws, e, s1, s2),
								store: A3($author$project$IMP$Uneval$mergeStore, userstore, unpollutedstore, store)
							};
						} else {
							var _v78 = _Utils_Tuple2(s1, s2);
							if (((_v78.a.$ === 'SSeq') && (_v78.a.c.$ === 'SWhile')) && (_v78.b.$ === 'SSkip')) {
								var _v79 = _v78.a;
								var ws1 = _v79.a;
								var s_ = _v79.b;
								var _v80 = _v79.c;
								var ws2 = _v80.a;
								var e_ = _v80.b;
								var sw = _v80.c;
								var _v81 = A3($author$project$IMP$Eval$eval, newstore, holeBindings, e);
								if ((_v81.$ === 'VBool') && (!_v81.a)) {
									var fres = A7($author$project$IMP$Eval$exec, funcEnv, store, holeBindings, riStmts, s_, readOnly, scount + 1);
									var bres = A9(
										$author$project$IMP$Uneval$unexec,
										funcEnv,
										store,
										holeBindings,
										riStmts,
										readOnly,
										s_,
										hcount,
										scount + 1,
										_Utils_Tuple2(newstore, fres.riStmts));
									var _v82 = A3($author$project$IMP$Eval$eval, bres.store, bres.holeBindings, e);
									if ((_v82.$ === 'VBool') && _v82.a) {
										var unpollutedstore = A3($author$project$IMP$Uneval$unpollute, bres.store, store, scount);
										return {
											funcEnv: bres.funcEnv,
											hcount: bres.hcount,
											holeBindings: bres.holeBindings,
											riStmts: A2($author$project$IMP$Uneval$dropRiStmt, scount, newriStmts),
											stmt: A4(
												$author$project$IMP$Syntax$SIf,
												ws,
												e,
												A3(
													$author$project$IMP$Syntax$SSeq,
													ws1,
													bres.stmt,
													A3($author$project$IMP$Syntax$SWhile, ws2, e_, sw)),
												$author$project$IMP$Syntax$SSkip(_List_Nil)),
											store: A3($author$project$IMP$Uneval$mergeStore, userstore, unpollutedstore, store)
										};
									} else {
										return _Utils_update(
											$author$project$IMP$Uneval$defaultUnexecRes,
											{
												funcEnv: funcEnv,
												stmt: $author$project$IMP$Syntax$SError('Error: unexecStmt: SWhile: guard is not true before the last iteration')
											});
									}
								} else {
									return _Utils_update(
										$author$project$IMP$Uneval$defaultUnexecRes,
										{
											funcEnv: funcEnv,
											stmt: $author$project$IMP$Syntax$SError('Error: unexecStmt: SWhile: guard is not false after the loop')
										});
								}
							} else {
								var bres = A9(
									$author$project$IMP$Uneval$unexec,
									funcEnv,
									store,
									holeBindings,
									riStmts,
									readOnly,
									s1,
									hcount,
									scount,
									_Utils_Tuple2(newstore, newriStmts));
								var _v83 = bres.stmt;
								if (_v83.$ === 'SError') {
									var bres2 = A9(
										$author$project$IMP$Uneval$unexec,
										funcEnv,
										store,
										holeBindings,
										riStmts,
										readOnly,
										s2,
										hcount,
										scount,
										_Utils_Tuple2(newstore, newriStmts));
									var _v84 = bres2.stmt;
									if (_v84.$ === 'SError') {
										return _Utils_update(
											$author$project$IMP$Uneval$defaultUnexecRes,
											{
												funcEnv: funcEnv,
												stmt: $author$project$IMP$Syntax$SError('Error: unexecStmt: SIf: both branches error')
											});
									} else {
										var _v85 = A6(
											$author$project$IMP$Uneval$uneval,
											bres2.store,
											bres2.holeBindings,
											e,
											readOnly,
											$author$project$IMP$Syntax$VBool(false),
											bres2.hcount);
										var finalstore = _v85.a;
										var newhb = _v85.b;
										var _v86 = _v85.c;
										var newexpr = _v86.a;
										var hcount_ = _v86.b;
										var unpollutedstore = A3($author$project$IMP$Uneval$unpollute, finalstore, store, scount);
										return {
											funcEnv: bres2.funcEnv,
											hcount: hcount_,
											holeBindings: newhb,
											riStmts: A2($author$project$IMP$Uneval$dropRiStmt, scount, bres2.riStmts),
											stmt: A4($author$project$IMP$Syntax$SIf, ws, newexpr, s1, bres2.stmt),
											store: A3($author$project$IMP$Uneval$mergeStore, userstore, unpollutedstore, store)
										};
									}
								} else {
									var _v87 = A6(
										$author$project$IMP$Uneval$uneval,
										bres.store,
										bres.holeBindings,
										e,
										readOnly,
										$author$project$IMP$Syntax$VBool(true),
										bres.hcount);
									var finalstore = _v87.a;
									var newhb = _v87.b;
									var _v88 = _v87.c;
									var newexpr = _v88.a;
									var hcount_ = _v88.b;
									var unpollutedstore = A3($author$project$IMP$Uneval$unpollute, finalstore, store, scount);
									return {
										funcEnv: bres.funcEnv,
										hcount: hcount_,
										holeBindings: newhb,
										riStmts: A2($author$project$IMP$Uneval$dropRiStmt, scount, bres.riStmts),
										stmt: A4($author$project$IMP$Syntax$SIf, ws, newexpr, bres.stmt, s2),
										store: A3($author$project$IMP$Uneval$mergeStore, userstore, unpollutedstore, store)
									};
								}
							}
						}
					case 'VBool':
						if (guard.a) {
							var res = A9(
								$author$project$IMP$Uneval$unexec,
								funcEnv,
								store,
								holeBindings,
								riStmts,
								readOnly,
								s1,
								hcount,
								scount,
								_Utils_Tuple2(newstore, newriStmts));
							var _v89 = A6($author$project$IMP$Uneval$uneval, res.store, res.holeBindings, e, readOnly, guard, res.hcount);
							var finalstore = _v89.a;
							var newhb = _v89.b;
							var _v90 = _v89.c;
							var newexpr = _v90.a;
							var hcount_ = _v90.b;
							return {
								funcEnv: res.funcEnv,
								hcount: hcount_,
								holeBindings: newhb,
								riStmts: res.riStmts,
								stmt: A4($author$project$IMP$Syntax$SIf, ws, newexpr, res.stmt, s2),
								store: finalstore
							};
						} else {
							var res = A9(
								$author$project$IMP$Uneval$unexec,
								funcEnv,
								store,
								holeBindings,
								riStmts,
								readOnly,
								s2,
								hcount,
								scount,
								_Utils_Tuple2(newstore, newriStmts));
							var _v91 = A6($author$project$IMP$Uneval$uneval, res.store, res.holeBindings, e, readOnly, guard, res.hcount);
							var finalstore = _v91.a;
							var newhb = _v91.b;
							var _v92 = _v91.c;
							var newexpr = _v92.a;
							var hcount_ = _v92.b;
							return {
								funcEnv: res.funcEnv,
								hcount: hcount_,
								holeBindings: newhb,
								riStmts: res.riStmts,
								stmt: A4($author$project$IMP$Syntax$SIf, ws, newexpr, s1, res.stmt),
								store: finalstore
							};
						}
					default:
						return _Utils_update(
							$author$project$IMP$Uneval$defaultUnexecRes,
							{
								funcEnv: funcEnv,
								stmt: $author$project$IMP$Syntax$SError('Error: unexecStmt: SIf: guard type error')
							});
				}
			case 'SWhile':
				var ws = stmt.a;
				var e = stmt.b;
				var s = stmt.c;
				var res = A9(
					$author$project$IMP$Uneval$unexec,
					funcEnv,
					store,
					holeBindings,
					riStmts,
					readOnly,
					A4(
						$author$project$IMP$Syntax$SIf,
						_List_Nil,
						e,
						A3(
							$author$project$IMP$Syntax$SSeq,
							_List_Nil,
							s,
							A3($author$project$IMP$Syntax$SWhile, ws, e, s)),
						$author$project$IMP$Syntax$SSkip(_List_Nil)),
					hcount,
					scount,
					_Utils_Tuple2(newstore, newriStmts));
				var _v93 = res.stmt;
				if ((((_v93.$ === 'SIf') && (_v93.c.$ === 'SSeq')) && (_v93.c.c.$ === 'SWhile')) && (_v93.d.$ === 'SSkip')) {
					var e_ = _v93.b;
					var _v94 = _v93.c;
					var s1_ = _v94.b;
					var _v95 = _v94.c;
					var e2_ = _v95.b;
					var s2_ = _v95.c;
					var news = (!_Utils_eq(s2_, s)) ? s2_ : s1_;
					var newe = (!_Utils_eq(e2_, e)) ? e2_ : e_;
					return {
						funcEnv: res.funcEnv,
						hcount: res.hcount,
						holeBindings: res.holeBindings,
						riStmts: res.riStmts,
						stmt: A3($author$project$IMP$Syntax$SWhile, ws, newe, news),
						store: res.store
					};
				} else {
					return _Utils_update(
						$author$project$IMP$Uneval$defaultUnexecRes,
						{
							funcEnv: funcEnv,
							stmt: $author$project$IMP$Syntax$SError('Error: unexecStmt: SWhile: unexpected statement')
						});
				}
			case 'SFuncDef':
				return _Utils_update(
					$author$project$IMP$Uneval$defaultUnexecRes,
					{
						funcEnv: funcEnv,
						stmt: $author$project$IMP$Syntax$SError('function definition is not allowed during execution')
					});
			case 'SFuncCall':
				var ws = stmt.a;
				var name = stmt.b;
				var args = stmt.c;
				return $author$project$IMP$Uneval$unexecFuncCall(funcEnv)(store)(holeBindings)(riStmts)(readOnly)(hcount)(scount)(
					_Utils_Tuple2(newstore, newriStmts))(ws)(name)(args);
			default:
				var s = stmt.a;
				return _Utils_update(
					$author$project$IMP$Uneval$defaultUnexecRes,
					{
						funcEnv: funcEnv,
						stmt: $author$project$IMP$Syntax$SError(s)
					});
		}
	});
var $author$project$IMP$Uneval$unexecArgBinds = F7(
	function (funcEnv, origStore, origHB, origRi, callRO, steps, acc) {
		if (!steps.b) {
			return $elm$core$Result$Ok(
				_Utils_Tuple2(acc, _List_Nil));
		} else {
			return A7($author$project$IMP$Uneval$unexecArgBindsMerge, funcEnv, origStore, origHB, origRi, callRO, steps, acc);
		}
	});
var $author$project$IMP$Uneval$unexecArgBindsMerge = F7(
	function (funcEnv, origStore, origHB, origRi, callRO, steps, acc) {
		if (!steps.b) {
			return $elm$core$Result$Ok(
				_Utils_Tuple2(acc, _List_Nil));
		} else {
			var step = steps.a;
			var rest = steps.b;
			var _v8 = A7($author$project$IMP$Uneval$unexecArgBindsMerge, funcEnv, origStore, origHB, origRi, callRO, rest, acc);
			if (_v8.$ === 'Err') {
				var info = _v8.a;
				return $elm$core$Result$Err(info);
			} else {
				var _v9 = _v8.a;
				var later = _v9.a;
				var es = _v9.b;
				var target = A3(
					$author$project$IMP$Utils$overlayParams,
					_List_fromArray(
						[step.param]),
					acc.store,
					origStore);
				var r = A9(
					$author$project$IMP$Uneval$unexec,
					funcEnv,
					origStore,
					origHB,
					origRi,
					callRO,
					A3(
						$author$project$IMP$Syntax$SAssign,
						_List_Nil,
						A2($author$project$IMP$Syntax$EVar, _List_Nil, step.param),
						step.arg),
					later.hcount,
					step.scount,
					_Utils_Tuple2(target, later.riStmts));
				var _v10 = r.stmt;
				switch (_v10.$) {
					case 'SAssign':
						var e = _v10.c;
						return $elm$core$Result$Ok(
							_Utils_Tuple2(
								_Utils_update(
									r,
									{
										funcEnv: later.funcEnv,
										holeBindings: A3($author$project$IMP$Uneval$mergeHoleBindings, r.holeBindings, later.holeBindings, origHB),
										store: A3($author$project$IMP$Uneval$mergeStore, r.store, later.store, origStore)
									}),
								A2($elm$core$List$cons, e, es)));
					case 'SError':
						var info = _v10.a;
						return $elm$core$Result$Err(info);
					default:
						return $elm$core$Result$Err('Error: unexecStmt: SFuncCall: unexpected statement');
				}
			}
		}
	});
var $author$project$IMP$Uneval$unexecFuncCall = function (funcEnv) {
	return function (store) {
		return function (holeBindings) {
			return function (riStmts) {
				return function (readOnly) {
					return function (hcount) {
						return function (scount) {
							return function (_v0) {
								return function (ws) {
									return function (name) {
										return function (args) {
											var newstore = _v0.a;
											var newriStmts = _v0.b;
											var _v1 = A2($author$project$IMP$Utils$lookupFunc, name, funcEnv);
											if (_v1.$ === 'Nothing') {
												return _Utils_update(
													$author$project$IMP$Uneval$defaultUnexecRes,
													{
														funcEnv: funcEnv,
														stmt: $author$project$IMP$Syntax$SError('Function not found')
													});
											} else {
												var _v2 = _v1.a;
												var params = _v2.a;
												var body = _v2.b;
												if (!_Utils_eq(
													$elm$core$List$length(params),
													$elm$core$List$length(args))) {
													return _Utils_update(
														$author$project$IMP$Uneval$defaultUnexecRes,
														{
															funcEnv: funcEnv,
															stmt: $author$project$IMP$Syntax$SError('Argument count mismatch')
														});
												} else {
													var callRO = A3($elm$core$List$foldl, $elm$core$Set$remove, readOnly, params);
													var _v3 = A8($author$project$IMP$Eval$bindParamsParallel, funcEnv, store, holeBindings, riStmts, callRO, scount, params, args);
													var bound = _v3.a;
													var steps = _v3.b;
													if ($author$project$IMP$Utils$isErrorStore(bound.store)) {
														return _Utils_update(
															$author$project$IMP$Uneval$defaultUnexecRes,
															{
																funcEnv: funcEnv,
																stmt: $author$project$IMP$Syntax$SError('Error in function call')
															});
													} else {
														var target = A3($author$project$IMP$Utils$overlayParams, params, bound.store, newstore);
														var bresBody = A9(
															$author$project$IMP$Uneval$unexec,
															funcEnv,
															bound.store,
															holeBindings,
															bound.riStmts,
															callRO,
															body,
															hcount,
															bound.scount,
															_Utils_Tuple2(target, newriStmts));
														var _v4 = bresBody.stmt;
														if (_v4.$ === 'SError') {
															return bresBody;
														} else {
															var _v5 = A7($author$project$IMP$Uneval$unexecArgBinds, funcEnv, store, holeBindings, riStmts, callRO, steps, bresBody);
															if (_v5.$ === 'Err') {
																var info = _v5.a;
																return _Utils_update(
																	$author$project$IMP$Uneval$defaultUnexecRes,
																	{
																		funcEnv: bresBody.funcEnv,
																		stmt: $author$project$IMP$Syntax$SError(info)
																	});
															} else {
																var _v6 = _v5.a;
																var bresBinds = _v6.a;
																var newArgs = _v6.b;
																return _Utils_update(
																	bresBinds,
																	{
																		funcEnv: A3($author$project$IMP$Utils$updateFuncEnv, name, bresBody.stmt, bresBinds.funcEnv),
																		stmt: A3($author$project$IMP$Syntax$SFuncCall, ws, name, newArgs),
																		store: A2(
																			$author$project$IMP$Utils$restoreParams,
																			A2($author$project$IMP$Utils$snapshotParams, params, newstore),
																			bresBinds.store)
																	});
															}
														}
													}
												}
											}
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var $author$project$Controller$unevalCodeToModel = F2(
	function (model, commit) {
		var _v0 = $author$project$Controller$applyContextDraft(model);
		if (_v0.$ === 'Err') {
			var info = _v0.a;
			return _Utils_update(
				model,
				{output: info});
		} else {
			var model1 = _v0.a;
			var _v1 = $author$project$Controller$parseOutputText(model1.output);
			if (_v1.$ === 'Ok') {
				var vs = _v1.a;
				var _v2 = $author$project$IMP$Parser_$parse(model1.code);
				if (_v2.$ === 'Ok') {
					var stmt = _v2.a;
					var newstore = A3(
						$author$project$IMP$Utils$updateStore,
						'output',
						$author$project$IMP$Syntax$VList(vs),
						model1.store);
					var _v3 = $author$project$IMP$Utils$prepareStmt(stmt);
					var stmt_ = _v3.a;
					var hcount = _v3.b;
					var funcEnv = _v3.c;
					var res = $timeEval("Backward evaluation", function () {
						return A9(
							$author$project$IMP$Uneval$unexec,
							funcEnv,
							model1.startStore,
							model1.holeBindings,
							_List_Nil,
							$elm$core$Set$empty,
							stmt_,
							hcount,
							0,
							_Utils_Tuple2(newstore, model1.riStmts));
					});
					var _v4 = res.stmt;
					if (_v4.$ === 'SError') {
						var info = _v4.a;
						return _Utils_update(
							model1,
							{output: info});
					} else {
						var newCode = $author$project$IMP$Printer$printStmt(
							A2($author$project$IMP$Utils$attachFuncs, res.funcEnv, res.stmt));
						var keepId = A2($author$project$Controller$keepContextId, model1.currentContext, res.riStmts);
						return _Utils_update(
							model1,
							{
								code: newCode,
								codeBackup: commit ? newCode : model1.codeBackup,
								contextDrafts: A2($author$project$Controller$contextDraftsOf, keepId, res.riStmts),
								currentContext: keepId,
								hbBackup: commit ? res.holeBindings : model1.hbBackup,
								holeBindings: res.holeBindings,
								isOutputChange: commit ? false : model1.isOutputChange,
								output: $author$project$IMP$Printer$printOutputList(vs),
								riStmts: res.riStmts,
								store: newstore
							});
					}
				} else {
					var info = _v2.a;
					return _Utils_update(
						model1,
						{
							output: $elm$core$Debug$toString(info)
						});
				}
			} else {
				var info = _v1.a;
				return _Utils_update(
					model1,
					{output: info});
			}
		}
	});
var $author$project$Main$update = F2(
	function (msg, model) {
		switch (msg.$) {
			case 'SaveCode':
				var newCode = msg.a;
				var newModel = A2($author$project$Controller$evalCodeToModel, newCode, model);
				return _Utils_Tuple2(
					newModel,
					$author$project$Main$setConsoleVisible(newModel.output));
			case 'OutputChange':
				var newOutput = msg.a;
				var _v1 = (_Utils_eq(model.mode, $author$project$Model$Console) && (A2($elm$core$String$left, 9, newOutput) === '<textarea')) ? _Utils_Tuple3(model.output, false, $elm$core$Platform$Cmd$none) : _Utils_Tuple3(
					newOutput,
					true,
					$author$project$Main$setAceRed(_Utils_Tuple0));
				var nop = _v1.a;
				var flag = _v1.b;
				var cmd = _v1.c;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{isOutputChange: flag, output: nop}),
					cmd);
			case 'FillAndResume':
				return _Utils_Tuple2(
					$author$project$Controller$openFill(model),
					$elm$core$Platform$Cmd$none);
			case 'ToggleFillHole':
				var key = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							fillSelected: A2($elm$core$Set$member, key, model.fillSelected) ? A2($elm$core$Set$remove, key, model.fillSelected) : A2($elm$core$Set$insert, key, model.fillSelected)
						}),
					$elm$core$Platform$Cmd$none);
			case 'EditFillHole':
				var key = msg.a;
				var text = msg.b;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							fillDraft: A3($elm$core$Dict$insert, key, text, model.fillDraft)
						}),
					$elm$core$Platform$Cmd$none);
			case 'SaveFills':
				var newModel = $author$project$Controller$saveAndFill(model);
				return _Utils_Tuple2(
					newModel,
					$elm$core$Platform$Cmd$batch(
						_List_fromArray(
							[
								$author$project$Main$setConsoleVisible(newModel.output),
								$author$project$Main$sendCode(
								_Utils_Tuple2(newModel.code, false))
							])));
			case 'CancelFill':
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{fillDraft: $elm$core$Dict$empty, fillSelected: $elm$core$Set$empty, filling: false, oriHoles: _List_Nil}),
					$elm$core$Platform$Cmd$none);
			case 'SelectResidual':
				var id = msg.a;
				return _Utils_Tuple2(
					A2($author$project$Controller$selectResidual, id, model),
					$elm$core$Platform$Cmd$none);
			case 'ContextValueChange':
				var x = msg.a;
				var text = msg.b;
				return _Utils_Tuple2(
					A3($author$project$Controller$contextValueChange, x, text, model),
					$elm$core$Platform$Cmd$none);
			case 'Preview':
				var newModel = A2($author$project$Controller$unevalCodeToModel, model, false);
				return _Utils_Tuple2(
					newModel,
					$elm$core$Platform$Cmd$batch(
						_List_fromArray(
							[
								$author$project$Main$setConsoleVisible(newModel.output),
								$author$project$Main$sendCode(
								_Utils_Tuple2(newModel.code, false))
							])));
			case 'Update':
				var newModel = A2($author$project$Controller$unevalCodeToModel, model, true);
				return _Utils_Tuple2(
					newModel,
					$elm$core$Platform$Cmd$batch(
						_List_fromArray(
							[
								$author$project$Main$setConsoleVisible(newModel.output),
								$author$project$Main$sendCode(
								_Utils_Tuple2(newModel.code, false))
							])));
			case 'Revert':
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{code: model.codeBackup, holeBindings: model.hbBackup}),
					$author$project$Main$sendCode(
						_Utils_Tuple2(model.codeBackup, model.isOutputChange)));
			case 'ClearHB':
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{holeBindings: _List_Nil}),
					$elm$core$Platform$Cmd$none);
			case 'OpenInput':
				return _Utils_Tuple2(
					$author$project$Controller$openInput(model),
					$elm$core$Platform$Cmd$none);
			case 'EditInput':
				var text = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{inputDraft: text}),
					$elm$core$Platform$Cmd$none);
			case 'SaveInput':
				var newModel = $author$project$Controller$saveInput(model);
				return _Utils_Tuple2(
					newModel,
					$author$project$Main$setConsoleVisible(newModel.output));
			default:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{editingInput: false, inputDraft: ''}),
					$elm$core$Platform$Cmd$none);
		}
	});
var $author$project$Model$ClearHB = {$: 'ClearHB'};
var $author$project$Model$FillAndResume = {$: 'FillAndResume'};
var $author$project$Model$OpenInput = {$: 'OpenInput'};
var $author$project$Model$Preview = {$: 'Preview'};
var $author$project$Model$Revert = {$: 'Revert'};
var $author$project$Model$Update = {$: 'Update'};
var $elm$html$Html$button = _VirtualDom_node('button');
var $elm$html$Html$Attributes$stringProperty = F2(
	function (key, string) {
		return A2(
			_VirtualDom_property,
			key,
			$elm$json$Json$Encode$string(string));
	});
var $elm$html$Html$Attributes$class = $elm$html$Html$Attributes$stringProperty('className');
var $author$project$Model$CancelFill = {$: 'CancelFill'};
var $author$project$Model$SaveFills = {$: 'SaveFills'};
var $author$project$Model$EditFillHole = F2(
	function (a, b) {
		return {$: 'EditFillHole', a: a, b: b};
	});
var $author$project$Model$ToggleFillHole = function (a) {
	return {$: 'ToggleFillHole', a: a};
};
var $elm$html$Html$Attributes$boolProperty = F2(
	function (key, bool) {
		return A2(
			_VirtualDom_property,
			key,
			$elm$json$Json$Encode$bool(bool));
	});
var $elm$html$Html$Attributes$checked = $elm$html$Html$Attributes$boolProperty('checked');
var $elm$html$Html$input = _VirtualDom_node('input');
var $elm$virtual_dom$VirtualDom$Normal = function (a) {
	return {$: 'Normal', a: a};
};
var $elm$virtual_dom$VirtualDom$on = _VirtualDom_on;
var $elm$html$Html$Events$on = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$Normal(decoder));
	});
var $elm$html$Html$Events$onClick = function (msg) {
	return A2(
		$elm$html$Html$Events$on,
		'click',
		$elm$json$Json$Decode$succeed(msg));
};
var $elm$html$Html$Events$alwaysStop = function (x) {
	return _Utils_Tuple2(x, true);
};
var $elm$virtual_dom$VirtualDom$MayStopPropagation = function (a) {
	return {$: 'MayStopPropagation', a: a};
};
var $elm$html$Html$Events$stopPropagationOn = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$MayStopPropagation(decoder));
	});
var $elm$json$Json$Decode$field = _Json_decodeField;
var $elm$json$Json$Decode$at = F2(
	function (fields, decoder) {
		return A3($elm$core$List$foldr, $elm$json$Json$Decode$field, decoder, fields);
	});
var $elm$html$Html$Events$targetValue = A2(
	$elm$json$Json$Decode$at,
	_List_fromArray(
		['target', 'value']),
	$elm$json$Json$Decode$string);
var $elm$html$Html$Events$onInput = function (tagger) {
	return A2(
		$elm$html$Html$Events$stopPropagationOn,
		'input',
		A2(
			$elm$json$Json$Decode$map,
			$elm$html$Html$Events$alwaysStop,
			A2($elm$json$Json$Decode$map, tagger, $elm$html$Html$Events$targetValue)));
};
var $elm$html$Html$td = _VirtualDom_node('td');
var $elm$virtual_dom$VirtualDom$text = _VirtualDom_text;
var $elm$html$Html$text = $elm$virtual_dom$VirtualDom$text;
var $elm$html$Html$tr = _VirtualDom_node('tr');
var $elm$html$Html$Attributes$type_ = $elm$html$Html$Attributes$stringProperty('type');
var $elm$html$Html$Attributes$value = $elm$html$Html$Attributes$stringProperty('value');
var $author$project$View$displayFillRow = F2(
	function (model, hn) {
		var key = $author$project$IMP$Utils$exprHoleKey(hn);
		return A2(
			$elm$html$Html$tr,
			_List_Nil,
			_List_fromArray(
				[
					A2(
					$elm$html$Html$td,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('hole-name')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$input,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$type_('checkbox'),
									$elm$html$Html$Attributes$checked(
									A2($elm$core$Set$member, key, model.fillSelected)),
									$elm$html$Html$Events$onClick(
									$author$project$Model$ToggleFillHole(key))
								]),
							_List_Nil)
						])),
					A2(
					$elm$html$Html$td,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('hole-name')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(
							$author$project$IMP$Printer$printHoleName(hn))
						])),
					A2(
					$elm$html$Html$td,
					_List_Nil,
					_List_fromArray(
						[
							A2(
							$elm$html$Html$input,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('context-item'),
									$elm$html$Html$Attributes$value(
									A2(
										$elm$core$Maybe$withDefault,
										'',
										A2($elm$core$Dict$get, key, model.fillDraft))),
									$elm$html$Html$Events$onInput(
									$author$project$Model$EditFillHole(key))
								]),
							_List_Nil)
						]))
				]));
	});
var $elm$html$Html$div = _VirtualDom_node('div');
var $elm$html$Html$Attributes$id = $elm$html$Html$Attributes$stringProperty('id');
var $elm$virtual_dom$VirtualDom$style = _VirtualDom_style;
var $elm$html$Html$Attributes$style = $elm$virtual_dom$VirtualDom$style;
var $elm$html$Html$table = _VirtualDom_node('table');
var $elm$html$Html$th = _VirtualDom_node('th');
var $author$project$View$displayFillModal = function (model) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$id('fill-modal-bg')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$id('fill-modal')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('area-title')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('FILL HOLES'),
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('btn'),
										A2($elm$html$Html$Attributes$style, 'width', '70px'),
										A2($elm$html$Html$Attributes$style, 'height', '20px'),
										A2($elm$html$Html$Attributes$style, 'margin', '2px 8px'),
										$elm$html$Html$Events$onClick($author$project$Model$SaveFills)
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Save')
									])),
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('btn'),
										A2($elm$html$Html$Attributes$style, 'width', '70px'),
										A2($elm$html$Html$Attributes$style, 'height', '20px'),
										$elm$html$Html$Events$onClick($author$project$Model$CancelFill)
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Cancel')
									]))
							])),
						A2(
						$elm$html$Html$table,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$id('hb-table')
							]),
						A2(
							$elm$core$List$cons,
							A2(
								$elm$html$Html$th,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('hole-name')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('')
									])),
							A2(
								$elm$core$List$cons,
								A2(
									$elm$html$Html$th,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('hole-name')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text('Hole')
										])),
								A2(
									$elm$core$List$cons,
									A2(
										$elm$html$Html$th,
										_List_Nil,
										_List_fromArray(
											[
												$elm$html$Html$text('Expression')
											])),
									A2(
										$elm$core$List$map,
										$author$project$View$displayFillRow(model),
										model.oriHoles)))))
					]))
			]));
};
var $author$project$IMP$Printer$printStore = function (s) {
	return '[' + (A2(
		$elm$core$String$join,
		', ',
		A2(
			$elm$core$List$map,
			function (_v0) {
				var x = _v0.a;
				var v = _v0.b;
				return x + (' := ' + $author$project$IMP$Printer$printValue(v));
			},
			s)) + '] \n');
};
var $author$project$View$displayHB = function (hb) {
	if (!hb.b) {
		return _List_Nil;
	} else {
		var _v1 = hb.a;
		var hn = _v1.a;
		var store = _v1.b;
		var v = _v1.c;
		var rest = hb.b;
		return A2(
			$elm$core$List$cons,
			A2(
				$elm$html$Html$tr,
				_List_Nil,
				_List_fromArray(
					[
						A2(
						$elm$html$Html$td,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('hole-name')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(
								$author$project$IMP$Printer$printHoleName(hn))
							])),
						A2(
						$elm$html$Html$td,
						_List_Nil,
						_List_fromArray(
							[
								$elm$html$Html$text(
								$elm$core$String$trim(
									$author$project$IMP$Printer$printStore(store)))
							])),
						A2(
						$elm$html$Html$td,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('hole-value')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(
								$author$project$IMP$Printer$printValue(v))
							]))
					])),
			$author$project$View$displayHB(rest));
	}
};
var $author$project$Model$CancelInput = {$: 'CancelInput'};
var $author$project$Model$EditInput = function (a) {
	return {$: 'EditInput', a: a};
};
var $author$project$Model$SaveInput = {$: 'SaveInput'};
var $elm$html$Html$textarea = _VirtualDom_node('textarea');
var $author$project$View$displayInputModal = function (model) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$id('fill-modal-bg')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$id('fill-modal')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('area-title')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('INPUT'),
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('btn'),
										A2($elm$html$Html$Attributes$style, 'width', '70px'),
										A2($elm$html$Html$Attributes$style, 'height', '20px'),
										A2($elm$html$Html$Attributes$style, 'margin', '2px 8px'),
										$elm$html$Html$Events$onClick($author$project$Model$SaveInput)
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Save')
									])),
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('btn'),
										A2($elm$html$Html$Attributes$style, 'width', '70px'),
										A2($elm$html$Html$Attributes$style, 'height', '20px'),
										$elm$html$Html$Events$onClick($author$project$Model$CancelInput)
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Cancel')
									]))
							])),
						A2(
						$elm$html$Html$textarea,
						_List_fromArray(
							[
								A2($elm$html$Html$Attributes$style, 'width', '96%'),
								A2($elm$html$Html$Attributes$style, 'height', '80%'),
								A2($elm$html$Html$Attributes$style, 'margin', '8px'),
								A2($elm$html$Html$Attributes$style, 'font-family', 'Verdana'),
								$elm$html$Html$Attributes$value(model.inputDraft),
								$elm$html$Html$Events$onInput($author$project$Model$EditInput)
							]),
						_List_Nil)
					]))
			]));
};
var $author$project$Model$SelectResidual = function (a) {
	return {$: 'SelectResidual', a: a};
};
var $author$project$View$displayResidualRow = F2(
	function (selected, _v0) {
		var id = _v0.a;
		var stmt = _v0.b;
		return A2(
			$elm$html$Html$tr,
			_List_fromArray(
				[
					A2($elm$html$Html$Attributes$style, 'cursor', 'pointer'),
					A2(
					$elm$html$Html$Attributes$style,
					'background-color',
					_Utils_eq(id, selected) ? '#ddeeee' : 'transparent'),
					$elm$html$Html$Events$onClick(
					$author$project$Model$SelectResidual(id))
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$td,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('hole-name')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(
							$elm$core$String$fromInt(id))
						])),
					A2(
					$elm$html$Html$td,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text(
							$author$project$IMP$Printer$printStmt(stmt))
						]))
				]));
	});
var $author$project$View$displayResiduals = function (model) {
	return A2(
		$elm$core$List$cons,
		A2(
			$elm$html$Html$th,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('hole-name')
				]),
			_List_fromArray(
				[
					$elm$html$Html$text('Id')
				])),
		A2(
			$elm$core$List$cons,
			A2(
				$elm$html$Html$th,
				_List_Nil,
				_List_fromArray(
					[
						$elm$html$Html$text('Statement')
					])),
			A2(
				$elm$core$List$map,
				$author$project$View$displayResidualRow(model.currentContext),
				model.riStmts)));
};
var $author$project$Model$ContextValueChange = F2(
	function (a, b) {
		return {$: 'ContextValueChange', a: a, b: b};
	});
var $author$project$View$displayContextRow = F2(
	function (model, _v0) {
		var x = _v0.a;
		var v = _v0.b;
		return A2(
			$elm$html$Html$tr,
			_List_Nil,
			_List_fromArray(
				[
					A2(
					$elm$html$Html$td,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('hole-name')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(x)
						])),
					A2(
					$elm$html$Html$td,
					_List_Nil,
					_List_fromArray(
						[
							A2(
							$elm$html$Html$input,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('context-item'),
									$elm$html$Html$Attributes$value(
									A2(
										$elm$core$Maybe$withDefault,
										$author$project$IMP$Printer$printValue(v),
										A2($elm$core$Dict$get, x, model.contextDrafts))),
									$elm$html$Html$Events$onInput(
									$author$project$Model$ContextValueChange(x))
								]),
							_List_Nil)
						]))
				]));
	});
var $author$project$View$displayContextRows = function (model) {
	var _v0 = A2(
		$elm$core$List$filter,
		function (_v1) {
			var id = _v1.a;
			return _Utils_eq(id, model.currentContext);
		},
		model.riStmts);
	if (_v0.b) {
		var _v2 = _v0.a;
		var store = _v2.c;
		return A2(
			$elm$core$List$map,
			$author$project$View$displayContextRow(model),
			store);
	} else {
		return _List_Nil;
	}
};
var $author$project$View$displaySelectedStore = function (model) {
	return (model.currentContext < 0) ? $elm$html$Html$text('') : A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$id('context-area')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('area-title')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('CONTEXT')
					])),
				A2(
				$elm$html$Html$table,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$id('context-store-table')
					]),
				A2(
					$elm$core$List$cons,
					A2(
						$elm$html$Html$th,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('hole-name')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Variable')
							])),
					A2(
						$elm$core$List$cons,
						A2(
							$elm$html$Html$th,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text('Value')
								])),
						$author$project$View$displayContextRows(model))))
			]));
};
var $author$project$View$view = function (model) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$id('bi-preview')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$id('menu-bar')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$id('title')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('IMPLive')
							])),
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$id('run-program'),
								$elm$html$Html$Attributes$class('btn')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Eval')
							])),
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('btn uneval'),
								$elm$html$Html$Events$onClick($author$project$Model$OpenInput)
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Input')
							])),
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('btn uneval'),
								$elm$html$Html$Events$onClick($author$project$Model$FillAndResume)
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Fill-and-Resume')
							])),
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('btn uneval'),
								$elm$html$Html$Events$onClick($author$project$Model$Preview)
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Uneval and Preview')
							])),
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('btn uneval'),
								$elm$html$Html$Events$onClick($author$project$Model$Update)
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Uneval and Update')
							])),
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('btn uneval'),
								$elm$html$Html$Events$onClick($author$project$Model$Revert)
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Revert Code')
							])),
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('btn uneval'),
								$elm$html$Html$Events$onClick($author$project$Model$ClearHB)
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Clear Hole-Bindings')
							]))
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$id('hole-bindings'),
						A2($elm$html$Html$Attributes$style, 'overflow-y', 'scroll')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('area-title')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('HOLE BINDINGS')
							])),
						A2(
						$elm$html$Html$table,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$id('hb-table')
							]),
						_Utils_ap(
							_List_fromArray(
								[
									A2(
									$elm$html$Html$th,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('hole-name')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text('Hole Name')
										])),
									A2(
									$elm$html$Html$th,
									_List_Nil,
									_List_fromArray(
										[
											$elm$html$Html$text('Context')
										])),
									A2(
									$elm$html$Html$th,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('hole-value')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text('Value')
										]))
								]),
							$author$project$View$displayHB(model.holeBindings)))
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$id('output')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('area-title')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('OUTPUT')
							])),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$id('output-area')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$textarea,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$id('console-output'),
										$elm$html$Html$Attributes$value(model.output),
										$elm$html$Html$Events$onInput($author$project$Model$OutputChange)
									]),
								_List_Nil)
							]))
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$id('context'),
						A2($elm$html$Html$Attributes$style, 'overflow-y', 'scroll')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('area-title')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('RESIDUAL')
							])),
						A2(
						$elm$html$Html$table,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$id('hb-table')
							]),
						$author$project$View$displayResiduals(model)),
						$author$project$View$displaySelectedStore(model)
					])),
				model.filling ? $author$project$View$displayFillModal(model) : (model.editingInput ? $author$project$View$displayInputModal(model) : $elm$html$Html$text(''))
			]));
};
var $author$project$Main$view = $author$project$View$view;
var $author$project$Main$main = $elm$browser$Browser$element(
	{init: $author$project$Main$init, subscriptions: $author$project$Main$subscriptions, update: $author$project$Main$update, view: $author$project$Main$view});
_Platform_export({'Main':{'init':$author$project$Main$main(
	$elm$json$Json$Decode$succeed(_Utils_Tuple0))(0)}});}(this));