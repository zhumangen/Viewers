import { JF } from 'meteor/jf:core';

const Services = {};
Services.QIDO = {};
Services.WADO = {};
Services.DIMSE = {};
Services.REMOTE = {};

JF.studies.services = Services;

remoteGetValue = function(obj) {
    return obj ? obj.Value : null;
};
