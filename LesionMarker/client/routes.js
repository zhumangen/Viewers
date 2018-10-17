import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import { OHIF } from 'meteor/ohif:core';

Router.configure({
    layoutTemplate: 'layout',
    loadingTemplate: 'layout'
});

Router.onBeforeAction('loading');

Router.onBeforeAction(function() {
    // verifyEmail controls whether emailVerification template will be rendered or not
    const publicSettings = Meteor.settings && Meteor.settings.public;
    const verifyEmail = publicSettings && publicSettings.verifyEmail || false;

    // Check if user is signed in or needs an email verification
    if (!Meteor.userId() && !Meteor.loggingIn()) {
        this.render('entrySignIn');
    } else if (verifyEmail && Meteor.user().emails && !Meteor.user().emails[0].verified) {
        this.render('emailVerification');
    } else {
        this.next();
    }
}, {
    except: ['entrySignIn', 'entrySignUp', 'forgotPassword', 'resetPassword', 'emailVerification', 'viewerSeries', 'importDicom']
});

Router.route('/', function() {
    Router.go('orderlist', {}, { replaceState: true });
}, { name: 'home' });

Router.route('/orderlist', {
    name: 'orderlist',
    /* onBeforeAction: function() {
        const next = this.next;

        // Retrieve the timepoints data to display in studylist
        const promise = JF.studylist.timepointApi.retrieveTimepoints({});
        promise.then(() => next());
    },*/
    action: function() {
        this.render('app', { data: { template: 'orderlist' } });
    }
});

Router.route('/viewer/timepoints/:timepointId', function() {
    const timepointId = this.params.timepointId;
    JF.viewerbase.renderViewer(this, { timepointId });
}, { name: 'viewerTimepoint' });

Router.route('/viewer/studies/:studyInstanceUids', function() {
    const studyInstanceUids = this.params.studyInstanceUids.split(';');
    JF.viewerbase.renderViewer(this, { studyInstanceUids });
}, { name: 'viewerStudies' });

// OHIF #98 Show specific series of study
Router.route('/viewer/study/:studyInstanceUid/series/:seriesInstanceUids', function () {
    const studyInstanceUid = this.params.studyInstanceUid;
    const seriesInstanceUids = this.params.seriesInstanceUids.split(';');
    let queryParams = this.params.query;
    Object.assign(queryParams, { studyInstanceUid, seriesInstanceUids });
    Session.set('queryParams', queryParams);
    Session.set('userInfo', {userId: '', userName: '未知用户', permission: 0})
    console.log(Session.get('queryParams'));
    JF.viewerbase.renderViewer(this, { studyInstanceUids: [studyInstanceUid], seriesInstanceUids });
}, { name: 'viewerSeries' });
