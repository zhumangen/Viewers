import { Mongo } from 'meteor/mongo'
import { JF } from 'meteor/jf:core'

const TbRatings = new Mongo.Collection('tbratings');
TbRatings._debugName = 'TbRatings';
JF.tbrating.collections.tbRatings = TbRatings;

export { TbRatings };