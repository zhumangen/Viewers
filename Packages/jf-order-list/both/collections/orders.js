import { Mongo } from 'meteor/mongo';
import { JF } from 'meteor/jf:core';

const Orders = new Mongo.Collection('orders');
JF.collections.orders = Orders;

const OrdersCount = new Mongo.Collection('orders_count');
JF.collections.ordersCount = OrdersCount;

export { Orders, OrdersCount };
