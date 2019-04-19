import { JF } from 'meteor/jf:core';
import { _ } from 'meteor/underscore';
import { resolveSoa } from 'dns';

export default function(options) {
  const result = { code: 400 };
  const userId = this.userId;

  if (!userId) {
    result.code = 401;
    return result;
  }

  if (!options.studyOrgId || !options.orderTime) {
    return result;
  }

  JF.validation.checks.checkNonEmptyString(options.studyOrgId);

  if (!JF.user.isSuperAdmin() || !Roles.userIsInRole(userId, 'admin', options.studyOrgId)) {
    result.code = 403;
    return result;
  }

  const pipeline = [{
    $match: options
  }, {
    $project: {
      dicomId: 1,
      lesionCode: 1,
      orderOrgId: 1,
      orderTime: 1,
      reportStart: 1,
      reportEnd: 1,
      reporterId: 1,
      reportRating: 1,
      reviewStart: 1,
      reviewEnd: 1,
      reviewerId: 1,
      serialNumber: 1,
      status: 1,
      studyOrgId: 1,
      userId: 1
    }
  }, {
    $lookup: {
      from: 'studies',
      localField: 'dicomId',
      foreignField: '_id',
      as: 'studies'
    }
  }, {
    $lookup: {
      from: 'servers',
      localField: 'studies.serverId',
      foreignField: '_id',
      as: 'servers'
    }
  }, {
    $lookup: {
      from: 'labels',
      localField: '_id',
      foreignField: 'orderId',
      as: 'labels'
    }
  }, {
    $lookup: {
      from: 'targets',
      localField: '_id',
      foreignField: 'orderId',
      as: 'targets'
    }
  }, {
    $lookup: {
      from: 'tissues',
      localField: '_id',
      foreignField: 'orderId',
      as: 'tissues'
    }
  }];

  result.data = JF.collections.orders.aggregate(pipeline);
  result.code = 200;

  return result;
}
