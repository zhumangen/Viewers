// TODO: Remove this polyfill after replacing e.which for e.buttons for MouseEvent objects
// Pull request: https://github.com/chafey/cornerstoneTools/pull/227

(function(window) {
    try {
        new MouseEvent('test');
        return false; // No need to polyfill
    } catch (e) {
        // Need to polyfill - fall through
    }

    // Polyfills DOM4 MouseEvent
    const MouseEvent2 = function(eventType, params) {
        params = params || {
            bubbles: false,
            cancelable: false
        };
        const mouseEvent = document.createEvent('MouseEvent');
        mouseEvent.initMouseEvent(
            eventType,
            params.bubbles,
            params.cancelable,
            window,
            0,
            params.screenX || 0,
            params.screenY || 0,
            params.clientX || 0,
            params.clientY || 0,
            typeof params.ctrlKey !== 'undefined' ? params.ctrlKey : false,
            typeof params.altKey !== 'undefined' ? params.altKey : false,
            typeof params.shiftKey !== 'undefined' ? params.shiftKey : false,
            typeof params.metaKey !== 'undefined' ? params.metaKey : false,
            params.button || 0,
            params.relatedTarget || null
        );

        return mouseEvent;
    };

    MouseEvent2.prototype = Event.prototype;

    window.MouseEvent = MouseEvent2;
})(window);

window.addEventListener('mousemove', event => {
    if (event.___preventReRun) return;
    event.stopPropagation();
    event.preventDefault();

    let newEvent = new MouseEvent('mousemove', event);

    newEvent.___preventReRun = true;
    Object.defineProperties(newEvent, {
        which: { value: 0 },
        clientX: { value: event.clientX },
        clientY: { value: event.clientY },
        screenX: { value: event.screenX },
        screenY: { value: event.screenY },
        pageX: { value: event.pageX },
        pageY: { value: event.pageY }
    });

    event.target.dispatchEvent(newEvent);
}, true);
