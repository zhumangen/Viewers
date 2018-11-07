import { JF } from 'meteor/jf:core';

JF.dicomlist.viewDicoms = dicoms => {
  if (!dicoms || !dicoms.length) return;

  JF.managers.settings.viewerApis().then(api => {
    const rootPath = api.root + api.viewer;
    const studyUids = [], seriesUids = [];
    const studyLevel = false;
    const serverId = '';

    dicoms.forEach(dicom => {
      if (dicom.qidoLevel === 'STUDY') {
        studyLevel = true;
      } else {
        seriesUids.push(dicom.seriesInstanceUid);
      }
      studyUids.push(dicom.studyInstanceUid);
      serverId = dicom.serverId;
    });

    let uri = rootPath + '/studies/' + studyUids.join(';');
    if (!studyLevel) {
      uri += '/series/' + seriesUids.join(';');
    }
    open(`${uri}?serverId=${serverId}`, api.window.name, api.window.features, api.window.replace);
  })
}

JF.dicomlist.callbacks.dblClickOnStudy = JF.dicomlist.viewDicoms;
JF.dicomlist.callbacks.middleClickOnStudy = JF.dicomlist.viewDicoms;
