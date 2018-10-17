import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Tracker } from 'meteor/tracker';
import { _ } from 'meteor/underscore';
import { $ } from 'meteor/jquery';
import { OHIF } from 'meteor/ohif:core';
import { JF } from 'meteor/jf:core';

function search(organization, dateRange) {
  OHIF.log.info('dicom list search...');
  Session.set('showLoadingText', true);
  Session.set('serverError', false);

  const filter = Object.assign({}, organization.filter);
  const level = organization.qidoLevel.toUpperCase();
  if (dateRange) {
    const dates = dateRange.replace(/ /g, '').split('-');
    filter.studyDateFrom = dates[0];
    filter.studyDateTo = dates[1];
  }

  JF.studies.searchDicoms(organization.serverId, organization.qidoLevel, filter).then(dicoms => {
    console.log(dicoms);
  });
}

Template.importDicom.onCreated(() => {
  const instance = Template.instance();
  instance.items = new ReactiveVar([]);
  instance.dateRangeValue = new ReactiveVar('');
  instance.orgIndex = new ReactiveVar(0);
});

Template.importDicom.onRendered(() => {
  const instance = Template.instance();
  const $dicomDate = instance.$('#dicomDate');
  const today = moment();
  const lastWeek = moment().subtract(6, 'days');
  const lastMonth = moment().subtract(29, 'days');

  instance.datePicker = $dicomDate.daterangepicker({
    maxDate: today,
    autoUpdateInput: true,
    startDate: today,
    endDate: today,
    ranges: {
      '今天': [today, today],
      '最近一周': [lastWeek, today],
      '最近一月': [lastMonth, today]
    },
    locale: {
      format: 'YYYY/MM/DD',
      weekLabel: '周',
      daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
      monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      applyLabel: '确定',
      cancelLabel: '取消',
      customRangeLabel: '自定义'
    }
  }).data('daterangepicker');

  JF.managers.organizations.retrieve().then(orgs => {
    instance.organizations = orgs;
    const items = [];
    for (const org of orgs) {
      items.push({value: org.name.zh, label: org.name.zh})
    }
    instance.items.set(items);
  });

  instance.autorun(() => {
    const instance = Template.instance();
    const index = instance.orgIndex.get();
    const dateRange = instance.dateRangeValue.get();
    if (index === 0) return;
    const org = instance.organizations && instance.organizations[index-1];
    if (!(org && dateRange)) return;
    search(org, dateRange);
  })
});

Template.importDicom.onDestroyed(() => {
  const instance = Template.instance();
  instance.datePicker.remove();
})

Template.importDicom.helpers({

});

Template.importDicom.events({
  'change #organization'(event, instance) {
    const index = event.currentTarget.options.selectedIndex;
    instance.orgIndex.set(index);
  },

  'change #dicomDate'(event, instance) {
    const val = $(event.currentTarget).val();
    instance.dateRangeValue.set(val);
  }
});
