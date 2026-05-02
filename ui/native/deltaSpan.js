function setOperationForPrimitiveSpanContent(target) {
    if (isPrimitiveSpanContent(target)) {
        var contentType = target.className;
        var content = target.textContent;

        var spanContentElm = document.createElement("li");
        var subMenu = document.createElement("ul");
        spanContentElm.classList.add("primitive-span-content");
        spanContentElm.textContent =  "Content: " + contentType + " type";
        subMenu.classList.add("sub-menu");

        if (contentType === "int") {
            setOperationForIntSpanContent(target, content, subMenu);
        } else if (contentType === "str") {
            setOperationForStrSpanContent(target, content, subMenu);
        }

        spanContentElm.appendChild(subMenu);
        editMenu.appendChild(spanContentElm);
    }
}

function setOperationForIntSpanContent(target, content, subMenu) {
    // 1. create element in sub menu
    var intRange = document.createElement("input");

    // 2. init element in sub menu
    intRange.type = "range";
    intRange.min = -1000000;
    intRange.max = 1000000;
    intRange.value = parseInt(content, 10);
    intRange.setAttribute("oldValue", content);

    // 3. bind event handler for input & mouseleave
    intRange.addEventListener("input", function(localIntRange){
        return function() {
            target.textContent = localIntRange.value.toString(); 
        };
    }(intRange));
    intRange.addEventListener("mouseleave", function(localIntRange) {
        return function() {
            var newValue = localIntRange.value;
            var oldValue = localIntRange.getAttribute("oldValue");
            var diff = newValue - oldValue;
                                    
            var d;
            if (diff === 0) d = idDelta;
            else d = `(+${diff})`;
            genPrimitiveSpanDelta(target, d);

            localIntRange.setAttribute("oldValue", newValue);
        }
    }(intRange));

    // 4. append it to sub menu
    subMenu.appendChild(intRange);
}

function setOperationForStrSpanContent(target, content, subMenu) {
    // 1. create element in sub menu
    var strInput = document.createElement("input");

    // 2. init element in sub menu
    strInput.value = content;
    strInput.setAttribute("oldValue", strInput.value);

    // 3. bind event handler for input & mouseleave
    strInput.addEventListener("input", function(localStrInput) {
        return function() {
            var newValue = localStrInput.value;
            target.textContent = newValue;
        }
    }(strInput));
    strInput.addEventListener("mouseleave", function(localStrInput) {
        return function() {
            var oldValue = localStrInput.getAttribute("oldValue");
            var newValue = localStrInput.value;

            var d;
            if (oldValue === newValue) d = idDelta;
            else d = `("${oldValue}"=>"${newValue}")`;
            genPrimitiveSpanDelta(target, d);

            localStrInput.setAttribute("oldValue", localStrInput.value);
        }
    }(strInput));

    // 4. append it to sub menu
    subMenu.appendChild(strInput);
}

function genPrimitiveSpanDelta(element, d) {
    propagateDelta(element, d);
}