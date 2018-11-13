import { Mongo } from 'meteor/mongo';
import { JF } from 'meteor/jf:core';

const Orders = new Mongo.Collection('orders');
JF.collections.orders = Orders;

export { Orders };
