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
      const next = this.next;
      Tracker.autorun(c => {
        const user = Meteor.user();
        if (user && user.roles) {
          c.stop();
          const orgIds = JF.user.getAllGroups();
          if (orgIds.length > 0) {
            JF.organization.retrieveOrganizations(orgIds).then(() => next());
          } else {
            next();
          }
        }
      });
    }
}, {
    except: ['entrySignIn', 'entrySignUp', 'forgotPassword', 'resetPassword', 'emailVerification']
});

Router.route('/', function() {
  if (JF.user.hasScpRoles()) {
    Session.set('locationType', 'SCP');
  } else {
    Session.set('locationType', 'SCU');
  }
  Router.go('orderlist', {}, { replaceState: true });
}, { name: 'home' });

Router.route('/orderlist', {
    name: 'orderlist',
    /* onBeforeAction: function() {
        const next = this.next;
    },*/
    action: function() {
      if (!Session.get('locationType')) {
        if (JF.user.hasScpRoles()) {
          Session.set('locationType', 'SCP');
        } else {
          Session.set('locationType', 'SCU');
        }
      }
      this.render('app', { data: { template: 'orderlist' } });
    }
});

Router.route('/viewer/orders/:orderId', function() {
  const orderId = this.params.orderId;
  JF.viewerbase.renderViewer(this, { orderId });
}, { name: 'viewerOrder'});

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
    JF.viewerbase.renderViewer(this, { studyInstanceUids: [studyInstanceUid], seriesInstanceUids });
}, { name: 'viewerSeries' });
