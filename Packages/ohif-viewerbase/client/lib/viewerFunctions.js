getCurrentViewerData = function() {
  const contentId = Session.get('activeContentId');

  if (!ViewerData[contentId]) {
    return null;
  }
  return ViewerData[contentId];
};

isHideOverlay = function () {
  var viewerData = getCurrentViewerData();
  return !viewerData ? false : !!viewerData.hideOverlay;
};