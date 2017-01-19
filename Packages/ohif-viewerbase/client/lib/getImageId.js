import { Meteor } from "meteor/meteor";

/**
 * Obtain an imageId for Cornerstone from an image instance
 *
 * @param instance
 * @param frame
 * #param thumbnail
 * @returns {string} The imageId to be used by Cornerstone
 */
getImageId = function(instance, frame, thumbnail) {
    if (!instance) {
        return;
    }

    if (instance.url) {
        return instance.url;
    }

    const renderingAttr = thumbnail ? 'thumbnailRendering' : 'imageRendering';

    if (instance[renderingAttr] === 'wadouri') {
        var imageId = 'dicomweb:' + Meteor.absoluteUrl(instance.wadouri); // WADO-URI;
        if (frame !== undefined) {
            imageId += '&frame=' + frame;
        }

        return imageId;
    } else {
        return getWADORSImageId(instance, frame, thumbnail); // WADO-RS Retrieve Frame
    }
};