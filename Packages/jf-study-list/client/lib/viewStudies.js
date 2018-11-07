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
    const serverId = '';

    studies.forEach(study => {
      if (study.qidoLevel === 'STUDY') {
        studyLevel = true;
      } else {
        seriesUids.push(study.seriesInstanceUid);
      }
      studyUids.push(study.studyInstanceUid);
      serverId = study.serverId;
    });

    let uri = rootPath + '/studies/' + studyUids.join(';');
    if (!studyLevel) {
      uri += '/series/' + seriesUids.join(';');
    }
    open(`${uri}?serverId=${serverId}`, api.window.name, api.window.features, api.window.replace);
  })
};

JF.studylist.callbacks.dblClickOnStudy = JF.studylist.viewStudies;
JF.studylist.callbacks.middleClickOnStudy = JF.studylist.viewStudies;
