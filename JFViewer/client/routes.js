import { Router } from 'meteor/iron:router';
import { JF } from 'meteor/jf:core';

Router.configure({
    layoutTemplate: 'layout',
    loadingTemplate: 'layout'
});

Router.onBeforeAction('loading');

Router.route('/viewer/studies/:studyInstanceUids', function() {
    const studyInstanceUids = this.params.studyInstanceUids.split(';');
    const serverId = this.params.query.serverId;
    JF.viewerbase.renderViewer(this, { serverId, studyInstanceUids }, 'jfViewer');
}, { name: 'viewerStudies' });

// OHIF #98 Show specific series of study
Router.route('/viewer/studies/:studyInstanceUids/series/:seriesInstanceUids', function () {
    const studyInstanceUids = this.params.studyInstanceUids.split(';');
    const seriesInstanceUids = this.params.seriesInstanceUids.split(';');
    const serverId = this.params.query.serverId;
    JF.viewerbase.renderViewer(this, { serverId, studyInstanceUids, seriesInstanceUids }, 'jfViewer');
}, { name: 'viewerSeries' });
