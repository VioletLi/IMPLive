function setOperationForInsert(target) {
    var insertElm = document.createElement("li");
    insertElm.classList.add("insert-element");

    insertElm.textContent = "Insert Before";
    
    insertElementHelper(target, insertElm, genInsertDelta, insertToBefore);

    editMenu.appendChild(insertElm);
}

function setOperationForAppendChild(target) {
    if (!isPrimitiveSpanContent(target)) {
        var appendChildElm = document.createElement("li");
        appendChildElm.classList.add("append-child-element");
    
        appendChildElm.textContent = "Append Child";
    
        insertElementHelper(target, appendChildElm, genAppendChildDelta, appendChild)
        
        editMenu.append(appendChildElm);
    }
}

function insertElementHelper(target, elm, genDeltaFunc, insertFunc) {
    var subMenu = document.createElement("ul");
    subMenu.classList.add("sub-menu");

    /* generate form for DOM element  */ 
    genTagNameItem(subMenu);
    genStyleItems(subMenu);
    genAttrItems(subMenu);
    genContentItem(subMenu);

    subMenu.addEventListener("mouseleave", function(t) {
        return function() {
            var insertedElement = document.createElement("div");
            var tagName = "";
            var styleList = [];
            var attrList = [];
            var content = "";

            for (var child of subMenu.children) {
                var type = child.getAttribute("type");

                if (type === "tagName") {
                    tagName = child.children[1].value.toLowerCase();
                    if (tagName !== "") {
                        insertedElement = document.createElement(tagName);
                    }

                } else if (type === "style") {
                    var styleAttrName = child.children[1].value;
                    var styleAttrValue = child.children[2].value;

                    if (styleAttrName !== "" && styleAttrValue !== "") {
                        insertedElement.style[styleAttrName] = styleAttrValue;
                        styleList.push([styleAttrName, transformStyleAttrValue(styleAttrName, styleAttrValue)]);
                    }
                    
                } else if (type === "attr") {
                    var attrName = child.children[1].value;
                    var attrValue = child.children[2].value;

                    if (attrName !== "" && attrValue !== "") {
                        insertedElement.setAttribute(attrName, attrValue);
                        attrList.push([attrName, attrValue]);
                    }
                } else if (type === "content") {
                    content = child.children[1].value;
                    if (content !== "") {
                        insertedElement.textContent = content;
                    }
                }
            }
            
            console.log(insertedElement);

            if (tagName !== "") {
                // construct inserted html string
                var styleStr = "";
                var attrStr = "";
                var contentStr = "";
                for (var styleAttr of styleList) {
                    var name = styleAttr[0];
                    var value = styleAttr[1];
                    if (typeof value !== "string") {
                        styleStr += `, ("${name}", ${value})`;
                    } else {
                        styleStr += `, ("${name}", "${value}")`;
                    }
                }

                for (var attr of attrList) {
                    var name = attr[0];
                    var value = attr[1];
                    attrStr += `, ("${name}", "${value}")`
                }

                if (content !== "") contentStr = `"${content}"`;

                var insertedValue = `Html.${tagName} [${styleStr.substring(2)}] [${attrStr.substring(2)}] [${contentStr}]`;

                // insert it
                genDeltaFunc(t, insertedValue);
                insertFunc(t, insertedElement);
            }
        }
    }(target));
    
    elm.appendChild(subMenu);
}

function genTagNameItem(subMenu) {
    var tagNameLi = document.createElement("li");
    var tagNameLabel = document.createElement("label");
    var tagNameInput = document.createElement("input");

    tagNameLi.setAttribute("type", "tagName");
    tagNameLabel.textContent = "Tag Name: ";

    tagNameLi.appendChild(tagNameLabel);
    tagNameLi.appendChild(tagNameInput);

    subMenu.appendChild(tagNameLi);
}

function genStyleItems(subMenu) {
    var styleLi = document.createElement("li");
    var styleLabel = document.createElement("label");
    var styleNameInput = document.createElement("input");
    var styleValueInput = document.createElement("input");
    var styleAddInput = document.createElement("button");

    styleLi.setAttribute("type", "style");
    styleLabel.textContent = "Style: ";
    styleNameInput.placeholder = "name";
    styleValueInput.placeholder = "value"
    styleAddInput.textContent = "+";
    
    styleAddInput.addEventListener("click", copyLiToAfterHandler);

    styleLi.appendChild(styleLabel);
    styleLi.appendChild(styleNameInput);
    styleLi.appendChild(styleValueInput);
    styleLi.appendChild(styleAddInput);

    subMenu.appendChild(styleLi);
}

function genAttrItems(subMenu) {
    var attrLi = document.createElement("li");
    var attrLabel = document.createElement("label");
    var attrNameInput = document.createElement("input");
    var attrValueInput = document.createElement("input");
    var attrAddInput = document.createElement("button");

    attrLi.setAttribute("type", "attr");
    attrLabel.textContent = "Attr: ";
    attrNameInput.placeholder = "name";
    attrValueInput.placeholder = "value"
    attrAddInput.textContent = "+";
    
    attrAddInput.addEventListener("click", copyLiToAfterHandler);

    attrLi.appendChild(attrLabel);
    attrLi.appendChild(attrNameInput);
    attrLi.appendChild(attrValueInput);
    attrLi.appendChild(attrAddInput);

    subMenu.appendChild(attrLi);
}

function genContentItem(subMenu) {
    var contentLi = document.createElement("li");
    var contentLabel = document.createElement("label");
    var contentInput = document.createElement("input");

    contentLi.setAttribute("type", "content");
    contentLabel.textContent = "Content: ";

    contentLi.appendChild(contentLabel);
    contentLi.appendChild(contentInput);

    subMenu.appendChild(contentLi);
}

function copyLiToAfterHandler(event) {
    var target = event.target;
    var parent = target.parentElement;

    var clonedElement = parent.cloneNode(true);
    clonedElement.children[3].addEventListener("click", copyLiToAfterHandler);

    if (parent.parentElement) {
        parent.after(clonedElement);
    }
}

function genInsertDelta(target, value) {
    var parent = target.parentElement;

    var targetIdx = Array.prototype.indexOf.call(parent.children, target);
    var childrenDelta = `(insert ${targetIdx} ${value})`;

    var parentDelta = htmlDelta(parent.tagName.toLowerCase(), idDelta, idDelta, childrenDelta);

    propagateDelta(parent, parentDelta);
}

function genAppendChildDelta(target, value) {
    console.log(value);
    var childIdx = target.children.length;
    var childrenDelta = `(insert ${childIdx} ${value})`;
    var targetDelta = htmlDelta(target.tagName.toLowerCase(), idDelta, idDelta, childrenDelta);

    propagateDelta(target, targetDelta);
}

function insertToBefore(target, dom) {
    if (target.parentElement) {
        target.parentElement.insertBefore(dom, target);
    }
}

function appendChild(target, dom) {
    target.appendChild(dom);
}