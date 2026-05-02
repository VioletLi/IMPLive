(function(scope){
'use strict';

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
//
// For some reason, tabs can appear in href protocols and it still works.
// So '\tjava\tSCRIPT:alert("!!!")' and 'javascript:alert("!!!")' are the same
// in practice. That is why _VirtualDom_RE_js and _VirtualDom_RE_js_html look
// so freaky.
//
// Pulling the regular expressions out to the top level gives a slight speed
// boost in small benchmarks (4-10%) but hoisting values to reduce allocation
// can be unpredictable in large programs where JIT may have a harder time with
// functions are not fully self-contained. The benefit is more that the js and
// js_html ones are so weird that I prefer to see them near each other.


var _VirtualDom_RE_script = /^script$/i;
var _VirtualDom_RE_on_formAction = /^(on|formAction$)/i;
var _VirtualDom_RE_js = /^\s*j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:/i;
var _VirtualDom_RE_js_html = /^\s*(j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:|d\s*a\s*t\s*a\s*:\s*t\s*e\s*x\s*t\s*\/\s*h\s*t\s*m\s*l\s*(,|;))/i;


function _VirtualDom_noScript(tag)
{
	return _VirtualDom_RE_script.test(tag) ? 'p' : tag;
}

function _VirtualDom_noOnOrFormAction(key)
{
	return _VirtualDom_RE_on_formAction.test(key) ? 'data-' + key : key;
}

function _VirtualDom_noInnerHtmlOrFormAction(key)
{
	return key == 'innerHTML' || key == 'formAction' ? 'data-' + key : key;
}

function _VirtualDom_noJavaScriptUri(value)
{
	return _VirtualDom_RE_js.test(value)
		? /**_UNUSED/''//*//**/'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'//*/
		: value;
}

function _VirtualDom_noJavaScriptOrHtmlUri(value)
{
	return _VirtualDom_RE_js_html.test(value)
		? /**_UNUSED/''//*//**/'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'//*/
		: value;
}

function _VirtualDom_noJavaScriptOrHtmlJson(value)
{
	return (typeof _Json_unwrap(value) === 'string' && _VirtualDom_RE_js_html.test(_Json_unwrap(value)))
		? _Json_wrap(
			/**_UNUSED/''//*//**/'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'//*/
		) : value;
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
var $author$project$Ui$Model$defaultCode = '';
var $author$project$Ui$Model$defaultDelta = 'id';
var $author$project$Ui$Model$defaultEventIndex = 0;
var $author$project$Ui$Model$NotStart = {$: 'NotStart'};
var $author$project$Ui$Model$defaultMode = $author$project$Ui$Model$NotStart;
var $author$project$Syntax$EChar = F2(
	function (a, b) {
		return {$: 'EChar', a: a, b: b};
	});
var $author$project$Syntax$ECons = F4(
	function (a, b, c, d) {
		return {$: 'ECons', a: a, b: b, c: c, d: d};
	});
var $author$project$Syntax$ENil = F2(
	function (a, b) {
		return {$: 'ENil', a: a, b: b};
	});
var $author$project$Syntax$StringType = {$: 'StringType'};
var $elm$core$Basics$composeR = F3(
	function (f, g, x) {
		return g(
			f(x));
	});
var $author$project$Syntax$eStringDefaultWSS = _List_fromArray(
	[' ']);
var $author$project$Parser$Utils$repWS = F2(
	function (ws, e) {
		switch (e.$) {
			case 'ECons':
				var lType = e.b;
				var e1 = e.c;
				var e2 = e.d;
				return A4($author$project$Syntax$ECons, ws, lType, e1, e2);
			case 'ENil':
				var lType = e.b;
				return A2($author$project$Syntax$ENil, ws, lType);
			default:
				return e;
		}
	});
var $elm$core$String$foldr = _String_foldr;
var $elm$core$String$toList = function (string) {
	return A3($elm$core$String$foldr, $elm$core$List$cons, _List_Nil, string);
};
var $author$project$LangUtils$GUI$strToExpr = function (str) {
	return A2(
		$author$project$Parser$Utils$repWS,
		$author$project$Syntax$eStringDefaultWSS,
		A3(
			$elm$core$Basics$composeR,
			$elm$core$String$toList,
			A2(
				$elm$core$List$foldr,
				F2(
					function (c, acc) {
						return A4(
							$author$project$Syntax$ECons,
							_List_fromArray(
								[' ']),
							$author$project$Syntax$StringType,
							A2($author$project$Syntax$EChar, _List_Nil, c),
							acc);
					}),
				A2($author$project$Syntax$ENil, _List_Nil, $author$project$Syntax$StringType)),
			str));
};
var $author$project$Ui$Model$defaultOutput = $author$project$LangUtils$GUI$strToExpr('');
var $author$project$Syntax$EError = function (a) {
	return {$: 'EError', a: a};
};
var $author$project$Ui$Model$defaultRunningExp = $author$project$Syntax$EError('No Running Exp');
var $author$project$Ui$Model$defaultRunningHeap = _List_Nil;
var $author$project$Ui$Model$defaultRunningID = 0;
var $author$project$Syntax$DZero = {$: 'DZero'};
var $author$project$Syntax$ETuple = F4(
	function (a, b, c, d) {
		return {$: 'ETuple', a: a, b: b, c: c, d: d};
	});
var $author$project$Syntax$EventType = {$: 'EventType'};
var $author$project$Syntax$SquareType = {$: 'SquareType'};
var $author$project$Syntax$eNilDefaultWSS = _List_fromArray(
	['', ' ']);
var $author$project$Syntax$eTupleDefaultWSS = _List_fromArray(
	[' ', ' ', ' ']);
var $author$project$Ui$Model$defaultTriggeredEvents = _List_fromArray(
	[
		_Utils_Tuple2(
		A4(
			$author$project$Syntax$ETuple,
			$author$project$Syntax$eTupleDefaultWSS,
			$author$project$Syntax$EventType,
			$author$project$LangUtils$GUI$strToExpr('None'),
			A2($author$project$Syntax$ENil, $author$project$Syntax$eNilDefaultWSS, $author$project$Syntax$SquareType)),
		$author$project$Syntax$DZero)
	]);
var $author$project$Ui$Model$initModel = {
	code: $author$project$Ui$Model$defaultCode,
	delta: $author$project$Ui$Model$defaultDelta,
	eventIndex: $author$project$Ui$Model$defaultEventIndex,
	mode: $author$project$Ui$Model$defaultMode,
	output: $author$project$Ui$Model$defaultOutput,
	preExs: _List_fromArray(
		['New File', 'Calculator', 'Dice Game', 'Meal Ordering', 'Conference Surplus', 'House Sailing']),
	runningExp: $author$project$Ui$Model$defaultRunningExp,
	runningHeap: $author$project$Ui$Model$defaultRunningHeap,
	runningID: $author$project$Ui$Model$defaultRunningID,
	triggeredEvents: $author$project$Ui$Model$defaultTriggeredEvents
};
var $elm$core$Platform$Cmd$batch = _Platform_batch;
var $elm$core$Platform$Cmd$none = $elm$core$Platform$Cmd$batch(_List_Nil);
var $author$project$Ui$Main$init = function (_v0) {
	return _Utils_Tuple2($author$project$Ui$Model$initModel, $elm$core$Platform$Cmd$none);
};
var $author$project$Ui$Model$CatchGUIEvent = function (a) {
	return {$: 'CatchGUIEvent', a: a};
};
var $author$project$Ui$Model$SaveCode = function (a) {
	return {$: 'SaveCode', a: a};
};
var $author$project$Ui$Model$SetDelta = function (a) {
	return {$: 'SetDelta', a: a};
};
var $elm$core$Platform$Sub$batch = _Platform_batch;
var $elm$json$Json$Decode$string = _Json_decodeString;
var $author$project$Ui$Main$receiveCode = _Platform_incomingPort('receiveCode', $elm$json$Json$Decode$string);
var $author$project$Ui$Main$receiveDelta = _Platform_incomingPort('receiveDelta', $elm$json$Json$Decode$string);
var $elm$json$Json$Decode$andThen = _Json_andThen;
var $elm$json$Json$Decode$index = _Json_decodeIndex;
var $elm$json$Json$Decode$list = _Json_decodeList;
var $author$project$Ui$Main$receiveGUIEvent = _Platform_incomingPort(
	'receiveGUIEvent',
	A2(
		$elm$json$Json$Decode$andThen,
		function (_v0) {
			return A2(
				$elm$json$Json$Decode$andThen,
				function (_v1) {
					return $elm$json$Json$Decode$succeed(
						_Utils_Tuple2(_v0, _v1));
				},
				A2(
					$elm$json$Json$Decode$index,
					1,
					$elm$json$Json$Decode$list($elm$json$Json$Decode$string)));
		},
		A2($elm$json$Json$Decode$index, 0, $elm$json$Json$Decode$string)));
var $author$project$Ui$Main$subscriptions = function (_v0) {
	return $elm$core$Platform$Sub$batch(
		_List_fromArray(
			[
				$author$project$Ui$Main$receiveCode($author$project$Ui$Model$SaveCode),
				$author$project$Ui$Main$receiveDelta($author$project$Ui$Model$SetDelta),
				$author$project$Ui$Main$receiveGUIEvent($author$project$Ui$Model$CatchGUIEvent)
			]));
};
var $author$project$Syntax$DId = {$: 'DId'};
var $author$project$Ui$Model$RUNNING = {$: 'RUNNING'};
var $elm$core$Result$andThen = F2(
	function (callback, result) {
		if (result.$ === 'Ok') {
			var value = result.a;
			return callback(value);
		} else {
			var msg = result.a;
			return $elm$core$Result$Err(msg);
		}
	});
var $author$project$Syntax$Add = {$: 'Add'};
var $author$project$Syntax$Cat = {$: 'Cat'};
var $author$project$Syntax$ConsType = {$: 'ConsType'};
var $author$project$Syntax$DAdd = function (a) {
	return {$: 'DAdd', a: a};
};
var $author$project$Syntax$DCom = F2(
	function (a, b) {
		return {$: 'DCom', a: a, b: b};
	});
var $author$project$Syntax$DLam = F2(
	function (a, b) {
		return {$: 'DLam', a: a, b: b};
	});
var $author$project$Syntax$EApp = F2(
	function (a, b) {
		return {$: 'EApp', a: a, b: b};
	});
var $author$project$Syntax$EBPrim = F4(
	function (a, b, c, d) {
		return {$: 'EBPrim', a: a, b: b, c: c, d: d};
	});
var $author$project$Syntax$ECase = F3(
	function (a, b, c) {
		return {$: 'ECase', a: a, b: b, c: c};
	});
var $author$project$Syntax$EHtml = F5(
	function (a, b, c, d, e) {
		return {$: 'EHtml', a: a, b: b, c: c, d: d, e: e};
	});
var $author$project$Syntax$EInt = F2(
	function (a, b) {
		return {$: 'EInt', a: a, b: b};
	});
var $author$project$Syntax$ELam = F3(
	function (a, b, c) {
		return {$: 'ELam', a: a, b: b, c: c};
	});
var $author$project$Syntax$ELet = F3(
	function (a, b, c) {
		return {$: 'ELet', a: a, b: b, c: c};
	});
var $author$project$Syntax$EParens = F2(
	function (a, b) {
		return {$: 'EParens', a: a, b: b};
	});
var $author$project$Syntax$EUPrim = F3(
	function (a, b, c) {
		return {$: 'EUPrim', a: a, b: b, c: c};
	});
var $author$project$Syntax$EVar = F3(
	function (a, b, c) {
		return {$: 'EVar', a: a, b: b, c: c};
	});
var $author$project$Syntax$Mul = {$: 'Mul'};
var $author$project$Syntax$Neg = {$: 'Neg'};
var $author$project$Syntax$Not = {$: 'Not'};
var $author$project$Syntax$DCons = F3(
	function (a, b, c) {
		return {$: 'DCons', a: a, b: b, c: c};
	});
var $author$project$Syntax$DHtml = F4(
	function (a, b, c, d) {
		return {$: 'DHtml', a: a, b: b, c: c, d: d};
	});
var $author$project$Syntax$DTuple = F2(
	function (a, b) {
		return {$: 'DTuple', a: a, b: b};
	});
var $author$project$Utils$lookup = F2(
	function (s, ls) {
		lookup:
		while (true) {
			if (!ls.b) {
				return $elm$core$Maybe$Nothing;
			} else {
				var _v1 = ls.a;
				var s1 = _v1.a;
				var v1 = _v1.b;
				var ls_ = ls.b;
				if (_Utils_eq(s1, s)) {
					return $elm$core$Maybe$Just(v1);
				} else {
					var $temp$s = s,
						$temp$ls = ls_;
					s = $temp$s;
					ls = $temp$ls;
					continue lookup;
				}
			}
		}
	});
var $author$project$Eval$collectDvForGuard = F2(
	function (h, pi) {
		switch (pi.$) {
			case 'PVar':
				var x = pi.b;
				var _v1 = A2($author$project$Utils$lookup, x, h);
				if (_v1.$ === 'Just') {
					var _v2 = _v1.a;
					var dv = _v2.b;
					return dv;
				} else {
					return $author$project$Syntax$DZero;
				}
			case 'PCons':
				var p1 = pi.c;
				var p2 = pi.d;
				return A3(
					$author$project$Syntax$DCons,
					$elm$core$Maybe$Nothing,
					A2($author$project$Eval$collectDvForGuard, h, p1),
					A2($author$project$Eval$collectDvForGuard, h, p2));
			case 'PTuple':
				var p1 = pi.c;
				var p2 = pi.d;
				return A2(
					$author$project$Syntax$DTuple,
					A2($author$project$Eval$collectDvForGuard, h, p1),
					A2($author$project$Eval$collectDvForGuard, h, p2));
			case 'PHtml':
				var s = pi.b;
				var p1 = pi.c;
				var p2 = pi.d;
				var p3 = pi.e;
				return A4(
					$author$project$Syntax$DHtml,
					s,
					A2($author$project$Eval$collectDvForGuard, h, p1),
					A2($author$project$Eval$collectDvForGuard, h, p2),
					A2($author$project$Eval$collectDvForGuard, h, p3));
			case 'PInt':
				return $author$project$Syntax$DId;
			case 'PNil':
				return $author$project$Syntax$DId;
			case 'PBool':
				return $author$project$Syntax$DId;
			case 'PChar':
				return $author$project$Syntax$DId;
			default:
				return $author$project$Syntax$DZero;
		}
	});
var $author$project$Syntax$BSin = F3(
	function (a, b, c) {
		return {$: 'BSin', a: a, b: b, c: c};
	});
var $author$project$Syntax$DRem = {$: 'DRem'};
var $author$project$Syntax$PCons = F4(
	function (a, b, c, d) {
		return {$: 'PCons', a: a, b: b, c: c, d: d};
	});
var $author$project$Syntax$PHtml = F5(
	function (a, b, c, d, e) {
		return {$: 'PHtml', a: a, b: b, c: c, d: d, e: e};
	});
var $author$project$Syntax$PTuple = F4(
	function (a, b, c, d) {
		return {$: 'PTuple', a: a, b: b, c: c, d: d};
	});
var $author$project$Syntax$TupleType = {$: 'TupleType'};
var $author$project$Syntax$bSinDefaultWSS = _List_fromArray(
	[' ']);
var $author$project$Syntax$eBPrimDefaultWSS = _List_fromArray(
	[' ']);
var $author$project$Syntax$eCaseDefaultWSS = _List_fromArray(
	[' ', ' ']);
var $author$project$Syntax$eConsDefaultWSS = _List_fromArray(
	[' ']);
var $author$project$Syntax$eHtmlDefaultWSS = _List_fromArray(
	[' ']);
var $author$project$Syntax$eIntDefaultWSS = _List_fromArray(
	[' ']);
var $author$project$Syntax$eLamDefaultWSS = _List_fromArray(
	['', ' ', ' ']);
var $author$project$Syntax$eParensDefaultWSS = _List_fromArray(
	['', ' ']);
var $author$project$Syntax$eVarDefaultWSS = _List_fromArray(
	[' ']);
var $elm$core$Tuple$mapFirst = F2(
	function (func, _v0) {
		var x = _v0.a;
		var y = _v0.b;
		return _Utils_Tuple2(
			func(x),
			y);
	});
var $author$project$Syntax$pConsDefaultWSS = _List_fromArray(
	[' ']);
var $author$project$Syntax$pHtmlDefaultWS = _List_fromArray(
	[' ', ' ', ' ', ' ']);
var $author$project$Syntax$pTupleDefaultWSS = _List_fromArray(
	['', ' ', ' ']);
var $author$project$Syntax$PVar = F2(
	function (a, b) {
		return {$: 'PVar', a: a, b: b};
	});
var $author$project$Syntax$pVarDefaultWSS = _List_fromArray(
	[' ']);
var $author$project$LangUtils$Fuse$pV = function (v) {
	return A2($author$project$Syntax$PVar, $author$project$Syntax$pVarDefaultWSS, v);
};
var $elm$core$Debug$toString = _Debug_toString;
var $author$project$LangUtils$Fuse$deltaToFun = F2(
	function (dv, id) {
		return A2(
			$elm$core$Tuple$mapFirst,
			$author$project$Syntax$EParens($author$project$Syntax$eParensDefaultWSS),
			function () {
				switch (dv.$) {
					case 'DZero':
						return _Utils_Tuple2(
							A3(
								$author$project$Syntax$ELam,
								$author$project$Syntax$eLamDefaultWSS,
								'x',
								A3($author$project$Syntax$EVar, $author$project$Syntax$eVarDefaultWSS, 'x', 0)),
							id);
					case 'DId':
						return _Utils_Tuple2(
							A3(
								$author$project$Syntax$ELam,
								$author$project$Syntax$eLamDefaultWSS,
								'x',
								A3($author$project$Syntax$EVar, $author$project$Syntax$eVarDefaultWSS, 'x', 0)),
							id);
					case 'DAdd':
						var n = dv.a;
						return _Utils_Tuple2(
							A3(
								$author$project$Syntax$ELam,
								$author$project$Syntax$eLamDefaultWSS,
								'x',
								A4(
									$author$project$Syntax$EBPrim,
									$author$project$Syntax$eBPrimDefaultWSS,
									$author$project$Syntax$Add,
									A3($author$project$Syntax$EVar, $author$project$Syntax$eVarDefaultWSS, 'x', 0),
									A2($author$project$Syntax$EInt, $author$project$Syntax$eIntDefaultWSS, n))),
							id);
					case 'DTuple':
						var dv1 = dv.a;
						var dv2 = dv.b;
						var _v3 = A3($author$project$LangUtils$Fuse$deltaToFun_, dv1, id, 'fst');
						var fst = _v3.a;
						var id1 = _v3.b;
						var _v4 = A3($author$project$LangUtils$Fuse$deltaToFun_, dv2, id1, 'snd');
						var snd = _v4.a;
						var id2 = _v4.b;
						return _Utils_Tuple2(
							A3(
								$author$project$Syntax$ELam,
								$author$project$Syntax$eLamDefaultWSS,
								'x',
								A3(
									$author$project$Syntax$ECase,
									$author$project$Syntax$eCaseDefaultWSS,
									A3($author$project$Syntax$EVar, $author$project$Syntax$eVarDefaultWSS, 'x', 0),
									A3(
										$author$project$Syntax$BSin,
										$author$project$Syntax$bSinDefaultWSS,
										A4(
											$author$project$Syntax$PTuple,
											$author$project$Syntax$pTupleDefaultWSS,
											$author$project$Syntax$TupleType,
											$author$project$LangUtils$Fuse$pV('fst'),
											$author$project$LangUtils$Fuse$pV('snd')),
										A4($author$project$Syntax$ETuple, $author$project$Syntax$eTupleDefaultWSS, $author$project$Syntax$TupleType, fst, snd)))),
							id2);
					case 'DCons':
						var mv = dv.a;
						var dv1 = dv.b;
						var dv2 = dv.c;
						if (mv.$ === 'Just') {
							var e = mv.a;
							var _v6 = A3($author$project$LangUtils$Fuse$deltaToFun_, dv2, id, 'x');
							var tl = _v6.a;
							var id2 = _v6.b;
							return _Utils_Tuple2(
								A3(
									$author$project$Syntax$ELam,
									$author$project$Syntax$eLamDefaultWSS,
									'x',
									A4($author$project$Syntax$ECons, $author$project$Syntax$eConsDefaultWSS, $author$project$Syntax$ConsType, e, tl)),
								id2);
						} else {
							var _v7 = A3($author$project$LangUtils$Fuse$deltaToFun_, dv1, id, 'hd');
							var hd = _v7.a;
							var id1 = _v7.b;
							var _v8 = A3($author$project$LangUtils$Fuse$deltaToFun_, dv2, id1, 'tl');
							var tl = _v8.a;
							var id2 = _v8.b;
							return _Utils_eq(dv1, $author$project$Syntax$DRem) ? _Utils_Tuple2(
								A3(
									$author$project$Syntax$ELam,
									$author$project$Syntax$eLamDefaultWSS,
									'x',
									A3(
										$author$project$Syntax$ECase,
										$author$project$Syntax$eCaseDefaultWSS,
										A3($author$project$Syntax$EVar, $author$project$Syntax$eVarDefaultWSS, 'x', 0),
										A3(
											$author$project$Syntax$BSin,
											$author$project$Syntax$bSinDefaultWSS,
											A4(
												$author$project$Syntax$PCons,
												$author$project$Syntax$pConsDefaultWSS,
												$author$project$Syntax$ConsType,
												$author$project$LangUtils$Fuse$pV('hd'),
												$author$project$LangUtils$Fuse$pV('tl')),
											tl))),
								id2) : _Utils_Tuple2(
								A3(
									$author$project$Syntax$ELam,
									$author$project$Syntax$eLamDefaultWSS,
									'x',
									A3(
										$author$project$Syntax$ECase,
										$author$project$Syntax$eCaseDefaultWSS,
										A3($author$project$Syntax$EVar, $author$project$Syntax$eVarDefaultWSS, 'x', 0),
										A3(
											$author$project$Syntax$BSin,
											$author$project$Syntax$bSinDefaultWSS,
											A4(
												$author$project$Syntax$PCons,
												$author$project$Syntax$pConsDefaultWSS,
												$author$project$Syntax$ConsType,
												$author$project$LangUtils$Fuse$pV('hd'),
												$author$project$LangUtils$Fuse$pV('tl')),
											A4($author$project$Syntax$ECons, $author$project$Syntax$eConsDefaultWSS, $author$project$Syntax$ConsType, hd, tl)))),
								id2);
						}
					case 'DHtml':
						var s = dv.a;
						var dv1 = dv.b;
						var dv2 = dv.c;
						var dv3 = dv.d;
						var _v9 = A3($author$project$LangUtils$Fuse$deltaToFun_, dv1, id, 'style');
						var style = _v9.a;
						var id1 = _v9.b;
						var _v10 = A3($author$project$LangUtils$Fuse$deltaToFun_, dv2, id1, 'attr');
						var attr = _v10.a;
						var id2 = _v10.b;
						var _v11 = A3($author$project$LangUtils$Fuse$deltaToFun_, dv3, id2, 'child');
						var child = _v11.a;
						var id3 = _v11.b;
						return _Utils_Tuple2(
							A3(
								$author$project$Syntax$ELam,
								$author$project$Syntax$eLamDefaultWSS,
								'x',
								A3(
									$author$project$Syntax$ECase,
									$author$project$Syntax$eCaseDefaultWSS,
									A3($author$project$Syntax$EVar, $author$project$Syntax$eVarDefaultWSS, 'x', 0),
									A3(
										$author$project$Syntax$BSin,
										$author$project$Syntax$bSinDefaultWSS,
										A5(
											$author$project$Syntax$PHtml,
											$author$project$Syntax$pHtmlDefaultWS,
											s,
											$author$project$LangUtils$Fuse$pV('style'),
											$author$project$LangUtils$Fuse$pV('attr'),
											$author$project$LangUtils$Fuse$pV('child')),
										A5($author$project$Syntax$EHtml, $author$project$Syntax$eHtmlDefaultWSS, s, style, attr, child)))),
							id3);
					case 'DCom':
						var dv1 = dv.a;
						var dv2 = dv.b;
						var _v12 = A3($author$project$LangUtils$Fuse$deltaToFun_, dv1, id, 'x');
						var f1 = _v12.a;
						var id1 = _v12.b;
						var _v13 = A3($author$project$LangUtils$Fuse$deltaToFun_, dv2, id1, 'x');
						var f2 = _v13.a;
						var id2 = _v13.b;
						var e1 = function () {
							if (f2.$ === 'ELam') {
								return A2(
									$author$project$Syntax$EApp,
									f2,
									A3($author$project$Syntax$EVar, $author$project$Syntax$eVarDefaultWSS, 'x', 0));
							} else {
								return f2;
							}
						}();
						switch (f1.$) {
							case 'EVar':
								return _Utils_Tuple2(
									A3($author$project$Syntax$ELam, $author$project$Syntax$eLamDefaultWSS, 'x', e1),
									id2);
							case 'ELam':
								return _Utils_Tuple2(
									A3(
										$author$project$Syntax$ELam,
										$author$project$Syntax$eLamDefaultWSS,
										'x',
										A2($author$project$Syntax$EApp, f1, e1)),
									id2);
							case 'EBPrim':
								var wss = f1.a;
								var op = f1.b;
								var e2 = f1.d;
								return _Utils_Tuple2(
									A3(
										$author$project$Syntax$ELam,
										$author$project$Syntax$eLamDefaultWSS,
										'x',
										A4($author$project$Syntax$EBPrim, wss, op, e1, e2)),
									id2);
							case 'EApp':
								return _Utils_Tuple2(
									A3(
										$author$project$Syntax$ELam,
										$author$project$Syntax$eLamDefaultWSS,
										'x',
										A2($author$project$Syntax$EApp, f1, e1)),
									id2);
							default:
								return _Utils_Tuple2(
									$author$project$Syntax$EError(
										'(666transFun-error on ' + ($elm$core$Debug$toString(dv) + ('777) ' + $elm$core$Debug$toString(f1)))),
									id);
						}
					default:
						return _Utils_Tuple2(
							$author$project$Syntax$EError(
								'(transFun-error on ' + ($elm$core$Debug$toString(dv) + ')')),
							id);
				}
			}());
	});
var $author$project$LangUtils$Fuse$deltaToFun_ = F3(
	function (dv, id, _var) {
		switch (dv.$) {
			case 'DZero':
				return _Utils_Tuple2(
					A3($author$project$Syntax$EVar, $author$project$Syntax$eVarDefaultWSS, _var, 0),
					id);
			case 'DId':
				return _Utils_Tuple2(
					A3($author$project$Syntax$EVar, $author$project$Syntax$eVarDefaultWSS, _var, 0),
					id);
			case 'DAdd':
				var n = dv.a;
				return _Utils_Tuple2(
					A4(
						$author$project$Syntax$EBPrim,
						$author$project$Syntax$eBPrimDefaultWSS,
						$author$project$Syntax$Add,
						A3($author$project$Syntax$EVar, $author$project$Syntax$eVarDefaultWSS, _var, 0),
						A2($author$project$Syntax$EInt, $author$project$Syntax$eIntDefaultWSS, n)),
					id);
			default:
				var _v1 = A2($author$project$LangUtils$Fuse$deltaToFun, dv, id);
				var fun = _v1.a;
				var id1 = _v1.b;
				return _Utils_Tuple2(
					A2(
						$author$project$Syntax$EApp,
						fun,
						A3($author$project$Syntax$EVar, $author$project$Syntax$eVarDefaultWSS, _var, 0)),
					id1);
		}
	});
var $author$project$Eval$diffDeltas = F2(
	function (dz1, dz2) {
		diffDeltas:
		while (true) {
			var _v0 = _Utils_Tuple2(dz1, dz2);
			_v0$1:
			while (true) {
				_v0$2:
				while (true) {
					_v0$3:
					while (true) {
						_v0$4:
						while (true) {
							_v0$11:
							while (true) {
								_v0$13:
								while (true) {
									_v0$22:
									while (true) {
										switch (_v0.b.$) {
											case 'DId':
												var _v1 = _v0.b;
												return $elm$core$Result$Ok(dz1);
											case 'DZero':
												switch (_v0.a.$) {
													case 'DZero':
														break _v0$1;
													case 'DRem':
														break _v0$2;
													case 'DCom':
														break _v0$2;
													default:
														break _v0$2;
												}
											case 'DRem':
												switch (_v0.a.$) {
													case 'DZero':
														break _v0$1;
													case 'DRem':
														break _v0$3;
													case 'DCom':
														break _v0$4;
													default:
														break _v0$4;
												}
											case 'DCom':
												switch (_v0.a.$) {
													case 'DZero':
														break _v0$1;
													case 'DRem':
														break _v0$3;
													case 'DCom':
														var _v13 = _v0.a;
														var dz1a = _v13.a;
														var dz1b = _v13.b;
														var _v14 = _v0.b;
														var dz2a = _v14.a;
														var dz2b = _v14.b;
														return A2(
															$elm$core$Result$andThen,
															function (dza) {
																return A2(
																	$elm$core$Result$andThen,
																	function (dzb) {
																		return $elm$core$Result$Ok(
																			A2($author$project$Syntax$DCom, dza, dzb));
																	},
																	A2($author$project$Eval$diffDeltas, dz1b, dz2b));
															},
															A2($author$project$Eval$diffDeltas, dz1a, dz2a));
													default:
														if (_v0.b.b.$ === 'DZero') {
															var _v15 = _v0.b;
															var dz2a = _v15.a;
															var _v16 = _v15.b;
															var $temp$dz1 = dz1,
																$temp$dz2 = dz2a;
															dz1 = $temp$dz1;
															dz2 = $temp$dz2;
															continue diffDeltas;
														} else {
															var _v19 = _v0.b;
															var dz2a = _v19.a;
															var dz2b = _v19.b;
															return A2(
																$elm$core$Result$andThen,
																function (dzb) {
																	return A2(
																		$elm$core$Result$andThen,
																		function (dza) {
																			return $elm$core$Result$Ok(
																				A2($author$project$Syntax$DCom, dza, dzb));
																		},
																		A2($author$project$Eval$diffDeltas, $author$project$Syntax$DId, dz2a));
																},
																A2($author$project$Eval$diffDeltas, dz1, dz2b));
														}
												}
											case 'DAdd':
												switch (_v0.a.$) {
													case 'DZero':
														break _v0$1;
													case 'DRem':
														break _v0$3;
													case 'DId':
														var _v6 = _v0.a;
														var $temp$dz1 = $author$project$Syntax$DAdd(0),
															$temp$dz2 = dz2;
														dz1 = $temp$dz1;
														dz2 = $temp$dz2;
														continue diffDeltas;
													case 'DCom':
														if (_v0.a.b.$ === 'DZero') {
															break _v0$11;
														} else {
															break _v0$13;
														}
													case 'DAdd':
														var dzn1 = _v0.a.a;
														var dzn2 = _v0.b.a;
														return (!(dzn1 - dzn2)) ? $elm$core$Result$Ok($author$project$Syntax$DZero) : $elm$core$Result$Ok(
															$author$project$Syntax$DAdd(dzn1 - dzn2));
													default:
														break _v0$22;
												}
											case 'DTuple':
												switch (_v0.a.$) {
													case 'DZero':
														break _v0$1;
													case 'DRem':
														break _v0$3;
													case 'DId':
														var _v9 = _v0.a;
														var _v10 = _v0.b;
														var $temp$dz1 = A2($author$project$Syntax$DTuple, $author$project$Syntax$DId, $author$project$Syntax$DId),
															$temp$dz2 = dz2;
														dz1 = $temp$dz1;
														dz2 = $temp$dz2;
														continue diffDeltas;
													case 'DCom':
														if (_v0.a.b.$ === 'DZero') {
															break _v0$11;
														} else {
															break _v0$13;
														}
													case 'DTuple':
														var _v21 = _v0.a;
														var dz1a = _v21.a;
														var dz1b = _v21.b;
														var _v22 = _v0.b;
														var dz2a = _v22.a;
														var dz2b = _v22.b;
														return A2(
															$elm$core$Result$andThen,
															function (dza) {
																return A2(
																	$elm$core$Result$andThen,
																	function (dzb) {
																		return $elm$core$Result$Ok(
																			A2($author$project$Syntax$DTuple, dza, dzb));
																	},
																	A2($author$project$Eval$diffDeltas, dz1b, dz2b));
															},
															A2($author$project$Eval$diffDeltas, dz1a, dz2a));
													default:
														break _v0$22;
												}
											case 'DHtml':
												switch (_v0.a.$) {
													case 'DZero':
														break _v0$1;
													case 'DRem':
														break _v0$3;
													case 'DId':
														var _v11 = _v0.a;
														var _v12 = _v0.b;
														var s = _v12.a;
														var $temp$dz1 = A4($author$project$Syntax$DHtml, s, $author$project$Syntax$DId, $author$project$Syntax$DId, $author$project$Syntax$DId),
															$temp$dz2 = dz2;
														dz1 = $temp$dz1;
														dz2 = $temp$dz2;
														continue diffDeltas;
													case 'DCom':
														if (_v0.a.b.$ === 'DZero') {
															break _v0$11;
														} else {
															break _v0$13;
														}
													case 'DHtml':
														var _v23 = _v0.a;
														var s1 = _v23.a;
														var dz1a = _v23.b;
														var dz1b = _v23.c;
														var dz1c = _v23.d;
														var _v24 = _v0.b;
														var s2 = _v24.a;
														var dz2a = _v24.b;
														var dz2b = _v24.c;
														var dz2c = _v24.d;
														return _Utils_eq(s1, s2) ? A2(
															$elm$core$Result$andThen,
															function (dza) {
																return A2(
																	$elm$core$Result$andThen,
																	function (dzb) {
																		return A2(
																			$elm$core$Result$andThen,
																			function (dzc) {
																				return $elm$core$Result$Ok(
																					A4($author$project$Syntax$DHtml, s1, dza, dzb, dzc));
																			},
																			A2($author$project$Eval$diffDeltas, dz1c, dz2c));
																	},
																	A2($author$project$Eval$diffDeltas, dz1b, dz2b));
															},
															A2($author$project$Eval$diffDeltas, dz1a, dz2a)) : $elm$core$Result$Err('HTML delta diff error.');
													default:
														break _v0$22;
												}
											case 'DCons':
												switch (_v0.a.$) {
													case 'DZero':
														break _v0$1;
													case 'DRem':
														break _v0$3;
													case 'DId':
														var _v7 = _v0.a;
														var _v8 = _v0.b;
														var $temp$dz1 = A3($author$project$Syntax$DCons, $elm$core$Maybe$Nothing, $author$project$Syntax$DId, $author$project$Syntax$DId),
															$temp$dz2 = dz2;
														dz1 = $temp$dz1;
														dz2 = $temp$dz2;
														continue diffDeltas;
													case 'DCom':
														if (_v0.a.b.$ === 'DZero') {
															break _v0$11;
														} else {
															break _v0$13;
														}
													case 'DCons':
														if (_v0.a.a.$ === 'Nothing') {
															if (_v0.b.a.$ === 'Nothing') {
																var _v25 = _v0.a;
																var _v26 = _v25.a;
																var dzx1 = _v25.b;
																var dzxs1 = _v25.c;
																var _v27 = _v0.b;
																var _v28 = _v27.a;
																var dzx2 = _v27.b;
																var dzxs2 = _v27.c;
																return A2(
																	$elm$core$Result$andThen,
																	function (dzx) {
																		return A2(
																			$elm$core$Result$andThen,
																			function (dzxs) {
																				return $elm$core$Result$Ok(
																					A3($author$project$Syntax$DCons, $elm$core$Maybe$Nothing, dzx, dzxs));
																			},
																			A2($author$project$Eval$diffDeltas, dzxs1, dzxs2));
																	},
																	A2($author$project$Eval$diffDeltas, dzx1, dzx2));
															} else {
																var _v29 = _v0.a;
																var _v30 = _v29.a;
																var _v31 = _v0.b;
																var dzxs2 = _v31.c;
																return A2(
																	$elm$core$Result$andThen,
																	function (dzxs) {
																		return $elm$core$Result$Ok(
																			A3($author$project$Syntax$DCons, $elm$core$Maybe$Nothing, $author$project$Syntax$DRem, dzxs));
																	},
																	A2($author$project$Eval$diffDeltas, dz1, dzxs2));
															}
														} else {
															if (_v0.b.a.$ === 'Nothing') {
																var _v32 = _v0.a;
																var x = _v32.a.a;
																var dzx1 = _v32.b;
																var dzxs1 = _v32.c;
																var _v33 = _v0.b;
																var _v34 = _v33.a;
																return A2(
																	$elm$core$Result$andThen,
																	function (dzxs) {
																		return $elm$core$Result$Ok(
																			A3(
																				$author$project$Syntax$DCons,
																				$elm$core$Maybe$Just(x),
																				dzx1,
																				dzxs));
																	},
																	A2($author$project$Eval$diffDeltas, dzxs1, dz2));
															} else {
																var _v35 = _v0.a;
																var x = _v35.a.a;
																var dzx1 = _v35.b;
																var dzxs1 = _v35.c;
																var _v36 = _v0.b;
																var y = _v36.a.a;
																var dzx2 = _v36.b;
																var dzxs2 = _v36.c;
																return _Utils_eq(x, y) ? A2(
																	$elm$core$Result$andThen,
																	function (dzx) {
																		return A2(
																			$elm$core$Result$andThen,
																			function (dzxs) {
																				return $elm$core$Result$Ok(
																					A3(
																						$author$project$Syntax$DCons,
																						$elm$core$Maybe$Just(x),
																						dzx,
																						dzxs));
																			},
																			A2($author$project$Eval$diffDeltas, dzxs1, dzxs2));
																	},
																	A2($author$project$Eval$diffDeltas, dzx1, dzx2)) : A2(
																	$elm$core$Result$andThen,
																	function (dzxs) {
																		return $elm$core$Result$Ok(
																			A3(
																				$author$project$Syntax$DCons,
																				$elm$core$Maybe$Just(x),
																				dzx1,
																				A3($author$project$Syntax$DCons, $elm$core$Maybe$Nothing, $author$project$Syntax$DRem, dzxs)));
																	},
																	A2($author$project$Eval$diffDeltas, dzxs1, dzxs2));
															}
														}
													default:
														break _v0$22;
												}
											case 'DLam':
												switch (_v0.a.$) {
													case 'DZero':
														break _v0$1;
													case 'DRem':
														break _v0$3;
													case 'DCom':
														if (_v0.a.b.$ === 'DZero') {
															break _v0$11;
														} else {
															break _v0$13;
														}
													case 'DLam':
														var _v37 = _v0.a;
														var _v38 = _v0.b;
														return $elm$core$Result$Err('diffDeltas: Not defined for DLam');
													default:
														break _v0$22;
												}
											default:
												switch (_v0.a.$) {
													case 'DZero':
														break _v0$1;
													case 'DRem':
														break _v0$3;
													case 'DCom':
														if (_v0.a.b.$ === 'DZero') {
															break _v0$11;
														} else {
															break _v0$13;
														}
													default:
														break _v0$22;
												}
										}
									}
									return $elm$core$Result$Err(
										'diffDeltas: Non-matching deltas ' + $elm$core$Debug$toString(
											_Utils_Tuple2(dz1, dz2)));
								}
								var _v20 = _v0.a;
								var dz1a = _v20.a;
								var dz1b = _v20.b;
								return A2(
									$elm$core$Result$andThen,
									function (dzb) {
										return $elm$core$Result$Ok(
											A2($author$project$Syntax$DCom, dz1a, dzb));
									},
									A2($author$project$Eval$diffDeltas, dz1b, dz2));
							}
							var _v17 = _v0.a;
							var dz2a = _v17.a;
							var _v18 = _v17.b;
							var $temp$dz1 = dz2a,
								$temp$dz2 = dz2;
							dz1 = $temp$dz1;
							dz2 = $temp$dz2;
							continue diffDeltas;
						}
						var _v5 = _v0.b;
						return $elm$core$Result$Ok(dz1);
					}
					var _v4 = _v0.a;
					return $elm$core$Result$Ok($author$project$Syntax$DRem);
				}
				var _v3 = _v0.b;
				return $elm$core$Result$Ok(dz1);
			}
			var _v2 = _v0.a;
			return $elm$core$Result$Ok($author$project$Syntax$DZero);
		}
	});
var $elm$core$String$cons = _String_cons;
var $elm$core$String$fromChar = function (_char) {
	return A2($elm$core$String$cons, _char, '');
};
var $author$project$Printer$Exp$list2Str = function (exp) {
	_v0$2:
	while (true) {
		switch (exp.$) {
			case 'ECons':
				if (exp.c.$ === 'EChar') {
					var _v1 = exp.c;
					var c = _v1.b;
					var e2 = exp.d;
					return _Utils_ap(
						$elm$core$String$fromChar(c),
						$author$project$Printer$Exp$list2Str(e2));
				} else {
					break _v0$2;
				}
			case 'ENil':
				return '';
			default:
				break _v0$2;
		}
	}
	return 'ERROR #09: List to String, exp=' + $elm$core$Debug$toString(exp);
};
var $author$project$Printer$Pattern$list2Str = function (p) {
	_v0$2:
	while (true) {
		switch (p.$) {
			case 'PCons':
				if (p.c.$ === 'PChar') {
					var _v1 = p.c;
					var c = _v1.b;
					var e2 = p.d;
					return _Utils_ap(
						$elm$core$String$fromChar(c),
						$author$project$Printer$Pattern$list2Str(e2));
				} else {
					break _v0$2;
				}
			case 'PNil':
				return '';
			default:
				break _v0$2;
		}
	}
	return 'ERROR #09: List to String, pattern=' + $elm$core$Debug$toString(p);
};
var $author$project$Printer$Pattern$print = function (pat) {
	_v0$12:
	while (true) {
		switch (pat.$) {
			case 'PInt':
				if (pat.a.b && (!pat.a.b.b)) {
					var _v1 = pat.a;
					var ws = _v1.a;
					var n = pat.b;
					return _Utils_ap(
						$elm$core$Debug$toString(n),
						ws);
				} else {
					break _v0$12;
				}
			case 'PBool':
				if (pat.a.b && (!pat.a.b.b)) {
					var _v2 = pat.a;
					var ws = _v2.a;
					var b = pat.b;
					return _Utils_ap(
						$elm$core$Debug$toString(b),
						ws);
				} else {
					break _v0$12;
				}
			case 'PVar':
				if (pat.a.b && (!pat.a.b.b)) {
					var _v3 = pat.a;
					var ws = _v3.a;
					var s = pat.b;
					return _Utils_ap(s, ws);
				} else {
					break _v0$12;
				}
			case 'PCons':
				if (pat.a.b && (!pat.a.b.b)) {
					switch (pat.b.$) {
						case 'ConsType':
							var _v4 = pat.a;
							var ws = _v4.a;
							var _v5 = pat.b;
							var s1 = pat.c;
							var s2 = pat.d;
							return $author$project$Printer$Pattern$print(s1) + ('::' + (ws + $author$project$Printer$Pattern$print(s2)));
						case 'StringType':
							var _v6 = pat.a;
							var ws = _v6.a;
							var _v7 = pat.b;
							return '\"' + ($author$project$Printer$Pattern$list2Str(pat) + ('\"' + ws));
						default:
							break _v0$12;
					}
				} else {
					break _v0$12;
				}
			case 'PTuple':
				if (pat.a.b) {
					if (pat.a.b.b) {
						if ((pat.a.b.b.b && (!pat.a.b.b.b.b)) && (pat.b.$ === 'TupleType')) {
							var _v8 = pat.a;
							var ws1 = _v8.a;
							var _v9 = _v8.b;
							var ws2 = _v9.a;
							var _v10 = _v9.b;
							var ws3 = _v10.a;
							var _v11 = pat.b;
							var s1 = pat.c;
							var s2 = pat.d;
							return '(' + (ws1 + ($author$project$Printer$Pattern$print(s1) + (',' + (ws2 + ($author$project$Printer$Pattern$print(s2) + (')' + ws3))))));
						} else {
							break _v0$12;
						}
					} else {
						switch (pat.b.$) {
							case 'GuiType':
								var _v12 = pat.a;
								var ws1 = _v12.a;
								var _v13 = pat.b;
								var s1 = pat.c;
								var s2 = pat.d;
								return 'Gui' + (ws1 + ($author$project$Printer$Pattern$print(s1) + $author$project$Printer$Pattern$print(s2)));
							case 'EventType':
								var _v14 = pat.a;
								var ws1 = _v14.a;
								var _v15 = pat.b;
								var s1 = pat.c;
								var s2 = pat.d;
								return 'Event' + (ws1 + ($author$project$Printer$Pattern$print(s1) + $author$project$Printer$Pattern$print(s2)));
							default:
								break _v0$12;
						}
					}
				} else {
					break _v0$12;
				}
			case 'PHtml':
				if ((((pat.a.b && pat.a.b.b) && pat.a.b.b.b) && pat.a.b.b.b.b) && (!pat.a.b.b.b.b.b)) {
					var _v16 = pat.a;
					var ws1 = _v16.a;
					var _v17 = _v16.b;
					var ws2 = _v17.a;
					var _v18 = _v17.b;
					var ws3 = _v18.a;
					var _v19 = _v18.b;
					var ws4 = _v19.a;
					var s = pat.b;
					var s1 = pat.c;
					var s2 = pat.d;
					var s3 = pat.e;
					return 'Html.' + (s + (ws1 + ($author$project$Printer$Pattern$print(s1) + (ws2 + ($author$project$Printer$Pattern$print(s2) + (ws3 + ($author$project$Printer$Pattern$print(s3) + ws4)))))));
				} else {
					break _v0$12;
				}
			case 'PNil':
				if (pat.a.b) {
					if (pat.a.b.b) {
						if (!pat.a.b.b.b) {
							var _v20 = pat.a;
							var ws1 = _v20.a;
							var _v21 = _v20.b;
							var ws2 = _v21.a;
							return '[' + (ws1 + (']' + ws2));
						} else {
							break _v0$12;
						}
					} else {
						var _v22 = pat.a;
						var ws = _v22.a;
						return '\"\"' + ws;
					}
				} else {
					break _v0$12;
				}
			case 'POk':
				if (pat.a.b && (!pat.a.b.b)) {
					var _v23 = pat.a;
					var ws = _v23.a;
					return '_' + ws;
				} else {
					break _v0$12;
				}
			default:
				break _v0$12;
		}
	}
	return 'ERROR #13: Print Pattern Error, pattern=' + $elm$core$Debug$toString(pat);
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
var $author$project$Printer$Exp$listLast = function (xs) {
	listLast:
	while (true) {
		if (!xs.b) {
			return $elm$core$Maybe$Nothing;
		} else {
			if (!xs.b.b) {
				var x = xs.a;
				return $elm$core$Maybe$Just(x);
			} else {
				var ys = xs.b;
				var $temp$xs = ys;
				xs = $temp$xs;
				continue listLast;
			}
		}
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
var $author$project$Printer$Exp$splitLetWSS = function (wss) {
	if ((wss.b && wss.b.b) && wss.b.b.b) {
		var ws1 = wss.a;
		var _v1 = wss.b;
		var declWS1 = _v1.a;
		var _v2 = _v1.b;
		var declWS2 = _v2.a;
		var wss3 = _v2.b;
		return A2(
			$elm$core$Maybe$andThen,
			function (ws2) {
				var declWSS = A2(
					$elm$core$List$take,
					$elm$core$List$length(wss3) - 1,
					wss3);
				return $elm$core$Maybe$Just(
					_Utils_Tuple3(
						ws1,
						_Utils_Tuple3(declWS1, declWS2, declWSS),
						ws2));
			},
			$author$project$Printer$Exp$listLast(wss3));
	} else {
		return $elm$core$Maybe$Nothing;
	}
};
var $author$project$Printer$Exp$print = function (exp) {
	_v11$11:
	while (true) {
		_v11$26:
		while (true) {
			switch (exp.$) {
				case 'EParens':
					if ((exp.a.b && exp.a.b.b) && (!exp.a.b.b.b)) {
						var _v12 = exp.a;
						var ws1 = _v12.a;
						var _v13 = _v12.b;
						var ws2 = _v13.a;
						var e = exp.b;
						return '(' + (ws1 + ($author$project$Printer$Exp$print(e) + (')' + ws2)));
					} else {
						break _v11$26;
					}
				case 'EInt':
					if (exp.a.b && (!exp.a.b.b)) {
						var _v14 = exp.a;
						var ws = _v14.a;
						var n = exp.b;
						return (n < 0) ? ('(' + ($elm$core$Debug$toString(n) + (')' + ws))) : _Utils_ap(
							$elm$core$Debug$toString(n),
							ws);
					} else {
						break _v11$26;
					}
				case 'EBool':
					if (exp.a.b && (!exp.a.b.b)) {
						var _v15 = exp.a;
						var ws = _v15.a;
						var b = exp.b;
						return _Utils_ap(
							$elm$core$Debug$toString(b),
							ws);
					} else {
						break _v11$26;
					}
				case 'EChar':
					var c = exp.b;
					return $elm$core$Debug$toString(c);
				case 'EUPrim':
					if (exp.a.b && (!exp.a.b.b)) {
						var _v16 = exp.a;
						var ws = _v16.a;
						var op = exp.b;
						var e = exp.c;
						var sop = function () {
							if (op.$ === 'Not') {
								return '!';
							} else {
								return '-';
							}
						}();
						return _Utils_ap(
							sop,
							_Utils_ap(
								ws,
								$author$project$Printer$Exp$print(e)));
					} else {
						break _v11$26;
					}
				case 'EVar':
					if (exp.a.b && (!exp.a.b.b)) {
						var _v18 = exp.a;
						var ws = _v18.a;
						var _var = exp.b;
						return _Utils_ap(_var, ws);
					} else {
						break _v11$26;
					}
				case 'ELam':
					if (((exp.a.b && exp.a.b.b) && exp.a.b.b.b) && (!exp.a.b.b.b.b)) {
						var _v19 = exp.a;
						var ws1 = _v19.a;
						var _v20 = _v19.b;
						var ws2 = _v20.a;
						var _v21 = _v20.b;
						var ws3 = _v21.a;
						var par = exp.b;
						var body = exp.c;
						return '\\' + (ws1 + (par + (ws2 + ('->' + (ws3 + $author$project$Printer$Exp$print(body))))));
					} else {
						break _v11$26;
					}
				case 'EApp':
					var e1 = exp.a;
					var e2 = exp.b;
					return _Utils_ap(
						$author$project$Printer$Exp$print(e1),
						$author$project$Printer$Exp$print(e2));
				case 'ELet':
					if (!exp.b.b) {
						if ((exp.a.b && exp.a.b.b) && (!exp.a.b.b.b)) {
							var _v22 = exp.a;
							var ws1 = _v22.a;
							var _v23 = _v22.b;
							var ws2 = _v23.a;
							var body = exp.c;
							return 'let' + (ws1 + ('∅ in' + (ws2 + $author$project$Printer$Exp$print(body))));
						} else {
							break _v11$26;
						}
					} else {
						var wss = exp.a;
						var _v24 = exp.b;
						var _v25 = _v24.a;
						var _var = _v25.a;
						var _v26 = _v25.b;
						var _v27 = _v26.a;
						var nE = _v27.b;
						var decls = _v24.b;
						var body = exp.c;
						var maybeSplitedDeclWSS = $author$project$Printer$Exp$splitLetWSS(wss);
						if (maybeSplitedDeclWSS.$ === 'Just') {
							var _v29 = maybeSplitedDeclWSS.a;
							var ws1 = _v29.a;
							var _v30 = _v29.b;
							var declWS1 = _v30.a;
							var declWS2 = _v30.b;
							var declWSS = _v30.c;
							var ws2 = _v29.c;
							return 'let' + (ws1 + (_var + (declWS1 + ('=' + (declWS2 + ($author$project$Printer$Exp$print(nE) + (A2($author$project$Printer$Exp$printDecls, declWSS, decls) + ('in' + (ws2 + $author$project$Printer$Exp$print(body))))))))));
						} else {
							return 'ERROR #14: Print Let Exp Error, let-exp=' + $elm$core$Debug$toString(exp);
						}
					}
				case 'ECons':
					if (exp.a.b) {
						if (!exp.a.b.b) {
							switch (exp.b.$) {
								case 'StringType':
									var _v31 = exp.a;
									var ws = _v31.a;
									var _v32 = exp.b;
									return '\"' + ($author$project$Printer$Exp$list2Str(exp) + ('\"' + ws));
								case 'ConsType':
									if (exp.c.$ === 'EChar') {
										break _v11$11;
									} else {
										var _v37 = exp.a;
										var ws = _v37.a;
										var _v38 = exp.b;
										var e1 = exp.c;
										var e2 = exp.d;
										return $author$project$Printer$Exp$print(e1) + ('::' + (ws + $author$project$Printer$Exp$print(e2)));
									}
								default:
									if (exp.c.$ === 'EChar') {
										break _v11$11;
									} else {
										var _v39 = exp.a;
										var ws = _v39.a;
										var _v40 = exp.b;
										var e1 = exp.c;
										var e2 = exp.d;
										return ',' + (ws + ($author$project$Printer$Exp$print(e1) + $author$project$Printer$Exp$print(e2)));
									}
							}
						} else {
							if (exp.c.$ === 'EChar') {
								break _v11$11;
							} else {
								if ((!exp.a.b.b.b) && (exp.b.$ === 'SquareType')) {
									var _v41 = exp.a;
									var ws1 = _v41.a;
									var _v42 = _v41.b;
									var ws2 = _v42.a;
									var _v43 = exp.b;
									var e1 = exp.c;
									var e2 = exp.d;
									return '[' + (ws1 + ($author$project$Printer$Exp$print(e1) + ($author$project$Printer$Exp$print(e2) + (']' + ws2))));
								} else {
									break _v11$26;
								}
							}
						}
					} else {
						if (exp.c.$ === 'EChar') {
							break _v11$11;
						} else {
							break _v11$26;
						}
					}
				case 'ETuple':
					if (exp.a.b) {
						if (exp.a.b.b) {
							if ((exp.a.b.b.b && (!exp.a.b.b.b.b)) && (exp.b.$ === 'TupleType')) {
								var _v44 = exp.a;
								var ws1 = _v44.a;
								var _v45 = _v44.b;
								var ws2 = _v45.a;
								var _v46 = _v45.b;
								var ws3 = _v46.a;
								var _v47 = exp.b;
								var e1 = exp.c;
								var e2 = exp.d;
								return '(' + (ws1 + ($author$project$Printer$Exp$print(e1) + (',' + (ws2 + ($author$project$Printer$Exp$print(e2) + (')' + ws3))))));
							} else {
								break _v11$26;
							}
						} else {
							switch (exp.b.$) {
								case 'GuiType':
									var _v48 = exp.a;
									var ws = _v48.a;
									var _v49 = exp.b;
									var e1 = exp.c;
									var e2 = exp.d;
									return 'Gui' + (ws + ($author$project$Printer$Exp$print(e1) + $author$project$Printer$Exp$print(e2)));
								case 'EventType':
									var _v50 = exp.a;
									var ws = _v50.a;
									var _v51 = exp.b;
									var e1 = exp.c;
									var e2 = exp.d;
									return 'Event' + (ws + ($author$project$Printer$Exp$print(e1) + $author$project$Printer$Exp$print(e2)));
								default:
									break _v11$26;
							}
						}
					} else {
						break _v11$26;
					}
				case 'ENil':
					if (!exp.a.b) {
						if (exp.b.$ === 'StringType') {
							var _v36 = exp.b;
							return '\"\" ';
						} else {
							return '';
						}
					} else {
						if (!exp.a.b.b) {
							if (exp.b.$ === 'StringType') {
								var _v34 = exp.a;
								var ws = _v34.a;
								var _v35 = exp.b;
								return '\"\"' + ws;
							} else {
								break _v11$26;
							}
						} else {
							if (!exp.a.b.b.b) {
								var _v52 = exp.a;
								var ws1 = _v52.a;
								var _v53 = _v52.b;
								var ws2 = _v53.a;
								return '[' + (ws1 + (']' + ws2));
							} else {
								break _v11$26;
							}
						}
					}
				case 'EHtml':
					if (exp.a.b && (!exp.a.b.b)) {
						var _v54 = exp.a;
						var ws = _v54.a;
						var s = exp.b;
						var e1 = exp.c;
						var e2 = exp.d;
						var e3 = exp.e;
						return 'Html.' + (s + (ws + ($author$project$Printer$Exp$print(e1) + ($author$project$Printer$Exp$print(e2) + $author$project$Printer$Exp$print(e3)))));
					} else {
						break _v11$26;
					}
				case 'ECase':
					if ((exp.a.b && exp.a.b.b) && (!exp.a.b.b.b)) {
						var _v55 = exp.a;
						var ws1 = _v55.a;
						var _v56 = _v55.b;
						var ws2 = _v56.a;
						var e = exp.b;
						var branch = exp.c;
						return 'case' + (ws1 + ($author$project$Printer$Exp$print(e) + ('of' + (ws2 + $author$project$Printer$Exp$printBranch(branch)))));
					} else {
						break _v11$26;
					}
				case 'EBPrim':
					if (exp.a.b && (!exp.a.b.b)) {
						var _v57 = exp.a;
						var ws = _v57.a;
						var op = exp.b;
						var e1 = exp.c;
						var e2 = exp.d;
						var sop = function () {
							switch (op.$) {
								case 'Add':
									return '+';
								case 'Sub':
									return '-';
								case 'Mul':
									return '*';
								case 'Mod':
									return '%';
								case 'Cat':
									return '++';
								case 'Eq':
									return '==';
								case 'Ne':
									return '!=';
								case 'Lt':
									return '<';
								case 'Gt':
									return '>';
								case 'Le':
									return '<=';
								case 'Ge':
									return '>=';
								case 'And':
									return '&&';
								default:
									return '||';
							}
						}();
						return _Utils_ap(
							$author$project$Printer$Exp$print(e1),
							_Utils_ap(
								sop,
								_Utils_ap(
									ws,
									$author$project$Printer$Exp$print(e2))));
					} else {
						break _v11$26;
					}
				default:
					var info = exp.a;
					return info;
			}
		}
		return 'ERROR #08: Print Exp Error, exp=' + $elm$core$Debug$toString(exp);
	}
	var _v33 = exp.c;
	return '\"' + ($author$project$Printer$Exp$list2Str(exp) + '\" ');
};
var $author$project$Printer$Exp$printBranch = function (branch) {
	_v8$2:
	while (true) {
		if (branch.$ === 'BSin') {
			if (branch.a.b && (!branch.a.b.b)) {
				var _v9 = branch.a;
				var ws = _v9.a;
				var p = branch.b;
				var e = branch.c;
				return $author$project$Printer$Pattern$print(p) + ('->' + (ws + $author$project$Printer$Exp$print(e)));
			} else {
				break _v8$2;
			}
		} else {
			if (branch.a.b && (!branch.a.b.b)) {
				var _v10 = branch.a;
				var ws = _v10.a;
				var b1 = branch.b;
				var b2 = branch.c;
				return $author$project$Printer$Exp$printBranch(b1) + ('|' + (ws + $author$project$Printer$Exp$printBranch(b2)));
			} else {
				break _v8$2;
			}
		}
	}
	return 'ERROR #16: Print Case Exp Branch Error, branch=' + $elm$core$Debug$toString(branch);
};
var $author$project$Printer$Exp$printDecls = F2(
	function (wss, declarations) {
		var _v0 = _Utils_Tuple2(wss, declarations);
		_v0$2:
		while (true) {
			if (_v0.a.b) {
				if ((_v0.a.b.b && _v0.a.b.b.b) && _v0.b.b) {
					var _v1 = _v0.a;
					var ws1 = _v1.a;
					var _v2 = _v1.b;
					var ws2 = _v2.a;
					var _v3 = _v2.b;
					var ws3 = _v3.a;
					var wssTail = _v3.b;
					var _v4 = _v0.b;
					var _v5 = _v4.a;
					var _var = _v5.a;
					var _v6 = _v5.b;
					var _v7 = _v6.a;
					var nE = _v7.b;
					var decls = _v4.b;
					return ',' + (ws1 + (_var + (ws2 + ('=' + (ws3 + ($author$project$Printer$Exp$print(nE) + A2($author$project$Printer$Exp$printDecls, wssTail, decls)))))));
				} else {
					break _v0$2;
				}
			} else {
				if (!_v0.b.b) {
					return '';
				} else {
					break _v0$2;
				}
			}
		}
		return 'ERROR #15: Print Let Exp Declaration Error, declarations=' + ($elm$core$Debug$toString(declarations) + (' wss=' + $elm$core$Debug$toString(wss)));
	});
var $author$project$Printer$Delta$print = function (dv) {
	switch (dv.$) {
		case 'DZero':
			return '??';
		case 'DId':
			return 'id';
		case 'DRem':
			return 'remove';
		case 'DAdd':
			var n = dv.a;
			return '+' + $elm$core$Debug$toString(n);
		case 'DTuple':
			var dv1 = dv.a;
			var dv2 = dv.b;
			return '(' + ($author$project$Printer$Delta$print(dv1) + (', ' + ($author$project$Printer$Delta$print(dv2) + ')')));
		case 'DInsert':
			var n = dv.a;
			var e = dv.b;
			return 'insert ' + ($elm$core$Debug$toString(n) + (' ' + $author$project$Printer$Exp$print(e)));
		case 'DDelete':
			var n = dv.a;
			return 'delete ' + $elm$core$Debug$toString(n);
		case 'DCons':
			var dv1 = dv.b;
			var dv2 = dv.c;
			return $author$project$Printer$Delta$print(dv1) + ('::' + $author$project$Printer$Delta$print(dv2));
		case 'DHtml':
			var s = dv.a;
			var dv1 = dv.b;
			var dv2 = dv.c;
			var dv3 = dv.d;
			return 'html ' + (s + (' ' + ($author$project$Printer$Delta$print(dv1) + (' ' + ($author$project$Printer$Delta$print(dv2) + (' ' + $author$project$Printer$Delta$print(dv3)))))));
		case 'DLam':
			var e = dv.a;
			var dv1 = dv.b;
			return '\\' + ($author$project$Printer$Exp$print(e) + ('->' + $author$project$Printer$Delta$print(dv1)));
		default:
			var dv1 = dv.a;
			var dv2 = dv.b;
			return '(' + ($author$project$Printer$Delta$print(dv1) + ('.' + ($author$project$Printer$Delta$print(dv2) + ')')));
	}
};
var $author$project$LangUtils$Delta$drop = F2(
	function (n, dv) {
		var _v0 = _Utils_Tuple2(n, dv);
		_v0$0:
		while (true) {
			if (_v0.b.$ === 'DCom') {
				if (!_v0.a) {
					break _v0$0;
				} else {
					if (_v0.b.b.$ === 'DZero') {
						var _v1 = _v0.b;
						var _v2 = _v1.b;
						return $elm$core$Result$Ok(
							_Utils_Tuple2($author$project$Syntax$DZero, n - 1));
					} else {
						var _v3 = _v0.b;
						var dv1 = _v3.a;
						var dv2 = _v3.b;
						return A2(
							$elm$core$Result$andThen,
							function (_v4) {
								var n_ = _v4.b;
								return (!n_) ? $elm$core$Result$Ok(
									_Utils_Tuple2(dv1, 0)) : $elm$core$Result$Ok(
									_Utils_Tuple2($author$project$Syntax$DZero, n - 1));
							},
							A2($author$project$LangUtils$Delta$drop, n, dv2));
					}
				}
			} else {
				if (!_v0.a) {
					break _v0$0;
				} else {
					return $elm$core$Result$Err(
						'Tried to drop n > 0 from non-compositional delta: ' + $author$project$Printer$Delta$print(dv));
				}
			}
		}
		return $elm$core$Result$Ok(
			_Utils_Tuple2(dv, 0));
	});
var $author$project$LangUtils$Equality$eqBranch = F2(
	function (br1, br2) {
		var _v40 = _Utils_Tuple2(br1, br2);
		_v40$2:
		while (true) {
			if (_v40.a.$ === 'BSin') {
				if (_v40.b.$ === 'BSin') {
					var _v41 = _v40.a;
					var p1 = _v41.b;
					var e1 = _v41.c;
					var _v42 = _v40.b;
					var p2 = _v42.b;
					var e2 = _v42.c;
					return _Utils_eq(p1, p2) && A2($author$project$LangUtils$Equality$eqExp, e1, e2);
				} else {
					break _v40$2;
				}
			} else {
				if (_v40.b.$ === 'BCom') {
					var _v43 = _v40.a;
					var br1a = _v43.b;
					var br1b = _v43.c;
					var _v44 = _v40.b;
					var br2a = _v44.b;
					var br2b = _v44.c;
					return A2($author$project$LangUtils$Equality$eqBranch, br1a, br2a) && A2($author$project$LangUtils$Equality$eqBranch, br1b, br2b);
				} else {
					break _v40$2;
				}
			}
		}
		return false;
	});
var $author$project$LangUtils$Equality$eqDecls = F2(
	function (decls1, decls2) {
		var _v31 = _Utils_Tuple2(decls1, decls2);
		_v31$2:
		while (true) {
			if (_v31.a.b) {
				if (_v31.b.b) {
					var _v32 = _v31.a;
					var _v33 = _v32.a;
					var var1 = _v33.a;
					var _v34 = _v33.b;
					var _v35 = _v34.a;
					var nE1 = _v35.b;
					var decls1_ = _v32.b;
					var _v36 = _v31.b;
					var _v37 = _v36.a;
					var var2 = _v37.a;
					var _v38 = _v37.b;
					var _v39 = _v38.a;
					var nE2 = _v39.b;
					var decls2_ = _v36.b;
					return _Utils_eq(var1, var2) && (A2($author$project$LangUtils$Equality$eqExp, nE1, nE2) && A2($author$project$LangUtils$Equality$eqDecls, decls1_, decls2_));
				} else {
					break _v31$2;
				}
			} else {
				if (!_v31.b.b) {
					return true;
				} else {
					break _v31$2;
				}
			}
		}
		return false;
	});
var $author$project$LangUtils$Equality$eqExp = F2(
	function (exp1, exp2) {
		eqExp:
		while (true) {
			var _v0 = _Utils_Tuple2(exp1, exp2);
			_v0$1:
			while (true) {
				_v0$16:
				while (true) {
					switch (_v0.a.$) {
						case 'EParens':
							var _v1 = _v0.a;
							var e1 = _v1.b;
							var e2 = _v0.b;
							var $temp$exp1 = e1,
								$temp$exp2 = e2;
							exp1 = $temp$exp1;
							exp2 = $temp$exp2;
							continue eqExp;
						case 'EInt':
							switch (_v0.b.$) {
								case 'EParens':
									break _v0$1;
								case 'EInt':
									var _v3 = _v0.a;
									var n1 = _v3.b;
									var _v4 = _v0.b;
									var n2 = _v4.b;
									return _Utils_eq(n1, n2);
								default:
									break _v0$16;
							}
						case 'EBool':
							switch (_v0.b.$) {
								case 'EParens':
									break _v0$1;
								case 'EBool':
									var _v5 = _v0.a;
									var b1 = _v5.b;
									var _v6 = _v0.b;
									var b2 = _v6.b;
									return _Utils_eq(b1, b2);
								default:
									break _v0$16;
							}
						case 'EChar':
							switch (_v0.b.$) {
								case 'EParens':
									break _v0$1;
								case 'EChar':
									var _v7 = _v0.a;
									var c1 = _v7.b;
									var _v8 = _v0.b;
									var c2 = _v8.b;
									return _Utils_eq(c1, c2);
								default:
									break _v0$16;
							}
						case 'EVar':
							switch (_v0.b.$) {
								case 'EParens':
									break _v0$1;
								case 'EVar':
									var _v9 = _v0.a;
									var x = _v9.b;
									var _v10 = _v0.b;
									var y = _v10.b;
									return _Utils_eq(x, y);
								default:
									break _v0$16;
							}
						case 'ELam':
							switch (_v0.b.$) {
								case 'EParens':
									break _v0$1;
								case 'ELam':
									var _v11 = _v0.a;
									var e1 = _v11.c;
									var _v12 = _v0.b;
									var e2 = _v12.c;
									var $temp$exp1 = e1,
										$temp$exp2 = e2;
									exp1 = $temp$exp1;
									exp2 = $temp$exp2;
									continue eqExp;
								default:
									break _v0$16;
							}
						case 'EApp':
							switch (_v0.b.$) {
								case 'EParens':
									break _v0$1;
								case 'EApp':
									var _v13 = _v0.a;
									var ef1 = _v13.a;
									var e1 = _v13.b;
									var _v14 = _v0.b;
									var ef2 = _v14.a;
									var e2 = _v14.b;
									return A2($author$project$LangUtils$Equality$eqExp, ef1, ef2) && A2($author$project$LangUtils$Equality$eqExp, e1, e2);
								default:
									break _v0$16;
							}
						case 'ELet':
							switch (_v0.b.$) {
								case 'EParens':
									break _v0$1;
								case 'ELet':
									var _v15 = _v0.a;
									var decls1 = _v15.b;
									var e1 = _v15.c;
									var _v16 = _v0.b;
									var decls2 = _v16.b;
									var e2 = _v16.c;
									return A2($author$project$LangUtils$Equality$eqDecls, decls1, decls2) && A2($author$project$LangUtils$Equality$eqExp, e1, e2);
								default:
									break _v0$16;
							}
						case 'ECons':
							switch (_v0.b.$) {
								case 'EParens':
									break _v0$1;
								case 'ECons':
									var _v17 = _v0.a;
									var ehd1 = _v17.c;
									var etl1 = _v17.d;
									var _v18 = _v0.b;
									var ehd2 = _v18.c;
									var etl2 = _v18.d;
									return A2($author$project$LangUtils$Equality$eqExp, ehd1, ehd2) && A2($author$project$LangUtils$Equality$eqExp, etl1, etl2);
								default:
									break _v0$16;
							}
						case 'ENil':
							switch (_v0.b.$) {
								case 'EParens':
									break _v0$1;
								case 'ENil':
									var _v19 = _v0.a;
									var _v20 = _v0.b;
									return true;
								default:
									break _v0$16;
							}
						case 'EHtml':
							switch (_v0.b.$) {
								case 'EParens':
									break _v0$1;
								case 'EHtml':
									var _v21 = _v0.a;
									var s1 = _v21.b;
									var e1 = _v21.c;
									var e2 = _v21.d;
									var e3 = _v21.e;
									var _v22 = _v0.b;
									var s2 = _v22.b;
									var e4 = _v22.c;
									var e5 = _v22.d;
									var e6 = _v22.e;
									return _Utils_eq(s1, s2) && (A2($author$project$LangUtils$Equality$eqExp, e1, e4) && (A2($author$project$LangUtils$Equality$eqExp, e2, e5) && A2($author$project$LangUtils$Equality$eqExp, e3, e6)));
								default:
									break _v0$16;
							}
						case 'ETuple':
							switch (_v0.b.$) {
								case 'EParens':
									break _v0$1;
								case 'ETuple':
									var _v23 = _v0.a;
									var e1a = _v23.c;
									var e1b = _v23.d;
									var _v24 = _v0.b;
									var e2a = _v24.c;
									var e2b = _v24.d;
									return A2($author$project$LangUtils$Equality$eqExp, e1a, e2a) && A2($author$project$LangUtils$Equality$eqExp, e1b, e2b);
								default:
									break _v0$16;
							}
						case 'ECase':
							switch (_v0.b.$) {
								case 'EParens':
									break _v0$1;
								case 'ECase':
									var _v25 = _v0.a;
									var e1 = _v25.b;
									var br1 = _v25.c;
									var _v26 = _v0.b;
									var e2 = _v26.b;
									var br2 = _v26.c;
									return A2($author$project$LangUtils$Equality$eqExp, e1, e2) && A2($author$project$LangUtils$Equality$eqBranch, br1, br2);
								default:
									break _v0$16;
							}
						case 'EUPrim':
							switch (_v0.b.$) {
								case 'EParens':
									break _v0$1;
								case 'EUPrim':
									var _v27 = _v0.a;
									var op1 = _v27.b;
									var e1 = _v27.c;
									var _v28 = _v0.b;
									var op2 = _v28.b;
									var e2 = _v28.c;
									return _Utils_eq(op2, op1) && A2($author$project$LangUtils$Equality$eqExp, e1, e2);
								default:
									break _v0$16;
							}
						case 'EBPrim':
							switch (_v0.b.$) {
								case 'EParens':
									break _v0$1;
								case 'EBPrim':
									var _v29 = _v0.a;
									var bop1 = _v29.b;
									var e1a = _v29.c;
									var e1b = _v29.d;
									var _v30 = _v0.b;
									var bop2 = _v30.b;
									var e2a = _v30.c;
									var e2b = _v30.d;
									return _Utils_eq(bop2, bop1) && (A2($author$project$LangUtils$Equality$eqExp, e1a, e2a) && A2($author$project$LangUtils$Equality$eqExp, e1b, e2b));
								default:
									break _v0$16;
							}
						default:
							if (_v0.b.$ === 'EParens') {
								break _v0$1;
							} else {
								break _v0$16;
							}
					}
				}
				return false;
			}
			var e1 = _v0.a;
			var _v2 = _v0.b;
			var e2 = _v2.b;
			var $temp$exp1 = e1,
				$temp$exp2 = e2;
			exp1 = $temp$exp1;
			exp2 = $temp$exp2;
			continue eqExp;
		}
	});
var $author$project$LangUtils$Rename$freshName = F2(
	function (x, id) {
		return _Utils_Tuple2(
			_Utils_ap(
				x,
				$elm$core$Debug$toString(id)),
			id + 1);
	});
var $author$project$Syntax$EBool = F2(
	function (a, b) {
		return {$: 'EBool', a: a, b: b};
	});
var $author$project$Utils$delete = F2(
	function (x, xvs) {
		if (!xvs.b) {
			return _List_Nil;
		} else {
			var _v1 = xvs.a;
			var x1 = _v1.a;
			var v1 = _v1.b;
			var xvs_ = xvs.b;
			if (_Utils_eq(x1, x)) {
				return xvs_;
			} else {
				var ls1 = A2($author$project$Utils$delete, x, xvs_);
				return A2(
					$elm$core$List$cons,
					_Utils_Tuple2(x1, v1),
					ls1);
			}
		}
	});
var $author$project$Syntax$eBoolDefaultWSS = _List_fromArray(
	[' ']);
var $author$project$Eval$expToResult = function (e) {
	if (e.$ === 'EError') {
		var s = e.a;
		return $elm$core$Result$Err(s);
	} else {
		return $elm$core$Result$Ok(e);
	}
};
var $elm$core$Basics$ge = _Utils_ge;
var $author$project$LangUtils$WHNF$isWHNF = function (exp) {
	switch (exp.$) {
		case 'EInt':
			return true;
		case 'EBool':
			return true;
		case 'EChar':
			return true;
		case 'ELam':
			return true;
		case 'ECons':
			return true;
		case 'ENil':
			return true;
		case 'ETuple':
			return true;
		case 'EHtml':
			return true;
		case 'EError':
			return true;
		default:
			return false;
	}
};
var $elm$core$Basics$modBy = _Basics_modBy;
var $elm$core$Basics$negate = function (n) {
	return -n;
};
var $elm$core$Basics$neq = _Utils_notEqual;
var $elm$core$Basics$not = _Basics_not;
var $author$project$Syntax$BCom = F3(
	function (a, b, c) {
		return {$: 'BCom', a: a, b: b, c: c};
	});
var $author$project$LangUtils$Rename$renameDecls = F2(
	function (declarations, id) {
		if (declarations.b) {
			var _v1 = declarations.a;
			var _var = _v1.a;
			var _v2 = _v1.b;
			var binding = _v2.a;
			var dv = _v2.b;
			var flag = _v2.c;
			var decls = declarations.b;
			var _v3 = A2($author$project$LangUtils$Rename$freshName, 'i', id);
			var y = _v3.a;
			var id1 = _v3.b;
			var _v4 = A2($author$project$LangUtils$Rename$renameDecls, decls, id1);
			var decls_ = _v4.a;
			var id_ = _v4.b;
			var renameSet1 = _v4.c;
			var declarations_ = A2(
				$elm$core$List$cons,
				_Utils_Tuple2(
					y,
					_Utils_Tuple3(binding, dv, flag)),
				decls_);
			return _Utils_Tuple3(
				declarations_,
				id_,
				A2(
					$elm$core$List$cons,
					_Utils_Tuple2(_var, y),
					renameSet1));
		} else {
			return _Utils_Tuple3(_List_Nil, id, _List_Nil);
		}
	});
var $author$project$LangUtils$Substitute$containsVar = F2(
	function (s1, p) {
		switch (p.$) {
			case 'PVar':
				var s = p.b;
				return _Utils_eq(s, s1);
			case 'PTuple':
				var p1 = p.c;
				var p2 = p.d;
				return A2($author$project$LangUtils$Substitute$containsVar, s1, p1) || A2($author$project$LangUtils$Substitute$containsVar, s1, p2);
			case 'PCons':
				var p1 = p.c;
				var p2 = p.d;
				return A2($author$project$LangUtils$Substitute$containsVar, s1, p1) || A2($author$project$LangUtils$Substitute$containsVar, s1, p2);
			default:
				return false;
		}
	});
var $author$project$LangUtils$Substitute$substBranch = F3(
	function (branch, s1, s2) {
		if (branch.$ === 'BSin') {
			var wss = branch.a;
			var p = branch.b;
			var exp = branch.c;
			return A2($author$project$LangUtils$Substitute$containsVar, s1, p) ? branch : A3(
				$author$project$Syntax$BSin,
				wss,
				p,
				A3($author$project$LangUtils$Substitute$substExp, exp, s1, s2));
		} else {
			var wss = branch.a;
			var b1 = branch.b;
			var b2 = branch.c;
			return A3(
				$author$project$Syntax$BCom,
				wss,
				A3($author$project$LangUtils$Substitute$substBranch, b1, s1, s2),
				A3($author$project$LangUtils$Substitute$substBranch, b2, s1, s2));
		}
	});
var $author$project$LangUtils$Substitute$substDecls = F3(
	function (declarations, s1, s2) {
		if (declarations.b) {
			var _v2 = declarations.a;
			var var1 = _v2.a;
			var _v3 = _v2.b;
			var _v4 = _v3.a;
			var oE = _v4.a;
			var nE = _v4.b;
			var dv = _v3.b;
			var flag = _v3.c;
			var decls = declarations.b;
			var _var = _Utils_eq(var1, s1) ? s2 : var1;
			return A2(
				$elm$core$List$cons,
				_Utils_Tuple2(
					_var,
					_Utils_Tuple3(
						_Utils_Tuple2(
							A3($author$project$LangUtils$Substitute$substExp, oE, s1, s2),
							A3($author$project$LangUtils$Substitute$substExp, nE, s1, s2)),
						dv,
						flag)),
				A3($author$project$LangUtils$Substitute$substDecls, decls, s1, s2));
		} else {
			return _List_Nil;
		}
	});
var $author$project$LangUtils$Substitute$substExp = F3(
	function (exp, s1, s2) {
		switch (exp.$) {
			case 'EParens':
				var wss = exp.a;
				var e = exp.b;
				return A2(
					$author$project$Syntax$EParens,
					wss,
					A3($author$project$LangUtils$Substitute$substExp, e, s1, s2));
			case 'EVar':
				var wss = exp.a;
				var s = exp.b;
				return _Utils_eq(s, s1) ? A3($author$project$Syntax$EVar, wss, s2, 0) : exp;
			case 'ELam':
				var wss = exp.a;
				var par1 = exp.b;
				var body = exp.c;
				return _Utils_eq(par1, s1) ? exp : A3(
					$author$project$Syntax$ELam,
					wss,
					par1,
					A3($author$project$LangUtils$Substitute$substExp, body, s1, s2));
			case 'EApp':
				var fun = exp.a;
				var arg = exp.b;
				return A2(
					$author$project$Syntax$EApp,
					A3($author$project$LangUtils$Substitute$substExp, fun, s1, s2),
					A3($author$project$LangUtils$Substitute$substExp, arg, s1, s2));
			case 'ELet':
				var wss = exp.a;
				var decls = exp.b;
				var body = exp.c;
				return A3(
					$author$project$Syntax$ELet,
					wss,
					A3($author$project$LangUtils$Substitute$substDecls, decls, s1, s2),
					A3($author$project$LangUtils$Substitute$substExp, body, s1, s2));
			case 'ECons':
				var wss = exp.a;
				var lType = exp.b;
				var e1 = exp.c;
				var e2 = exp.d;
				return A4(
					$author$project$Syntax$ECons,
					wss,
					lType,
					A3($author$project$LangUtils$Substitute$substExp, e1, s1, s2),
					A3($author$project$LangUtils$Substitute$substExp, e2, s1, s2));
			case 'ETuple':
				var wss = exp.a;
				var tType = exp.b;
				var e1 = exp.c;
				var e2 = exp.d;
				return A4(
					$author$project$Syntax$ETuple,
					wss,
					tType,
					A3($author$project$LangUtils$Substitute$substExp, e1, s1, s2),
					A3($author$project$LangUtils$Substitute$substExp, e2, s1, s2));
			case 'EHtml':
				var wss = exp.a;
				var s = exp.b;
				var e1 = exp.c;
				var e2 = exp.d;
				var e3 = exp.e;
				return A5(
					$author$project$Syntax$EHtml,
					wss,
					s,
					A3($author$project$LangUtils$Substitute$substExp, e1, s1, s2),
					A3($author$project$LangUtils$Substitute$substExp, e2, s1, s2),
					A3($author$project$LangUtils$Substitute$substExp, e3, s1, s2));
			case 'ECase':
				var wss = exp.a;
				var guard = exp.b;
				var branch = exp.c;
				var guard_ = A3($author$project$LangUtils$Substitute$substExp, guard, s1, s2);
				var branch_ = A3($author$project$LangUtils$Substitute$substBranch, branch, s1, s2);
				return A3($author$project$Syntax$ECase, wss, guard_, branch_);
			case 'EUPrim':
				var wss = exp.a;
				var op = exp.b;
				var e = exp.c;
				return A3(
					$author$project$Syntax$EUPrim,
					wss,
					op,
					A3($author$project$LangUtils$Substitute$substExp, e, s1, s2));
			case 'EBPrim':
				var wss = exp.a;
				var op = exp.b;
				var e1 = exp.c;
				var e2 = exp.d;
				return A4(
					$author$project$Syntax$EBPrim,
					wss,
					op,
					A3($author$project$LangUtils$Substitute$substExp, e1, s1, s2),
					A3($author$project$LangUtils$Substitute$substExp, e2, s1, s2));
			default:
				return exp;
		}
	});
var $author$project$LangUtils$Substitute$substSet = F2(
	function (ei, renamedvars) {
		if (renamedvars.b) {
			var _v1 = renamedvars.a;
			var s1 = _v1.a;
			var s2 = _v1.b;
			var renamedvars_ = renamedvars.b;
			var ei_ = A2($author$project$LangUtils$Substitute$substSet, ei, renamedvars_);
			return A3($author$project$LangUtils$Substitute$substExp, ei_, s1, s2);
		} else {
			return ei;
		}
	});
var $author$project$LangUtils$Rename$renameBranch = F2(
	function (branch, id) {
		if (branch.$ === 'BSin') {
			var wss = branch.a;
			var p = branch.b;
			var e = branch.c;
			var _v20 = A2($author$project$LangUtils$Rename$renameExp, e, id);
			var e_ = _v20.a;
			var id_ = _v20.b;
			var renameSet = _v20.c;
			return _Utils_Tuple3(
				A3($author$project$Syntax$BSin, wss, p, e_),
				id_,
				renameSet);
		} else {
			var wss = branch.a;
			var b1 = branch.b;
			var b2 = branch.c;
			var _v21 = A2($author$project$LangUtils$Rename$renameBranch, b1, id);
			var b1_ = _v21.a;
			var id1 = _v21.b;
			var renameSet1 = _v21.c;
			var _v22 = A2($author$project$LangUtils$Rename$renameBranch, b2, id1);
			var b2_ = _v22.a;
			var id2 = _v22.b;
			var renameSet2 = _v22.c;
			return _Utils_Tuple3(
				A3($author$project$Syntax$BCom, wss, b1_, b2_),
				id2,
				_Utils_ap(renameSet1, renameSet2));
		}
	});
var $author$project$LangUtils$Rename$renameExp = F2(
	function (exp, id) {
		switch (exp.$) {
			case 'EParens':
				var wss = exp.a;
				var e = exp.b;
				var _v1 = A2($author$project$LangUtils$Rename$renameExp, e, id);
				var e_ = _v1.a;
				var id_ = _v1.b;
				var renameSet = _v1.c;
				return _Utils_Tuple3(
					A2($author$project$Syntax$EParens, wss, e_),
					id_,
					renameSet);
			case 'ELam':
				var wss = exp.a;
				var par = exp.b;
				var body = exp.c;
				var _v2 = A2($author$project$LangUtils$Rename$renameExp, body, id);
				var body_ = _v2.a;
				var id_ = _v2.b;
				var renameSet = _v2.c;
				return _Utils_Tuple3(
					A3($author$project$Syntax$ELam, wss, par, body_),
					id_,
					renameSet);
			case 'EApp':
				var fun = exp.a;
				var arg = exp.b;
				var _v3 = A2($author$project$LangUtils$Rename$renameExp, fun, id);
				var fun_ = _v3.a;
				var id_ = _v3.b;
				var renameSet = _v3.c;
				return _Utils_Tuple3(
					A2($author$project$Syntax$EApp, fun_, arg),
					id_,
					renameSet);
			case 'ELet':
				var wss = exp.a;
				var decls = exp.b;
				var body = exp.c;
				var _v4 = A2($author$project$LangUtils$Rename$renameDecls, decls, id);
				var decls1 = _v4.a;
				var id1 = _v4.b;
				var renameSet1 = _v4.c;
				var body1 = A2($author$project$LangUtils$Substitute$substSet, body, renameSet1);
				var _v5 = A2($author$project$LangUtils$Rename$renameExp, body1, id1);
				var body2 = _v5.a;
				var id2 = _v5.b;
				var renameSet2 = _v5.c;
				var decls2 = A3(
					$elm$core$List$foldl,
					function (_v6) {
						var s1 = _v6.a;
						var s2 = _v6.b;
						return function (decls_) {
							return A3($author$project$LangUtils$Substitute$substDecls, decls_, s1, s2);
						};
					},
					decls1,
					renameSet1);
				return _Utils_Tuple3(
					A3($author$project$Syntax$ELet, wss, decls2, body2),
					id2,
					_Utils_ap(renameSet1, renameSet2));
			case 'ECons':
				var wss = exp.a;
				var lType = exp.b;
				var e1 = exp.c;
				var e2 = exp.d;
				var _v7 = A2($author$project$LangUtils$Rename$renameExp, e1, id);
				var e1_ = _v7.a;
				var id1 = _v7.b;
				var renameSet1 = _v7.c;
				var _v8 = A2($author$project$LangUtils$Rename$renameExp, e2, id1);
				var e2_ = _v8.a;
				var id2 = _v8.b;
				var renameSet2 = _v8.c;
				return _Utils_Tuple3(
					A4($author$project$Syntax$ECons, wss, lType, e1_, e2_),
					id2,
					_Utils_ap(renameSet1, renameSet2));
			case 'EHtml':
				var wss = exp.a;
				var s = exp.b;
				var e1 = exp.c;
				var e2 = exp.d;
				var e3 = exp.e;
				var _v9 = A2($author$project$LangUtils$Rename$renameExp, e1, id);
				var e1_ = _v9.a;
				var id1 = _v9.b;
				var renameSet1 = _v9.c;
				var _v10 = A2($author$project$LangUtils$Rename$renameExp, e2, id1);
				var e2_ = _v10.a;
				var id2 = _v10.b;
				var renameSet2 = _v10.c;
				var _v11 = A2($author$project$LangUtils$Rename$renameExp, e3, id2);
				var e3_ = _v11.a;
				var id3 = _v11.b;
				var renameSet3 = _v11.c;
				return _Utils_Tuple3(
					A5($author$project$Syntax$EHtml, wss, s, e1_, e2_, e3_),
					id3,
					_Utils_ap(
						renameSet1,
						_Utils_ap(renameSet2, renameSet3)));
			case 'ETuple':
				var wss = exp.a;
				var tType = exp.b;
				var e1 = exp.c;
				var e2 = exp.d;
				var _v12 = A2($author$project$LangUtils$Rename$renameExp, e1, id);
				var e1_ = _v12.a;
				var id1 = _v12.b;
				var renameSet1 = _v12.c;
				var _v13 = A2($author$project$LangUtils$Rename$renameExp, e2, id1);
				var e2_ = _v13.a;
				var id2 = _v13.b;
				var renameSet2 = _v13.c;
				return _Utils_Tuple3(
					A4($author$project$Syntax$ETuple, wss, tType, e1_, e2_),
					id2,
					_Utils_ap(renameSet1, renameSet2));
			case 'ECase':
				var wss = exp.a;
				var guard = exp.b;
				var branch = exp.c;
				var _v14 = A2($author$project$LangUtils$Rename$renameExp, guard, id);
				var guard_ = _v14.a;
				var id1 = _v14.b;
				var renameSet1 = _v14.c;
				var _v15 = A2($author$project$LangUtils$Rename$renameBranch, branch, id1);
				var branch_ = _v15.a;
				var id2 = _v15.b;
				var renameSet2 = _v15.c;
				return _Utils_Tuple3(
					A3($author$project$Syntax$ECase, wss, guard_, branch_),
					id2,
					_Utils_ap(renameSet1, renameSet2));
			case 'EUPrim':
				var wss = exp.a;
				var op = exp.b;
				var e = exp.c;
				var _v16 = A2($author$project$LangUtils$Rename$renameExp, e, id);
				var e_ = _v16.a;
				var id1 = _v16.b;
				var renameSet1 = _v16.c;
				return _Utils_Tuple3(
					A3($author$project$Syntax$EUPrim, wss, op, e_),
					id1,
					renameSet1);
			case 'EBPrim':
				var wss = exp.a;
				var op = exp.b;
				var e1 = exp.c;
				var e2 = exp.d;
				var _v17 = A2($author$project$LangUtils$Rename$renameExp, e1, id);
				var e1_ = _v17.a;
				var id1 = _v17.b;
				var renameSet1 = _v17.c;
				var _v18 = A2($author$project$LangUtils$Rename$renameExp, e2, id1);
				var e2_ = _v18.a;
				var id2 = _v18.b;
				var renameSet2 = _v18.c;
				return _Utils_Tuple3(
					A4($author$project$Syntax$EBPrim, wss, op, e1_, e2_),
					id2,
					_Utils_ap(renameSet1, renameSet2));
			default:
				return _Utils_Tuple3(exp, id, _List_Nil);
		}
	});
var $author$project$Eval$append = F4(
	function (e1, e2, heap, id) {
		append:
		while (true) {
			switch (e1.$) {
				case 'ECons':
					if (e1.d.$ === 'ENil') {
						var wss = e1.a;
						var lType = e1.b;
						var e11 = e1.c;
						var _v85 = e1.d;
						if (e2.$ === 'ENil') {
							return $elm$core$Result$Ok(
								_Utils_Tuple3(heap, e1, id));
						} else {
							return A2(
								$elm$core$Result$andThen,
								function (_v87) {
									var heap_ = _v87.a;
									var e2_ = _v87.b;
									var id_ = _v87.c;
									return $elm$core$Result$Ok(
										_Utils_Tuple3(
											heap_,
											A4(
												$author$project$Syntax$ECons,
												wss,
												lType,
												e11,
												A2(
													$author$project$Parser$Utils$repWS,
													_List_fromArray(
														[' ']),
													e2_)),
											id_));
								},
								A3($author$project$Eval$fwd, heap, e2, id));
						}
					} else {
						var wss = e1.a;
						var lType = e1.b;
						var e11 = e1.c;
						var e12 = e1.d;
						return A2(
							$elm$core$Result$andThen,
							function (_v88) {
								var heap_ = _v88.a;
								var e12_ = _v88.b;
								var id_ = _v88.c;
								return $elm$core$Result$Ok(
									_Utils_Tuple3(
										heap_,
										A4($author$project$Syntax$ECons, wss, lType, e11, e12_),
										id_));
							},
							A4($author$project$Eval$append, e12, e2, heap, id));
					}
				case 'ENil':
					var lType = e1.b;
					var $temp$e1 = e2,
						$temp$e2 = A2($author$project$Syntax$ENil, $author$project$Syntax$eNilDefaultWSS, lType),
						$temp$heap = heap,
						$temp$id = id;
					e1 = $temp$e1;
					e2 = $temp$e2;
					heap = $temp$heap;
					id = $temp$id;
					continue append;
				default:
					return A2(
						$elm$core$Result$andThen,
						function (_v89) {
							var heap_ = _v89.a;
							var e1_ = _v89.b;
							var id_ = _v89.c;
							return A4($author$project$Eval$append, e1_, e2, heap_, id_);
						},
						A3($author$project$Eval$fwd, heap, e1, id));
			}
		}
	});
var $author$project$Eval$fwd = F3(
	function (heap, exp, id) {
		fwd:
		while (true) {
			switch (exp.$) {
				case 'EError':
					var err = exp.a;
					return $elm$core$Result$Err(err);
				case 'EParens':
					var e = exp.b;
					var $temp$heap = heap,
						$temp$exp = e,
						$temp$id = id;
					heap = $temp$heap;
					exp = $temp$exp;
					id = $temp$id;
					continue fwd;
				case 'EInt':
					return $elm$core$Result$Ok(
						_Utils_Tuple3(heap, exp, id));
				case 'EBool':
					return $elm$core$Result$Ok(
						_Utils_Tuple3(heap, exp, id));
				case 'EChar':
					return $elm$core$Result$Ok(
						_Utils_Tuple3(heap, exp, id));
				case 'ECons':
					return $elm$core$Result$Ok(
						_Utils_Tuple3(heap, exp, id));
				case 'ENil':
					return $elm$core$Result$Ok(
						_Utils_Tuple3(heap, exp, id));
				case 'ETuple':
					return $elm$core$Result$Ok(
						_Utils_Tuple3(heap, exp, id));
				case 'ELam':
					return $elm$core$Result$Ok(
						_Utils_Tuple3(heap, exp, id));
				case 'EHtml':
					return $elm$core$Result$Ok(
						_Utils_Tuple3(heap, exp, id));
				case 'EApp':
					var efun = exp.a;
					var earg = exp.b;
					return A2(
						$elm$core$Result$andThen,
						function (_v50) {
							var heap1 = _v50.a;
							var zfun = _v50.b;
							var id1 = _v50.c;
							if (zfun.$ === 'ELam') {
								var y = zfun.b;
								var ebody = zfun.c;
								var _v52 = A2($author$project$LangUtils$Rename$freshName, 'x', id1);
								var ŷ = _v52.a;
								var id2 = _v52.b;
								var ebody1 = A3($author$project$LangUtils$Substitute$substExp, ebody, y, ŷ);
								return A3(
									$author$project$Eval$fwd,
									A2(
										$elm$core$List$cons,
										_Utils_Tuple2(
											ŷ,
											_Utils_Tuple3(
												_Utils_Tuple2(earg, earg),
												$author$project$Syntax$DZero,
												_Utils_Tuple2($elm$core$Maybe$Nothing, false))),
										heap1),
									ebody1,
									id2);
							} else {
								return $elm$core$Result$Err(
									'fwd [E-APP]: ERROR #05: Either not a function or not a variable argument' + ($author$project$Printer$Exp$print(zfun) + (',' + $author$project$Printer$Exp$print(earg))));
							}
						},
						A3($author$project$Eval$fwd, heap, efun, id));
				case 'EVar':
					var x = exp.b;
					var _v53 = A2($author$project$Utils$lookup, x, heap);
					if (_v53.$ === 'Just') {
						if (_v53.a.c.a.$ === 'Just') {
							var _v54 = _v53.a;
							var _v55 = _v54.c;
							var z = _v55.a.a;
							var _v56 = A2($author$project$LangUtils$Rename$renameExp, z, id);
							var ẑ = _v56.a;
							var id1 = _v56.b;
							return $elm$core$Result$Ok(
								_Utils_Tuple3(heap, ẑ, id1));
						} else {
							var _v57 = _v53.a;
							var _v58 = _v57.a;
							var oE = _v58.a;
							var nE = _v58.b;
							var dz_glb = _v57.b;
							var _v59 = _v57.c;
							var _v60 = _v59.a;
							var b = _v59.b;
							return A2(
								$elm$core$Result$andThen,
								function (_v61) {
									var h2 = _v61.a;
									var z = _v61.b;
									var id2 = _v61.c;
									var h3 = A2(
										$elm$core$List$cons,
										_Utils_Tuple2(
											x,
											_Utils_Tuple3(
												_Utils_Tuple2(oE, nE),
												dz_glb,
												_Utils_Tuple2(
													$elm$core$Maybe$Just(z),
													b))),
										h2);
									var _v62 = A2($author$project$LangUtils$Rename$renameExp, z, id2);
									var ẑ = _v62.a;
									var id3 = _v62.b;
									return $elm$core$Result$Ok(
										_Utils_Tuple3(h3, ẑ, id3));
								},
								A3(
									$author$project$Eval$fwd,
									A2($author$project$Utils$delete, x, heap),
									nE,
									id));
						}
					} else {
						return $elm$core$Result$Err('ERROR #06: No Such Variable.' + x);
					}
				case 'ELet':
					var decls = exp.b;
					var ebody = exp.c;
					var $temp$heap = _Utils_ap(decls, heap),
						$temp$exp = ebody,
						$temp$id = id;
					heap = $temp$heap;
					exp = $temp$exp;
					id = $temp$id;
					continue fwd;
				case 'ECase':
					var earg = exp.b;
					var branch = exp.c;
					return A2(
						$elm$core$Result$andThen,
						function (_v63) {
							var heap1 = _v63.a;
							var zarg = _v63.b;
							var id1 = _v63.c;
							return A2(
								$elm$core$Result$andThen,
								function (_v64) {
									var matchRes = _v64.a;
									var id2 = _v64.b;
									return A3(
										$author$project$Eval$fwd,
										matchRes.heap,
										A2($author$project$LangUtils$Substitute$substSet, matchRes.ei, matchRes.renamedvars),
										id2);
								},
								A4($author$project$Eval$matchCase, zarg, branch, id1, heap1));
						},
						A3($author$project$Eval$fwd, heap, earg, id));
				case 'EUPrim':
					var op = exp.b;
					var e1 = exp.c;
					return A2(
						$elm$core$Result$andThen,
						function (_v65) {
							var heap1 = _v65.a;
							var e1_ = _v65.b;
							var id1 = _v65.c;
							return A2(
								$elm$core$Result$andThen,
								function (e_) {
									return $elm$core$Result$Ok(
										_Utils_Tuple3(heap1, e_, id1));
								},
								$author$project$Eval$expToResult(
									function () {
										var _v66 = _Utils_Tuple2(op, e1_);
										_v66$2:
										while (true) {
											if (_v66.a.$ === 'Not') {
												if (_v66.b.$ === 'EBool') {
													var _v67 = _v66.a;
													var _v68 = _v66.b;
													var wss = _v68.a;
													var b = _v68.b;
													return A2($author$project$Syntax$EBool, wss, !b);
												} else {
													break _v66$2;
												}
											} else {
												if (_v66.b.$ === 'EInt') {
													var _v69 = _v66.a;
													var _v70 = _v66.b;
													var wss = _v70.a;
													var n = _v70.b;
													return A2($author$project$Syntax$EInt, wss, -n);
												} else {
													break _v66$2;
												}
											}
										}
										return $author$project$Syntax$EError('ERROR #07: Inappropriate uoperator and argument');
									}()));
						},
						A3($author$project$Eval$fwd, heap, e1, id));
				default:
					var op = exp.b;
					var e1 = exp.c;
					var e2 = exp.d;
					return A2(
						$elm$core$Result$andThen,
						function (_v71) {
							var heap1 = _v71.a;
							var e1_ = _v71.b;
							var id1 = _v71.c;
							return A2(
								$elm$core$Result$andThen,
								function (_v72) {
									var heap2 = _v72.a;
									var e2_ = _v72.b;
									var id2 = _v72.c;
									var _v73 = _Utils_Tuple2(e1_, e2_);
									_v73$3:
									while (true) {
										switch (_v73.a.$) {
											case 'EInt':
												if (_v73.b.$ === 'EInt') {
													var _v74 = _v73.a;
													var n1 = _v74.b;
													var _v75 = _v73.b;
													var wss = _v75.a;
													var n2 = _v75.b;
													switch (op.$) {
														case 'Sub':
															return $elm$core$Result$Ok(
																_Utils_Tuple3(
																	heap2,
																	A2($author$project$Syntax$EInt, wss, n1 - n2),
																	id2));
														case 'Add':
															return $elm$core$Result$Ok(
																_Utils_Tuple3(
																	heap2,
																	A2($author$project$Syntax$EInt, wss, n1 + n2),
																	id2));
														case 'Mul':
															return $elm$core$Result$Ok(
																_Utils_Tuple3(
																	heap2,
																	A2($author$project$Syntax$EInt, wss, n1 * n2),
																	id2));
														case 'Mod':
															return $elm$core$Result$Ok(
																_Utils_Tuple3(
																	heap2,
																	A2(
																		$author$project$Syntax$EInt,
																		wss,
																		A2($elm$core$Basics$modBy, n1, n2)),
																	id2));
														case 'Eq':
															return $elm$core$Result$Ok(
																_Utils_Tuple3(
																	heap2,
																	A2(
																		$author$project$Syntax$EBool,
																		wss,
																		_Utils_eq(n1, n2)),
																	id2));
														case 'Ne':
															return $elm$core$Result$Ok(
																_Utils_Tuple3(
																	heap2,
																	A2(
																		$author$project$Syntax$EBool,
																		wss,
																		!_Utils_eq(n1, n2)),
																	id2));
														case 'Lt':
															return $elm$core$Result$Ok(
																_Utils_Tuple3(
																	heap2,
																	A2(
																		$author$project$Syntax$EBool,
																		wss,
																		_Utils_cmp(n1, n2) < 0),
																	id2));
														case 'Gt':
															return $elm$core$Result$Ok(
																_Utils_Tuple3(
																	heap2,
																	A2(
																		$author$project$Syntax$EBool,
																		wss,
																		_Utils_cmp(n1, n2) > 0),
																	id2));
														case 'Le':
															return $elm$core$Result$Ok(
																_Utils_Tuple3(
																	heap2,
																	A2(
																		$author$project$Syntax$EBool,
																		wss,
																		_Utils_cmp(n1, n2) < 1),
																	id2));
														case 'Ge':
															return $elm$core$Result$Ok(
																_Utils_Tuple3(
																	heap2,
																	A2(
																		$author$project$Syntax$EBool,
																		wss,
																		_Utils_cmp(n1, n2) > -1),
																	id2));
														default:
															return $elm$core$Result$Err('ERROR #07: Inappropriate boperator between Integers.');
													}
												} else {
													break _v73$3;
												}
											case 'EBool':
												if (_v73.b.$ === 'EBool') {
													var _v77 = _v73.a;
													var b1 = _v77.b;
													var _v78 = _v73.b;
													var wss = _v78.a;
													var b2 = _v78.b;
													switch (op.$) {
														case 'Eq':
															return $elm$core$Result$Ok(
																_Utils_Tuple3(
																	heap2,
																	A2(
																		$author$project$Syntax$EBool,
																		wss,
																		_Utils_eq(b1, b2)),
																	id2));
														case 'Ne':
															return $elm$core$Result$Ok(
																_Utils_Tuple3(
																	heap2,
																	A2(
																		$author$project$Syntax$EBool,
																		wss,
																		!_Utils_eq(b1, b2)),
																	id2));
														case 'And':
															return $elm$core$Result$Ok(
																_Utils_Tuple3(
																	heap2,
																	A2($author$project$Syntax$EBool, wss, b1 && b2),
																	id2));
														case 'Or':
															return $elm$core$Result$Ok(
																_Utils_Tuple3(
																	heap2,
																	A2($author$project$Syntax$EBool, wss, b1 || b2),
																	id2));
														default:
															return $elm$core$Result$Err('ERROR #07: Inappropriate boperator between Booleans.');
													}
												} else {
													break _v73$3;
												}
											case 'EChar':
												if (_v73.b.$ === 'EChar') {
													var _v80 = _v73.a;
													var c1 = _v80.b;
													var _v81 = _v73.b;
													var wss = _v81.a;
													var c2 = _v81.b;
													switch (op.$) {
														case 'Eq':
															return $elm$core$Result$Ok(
																_Utils_Tuple3(
																	heap2,
																	A2(
																		$author$project$Syntax$EBool,
																		wss,
																		_Utils_eq(c1, c2)),
																	id2));
														case 'Ne':
															return $elm$core$Result$Ok(
																_Utils_Tuple3(
																	heap2,
																	A2(
																		$author$project$Syntax$EBool,
																		wss,
																		!_Utils_eq(c1, c2)),
																	id2));
														default:
															return $elm$core$Result$Err('ERROR #07: Inappropriate boperator between Chars.');
													}
												} else {
													break _v73$3;
												}
											default:
												break _v73$3;
										}
									}
									switch (op.$) {
										case 'Cat':
											return A4($author$project$Eval$append, e1_, e2_, heap2, id2);
										case 'Eq':
											return A4($author$project$Eval$strEq, e1_, e2_, heap2, id2);
										case 'Ne':
											return A4($author$project$Eval$strNe, e1_, e2_, heap2, id2);
										default:
											return $elm$core$Result$Err(
												'ERROR #07: Operands are not matching types.' + $elm$core$Debug$toString(
													_Utils_Tuple2(e1_, e2_)));
									}
								},
								A3($author$project$Eval$fwd, heap1, e2, id1));
						},
						A3($author$project$Eval$fwd, heap, e1, id));
			}
		}
	});
var $author$project$Eval$match = F4(
	function (exp, pat, id, h) {
		match:
		while (true) {
			var _v23 = _Utils_Tuple2(exp, pat);
			_v23$9:
			while (true) {
				switch (_v23.b.$) {
					case 'PInt':
						if (_v23.a.$ === 'EInt') {
							var _v24 = _v23.a;
							var n1 = _v24.b;
							var _v25 = _v23.b;
							var n2 = _v25.b;
							return _Utils_eq(n1, n2) ? $elm$core$Result$Ok(
								_Utils_Tuple3(h, _List_Nil, id)) : $elm$core$Result$Err(
								'Match Failed.' + $elm$core$Debug$toString(
									_Utils_Tuple2(exp, pat)));
						} else {
							break _v23$9;
						}
					case 'PBool':
						if (_v23.a.$ === 'EBool') {
							var _v26 = _v23.a;
							var b1 = _v26.b;
							var _v27 = _v23.b;
							var b2 = _v27.b;
							return _Utils_eq(b1, b2) ? $elm$core$Result$Ok(
								_Utils_Tuple3(h, _List_Nil, id)) : $elm$core$Result$Err(
								'Match Failed.' + $elm$core$Debug$toString(
									_Utils_Tuple2(exp, pat)));
						} else {
							break _v23$9;
						}
					case 'PChar':
						if (_v23.a.$ === 'EChar') {
							var _v28 = _v23.a;
							var c1 = _v28.b;
							var _v29 = _v23.b;
							var c2 = _v29.b;
							return _Utils_eq(c1, c2) ? $elm$core$Result$Ok(
								_Utils_Tuple3(h, _List_Nil, id)) : $elm$core$Result$Err(
								'Match Failed.' + $elm$core$Debug$toString(
									_Utils_Tuple2(exp, pat)));
						} else {
							break _v23$9;
						}
					case 'PVar':
						var _v30 = _v23.b;
						var x = _v30.b;
						var _v31 = A2($author$project$LangUtils$Rename$freshName, 'x', id);
						var y = _v31.a;
						var id1 = _v31.b;
						return $elm$core$Result$Ok(
							_Utils_Tuple3(
								A2(
									$elm$core$List$cons,
									_Utils_Tuple2(
										y,
										_Utils_Tuple3(
											_Utils_Tuple2(exp, exp),
											$author$project$Syntax$DZero,
											_Utils_Tuple2($elm$core$Maybe$Nothing, false))),
									h),
								_List_fromArray(
									[
										_Utils_Tuple2(x, y)
									]),
								id1));
					case 'PCons':
						if (_v23.a.$ === 'ECons') {
							var _v32 = _v23.a;
							var e1 = _v32.c;
							var e2 = _v32.d;
							var _v33 = _v23.b;
							var p1 = _v33.c;
							var p2 = _v33.d;
							return A2(
								$elm$core$Result$andThen,
								function (_v34) {
									var h1 = _v34.a;
									var renamedvars1 = _v34.b;
									var id1 = _v34.c;
									return A2(
										$elm$core$Result$andThen,
										function (_v35) {
											var h2 = _v35.a;
											var renamedvars2 = _v35.b;
											var id2 = _v35.c;
											return $elm$core$Result$Ok(
												_Utils_Tuple3(
													h2,
													_Utils_ap(renamedvars1, renamedvars2),
													id2));
										},
										A4($author$project$Eval$match, e2, p2, id1, h1));
								},
								A4($author$project$Eval$match, e1, p1, id, h));
						} else {
							break _v23$9;
						}
					case 'PTuple':
						if (_v23.a.$ === 'ETuple') {
							var _v36 = _v23.a;
							var e1 = _v36.c;
							var e2 = _v36.d;
							var _v37 = _v23.b;
							var p1 = _v37.c;
							var p2 = _v37.d;
							return A2(
								$elm$core$Result$andThen,
								function (_v38) {
									var h1 = _v38.a;
									var renamedvars1 = _v38.b;
									var id1 = _v38.c;
									return A2(
										$elm$core$Result$andThen,
										function (_v39) {
											var h2 = _v39.a;
											var renamedvars2 = _v39.b;
											var id2 = _v39.c;
											return $elm$core$Result$Ok(
												_Utils_Tuple3(
													h2,
													_Utils_ap(renamedvars1, renamedvars2),
													id2));
										},
										A4($author$project$Eval$match, e2, p2, id1, h1));
								},
								A4($author$project$Eval$match, e1, p1, id, h));
						} else {
							break _v23$9;
						}
					case 'PHtml':
						if (_v23.a.$ === 'EHtml') {
							var _v40 = _v23.a;
							var s = _v40.b;
							var e1 = _v40.c;
							var e2 = _v40.d;
							var e3 = _v40.e;
							var _v41 = _v23.b;
							var s_ = _v41.b;
							var p1 = _v41.c;
							var p2 = _v41.d;
							var p3 = _v41.e;
							return _Utils_eq(s, s_) ? A2(
								$elm$core$Result$andThen,
								function (_v42) {
									var h1 = _v42.a;
									var renamedvars1 = _v42.b;
									var id1 = _v42.c;
									return A2(
										$elm$core$Result$andThen,
										function (_v43) {
											var h2 = _v43.a;
											var renamedvars2 = _v43.b;
											var id2 = _v43.c;
											return A2(
												$elm$core$Result$andThen,
												function (_v44) {
													var h3 = _v44.a;
													var renamedvars3 = _v44.b;
													var id3 = _v44.c;
													return $elm$core$Result$Ok(
														_Utils_Tuple3(
															h3,
															_Utils_ap(
																renamedvars1,
																_Utils_ap(renamedvars2, renamedvars3)),
															id3));
												},
												A4($author$project$Eval$match, e3, p3, id2, h2));
										},
										A4($author$project$Eval$match, e2, p2, id1, h1));
								},
								A4($author$project$Eval$match, e1, p1, id, h)) : $elm$core$Result$Err(
								'Match Failed.' + $elm$core$Debug$toString(
									_Utils_Tuple2(exp, pat)));
						} else {
							break _v23$9;
						}
					case 'PNil':
						if (_v23.a.$ === 'ENil') {
							var _v45 = _v23.a;
							var _v46 = _v23.b;
							return $elm$core$Result$Ok(
								_Utils_Tuple3(h, _List_Nil, id));
						} else {
							break _v23$9;
						}
					default:
						return $elm$core$Result$Ok(
							_Utils_Tuple3(h, _List_Nil, id));
				}
			}
			if ($author$project$LangUtils$WHNF$isWHNF(exp)) {
				return $elm$core$Result$Err(
					'Match Failed.' + $elm$core$Debug$toString(
						_Utils_Tuple2(exp, pat)));
			} else {
				var _v47 = A3($author$project$Eval$fwd, h, exp, id);
				if (_v47.$ === 'Ok') {
					var _v48 = _v47.a;
					var h1 = _v48.a;
					var z = _v48.b;
					var id1 = _v48.c;
					var $temp$exp = z,
						$temp$pat = pat,
						$temp$id = id1,
						$temp$h = h1;
					exp = $temp$exp;
					pat = $temp$pat;
					id = $temp$id;
					h = $temp$h;
					continue match;
				} else {
					var e = _v47.a;
					return $elm$core$Result$Err(e);
				}
			}
		}
	});
var $author$project$Eval$matchCase = F4(
	function (e, b, id0, h) {
		var go = F3(
			function (b_, cnt, id) {
				go:
				while (true) {
					if (b_.$ === 'BSin') {
						var p = b_.b;
						var t = b_.c;
						return A2(
							$elm$core$Result$andThen,
							function (_v20) {
								var h_ = _v20.a;
								var renamedvars = _v20.b;
								var id1 = _v20.c;
								return $elm$core$Result$Ok(
									_Utils_Tuple2(
										{choice: cnt, ei: t, heap: h_, pi: p, renamedvars: renamedvars},
										id1));
							},
							A4($author$project$Eval$match, e, p, id, h));
					} else {
						var b1 = b_.b;
						var b2 = b_.c;
						var _v21 = A3(go, b1, cnt, id);
						if (_v21.$ === 'Ok') {
							var _v22 = _v21.a;
							var res = _v22.a;
							var id1 = _v22.b;
							return $elm$core$Result$Ok(
								_Utils_Tuple2(res, id1));
						} else {
							var $temp$b_ = b2,
								$temp$cnt = cnt + 1,
								$temp$id = id;
							b_ = $temp$b_;
							cnt = $temp$cnt;
							id = $temp$id;
							continue go;
						}
					}
				}
			});
		return A3(go, b, 1, id0);
	});
var $author$project$Eval$strEq = F4(
	function (e1, e2, heap, id) {
		return A2(
			$elm$core$Result$andThen,
			function (_v2) {
				var heap1 = _v2.a;
				var z1 = _v2.b;
				var id1 = _v2.c;
				return A2(
					$elm$core$Result$andThen,
					function (_v3) {
						var heap2 = _v3.a;
						var z2 = _v3.b;
						var id2 = _v3.c;
						var _v4 = _Utils_Tuple2(z1, z2);
						_v4$4:
						while (true) {
							switch (_v4.a.$) {
								case 'ECons':
									switch (_v4.b.$) {
										case 'ECons':
											var _v5 = _v4.a;
											var lType1 = _v5.b;
											var e11 = _v5.c;
											var e12 = _v5.d;
											var _v6 = _v4.b;
											var lType2 = _v6.b;
											var e21 = _v6.c;
											var e22 = _v6.d;
											return (_Utils_eq(lType1, lType2) && _Utils_eq(lType1, $author$project$Syntax$StringType)) ? A2(
												$elm$core$Result$andThen,
												function (_v7) {
													var heap3 = _v7.a;
													var z11 = _v7.b;
													var id3 = _v7.c;
													return A2(
														$elm$core$Result$andThen,
														function (_v8) {
															var heap4 = _v8.a;
															var z21 = _v8.b;
															var id4 = _v8.c;
															var _v9 = _Utils_Tuple2(z11, z21);
															if ((_v9.a.$ === 'EChar') && (_v9.b.$ === 'EChar')) {
																var _v10 = _v9.a;
																var c1 = _v10.b;
																var _v11 = _v9.b;
																var c2 = _v11.b;
																return _Utils_eq(c1, c2) ? A2(
																	$elm$core$Result$andThen,
																	function (_v12) {
																		var heap5 = _v12.a;
																		var z12 = _v12.b;
																		var id5 = _v12.c;
																		return $elm$core$Result$Ok(
																			_Utils_Tuple3(heap5, z12, id5));
																	},
																	A4($author$project$Eval$strEq, e12, e22, heap4, id4)) : $elm$core$Result$Ok(
																	_Utils_Tuple3(
																		heap4,
																		A2($author$project$Syntax$EBool, $author$project$Syntax$eBoolDefaultWSS, false),
																		id4));
															} else {
																return $elm$core$Result$Err('ERROR #28: Eq Operands are not matching String Type.');
															}
														},
														A3($author$project$Eval$fwd, heap3, e21, id3));
												},
												A3($author$project$Eval$fwd, heap2, e11, id2)) : $elm$core$Result$Err('ERROR #28: Eq Operands are not matching List Type.');
										case 'ENil':
											var _v15 = _v4.a;
											var _v16 = _v4.b;
											return $elm$core$Result$Ok(
												_Utils_Tuple3(
													heap2,
													A2($author$project$Syntax$EBool, $author$project$Syntax$eBoolDefaultWSS, false),
													id2));
										default:
											break _v4$4;
									}
								case 'ENil':
									switch (_v4.b.$) {
										case 'ENil':
											var _v13 = _v4.a;
											var lType1 = _v13.b;
											var _v14 = _v4.b;
											var lType2 = _v14.b;
											return (_Utils_eq(lType1, lType2) && _Utils_eq(lType1, $author$project$Syntax$StringType)) ? $elm$core$Result$Ok(
												_Utils_Tuple3(
													heap2,
													A2($author$project$Syntax$EBool, $author$project$Syntax$eBoolDefaultWSS, true),
													id2)) : $elm$core$Result$Err('ERROR #28: Eq Operands are not matching List Type.');
										case 'ECons':
											var _v17 = _v4.a;
											var _v18 = _v4.b;
											return $elm$core$Result$Ok(
												_Utils_Tuple3(
													heap2,
													A2($author$project$Syntax$EBool, $author$project$Syntax$eBoolDefaultWSS, false),
													id2));
										default:
											break _v4$4;
									}
								default:
									break _v4$4;
							}
						}
						return $elm$core$Result$Err('ERROR #28: Eq Operands are not matching String Type.');
					},
					A3($author$project$Eval$fwd, heap1, e2, id1));
			},
			A3($author$project$Eval$fwd, heap, e1, id));
	});
var $author$project$Eval$strNe = F4(
	function (e1, e2, heap, id) {
		return A2(
			$elm$core$Result$andThen,
			function (_v0) {
				var heap_ = _v0.a;
				var z = _v0.b;
				var id_ = _v0.c;
				if (z.$ === 'EBool') {
					var wss = z.a;
					var b = z.b;
					return $elm$core$Result$Ok(
						_Utils_Tuple3(
							heap_,
							A2($author$project$Syntax$EBool, wss, !b),
							id_));
				} else {
					return $elm$core$Result$Err('ERROR #29: Ne Operands are not matching Boolean Type.');
				}
			},
			A4($author$project$Eval$strEq, e1, e2, heap, id));
	});
var $author$project$LangUtils$Delta$isNorm = function (dv) {
	isNorm:
	while (true) {
		switch (dv.$) {
			case 'DRem':
				return true;
			case 'DId':
				return true;
			case 'DAdd':
				return true;
			case 'DCom':
				if (dv.b.$ === 'DZero') {
					var dv1 = dv.a;
					var _v1 = dv.b;
					var $temp$dv = dv1;
					dv = $temp$dv;
					continue isNorm;
				} else {
					var dv1 = dv.a;
					var dv2 = dv.b;
					return $author$project$LangUtils$Delta$isNorm(dv1) && $author$project$LangUtils$Delta$isNorm(dv2);
				}
			case 'DCons':
				var dv1 = dv.b;
				var dv2 = dv.c;
				return $author$project$LangUtils$Delta$isNorm(dv1) && $author$project$LangUtils$Delta$isNorm(dv2);
			case 'DTuple':
				var dv1 = dv.a;
				var dv2 = dv.b;
				return $author$project$LangUtils$Delta$isNorm(dv1) && $author$project$LangUtils$Delta$isNorm(dv2);
			case 'DHtml':
				var dv1 = dv.b;
				var dv2 = dv.c;
				var dv3 = dv.d;
				return $author$project$LangUtils$Delta$isNorm(dv1) && ($author$project$LangUtils$Delta$isNorm(dv2) && $author$project$LangUtils$Delta$isNorm(dv3));
			default:
				return false;
		}
	}
};
var $author$project$LangUtils$Delta$length = function (dv) {
	switch (dv.$) {
		case 'DCom':
			var dv2 = dv.b;
			return $author$project$LangUtils$Delta$length(dv2) + 1;
		case 'DZero':
			return 0;
		default:
			return 1;
	}
};
var $elm$core$Debug$log = _Debug_log;
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
var $author$project$Eval$refreshHeap = F2(
	function (oHeap, nHeap) {
		if (!nHeap.b) {
			return _List_Nil;
		} else {
			var _v1 = nHeap.a;
			var x = _v1.a;
			var _v2 = _v1.b;
			var e = _v2.a;
			var dv = _v2.b;
			var _v3 = _v2.c;
			var v = _v3.a;
			var nb = _v3.b;
			var nHeap_ = nHeap.b;
			var _v4 = A2($author$project$Utils$lookup, x, oHeap);
			if (_v4.$ === 'Just') {
				var _v5 = _v4.a;
				var _v6 = _v5.c;
				var ob = _v6.b;
				return ((!ob) && nb) ? A2(
					$elm$core$List$cons,
					_Utils_Tuple2(
						x,
						_Utils_Tuple3(
							e,
							dv,
							_Utils_Tuple2(v, false))),
					A2($author$project$Eval$refreshHeap, oHeap, nHeap_)) : A2(
					$elm$core$List$cons,
					_Utils_Tuple2(
						x,
						_Utils_Tuple3(
							e,
							dv,
							_Utils_Tuple2(v, ob))),
					A2($author$project$Eval$refreshHeap, oHeap, nHeap_));
			} else {
				return A2(
					$elm$core$List$cons,
					_Utils_Tuple2(
						x,
						_Utils_Tuple3(
							e,
							dv,
							_Utils_Tuple2(v, nb))),
					A2($author$project$Eval$refreshHeap, oHeap, nHeap_));
			}
		}
	});
var $author$project$Eval$replPVar = F2(
	function (pi, renamedvars) {
		replPVar:
		while (true) {
			if (!renamedvars.b) {
				return pi;
			} else {
				var _v1 = renamedvars.a;
				var x = _v1.a;
				var y = _v1.b;
				var renamedvars_ = renamedvars.b;
				if (pi.$ === 'PVar') {
					var wss = pi.a;
					var s = pi.b;
					if (_Utils_eq(s, x)) {
						return A2($author$project$Syntax$PVar, wss, y);
					} else {
						var $temp$pi = pi,
							$temp$renamedvars = renamedvars_;
						pi = $temp$pi;
						renamedvars = $temp$renamedvars;
						continue replPVar;
					}
				} else {
					return pi;
				}
			}
		}
	});
var $author$project$Eval$replPat = F2(
	function (pi, renamedvars) {
		switch (pi.$) {
			case 'PVar':
				return A2($author$project$Eval$replPVar, pi, renamedvars);
			case 'PCons':
				var wss = pi.a;
				var lType = pi.b;
				var p1 = pi.c;
				var p2 = pi.d;
				return A4(
					$author$project$Syntax$PCons,
					wss,
					lType,
					A2($author$project$Eval$replPat, p1, renamedvars),
					A2($author$project$Eval$replPat, p2, renamedvars));
			case 'PTuple':
				var wss = pi.a;
				var tTuple = pi.b;
				var p1 = pi.c;
				var p2 = pi.d;
				return A4(
					$author$project$Syntax$PTuple,
					wss,
					tTuple,
					A2($author$project$Eval$replPat, p1, renamedvars),
					A2($author$project$Eval$replPat, p2, renamedvars));
			case 'PHtml':
				var wss = pi.a;
				var s = pi.b;
				var p1 = pi.c;
				var p2 = pi.d;
				var p3 = pi.e;
				return A5(
					$author$project$Syntax$PHtml,
					wss,
					s,
					A2($author$project$Eval$replPat, p1, renamedvars),
					A2($author$project$Eval$replPat, p2, renamedvars),
					A2($author$project$Eval$replPat, p3, renamedvars));
			default:
				return pi;
		}
	});
var $author$project$Utils$replace = F3(
	function (x, v, xvs) {
		if (!xvs.b) {
			return _List_Nil;
		} else {
			var _v1 = xvs.a;
			var x1 = _v1.a;
			var v1 = _v1.b;
			var xvs_ = xvs.b;
			return _Utils_eq(x1, x) ? A2(
				$elm$core$List$cons,
				_Utils_Tuple2(x, v),
				xvs_) : A2(
				$elm$core$List$cons,
				_Utils_Tuple2(x1, v1),
				A3($author$project$Utils$replace, x, v, xvs_));
		}
	});
var $author$project$LangUtils$Fuse$simplify = function (dv) {
	simplify:
	while (true) {
		_v0$1:
		while (true) {
			_v0$2:
			while (true) {
				switch (dv.$) {
					case 'DCom':
						switch (dv.a.$) {
							case 'DZero':
								var _v1 = dv.a;
								var dv2 = dv.b;
								var $temp$dv = dv2;
								dv = $temp$dv;
								continue simplify;
							case 'DId':
								switch (dv.b.$) {
									case 'DZero':
										break _v0$1;
									case 'DId':
										break _v0$2;
									default:
										break _v0$2;
								}
							default:
								switch (dv.b.$) {
									case 'DZero':
										break _v0$1;
									case 'DId':
										var dv1 = dv.a;
										var _v4 = dv.b;
										var $temp$dv = dv1;
										dv = $temp$dv;
										continue simplify;
									default:
										var dv1 = dv.a;
										var dv2 = dv.b;
										return A2(
											$author$project$Syntax$DCom,
											$author$project$LangUtils$Fuse$simplify(dv1),
											$author$project$LangUtils$Fuse$simplify(dv2));
								}
						}
					case 'DTuple':
						var dv1 = dv.a;
						var dv2 = dv.b;
						var _v5 = _Utils_Tuple2(
							$author$project$LangUtils$Fuse$simplify(dv1),
							$author$project$LangUtils$Fuse$simplify(dv2));
						_v5$4:
						while (true) {
							switch (_v5.a.$) {
								case 'DZero':
									switch (_v5.b.$) {
										case 'DZero':
											var _v6 = _v5.a;
											var _v7 = _v5.b;
											return $author$project$Syntax$DZero;
										case 'DId':
											var _v8 = _v5.a;
											var _v9 = _v5.b;
											return $author$project$Syntax$DId;
										default:
											break _v5$4;
									}
								case 'DId':
									switch (_v5.b.$) {
										case 'DZero':
											var _v10 = _v5.a;
											var _v11 = _v5.b;
											return $author$project$Syntax$DId;
										case 'DId':
											var _v12 = _v5.a;
											var _v13 = _v5.b;
											return $author$project$Syntax$DId;
										default:
											break _v5$4;
									}
								default:
									break _v5$4;
							}
						}
						var dv1_ = _v5.a;
						var dv2_ = _v5.b;
						return A2($author$project$Syntax$DTuple, dv1_, dv2_);
					case 'DCons':
						var mv = dv.a;
						var dv1 = dv.b;
						var dv2 = dv.c;
						if (mv.$ === 'Nothing') {
							var _v15 = _Utils_Tuple2(
								$author$project$LangUtils$Fuse$simplify(dv1),
								$author$project$LangUtils$Fuse$simplify(dv2));
							_v15$4:
							while (true) {
								switch (_v15.a.$) {
									case 'DZero':
										switch (_v15.b.$) {
											case 'DZero':
												var _v16 = _v15.a;
												var _v17 = _v15.b;
												return $author$project$Syntax$DZero;
											case 'DId':
												var _v18 = _v15.a;
												var _v19 = _v15.b;
												return $author$project$Syntax$DId;
											default:
												break _v15$4;
										}
									case 'DId':
										switch (_v15.b.$) {
											case 'DZero':
												var _v20 = _v15.a;
												var _v21 = _v15.b;
												return $author$project$Syntax$DId;
											case 'DId':
												var _v22 = _v15.a;
												var _v23 = _v15.b;
												return $author$project$Syntax$DId;
											default:
												break _v15$4;
										}
									default:
										break _v15$4;
								}
							}
							var dv1_ = _v15.a;
							var dv2_ = _v15.b;
							return A3($author$project$Syntax$DCons, mv, dv1_, dv2_);
						} else {
							return A3(
								$author$project$Syntax$DCons,
								mv,
								$author$project$LangUtils$Fuse$simplify(dv1),
								$author$project$LangUtils$Fuse$simplify(dv2));
						}
					case 'DHtml':
						var s = dv.a;
						var dv1 = dv.b;
						var dv2 = dv.c;
						var dv3 = dv.d;
						var _v24 = _Utils_Tuple3(
							$author$project$LangUtils$Fuse$simplify(dv1),
							$author$project$LangUtils$Fuse$simplify(dv2),
							$author$project$LangUtils$Fuse$simplify(dv3));
						_v24$8:
						while (true) {
							switch (_v24.a.$) {
								case 'DZero':
									switch (_v24.b.$) {
										case 'DZero':
											switch (_v24.c.$) {
												case 'DZero':
													var _v25 = _v24.a;
													var _v26 = _v24.b;
													var _v27 = _v24.c;
													return $author$project$Syntax$DZero;
												case 'DId':
													var _v28 = _v24.a;
													var _v29 = _v24.b;
													var _v30 = _v24.c;
													return $author$project$Syntax$DId;
												default:
													break _v24$8;
											}
										case 'DId':
											switch (_v24.c.$) {
												case 'DZero':
													var _v31 = _v24.a;
													var _v32 = _v24.b;
													var _v33 = _v24.c;
													return $author$project$Syntax$DId;
												case 'DId':
													var _v37 = _v24.a;
													var _v38 = _v24.b;
													var _v39 = _v24.c;
													return $author$project$Syntax$DId;
												default:
													break _v24$8;
											}
										default:
											break _v24$8;
									}
								case 'DId':
									switch (_v24.b.$) {
										case 'DZero':
											switch (_v24.c.$) {
												case 'DZero':
													var _v34 = _v24.a;
													var _v35 = _v24.b;
													var _v36 = _v24.c;
													return $author$project$Syntax$DId;
												case 'DId':
													var _v40 = _v24.a;
													var _v41 = _v24.b;
													var _v42 = _v24.c;
													return $author$project$Syntax$DId;
												default:
													break _v24$8;
											}
										case 'DId':
											switch (_v24.c.$) {
												case 'DZero':
													var _v43 = _v24.a;
													var _v44 = _v24.b;
													var _v45 = _v24.c;
													return $author$project$Syntax$DId;
												case 'DId':
													var _v46 = _v24.a;
													var _v47 = _v24.b;
													var _v48 = _v24.c;
													return $author$project$Syntax$DId;
												default:
													break _v24$8;
											}
										default:
											break _v24$8;
									}
								default:
									break _v24$8;
							}
						}
						var dv1_ = _v24.a;
						var dv2_ = _v24.b;
						var dv3_ = _v24.c;
						return A4($author$project$Syntax$DHtml, s, dv1_, dv2_, dv3_);
					default:
						var dv_ = dv;
						return dv_;
				}
			}
			var _v3 = dv.a;
			var dv2 = dv.b;
			var $temp$dv = dv2;
			dv = $temp$dv;
			continue simplify;
		}
		var dv1 = dv.a;
		var _v2 = dv.b;
		var $temp$dv = dv1;
		dv = $temp$dv;
		continue simplify;
	}
};
var $author$project$Eval$splitDelta = F4(
	function (e, dv, h, id) {
		splitDelta:
		while (true) {
			var _v0 = _Utils_Tuple2(
				e,
				$author$project$LangUtils$Fuse$simplify(dv));
			_v0$2:
			while (true) {
				_v0$3:
				while (true) {
					if (_v0.b.$ === 'DCons') {
						if (_v0.b.a.$ === 'Nothing') {
							switch (_v0.a.$) {
								case 'ECons':
									var _v1 = _v0.a;
									var e2 = _v1.d;
									var _v2 = _v0.b;
									var _v3 = _v2.a;
									var dv1 = _v2.b;
									var dv2 = _v2.c;
									var _v4 = A4($author$project$Eval$splitDelta, e2, dv2, h, id);
									var _v5 = _v4.a;
									var dv1_ = _v5.a;
									var dv2_ = _v5.b;
									var h_ = _v4.b;
									var id_ = _v4.c;
									return _Utils_Tuple3(
										_Utils_Tuple2(
											A3($author$project$Syntax$DCons, $elm$core$Maybe$Nothing, dv1, dv1_),
											dv2_),
										h_,
										id_);
								case 'ENil':
									break _v0$2;
								default:
									break _v0$3;
							}
						} else {
							var _v6 = _v0.b;
							var e_ = _v6.a.a;
							var dv1 = _v6.b;
							var dv2 = _v6.c;
							var _v7 = A4($author$project$Eval$splitDelta, e, dv2, h, id);
							var _v8 = _v7.a;
							var dv1_ = _v8.a;
							var dv2_ = _v8.b;
							var h_ = _v7.b;
							var id_ = _v7.c;
							return _Utils_Tuple3(
								_Utils_Tuple2(
									A3(
										$author$project$Syntax$DCons,
										$elm$core$Maybe$Just(e_),
										dv1,
										dv1_),
									dv2_),
								h_,
								id_);
						}
					} else {
						if (_v0.a.$ === 'ENil') {
							break _v0$2;
						} else {
							break _v0$3;
						}
					}
				}
				if ($author$project$LangUtils$WHNF$isWHNF(e)) {
					return _Utils_Tuple3(
						_Utils_Tuple2($author$project$Syntax$DId, $author$project$Syntax$DId),
						h,
						id);
				} else {
					var _v10 = A3($author$project$Eval$fwd, h, e, id);
					if (_v10.$ === 'Ok') {
						var _v11 = _v10.a;
						var h1 = _v11.a;
						var z = _v11.b;
						var id1 = _v11.c;
						var $temp$e = z,
							$temp$dv = dv,
							$temp$h = h1,
							$temp$id = id1;
						e = $temp$e;
						dv = $temp$dv;
						h = $temp$h;
						id = $temp$id;
						continue splitDelta;
					} else {
						return _Utils_Tuple3(
							_Utils_Tuple2($author$project$Syntax$DId, $author$project$Syntax$DId),
							h,
							id);
					}
				}
			}
			var _v9 = _v0.a;
			return _Utils_Tuple3(
				_Utils_Tuple2($author$project$Syntax$DId, dv),
				h,
				id);
		}
	});
var $author$project$Eval$splitHeap = F2(
	function (h1, h2) {
		if (!h1.b) {
			return _Utils_Tuple2(h1, h2);
		} else {
			var _v1 = h1.a;
			var x = _v1.a;
			var h1_ = h1.b;
			var _v2 = A2($author$project$Eval$splitHeap, h1_, h2);
			var h3 = _v2.a;
			var h4 = _v2.b;
			var _v3 = A2($author$project$Utils$lookup, x, h4);
			if (_v3.$ === 'Just') {
				var binding = _v3.a;
				return _Utils_Tuple2(
					A2(
						$elm$core$List$cons,
						_Utils_Tuple2(x, binding),
						h3),
					A2($author$project$Utils$delete, x, h4));
			} else {
				return _Utils_Tuple2(_List_Nil, _List_Nil);
			}
		}
	});
var $author$project$LangUtils$Delta$take = F2(
	function (n, dv) {
		var _v0 = _Utils_Tuple2(dv, n);
		_v0$0:
		while (true) {
			if (_v0.a.$ === 'DCom') {
				if (!_v0.b) {
					break _v0$0;
				} else {
					if (_v0.a.b.$ === 'DZero') {
						var _v1 = _v0.a;
						var dv1 = _v1.a;
						var _v2 = _v1.b;
						return $elm$core$Result$Ok(
							_Utils_Tuple2(dv1, n - 1));
					} else {
						var _v3 = _v0.a;
						var dv2 = _v3.a;
						var dv1 = _v3.b;
						return A2(
							$elm$core$Result$andThen,
							function (_v4) {
								var dv1_ = _v4.a;
								var n_ = _v4.b;
								return (!n_) ? $elm$core$Result$Ok(
									_Utils_Tuple2(dv1_, 0)) : $elm$core$Result$Ok(
									_Utils_Tuple2(
										A2($author$project$Syntax$DCom, dv2, dv1_),
										n_ - 1));
							},
							A2($author$project$LangUtils$Delta$take, n, dv1));
					}
				}
			} else {
				if (!_v0.b) {
					break _v0$0;
				} else {
					return $elm$core$Result$Err(
						'Tried to take n > 1 from non-compositional delta: ' + $author$project$Printer$Delta$print(dv));
				}
			}
		}
		return $elm$core$Result$Ok(
			_Utils_Tuple2($author$project$Syntax$DZero, 0));
	});
var $author$project$Eval$updateBranch = F4(
	function (branch, choice, exp, cnt) {
		if (branch.$ === 'BSin') {
			var wss = branch.a;
			var p = branch.b;
			var e = branch.c;
			return _Utils_eq(cnt + 1, choice) ? _Utils_Tuple2(
				A3($author$project$Syntax$BSin, wss, p, exp),
				cnt + 1) : _Utils_Tuple2(
				A3($author$project$Syntax$BSin, wss, p, e),
				cnt + 1);
		} else {
			var wss = branch.a;
			var b1 = branch.b;
			var b2 = branch.c;
			var _v1 = A4($author$project$Eval$updateBranch, b1, choice, exp, cnt);
			var b1_ = _v1.a;
			var cnt1 = _v1.b;
			if (_Utils_eq(cnt1, choice)) {
				return _Utils_Tuple2(
					A3($author$project$Syntax$BCom, wss, b1_, b2),
					cnt1);
			} else {
				var _v2 = A4($author$project$Eval$updateBranch, b2, choice, exp, cnt1);
				var b2_ = _v2.a;
				var cnt2 = _v2.b;
				return _Utils_Tuple2(
					A3($author$project$Syntax$BCom, wss, b1_, b2_),
					cnt2);
			}
		}
	});
var $author$project$Eval$bwd = F4(
	function (dv, heap, exp, id) {
		var _v0 = _Utils_Tuple2(exp, dv);
		_v0$0:
		while (true) {
			_v0$5:
			while (true) {
				_v0$8:
				while (true) {
					_v0$9:
					while (true) {
						_v0$10:
						while (true) {
							_v0$11:
							while (true) {
								_v0$12:
								while (true) {
									_v0$13:
									while (true) {
										_v0$14:
										while (true) {
											_v0$16:
											while (true) {
												_v0$17:
												while (true) {
													_v0$24:
													while (true) {
														_v0$25:
														while (true) {
															_v0$28:
															while (true) {
																switch (_v0.a.$) {
																	case 'ENil':
																		switch (_v0.b.$) {
																			case 'DZero':
																				break _v0$0;
																			case 'DId':
																				var _v2 = _v0.a;
																				var _v3 = _v0.b;
																				return _Utils_Tuple3(heap, exp, id);
																			case 'DCons':
																				if (_v0.b.a.$ === 'Just') {
																					if (_v0.b.b.$ === 'DRem') {
																						break _v0$16;
																					} else {
																						break _v0$17;
																					}
																				} else {
																					break _v0$28;
																				}
																			case 'DCom':
																				break _v0$24;
																			default:
																				break _v0$28;
																		}
																	case 'EBool':
																		switch (_v0.b.$) {
																			case 'DZero':
																				break _v0$0;
																			case 'DId':
																				var _v6 = _v0.a;
																				var _v7 = _v0.b;
																				return _Utils_Tuple3(heap, exp, id);
																			case 'DCons':
																				if (_v0.b.a.$ === 'Just') {
																					if (_v0.b.b.$ === 'DRem') {
																						break _v0$16;
																					} else {
																						break _v0$17;
																					}
																				} else {
																					break _v0$28;
																				}
																			case 'DCom':
																				break _v0$24;
																			default:
																				break _v0$28;
																		}
																	case 'EChar':
																		switch (_v0.b.$) {
																			case 'DZero':
																				break _v0$0;
																			case 'DId':
																				var _v8 = _v0.a;
																				var _v9 = _v0.b;
																				return _Utils_Tuple3(heap, exp, id);
																			case 'DCons':
																				if (_v0.b.a.$ === 'Just') {
																					if (_v0.b.b.$ === 'DRem') {
																						break _v0$16;
																					} else {
																						break _v0$17;
																					}
																				} else {
																					break _v0$28;
																				}
																			case 'DCom':
																				break _v0$24;
																			default:
																				break _v0$28;
																		}
																	case 'EParens':
																		switch (_v0.b.$) {
																			case 'DZero':
																				break _v0$0;
																			case 'DCons':
																				break _v0$5;
																			case 'DCom':
																				break _v0$5;
																			default:
																				break _v0$5;
																		}
																	case 'EInt':
																		switch (_v0.b.$) {
																			case 'DZero':
																				break _v0$0;
																			case 'DId':
																				var _v4 = _v0.a;
																				var _v5 = _v0.b;
																				return _Utils_Tuple3(heap, exp, id);
																			case 'DAdd':
																				var _v12 = _v0.a;
																				var wss = _v12.a;
																				var n1 = _v12.b;
																				var n2 = _v0.b.a;
																				return _Utils_Tuple3(
																					heap,
																					A2($author$project$Syntax$EInt, wss, n1 + n2),
																					id);
																			case 'DCons':
																				if (_v0.b.a.$ === 'Just') {
																					if (_v0.b.b.$ === 'DRem') {
																						break _v0$16;
																					} else {
																						break _v0$17;
																					}
																				} else {
																					break _v0$28;
																				}
																			case 'DCom':
																				break _v0$24;
																			default:
																				break _v0$28;
																		}
																	case 'EApp':
																		switch (_v0.b.$) {
																			case 'DZero':
																				break _v0$0;
																			case 'DCons':
																				break _v0$8;
																			case 'DCom':
																				break _v0$8;
																			default:
																				break _v0$8;
																		}
																	case 'ELet':
																		switch (_v0.b.$) {
																			case 'DZero':
																				break _v0$0;
																			case 'DCons':
																				break _v0$9;
																			case 'DCom':
																				break _v0$9;
																			default:
																				break _v0$9;
																		}
																	case 'EVar':
																		switch (_v0.b.$) {
																			case 'DZero':
																				break _v0$0;
																			case 'DCons':
																				break _v0$10;
																			case 'DCom':
																				break _v0$10;
																			default:
																				break _v0$10;
																		}
																	case 'ECase':
																		switch (_v0.b.$) {
																			case 'DZero':
																				break _v0$0;
																			case 'DCons':
																				break _v0$11;
																			case 'DCom':
																				break _v0$11;
																			default:
																				break _v0$11;
																		}
																	case 'EBPrim':
																		switch (_v0.b.$) {
																			case 'DZero':
																				break _v0$0;
																			case 'DCons':
																				if (_v0.b.a.$ === 'Just') {
																					switch (_v0.a.b.$) {
																						case 'Mul':
																							break _v0$12;
																						case 'Cat':
																							break _v0$13;
																						default:
																							break _v0$14;
																					}
																				} else {
																					switch (_v0.a.b.$) {
																						case 'Mul':
																							break _v0$12;
																						case 'Cat':
																							break _v0$13;
																						default:
																							break _v0$14;
																					}
																				}
																			case 'DCom':
																				if (_v0.a.b.$ === 'Mul') {
																					break _v0$12;
																				} else {
																					break _v0$14;
																				}
																			default:
																				if (_v0.a.b.$ === 'Mul') {
																					break _v0$12;
																				} else {
																					break _v0$14;
																				}
																		}
																	case 'ECons':
																		switch (_v0.b.$) {
																			case 'DZero':
																				break _v0$0;
																			case 'DId':
																				var _v81 = _v0.a;
																				var wss = _v81.a;
																				var lType = _v81.b;
																				var e1 = _v81.c;
																				var e2 = _v81.d;
																				var _v82 = _v0.b;
																				var _v83 = A4($author$project$Eval$bwd, $author$project$Syntax$DId, heap, e1, id);
																				var heap1 = _v83.a;
																				var e1_ = _v83.b;
																				var id1 = _v83.c;
																				var _v84 = A4($author$project$Eval$bwd, $author$project$Syntax$DId, heap1, e2, id1);
																				var heap2 = _v84.a;
																				var e2_ = _v84.b;
																				var id2 = _v84.c;
																				return _Utils_Tuple3(
																					heap2,
																					A4($author$project$Syntax$ECons, wss, lType, e1_, e2_),
																					id2);
																			case 'DCons':
																				if (_v0.b.a.$ === 'Just') {
																					if (_v0.b.b.$ === 'DRem') {
																						break _v0$16;
																					} else {
																						break _v0$17;
																					}
																				} else {
																					if (_v0.b.b.$ === 'DRem') {
																						var _v108 = _v0.a;
																						var wss = _v108.a;
																						var lType = _v108.b;
																						var e2 = _v108.d;
																						var _v109 = _v0.b;
																						var _v110 = _v109.a;
																						var _v111 = _v109.b;
																						var dv2 = _v109.c;
																						var _v112 = A4($author$project$Eval$bwd, dv2, heap, e2, id);
																						var heap1 = _v112.a;
																						var e2_ = _v112.b;
																						var id1 = _v112.c;
																						var _v113 = _Utils_Tuple3(wss, lType, e2_);
																						_v113$4:
																						while (true) {
																							if (_v113.a.b) {
																								if (_v113.a.b.b) {
																									if ((!_v113.a.b.b.b) && (_v113.b.$ === 'SquareType')) {
																										switch (_v113.c.$) {
																											case 'ECons':
																												var _v114 = _v113.a;
																												var ws1 = _v114.a;
																												var _v115 = _v114.b;
																												var ws2 = _v115.a;
																												var _v116 = _v113.b;
																												var _v117 = _v113.c;
																												var e3 = _v117.c;
																												var e4 = _v117.d;
																												return _Utils_Tuple3(
																													heap1,
																													A4($author$project$Syntax$ECons, wss, lType, e3, e4),
																													id1);
																											case 'ENil':
																												var _v121 = _v113.a;
																												var ws1 = _v121.a;
																												var _v122 = _v121.b;
																												var ws2 = _v122.a;
																												var _v123 = _v113.b;
																												var _v124 = _v113.c;
																												return _Utils_Tuple3(
																													heap1,
																													A2($author$project$Syntax$ENil, wss, lType),
																													id1);
																											default:
																												break _v113$4;
																										}
																									} else {
																										break _v113$4;
																									}
																								} else {
																									if (_v113.b.$ === 'StringType') {
																										switch (_v113.c.$) {
																											case 'ECons':
																												var _v118 = _v113.a;
																												var ws = _v118.a;
																												var _v119 = _v113.b;
																												var _v120 = _v113.c;
																												var e3 = _v120.c;
																												var e4 = _v120.d;
																												return _Utils_Tuple3(
																													heap1,
																													A4($author$project$Syntax$ECons, wss, lType, e3, e4),
																													id1);
																											case 'ENil':
																												var _v125 = _v113.a;
																												var ws = _v125.a;
																												var _v126 = _v113.b;
																												var _v127 = _v113.c;
																												return _Utils_Tuple3(
																													heap1,
																													A2($author$project$Syntax$ENil, wss, lType),
																													id1);
																											default:
																												break _v113$4;
																										}
																									} else {
																										break _v113$4;
																									}
																								}
																							} else {
																								break _v113$4;
																							}
																						}
																						return _Utils_Tuple3(heap1, e2_, id1);
																					} else {
																						var _v128 = _v0.a;
																						var wss = _v128.a;
																						var lType = _v128.b;
																						var e1 = _v128.c;
																						var e2 = _v128.d;
																						var _v129 = _v0.b;
																						var _v130 = _v129.a;
																						var dv1 = _v129.b;
																						var dv2 = _v129.c;
																						var _v131 = A4($author$project$Eval$bwd, dv1, heap, e1, id);
																						var heap1 = _v131.a;
																						var e1_ = _v131.b;
																						var id1 = _v131.c;
																						var _v132 = A4($author$project$Eval$bwd, dv2, heap1, e2, id1);
																						var heap2 = _v132.a;
																						var e2_ = _v132.b;
																						var id2 = _v132.c;
																						return _Utils_Tuple3(
																							heap2,
																							A4($author$project$Syntax$ECons, wss, lType, e1_, e2_),
																							id2);
																					}
																				}
																			case 'DCom':
																				break _v0$24;
																			default:
																				break _v0$28;
																		}
																	case 'EHtml':
																		switch (_v0.b.$) {
																			case 'DZero':
																				break _v0$0;
																			case 'DCons':
																				if (_v0.b.a.$ === 'Just') {
																					if (_v0.b.b.$ === 'DRem') {
																						break _v0$16;
																					} else {
																						break _v0$17;
																					}
																				} else {
																					break _v0$28;
																				}
																			case 'DHtml':
																				var _v137 = _v0.a;
																				var wss = _v137.a;
																				var s1 = _v137.b;
																				var e1 = _v137.c;
																				var e2 = _v137.d;
																				var e3 = _v137.e;
																				var _v138 = _v0.b;
																				var s2 = _v138.a;
																				var dv1 = _v138.b;
																				var dv2 = _v138.c;
																				var dv3 = _v138.d;
																				if (_Utils_eq(s1, s2)) {
																					var _v139 = A4($author$project$Eval$bwd, dv1, heap, e1, id);
																					var heap1 = _v139.a;
																					var e1_ = _v139.b;
																					var id1 = _v139.c;
																					var _v140 = A4($author$project$Eval$bwd, dv2, heap1, e2, id1);
																					var heap2 = _v140.a;
																					var e2_ = _v140.b;
																					var id2 = _v140.c;
																					var _v141 = A4($author$project$Eval$bwd, dv3, heap2, e3, id2);
																					var heap3 = _v141.a;
																					var e3_ = _v141.b;
																					var id3 = _v141.c;
																					return _Utils_Tuple3(
																						heap3,
																						A5($author$project$Syntax$EHtml, wss, s1, e1_, e2_, e3_),
																						id3);
																				} else {
																					return _Utils_Tuple3(
																						heap,
																						$author$project$Syntax$EError('ERROR #02: HTML Type'),
																						id);
																				}
																			case 'DId':
																				var _v142 = _v0.a;
																				var wss = _v142.a;
																				var s = _v142.b;
																				var e1 = _v142.c;
																				var e2 = _v142.d;
																				var e3 = _v142.e;
																				var _v143 = _v0.b;
																				var _v144 = A4($author$project$Eval$bwd, $author$project$Syntax$DId, heap, e1, id);
																				var heap1 = _v144.a;
																				var e1_ = _v144.b;
																				var id1 = _v144.c;
																				var _v145 = A4($author$project$Eval$bwd, $author$project$Syntax$DId, heap1, e2, id1);
																				var heap2 = _v145.a;
																				var e2_ = _v145.b;
																				var id2 = _v145.c;
																				var _v146 = A4($author$project$Eval$bwd, $author$project$Syntax$DId, heap2, e3, id2);
																				var heap3 = _v146.a;
																				var e3_ = _v146.b;
																				var id3 = _v146.c;
																				return _Utils_Tuple3(
																					heap3,
																					A5($author$project$Syntax$EHtml, wss, s, e1_, e2_, e3_),
																					id3);
																			case 'DCom':
																				break _v0$24;
																			default:
																				break _v0$28;
																		}
																	case 'ETuple':
																		switch (_v0.b.$) {
																			case 'DZero':
																				break _v0$0;
																			case 'DCons':
																				if (_v0.b.a.$ === 'Just') {
																					if (_v0.b.b.$ === 'DRem') {
																						break _v0$16;
																					} else {
																						break _v0$17;
																					}
																				} else {
																					break _v0$28;
																				}
																			case 'DId':
																				var _v133 = _v0.a;
																				var wss = _v133.a;
																				var tType = _v133.b;
																				var e1 = _v133.c;
																				var e2 = _v133.d;
																				var _v134 = _v0.b;
																				var _v135 = A4($author$project$Eval$bwd, $author$project$Syntax$DId, heap, e1, id);
																				var heap1 = _v135.a;
																				var e1_ = _v135.b;
																				var id1 = _v135.c;
																				var _v136 = A4($author$project$Eval$bwd, $author$project$Syntax$DId, heap1, e2, id1);
																				var heap2 = _v136.a;
																				var e2_ = _v136.b;
																				var id2 = _v136.c;
																				return _Utils_Tuple3(
																					heap2,
																					A4($author$project$Syntax$ETuple, wss, tType, e1_, e2_),
																					id2);
																			case 'DTuple':
																				var _v147 = _v0.a;
																				var wss = _v147.a;
																				var tType = _v147.b;
																				var e1 = _v147.c;
																				var e2 = _v147.d;
																				var _v148 = _v0.b;
																				var dv1 = _v148.a;
																				var dv2 = _v148.b;
																				var _v149 = A4($author$project$Eval$bwd, dv1, heap, e1, id);
																				var heap1 = _v149.a;
																				var e1_ = _v149.b;
																				var id1 = _v149.c;
																				var _v150 = A4($author$project$Eval$bwd, dv2, heap1, e2, id1);
																				var heap2 = _v150.a;
																				var e2_ = _v150.b;
																				var id2 = _v150.c;
																				return _Utils_Tuple3(
																					heap2,
																					A4($author$project$Syntax$ETuple, wss, tType, e1_, e2_),
																					id2);
																			case 'DCom':
																				break _v0$24;
																			default:
																				break _v0$28;
																		}
																	case 'EUPrim':
																		switch (_v0.b.$) {
																			case 'DZero':
																				break _v0$0;
																			case 'DCons':
																				if (_v0.b.a.$ === 'Just') {
																					if (_v0.b.b.$ === 'DRem') {
																						break _v0$16;
																					} else {
																						break _v0$17;
																					}
																				} else {
																					if (_v0.a.b.$ === 'Neg') {
																						break _v0$25;
																					} else {
																						break _v0$28;
																					}
																				}
																			case 'DCom':
																				break _v0$24;
																			case 'DId':
																				if (_v0.a.b.$ === 'Neg') {
																					break _v0$25;
																				} else {
																					var _v158 = _v0.a;
																					var wss = _v158.a;
																					var _v159 = _v158.b;
																					var e = _v158.c;
																					var _v160 = _v0.b;
																					var _v161 = A4($author$project$Eval$bwd, $author$project$Syntax$DId, heap, e, id);
																					var heap1 = _v161.a;
																					var e_ = _v161.b;
																					var id1 = _v161.c;
																					return _Utils_Tuple3(
																						heap1,
																						A3($author$project$Syntax$EUPrim, wss, $author$project$Syntax$Not, e_),
																						id1);
																				}
																			default:
																				if (_v0.a.b.$ === 'Neg') {
																					break _v0$25;
																				} else {
																					break _v0$28;
																				}
																		}
																	case 'ELam':
																		switch (_v0.b.$) {
																			case 'DZero':
																				break _v0$0;
																			case 'DLam':
																				if (_v0.b.a.$ === 'EVar') {
																					var _v13 = _v0.a;
																					var wssLam = _v13.a;
																					var x = _v13.b;
																					var ef = _v13.c;
																					var _v14 = _v0.b;
																					var _v15 = _v14.a;
																					var x1 = _v15.b;
																					var dv1 = _v14.b;
																					var _v16 = A2(
																						$author$project$LangUtils$Rename$renameExp,
																						A3($author$project$LangUtils$Substitute$substExp, ef, x, x1),
																						id);
																					var ef1 = _v16.a;
																					var id1 = _v16.b;
																					var renameSet = _v16.c;
																					var swapedRenamedVars = A2(
																						$elm$core$List$map,
																						function (_v18) {
																							var a = _v18.a;
																							var b = _v18.b;
																							return _Utils_Tuple2(b, a);
																						},
																						renameSet);
																					var _v17 = A4($author$project$Eval$bwd, dv1, heap, ef1, id1);
																					var heap_ = _v17.a;
																					var ef_ = _v17.b;
																					var id2 = _v17.c;
																					return _Utils_Tuple3(
																						heap_,
																						A3(
																							$author$project$Syntax$ELam,
																							wssLam,
																							x,
																							A2(
																								$author$project$LangUtils$Substitute$substSet,
																								A3($author$project$LangUtils$Substitute$substExp, ef_, x1, x),
																								swapedRenamedVars)),
																						id2);
																				} else {
																					break _v0$28;
																				}
																			case 'DCons':
																				if (_v0.b.a.$ === 'Just') {
																					if (_v0.b.b.$ === 'DRem') {
																						break _v0$16;
																					} else {
																						break _v0$17;
																					}
																				} else {
																					break _v0$28;
																				}
																			case 'DCom':
																				break _v0$24;
																			case 'DId':
																				var _v162 = _v0.a;
																				var _v163 = _v0.b;
																				var _v164 = A2($elm$core$Debug$log, 'Error in Bwd', 'ERROR #08: Lambda cannot be modified by identity delta.');
																				return _Utils_Tuple3(heap, exp, id);
																			default:
																				break _v0$28;
																		}
																	default:
																		switch (_v0.b.$) {
																			case 'DZero':
																				break _v0$0;
																			case 'DCons':
																				if (_v0.b.a.$ === 'Just') {
																					if (_v0.b.b.$ === 'DRem') {
																						break _v0$16;
																					} else {
																						break _v0$17;
																					}
																				} else {
																					break _v0$28;
																				}
																			case 'DCom':
																				break _v0$24;
																			default:
																				break _v0$28;
																		}
																}
															}
															var _v165 = A2(
																$elm$core$Debug$log,
																'Error in Bwd',
																_Utils_Tuple2(exp, dv));
															return _Utils_Tuple3(heap, exp, id);
														}
														var _v154 = _v0.a;
														var wss = _v154.a;
														var _v155 = _v154.b;
														var e = _v154.c;
														var _v156 = function () {
															switch (dv.$) {
																case 'DAdd':
																	var n = dv.a;
																	return A4(
																		$author$project$Eval$bwd,
																		$author$project$Syntax$DAdd(-n),
																		heap,
																		e,
																		id);
																case 'DId':
																	return A4($author$project$Eval$bwd, $author$project$Syntax$DId, heap, e, id);
																default:
																	return _Utils_Tuple3(
																		heap,
																		$author$project$Syntax$EError('ERROR #10: Invalid delta for Negation'),
																		id);
															}
														}();
														var heap1 = _v156.a;
														var e_ = _v156.b;
														var id1 = _v156.c;
														return _Utils_Tuple3(
															heap1,
															A3($author$project$Syntax$EUPrim, wss, $author$project$Syntax$Neg, e_),
															id1);
													}
													var _v151 = _v0.b;
													var dv2 = _v151.a;
													var dv1 = _v151.b;
													var _v152 = A4($author$project$Eval$bwd, dv1, heap, exp, id);
													var heap1 = _v152.a;
													var exp1 = _v152.b;
													var id1 = _v152.c;
													var _v153 = A4(
														$author$project$Eval$bwd,
														dv2,
														A2($author$project$Eval$refreshHeap, heap, heap1),
														exp1,
														id1);
													var heap2 = _v153.a;
													var exp2 = _v153.b;
													var id2 = _v153.c;
													return _Utils_Tuple3(heap2, exp2, id2);
												}
												var _v88 = _v0.b;
												var e1 = _v88.a.a;
												var dv1 = _v88.b;
												var dv2 = _v88.c;
												var _v89 = A4($author$project$Eval$bwd, dv1, heap, e1, id);
												var heap1 = _v89.a;
												var e1_ = _v89.b;
												var id1 = _v89.c;
												var _v90 = A4($author$project$Eval$bwd, dv2, heap1, exp, id1);
												var heap2 = _v90.a;
												var e2_ = _v90.b;
												var id2 = _v90.c;
												var _v91 = function () {
													_v92$7:
													while (true) {
														switch (exp.$) {
															case 'ECons':
																switch (exp.b.$) {
																	case 'ConsType':
																		var wss = exp.a;
																		var _v93 = exp.b;
																		return _Utils_Tuple3(wss, $author$project$Syntax$ConsType, e2_);
																	case 'SquareType':
																		if (exp.a.b) {
																			if (exp.a.b.b) {
																				if (!exp.a.b.b.b) {
																					var _v94 = exp.a;
																					var ws1 = _v94.a;
																					var _v95 = _v94.b;
																					var ws2 = _v95.a;
																					var _v96 = exp.b;
																					return _Utils_Tuple3(
																						_List_fromArray(
																							[ws1, ws2]),
																						$author$project$Syntax$SquareType,
																						A2($author$project$Parser$Utils$repWS, $author$project$Syntax$eConsDefaultWSS, e2_));
																				} else {
																					break _v92$7;
																				}
																			} else {
																				var _v97 = exp.a;
																				var ws = _v97.a;
																				var _v98 = exp.b;
																				return _Utils_Tuple3(
																					_List_fromArray(
																						[ws]),
																					$author$project$Syntax$SquareType,
																					e2_);
																			}
																		} else {
																			break _v92$7;
																		}
																	default:
																		var wss = exp.a;
																		var _v106 = exp.b;
																		return _Utils_Tuple3(wss, $author$project$Syntax$StringType, e2_);
																}
															case 'ENil':
																switch (exp.b.$) {
																	case 'SquareType':
																		if (exp.a.b) {
																			if (exp.a.b.b && (!exp.a.b.b.b)) {
																				var _v99 = exp.a;
																				var ws1 = _v99.a;
																				var _v100 = _v99.b;
																				var ws2 = _v100.a;
																				var _v101 = exp.b;
																				var e2__WS = function () {
																					_v102$2:
																					while (true) {
																						switch (e2_.$) {
																							case 'ECons':
																								if (e2_.b.$ === 'SquareType') {
																									var _v103 = e2_.b;
																									return $author$project$Syntax$eConsDefaultWSS;
																								} else {
																									break _v102$2;
																								}
																							case 'ENil':
																								if (e2_.b.$ === 'SquareType') {
																									var _v104 = e2_.b;
																									return _List_Nil;
																								} else {
																									break _v102$2;
																								}
																							default:
																								break _v102$2;
																						}
																					}
																					return _List_fromArray(
																						[
																							'ERROR #17: DCons update error, exp=' + $elm$core$Debug$toString(exp)
																						]);
																				}();
																				return _Utils_Tuple3(
																					_List_fromArray(
																						[ws1, ws2]),
																					$author$project$Syntax$SquareType,
																					A2($author$project$Parser$Utils$repWS, e2__WS, e2_));
																			} else {
																				break _v92$7;
																			}
																		} else {
																			var _v105 = exp.b;
																			return _Utils_Tuple3($author$project$Syntax$eConsDefaultWSS, $author$project$Syntax$SquareType, e2_);
																		}
																	case 'StringType':
																		var wss = exp.a;
																		var _v107 = exp.b;
																		return _Utils_Tuple3(wss, $author$project$Syntax$StringType, e2_);
																	default:
																		break _v92$7;
																}
															default:
																break _v92$7;
														}
													}
													return _Utils_Tuple3($author$project$Syntax$eConsDefaultWSS, $author$project$Syntax$SquareType, e2_);
												}();
												var wssInserted = _v91.a;
												var lTypeInserted = _v91.b;
												var e2__ = _v91.c;
												return _Utils_Tuple3(
													heap2,
													A4($author$project$Syntax$ECons, wssInserted, lTypeInserted, e1_, e2__),
													id2);
											}
											var _v85 = _v0.b;
											var _v86 = _v85.b;
											var dv2 = _v85.c;
											var _v87 = A4($author$project$Eval$bwd, dv2, heap, exp, id);
											var heap1 = _v87.a;
											var e2_ = _v87.b;
											var id2 = _v87.c;
											return _Utils_Tuple3(heap1, e2_, id2);
										}
										var _v78 = _v0.a;
										var wss = _v78.a;
										var op = _v78.b;
										var e1 = _v78.c;
										var e2 = _v78.d;
										var _v79 = A4($author$project$Eval$bwd, dv, heap, e1, id);
										var heap1 = _v79.a;
										var e1_ = _v79.b;
										var id1 = _v79.c;
										var _v80 = A4($author$project$Eval$bwd, $author$project$Syntax$DId, heap1, e2, id1);
										var heap2 = _v80.a;
										var e2_ = _v80.b;
										var id2 = _v80.c;
										return _Utils_Tuple3(
											heap2,
											A4($author$project$Syntax$EBPrim, wss, op, e1_, e2_),
											id2);
									}
									var _v71 = _v0.a;
									var wss = _v71.a;
									var _v72 = _v71.b;
									var e1 = _v71.c;
									var e2 = _v71.d;
									var _v73 = _v0.b;
									var _v74 = A4($author$project$Eval$splitDelta, e1, dv, heap, id);
									var _v75 = _v74.a;
									var dv1 = _v75.a;
									var dv2 = _v75.b;
									var _v76 = A4($author$project$Eval$bwd, dv1, heap, e1, id);
									var heap1 = _v76.a;
									var e1_ = _v76.b;
									var id1 = _v76.c;
									var _v77 = A4($author$project$Eval$bwd, dv2, heap1, e2, id1);
									var heap2 = _v77.a;
									var e2_ = _v77.b;
									var id2 = _v77.c;
									return _Utils_Tuple3(
										heap2,
										A4($author$project$Syntax$EBPrim, wss, $author$project$Syntax$Cat, e1_, e2_),
										id2);
								}
								var _v60 = _v0.a;
								var wss = _v60.a;
								var _v61 = _v60.b;
								var e1 = _v60.c;
								var e2 = _v60.d;
								var _v62 = $author$project$LangUtils$Fuse$simplify(dv);
								switch (_v62.$) {
									case 'DId':
										var _v63 = A4($author$project$Eval$bwd, $author$project$Syntax$DId, heap, e1, id);
										var heap1 = _v63.a;
										var e1_ = _v63.b;
										var id1 = _v63.c;
										var _v64 = A4($author$project$Eval$bwd, $author$project$Syntax$DId, heap1, e2, id1);
										var heap2 = _v64.a;
										var e2_ = _v64.b;
										var id2 = _v64.c;
										return _Utils_Tuple3(
											heap2,
											A4($author$project$Syntax$EBPrim, wss, $author$project$Syntax$Mul, e1_, e2_),
											id2);
									case 'DAdd':
										var n = _v62.a;
										var _v65 = A3($author$project$Eval$fwd, heap, e2, id);
										if (_v65.$ === 'Ok') {
											var _v66 = _v65.a;
											var z2 = _v66.b;
											if (z2.$ === 'EInt') {
												var n2 = z2.b;
												var _v68 = A4(
													$author$project$Eval$bwd,
													$author$project$Syntax$DAdd((n / n2) | 0),
													heap,
													e1,
													id);
												var heap1 = _v68.a;
												var e1_ = _v68.b;
												var id1 = _v68.c;
												var _v69 = A4($author$project$Eval$bwd, $author$project$Syntax$DId, heap1, e2, id1);
												var heap2 = _v69.a;
												var e2_ = _v69.b;
												var id2 = _v69.c;
												return _Utils_Tuple3(
													heap2,
													A4($author$project$Syntax$EBPrim, wss, $author$project$Syntax$Mul, e1_, e2_),
													id2);
											} else {
												return _Utils_Tuple3(
													heap,
													$author$project$Syntax$EError('ERROR #03: Wrong Operands.'),
													id);
											}
										} else {
											var e = _v65.a;
											return _Utils_Tuple3(
												heap,
												$author$project$Syntax$EError(e),
												id);
										}
									default:
										var _v70 = A2(
											$elm$core$Debug$log,
											'Bwd Mul Err: ',
											$author$project$LangUtils$Fuse$simplify(dv));
										return _Utils_Tuple3(
											heap,
											$author$project$Syntax$EError('ERROR #03: Currently, Mul does not support composition.'),
											id);
								}
							}
							var _v52 = _v0.a;
							var wss = _v52.a;
							var guard = _v52.b;
							var branch = _v52.c;
							var matchfwd = A2(
								$elm$core$Result$andThen,
								function (_v59) {
									var heap1_ = _v59.a;
									var zarg = _v59.b;
									var id1 = _v59.c;
									return A4($author$project$Eval$matchCase, zarg, branch, id1, heap1_);
								},
								A3($author$project$Eval$fwd, heap, guard, id));
							if (matchfwd.$ === 'Err') {
								var e = matchfwd.a;
								return _Utils_Tuple3(
									heap,
									$author$project$Syntax$EError(e),
									id);
							} else {
								var _v54 = matchfwd.a;
								var matchRes = _v54.a;
								var id3 = _v54.b;
								var swapedRenamedVars = A2(
									$elm$core$List$map,
									function (_v58) {
										var x = _v58.a;
										var y = _v58.b;
										return _Utils_Tuple2(y, x);
									},
									matchRes.renamedvars);
								var _v55 = A4(
									$author$project$Eval$bwd,
									dv,
									matchRes.heap,
									A2($author$project$LangUtils$Substitute$substSet, matchRes.ei, matchRes.renamedvars),
									id3);
								var heap2 = _v55.a;
								var ei_ = _v55.b;
								var id4 = _v55.c;
								var dv_guard = A2(
									$author$project$Eval$collectDvForGuard,
									heap2,
									A2($author$project$Eval$replPat, matchRes.pi, matchRes.renamedvars));
								var _v56 = A4($author$project$Eval$bwd, dv_guard, heap2, guard, id4);
								var heap4 = _v56.a;
								var guard_ = _v56.b;
								var id5 = _v56.c;
								var _v57 = A4(
									$author$project$Eval$updateBranch,
									branch,
									matchRes.choice,
									A2($author$project$LangUtils$Substitute$substSet, ei_, swapedRenamedVars),
									0);
								var branch_ = _v57.a;
								return _Utils_Tuple3(
									heap4,
									A3($author$project$Syntax$ECase, wss, guard_, branch_),
									id5);
							}
						}
						var _v28 = _v0.a;
						var wss = _v28.a;
						var x = _v28.b;
						var n = _v28.c;
						return function (_v29) {
							var h_ = _v29.a;
							var e_ = _v29.b;
							var id_ = _v29.c;
							if (e_.$ === 'EVar') {
								return _Utils_Tuple3(h_, e_, id_);
							} else {
								return _Utils_Tuple3(
									h_,
									A2($author$project$Syntax$EParens, $author$project$Syntax$eParensDefaultWSS, e_),
									id_);
							}
						}(
							function () {
								var _v31 = A2($author$project$Utils$lookup, x, heap);
								if (_v31.$ === 'Just') {
									var _v32 = _v31.a;
									var _v33 = _v32.a;
									var e = _v33.a;
									var nE = _v33.b;
									var dv1 = _v32.b;
									var _v34 = _v32.c;
									var v = _v34.a;
									var b = _v34.b;
									if (_Utils_eq(
										n,
										$author$project$LangUtils$Delta$length(dv1)) && (!b)) {
										var _v35 = A4($author$project$Eval$bwd, dv, heap, nE, id);
										var heap1 = _v35.a;
										var nE_ = _v35.b;
										var id1 = _v35.c;
										var _v36 = A2($author$project$Utils$lookup, x, heap1);
										if (_v36.$ === 'Just') {
											if (_v36.a.c.b) {
												var _v37 = _v36.a;
												var _v38 = _v37.a;
												var nE1_ = _v38.b;
												var _v39 = _v37.c;
												return A2($author$project$LangUtils$Equality$eqExp, nE_, nE1_) ? _Utils_Tuple3(
													heap1,
													A3(
														$author$project$Syntax$EVar,
														wss,
														x,
														$author$project$LangUtils$Delta$length(dv1)),
													id1) : _Utils_Tuple3(heap1, nE_, id1);
											} else {
												var _v40 = _v36.a;
												var _v41 = _v40.c;
												return _Utils_Tuple3(
													A3(
														$author$project$Utils$replace,
														x,
														_Utils_Tuple3(
															_Utils_Tuple2(e, nE_),
															A2($author$project$Syntax$DCom, dv, dv1),
															_Utils_Tuple2(v, true)),
														heap1),
													A3(
														$author$project$Syntax$EVar,
														wss,
														x,
														$author$project$LangUtils$Delta$length(
															A2($author$project$Syntax$DCom, dv, dv1))),
													id1);
											}
										} else {
											return _Utils_Tuple3(
												heap,
												$author$project$Syntax$EError('ERROR #09: No Such Variable'),
												id);
										}
									} else {
										if ((!$author$project$LangUtils$Delta$isNorm(dv1)) && (!_Utils_eq(dv1, $author$project$Syntax$DZero))) {
											var _v42 = A2($author$project$LangUtils$Delta$take, n, dv1);
											if (_v42.$ === 'Ok') {
												var _v43 = _v42.a;
												var dv_ = _v43.a;
												var _v44 = A4($author$project$Eval$bwd, dv_, heap, e, id);
												var heap1 = _v44.a;
												var e1 = _v44.b;
												var id1 = _v44.c;
												var _v45 = A4($author$project$Eval$bwd, dv, heap1, e1, id1);
												var heap2 = _v45.a;
												var e2 = _v45.b;
												var id2 = _v45.c;
												return A2($author$project$LangUtils$Equality$eqExp, e2, nE) ? _Utils_Tuple3(
													heap2,
													A3(
														$author$project$Syntax$EVar,
														wss,
														x,
														$author$project$LangUtils$Delta$length(dv1)),
													id2) : _Utils_Tuple3(heap2, e2, id2);
											} else {
												var res = _v42;
												return _Utils_Tuple3(
													heap,
													$author$project$Syntax$EError(
														$elm$core$Debug$toString(res)),
													id);
											}
										} else {
											var _v46 = A2($author$project$LangUtils$Delta$drop, n, dv1);
											if (_v46.$ === 'Ok') {
												var _v47 = _v46.a;
												var dv_ = _v47.a;
												var _v48 = A2(
													$elm$core$Result$map,
													$author$project$LangUtils$Fuse$simplify,
													A2($author$project$Eval$diffDeltas, dv, dv_));
												if (_v48.$ === 'Ok') {
													switch (_v48.a.$) {
														case 'DZero':
															var _v49 = _v48.a;
															return _Utils_Tuple3(
																heap,
																A3(
																	$author$project$Syntax$EVar,
																	wss,
																	x,
																	$author$project$LangUtils$Delta$length(dv1)),
																id);
														case 'DId':
															var _v50 = _v48.a;
															return _Utils_Tuple3(
																heap,
																A3(
																	$author$project$Syntax$EVar,
																	wss,
																	x,
																	$author$project$LangUtils$Delta$length(dv1)),
																id);
														case 'DAdd':
															var n1 = _v48.a.a;
															return _Utils_Tuple3(
																heap,
																A4(
																	$author$project$Syntax$EBPrim,
																	$author$project$Syntax$eBPrimDefaultWSS,
																	$author$project$Syntax$Add,
																	A3(
																		$author$project$Syntax$EVar,
																		wss,
																		x,
																		$author$project$LangUtils$Delta$length(dv1)),
																	A2($author$project$Syntax$EInt, $author$project$Syntax$eIntDefaultWSS, n1)),
																id);
														default:
															var dv_diff = _v48.a;
															var _v51 = A2($author$project$LangUtils$Fuse$deltaToFun, dv_diff, id);
															var fun = _v51.a;
															return _Utils_Tuple3(
																heap,
																A2(
																	$author$project$Syntax$EApp,
																	fun,
																	A3(
																		$author$project$Syntax$EVar,
																		wss,
																		x,
																		$author$project$LangUtils$Delta$length(dv1))),
																id);
													}
												} else {
													var res = _v48;
													return _Utils_Tuple3(
														heap,
														$author$project$Syntax$EError(
															$elm$core$Debug$toString(res)),
														id);
												}
											} else {
												var res = _v46;
												return _Utils_Tuple3(
													heap,
													$author$project$Syntax$EError(
														$elm$core$Debug$toString(res)),
													id);
											}
										}
									}
								} else {
									return _Utils_Tuple3(
										heap,
										$author$project$Syntax$EError('ERROR #04: No Such Variable'),
										id);
								}
							}());
					}
					var _v25 = _v0.a;
					var wss = _v25.a;
					var decls = _v25.b;
					var e = _v25.c;
					var _v26 = A4(
						$author$project$Eval$bwd,
						dv,
						_Utils_ap(decls, heap),
						e,
						id);
					var heap1 = _v26.a;
					var e_ = _v26.b;
					var id1 = _v26.c;
					var _v27 = A2($author$project$Eval$splitHeap, decls, heap1);
					var decls_ = _v27.a;
					var heap_ = _v27.b;
					return _Utils_Tuple3(
						heap_,
						A3($author$project$Syntax$ELet, wss, decls_, e_),
						id1);
				}
				var _v19 = _v0.a;
				var e1 = _v19.a;
				var e2 = _v19.b;
				var _v20 = A2($author$project$LangUtils$Rename$freshName, 'R', id);
				var x = _v20.a;
				var id1 = _v20.b;
				var heapWithArg = A2(
					$elm$core$List$cons,
					_Utils_Tuple2(
						x,
						_Utils_Tuple3(
							_Utils_Tuple2(e2, e2),
							$author$project$Syntax$DZero,
							_Utils_Tuple2($elm$core$Maybe$Nothing, false))),
					heap);
				var _v21 = A4(
					$author$project$Eval$bwd,
					A2(
						$author$project$Syntax$DLam,
						A3($author$project$Syntax$EVar, $author$project$Syntax$eVarDefaultWSS, x, 0),
						dv),
					heapWithArg,
					e1,
					id1);
				var heap1 = _v21.a;
				var e1_ = _v21.b;
				var id2 = _v21.c;
				var _v22 = A2($author$project$Utils$lookup, x, heap1);
				if (_v22.$ === 'Just') {
					var _v23 = _v22.a;
					var _v24 = _v23.a;
					var e2_ = _v24.b;
					return _Utils_Tuple3(
						heap1,
						A2($author$project$Syntax$EApp, e1_, e2_),
						id2);
				} else {
					return _Utils_Tuple3(
						heap,
						$author$project$Syntax$EError('ERROR #01: No Such Variable'),
						id);
				}
			}
			var _v10 = _v0.a;
			var wss = _v10.a;
			var e = _v10.b;
			var _v11 = A4($author$project$Eval$bwd, dv, heap, e, id);
			var heap1 = _v11.a;
			var exp1 = _v11.b;
			var id1 = _v11.c;
			return _Utils_Tuple3(
				heap1,
				A2($author$project$Syntax$EParens, wss, exp1),
				id1);
		}
		var _v1 = _v0.b;
		return _Utils_Tuple3(heap, exp, id);
	});
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
var $Punie$elm_parser_extras$Parser$Expression$initOps = {lassoc: _List_Nil, nassoc: _List_Nil, postfix: _List_Nil, prefix: _List_Nil, rassoc: _List_Nil};
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
var $elm$parser$Parser$Advanced$keeper = F2(
	function (parseFunc, parseArg) {
		return A3($elm$parser$Parser$Advanced$map2, $elm$core$Basics$apL, parseFunc, parseArg);
	});
var $elm$parser$Parser$keeper = $elm$parser$Parser$Advanced$keeper;
var $elm$parser$Parser$Advanced$Empty = {$: 'Empty'};
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
var $elm$core$Tuple$pair = F2(
	function (a, b) {
		return _Utils_Tuple2(a, b);
	});
var $elm$parser$Parser$Problem = function (a) {
	return {$: 'Problem', a: a};
};
var $elm$parser$Parser$Advanced$AddRight = F2(
	function (a, b) {
		return {$: 'AddRight', a: a, b: b};
	});
var $elm$parser$Parser$Advanced$DeadEnd = F4(
	function (row, col, problem, contextStack) {
		return {col: col, contextStack: contextStack, problem: problem, row: row};
	});
var $elm$parser$Parser$Advanced$fromState = F2(
	function (s, x) {
		return A2(
			$elm$parser$Parser$Advanced$AddRight,
			$elm$parser$Parser$Advanced$Empty,
			A4($elm$parser$Parser$Advanced$DeadEnd, s.row, s.col, x, s.context));
	});
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
var $elm$parser$Parser$Advanced$succeed = function (a) {
	return $elm$parser$Parser$Advanced$Parser(
		function (s) {
			return A3($elm$parser$Parser$Advanced$Good, false, a, s);
		});
};
var $elm$parser$Parser$succeed = $elm$parser$Parser$Advanced$succeed;
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
var $elm$core$Basics$always = F2(
	function (a, _v0) {
		return a;
	});
var $elm$parser$Parser$Advanced$ignorer = F2(
	function (keepParser, ignoreParser) {
		return A3($elm$parser$Parser$Advanced$map2, $elm$core$Basics$always, keepParser, ignoreParser);
	});
var $elm$parser$Parser$ignorer = $elm$parser$Parser$Advanced$ignorer;
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
var $elm$parser$Parser$Advanced$spaces = $elm$parser$Parser$Advanced$chompWhile(
	function (c) {
		return _Utils_eq(
			c,
			_Utils_chr(' ')) || (_Utils_eq(
			c,
			_Utils_chr('\n')) || _Utils_eq(
			c,
			_Utils_chr('\r')));
	});
var $elm$parser$Parser$spaces = $elm$parser$Parser$Advanced$spaces;
var $elm$parser$Parser$ExpectingSymbol = function (a) {
	return {$: 'ExpectingSymbol', a: a};
};
var $elm$parser$Parser$Advanced$Token = F2(
	function (a, b) {
		return {$: 'Token', a: a, b: b};
	});
var $elm$parser$Parser$Advanced$isSubString = _Parser_isSubString;
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
var $author$project$Parser$Delta$dAdd = A2(
	$elm$parser$Parser$keeper,
	A2(
		$elm$parser$Parser$ignorer,
		$elm$parser$Parser$succeed($author$project$Syntax$DAdd),
		$elm$parser$Parser$symbol('+')),
	A2(
		$elm$parser$Parser$ignorer,
		$elm$parser$Parser$oneOf(
			_List_fromArray(
				[
					$elm$parser$Parser$int,
					A2(
					$elm$parser$Parser$keeper,
					A2(
						$elm$parser$Parser$ignorer,
						$elm$parser$Parser$succeed($elm$core$Basics$negate),
						$elm$parser$Parser$symbol('-')),
					$elm$parser$Parser$int)
				])),
		$elm$parser$Parser$spaces));
var $author$project$Syntax$DDelete = function (a) {
	return {$: 'DDelete', a: a};
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
var $author$project$Parser$Delta$dDelete = A2(
	$elm$parser$Parser$keeper,
	A2(
		$elm$parser$Parser$ignorer,
		A2(
			$elm$parser$Parser$ignorer,
			$elm$parser$Parser$succeed($author$project$Syntax$DDelete),
			$elm$parser$Parser$keyword('delete')),
		$elm$parser$Parser$spaces),
	A2($elm$parser$Parser$ignorer, $elm$parser$Parser$int, $elm$parser$Parser$spaces));
var $author$project$Parser$Delta$dId = A2(
	$elm$parser$Parser$ignorer,
	A2(
		$elm$parser$Parser$ignorer,
		$elm$parser$Parser$succeed($author$project$Syntax$DId),
		$elm$parser$Parser$keyword('id')),
	$elm$parser$Parser$spaces);
var $author$project$Syntax$DInsert = F2(
	function (a, b) {
		return {$: 'DInsert', a: a, b: b};
	});
var $elm$parser$Parser$Done = function (a) {
	return {$: 'Done', a: a};
};
var $author$project$Syntax$GuiType = {$: 'GuiType'};
var $elm$parser$Parser$Loop = function (a) {
	return {$: 'Loop', a: a};
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
var $author$project$Parser$WhiteSpace$isWhiteSpace = function (c) {
	return _Utils_eq(
		c,
		_Utils_chr(' ')) || (_Utils_eq(
		c,
		_Utils_chr('\n')) || (_Utils_eq(
		c,
		_Utils_chr('\r')) || _Utils_eq(
		c,
		_Utils_chr('\t'))));
};
var $author$project$Parser$WhiteSpace$mSpaces = $elm$parser$Parser$getChompedString(
	$elm$parser$Parser$chompWhile($author$project$Parser$WhiteSpace$isWhiteSpace));
var $author$project$Parser$Exp$bool_ = $elm$parser$Parser$oneOf(
	_List_fromArray(
		[
			A2(
			$elm$parser$Parser$keeper,
			A2(
				$elm$parser$Parser$ignorer,
				$elm$parser$Parser$succeed(
					function (ws) {
						return A2(
							$author$project$Syntax$EBool,
							_List_fromArray(
								[ws]),
							true);
					}),
				$elm$parser$Parser$keyword('True')),
			$author$project$Parser$WhiteSpace$mSpaces),
			A2(
			$elm$parser$Parser$keeper,
			A2(
				$elm$parser$Parser$ignorer,
				$elm$parser$Parser$succeed(
					function (ws) {
						return A2(
							$author$project$Syntax$EBool,
							_List_fromArray(
								[ws]),
							false);
					}),
				$elm$parser$Parser$keyword('False')),
			$author$project$Parser$WhiteSpace$mSpaces)
		]));
var $Punie$elm_parser_extras$Parser$Expression$AssocRight = {$: 'AssocRight'};
var $Punie$elm_parser_extras$Parser$Expression$Infix = F2(
	function (a, b) {
		return {$: 'Infix', a: a, b: b};
	});
var $author$project$Parser$Exp$branchOp = _List_fromArray(
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
						function (ws) {
							return $author$project$Syntax$BCom(
								_List_fromArray(
									[ws]));
						}),
					$elm$parser$Parser$symbol('|')),
				$author$project$Parser$WhiteSpace$mSpaces),
			$Punie$elm_parser_extras$Parser$Expression$AssocRight)
		])
	]);
var $author$project$Parser$Exp$exprListToECons = F2(
	function (lType, ls) {
		if (!ls.b) {
			return A2($author$project$Syntax$ENil, _List_Nil, $author$project$Syntax$SquareType);
		} else {
			var _v1 = ls.a;
			var wss = _v1.a;
			var e = _v1.b;
			var es = ls.b;
			return A4(
				$author$project$Syntax$ECons,
				wss,
				lType,
				e,
				A2($author$project$Parser$Exp$exprListToECons, lType, es));
		}
	});
var $author$project$Parser$Exp$flip = F3(
	function (f, x, y) {
		return A2(f, y, x);
	});
var $author$project$Parser$Exp$heapListToExp = function (declList) {
	if (!declList.b) {
		return _Utils_Tuple2(_List_Nil, _List_Nil);
	} else {
		var _v1 = declList.a;
		var wsHead = _v1.a;
		var heapHead = _v1.b;
		var declListTail = declList.b;
		var _v2 = $author$project$Parser$Exp$heapListToExp(declListTail);
		var wsTail = _v2.a;
		var heapTail = _v2.b;
		return _Utils_Tuple2(
			_Utils_ap(wsHead, wsTail),
			_Utils_ap(heapHead, heapTail));
	}
};
var $elm$parser$Parser$ExpectingBinary = {$: 'ExpectingBinary'};
var $elm$parser$Parser$ExpectingFloat = {$: 'ExpectingFloat'};
var $elm$parser$Parser$ExpectingHex = {$: 'ExpectingHex'};
var $elm$parser$Parser$ExpectingNumber = {$: 'ExpectingNumber'};
var $elm$parser$Parser$ExpectingOctal = {$: 'ExpectingOctal'};
var $elm$core$Result$fromMaybe = F2(
	function (err, maybe) {
		if (maybe.$ === 'Just') {
			var v = maybe.a;
			return $elm$core$Result$Ok(v);
		} else {
			return $elm$core$Result$Err(err);
		}
	});
var $elm$parser$Parser$number = function (i) {
	return $elm$parser$Parser$Advanced$number(
		{
			binary: A2($elm$core$Result$fromMaybe, $elm$parser$Parser$ExpectingBinary, i.binary),
			expecting: $elm$parser$Parser$ExpectingNumber,
			_float: A2($elm$core$Result$fromMaybe, $elm$parser$Parser$ExpectingFloat, i._float),
			hex: A2($elm$core$Result$fromMaybe, $elm$parser$Parser$ExpectingHex, i.hex),
			_int: A2($elm$core$Result$fromMaybe, $elm$parser$Parser$ExpectingInt, i._int),
			invalid: $elm$parser$Parser$ExpectingNumber,
			octal: A2($elm$core$Result$fromMaybe, $elm$parser$Parser$ExpectingOctal, i.octal)
		});
};
var $author$project$Parser$Exp$int_ = A2(
	$elm$parser$Parser$keeper,
	A2(
		$elm$parser$Parser$keeper,
		$elm$parser$Parser$succeed(
			F2(
				function (n, ws) {
					return A2(
						$author$project$Syntax$EInt,
						_List_fromArray(
							[ws]),
						n);
				})),
		$elm$parser$Parser$number(
			{
				binary: $elm$core$Maybe$Just($elm$core$Basics$identity),
				_float: $elm$core$Maybe$Nothing,
				hex: $elm$core$Maybe$Just($elm$core$Basics$identity),
				_int: $elm$core$Maybe$Just($elm$core$Basics$identity),
				octal: $elm$core$Maybe$Just($elm$core$Basics$identity)
			})),
	$author$project$Parser$WhiteSpace$mSpaces);
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
var $author$project$Parser$Exp$nil = A2(
	$elm$parser$Parser$keeper,
	A2(
		$elm$parser$Parser$keeper,
		A2(
			$elm$parser$Parser$ignorer,
			$elm$parser$Parser$succeed(
				F2(
					function (ws1, ws2) {
						return A2(
							$author$project$Syntax$ENil,
							_List_fromArray(
								[ws1, ws2]),
							$author$project$Syntax$SquareType);
					})),
			$elm$parser$Parser$symbol('[')),
		A2(
			$elm$parser$Parser$ignorer,
			$author$project$Parser$WhiteSpace$mSpaces,
			$elm$parser$Parser$symbol(']'))),
	$author$project$Parser$WhiteSpace$mSpaces);
var $author$project$Syntax$And = {$: 'And'};
var $Punie$elm_parser_extras$Parser$Expression$AssocLeft = {$: 'AssocLeft'};
var $Punie$elm_parser_extras$Parser$Expression$AssocNone = {$: 'AssocNone'};
var $author$project$Syntax$Eq = {$: 'Eq'};
var $author$project$Syntax$Ge = {$: 'Ge'};
var $author$project$Syntax$Gt = {$: 'Gt'};
var $author$project$Syntax$Le = {$: 'Le'};
var $author$project$Syntax$Lt = {$: 'Lt'};
var $author$project$Syntax$Mod = {$: 'Mod'};
var $author$project$Syntax$Ne = {$: 'Ne'};
var $author$project$Syntax$Or = {$: 'Or'};
var $Punie$elm_parser_extras$Parser$Expression$Prefix = function (a) {
	return {$: 'Prefix', a: a};
};
var $author$project$Syntax$Sub = {$: 'Sub'};
var $author$project$Parser$Exp$bop = F2(
	function (s, op) {
		return A2(
			$elm$parser$Parser$keeper,
			A2(
				$elm$parser$Parser$ignorer,
				$elm$parser$Parser$succeed(
					F3(
						function (ws, e1, e2) {
							return A4(
								$author$project$Syntax$EBPrim,
								_List_fromArray(
									[ws]),
								op,
								e1,
								e2);
						})),
				$elm$parser$Parser$symbol(s)),
			$author$project$Parser$WhiteSpace$mSpaces);
	});
var $author$project$Parser$Exp$cons = A2(
	$elm$parser$Parser$keeper,
	A2(
		$elm$parser$Parser$ignorer,
		$elm$parser$Parser$succeed(
			function (ws) {
				return A2(
					$author$project$Syntax$ECons,
					_List_fromArray(
						[ws]),
					$author$project$Syntax$ConsType);
			}),
		$elm$parser$Parser$symbol('::')),
	$author$project$Parser$WhiteSpace$mSpaces);
var $author$project$Parser$Exp$uop = F2(
	function (s, op) {
		return A2(
			$elm$parser$Parser$keeper,
			A2(
				$elm$parser$Parser$ignorer,
				$elm$parser$Parser$succeed(
					F2(
						function (ws, e) {
							return A3(
								$author$project$Syntax$EUPrim,
								_List_fromArray(
									[ws]),
								op,
								e);
						})),
				$elm$parser$Parser$symbol(s)),
			$author$project$Parser$WhiteSpace$mSpaces);
	});
var $author$project$Parser$Exp$operators = _List_fromArray(
	[
		_List_fromArray(
		[
			$Punie$elm_parser_extras$Parser$Expression$Prefix(
			$elm$parser$Parser$backtrackable(
				A2($author$project$Parser$Exp$uop, '-', $author$project$Syntax$Neg)))
		]),
		_List_fromArray(
		[
			$Punie$elm_parser_extras$Parser$Expression$Prefix(
			A2($author$project$Parser$Exp$uop, '!', $author$project$Syntax$Not))
		]),
		_List_fromArray(
		[
			A2(
			$Punie$elm_parser_extras$Parser$Expression$Infix,
			A2($author$project$Parser$Exp$bop, '%', $author$project$Syntax$Mod),
			$Punie$elm_parser_extras$Parser$Expression$AssocLeft)
		]),
		_List_fromArray(
		[
			A2(
			$Punie$elm_parser_extras$Parser$Expression$Infix,
			A2($author$project$Parser$Exp$bop, '*', $author$project$Syntax$Mul),
			$Punie$elm_parser_extras$Parser$Expression$AssocLeft)
		]),
		_List_fromArray(
		[
			A2(
			$Punie$elm_parser_extras$Parser$Expression$Infix,
			$elm$parser$Parser$backtrackable(
				A2($author$project$Parser$Exp$bop, '+', $author$project$Syntax$Add)),
			$Punie$elm_parser_extras$Parser$Expression$AssocLeft),
			A2(
			$Punie$elm_parser_extras$Parser$Expression$Infix,
			$elm$parser$Parser$backtrackable(
				A2($author$project$Parser$Exp$bop, '-', $author$project$Syntax$Sub)),
			$Punie$elm_parser_extras$Parser$Expression$AssocLeft)
		]),
		_List_fromArray(
		[
			A2(
			$Punie$elm_parser_extras$Parser$Expression$Infix,
			A2($author$project$Parser$Exp$bop, '++', $author$project$Syntax$Cat),
			$Punie$elm_parser_extras$Parser$Expression$AssocLeft)
		]),
		_List_fromArray(
		[
			A2(
			$Punie$elm_parser_extras$Parser$Expression$Infix,
			$elm$parser$Parser$backtrackable(
				A2($author$project$Parser$Exp$bop, '<', $author$project$Syntax$Lt)),
			$Punie$elm_parser_extras$Parser$Expression$AssocNone),
			A2(
			$Punie$elm_parser_extras$Parser$Expression$Infix,
			$elm$parser$Parser$backtrackable(
				A2($author$project$Parser$Exp$bop, '>', $author$project$Syntax$Gt)),
			$Punie$elm_parser_extras$Parser$Expression$AssocNone)
		]),
		_List_fromArray(
		[
			A2(
			$Punie$elm_parser_extras$Parser$Expression$Infix,
			A2($author$project$Parser$Exp$bop, '<=', $author$project$Syntax$Le),
			$Punie$elm_parser_extras$Parser$Expression$AssocNone),
			A2(
			$Punie$elm_parser_extras$Parser$Expression$Infix,
			A2($author$project$Parser$Exp$bop, '>=', $author$project$Syntax$Ge),
			$Punie$elm_parser_extras$Parser$Expression$AssocNone)
		]),
		_List_fromArray(
		[
			A2(
			$Punie$elm_parser_extras$Parser$Expression$Infix,
			A2($author$project$Parser$Exp$bop, '==', $author$project$Syntax$Eq),
			$Punie$elm_parser_extras$Parser$Expression$AssocNone)
		]),
		_List_fromArray(
		[
			A2(
			$Punie$elm_parser_extras$Parser$Expression$Infix,
			A2($author$project$Parser$Exp$bop, '!=', $author$project$Syntax$Ne),
			$Punie$elm_parser_extras$Parser$Expression$AssocNone)
		]),
		_List_fromArray(
		[
			A2(
			$Punie$elm_parser_extras$Parser$Expression$Infix,
			A2($author$project$Parser$Exp$bop, '&&', $author$project$Syntax$And),
			$Punie$elm_parser_extras$Parser$Expression$AssocLeft)
		]),
		_List_fromArray(
		[
			A2(
			$Punie$elm_parser_extras$Parser$Expression$Infix,
			A2($author$project$Parser$Exp$bop, '||', $author$project$Syntax$Or),
			$Punie$elm_parser_extras$Parser$Expression$AssocLeft)
		]),
		_List_fromArray(
		[
			A2($Punie$elm_parser_extras$Parser$Expression$Infix, $author$project$Parser$Exp$cons, $Punie$elm_parser_extras$Parser$Expression$AssocRight)
		])
	]);
var $author$project$Syntax$PBool = F2(
	function (a, b) {
		return {$: 'PBool', a: a, b: b};
	});
var $author$project$Parser$Pattern$pBool = $elm$parser$Parser$oneOf(
	_List_fromArray(
		[
			A2(
			$elm$parser$Parser$keeper,
			A2(
				$elm$parser$Parser$ignorer,
				$elm$parser$Parser$succeed(
					function (ws) {
						return A2(
							$author$project$Syntax$PBool,
							_List_fromArray(
								[ws]),
							true);
					}),
				$elm$parser$Parser$keyword('True')),
			$author$project$Parser$WhiteSpace$mSpaces),
			A2(
			$elm$parser$Parser$keeper,
			A2(
				$elm$parser$Parser$ignorer,
				$elm$parser$Parser$succeed(
					function (ws) {
						return A2(
							$author$project$Syntax$PBool,
							_List_fromArray(
								[ws]),
							false);
					}),
				$elm$parser$Parser$keyword('False')),
			$author$project$Parser$WhiteSpace$mSpaces)
		]));
var $author$project$Parser$Pattern$pConsOp = _List_fromArray(
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
						function (spc) {
							return A2(
								$author$project$Syntax$PCons,
								_List_fromArray(
									[spc]),
								$author$project$Syntax$ConsType);
						}),
					$elm$parser$Parser$symbol('::')),
				$author$project$Parser$WhiteSpace$mSpaces),
			$Punie$elm_parser_extras$Parser$Expression$AssocRight)
		])
	]);
