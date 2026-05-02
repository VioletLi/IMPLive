function setOperationsForStyleAttrs(target) {
    var inlineCSSAttrs = parseCss($(target));
    for (var i = 0; i < inlineCSSAttrs.length; i++) {
        var styleAttr = inlineCSSAttrs[i];
        var attrName = styleAttr[0];
        var attrValue = styleAttr[1];

        var styleAttrElm = document.createElement("li");
        var subMenu = document.createElement("ul");
        styleAttrElm.classList.add("px-type-style");
        styleAttrElm.textContent = "Style: " + attrName;
        subMenu.classList.add("sub-menu");

        if (intStyleList.includes(attrName)) {
            // branch 1: num type
            setOperationForIntStyleAttrs(target, subMenu, i, attrName, attrValue);
        } else if (colorTypeStyleList.includes(attrName)) {
            // branch 2: color
            setOperationForColorTypeStyleAttrs(target, subMenu, i, attrName, attrValue);
        } else {
           // branch 3: plain string
            setOperationForStrTypeStyleAttrs(target, subMenu, i, attrName, attrValue);
        }

        styleAttrElm.appendChild(subMenu);
        editMenu.appendChild(styleAttrElm);
    }
}

function setOperationForIntStyleAttrs(target, subMenu, i, attrName, attrValue) {
    var unit = getUnit(attrValue);

    // 1. create elements in sub menu
    var numDisplay = document.createElement("label");
    var numRange = document.createElement("input");
    numDisplay.classList.add("num-display");
    numRange.classList.add("num-range");
    
    // 2. init elements in sub menu
    numRange.type = "range";
    numRange.min = 0;
    numRange.max = getMaxRange(attrName);
    numRange.value = parseInt(attrValue.replace(unit, ''), 10);
    numRange.setAttribute("oldValue", numRange.value);
    numDisplay.textContent = attrValue;

    // 3. bind event handler for input & mouseleave
    numRange.addEventListener("input", function(localNumRange, localNumDisplay, localUnit) {
        return function() {
            var newValue = localNumRange.value + localUnit;
            localNumDisplay.textContent = newValue;
            target.style[attrName] = newValue;
        }
    }(numRange, numDisplay, unit));
    numRange.addEventListener("mouseleave", function(index, localNumRange) {
        return function() {
            var oldValue = localNumRange.getAttribute("oldValue");
            var newValue = localNumRange.value;
            var diff = newValue - oldValue;
            
            var d;
            if (diff === 0) d = idDelta;
            else d = `(${idDelta}, +${diff})`;
            genStyleDelta(target, index, d);

            localNumRange.setAttribute("oldValue", localNumRange.value);
        }
    }(i, numRange));

    // 4. append them to sub menu
    subMenu.appendChild(numDisplay);
    subMenu.append(numRange);
}

function setOperationForColorTypeStyleAttrs(target, subMenu, i, attrName, attrValue) {
    // 1. create element in sub menu
    var colorPicker = document.createElement("input");
    colorPicker.classList.add("color-picker");
    
    // 2. init element in sub menu
    colorPicker.type = "color";
    colorPicker.value = rgbToHex(attrValue);
    colorPicker.setAttribute("oldValue", colorPicker.value);

    // 3. bind event handler for input & mouseleave
    colorPicker.addEventListener("input", function(localColorPicker) {
        return function() {
            var newValue = hexToRgb(localColorPicker.value);
            target.style[attrName] = newValue;
        }
    }(colorPicker));
    colorPicker.addEventListener("blur", function(index, localColorPicker) {
        return function() {
            var oldValue = hexToRgb(localColorPicker.getAttribute("oldValue"));
            var newValue = hexToRgb(localColorPicker.value);
            var diff = rgbDiff(oldValue, newValue);

            var d;
            if (diff === 0) d = idDelta;
            else d = `(${idDelta}, +${diff})`;
            genStyleDelta(target, index, d);

            localColorPicker.setAttribute("oldValue", localColorPicker.value);
        }
    }(i, colorPicker));
    
    // 4. append it to sub menu
    subMenu.appendChild(colorPicker);
}

function setOperationForStrTypeStyleAttrs(target, subMenu, i, attrName, attrValue) {
    // 1. create element in sub menu
    var strInput = document.createElement("input");
    strInput.classList.add("str-input");

    // 2. init element in sub menu
    strInput.value = attrValue;
    strInput.setAttribute("oldValue", strInput.value);

    // 3. bind event handler for input & mouseleave
    strInput.addEventListener("input", function(localStrInput) {
        return function() {
            var newValue = localStrInput.value;
            target.style[attrName] = newValue;
        }
    }(strInput));
    strInput.addEventListener("mouseleave", function(index, localStrInput) {
        return function() {
            var oldValue = localStrInput.getAttribute("oldValue");
            var newValue = localStrInput.value;

            var d;
            if (oldValue === newValue) d = idDelta;
            else d = `(${idDelta}, ("${oldValue}"=>"${newValue}"))`;
            genStyleDelta(target, index, d);

            localStrInput.setAttribute("oldValue", localStrInput.value);
        }
    }(i, strInput));

    // 4. append it to sub menu
    subMenu.appendChild(strInput);
}


/**
 * 
 * @param {*} element 
 * @param {*} attrIndex 
 * @param {*} d 
 * Generate delta according to one style change to DOM element
 */
function genStyleDelta(element, attrIndex, d) {
    var styleDelta = consDelta(d, idDelta);
    for (var i = 0; i < attrIndex; i++) styleDelta = consDelta(idDelta, styleDelta);
    var eleDelta = htmlDelta(element.tagName.toLowerCase(), styleDelta, idDelta, idDelta);

    propagateDelta(element, eleDelta);
}