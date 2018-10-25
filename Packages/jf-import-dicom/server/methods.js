import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

Meteor.methods({
  storeDicoms(options) {
    const dicoms = options.dicoms;
    const ids = [];
    const collection = JF.collections.studies;
    dicoms.forEach(dicom => {
      const filter = {
        serverId: dicom.serverId,
        studyInstanceUid: dicom.studyInstanceUid
      }
      if (dicom.qidoLevel.toUpperCase() === 'SERIES') {
        filter.seriesInstanceUid = dicom.seriesInstanceUid;
      }
      const studies = collection.find(filter).fetch();
      if (studies.length === 0) {
        delete dicom._id;
        dicom.status = '未申请';
        dicom.createdAt = new Date();
        dicom._id = collection.insert(dicom);
        ids.push(dicom._id);
      } else {
        ids.push(studies[0]._id);
      }
    });

    return ids;
  }
})