var $author$project$Syntax$PInt = F2(
	function (a, b) {
		return {$: 'PInt', a: a, b: b};
	});
var $author$project$Parser$Pattern$pInt = $elm$parser$Parser$oneOf(
	_List_fromArray(
		[
			A2(
			$elm$parser$Parser$keeper,
			A2(
				$elm$parser$Parser$keeper,
				$elm$parser$Parser$succeed(
					F2(
						function (n, ws) {
							return A2(
								$author$project$Syntax$PInt,
								_List_fromArray(
									[ws]),
								n);
						})),
				$elm$parser$Parser$number(
					{
						binary: $elm$core$Maybe$Just($elm$core$Basics$identity),
						_float: $elm$core$Maybe$Nothing,
						hex: $elm$core$Maybe$Just($elm$core$Basics$identity),
						_int: $elm$core$Maybe$Just($elm$core$Basics$identity),
						octal: $elm$core$Maybe$Just($elm$core$Basics$identity)
					})),
			$author$project$Parser$WhiteSpace$mSpaces),
			A2(
			$elm$parser$Parser$keeper,
			A2(
				$elm$parser$Parser$keeper,
				A2(
					$elm$parser$Parser$ignorer,
					$elm$parser$Parser$succeed(
						F2(
							function (n, ws) {
								return A2(
									$author$project$Syntax$PInt,
									_List_fromArray(
										[ws]),
									-n);
							})),
					$elm$parser$Parser$symbol('-')),
				$elm$parser$Parser$int),
			$author$project$Parser$WhiteSpace$mSpaces)
		]));
