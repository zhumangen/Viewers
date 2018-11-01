import { JF } from 'meteor/jf:core';

/**
 * Loads multiple unassociated studies in the Viewer
 */
JF.studylist.viewStudies = studies => {
  if (!studies || !studies.length) return;

  JF.managers.settings.viewerApis().then(api => {
    const rootPath = api.root + api.viewer;
    const studyUids = [], seriesUids = [];
    const studyLevel = false;

    studies.forEach(study => {
      if (study.qidoLevel === 'STUDY') {
        studyLevel = true;
      } else {
        seriesUids.push(study.seriesInstanceUid);
      }
      studyUids.push(study.studyInstanceUid);
    });

    let path = rootPath + '/studies/' + studyUids.join(';');
    if (!studyLevel) {
      path += '/series/' + seriesUids.join(';');
    }
    open(path, api.window.name, api.window.features, api.window.replace);
  })
};

JF.studylist.callbacks.dblClickOnStudy = JF.studylist.viewStudies;
JF.studylist.callbacks.middleClickOnStudy = JF.studylist.viewStudies;
