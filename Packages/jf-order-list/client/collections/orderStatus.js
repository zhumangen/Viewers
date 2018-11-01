import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

// Define the Selection Collection. This is a client-side only Collection which stores the list of
// status in the OrderList
Meteor.startup(() => {
  const SelectStatus = new Mongo.Collection(null);
  SelectStatus._debugName = 'OrderlistSelectionStatus';

  JF.orderlist.selectStatus = SelectStatus;
});