var $author$project$Syntax$PNil = F2(
	function (a, b) {
		return {$: 'PNil', a: a, b: b};
	});
var $author$project$Parser$Pattern$pNil = A2(
	$elm$parser$Parser$keeper,
	A2(
		$elm$parser$Parser$keeper,
		A2(
			$elm$parser$Parser$ignorer,
			$elm$parser$Parser$succeed(
				F2(
					function (ws1, ws2) {
						return A2(
							$author$project$Syntax$PNil,
							_List_fromArray(
								[ws1, ws2]),
							$author$project$Syntax$SquareType);
					})),
			$elm$parser$Parser$symbol('[')),
		A2(
			$elm$parser$Parser$ignorer,
			$author$project$Parser$WhiteSpace$mSpaces,
			$elm$parser$Parser$symbol(']'))),
	$author$project$Parser$WhiteSpace$mSpaces);
var $author$project$Syntax$POk = function (a) {
	return {$: 'POk', a: a};
};
var $author$project$Parser$Pattern$pOk = A2(
	$elm$parser$Parser$keeper,
	A2(
		$elm$parser$Parser$ignorer,
		$elm$parser$Parser$succeed(
			function (ws) {
				return $author$project$Syntax$POk(
					_List_fromArray(
						[ws]));
			}),
		$elm$parser$Parser$symbol('_')),
	$author$project$Parser$WhiteSpace$mSpaces);
