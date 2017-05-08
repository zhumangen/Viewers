(function($, cornerstone, cornerstoneTools) {

    'use strict';

    const toolType = 'multiStackPrefetch';
    const requestType = 'prefetch';
    const elements = [];

    let configuration = {};
    const resetPrefetchDelay = 300;

    let resetPrefetchTimeout;

    function isPrefetchEnabled(element) {
        return elements.indexOf(element) !== -1;
    }

    function isElementEnabled(element) {
        const enabledElements = cornerstone.getEnabledElements();
        return enabledElements.indexOf(element) !== -1;
    }

    function sortNumber(a, b) {
        return a - b;
    }

    function range(lowEnd, highEnd) {
        // Javascript version of Python's range function
        // http://stackoverflow.com/questions/3895478/does-javascript-have-a-method-like-range-to-generate-an-array-based-on-suppl
        lowEnd = Math.round(lowEnd) || 0;
        highEnd = Math.round(highEnd) || 0;

        let arr = [],
            c = highEnd - lowEnd + 1;

        if (c <= 0) {
            return arr;
        }

        while ( c-- ) {
            arr[c] = highEnd--;
        }

        return arr;
    }

    const max = function(arr) {
        return Math.max.apply(null, arr);
    };

    const min = function(arr) {
        return Math.min.apply(null, arr);
    };

    function nearestIndex(arr, x) {
        // Return index of nearest values in array
        // http://stackoverflow.com/questions/25854212/return-index-of-nearest-values-in-an-array
        const l = [],
              h = [];

        arr.forEach(function(v) {
            if (v < x) {
                l.push(v);
            } else if (v > x) {
                h.push(v);
            }
        });

        return {
            low: arr.indexOf(max(l)),
            high: arr.indexOf(min(h))
        };
    }

    // Remove an imageIdIndex from the list of indices to request
    // This fires when the individual image loading deferred is resolved
    function removeFromList(stackPrefetch, imageIdIndex) {
        const index = stackPrefetch.indicesToRequest.indexOf(imageIdIndex);
        if (index > -1) { // don't remove last element if imageIdIndex not found
            stackPrefetch.indicesToRequest.splice(index, 1);
        }
    }

    function removeResolvedImageIdIndexes(stack, stackPrefetch) {
        // Remove all already cached images from the
        // indicesToRequest array
        stackPrefetch.indicesToRequest.sort(sortNumber);
        const indicesToRequestCopy = stackPrefetch.indicesToRequest.slice();

        indicesToRequestCopy.forEach(function(imageIdIndex) {
            const imageId = stack.imageIds[imageIdIndex];

            if (!imageId) {
                return;
            }

            const imagePromise = cornerstone.imageCache.getImagePromise(imageId);
            if (imagePromise && imagePromise.state() === 'resolved'){
                removeFromList(stackPrefetch, imageIdIndex);
            }
        });
    }

    function getDoneCallback(stack, stackPrefetch) {
        return function(image) {
            const imageIdIndex = stack.imageIds.indexOf(image.imageId);
            removeFromList(stackPrefetch, imageIdIndex);
        }
    }

    function getFailCallback(element, imageId) {
        return function(error) {
            // Retrieve the errorLoadingHandler if one exists
            const errorLoadingHandler = cornerstoneTools.loadHandlerManager.getErrorLoadingHandler();

            console.log('prefetch errored: ' + error);
            if (errorLoadingHandler) {
                errorLoadingHandler(element, imageId, error, 'multiStackPrefetch');
            }
        }
    }

    function getImageIdsData(element) {
        // Check to make sure stack data exists
        const stackToolState = cornerstoneTools.getToolState(element, 'stack');
        if (!stackToolState || !stackToolState.data || !stackToolState.data.length) {
            return;
        }

        const stack = stackToolState.data[0];

        // Get the stackPrefetch tool data
        const stackPrefetchToolState = cornerstoneTools.getToolState(element, toolType);
        if (!stackPrefetchToolState) {
            return;
        }

        const stackPrefetch = stackPrefetchToolState.data[0];

        // If all the requests are complete, disable the stackPrefetch tool
        if (!stackPrefetch || !stackPrefetch.indicesToRequest || !stackPrefetch.indicesToRequest.length) {
            stackPrefetch.enabled = false;
        }

        // Make sure the tool is still enabled
        if (stackPrefetch.enabled === false) {
            return;
        }

        removeResolvedImageIdIndexes(stack, stackPrefetch);

        // Stop here if there are no images left to request
        // After those in the cache have been removed
        if (!stackPrefetch.indicesToRequest.length) {
            return;
        }

        // Identify the nearest imageIdIndex to the currentImageIdIndex
        const nearest = nearestIndex(stackPrefetch.indicesToRequest, stack.currentImageIdIndex);

        let imageId,
            nextImageIdIndex,
            preventCache = false,
            imageIdsData = [];

        // Prefetch images around the current image (before and after)
        let lowerIndex = nearest.low;
        let higherIndex = nearest.high;
        while (lowerIndex > 0 || higherIndex < stackPrefetch.indicesToRequest.length) {
            if (lowerIndex >= 0 ) {
                nextImageIdIndex = stackPrefetch.indicesToRequest[lowerIndex--];
                imageId = stack.imageIds[nextImageIdIndex];
                imageIdsData.push({
                    imageId,
                    stack,
                    stackPrefetch
                });
            }

            if (higherIndex < stackPrefetch.indicesToRequest.length) {
                nextImageIdIndex = stackPrefetch.indicesToRequest[higherIndex++];
                imageId = stack.imageIds[nextImageIdIndex];
                imageIdsData.push({
                    imageId,
                    element,
                    stack,
                    stackPrefetch
                });
            }
        }

        return imageIdsData;
    }

    function mergeImageIdsData(imageIdsDataList) {
        const mergedImageIdsDataList = [];
        let maxLength = 0;

        // Get the length of the largest array of imageIdsData
        for (let i = 0; i < imageIdsDataList.length; i++) {
            maxLength = Math.max(maxLength, imageIdsDataList[i].length);
        }

        // Iterate through all arrays getting the n-th item from each one (merge sort)
        for(i = 0; i < maxLength; i++) {
            for(j = 0; j < imageIdsDataList.length; j++) {
                const imageIdsData = imageIdsDataList[j];

                if (i < imageIdsData.length) {
                    mergedImageIdsDataList.push(imageIdsData[i]);
                }
            }
        }

        return mergedImageIdsDataList;
    }

    function updateRequestPoolManager(imageIdsData) {
        const requestPoolManager = cornerstoneTools.requestPoolManager;
        const imageIdsDataLength = imageIdsData.length;

        // Clear the requestPool of prefetch requests
        requestPoolManager.clearRequestStack(requestType);

        for (let i = 0; i < imageIdsDataLength; i++) {
            const preventCache = false;
            const imageIdData = imageIdsData[i];
            const imageId = imageIdData.imageId;
            const element = imageIdData.element;
            const doneCallback = getDoneCallback(imageIdData.stack, imageIdData.stackPrefetch);
            const failCallback = getFailCallback(element, imageId);

            requestPoolManager.addRequest(element, imageId, requestType, preventCache, doneCallback, failCallback);
        }

        // Try to start the requestPool's grabbing procedure
        // in case it isn't already running
        requestPoolManager.startGrabbing();
    }

    function prefetch() {
        const imageIdsDataList = [];

        if (!elements.length) {
            return;
        }

        elements.forEach(function(element) {
            const imageIdsData = getImageIdsData(element);

            if (imageIdsData && imageIdsData.length) {
                imageIdsDataList.push(imageIdsData);
            }

            console.log('>>>>> imageIdsData: ', imageIdsData);
        });

        if (!imageIdsDataList.length) {
            return;
        }

        const mergedImageIdsData = mergeImageIdsData(imageIdsDataList);

        updateRequestPoolManager(mergedImageIdsData);
    };

    function prefetchBkp() {
        // // Clear the requestPool of prefetch requests
        // const requestPoolManager = cornerstoneTools.requestPoolManager;
        // requestPoolManager.clearRequestStack(requestType);

        // // Identify the nearest imageIdIndex to the currentImageIdIndex
        // const nearest = nearestIndex(stackPrefetch.indicesToRequest, stack.currentImageIdIndex);

        // const imageId,
        //     nextImageIdIndex,
        //     preventCache = false;

        // function doneCallback(image) {
        //     //console.log('prefetch done: ' + image.imageId);
        //     const imageIdIndex = stack.imageIds.indexOf(image.imageId);
        //     removeFromList(imageIdIndex);
        // }

        // // Retrieve the errorLoadingHandler if one exists
        // const errorLoadingHandler = cornerstoneTools.loadHandlerManager.getErrorLoadingHandler();

        // function failCallback(error) {
        //     console.log('prefetch errored: ' + error);
        //     if (errorLoadingHandler) {
        //         errorLoadingHandler(element, imageId, error, 'stackPrefetch');
        //     }
        // }

        // // Prefetch images around the current image (before and after)
        // const lowerIndex = nearest.low;
        // const higherIndex = nearest.high;
        // while (lowerIndex > 0 || higherIndex < stackPrefetch.indicesToRequest.length) {
        //     if (lowerIndex >= 0 ) {
        //         nextImageIdIndex = stackPrefetch.indicesToRequest[lowerIndex--];
        //         imageId = stack.imageIds[nextImageIdIndex];
        //         requestPoolManager.addRequest(element, imageId, requestType, preventCache, doneCallback, failCallback);
        //     }

        //     if (higherIndex < stackPrefetch.indicesToRequest.length) {
        //         nextImageIdIndex = stackPrefetch.indicesToRequest[higherIndex++];
        //         imageId = stack.imageIds[nextImageIdIndex];
        //         requestPoolManager.addRequest(element, imageId, requestType, preventCache, doneCallback, failCallback);
        //     }
        // }

        // // Try to start the requestPool's grabbing procedure
        // // in case it isn't already running
        // requestPoolManager.startGrabbing();
    }

    function promiseRemovedHandler(e, eventData) {
        // When an imagePromise has been pushed out of the cache, re-add its index
        // to the indicesToRequest list so that it will be retrieved later if the
        // currentImageIdIndex is changed to an image nearby
        const element = e.data.element;
        let stackData;

        try {
            // It will throw an exception in some cases (eg: thumbnails)
            stackData = cornerstoneTools.getToolState(element, 'stack');
        } catch(error) {
            return;
        }

        if (!stackData || !stackData.data || !stackData.data.length) {
            return;
        }

        const stack = stackData.data[0];
        const imageIdIndex = stack.imageIds.indexOf(eventData.imageId);

        // Make sure the image that was removed is actually in this stack
        // before adding it to the indicesToRequest array
        if (imageIdIndex < 0) {
            return;
        }

        const stackPrefetchData = cornerstoneTools.getToolState(element, toolType);
        if (!stackPrefetchData || !stackPrefetchData.data || !stackPrefetchData.data.length) {
            return;
        }

        stackPrefetchData.data[0].indicesToRequest.push(imageIdIndex);
    }

    function onImageUpdated(e) {
        // Start prefetching again (after a delay)
        // When the user has scrolled to a new image
        clearTimeout(resetPrefetchTimeout);
        resetPrefetchTimeout = setTimeout(function() {
            // If playClip is enabled and the user loads a different series in the viewport
            // an exception will be thrown because the element will not be enabled anymore
            try {
                prefetch();
            } catch(error) {
                return;
            }

        }, resetPrefetchDelay);
    }

    function enable(element) {
        // Clear old prefetch data. Skipping this can cause problems when changing the series inside an element
        const stackPrefetchDataArray = cornerstoneTools.getToolState(element, toolType);
        if (stackPrefetchDataArray) {
            stackPrefetchDataArray.data = [];
        }

        // First check that there is stack data available
        const stackData = cornerstoneTools.getToolState(element, 'stack');
        if (!stackData || !stackData.data || !stackData.data.length) {
            return;
        }

        const stack = stackData.data[0];

        // Check if we are allowed to cache images in this stack
        if (stack.preventCache === true) {
            console.warn('A stack that should not be cached was given the stackPrefetch');
            return;
        }

        if (!isPrefetchEnabled(element)) {
            elements.push(element);
        }

        // Use the currentImageIdIndex from the stack as the initalImageIdIndex
        const stackPrefetchData = {
            indicesToRequest: range(0, stack.imageIds.length - 1),
            enabled: true,
            direction: 1
        };

        // Remove the currentImageIdIndex from the list to request
        const indexOfCurrentImage = stackPrefetchData.indicesToRequest.indexOf(stack.currentImageIdIndex);
        stackPrefetchData.indicesToRequest.splice(indexOfCurrentImage, 1);

        cornerstoneTools.addToolState(element, toolType, stackPrefetchData);

        prefetch();

        $(element).off('CornerstoneNewImage', onImageUpdated);
        $(element).on('CornerstoneNewImage', onImageUpdated);

        $(cornerstone).off('CornerstoneImageCachePromiseRemoved', promiseRemovedHandler);
        $(cornerstone).on('CornerstoneImageCachePromiseRemoved', {
            element: element
        }, promiseRemovedHandler);
    }

    function disable(element) {
        // Check if the prefetch is enabled for this element
        if (!isPrefetchEnabled(element)) {
            return;
        }

        // Remove the element from elements array
        const elementIndex = elements.indexOf(element);
        elements.splice(elementIndex, 1);

        // Check if it's enabled on cornerstone
        if (!isElementEnabled(element)) {
            return;
        }

        clearTimeout(resetPrefetchTimeout);
        $(element).off('CornerstoneNewImage', onImageUpdated);

        $(cornerstone).off('CornerstoneImageCachePromiseRemoved', promiseRemovedHandler);

        const stackPrefetchData = cornerstoneTools.getToolState(element, toolType);
        // If there is actually something to disable, disable it
        if (stackPrefetchData && stackPrefetchData.data.length) {
            stackPrefetchData.data[0].enabled = false;
            prefetch();
        }
    }

    function disableAll() {
        for (let i = 0; i < elements.length; i++) {
            disable(elements[i]);
        }
    }

    function getConfiguration() {
        return configuration;
    }

    function setConfiguration(config) {
        configuration = config;
    }

    // module/private exports
    cornerstoneTools.multiStackPrefetch = {
        enable: enable,
        disable: disable,
        disableAll: disableAll,
        getConfiguration: getConfiguration,
        setConfiguration: setConfiguration
    };

})($, cornerstone, cornerstoneTools);
