function eventForward(htmlEventName, eventName, event) {
    var element = event.currentTarget; 

    var args = [];
    var value = element.value;

    if (value) args.push(value);
    
    for (var i = 0; i < element.attributes.length; i++) {
        var attr = element.attributes[i];
        if (attr.name.startsWith("arg")) args.push(attr.value);
    }

    if (htmlEventName === "onsubmit") {
        formData = new FormData(element);
        for (var [key, value] of formData.entries()) {
            args.push(value);
        }
    }

    // console.log(event);
    // console.log(htmlEventName);
    // console.log(eventName);
    // console.log(element);
    // console.log(args);

    if (htmlEventName !== "onkeypress" || event.keyCode == 13) {
        app.ports.receiveGUIEvent.send([eventName, args]);
    }
}