var $author$project$Syntax$PChar = F2(
	function (a, b) {
		return {$: 'PChar', a: a, b: b};
	});
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
var $author$project$Parser$Utils$mstring = $elm$parser$Parser$getChompedString(
	$elm$parser$Parser$chompUntil('\"'));
var $author$project$Parser$Utils$repPatWS = F2(
	function (ws, p) {
		switch (p.$) {
			case 'PCons':
				var lType = p.b;
				var p1 = p.c;
				var p2 = p.d;
				return A4($author$project$Syntax$PCons, ws, lType, p1, p2);
			case 'PNil':
				var lType = p.b;
				return A2($author$project$Syntax$PNil, ws, lType);
			default:
				return p;
		}
	});
var $author$project$Parser$Pattern$pString = A2(
	$elm$parser$Parser$keeper,
	A2(
		$elm$parser$Parser$keeper,
		A2(
			$elm$parser$Parser$ignorer,
			$elm$parser$Parser$succeed(
				F2(
					function (s, ws) {
						return A2(
							$author$project$Parser$Utils$repPatWS,
							_List_fromArray(
								[ws]),
							A3(
								$elm$core$Basics$composeR,
								$elm$core$String$toList,
								A2(
									$elm$core$List$foldr,
									F2(
										function (c, acc) {
											return A4(
												$author$project$Syntax$PCons,
												_List_fromArray(
													[' ']),
												$author$project$Syntax$StringType,
												A2($author$project$Syntax$PChar, _List_Nil, c),
												acc);
										}),
									A2($author$project$Syntax$PNil, _List_Nil, $author$project$Syntax$StringType)),
								s));
					})),
			$elm$parser$Parser$symbol('\"')),
		A2(
			$elm$parser$Parser$ignorer,
			$author$project$Parser$Utils$mstring,
			$elm$parser$Parser$symbol('\"'))),
	$author$project$Parser$WhiteSpace$mSpaces);
