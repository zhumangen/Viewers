import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

// Define the Studies Collection. This is a client-side only Collection which stores the list of
// studies in the StudyList
Meteor.startup(() => {
    const OrderStatus = new Meteor.Collection(null);
    OrderStatus._debugName = 'OrderStatus';

    JF.collections.orderStatus = OrderStatus;
});
