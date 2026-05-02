var outputBlock = document.getElementById("output-block");
var outputArea = document.getElementById("output-area");
var output;

app.ports.sendOutput.subscribe(function(message) {
    var el = document.createElement('div');
    el.innerHTML = message;
    
    output = el.innerHTML
    outputArea.innerHTML = message;

    setGlobalDelta(idDelta);

    outputBlock.appendChild(editMenu);
});

app.ports.sendDelta.subscribe(function(message) {
    delta = message;
    // deltaTextarea.value = delta;

    if (delta !== idDelta) {
        enode.style.setProperty('border', '2px dashed red');
        
        changePointerEventsToNone(runBtn);
        resetPointerEvents(saveDeltaBtn);
        resetPointerEvents(revertDeltaBtn);
    } else {
        enode.style.setProperty('border', 'none');

        resetPointerEvents(runBtn);
        changePointerEventsToNone(saveDeltaBtn);
        changePointerEventsToNone(revertDeltaBtn);
    }
})


/**
 * Prevent events at capture period.
 * 
 * Prevent user defined events on Editing Mode;
 * Prevent event of generating delta menu ("contextmenu");
 */

editModeAllowedEvents.forEach(function(eventName) {
    outputArea.addEventListener(eventName, isEditMode, true);
});

allEvents.forEach(function(eventName) {
    if (!editModeAllowedEvents.includes(eventName)) {
        outputArea.addEventListener(eventName, isRunMode, true);
    }
})

function isEditMode(event) {
    if (outputArea.getAttribute("mode") !== editMode) {
        event.stopImmediatePropagation();
        event.preventDefault();
    }
}

function isRunMode(event) {
    if (outputArea.getAttribute("mode") !== runMode) {
        event.stopImmediatePropagation();
        event.preventDefault();
    }
}

revertDeltaBtn.addEventListener("click", function() {
    setGlobalDelta(idDelta);
});