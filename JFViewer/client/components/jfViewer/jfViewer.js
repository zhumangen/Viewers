jf:import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Router } from 'meteor/iron:router';
import { ReactiveVar } from 'meteor/reactive-var';
import { OHIF } from 'meteor/ohif:core';

Template.jfViewer.onCreated(() => {
    const instance = Template.instance();
    instance.headerClasses = new ReactiveVar('');

    OHIF.header.dropdown.setItems([{
        action: () => OHIF.ui.showDialog('serverInformationModal'),
        text: 'Server Information',
        icon: 'fa fa-server fa-lg',
        separatorAfter: true
    }, {
        action: () => OHIF.ui.showDialog('userPreferencesDialog'),
        text: 'Preferences',
        icon: 'fa fa-user',
        separatorAfter: true
    }, {
        action: () => OHIF.ui.showDialog('aboutModal'),
        text: 'About',
        icon: 'fa fa-info'
    }]);

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
