import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Router } from 'meteor/iron:router';
import { ReactiveVar } from 'meteor/reactive-var';
import { OHIF } from 'meteor/ohif:core';
import { JF } from 'meteor/jf:core';

Template.app.onCreated(() => {
    const instance = Template.instance();
    instance.headerClasses = new ReactiveVar('');

    const items = [{
      action: () => { Router.go('orderlist'); Session.set('locationType', 'SCP'); },
      text: '标注列表',
      iconClasses: 'server'
    }, {
      action: () => { Router.go('orderlist'); Session.set('locationType', 'SCU'); },
      text: '申请列表',
      iconClasses: 'server'
    }, {
      action: () => Router.go('studylist'),
      text: '影像列表',
      iconClasses: 'server'
    }, {
      action: () => Router.go('importDicom'),
      text: '影像导入',
      iconClasses: 'server',
      separatorAfter: true
    }, {
      action: () => Router.go('userlist'),
      text: '用户管理',
      iconClasses: 'server'
    }, {
      action: () => Router.go('organizationlist'),
      text: '机构管理',
      iconClasses: 'server'
    }, {
      action: () => OHIF.ui.showDialog('serverInformationModal'),
      text: 'DICOM服务器',
      iconClasses: 'server',
      iconSvgUse: 'packages/jf_user-management/assets/user-menu-icons.svg#server',
      separatorAfter: true
    }, {
      action: () => OHIF.ui.showDialog('themeSelectorModal'),
      text: '皮肤设置',
      iconClasses: 'theme',
      iconSvgUse: 'packages/jf_user-management/assets/user-menu-icons.svg#theme',
    }, {
      action: () => OHIF.ui.showDialog('userPreferencesDialog'),
      text: '偏好设置',
      icon: 'fa fa-user',
      separatorAfter: true
    }, {
      action: JF.user.changePassword,
      text: '修改密码',
      iconClasses: 'password',
      iconSvgUse: 'packages/jf_user-management/assets/user-menu-icons.svg#password'
    }, {
      action: JF.user.logout,
      text: '退出',
      iconClasses: 'logout',
      iconSvgUse: 'packages/jf_user-management/assets/user-menu-icons.svg#logout'
    }];

    instance.items = items;

    // OHIF.header.dropdown.setItems([{
    //     action: JF.user.audit,
    //     text: '查看日志',
    //     iconClasses: 'log',
    //     iconSvgUse: 'packages/ohif_user-management/assets/user-menu-icons.svg#log',
    //     separatorAfter: true
    // }, {
    //     action: () => OHIF.ui.showDialog('themeSelectorModal'),
    //     text: 'Themes',
    //     iconClasses: 'theme',
    //     iconSvgUse: 'packages/ohif_user-management/assets/user-menu-icons.svg#theme',
    //     separatorAfter: true
    // }, {
    //     action: () => OHIF.ui.showDialog('serverInformationModal'),
    //     text: 'Server Information',
    //     iconClasses: 'server',
    //     iconSvgUse: 'packages/ohif_user-management/assets/user-menu-icons.svg#server',
    //     separatorAfter: true
    // }, {
    //     action: () => OHIF.ui.showDialog('userPreferencesDialog'),
    //     text: 'Preferences',
    //     icon: 'fa fa-user',
    //     separatorAfter: true
    // }, {
    //     action: JF.user.changePassword,
    //     text: 'Change Password',
    //     iconClasses: 'password',
    //     iconSvgUse: 'packages/ohif_user-management/assets/user-menu-icons.svg#password'
    // }, {
    //     action: JF.user.logout,
    //     text: 'Logout',
    //     iconClasses: 'logout',
    //     iconSvgUse: 'packages/ohif_user-management/assets/user-menu-icons.svg#logout'
    // }]);

    instance.autorun(() => {
        const currentRoute = Router.current();
        if (!currentRoute) return;
        const routeName = currentRoute.route.getName();
        const isViewer = routeName.indexOf('viewer') === 0;

        // Add or remove the strech class from body
        $(document.body)[isViewer ? 'addClass' : 'removeClass']('stretch');

        // Set the header on its bigger version if the viewer is not opened
        instance.headerClasses.set(isViewer ? '' : 'header-big');

        // Set the viewer open state on session
        Session.set('ViewerOpened', isViewer);
    });
});

Template.app.onRendered(() => {
  const instance = Template.instance();
  const items = instance.items;

  instance.autorun(c => {
    const user = Meteor.user();
    if (!user || !user.roles) return;
    c.stop();

    if (!JF.user.isSuperAdmin()) {
      items[6].disabled = true;

      if (!JF.user.hasAdminRoles()) {
        items[4].disabled = true;
        items[5].disabled = true;
      }

      if (!JF.user.hasScpRoles()) {
        items[0].disabled = true;
      }

      if (!JF.user.hasScuRoles()) {
        items[1].disabled = true;
        items[2].disabled = true;
        items[3].disabled = true;
      }
    }

    OHIF.header.dropdown.setItems(_.filter(items, item => !item.disabled));
  });
})

// Template.app.events({
//     'click .js-toggle-studyList'(event, instance) {
//         event.preventDefault();
//         event.stopPropagation();
//         const isViewer = Session.get('ViewerOpened');
//
//         if (!isViewer) {
//             const timepointId = JF.viewer.data.currentTimepointId;
//             if (timepointId) {
//                 Router.go('viewerTimepoint', { timepointId });
//             } else {
//                 const { studyInstanceUids } = JF.viewer.data;
//                 Router.go('viewerStudies', { studyInstanceUids });
//             }
//
//             return;
//         }
//
//         OHIF.ui.unsavedChanges.presentProactiveDialog('viewer.*', (hasChanges, userChoice) => {
//             if (!hasChanges) {
//                 return Router.go('studylist');
//             }
//
//             switch (userChoice) {
//                 case 'abort-action':
//                     return;
//                 case 'save-changes':
//                     OHIF.ui.unsavedChanges.trigger('viewer', 'save', false);
//                     OHIF.ui.unsavedChanges.clear('viewer.*');
//                     break;
//                 case 'abandon-changes':
//                     OHIF.ui.unsavedChanges.clear('viewer.*');
//                     break;
//             }
//
//             Router.go('studylist');
//         }, {
//             position: {
//                 x: event.clientX + 15,
//                 y: event.clientY + 15
//             }
//         });
//     }
// });

Template.app.helpers({
    userName: JF.user.getName,
    hasReporter() {
        return !!Session.get('reporterName');
    },
    hasReviewer() {
        return !!Session.get('reviewerName');
    },
    getReporter() {
        return Session.get('reporterName');
    },
    getReviewer() {
        return Session.get('reviewerName');
    },
    // studyListToggleText() {
    //     const isViewer = Session.get('ViewerOpened');
    //
    //     // Return empty if viewer was not opened yet
    //     if (!OHIF.utils.ObjectPath.get(OHIF, 'viewer.data.studyInstanceUids')) return;
    //
    //    // return isViewer ? 'Study list' : 'Back to viewer';
    //    return isViewer ? '' : 'Back to viewer';
    // },

    dasherize(text) {
        return text.replace(/ /g, '-').toLowerCase();
    }
});

Session.set('defaultSignInMessage', 'Tumor tracking in your browser.');
