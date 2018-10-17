import { Meteor } from 'meteor/meteor';
import { Operations } from 'meteor/jf:operations/both/collections/operations';

const writeCallback = (error, affected) => {
  if (error) {
    throw new Meteor.Error('data-write', error);
  }
}

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
    return Operations.update(query, op, options, writeCallback);
  }
})
