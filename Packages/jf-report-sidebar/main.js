import { ReportsManager } from 'meteor/jf:report-sidebar/both/ReportsManager';
import { JF } from 'meteor/jf:core';

const reports = new ReportsManager();
JF.managers.reports = reports;

export { reports }
