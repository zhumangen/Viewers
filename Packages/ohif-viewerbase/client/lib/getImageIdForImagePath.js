import { OHIF } from 'meteor/ohif:core';

/**
 * Obtain an imageId for the given imagePath
 *
 * @param {String} imagePath Path containing study, series and instance UIDs and frame index
 * @returns {String} The resulting imageId for the given imagePath
 */

export const getImageIdForImagePath = (imagePath, thumbnail=false) => {
    let imageId;
    const [studyInstanceUid, seriesInstanceUid, sopInstanceUid, frameIndex] = imagePath.split('_');
    const study = OHIF.viewer.Studies.findBy({ studyInstanceUid });
    const studyMetadata = OHIF.viewerbase.getStudyMetadata(study);
    if (studyMetadata) {
        const series = studyMetadata.getSeriesByUID(seriesInstanceUid);
        if (series) {
            const instance = series.getInstanceByUID(sopInstanceUid);
            imageId = OHIF.viewerbase.getImageId(instance, frameIndex, thumbnail);
        }
    }
    return imageId;
};
