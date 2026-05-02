function setOperationForDelete(target) {
    var deleteElm = document.createElement("li");
    deleteElm.classList.add("delete-element");

    deleteElm.textContent = "Delete";
    deleteElm.addEventListener("click", function() {
        var idx = Array.prototype.indexOf.call(target.parentElement.children, target);
        var d = `(delete ${idx})`;
        
        genDeleteDelta(target, d);
        target.remove();
    })

    editMenu.appendChild(deleteElm);
}

function genDeleteDelta(target, d) {
    var parent = target.parentElement;
    var parentDelta = htmlDelta(parent.tagName.toLowerCase(), idDelta, idDelta, d);

    propagateDelta(parent, parentDelta);
    editMenu.style.display = "none";
}