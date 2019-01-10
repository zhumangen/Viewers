import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export default new SimpleSchema({
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
  qidoLevel: {
    type: String,
    label: '查询层级',
    allowedValues: ['STUDY', 'SERIES'],
    valuesLabels: ['检查', '序列']
  },
  serverId: {
    type: String,
    label: '影像存储',
  },
  orderOrgId: {
    type: String,
    label: '默认标注机构',
    optional: true
  },
  lesionCode: {
    type: String,
    label: '默认标注类型',
    optional: true
  },
  SCU: {
    type: Boolean,
    label: '医疗机构',
    optional: true
  },
  SCP: {
    type: Boolean,
    label: '影像中心',
    optional: true
  }
});