var $elm$core$Set$Set_elm_builtin = function (a) {
	return {$: 'Set_elm_builtin', a: a};
};
var $elm$core$Dict$RBEmpty_elm_builtin = {$: 'RBEmpty_elm_builtin'};
var $elm$core$Dict$empty = $elm$core$Dict$RBEmpty_elm_builtin;
var $elm$core$Set$empty = $elm$core$Set$Set_elm_builtin($elm$core$Dict$empty);
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
var $elm$core$Set$insert = F2(
	function (key, _v0) {
		var dict = _v0.a;
		return $elm$core$Set$Set_elm_builtin(
			A3($elm$core$Dict$insert, key, _Utils_Tuple0, dict));
	});
var $elm$core$Set$fromList = function (list) {
	return A3($elm$core$List$foldl, $elm$core$Set$insert, $elm$core$Set$empty, list);
};
var $elm$parser$Parser$ExpectingVariable = {$: 'ExpectingVariable'};
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
var $author$project$Parser$Utils$varName = $elm$parser$Parser$variable(
	{
		inner: function (c) {
			return $elm$core$Char$isAlphaNum(c) || _Utils_eq(
				c,
				_Utils_chr('_'));
		},
		reserved: $elm$core$Set$fromList(
			_List_fromArray(
				['let', 'in', 'case', 'of', 'id', 'True', 'False', 'Html', 'Gui', 'Event'])),
		start: $elm$core$Char$isAlpha
	});
