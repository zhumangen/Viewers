import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';
import { _ } from 'meteor/underscore';
import { $ } from 'meteor/jquery';
import { OHIF } from 'meteor/ohif:core';
import { JF } from 'meteor/jf:core';

Template.reportSidebar.onCreated(() => {
    const instance = Template.instance();
    instance.data.isCompleteReport = new ReactiveVar(false);
    instance.data.hiLoading = new ReactiveVar(false);
    instance.data.hiReport = new ReactiveVar({});
    instance.data.aiLoading = new ReactiveVar(false);
    instance.data.aiReport = new ReactiveVar({});
});

const getHiReport = instance => {
    const api = instance.data.reportApi;
    const params = Session.get('queryParams');
    const element = OHIF.viewerbase.viewportUtils.getActiveViewportElement();
    const { getImageAttributes } = JF.measurements.MeasurementHandlers;
    const imageAttributes = getImageAttributes(element);
    const options = Object.assign({}, params, imageAttributes);
    instance.data.hiReport.set(null);
    api.getHiReport(options).then(data => {
        instance.data.hiReport.set(data);
        instance.data.hiLoading.set(false);
    }).catch(error => {
        instance.data.hiLoading.set(false);
    });
    instance.data.hiLoading.set(true);
};

const getAiReport = instance => {
    const api = instance.data.reportApi;
    const params = Session.get('queryParams');
    const element = OHIF.viewerbase.viewportUtils.getActiveViewportElement();
    const { getImageAttributes } = JF.measurements.MeasurementHandlers;
    const imageAttributes = getImageAttributes(element);
    const options = Object.assign({}, params, imageAttributes);
    instance.data.aiReport.set(null);
    api.getHiReport(options).then(data => {
        instance.data.aiReport.set(data);
        instance.data.aiLoading.set(false);
    }).catch(error => {
        instance.data.aiLoading.set(false);
    });
    instance.data.aiLoading.set(true);
};

Template.reportSidebar.onRendered(() => {
    const instance = Template.instance();
    
});

Template.reportSidebar.helpers({
    isLoading() {
        const instance = Template.instance();
        return (!instance.data.isCompleteReport.get() && instance.data.hiLoading.get()) ||
            (instance.data.isCompleteReport.get() && instance.data.aiLoading.get());
    }
});

Template.reportSidebar.events({
    'click .report-header div'(event, instance){
        const $thisTarget = $(event.currentTarget);
        if($thisTarget.index() == 0){
            getHiReport(instance);
            instance.data.isCompleteReport.set(false)
        }else{
            instance.data.isCompleteReport.set(true)
        }
    }
});
