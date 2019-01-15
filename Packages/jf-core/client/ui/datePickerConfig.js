import { JF } from 'meteor/jf:core';

JF.ui.datePickerConfig = {
  locale: {
      format: 'YYYY/MM/DD',
      weekLabel: '周',
      daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
      monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      applyLabel: '确定',
      cancelLabel: '取消',
      customRangeLabel: '自定义'
    }
};