var $author$project$Parser$Pattern$pVar = A2(
	$elm$parser$Parser$keeper,
	A2(
		$elm$parser$Parser$keeper,
		$elm$parser$Parser$succeed(
			F2(
				function (vn, ws) {
					return A2(
						$author$project$Syntax$PVar,
						_List_fromArray(
							[ws]),
						vn);
				})),
		$author$project$Parser$Utils$varName),
	$author$project$Parser$WhiteSpace$mSpaces);
function $author$project$Parser$Pattern$cyclic$pterm() {
	return $elm$parser$Parser$oneOf(
		_List_fromArray(
			[
				$author$project$Parser$Pattern$pNil,
				$author$project$Parser$Pattern$cyclic$pTuple(),
				$author$project$Parser$Pattern$cyclic$pHtml(),
				$elm$parser$Parser$backtrackable($author$project$Parser$Pattern$pInt),
				$author$project$Parser$Pattern$pBool,
				$author$project$Parser$Pattern$pOk,
				$author$project$Parser$Pattern$pVar,
				$author$project$Parser$Pattern$pString,
				$author$project$Parser$Pattern$cyclic$pGui(),
				$author$project$Parser$Pattern$cyclic$pEvent()
			]));
}
function $author$project$Parser$Pattern$cyclic$pEvent() {
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
							function (ws1, p1, p2) {
								return A4(
									$author$project$Syntax$PTuple,
									_List_fromArray(
										[ws1]),
									$author$project$Syntax$EventType,
									p1,
									p2);
							})),
					$elm$parser$Parser$keyword('Event')),
				$author$project$Parser$WhiteSpace$mSpaces),
			$elm$parser$Parser$lazy(
				function (_v8) {
					return $author$project$Parser$Pattern$cyclic$pattern();
				})),
		$elm$parser$Parser$lazy(
			function (_v9) {
				return $author$project$Parser$Pattern$cyclic$pattern();
			}));
}
function $author$project$Parser$Pattern$cyclic$pGui() {
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
							function (ws, p1, p2) {
								return A4(
									$author$project$Syntax$PTuple,
									_List_fromArray(
										[ws]),
									$author$project$Syntax$GuiType,
									p1,
									p2);
							})),
					$elm$parser$Parser$keyword('Gui')),
				$author$project$Parser$WhiteSpace$mSpaces),
			$elm$parser$Parser$lazy(
				function (_v6) {
					return $author$project$Parser$Pattern$cyclic$pattern();
				})),
		$elm$parser$Parser$lazy(
			function (_v7) {
				return $author$project$Parser$Pattern$cyclic$pattern();
			}));
}
function $author$project$Parser$Pattern$cyclic$pHtml() {
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
							A2(
								$elm$parser$Parser$ignorer,
								$elm$parser$Parser$succeed(
									F5(
										function (vn1, ws1, vn2, vn3, vn4) {
											return A5(
												$author$project$Syntax$PHtml,
												_List_fromArray(
													[ws1]),
												vn1,
												vn2,
												vn3,
												vn4);
										})),
								$elm$parser$Parser$keyword('Html')),
							$elm$parser$Parser$symbol('.')),
						$author$project$Parser$Utils$varName),
					$author$project$Parser$WhiteSpace$mSpaces),
				$elm$parser$Parser$lazy(
					function (_v3) {
						return $author$project$Parser$Pattern$cyclic$pattern();
					})),
			$elm$parser$Parser$lazy(
				function (_v4) {
					return $author$project$Parser$Pattern$cyclic$pattern();
				})),
		$elm$parser$Parser$lazy(
			function (_v5) {
				return $author$project$Parser$Pattern$cyclic$pattern();
			}));
}
function $author$project$Parser$Pattern$cyclic$pTuple() {
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
									function (ws1, vn1, ws2, vn2, ws3) {
										return A4(
											$author$project$Syntax$PTuple,
											_List_fromArray(
												[ws1, ws2, ws3]),
											$author$project$Syntax$TupleType,
											vn1,
											vn2);
									})),
							$elm$parser$Parser$symbol('(')),
						$author$project$Parser$WhiteSpace$mSpaces),
					A2(
						$elm$parser$Parser$ignorer,
						$elm$parser$Parser$lazy(
							function (_v1) {
								return $author$project$Parser$Pattern$cyclic$pattern();
							}),
						$elm$parser$Parser$symbol(','))),
				$author$project$Parser$WhiteSpace$mSpaces),
			A2(
				$elm$parser$Parser$ignorer,
				$elm$parser$Parser$lazy(
					function (_v2) {
						return $author$project$Parser$Pattern$cyclic$pattern();
					}),
				$elm$parser$Parser$symbol(')'))),
		$author$project$Parser$WhiteSpace$mSpaces);
}
function $author$project$Parser$Pattern$cyclic$pattern() {
	return A2(
		$Punie$elm_parser_extras$Parser$Expression$buildExpressionParser,
		$author$project$Parser$Pattern$pConsOp,
		$elm$parser$Parser$lazy(
			function (_v0) {
				return $author$project$Parser$Pattern$cyclic$pterm();
			}));
}
try {
	var $author$project$Parser$Pattern$pterm = $author$project$Parser$Pattern$cyclic$pterm();
	$author$project$Parser$Pattern$cyclic$pterm = function () {
		return $author$project$Parser$Pattern$pterm;
	};
	var $author$project$Parser$Pattern$pEvent = $author$project$Parser$Pattern$cyclic$pEvent();
	$author$project$Parser$Pattern$cyclic$pEvent = function () {
		return $author$project$Parser$Pattern$pEvent;
	};
	var $author$project$Parser$Pattern$pGui = $author$project$Parser$Pattern$cyclic$pGui();
	$author$project$Parser$Pattern$cyclic$pGui = function () {
		return $author$project$Parser$Pattern$pGui;
	};
	var $author$project$Parser$Pattern$pHtml = $author$project$Parser$Pattern$cyclic$pHtml();
	$author$project$Parser$Pattern$cyclic$pHtml = function () {
		return $author$project$Parser$Pattern$pHtml;
	};
	var $author$project$Parser$Pattern$pTuple = $author$project$Parser$Pattern$cyclic$pTuple();
	$author$project$Parser$Pattern$cyclic$pTuple = function () {
		return $author$project$Parser$Pattern$pTuple;
	};
	var $author$project$Parser$Pattern$pattern = $author$project$Parser$Pattern$cyclic$pattern();
	$author$project$Parser$Pattern$cyclic$pattern = function () {
		return $author$project$Parser$Pattern$pattern;
	};
} catch ($) {
	throw 'Some top-level definitions from `Parser.Pattern` are causing infinite recursion:\n\n  ┌─────┐\n  │    pterm\n  │     ↓\n  │    pEvent\n  │     ↓\n  │    pGui\n  │     ↓\n  │    pHtml\n  │     ↓\n  │    pTuple\n  │     ↓\n  │    pattern\n  └─────┘\n\nThese errors are very tricky, so read https://elm-lang.org/0.19.1/bad-recursion to learn how to fix it!';}
var $Punie$elm_parser_extras$Parser$Extras$manyHelp = F2(
	function (p, vs) {
		return $elm$parser$Parser$oneOf(
			_List_fromArray(
				[
					A2(
					$elm$parser$Parser$keeper,
					$elm$parser$Parser$succeed(
						function (v) {
							return $elm$parser$Parser$Loop(
								A2($elm$core$List$cons, v, vs));
						}),
					A2($elm$parser$Parser$ignorer, p, $elm$parser$Parser$spaces)),
					A2(
					$elm$parser$Parser$map,
					function (_v0) {
						return $elm$parser$Parser$Done(
							$elm$core$List$reverse(vs));
					},
					$elm$parser$Parser$succeed(_Utils_Tuple0))
				]));
	});
var $Punie$elm_parser_extras$Parser$Extras$many = function (p) {
	return A2(
		$elm$parser$Parser$loop,
		_List_Nil,
		$Punie$elm_parser_extras$Parser$Extras$manyHelp(p));
};
var $Punie$elm_parser_extras$Parser$Extras$some = function (p) {
	return A2(
		$elm$parser$Parser$keeper,
		A2(
			$elm$parser$Parser$keeper,
			$elm$parser$Parser$succeed($elm$core$Tuple$pair),
			A2($elm$parser$Parser$ignorer, p, $elm$parser$Parser$spaces)),
		$Punie$elm_parser_extras$Parser$Extras$many(p));
};
var $author$project$Parser$Exp$string = A2(
	$elm$parser$Parser$keeper,
	A2(
		$elm$parser$Parser$keeper,
		A2(
			$elm$parser$Parser$ignorer,
			$elm$parser$Parser$succeed(
				F2(
					function (s, ws) {
						return A2(
							$author$project$Parser$Utils$repWS,
							_List_fromArray(
								[ws]),
							A3(
								$elm$core$Basics$composeR,
								$elm$core$String$toList,
								A2(
									$elm$core$List$foldr,
									F2(
										function (c, acc) {
											return A4(
												$author$project$Syntax$ECons,
												_List_fromArray(
													[' ']),
												$author$project$Syntax$StringType,
												A2($author$project$Syntax$EChar, _List_Nil, c),
												acc);
										}),
									A2($author$project$Syntax$ENil, _List_Nil, $author$project$Syntax$StringType)),
								s));
					})),
			$elm$parser$Parser$symbol('\"')),
		A2(
			$elm$parser$Parser$ignorer,
			$author$project$Parser$Utils$mstring,
			$elm$parser$Parser$symbol('\"'))),
	$author$project$Parser$WhiteSpace$mSpaces);
var $author$project$Parser$Exp$var = A2(
	$elm$parser$Parser$keeper,
	A2(
		$elm$parser$Parser$keeper,
		$elm$parser$Parser$succeed(
			F2(
				function (s, ws) {
					return A3(
						$author$project$Syntax$EVar,
						_List_fromArray(
							[ws]),
						s,
						0);
				})),
		$author$project$Parser$Utils$varName),
	$author$project$Parser$WhiteSpace$mSpaces);
var $author$project$Parser$Exp$letHelper = function (revDeclList) {
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
								function (ws, _v8) {
									var wss = _v8.a;
									var elm = _v8.b;
									return $elm$parser$Parser$Loop(
										A2(
											$elm$core$List$cons,
											_Utils_Tuple2(
												A2($elm$core$List$cons, ws, wss),
												_List_fromArray(
													[elm])),
											revDeclList));
								})),
						$elm$parser$Parser$symbol(',')),
					$author$project$Parser$WhiteSpace$mSpaces),
				$elm$parser$Parser$lazy(
					function (_v9) {
						return $author$project$Parser$Exp$cyclic$decl();
					})),
				A2(
				$elm$parser$Parser$map,
				function (_v10) {
					return $elm$parser$Parser$Done(
						$elm$core$List$reverse(revDeclList));
				},
				$elm$parser$Parser$succeed(_Utils_Tuple0))
			]));
};
var $author$project$Parser$Exp$listHelper = function (revExps) {
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
								function (ws, e) {
									return $elm$parser$Parser$Loop(
										A2(
											$elm$core$List$cons,
											_Utils_Tuple2(
												_List_fromArray(
													[ws]),
												e),
											revExps));
								})),
						$elm$parser$Parser$symbol(',')),
					$author$project$Parser$WhiteSpace$mSpaces),
				$elm$parser$Parser$lazy(
					function (_v5) {
						return $author$project$Parser$Exp$cyclic$exp();
					})),
				A2(
				$elm$parser$Parser$map,
				function (_v6) {
					return $elm$parser$Parser$Done(
						$elm$core$List$reverse(revExps));
				},
				$elm$parser$Parser$succeed(_Utils_Tuple0))
			]));
};
function $author$project$Parser$Exp$cyclic$abs() {
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
								F4(
									function (ws1, varName, ws2, ws3) {
										return A2(
											$author$project$Syntax$ELam,
											_List_fromArray(
												[ws1, ws2, ws3]),
											varName);
									})),
							$elm$parser$Parser$symbol('\\')),
						$author$project$Parser$WhiteSpace$mSpaces),
					$author$project$Parser$Utils$varName),
				A2(
					$elm$parser$Parser$ignorer,
					$author$project$Parser$WhiteSpace$mSpaces,
					$elm$parser$Parser$symbol('->'))),
			$author$project$Parser$WhiteSpace$mSpaces),
		$elm$parser$Parser$lazy(
			function (_v27) {
				return $author$project$Parser$Exp$cyclic$exp();
			}));
}
function $author$project$Parser$Exp$cyclic$aexp() {
	return $elm$parser$Parser$oneOf(
		_List_fromArray(
			[
				$author$project$Parser$Exp$cyclic$html(),
				$elm$parser$Parser$backtrackable(
				$author$project$Parser$Exp$cyclic$parens_()),
				$elm$parser$Parser$backtrackable($author$project$Parser$Exp$int_),
				$elm$parser$Parser$backtrackable($author$project$Parser$Exp$var),
				$elm$parser$Parser$lazy(
				function (_v25) {
					return $author$project$Parser$Exp$cyclic$abs();
				}),
				$elm$parser$Parser$lazy(
				function (_v26) {
					return $author$project$Parser$Exp$cyclic$let_();
				}),
				$author$project$Parser$Exp$cyclic$caseOf(),
				$elm$parser$Parser$backtrackable($author$project$Parser$Exp$nil),
				$elm$parser$Parser$backtrackable(
				$author$project$Parser$Exp$cyclic$list()),
				$author$project$Parser$Exp$cyclic$tuple(),
				$author$project$Parser$Exp$bool_,
				$author$project$Parser$Exp$string,
				$author$project$Parser$Exp$cyclic$gui(),
				$author$project$Parser$Exp$cyclic$event()
			]));
}
function $author$project$Parser$Exp$cyclic$app() {
	var foldl1 = F2(
		function (f, _v24) {
			var x = _v24.a;
			var xs = _v24.b;
			return A3(
				$elm$core$List$foldl,
				$author$project$Parser$Exp$flip(f),
				x,
				xs);
		});
	return A2(
		$elm$parser$Parser$keeper,
		$elm$parser$Parser$succeed(
			foldl1($author$project$Syntax$EApp)),
		$Punie$elm_parser_extras$Parser$Extras$some(
			$elm$parser$Parser$lazy(
				function (_v23) {
					return $author$project$Parser$Exp$cyclic$aexp();
				})));
}
function $author$project$Parser$Exp$cyclic$caseOf() {
	return A2(
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
							F3(
								function (ws1, e, ws2) {
									return A2(
										$author$project$Syntax$ECase,
										_List_fromArray(
											[ws1, ws2]),
										e);
								})),
						$elm$parser$Parser$keyword('case')),
					$author$project$Parser$WhiteSpace$mSpaces),
				A2(
					$elm$parser$Parser$ignorer,
					$elm$parser$Parser$lazy(
						function (_v22) {
							return $author$project$Parser$Exp$cyclic$exp();
						}),
					$elm$parser$Parser$keyword('of'))),
			$author$project$Parser$WhiteSpace$mSpaces),
		$author$project$Parser$Exp$cyclic$branch());
}
function $author$project$Parser$Exp$cyclic$branch() {
	return A2(
		$Punie$elm_parser_extras$Parser$Expression$buildExpressionParser,
		$author$project$Parser$Exp$branchOp,
		$author$project$Parser$Exp$cyclic$sinBranch());
}
function $author$project$Parser$Exp$cyclic$let_() {
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
									function (ws1, _v19, _v20, ws2, e) {
										var wss1 = _v19.a;
										var elm = _v19.b;
										var wss2 = _v20.a;
										var ls = _v20.b;
										var wss = _Utils_ap(
											A2($elm$core$List$cons, ws1, wss1),
											_Utils_ap(
												wss2,
												_List_fromArray(
													[ws2])));
										return A3(
											$author$project$Syntax$ELet,
											wss,
											A2($elm$core$List$cons, elm, ls),
											e);
									})),
							$elm$parser$Parser$keyword('let')),
						$author$project$Parser$WhiteSpace$mSpaces),
					$author$project$Parser$Exp$cyclic$decl()),
				A2(
					$elm$parser$Parser$ignorer,
					$author$project$Parser$Exp$cyclic$declloop(),
					$elm$parser$Parser$keyword('in'))),
			$author$project$Parser$WhiteSpace$mSpaces),
		$elm$parser$Parser$lazy(
			function (_v21) {
				return $author$project$Parser$Exp$cyclic$exp();
			}));
}
function $author$project$Parser$Exp$cyclic$decl() {
	return A2(
		$elm$parser$Parser$keeper,
		A2(
			$elm$parser$Parser$keeper,
			A2(
				$elm$parser$Parser$keeper,
				A2(
					$elm$parser$Parser$keeper,
					$elm$parser$Parser$succeed(
						F4(
							function (p, ws1, ws2, e) {
								return _Utils_Tuple2(
									_List_fromArray(
										[ws1, ws2]),
									_Utils_Tuple2(
										p,
										_Utils_Tuple3(
											_Utils_Tuple2(e, e),
											$author$project$Syntax$DZero,
											_Utils_Tuple2($elm$core$Maybe$Nothing, false))));
							})),
					$author$project$Parser$Utils$varName),
				A2(
					$elm$parser$Parser$ignorer,
					$author$project$Parser$WhiteSpace$mSpaces,
					$elm$parser$Parser$symbol('='))),
			$author$project$Parser$WhiteSpace$mSpaces),
		$elm$parser$Parser$lazy(
			function (_v18) {
				return $author$project$Parser$Exp$cyclic$exp();
			}));
}
function $author$project$Parser$Exp$cyclic$declloop() {
	return A2(
		$elm$parser$Parser$map,
		$author$project$Parser$Exp$heapListToExp,
		A2($elm$parser$Parser$loop, _List_Nil, $author$project$Parser$Exp$letHelper));
}
function $author$project$Parser$Exp$cyclic$event() {
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
							function (ws, e1, e2) {
								return A4(
									$author$project$Syntax$ETuple,
									_List_fromArray(
										[ws]),
									$author$project$Syntax$EventType,
									e1,
									e2);
							})),
					$elm$parser$Parser$keyword('Event')),
				$author$project$Parser$WhiteSpace$mSpaces),
			$author$project$Parser$Exp$string),
		$elm$parser$Parser$lazy(
			function (_v17) {
				return $author$project$Parser$Exp$cyclic$aexp();
			}));
}
function $author$project$Parser$Exp$cyclic$exp() {
	return A2(
		$Punie$elm_parser_extras$Parser$Expression$buildExpressionParser,
		$author$project$Parser$Exp$operators,
		$elm$parser$Parser$lazy(
			function (_v16) {
				return $author$project$Parser$Exp$cyclic$app();
			}));
}
function $author$project$Parser$Exp$cyclic$gui() {
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
							function (ws, e1, e2) {
								return A4(
									$author$project$Syntax$ETuple,
									_List_fromArray(
										[ws]),
									$author$project$Syntax$GuiType,
									e1,
									e2);
							})),
					$elm$parser$Parser$keyword('Gui')),
				$author$project$Parser$WhiteSpace$mSpaces),
			$elm$parser$Parser$lazy(
				function (_v14) {
					return $author$project$Parser$Exp$cyclic$aexp();
				})),
		$elm$parser$Parser$lazy(
			function (_v15) {
				return $author$project$Parser$Exp$cyclic$aexp();
			}));
}
function $author$project$Parser$Exp$cyclic$html() {
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
							A2(
								$elm$parser$Parser$ignorer,
								$elm$parser$Parser$succeed(
									F2(
										function (varName, ws) {
											return A2(
												$author$project$Syntax$EHtml,
												_List_fromArray(
													[ws]),
												varName);
										})),
								$elm$parser$Parser$keyword('Html')),
							$elm$parser$Parser$symbol('.')),
						$author$project$Parser$Utils$varName),
					$author$project$Parser$WhiteSpace$mSpaces),
				$elm$parser$Parser$lazy(
					function (_v11) {
						return $author$project$Parser$Exp$cyclic$aexp();
					})),
			$elm$parser$Parser$lazy(
				function (_v12) {
					return $author$project$Parser$Exp$cyclic$aexp();
				})),
		$elm$parser$Parser$lazy(
			function (_v13) {
				return $author$project$Parser$Exp$cyclic$aexp();
			}));
}
function $author$project$Parser$Exp$cyclic$list() {
	return A2(
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
							F4(
								function (ws1, e1, e2, ws2) {
									return A4(
										$author$project$Syntax$ECons,
										_List_fromArray(
											[ws1, ws2]),
										$author$project$Syntax$SquareType,
										e1,
										e2);
								})),
						$elm$parser$Parser$symbol('[')),
					$author$project$Parser$WhiteSpace$mSpaces),
				$elm$parser$Parser$lazy(
					function (_v7) {
						return $author$project$Parser$Exp$cyclic$exp();
					})),
			A2(
				$elm$parser$Parser$ignorer,
				$author$project$Parser$Exp$cyclic$listloop(),
				$elm$parser$Parser$symbol(']'))),
		$author$project$Parser$WhiteSpace$mSpaces);
}
function $author$project$Parser$Exp$cyclic$listloop() {
	return A2(
		$elm$parser$Parser$map,
		$author$project$Parser$Exp$exprListToECons($author$project$Syntax$SquareType),
		A2($elm$parser$Parser$loop, _List_Nil, $author$project$Parser$Exp$listHelper));
}
function $author$project$Parser$Exp$cyclic$parens_() {
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
									$author$project$Syntax$EParens,
									_List_fromArray(
										[s1, s2]),
									e);
							})),
					$elm$parser$Parser$symbol('(')),
				$author$project$Parser$WhiteSpace$mSpaces),
			A2(
				$elm$parser$Parser$ignorer,
				$elm$parser$Parser$lazy(
					function (_v4) {
						return $author$project$Parser$Exp$cyclic$exp();
					}),
				$elm$parser$Parser$symbol(')'))),
		$author$project$Parser$WhiteSpace$mSpaces);
}
function $author$project$Parser$Exp$cyclic$sinBranch() {
	return A2(
		$elm$parser$Parser$keeper,
		A2(
			$elm$parser$Parser$keeper,
			A2(
				$elm$parser$Parser$keeper,
				$elm$parser$Parser$succeed(
					F2(
						function (p, ws) {
							return A2(
								$author$project$Syntax$BSin,
								_List_fromArray(
									[ws]),
								p);
						})),
				A2(
					$elm$parser$Parser$ignorer,
					$elm$parser$Parser$lazy(
						function (_v2) {
							return $author$project$Parser$Pattern$pattern;
						}),
					$elm$parser$Parser$symbol('->'))),
			$author$project$Parser$WhiteSpace$mSpaces),
		$elm$parser$Parser$lazy(
			function (_v3) {
				return $author$project$Parser$Exp$cyclic$exp();
			}));
}
function $author$project$Parser$Exp$cyclic$tuple() {
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
									function (ws1, e1, ws2, e2, ws3) {
										return A4(
											$author$project$Syntax$ETuple,
											_List_fromArray(
												[ws1, ws2, ws3]),
											$author$project$Syntax$TupleType,
											e1,
											e2);
									})),
							$elm$parser$Parser$symbol('(')),
						$author$project$Parser$WhiteSpace$mSpaces),
					A2(
						$elm$parser$Parser$ignorer,
						$elm$parser$Parser$lazy(
							function (_v0) {
								return $author$project$Parser$Exp$cyclic$exp();
							}),
						$elm$parser$Parser$symbol(','))),
				$author$project$Parser$WhiteSpace$mSpaces),
			A2(
				$elm$parser$Parser$ignorer,
				$elm$parser$Parser$lazy(
					function (_v1) {
						return $author$project$Parser$Exp$cyclic$exp();
					}),
				$elm$parser$Parser$symbol(')'))),
		$author$project$Parser$WhiteSpace$mSpaces);
}
try {
	var $author$project$Parser$Exp$abs = $author$project$Parser$Exp$cyclic$abs();
	$author$project$Parser$Exp$cyclic$abs = function () {
		return $author$project$Parser$Exp$abs;
	};
	var $author$project$Parser$Exp$aexp = $author$project$Parser$Exp$cyclic$aexp();
	$author$project$Parser$Exp$cyclic$aexp = function () {
		return $author$project$Parser$Exp$aexp;
	};
	var $author$project$Parser$Exp$app = $author$project$Parser$Exp$cyclic$app();
	$author$project$Parser$Exp$cyclic$app = function () {
		return $author$project$Parser$Exp$app;
	};
	var $author$project$Parser$Exp$caseOf = $author$project$Parser$Exp$cyclic$caseOf();
	$author$project$Parser$Exp$cyclic$caseOf = function () {
		return $author$project$Parser$Exp$caseOf;
	};
	var $author$project$Parser$Exp$branch = $author$project$Parser$Exp$cyclic$branch();
	$author$project$Parser$Exp$cyclic$branch = function () {
		return $author$project$Parser$Exp$branch;
	};
	var $author$project$Parser$Exp$let_ = $author$project$Parser$Exp$cyclic$let_();
	$author$project$Parser$Exp$cyclic$let_ = function () {
		return $author$project$Parser$Exp$let_;
	};
	var $author$project$Parser$Exp$decl = $author$project$Parser$Exp$cyclic$decl();
	$author$project$Parser$Exp$cyclic$decl = function () {
		return $author$project$Parser$Exp$decl;
	};
	var $author$project$Parser$Exp$declloop = $author$project$Parser$Exp$cyclic$declloop();
	$author$project$Parser$Exp$cyclic$declloop = function () {
		return $author$project$Parser$Exp$declloop;
	};
	var $author$project$Parser$Exp$event = $author$project$Parser$Exp$cyclic$event();
	$author$project$Parser$Exp$cyclic$event = function () {
		return $author$project$Parser$Exp$event;
	};
	var $author$project$Parser$Exp$exp = $author$project$Parser$Exp$cyclic$exp();
	$author$project$Parser$Exp$cyclic$exp = function () {
		return $author$project$Parser$Exp$exp;
	};
	var $author$project$Parser$Exp$gui = $author$project$Parser$Exp$cyclic$gui();
	$author$project$Parser$Exp$cyclic$gui = function () {
		return $author$project$Parser$Exp$gui;
	};
	var $author$project$Parser$Exp$html = $author$project$Parser$Exp$cyclic$html();
	$author$project$Parser$Exp$cyclic$html = function () {
		return $author$project$Parser$Exp$html;
	};
	var $author$project$Parser$Exp$list = $author$project$Parser$Exp$cyclic$list();
	$author$project$Parser$Exp$cyclic$list = function () {
		return $author$project$Parser$Exp$list;
	};
	var $author$project$Parser$Exp$listloop = $author$project$Parser$Exp$cyclic$listloop();
	$author$project$Parser$Exp$cyclic$listloop = function () {
		return $author$project$Parser$Exp$listloop;
	};
	var $author$project$Parser$Exp$parens_ = $author$project$Parser$Exp$cyclic$parens_();
	$author$project$Parser$Exp$cyclic$parens_ = function () {
		return $author$project$Parser$Exp$parens_;
	};
	var $author$project$Parser$Exp$sinBranch = $author$project$Parser$Exp$cyclic$sinBranch();
	$author$project$Parser$Exp$cyclic$sinBranch = function () {
		return $author$project$Parser$Exp$sinBranch;
	};
	var $author$project$Parser$Exp$tuple = $author$project$Parser$Exp$cyclic$tuple();
	$author$project$Parser$Exp$cyclic$tuple = function () {
		return $author$project$Parser$Exp$tuple;
	};
} catch ($) {
	throw 'Some top-level definitions from `Parser.Exp` are causing infinite recursion:\n\n  ┌─────┐\n  │    abs\n  │     ↓\n  │    aexp\n  │     ↓\n  │    app\n  │     ↓\n  │    caseOf\n  │     ↓\n  │    branch\n  │     ↓\n  │    let_\n  │     ↓\n  │    decl\n  │     ↓\n  │    declloop\n  │     ↓\n  │    event\n  │     ↓\n  │    exp\n  │     ↓\n  │    gui\n  │     ↓\n  │    html\n  │     ↓\n  │    letHelper\n  │     ↓\n  │    list\n  │     ↓\n  │    listloop\n  │     ↓\n  │    listHelper\n  │     ↓\n  │    parens_\n  │     ↓\n  │    sinBranch\n  │     ↓\n  │    tuple\n  └─────┘\n\nThese errors are very tricky, so read https://elm-lang.org/0.19.1/bad-recursion to learn how to fix it!';}
