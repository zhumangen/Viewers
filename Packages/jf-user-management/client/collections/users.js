import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

// Define the Selection Collection. This is a client-side only Collection which stores the list of
// status in the OrderList
Meteor.startup(() => {
  const Users = new Mongo.Collection(null);
  Users._debugName = 'ClientSideUsers';

  JF.user.users = Users;
});
