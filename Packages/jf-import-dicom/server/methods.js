import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

Meteor.methods({
  storeDicoms(dicoms, options) {
    const ids = [];
    const collection = JF.collections.studies;
    const userId = this.userId;
    dicoms.forEach(dicom => {
      const filter = {
        status: { $gte: 0 },
        serverId: dicom.serverId,
        studyInstanceUid: dicom.studyInstanceUid
      }
      if (dicom.qidoLevel.toUpperCase() === 'SERIES') {
        filter.seriesInstanceUid = dicom.seriesInstanceUid;
      }
      const studies = collection.find(filter).fetch();
      if (studies.length === 0) {
        delete dicom._id;
        const t = new Date();
        dicom.status = 0;
        dicom.userId = userId;
        dicom.createdAt = t;
        dicom.serialNumber = '1' + t.getTime() + JF.utils.randomString();
        dicom._id = collection.insert(dicom);
        ids.push(dicom._id);
      } else {
        ids.push(studies[0]._id);
      }
    });

    return ids;
  }
})