var $author$project$Parser$Delta$dInsert = A2(
	$elm$parser$Parser$keeper,
	A2(
		$elm$parser$Parser$keeper,
		A2(
			$elm$parser$Parser$ignorer,
			A2(
				$elm$parser$Parser$ignorer,
				$elm$parser$Parser$succeed($author$project$Syntax$DInsert),
				$elm$parser$Parser$keyword('insert')),
			$elm$parser$Parser$spaces),
		A2($elm$parser$Parser$ignorer, $elm$parser$Parser$int, $elm$parser$Parser$spaces)),
	A2($elm$parser$Parser$ignorer, $author$project$Parser$Exp$exp, $elm$parser$Parser$spaces));
var $author$project$Parser$Delta$dNone = A2(
	$elm$parser$Parser$ignorer,
	A2(
		$elm$parser$Parser$ignorer,
		$elm$parser$Parser$succeed($author$project$Syntax$DZero),
		$elm$parser$Parser$symbol('?')),
	$elm$parser$Parser$spaces);
var $author$project$Parser$Utils$diffMemo = F3(
	function (memo, v1, v2) {
		var _v0 = A2(
			$elm$core$Dict$get,
			_Utils_Tuple2(v1, v2),
			memo);
		if (_v0.$ === 'Just') {
			var result = _v0.a;
			return _Utils_Tuple2(result, memo);
		} else {
			var _v1 = _Utils_Tuple2(v1, v2);
			if (!_v1.a.b) {
				var result = _Utils_Tuple2(
					$elm$core$List$length(v2),
					A3(
						$elm$core$List$foldr,
						function (c) {
							return A2(
								$author$project$Syntax$DCons,
								$elm$core$Maybe$Just(
									A2($author$project$Syntax$EChar, _List_Nil, c)),
								$author$project$Syntax$DId);
						},
						$author$project$Syntax$DId,
						v2));
				return _Utils_Tuple2(
					result,
					A3(
						$elm$core$Dict$insert,
						_Utils_Tuple2(v1, v2),
						result,
						memo));
			} else {
				if (!_v1.b.b) {
					var result = _Utils_Tuple2(
						$elm$core$List$length(v1),
						A3(
							$elm$core$List$foldr,
							function (_v2) {
								return A2($author$project$Syntax$DCons, $elm$core$Maybe$Nothing, $author$project$Syntax$DRem);
							},
							$author$project$Syntax$DId,
							v1));
					return _Utils_Tuple2(
						result,
						A3(
							$elm$core$Dict$insert,
							_Utils_Tuple2(v1, v2),
							result,
							memo));
				} else {
					var _v3 = _v1.a;
					var x = _v3.a;
					var xs = _v3.b;
					var _v4 = _v1.b;
					var y = _v4.a;
					var ys = _v4.b;
					if (_Utils_eq(x, y)) {
						var _v5 = A3($author$project$Parser$Utils$diffMemo, memo, xs, ys);
						var _v6 = _v5.a;
						var n = _v6.a;
						var opList = _v6.b;
						var updatedMemo = _v5.b;
						var result = _Utils_Tuple2(
							n,
							A3($author$project$Syntax$DCons, $elm$core$Maybe$Nothing, $author$project$Syntax$DId, opList));
						return _Utils_Tuple2(
							result,
							A3(
								$elm$core$Dict$insert,
								_Utils_Tuple2(v1, v2),
								result,
								updatedMemo));
					} else {
						var _v7 = A3($author$project$Parser$Utils$diffMemo, memo, xs, v2);
						var _v8 = _v7.a;
						var n1 = _v8.a;
						var ops1 = _v8.b;
						var updatedMemo1 = _v7.b;
						var _v9 = A3($author$project$Parser$Utils$diffMemo, updatedMemo1, v1, ys);
						var _v10 = _v9.a;
						var n2 = _v10.a;
						var ops2 = _v10.b;
						var updatedMemo2 = _v9.b;
						var result = (_Utils_cmp(n1, n2) < 0) ? _Utils_Tuple2(
							1 + n1,
							A3($author$project$Syntax$DCons, $elm$core$Maybe$Nothing, $author$project$Syntax$DRem, ops1)) : _Utils_Tuple2(
							1 + n2,
							A3(
								$author$project$Syntax$DCons,
								$elm$core$Maybe$Just(
									A2($author$project$Syntax$EChar, _List_Nil, y)),
								$author$project$Syntax$DId,
								ops2));
						return _Utils_Tuple2(
							result,
							A3(
								$elm$core$Dict$insert,
								_Utils_Tuple2(v1, v2),
								result,
								updatedMemo2));
					}
				}
			}
		}
	});
var $author$project$Parser$Utils$diff = F2(
	function (v1, v2) {
		var memo = $elm$core$Dict$empty;
		return A3($author$project$Parser$Utils$diffMemo, memo, v1, v2).a;
	});
var $elm$core$Tuple$second = function (_v0) {
	var y = _v0.b;
	return y;
};
var $author$project$Parser$Delta$strDiff = F2(
	function (s1, s2) {
		return A2(
			$author$project$Parser$Utils$diff,
			$elm$core$String$toList(s1),
			$elm$core$String$toList(s2)).b;
	});
var $author$project$Parser$Delta$dString = A2(
	$elm$parser$Parser$keeper,
	A2(
		$elm$parser$Parser$keeper,
		A2(
			$elm$parser$Parser$ignorer,
			$elm$parser$Parser$succeed($author$project$Parser$Delta$strDiff),
			$elm$parser$Parser$symbol('\"')),
		A2(
			$elm$parser$Parser$ignorer,
			$author$project$Parser$Utils$mstring,
			$elm$parser$Parser$symbol('\"=>\"'))),
	A2(
		$elm$parser$Parser$ignorer,
		$author$project$Parser$Utils$mstring,
		$elm$parser$Parser$symbol('\"')));
var $author$project$Parser$Delta$dCom = A2(
	$elm$parser$Parser$ignorer,
	A2(
		$elm$parser$Parser$ignorer,
		$elm$parser$Parser$succeed($author$project$Syntax$DCom),
		$elm$parser$Parser$symbol(';')),
	$elm$parser$Parser$spaces);
var $author$project$Parser$Delta$dCons = A2(
	$elm$parser$Parser$ignorer,
	A2(
		$elm$parser$Parser$ignorer,
		$elm$parser$Parser$succeed(
			$author$project$Syntax$DCons($elm$core$Maybe$Nothing)),
		$elm$parser$Parser$symbol('::')),
	$elm$parser$Parser$spaces);
var $author$project$Parser$Delta$operators = _List_fromArray(
	[
		_List_fromArray(
		[
			A2($Punie$elm_parser_extras$Parser$Expression$Infix, $author$project$Parser$Delta$dCons, $Punie$elm_parser_extras$Parser$Expression$AssocRight)
		]),
		_List_fromArray(
		[
			A2($Punie$elm_parser_extras$Parser$Expression$Infix, $author$project$Parser$Delta$dCom, $Punie$elm_parser_extras$Parser$Expression$AssocRight)
		])
	]);
function $author$project$Parser$Delta$cyclic$temp() {
	return $elm$parser$Parser$oneOf(
		_List_fromArray(
			[
				$author$project$Parser$Delta$dId,
				$author$project$Parser$Delta$dAdd,
				$elm$parser$Parser$backtrackable(
				$author$project$Parser$Delta$cyclic$dParens()),
				$elm$parser$Parser$backtrackable(
				$author$project$Parser$Delta$cyclic$dTuple()),
				$author$project$Parser$Delta$cyclic$dLam(),
				$author$project$Parser$Delta$dNone,
				$author$project$Parser$Delta$dInsert,
				$author$project$Parser$Delta$dDelete,
				$author$project$Parser$Delta$cyclic$dHtml(),
				$author$project$Parser$Delta$dString
			]));
}
function $author$project$Parser$Delta$cyclic$dHtml() {
	return A2(
		$elm$parser$Parser$keeper,
		A2(
			$elm$parser$Parser$keeper,
			A2(
				$elm$parser$Parser$keeper,
				A2(
					$elm$parser$Parser$keeper,
					A2(
						$elm$parser$Parser$ignorer,
						A2(
							$elm$parser$Parser$ignorer,
							$elm$parser$Parser$succeed($author$project$Syntax$DHtml),
							$elm$parser$Parser$keyword('Html')),
						$elm$parser$Parser$symbol('.')),
					A2($elm$parser$Parser$ignorer, $author$project$Parser$Utils$varName, $elm$parser$Parser$spaces)),
				$elm$parser$Parser$lazy(
					function (_v5) {
						return $author$project$Parser$Delta$cyclic$delta();
					})),
			$elm$parser$Parser$lazy(
				function (_v6) {
					return $author$project$Parser$Delta$cyclic$delta();
				})),
		$elm$parser$Parser$lazy(
			function (_v7) {
				return $author$project$Parser$Delta$cyclic$delta();
			}));
}
function $author$project$Parser$Delta$cyclic$dLam() {
	return A2(
		$elm$parser$Parser$keeper,
		A2(
			$elm$parser$Parser$keeper,
			A2(
				$elm$parser$Parser$ignorer,
				A2(
					$elm$parser$Parser$ignorer,
					$elm$parser$Parser$succeed($author$project$Syntax$DLam),
					$elm$parser$Parser$symbol('\\')),
				$elm$parser$Parser$spaces),
			A2(
				$elm$parser$Parser$ignorer,
				A2(
					$elm$parser$Parser$ignorer,
					$author$project$Parser$Exp$exp,
					$elm$parser$Parser$symbol('->')),
				$elm$parser$Parser$spaces)),
		$elm$parser$Parser$lazy(
			function (_v4) {
				return $author$project$Parser$Delta$cyclic$delta();
			}));
}
function $author$project$Parser$Delta$cyclic$dParens() {
	return A2(
		$elm$parser$Parser$keeper,
		A2(
			$elm$parser$Parser$ignorer,
			A2(
				$elm$parser$Parser$ignorer,
				$elm$parser$Parser$succeed($elm$core$Basics$identity),
				$elm$parser$Parser$symbol('(')),
			$elm$parser$Parser$spaces),
		A2(
			$elm$parser$Parser$ignorer,
			A2(
				$elm$parser$Parser$ignorer,
				A2(
					$elm$parser$Parser$ignorer,
					$elm$parser$Parser$lazy(
						function (_v3) {
							return $author$project$Parser$Delta$cyclic$delta();
						}),
					$elm$parser$Parser$spaces),
				$elm$parser$Parser$symbol(')')),
			$elm$parser$Parser$spaces));
}
function $author$project$Parser$Delta$cyclic$dTuple() {
	return A2(
		$elm$parser$Parser$keeper,
		A2(
			$elm$parser$Parser$keeper,
			A2(
				$elm$parser$Parser$ignorer,
				A2(
					$elm$parser$Parser$ignorer,
					$elm$parser$Parser$succeed($author$project$Syntax$DTuple),
					$elm$parser$Parser$symbol('(')),
				$elm$parser$Parser$spaces),
			A2(
				$elm$parser$Parser$ignorer,
				A2(
					$elm$parser$Parser$ignorer,
					A2(
						$elm$parser$Parser$ignorer,
						$elm$parser$Parser$lazy(
							function (_v1) {
								return $author$project$Parser$Delta$cyclic$delta();
							}),
						$elm$parser$Parser$spaces),
					$elm$parser$Parser$symbol(',')),
				$elm$parser$Parser$spaces)),
		A2(
			$elm$parser$Parser$ignorer,
			A2(
				$elm$parser$Parser$ignorer,
				A2(
					$elm$parser$Parser$ignorer,
					$elm$parser$Parser$lazy(
						function (_v2) {
							return $author$project$Parser$Delta$cyclic$delta();
						}),
					$elm$parser$Parser$spaces),
				$elm$parser$Parser$symbol(')')),
			$elm$parser$Parser$spaces));
}
function $author$project$Parser$Delta$cyclic$delta() {
	return A2(
		$Punie$elm_parser_extras$Parser$Expression$buildExpressionParser,
		$author$project$Parser$Delta$operators,
		$elm$parser$Parser$lazy(
			function (_v0) {
				return $author$project$Parser$Delta$cyclic$temp();
			}));
}
try {
	var $author$project$Parser$Delta$temp = $author$project$Parser$Delta$cyclic$temp();
	$author$project$Parser$Delta$cyclic$temp = function () {
		return $author$project$Parser$Delta$temp;
	};
	var $author$project$Parser$Delta$dHtml = $author$project$Parser$Delta$cyclic$dHtml();
	$author$project$Parser$Delta$cyclic$dHtml = function () {
		return $author$project$Parser$Delta$dHtml;
	};
	var $author$project$Parser$Delta$dLam = $author$project$Parser$Delta$cyclic$dLam();
	$author$project$Parser$Delta$cyclic$dLam = function () {
		return $author$project$Parser$Delta$dLam;
	};
	var $author$project$Parser$Delta$dParens = $author$project$Parser$Delta$cyclic$dParens();
	$author$project$Parser$Delta$cyclic$dParens = function () {
		return $author$project$Parser$Delta$dParens;
	};
	var $author$project$Parser$Delta$dTuple = $author$project$Parser$Delta$cyclic$dTuple();
	$author$project$Parser$Delta$cyclic$dTuple = function () {
		return $author$project$Parser$Delta$dTuple;
	};
	var $author$project$Parser$Delta$delta = $author$project$Parser$Delta$cyclic$delta();
	$author$project$Parser$Delta$cyclic$delta = function () {
		return $author$project$Parser$Delta$delta;
	};
} catch ($) {
	throw 'Some top-level definitions from `Parser.Delta` are causing infinite recursion:\n\n  ┌─────┐\n  │    temp\n  │     ↓\n  │    dHtml\n  │     ↓\n  │    dLam\n  │     ↓\n  │    dParens\n  │     ↓\n  │    dTuple\n  │     ↓\n  │    delta\n  └─────┘\n\nThese errors are very tricky, so read https://elm-lang.org/0.19.1/bad-recursion to learn how to fix it!';}
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
var $elm$parser$Parser$ExpectingEnd = {$: 'ExpectingEnd'};
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
var $author$project$LangUtils$GUI$dropLast = function (xs) {
	if (!xs.b) {
		return _List_Nil;
	} else {
		if (!xs.b.b) {
			var x = xs.a;
			return _List_Nil;
		} else {
			var x = xs.a;
			var ys = xs.b;
			return A2(
				$elm$core$List$cons,
				x,
				$author$project$LangUtils$GUI$dropLast(ys));
		}
	}
};
var $author$project$Ui$Controller$generateGUIDelta = F2(
	function (events, outputDelta) {
		var eventsWithOutputDelta = function () {
			if (!events.b) {
				return _List_Nil;
			} else {
				var _v4 = events.a;
				var eventExp = _v4.a;
				var tail = events.b;
				return A2(
					$elm$core$List$cons,
					_Utils_Tuple2(eventExp, outputDelta),
					tail);
			}
		}();
		var initialSnapshotDelta = function () {
			var _v1 = $author$project$Printer$Exp$listLast(eventsWithOutputDelta);
			if (_v1.$ === 'Just') {
				var _v2 = _v1.a;
				var d = _v2.b;
				return d;
			} else {
				return $author$project$Syntax$DZero;
			}
		}();
		var triggeredEvents = $author$project$LangUtils$GUI$dropLast(eventsWithOutputDelta);
		return A2(
			$author$project$Syntax$DTuple,
			initialSnapshotDelta,
			A3(
				$elm$core$List$foldl,
				F2(
					function (_v0, acc) {
						var eventExp = _v0.a;
						var delta = _v0.b;
						return A2(
							$author$project$Syntax$DLam,
							eventExp,
							A2($author$project$Syntax$DTuple, delta, acc));
					}),
				$author$project$Syntax$DZero,
				triggeredEvents));
	});
var $author$project$Ui$Controller$getEventsFromTriggeredEvents = function (triggeredEvents) {
	return A2(
		$elm$core$List$map,
		$elm$core$Tuple$first,
		$author$project$LangUtils$GUI$dropLast(triggeredEvents));
};
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
var $author$project$Parser$Exp$parse = $elm$parser$Parser$run(
	A2($elm$parser$Parser$ignorer, $author$project$Parser$Exp$exp, $elm$parser$Parser$end));
var $author$project$LangUtils$Postprocess$removeParens = function (exp) {
	if (exp.$ === 'EParens') {
		var e = exp.b;
		return e;
	} else {
		return exp;
	}
};
var $author$project$LangUtils$Postprocess$postprocess = F2(
	function (exp, h) {
		postprocess:
		while (true) {
			switch (exp.$) {
				case 'EVar':
					var wss = exp.a;
					var x = exp.b;
					if (A2($elm$core$String$startsWith, 'D', x) || (A2($elm$core$String$startsWith, 'I', x) || A2($elm$core$String$startsWith, 'R', x))) {
						var _v6 = A2($author$project$Utils$lookup, x, h);
						if (_v6.$ === 'Just') {
							var _v7 = _v6.a;
							var _v8 = _v7.a;
							var e2 = _v8.b;
							var $temp$exp = e2,
								$temp$h = h;
							exp = $temp$exp;
							h = $temp$h;
							continue postprocess;
						} else {
							return A3($author$project$Syntax$EVar, wss, x, 0);
						}
					} else {
						return A3($author$project$Syntax$EVar, wss, x, 0);
					}
				case 'ETuple':
					if (exp.b.$ === 'TupleType') {
						var wss = exp.a;
						var _v9 = exp.b;
						var e1 = exp.c;
						var e2 = exp.d;
						return A4(
							$author$project$Syntax$ETuple,
							wss,
							$author$project$Syntax$TupleType,
							A2(
								$author$project$LangUtils$Postprocess$postprocess,
								$author$project$LangUtils$Postprocess$removeParens(e1),
								h),
							A2(
								$author$project$LangUtils$Postprocess$postprocess,
								$author$project$LangUtils$Postprocess$removeParens(e2),
								h));
					} else {
						var wss = exp.a;
						var tType = exp.b;
						var e1 = exp.c;
						var e2 = exp.d;
						return A4(
							$author$project$Syntax$ETuple,
							wss,
							tType,
							A2($author$project$LangUtils$Postprocess$postprocess, e1, h),
							A2($author$project$LangUtils$Postprocess$postprocess, e2, h));
					}
				case 'ECons':
					var wss = exp.a;
					var ltype = exp.b;
					var e1 = exp.c;
					var e2 = exp.d;
					if (ltype.$ === 'SquareType') {
						return A4(
							$author$project$Syntax$ECons,
							wss,
							ltype,
							A2(
								$author$project$LangUtils$Postprocess$postprocess,
								$author$project$LangUtils$Postprocess$removeParens(e1),
								h),
							A2(
								$author$project$LangUtils$Postprocess$postprocess,
								$author$project$LangUtils$Postprocess$removeParens(e2),
								h));
					} else {
						return A4(
							$author$project$Syntax$ECons,
							wss,
							ltype,
							A2($author$project$LangUtils$Postprocess$postprocess, e1, h),
							A2($author$project$LangUtils$Postprocess$postprocess, e2, h));
					}
				case 'EParens':
					var wss = exp.a;
					var e = exp.b;
					return A2(
						$author$project$Syntax$EParens,
						wss,
						A2($author$project$LangUtils$Postprocess$postprocess, e, h));
				case 'ELam':
					var wss = exp.a;
					var x = exp.b;
					var e = exp.c;
					return A3(
						$author$project$Syntax$ELam,
						wss,
						x,
						A2($author$project$LangUtils$Postprocess$postprocess, e, h));
				case 'EApp':
					var e1 = exp.a;
					var e2 = exp.b;
					return A2(
						$author$project$Syntax$EApp,
						A2($author$project$LangUtils$Postprocess$postprocess, e1, h),
						A2($author$project$LangUtils$Postprocess$postprocess, e2, h));
				case 'ELet':
					var wss = exp.a;
					var h_ = exp.b;
					var e = exp.c;
					return A3(
						$author$project$Syntax$ELet,
						wss,
						A2($author$project$LangUtils$Postprocess$postprocessHeap, h_, h),
						A2($author$project$LangUtils$Postprocess$postprocess, e, h));
				case 'ECase':
					var wss = exp.a;
					var e = exp.b;
					var b = exp.c;
					return A3(
						$author$project$Syntax$ECase,
						wss,
						A2($author$project$LangUtils$Postprocess$postprocess, e, h),
						A2($author$project$LangUtils$Postprocess$postprocessBranch, b, h));
				case 'EUPrim':
					var wss = exp.a;
					var u = exp.b;
					var e = exp.c;
					return A3(
						$author$project$Syntax$EUPrim,
						wss,
						u,
						A2($author$project$LangUtils$Postprocess$postprocess, e, h));
				case 'EBPrim':
					var wss = exp.a;
					var b = exp.b;
					var e1 = exp.c;
					var e2 = exp.d;
					return A4(
						$author$project$Syntax$EBPrim,
						wss,
						b,
						A2($author$project$LangUtils$Postprocess$postprocess, e1, h),
						A2($author$project$LangUtils$Postprocess$postprocess, e2, h));
				case 'EHtml':
					var wss = exp.a;
					var s = exp.b;
					var e1 = exp.c;
					var e2 = exp.d;
					var e3 = exp.e;
					return A5(
						$author$project$Syntax$EHtml,
						wss,
						s,
						A2($author$project$LangUtils$Postprocess$postprocess, e1, h),
						A2($author$project$LangUtils$Postprocess$postprocess, e2, h),
						A2($author$project$LangUtils$Postprocess$postprocess, e3, h));
				default:
					return exp;
			}
		}
	});
var $author$project$LangUtils$Postprocess$postprocessBranch = F2(
	function (b, h) {
		if (b.$ === 'BSin') {
			var wss = b.a;
			var p = b.b;
			var e = b.c;
			return A3(
				$author$project$Syntax$BSin,
				wss,
				p,
				A2($author$project$LangUtils$Postprocess$postprocess, e, h));
		} else {
			var wss = b.a;
			var b1 = b.b;
			var b2 = b.c;
			return A3(
				$author$project$Syntax$BCom,
				wss,
				A2($author$project$LangUtils$Postprocess$postprocessBranch, b1, h),
				A2($author$project$LangUtils$Postprocess$postprocessBranch, b2, h));
		}
	});
var $author$project$LangUtils$Postprocess$postprocessHeap = F2(
	function (h, h1) {
		if (h.b) {
			var _v1 = h.a;
			var x = _v1.a;
			var _v2 = _v1.b;
			var _v3 = _v2.a;
			var nE = _v3.b;
			var h_ = h.b;
			var exp = A2($author$project$LangUtils$Postprocess$postprocess, nE, h1);
			return A2(
				$elm$core$List$cons,
				_Utils_Tuple2(
					x,
					_Utils_Tuple3(
						_Utils_Tuple2(exp, exp),
						$author$project$Syntax$DZero,
						_Utils_Tuple2($elm$core$Maybe$Nothing, false))),
				A2($author$project$LangUtils$Postprocess$postprocessHeap, h_, h1));
		} else {
			return _List_Nil;
		}
	});
var $author$project$LangUtils$Preprocess$desugar = function (dv) {
	switch (dv.$) {
		case 'DInsert':
			var n = dv.a;
			var x = dv.b;
			return (!n) ? A3(
				$author$project$Syntax$DCons,
				$elm$core$Maybe$Just(x),
				$author$project$Syntax$DId,
				$author$project$Syntax$DId) : A3(
				$author$project$Syntax$DCons,
				$elm$core$Maybe$Nothing,
				$author$project$Syntax$DId,
				$author$project$LangUtils$Preprocess$desugar(
					A2($author$project$Syntax$DInsert, n - 1, x)));
		case 'DDelete':
			var n = dv.a;
			return (!n) ? A3($author$project$Syntax$DCons, $elm$core$Maybe$Nothing, $author$project$Syntax$DRem, $author$project$Syntax$DId) : A3(
				$author$project$Syntax$DCons,
				$elm$core$Maybe$Nothing,
				$author$project$Syntax$DId,
				$author$project$LangUtils$Preprocess$desugar(
					$author$project$Syntax$DDelete(n - 1)));
		case 'DCons':
			var me = dv.a;
			var dv1 = dv.b;
			var dv2 = dv.c;
			return A3(
				$author$project$Syntax$DCons,
				me,
				$author$project$LangUtils$Preprocess$desugar(dv1),
				$author$project$LangUtils$Preprocess$desugar(dv2));
		case 'DTuple':
			var dv1 = dv.a;
			var dv2 = dv.b;
			return A2(
				$author$project$Syntax$DTuple,
				$author$project$LangUtils$Preprocess$desugar(dv1),
				$author$project$LangUtils$Preprocess$desugar(dv2));
		case 'DCom':
			var dv1 = dv.a;
			var dv2 = dv.b;
			return A2(
				$author$project$Syntax$DCom,
				$author$project$LangUtils$Preprocess$desugar(dv1),
				$author$project$LangUtils$Preprocess$desugar(dv2));
		case 'DLam':
			var e = dv.a;
			var dv1 = dv.b;
			return A2(
				$author$project$Syntax$DLam,
				e,
				$author$project$LangUtils$Preprocess$desugar(dv1));
		case 'DHtml':
			var n = dv.a;
			var dv1 = dv.b;
			var dv2 = dv.c;
			var dv3 = dv.d;
			return A4(
				$author$project$Syntax$DHtml,
				n,
				$author$project$LangUtils$Preprocess$desugar(dv1),
				$author$project$LangUtils$Preprocess$desugar(dv2),
				$author$project$LangUtils$Preprocess$desugar(dv3));
		default:
			return dv;
	}
};
var $author$project$LangUtils$Preprocess$introHeap = F2(
	function (dv, id) {
		switch (dv.$) {
			case 'DInsert':
				var n = dv.a;
				var v = dv.b;
				var x = 'D' + $elm$core$Debug$toString(id);
				return _Utils_Tuple3(
					A2(
						$author$project$Syntax$DInsert,
						n,
						A3(
							$author$project$Syntax$EVar,
							_List_fromArray(
								[' ']),
							x,
							0)),
					_List_fromArray(
						[
							_Utils_Tuple2(
							x,
							_Utils_Tuple3(
								_Utils_Tuple2(v, v),
								$author$project$Syntax$DId,
								_Utils_Tuple2($elm$core$Maybe$Nothing, false)))
						]),
					id + 1);
			case 'DLam':
				var v = dv.a;
				var dv1 = dv.b;
				var _v1 = A2($author$project$LangUtils$Preprocess$introHeap, dv1, id);
				var dv1_ = _v1.a;
				var heap = _v1.b;
				var id1 = _v1.c;
				var x = 'D' + $elm$core$Debug$toString(id1);
				return _Utils_Tuple3(
					A2(
						$author$project$Syntax$DLam,
						A3(
							$author$project$Syntax$EVar,
							_List_fromArray(
								[' ']),
							x,
							0),
						dv1_),
					A2(
						$elm$core$List$cons,
						_Utils_Tuple2(
							x,
							_Utils_Tuple3(
								_Utils_Tuple2(v, v),
								$author$project$Syntax$DId,
								_Utils_Tuple2($elm$core$Maybe$Nothing, false))),
						heap),
					id1 + 1);
			case 'DCons':
				var x = dv.a;
				var dv1 = dv.b;
				var dv2 = dv.c;
				var _v2 = A2($author$project$LangUtils$Preprocess$introHeap, dv1, id);
				var dv1_ = _v2.a;
				var heap1 = _v2.b;
				var id1 = _v2.c;
				var _v3 = A2($author$project$LangUtils$Preprocess$introHeap, dv2, id1);
				var dv2_ = _v3.a;
				var heap2 = _v3.b;
				var id2 = _v3.c;
				return _Utils_Tuple3(
					A3($author$project$Syntax$DCons, x, dv1_, dv2_),
					_Utils_ap(heap1, heap2),
					id2);
			case 'DTuple':
				var dv1 = dv.a;
				var dv2 = dv.b;
				var _v4 = A2($author$project$LangUtils$Preprocess$introHeap, dv1, id);
				var dv1_ = _v4.a;
				var heap1 = _v4.b;
				var id1 = _v4.c;
				var _v5 = A2($author$project$LangUtils$Preprocess$introHeap, dv2, id1);
				var dv2_ = _v5.a;
				var heap2 = _v5.b;
				var id2 = _v5.c;
				return _Utils_Tuple3(
					A2($author$project$Syntax$DTuple, dv1_, dv2_),
					_Utils_ap(heap1, heap2),
					id2);
			case 'DCom':
				var dv1 = dv.a;
				var dv2 = dv.b;
				var _v6 = A2($author$project$LangUtils$Preprocess$introHeap, dv1, id);
				var dv1_ = _v6.a;
				var heap1 = _v6.b;
				var id1 = _v6.c;
				var _v7 = A2($author$project$LangUtils$Preprocess$introHeap, dv2, id1);
				var dv2_ = _v7.a;
				var heap2 = _v7.b;
				var id2 = _v7.c;
				return _Utils_Tuple3(
					A2($author$project$Syntax$DCom, dv1_, dv2_),
					_Utils_ap(heap1, heap2),
					id2);
			case 'DHtml':
				var n = dv.a;
				var dv1 = dv.b;
				var dv2 = dv.c;
				var dv3 = dv.d;
				var _v8 = A2($author$project$LangUtils$Preprocess$introHeap, dv1, id);
				var dv1_ = _v8.a;
				var heap1 = _v8.b;
				var id1 = _v8.c;
				var _v9 = A2($author$project$LangUtils$Preprocess$introHeap, dv2, id1);
				var dv2_ = _v9.a;
				var heap2 = _v9.b;
				var id2 = _v9.c;
				var _v10 = A2($author$project$LangUtils$Preprocess$introHeap, dv3, id2);
				var dv3_ = _v10.a;
				var heap3 = _v10.b;
				var id3 = _v10.c;
				return _Utils_Tuple3(
					A4($author$project$Syntax$DHtml, n, dv1_, dv2_, dv3_),
					_Utils_ap(
						heap1,
						_Utils_ap(heap2, heap3)),
					id3);
			default:
				return _Utils_Tuple3(dv, _List_Nil, id);
		}
	});
