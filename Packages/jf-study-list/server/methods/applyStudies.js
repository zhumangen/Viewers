import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

Meteor.methods({
  applyStudies(studies, options) {
    const collection = JF.collections.orders;
    studies.forEach(study => {
      const t = new Date();
      const order = {
        status: 0,
        removed: false,
        dicomId: study._id,
        patientName: study.patientName,
        patientSex: study.patientSex,
        patientAge: study.patientAge,
        patientBirthdate: study.patientBirthdate,
        modality: study.modality,
        modalities: study.modalities,
        bodyPartExamined: study.bodyPartExamined,
        studyDate: study.studyDate,
        studyTime: study.studyTime,
        seriesDate:  study.seriesDate,
        seriesTime:study.seriesTime,
        studyDescription: study.studyDescription,
        seriesDescription: study.seriesDescription,
        organizationName: study.organizationName,
        institutionName: study.institutionName,
        qidoLevel: study.qidoLevel,
        orderTime: t,
        serialNumber: '2' + t.getTime() + JF.utils.randomString(),
        reporters: [],
        reviewers:[],
      };

      collection.insert(order);
      JF.collections.studies.update({_id: study._id}, {$set:{status: 1}}, {upsert:false, multi:false});
    });
  }
})
