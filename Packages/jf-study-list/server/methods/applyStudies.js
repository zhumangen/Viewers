import { JF } from 'meteor/jf:core';
import { Meteor } from 'meteor/meteor';

export default function applyStudies(studies, options) {
  JF.validation.checks.checkNonEmptyString(options.orderOrgId);
  JF.validation.checks.checkNonEmptyString(options.lesionCode);

  const result = { code: 200 };
  const userId = this.userId;

  if (!studies || !studies.length) {
    result.code = 400;
    return result;
  }

  if (!userId) {
    result.code = 401;
    return result;
  }

  if (!Roles.userIsInRole(userId, 'js', studies[0].organizationId)) {
    result.code = 403;
    return result;
  }

  const Orders = JF.collections.orders;
  studies.forEach(study => {
    const t = new Date();
    const order = {
      status: 0,
      removed: false,
      orderOrgId: options.orderOrgId,
      lesionCode: options.lesionCode,
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
      studyOrgId: study.organizationId,
      institutionName: study.institutionName,
      qidoLevel: study.qidoLevel,
      orderTime: t,
      userId,
      serialNumber: '2' + t.getTime() + JF.utils.randomString()
    };

    Orders.insert(order);
    JF.studylist.updateStudyStatus(study._id, 1);
  });

  return result;
}
