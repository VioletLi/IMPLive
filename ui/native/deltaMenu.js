var editMenu = document.createElement("ul");
editMenu.classList.add("menu"); 
editMenu.style.position = "fixed";
editMenu.style.display = "none";

setMenu(outputArea);

/**
 * 
 * @param {} element 
 * Generate menu content for:
 * 1. Every style attributes (num type, color type, string type)
 * 2. Primitive Span Content (int, string)
 * 3. ...
 */
function setMenu(element) {
    element.addEventListener("contextmenu", function(event) {
        event.preventDefault();

        if (editMenu.style.display === "none") {
            var pageWidth = document.documentElement.clientWidth || document.body.clientWidth;
            var maxLeft = pageWidth - 400;
            var menuLeft = Math.min(event.pageX, maxLeft);

            editMenu.style.left = menuLeft + "px";
            editMenu.style.top = event.pageY + "px";
            editMenu.innerHTML = "";

            var target = event.target;

            if (target !== outputArea) {
                // 1. Style Attrs
                setOperationsForStyleAttrs(target);

                // 2. Delete
                setOperationForDelete(target);

                // 3. insert before
                setOperationForInsert(target);

                // 4. append child 
                setOperationForAppendChild(target);

                // 5. Primitive Span Content (int, string)
                setOperationForPrimitiveSpanContent(target);
            } else {
                // default delta block
                setOperationForDelta(target);
            }

            if (editMenu.innerHTML != "") editMenu.style.display = "block";
            else editMenu.style.display = "none";
        } else {
            editMenu.style.display = "none";
        }

        // console.log(editMenu.style.display);
        // console.log(editMenu);
        // console.log(editMenu.style.top);
        // console.log(editMenu.style.left);
    })
}

function setOperationForDelta(target) {
    if (!target.children.length) {
        var deltaElm = document.createElement("li");
        var subMenu = document.createElement("ul");
        deltaElm.classList.add("delta");
        deltaElm.textContent = "Input the Delta";
        subMenu.classList.add("sub-menu");
    
        // 1. create element in sub menu
        var deltaInput = document.createElement("input");
    
        // 2. init element in sub menu
        deltaInput.value = delta;
    
        // 3. bind event handler for mouseleave
        deltaInput.addEventListener("mouseleave", function() {
            setGlobalDelta(deltaInput.value);
        });
    
        // 4. append it to sub menu
        subMenu.appendChild(deltaInput);
    
        deltaElm.appendChild(subMenu);
        editMenu.appendChild(deltaElm);
    }
}