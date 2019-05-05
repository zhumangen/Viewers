import { SimpleSchema } from 'meteor/aldeed:simple-schema';

const OrgTypes = new SimpleSchema({
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

const orgInfoDefinition = {
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
    label: '影像存储'
  },
  orgTypes: {
    type: OrgTypes,
    label: '机构类型'
  }
};

export const OrgInfoSchema = new SimpleSchema(orgInfoDefinition);

const ScuFilterModalities = new SimpleSchema({
  DX: {
    type: Boolean,
    label: 'DX',
    optional: true
  },
  DR: {
    type: Boolean,
    label: 'DR',
    optional: true
  },
  CR: {
    type: Boolean,
    label: 'CR',
    optional: true
  },
  CT: {
    type: Boolean,
    label: 'CT',
    optional: true
  },
  MR: {
    type: Boolean,
    label: 'MR',
    optional: true
  },
  US: {
    type: Boolean,
    label: 'US',
    optional: true
  }
});

const ScuFilters = new SimpleSchema({
  patientId: {
    type: String,
    label: '患者ID',
    optional: true
  },
  institutionName: {
    type: String,
    label: '机构名称',
    optional: true
  },
  modalities: {
    type: ScuFilterModalities,
    label: '设备类型'
  }
})

const scuOrgInfoDefinition = Object.assign({}, orgInfoDefinition, {
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
  qidoLevel: {
    type: String,
    label: '查询层级',
    allowedValues: ['STUDY', 'SERIES', 'INSTANCE'],
    valuesLabels: ['检查', '序列', '单图']
  },
  filters: {
    type: ScuFilters,
    label: '查询条件',
    optional: true
  }
});

export const ScuOrgInfoSchema = new SimpleSchema(scuOrgInfoDefinition);
