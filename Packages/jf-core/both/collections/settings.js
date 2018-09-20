import { Mongo } from 'meteor/mongo';
import { JF } from 'meteor/jf:core';

const CollectionName = 'settings';
const Settings = new Mongo.Collection(CollectionName);
JF.collections.settings = Settings;

export { Settings, CollectionName };
