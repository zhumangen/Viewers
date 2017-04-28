import { OHIF } from 'meteor/ohif:core';

/*getCurrentViewerData = function() {
  const contentId = Session.get('activeContentId');

  if (!ViewerData[contentId]) {
    return null;
  }
  return ViewerData[contentId];
};*/

export function isHideOverlay () {
  return !OHIF.viewer.data ? false : !!OHIF.viewer.data.hideOverlay;
}