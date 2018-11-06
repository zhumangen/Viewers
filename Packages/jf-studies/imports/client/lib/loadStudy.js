import { ReactiveDict } from 'meteor/reactive-dict';
import { Tracker } from 'meteor/tracker';
import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

// Create a studies loaded state dictionary to enable reactivity. Values: loading|loaded|failed
JF.studies.loadingDict = new ReactiveDict();

/**
 * Load the study metadata and store its information locally
 *
 * @param {String} studyInstanceUid The UID of the Study to be loaded
 * @returns {Promise} that will be resolved with the study metadata or rejected with an error
 */
JF.studies.loadStudy = (serverId, studyInstanceUid) => new Promise((resolve, reject) => {
    // Disable reactivity to get the current loading state
    let currentLoadingState;
    Tracker.nonreactive(() => {
        currentLoadingState = JF.studies.loadingDict.get(studyInstanceUid) || '';
    });

    // Set the loading state as the study is not yet loaded
    if (currentLoadingState !== 'loading') {
        JF.studies.loadingDict.set(studyInstanceUid, 'loading');
    }

    return JF.studies.retrieveStudyMetadata(serverId, studyInstanceUid).then(study => {
        // Add the display sets to the study if not present
        if (!study.displaySets) {
            const displaySets = JF.viewerbase.sortingManager.getDisplaySets(study);
            study.displaySets = displaySets;
            study.setDisplaySets(displaySets);
            study.forEachDisplaySet(displaySet => {
                JF.viewerbase.stackManager.makeAndAddStack(study, displaySet);
            });
        }

        // Double check to make sure this study wasn't already inserted into JF.viewer.Studies
        // so we don't cause duplicate entry errors
        const loaded = JF.viewer.Studies.findBy({ studyInstanceUid: study.studyInstanceUid });
        if (!loaded) {
            JF.viewer.Studies.insert(study);
            JF.viewer.StudyMetadataList.insert(study);
        }

        // Add the study to the loading listener to allow loading progress handling
        const studyLoadingListener = JF.viewerbase.StudyLoadingListener.getInstance();
        studyLoadingListener.addStudy(study);

        // Add the studyInstanceUid to the loaded state dictionary
        JF.studies.loadingDict.set(studyInstanceUid, 'loaded');

        resolve(new JF.metadata.StudyMetadata(study, study.studyInstanceUid));
    }).catch((...args) => {
        JF.studies.loadingDict.set(studyInstanceUid, 'failed');
        reject(args);
    });
});
