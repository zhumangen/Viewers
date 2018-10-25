import { Meteor } from 'meteor/meteor';
import { Operations } from 'meteor/jf:operations/both/collections/operations';
import { OHIF } from 'meteor/ohif:core';

Meteor.methods({
  retrieveOperations(options) {
    const filter = options.filter?options.filter:{};
    return Operations.find(filter).fetch();
  },

  storeOperations(options) {
    const op = options.operation;
    const query = {
      _id: op._id
    };
    const options = {
      upsert: true
    };
    if (!op._id) {
      delete op._id
    }
    return Operations.update(query, op, options, OHIF.MongoUtils.writeCallback);
  }
})
