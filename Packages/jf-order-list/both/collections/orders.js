import { Mongo } from 'meteor/mongo';
import { JF } from 'meteor/jf:core';

const Orders = new Mongo.Collection('orders', { idGeneration: 'MONGO'});
JF.collections.orders = Orders;

export { Orders };
