import { JF } from 'meteor/jf:core';
import { Meteor } from 'meteor/meteor';

export default function applyStudies(studies, options) {
  const Orders = JF.collections.orders;
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
      organizationId: study.organizationId,
      institutionName: study.institutionName,
      qidoLevel: study.qidoLevel,
      orderTime: t,
      serialNumber: '2' + t.getTime() + JF.utils.randomString()
    };

    Orders.insert(order);
    JF.studylist.updateStudyStatus(study._id, 1);
  });
}
