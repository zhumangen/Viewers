import { Meteor } from 'meteor/meteor';
import { OHIF } from 'meteor/ohif:core';

formatWADOREImageUrl = function(wadorsuri, frame) {
    // We need to sum 1 because WADO-RS frame number is 1-based
    frame = (frame || 0) + 1;

    // Replaces /frame/1 by /frame/{frame}
    // TODO: Maybe should be better to export the WADOProxy to be able to use it on client
    //       Example: WADOProxy.convertURL(baseWadoRsUri + '/frame/' + frame)
    wadorsuri = wadorsuri.replace(/(%2Fframes%2F)(\d+)/, `$1${frame}`);

    return Meteor.absoluteUrl(wadorsuri);
}

/**
 * Obtain an imageId for Cornerstone based on the WADO-RS scheme
 *
 * @param instance
 * @returns {string} The imageId to be used by Cornerstone
 */

getWADORSImageId = function(instance, frame) {
    var columnPixelSpacing = 1.0;
    var rowPixelSpacing = 1.0;

    if (instance.pixelSpacing) {
        var split = instance.pixelSpacing.split('\\');
        rowPixelSpacing = parseFloat(split[0]);
        columnPixelSpacing = parseFloat(split[1]);
    }

    var windowWidth;
    var windowCenter;

    if (instance.windowWidth && instance.windowCenter) {
        windowWidth = parseFloat(instance.windowWidth.split('\\')[0]);
        windowCenter = parseFloat(instance.windowCenter.split('\\')[0]);
    }

    var image = {
        uri: formatWADOREImageUrl(instance.wadorsuri, frame),
        //imageId : '',
        //minPixelValue : 0,
        //maxPixelValue : 255,
        slope: instance.rescaleSlope,
        intercept: instance.rescaleIntercept,
        samplesPerPixel: instance.samplesPerPixel,
        imageOrientationPatient: instance.imageOrientationPatient,
        imagePositionPatient: instance.imagePositionPatient,
        sopClassUid: instance.sopClassUid,
        instanceNumber: instance.instanceNumber,
        frameOfReferenceUID: instance.frameOfReferenceUID,
        windowCenter: windowCenter,
        windowWidth: windowWidth,
        //render: cornerstone.renderColorImage,
        //getPixelData: getPixelData,
        //getImageData: getImageData,
        //getCanvas: getCanvas,
        rows: instance.rows,
        columns: instance.columns,
        height: instance.rows,
        width: instance.columns,
        color: false,
        columnPixelSpacing: columnPixelSpacing,
        rowPixelSpacing: rowPixelSpacing,
        invert: false,
        sizeInBytes: instance.rows * instance.columns * (instance.bitsAllocated / 8),
        instance: instance
    };

    var imageId = cornerstoneWADOImageLoader.imageManager.add(image);

    OHIF.log.info('WADO-RS ImageID: ' + imageId);
    return imageId;
};
