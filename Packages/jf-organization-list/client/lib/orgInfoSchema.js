import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const OrgInfo = new SimpleSchema({
  serialNumber: {
    type: String,
    label: '流水号',
    optional: true
  },
  name: {
    type: String,
    label: '机构简称'
  },
  fullName: {
    type: String,
    label: '机构全称'
  },
  serverId: {
    type: String,
    label: '影像存储',
  }

})