var $author$project$LangUtils$Preprocess$preproc = F2(
	function (dv, id) {
		var _v0 = A2($author$project$LangUtils$Preprocess$introHeap, dv, id);
		var dv1 = _v0.a;
		var heap = _v0.b;
		var id1 = _v0.c;
		return _Utils_Tuple3(
			$author$project$LangUtils$Preprocess$desugar(dv1),
			heap,
			id1);
	});
var $author$project$Ui$Controller$forwardExecute = F4(
	function (model, initHeap, initExp, initID) {
		return A2(
			$elm$core$Result$andThen,
			function (_v0) {
				var runningHeap = _v0.a;
				var output = _v0.b;
				var runningID = _v0.c;
				if ((output.$ === 'ETuple') && (output.b.$ === 'GuiType')) {
					var _v2 = output.b;
					var snapshotExp = output.c;
					var guiExp = output.d;
					return A2(
						$elm$core$Result$andThen,
						function (_v3) {
							var runningHeapGUI = _v3.a;
							var snapshot = _v3.b;
							var runningIDGUI = _v3.c;
							return $elm$core$Result$Ok(
								_Utils_update(
									model,
									{output: snapshot, runningExp: guiExp, runningHeap: runningHeapGUI, runningID: runningIDGUI}));
						},
						A3($author$project$Eval$fwd, runningHeap, snapshotExp, runningID));
				} else {
					return $elm$core$Result$Ok(
						_Utils_update(
							model,
							{output: output, runningExp: output, runningHeap: runningHeap, runningID: runningID}));
				}
			},
			A3($author$project$Eval$fwd, initHeap, initExp, initID));
	});
var $author$project$Ui$Controller$runEventsFromScratch = F2(
	function (code, events) {
		var _v0 = $author$project$Parser$Exp$parse(code);
		if (_v0.$ === 'Ok') {
			var gui = _v0.a;
			var model = _Utils_update(
				$author$project$Ui$Model$initModel,
				{runningExp: gui});
			var modelResAcc = A4($author$project$Ui$Controller$forwardExecute, model, model.runningHeap, model.runningExp, model.runningID);
			return A3(
				$elm$core$List$foldr,
				F2(
					function (eventExp, acc) {
						return A2(
							$elm$core$Result$andThen,
							function (modelAcc) {
								var model1 = _Utils_update(
									modelAcc,
									{
										runningExp: A2($author$project$Syntax$EApp, modelAcc.runningExp, eventExp)
									});
								return A4($author$project$Ui$Controller$forwardExecute, model1, model1.runningHeap, model1.runningExp, model1.runningID);
							},
							acc);
					}),
				modelResAcc,
				events);
		} else {
			return $elm$core$Result$Err('ERROR #11 Exp Parse Error: ' + code);
		}
	});
var $author$project$Ui$Controller$backwardController = function (model) {
	var _v0 = _Utils_Tuple2(
		$author$project$Parser$Exp$parse(model.code),
		A2(
			$elm$parser$Parser$run,
			A2($elm$parser$Parser$ignorer, $author$project$Parser$Delta$delta, $elm$parser$Parser$end),
			model.delta));
	if (_v0.a.$ === 'Ok') {
		if (_v0.b.$ === 'Ok') {
			var code_prev = _v0.a.a;
			var delta_prev = _v0.b.a;
			var events = A2($elm$core$List$drop, model.eventIndex, model.triggeredEvents);
			var model1 = _Utils_update(
				model,
				{eventIndex: $author$project$Ui$Model$defaultEventIndex, triggeredEvents: events});
			var deltaPassedToBWD = A2($author$project$LangUtils$Equality$eqExp, model1.runningExp, model1.output) ? delta_prev : A2($author$project$Ui$Controller$generateGUIDelta, model1.triggeredEvents, delta_prev);
			var _v1 = A2($author$project$LangUtils$Preprocess$preproc, deltaPassedToBWD, 0);
			var dv = _v1.a;
			var heap1 = _v1.b;
			var _v2 = A4($author$project$Eval$bwd, dv, heap1, code_prev, 0);
			var h_bwd = _v2.a;
			var exp_bwd = _v2.b;
			var h_post = A2($author$project$LangUtils$Postprocess$postprocessHeap, h_bwd, h_bwd);
			var exp_post = A2($author$project$LangUtils$Postprocess$postprocess, exp_bwd, h_post);
			var newCode = $author$project$Printer$Exp$print(exp_post);
			var _v3 = A2($elm$core$Debug$log, 'delta', deltaPassedToBWD);
			return A2(
				$elm$core$Result$andThen,
				function (model2) {
					return $elm$core$Result$Ok(
						_Utils_update(
							model1,
							{code: newCode, output: model2.output, runningExp: model2.runningExp, runningHeap: model2.runningHeap, runningID: model2.runningID}));
				},
				A2(
					$author$project$Ui$Controller$runEventsFromScratch,
					newCode,
					$author$project$Ui$Controller$getEventsFromTriggeredEvents(model1.triggeredEvents)));
		} else {
			return $elm$core$Result$Err('ERROR #12 Delta Parse Error: ' + model.delta);
		}
	} else {
		return $elm$core$Result$Err('ERROR #11 Exp Parse Error: ' + model.code);
	}
};
var $author$project$Ui$Controller$forwardController = function (model) {
	var _v0 = $author$project$Parser$Exp$parse(model.code);
	if (_v0.$ === 'Ok') {
		var code = _v0.a;
		return A4($author$project$Ui$Controller$forwardExecute, model, model.runningHeap, code, 0);
	} else {
		return $elm$core$Result$Err('ERROR #11 Exp Parse Error: ' + model.code);
	}
};
var $author$project$Syntax$eListDefaultWSS = _List_fromArray(
	[' ', ' ']);
var $author$project$LangUtils$GUI$strToBool = function (str) {
	switch (str) {
		case 'True':
			return $elm$core$Maybe$Just(true);
		case 'False':
			return $elm$core$Maybe$Just(false);
		default:
			return $elm$core$Maybe$Nothing;
	}
};
var $author$project$LangUtils$GUI$argsToExp = function (ss) {
	var argToExp = function (s) {
		var _v0 = $elm$core$String$toInt(s);
		if (_v0.$ === 'Just') {
			var intValue = _v0.a;
			return A2($author$project$Syntax$EInt, $author$project$Syntax$eIntDefaultWSS, intValue);
		} else {
			var _v1 = $author$project$LangUtils$GUI$strToBool(s);
			if (_v1.$ === 'Just') {
				var boolValue = _v1.a;
				return A2($author$project$Syntax$EBool, $author$project$Syntax$eBoolDefaultWSS, boolValue);
			} else {
				return $author$project$LangUtils$GUI$strToExpr(s);
			}
		}
	};
	return A2(
		$author$project$Parser$Utils$repWS,
		$author$project$Syntax$eListDefaultWSS,
		A3(
			$elm$core$List$foldr,
			F2(
				function (s, acc) {
					return A4(
						$author$project$Syntax$ECons,
						$author$project$Syntax$eConsDefaultWSS,
						$author$project$Syntax$SquareType,
						argToExp(s),
						acc);
				}),
			A2($author$project$Syntax$ENil, _List_Nil, $author$project$Syntax$SquareType),
			ss));
};
var $author$project$Syntax$eTupleEventDefaultWSS = _List_fromArray(
	[' ']);
var $author$project$LangUtils$GUI$eventToExp = F2(
	function (eventNameStr, args) {
		var eventNameExpr = $author$project$LangUtils$GUI$strToExpr(eventNameStr);
		var argsExpr = $author$project$LangUtils$GUI$argsToExp(args);
		return A4($author$project$Syntax$ETuple, $author$project$Syntax$eTupleEventDefaultWSS, $author$project$Syntax$EventType, eventNameExpr, argsExpr);
	});
var $author$project$Ui$Controller$guiEventController = F3(
	function (eventName, args, model) {
		var eventExp = A2($author$project$LangUtils$GUI$eventToExp, eventName, args);
		var newModel = _Utils_update(
			model,
			{
				triggeredEvents: A2(
					$elm$core$List$cons,
					_Utils_Tuple2(eventExp, $author$project$Syntax$DZero),
					model.triggeredEvents)
			});
		var newRunningExp = A2($author$project$Syntax$EApp, model.runningExp, eventExp);
		return A4($author$project$Ui$Controller$forwardExecute, newModel, model.runningHeap, newRunningExp, model.runningID);
	});
var $author$project$Printer$Html$evalExpToWHNFInRunning = F2(
	function (exp, model) {
		var _v0 = A3($author$project$Eval$fwd, model.runningHeap, exp, model.runningID);
		if (_v0.$ === 'Ok') {
			var _v1 = _v0.a;
			var heap_fwd = _v1.a;
			var value = _v1.b;
			var id_fwd = _v1.c;
			var newModel = _Utils_update(
				model,
				{runningHeap: heap_fwd, runningID: id_fwd});
			return _Utils_Tuple2(value, newModel);
		} else {
			var info = _v0.a;
			return _Utils_Tuple2(
				$author$project$Syntax$EError(info),
				model);
		}
	});
var $author$project$Printer$Html$printStrWithoutQuo = function (str_value) {
	_v0$2:
	while (true) {
		switch (str_value.$) {
			case 'ECons':
				if ((str_value.b.$ === 'StringType') && (str_value.c.$ === 'EChar')) {
					var _v1 = str_value.b;
					var _v2 = str_value.c;
					var c = _v2.b;
					var cs = str_value.d;
					return _Utils_ap(
						$elm$core$String$fromChar(c),
						$author$project$Printer$Html$printStrWithoutQuo(cs));
				} else {
					break _v0$2;
				}
			case 'ENil':
				if (str_value.b.$ === 'StringType') {
					var _v3 = str_value.b;
					return '';
				} else {
					break _v0$2;
				}
			default:
				break _v0$2;
		}
	}
	return 'ERROR #23: Print str error, str value = ' + $elm$core$Debug$toString(str_value);
};
var $elm$core$String$replace = F3(
	function (before, after, string) {
		return A2(
			$elm$core$String$join,
			after,
			A2($elm$core$String$split, before, string));
	});
var $author$project$Printer$Html$removeParens = function (num) {
	return A3(
		$elm$core$String$replace,
		')',
		'',
		A3($elm$core$String$replace, '(', '', num));
};
var $author$project$Printer$Html$printOtherPro = F2(
	function (pro, model) {
		var _v0 = A2($author$project$Printer$Html$evalExpToWHNFInRunning, pro, model);
		var pro_value = _v0.a;
		var model1 = _v0.b;
		if ((pro_value.$ === 'ETuple') && (pro_value.b.$ === 'TupleType')) {
			var _v2 = pro_value.b;
			var n = pro_value.c;
			var v = pro_value.d;
			var _v3 = A2($author$project$Printer$Html$evalExpToWHNFInRunning, n, model1);
			var n_value = _v3.a;
			var model2 = _v3.b;
			var _v4 = A2($author$project$Printer$Html$evalExpToWHNFInRunning, v, model2);
			var v_value = _v4.a;
			var model3 = _v4.b;
			var v_str = function () {
				switch (v_value.$) {
					case 'EInt':
						return $author$project$Printer$Html$removeParens(
							$author$project$Printer$Exp$print(v_value));
					case 'EBool':
						return $author$project$Printer$Exp$print(v_value);
					default:
						return $author$project$Printer$Html$printStrWithoutQuo(v_value);
				}
			}();
			var n_str = $author$project$Printer$Html$printStrWithoutQuo(n_value);
			var v_str_post = A2($elm$core$String$startsWith, 'on', n_str) ? ('eventForward(\'' + (n_str + ('\', \'' + (v_str + '\', event)')))) : v_str;
			return _Utils_Tuple2(n_str + ('=\"' + (v_str_post + '\"')), model3);
		} else {
			return _Utils_Tuple2(
				'ERROR #21: Print HTML attr error, attr value = ' + $elm$core$Debug$toString(pro_value),
				model);
		}
	});
var $author$project$Printer$Html$printAttr = F2(
	function (attr, model) {
		var _v0 = A2($author$project$Printer$Html$evalExpToWHNFInRunning, attr, model);
		var attr_value = _v0.a;
		var model1 = _v0.b;
		switch (attr_value.$) {
			case 'ENil':
				return _Utils_Tuple2('', model1);
			case 'ECons':
				var x = attr_value.c;
				var xs = attr_value.d;
				var _v2 = A2($author$project$Printer$Html$printOtherPro, x, model1);
				var xStr = _v2.a;
				var model2 = _v2.b;
				var _v3 = A2($author$project$Printer$Html$printAttr, xs, model2);
				var xsStr = _v3.a;
				var model3 = _v3.b;
				return _Utils_Tuple2(xStr + (' ' + xsStr), model3);
			default:
				return _Utils_Tuple2(
					'ERROR #20: Print HTML attrs error, attrs value = ' + $elm$core$Debug$toString(attr_value),
					model);
		}
	});
var $author$project$Printer$Html$colorTypeStyleList = _List_fromArray(
	['background-color', 'color']);
var $author$project$Printer$Html$intTypeStyleList = _List_fromArray(
	['z-index', 'font-weight', 'line-height']);
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
var $author$project$Printer$Html$pxTypeStyleList = _List_fromArray(
	['width', 'height', 'top', 'bottom', 'left', 'right', 'margin', 'margin-top', 'margin-bottom', 'margin-left', 'margin-right', 'padding', 'padding-top', 'padding-bottom', 'padding-left', 'padding-right', 'border-radius', 'border-width', 'border-top-width', 'border-bottom-width', 'border-left-width', 'border-right-width', 'font-size']);
var $author$project$Printer$Html$getUnit = function (name) {
	return A2($elm$core$List$member, name, $author$project$Printer$Html$pxTypeStyleList) ? 'px' : (A2($elm$core$List$member, name, $author$project$Printer$Html$intTypeStyleList) ? '' : ('ERROR #27: Unknown name=' + name));
};
var $author$project$Printer$Html$intStyleList = _Utils_ap($author$project$Printer$Html$pxTypeStyleList, $author$project$Printer$Html$intTypeStyleList);
var $author$project$Printer$Html$printProperty = F2(
	function (pro, model) {
		var _v0 = A2($author$project$Printer$Html$evalExpToWHNFInRunning, pro, model);
		var pro_value = _v0.a;
		var model1 = _v0.b;
		if ((pro_value.$ === 'ETuple') && (pro_value.b.$ === 'TupleType')) {
			var _v2 = pro_value.b;
			var n = pro_value.c;
			var v = pro_value.d;
			var _v3 = A2($author$project$Printer$Html$evalExpToWHNFInRunning, n, model1);
			var n_value = _v3.a;
			var model2 = _v3.b;
			var _v4 = A2($author$project$Printer$Html$evalExpToWHNFInRunning, v, model2);
			var v_value = _v4.a;
			var model3 = _v4.b;
			var n_str = $author$project$Printer$Html$printStrWithoutQuo(n_value);
			var v_str = function () {
				if (A2($elm$core$List$member, n_str, $author$project$Printer$Html$intStyleList)) {
					if (v_value.$ === 'EInt') {
						return _Utils_ap(
							$author$project$Printer$Html$removeParens(
								$author$project$Printer$Exp$print(v_value)),
							$author$project$Printer$Html$getUnit(n_str));
					} else {
						return 'ERROR #25: Print HTML int Style Attr Error, name=' + n_str;
					}
				} else {
					if (A2($elm$core$List$member, n_str, $author$project$Printer$Html$colorTypeStyleList)) {
						if (v_value.$ === 'EInt') {
							var num = v_value.b;
							var r = $elm$core$String$fromInt(
								A2($elm$core$Basics$modBy, 1000000, (num / 1000000) | 0));
							var g = $elm$core$String$fromInt(
								A2($elm$core$Basics$modBy, 1000, (num / 1000) | 0));
							var b = $elm$core$String$fromInt(
								A2($elm$core$Basics$modBy, 1000, num));
							return 'rgb(' + (r + (' ' + (g + (' ' + (b + ')')))));
						} else {
							return 'ERROR #26: Incorrect HTML color Style Attr Error, name=' + n_str;
						}
					} else {
						return $author$project$Printer$Html$printStrWithoutQuo(v_value);
					}
				}
			}();
			return _Utils_Tuple2(n_str + (':' + (v_str + ';')), model3);
		} else {
			return _Utils_Tuple2(
				'ERROR #19: Print HTML style error, style value = ' + $elm$core$Debug$toString(pro_value),
				model);
		}
	});
var $author$project$Printer$Html$printStyle = F2(
	function (style, model) {
		var _v0 = A2($author$project$Printer$Html$evalExpToWHNFInRunning, style, model);
		var style_value = _v0.a;
		var model1 = _v0.b;
		switch (style_value.$) {
			case 'ENil':
				return _Utils_Tuple2('', model1);
			case 'ECons':
				var x = style_value.c;
				var xs = style_value.d;
				var _v2 = A2($author$project$Printer$Html$printProperty, x, model1);
				var str1 = _v2.a;
				var model2 = _v2.b;
				var _v3 = A2($author$project$Printer$Html$printStyle, xs, model2);
				var str2 = _v3.a;
				var model3 = _v3.b;
				return _Utils_Tuple2(str1 + (' ' + str2), model3);
			default:
				return _Utils_Tuple2(
					'ERROR #18: Print HTML styles error, styles value = ' + $elm$core$Debug$toString(style_value),
					model);
		}
	});
var $author$project$Printer$Html$printChild = F2(
	function (child, model) {
		var _v10 = A2($author$project$Printer$Html$evalExpToWHNFInRunning, child, model);
		var child_value = _v10.a;
		var model1 = _v10.b;
		if (child_value.$ === 'EHtml') {
			return A2($author$project$Printer$Html$printHTML, child, model1);
		} else {
			var _v12 = function () {
				_v13$4:
				while (true) {
					switch (child_value.$) {
						case 'ECons':
							if (child_value.b.$ === 'StringType') {
								var _v14 = child_value.b;
								return _Utils_Tuple2(
									'str',
									$author$project$Printer$Html$printStrWithoutQuo(child_value));
							} else {
								break _v13$4;
							}
						case 'EInt':
							return _Utils_Tuple2(
								'int',
								$author$project$Printer$Html$removeParens(
									$author$project$Printer$Exp$print(child_value)));
						case 'EBool':
							return _Utils_Tuple2(
								'bool',
								$author$project$Printer$Exp$print(child_value));
						case 'EChar':
							return _Utils_Tuple2(
								'char',
								$author$project$Printer$Exp$print(child_value));
						default:
							break _v13$4;
					}
				}
				return _Utils_Tuple2(
					'unsupport',
					$author$project$Printer$Exp$print(child_value));
			}();
			var spanType = _v12.a;
			var spanContent = _v12.b;
			return _Utils_Tuple2('<span class=\'' + (spanType + ('\'>' + (spanContent + '</span>'))), model1);
		}
	});
var $author$project$Printer$Html$printChilds = F2(
	function (childs, model) {
		var _v6 = A2($author$project$Printer$Html$evalExpToWHNFInRunning, childs, model);
		var childs_value = _v6.a;
		var model1 = _v6.b;
		switch (childs_value.$) {
			case 'ENil':
				return _Utils_Tuple2('', model1);
			case 'ECons':
				var c = childs_value.c;
				var cs = childs_value.d;
				var _v8 = A2($author$project$Printer$Html$printChild, c, model1);
				var childStr = _v8.a;
				var model2 = _v8.b;
				var _v9 = A2($author$project$Printer$Html$printChilds, cs, model2);
				var childsStr = _v9.a;
				var model3 = _v9.b;
				return _Utils_Tuple2(
					_Utils_ap(childStr, childsStr),
					model3);
			default:
				return _Utils_Tuple2(
					'ERROR #22: Print HTML childs error, childs value = ' + $elm$core$Debug$toString(childs_value),
					model);
		}
	});
var $author$project$Printer$Html$printHTML = F2(
	function (exp, model) {
		var _v0 = A2($author$project$Printer$Html$evalExpToWHNFInRunning, exp, model);
		var exp_value = _v0.a;
		var model1 = _v0.b;
		if (exp_value.$ === 'EHtml') {
			var nodeName = exp_value.b;
			var style = exp_value.c;
			var attr = exp_value.d;
			var childs = exp_value.e;
			if (nodeName === 'br') {
				return _Utils_Tuple2('<br>', model1);
			} else {
				var _v2 = A2($author$project$Printer$Html$printStyle, style, model1);
				var strStyle = _v2.a;
				var model2 = _v2.b;
				var _v3 = A2($author$project$Printer$Html$printAttr, attr, model2);
				var strAttr = _v3.a;
				var model3 = _v3.b;
				var _v4 = A2($author$project$Printer$Html$printChilds, childs, model3);
				var strChilds = _v4.a;
				var model4 = _v4.b;
				var formatStyle = function () {
					if (style.$ === 'ENil') {
						return '';
					} else {
						return ' style=\"' + (strStyle + '\"');
					}
				}();
				var output = (nodeName === 'input') ? ('<' + (nodeName + (formatStyle + (' ' + (strAttr + '/>'))))) : ('<' + (nodeName + (formatStyle + (' ' + (strAttr + ('>' + (strChilds + ('</' + (nodeName + '>')))))))));
				return _Utils_Tuple2(output, model4);
			}
		} else {
			return _Utils_Tuple2('Print HTML Error.', model1);
		}
	});
var $author$project$Ui$Controller$printOutput = function (model) {
	var _v0 = model.output;
	if (_v0.$ === 'EHtml') {
		return A2($author$project$Printer$Html$printHTML, model.output, model);
	} else {
		return _Utils_Tuple2(
			$author$project$Printer$Exp$print(model.output),
			model);
	}
};
var $elm$json$Json$Encode$string = _Json_wrap;
var $author$project$Ui$Main$sendAlert = _Platform_outgoingPort('sendAlert', $elm$json$Json$Encode$string);
var $author$project$Ui$Main$sendCode = _Platform_outgoingPort('sendCode', $elm$json$Json$Encode$string);
var $author$project$Ui$Main$sendDelta = _Platform_outgoingPort('sendDelta', $elm$json$Json$Encode$string);
var $author$project$Ui$Main$sendFileName = _Platform_outgoingPort('sendFileName', $elm$json$Json$Encode$string);
var $author$project$Ui$Main$sendOutput = _Platform_outgoingPort('sendOutput', $elm$json$Json$Encode$string);
var $author$project$Ui$Main$update = F2(
	function (msg, model) {
		switch (msg.$) {
			case 'SaveCode':
				var newCode = msg.a;
				var newModelRes = $author$project$Ui$Controller$forwardController(
					_Utils_update(
						model,
						{code: newCode, eventIndex: $author$project$Ui$Model$defaultEventIndex, mode: $author$project$Ui$Model$RUNNING, runningExp: $author$project$Ui$Model$defaultRunningExp, runningHeap: $author$project$Ui$Model$defaultRunningHeap, runningID: $author$project$Ui$Model$defaultRunningID, triggeredEvents: $author$project$Ui$Model$defaultTriggeredEvents}));
				if (newModelRes.$ === 'Ok') {
					var model1 = newModelRes.a;
					var _v2 = $author$project$Ui$Controller$printOutput(model1);
					var output = _v2.a;
					var model2 = _v2.b;
					return _Utils_Tuple2(
						model2,
						$author$project$Ui$Main$sendOutput(output));
				} else {
					var err = newModelRes.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{code: newCode}),
						$author$project$Ui$Main$sendOutput(err));
				}
			case 'Backward':
				var newModelRes = $author$project$Ui$Controller$backwardController(model);
				if (newModelRes.$ === 'Ok') {
					var model1 = newModelRes.a;
					var _v4 = $author$project$Ui$Controller$printOutput(model1);
					var output = _v4.a;
					var model2 = _v4.b;
					return _Utils_Tuple2(
						model2,
						$elm$core$Platform$Cmd$batch(
							_List_fromArray(
								[
									$author$project$Ui$Main$sendCode(model2.code),
									$author$project$Ui$Main$sendOutput(output)
								])));
				} else {
					var err = newModelRes.a;
					return _Utils_Tuple2(
						model,
						$author$project$Ui$Main$sendCode(err));
				}
			case 'BackwardPreview':
				var newModelRes = $author$project$Ui$Controller$backwardController(model);
				if (newModelRes.$ === 'Ok') {
					var newModel = newModelRes.a;
					return _Utils_Tuple2(
						model,
						$author$project$Ui$Main$sendCode(newModel.code));
				} else {
					var err = newModelRes.a;
					return _Utils_Tuple2(
						model,
						$author$project$Ui$Main$sendCode(err));
				}
			case 'BackwardPreviewRevert':
				return _Utils_Tuple2(
					model,
					$author$project$Ui$Main$sendCode(model.code));
			case 'SetDelta':
				var delta = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{delta: delta}),
					$author$project$Ui$Main$sendDelta(delta));
			case 'SelectPreEx':
				var f = msg.a;
				return _Utils_Tuple2(
					model,
					$author$project$Ui$Main$sendFileName(f));
			case 'CatchGUIEvent':
				var _v6 = msg.a;
				var eventName = _v6.a;
				var args = _v6.b;
				var newModelRes = A3($author$project$Ui$Controller$guiEventController, eventName, args, model);
				if (newModelRes.$ === 'Ok') {
					var model1 = newModelRes.a;
					var _v8 = $author$project$Ui$Controller$printOutput(model1);
					var output = _v8.a;
					var model2 = _v8.b;
					return _Utils_Tuple2(
						model2,
						$author$project$Ui$Main$sendOutput(output));
				} else {
					var info = newModelRes.a;
					return _Utils_Tuple2(
						model,
						$author$project$Ui$Main$sendOutput(info));
				}
			case 'ChangeMode':
				var mode = msg.a;
				var model1 = _Utils_update(
					model,
					{
						eventIndex: $author$project$Ui$Model$defaultEventIndex,
						mode: mode,
						triggeredEvents: function () {
							if (mode.$ === 'EDITING') {
								var _v11 = model.triggeredEvents;
								if (_v11.b) {
									var _v12 = _v11.a;
									var exp = _v12.a;
									var tails = _v11.b;
									return A2(
										$elm$core$List$cons,
										_Utils_Tuple2(exp, $author$project$Syntax$DId),
										tails);
								} else {
									return _List_Nil;
								}
							} else {
								return model.triggeredEvents;
							}
						}()
					});
				var _v9 = $author$project$Ui$Controller$printOutput(model1);
				var output = _v9.a;
				var model2 = _v9.b;
				return _Utils_Tuple2(
					model2,
					$author$project$Ui$Main$sendOutput(output));
			default:
				var newEventIndexStr = msg.a;
				var newEventIndex = function () {
					var _v15 = $elm$core$String$toInt(newEventIndexStr);
					if (_v15.$ === 'Just') {
						var i = _v15.a;
						return i;
					} else {
						return model.eventIndex;
					}
				}();
				if (_Utils_cmp(
					newEventIndex,
					$elm$core$List$length(model.triggeredEvents)) > -1) {
					return _Utils_Tuple2(
						model,
						$author$project$Ui$Main$sendAlert('No more events!'));
				} else {
					if (newEventIndex < 0) {
						return _Utils_Tuple2(
							model,
							$author$project$Ui$Main$sendAlert('No more events!'));
					} else {
						var events = A2($elm$core$List$drop, newEventIndex, model.triggeredEvents);
						var modelPrevRes = A2(
							$author$project$Ui$Controller$runEventsFromScratch,
							model.code,
							$author$project$Ui$Controller$getEventsFromTriggeredEvents(events));
						if (modelPrevRes.$ === 'Ok') {
							var modelPrev = modelPrevRes.a;
							var _v14 = $author$project$Ui$Controller$printOutput(modelPrev);
							var tmpOutput = _v14.a;
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{eventIndex: newEventIndex}),
								$author$project$Ui$Main$sendOutput(tmpOutput));
						} else {
							var info = modelPrevRes.a;
							return _Utils_Tuple2(
								model,
								$author$project$Ui$Main$sendOutput(info));
						}
					}
				}
		}
	});
var $author$project$Ui$Model$Backward = {$: 'Backward'};
var $author$project$Ui$Model$BackwardPreview = {$: 'BackwardPreview'};
var $author$project$Ui$Model$BackwardPreviewRevert = {$: 'BackwardPreviewRevert'};
var $author$project$Ui$Model$ChangeEventIndex = function (a) {
	return {$: 'ChangeEventIndex', a: a};
};
var $author$project$Ui$Model$ChangeMode = function (a) {
	return {$: 'ChangeMode', a: a};
};
var $author$project$Ui$Model$EDITING = {$: 'EDITING'};
var $author$project$Ui$Model$SelectPreEx = function (a) {
	return {$: 'SelectPreEx', a: a};
};
var $elm$virtual_dom$VirtualDom$attribute = F2(
	function (key, value) {
		return A2(
			_VirtualDom_attribute,
			_VirtualDom_noOnOrFormAction(key),
			_VirtualDom_noJavaScriptOrHtmlUri(value));
	});
var $elm$html$Html$Attributes$attribute = $elm$virtual_dom$VirtualDom$attribute;
var $elm$html$Html$button = _VirtualDom_node('button');
var $elm$html$Html$Attributes$stringProperty = F2(
	function (key, string) {
		return A2(
			_VirtualDom_property,
			key,
			$elm$json$Json$Encode$string(string));
	});
var $elm$html$Html$Attributes$class = $elm$html$Html$Attributes$stringProperty('className');
var $elm$html$Html$div = _VirtualDom_node('div');
var $elm$html$Html$Attributes$id = $elm$html$Html$Attributes$stringProperty('id');
var $author$project$LangUtils$GUI$eventExpToStr = function (eventExp) {
	if ((eventExp.$ === 'ETuple') && (eventExp.b.$ === 'EventType')) {
		var _v1 = eventExp.b;
		var eventNameExpr = eventExp.c;
		return A3(
			$elm$core$String$replace,
			'\"',
			'',
			$author$project$Printer$Exp$print(eventNameExpr));
	} else {
		return 'Error #24: Unknown Event Exp, exp=' + $elm$core$Debug$toString(eventExp);
	}
};
var $elm$html$Html$option = _VirtualDom_node('option');
var $elm$json$Json$Encode$bool = _Json_wrap;
var $elm$html$Html$Attributes$boolProperty = F2(
	function (key, bool) {
		return A2(
			_VirtualDom_property,
			key,
			$elm$json$Json$Encode$bool(bool));
	});
var $elm$html$Html$Attributes$selected = $elm$html$Html$Attributes$boolProperty('selected');
var $elm$virtual_dom$VirtualDom$text = _VirtualDom_text;
var $elm$html$Html$text = $elm$virtual_dom$VirtualDom$text;
var $elm$html$Html$Attributes$value = $elm$html$Html$Attributes$stringProperty('value');
var $author$project$LangUtils$GUI$makeSelectListForEvents = F2(
	function (currentEventIndex, events) {
		return A2(
			$elm$core$List$indexedMap,
			F2(
				function (i, e) {
					var star = function () {
						var _v0 = e.b;
						if (_v0.$ === 'DZero') {
							return '';
						} else {
							return ' ⭐';
						}
					}();
					var indexStr = $elm$core$String$fromInt(i);
					var eventStr = $author$project$LangUtils$GUI$eventExpToStr(e.a);
					var t = _Utils_ap(eventStr, star);
					var attrList = _Utils_eq(i, currentEventIndex) ? _List_fromArray(
						[
							$elm$html$Html$Attributes$value(indexStr),
							$elm$html$Html$Attributes$selected(true)
						]) : _List_fromArray(
						[
							$elm$html$Html$Attributes$value(indexStr)
						]);
					return A2(
						$elm$html$Html$option,
						attrList,
						_List_fromArray(
							[
								$elm$html$Html$text(t)
							]));
				}),
			events);
	});
var $author$project$Ui$View$modeToStr = function (mode) {
	switch (mode.$) {
		case 'NotStart':
			return 'Not Start';
		case 'RUNNING':
			return 'Running';
		default:
			return 'Editing';
	}
};
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
var $elm$html$Html$Events$onMouseOut = function (msg) {
	return A2(
		$elm$html$Html$Events$on,
		'mouseout',
		$elm$json$Json$Decode$succeed(msg));
};
var $elm$html$Html$Events$onMouseOver = function (msg) {
	return A2(
		$elm$html$Html$Events$on,
		'mouseover',
		$elm$json$Json$Decode$succeed(msg));
};
var $elm$html$Html$select = _VirtualDom_node('select');
var $elm$html$Html$span = _VirtualDom_node('span');
var $elm$virtual_dom$VirtualDom$style = _VirtualDom_style;
var $elm$html$Html$Attributes$style = $elm$virtual_dom$VirtualDom$style;
var $author$project$Ui$View$view = function (model) {
	var runDisplayStr = _Utils_eq(model.mode, $author$project$Ui$Model$RUNNING) ? '' : 'none';
	var isEdit = _Utils_eq(model.mode, $author$project$Ui$Model$EDITING);
	var editDisplayStr = _Utils_eq(model.mode, $author$project$Ui$Model$EDITING) ? '' : 'none';
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$id('lazy-bi-eval')
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
								$elm$html$Html$text('Bi-DynDev')
							])),
						A2(
						$elm$html$Html$select,
						_List_fromArray(
							[
								$elm$html$Html$Events$onInput($author$project$Ui$Model$SelectPreEx),
								A2($elm$html$Html$Attributes$style, 'width', '100px'),
								$elm$html$Html$Attributes$class('btn')
							]),
						A2(
							$elm$core$List$map,
							function (s) {
								return A2(
									$elm$html$Html$option,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$value(s)
										]),
									_List_fromArray(
										[
											$elm$html$Html$text(s)
										]));
							},
							model.preExs)),
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('btn fwd'),
								$elm$html$Html$Attributes$id('run-program')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Run')
							])),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('text-block')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$span,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$id('mode-prompt')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Mode: ')
									])),
								A2(
								$elm$html$Html$span,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$id('mode')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text(
										$author$project$Ui$View$modeToStr(model.mode))
									]))
							])),
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('btn'),
								A2($elm$html$Html$Attributes$style, 'display', runDisplayStr),
								$elm$html$Html$Events$onClick(
								$author$project$Ui$Model$ChangeMode($author$project$Ui$Model$EDITING))
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('To Edit')
							])),
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('btn'),
								$elm$html$Html$Attributes$id('run'),
								A2($elm$html$Html$Attributes$style, 'display', editDisplayStr),
								$elm$html$Html$Events$onClick(
								$author$project$Ui$Model$ChangeMode($author$project$Ui$Model$RUNNING))
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('To Run')
							])),
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('btn'),
								$elm$html$Html$Attributes$id('revert-delta'),
								$elm$html$Html$Events$onClick(
								$author$project$Ui$Model$ChangeEventIndex('0')),
								A2($elm$html$Html$Attributes$style, 'display', editDisplayStr)
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Revert')
							])),
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('btn'),
								$elm$html$Html$Attributes$id('save-delta'),
								$elm$html$Html$Events$onClick($author$project$Ui$Model$Backward),
								$elm$html$Html$Events$onMouseOver($author$project$Ui$Model$BackwardPreview),
								$elm$html$Html$Events$onMouseOut($author$project$Ui$Model$BackwardPreviewRevert),
								A2($elm$html$Html$Attributes$style, 'display', editDisplayStr)
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Update Source')
							])),
						A2(
						$elm$html$Html$select,
						_List_fromArray(
							[
								$elm$html$Html$Events$onInput($author$project$Ui$Model$ChangeEventIndex),
								$elm$html$Html$Attributes$class('btn'),
								A2($elm$html$Html$Attributes$style, 'width', '125px'),
								A2($elm$html$Html$Attributes$style, 'display', editDisplayStr)
							]),
						A2($author$project$LangUtils$GUI$makeSelectListForEvents, model.eventIndex, model.triggeredEvents))
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$id('code-block')
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
								$elm$html$Html$text('Code Block')
							]))
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$id('output-block')
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
								$elm$html$Html$text('GUI Output')
							])),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$id('output-area'),
								A2(
								$elm$html$Html$Attributes$attribute,
								'mode',
								$author$project$Ui$View$modeToStr(model.mode))
							]),
						_List_Nil)
					]))
			]));
};
var $author$project$Ui$Main$main = $elm$browser$Browser$element(
	{init: $author$project$Ui$Main$init, subscriptions: $author$project$Ui$Main$subscriptions, update: $author$project$Ui$Main$update, view: $author$project$Ui$View$view});
_Platform_export({'Ui':{'Main':{'init':$author$project$Ui$Main$main(
	$elm$json$Json$Decode$succeed(_Utils_Tuple0))(0)}}});}(this));