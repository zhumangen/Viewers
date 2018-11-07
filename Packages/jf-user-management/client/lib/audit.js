import { Router } from 'meteor/iron:router';
import { JF } from 'meteor/jf:core';

JF.user.audit = () => {
    Router.go('/audit');
};
