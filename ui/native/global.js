/**
 * Constants
 */

const pxTypeStyleList = 
    [ "width", "height", 
    , "top", "bottom", "left", "right"
    , "margin", "marginTop", "marginBottom", "marginLeft", "marginRight"
    , "padding", "paddingTop", "paddingBottom", "paddingLeft", "paddingRight"
    , "borderRadius"
    , "borderWidth", "borderTopWidth", "borderBottomWidth", "borderLeftWidth", "borderRightWidth" 
    , "fontSize", 
    ]

const intTypeStyleList =
    [ "zIndex", "fontWeight", "lineHeight" ]

const intStyleList = [...pxTypeStyleList, ...intTypeStyleList]

const colorTypeStyleList = 
    [ "backgroundColor", "color" ]

const editModeAllowedEvents = ['contextmenu'];
const allEvents = [
    'click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mousemove',
    'mouseout', 'mouseenter', 'mouseleave', 'keydown', 'keypress', 'keyup',
    'contextmenu', 'wheel', 'scroll', 'resize', 'focus', 'blur', 'change',
    'input', 'submit', 'reset', 'select', 'focusin', 'focusout', 'touchstart',
    'touchend', 'touchmove', 'touchcancel', 'pointerdown', 'pointerup',
    'pointermove', 'pointerover', 'pointerout', 'pointerenter', 'pointerleave'
];

const notStartMode = "Not Start";
const runMode = "Running";
const editMode = "Editing";

const primitiveSpanClass = ["int", "str"];

const idDelta = "id";

/**
 * Variables
 */
var delta = idDelta;

// var deltaTextarea = document.getElementById("delta-textarea");

var runBtn = document.getElementById("run");
var saveDeltaBtn = document.getElementById("save-delta");
var revertDeltaBtn = document.getElementById("revert-delta");

/**
 * Functions
 */

function parseCss(el) {
    var output = [];

    if (!el || !el.attr('style')) {
        return output;
    }

    var camelize = function camelize(str) {
        return str.replace(/(?:^|[-])(\w)/g, function(a, c) {
            c = a.substr(0, 1) === '-' ? c.toUpperCase() : c;
            return c ? c : '';
        });
    }

    var style = el.attr('style').split(';');
    for (var i = 0; i < style.length; ++i) {
        var rule = style[i].trim();
        if (rule) {
            var ruleParts = rule.split(':');
            var key = camelize(ruleParts[0].trim());
            var val = ruleParts[1].trim();
            output.push([key, val]);
        }
    }

    return output;
}

function hexToRgb(hex) {
    hex = hex.replace('#', '').toUpperCase();

    var r = parseInt(hex.substring(0, 2), 16); 
    var g = parseInt(hex.substring(2, 4), 16); 
    var b = parseInt(hex.substring(4, 6), 16); 

    return 'rgb(' + r + ' ' + g + ' ' + b + ')';
}

function rgbToHex(rgbString) {
    var rgb = getRGB(rgbString);

    var hexR = rgb[0].toString(16).padStart(2, '0');
    var hexG = rgb[1].toString(16).padStart(2, '0');
    var hexB = rgb[2].toString(16).padStart(2, '0');

    return '#' + hexR + hexG + hexB;
}

function rgbDiff(oldv, newv) {
    var oldRGB = getRGB(oldv);
    var newRGB = getRGB(newv);

    return getRGBInt(newRGB[0], newRGB[1], newRGB[2]) - getRGBInt(oldRGB[0], oldRGB[1], oldRGB[2]);
}

function getRGB(rgbStr) {
    var rgbValues = rgbStr.replace('rgb(', '').replace(')', '').split(' ');

    var r = parseInt(rgbValues[0], 10);
    var g = parseInt(rgbValues[1], 10);
    var b = parseInt(rgbValues[2], 10);

    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));

    return [r, g, b];
}

function getRGBInt(r, g, b) {
    return r * 1000000 + g * 1000 + b;
}

function composeDelta(d1, d2) {
    if (d1 === idDelta) return d2;
    else if (d2 === idDelta) return d1;
    else return `${d2};\n${d1}`;
}

function consDelta(dh, dt) {
    if (dh === idDelta && dt === idDelta) return idDelta;
    else return `${dh}::${dt}`;
}

function htmlDelta(tag, ds, da, dc) {
    if (ds === idDelta && da === idDelta && dc === idDelta) 
        return idDelta;
    else 
        return `(Html.${tag} ${ds} ${da} ${dc})`;
}

function setGlobalDelta(d) {
    delta = d;
    // deltaTextarea.value = delta;
    app.ports.receiveDelta.send(delta);

    if (delta !== idDelta) {
        enode.style.setProperty('border', '2px dashed red');
        
        changePointerEventsToNone(runBtn);
        resetPointerEvents(saveDeltaBtn);
        resetPointerEvents(revertDeltaBtn);
    } else {
        enode.style.setProperty('border', 'none');
        editMenu.style.display = "none";

        resetPointerEvents(runBtn);
        changePointerEventsToNone(saveDeltaBtn);
        changePointerEventsToNone(revertDeltaBtn);
    }
}

function propagateDelta(element, eleDelta) {
    var parent = element.parentElement;
    var child = element;
    var guiDelta = eleDelta;

    while (parent != outputArea) {
        var childIndex = Array.prototype.indexOf.call(parent.children, child);
        
        var childrenDelta = consDelta(guiDelta, idDelta);
        for (var i = 0; i < childIndex; i++) childrenDelta = consDelta(idDelta, childrenDelta);
        
        guiDelta = htmlDelta(parent.tagName.toLowerCase(), idDelta, idDelta, childrenDelta);

        var tmp = parent;
        parent = parent.parentElement;
        child = tmp;
    }

    var globalDelta = composeDelta(delta, guiDelta);
    setGlobalDelta(globalDelta);
}

function getUnit(val) {
    var matches = val.match(/^(\d+)(.*)/);
    var unit = "";

    if (matches && matches.length >= 3) {
        unit = matches[2]; 
    }
    return unit;
}

function isPrimitiveSpanContent(element) {
    var cls = element.className;
    return element.tagName === "SPAN" && primitiveSpanClass.includes(cls);
} 

function getMaxRange(attrName) {
    if (attrName === "fontWeight") return 1000;
    else if (attrName === "width") return 400;
    else if (attrName === "height") return 250;
    return 50;
}

function changePointerEventsToNone(el) {
    el.style.pointerEvents = "none";
    el.classList.add("btn-pointer-events-none");
}

function resetPointerEvents(el) {
    el.style.pointerEvents = "auto";
    el.classList.remove("btn-pointer-events-none");
}

function transformStyleAttrValue(name, value) {
    var camelCaseName = kebabToCamelCase(name);
    if (intStyleList.includes(camelCaseName)) {
        return parseInt(value);
    } else if (colorTypeStyleList.includes(camelCaseName)) {
        var rgb = getRGB(value);
        return getRGBInt(rgb[0], rgb[1], rgb[2]);
    } else {
        return value;
    }
}

function kebabToCamelCase(str) {
    return str.replace(/-(\w)/g, function(match, letter) {
        return letter.toUpperCase();
    });
  }