import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import { OHIF } from 'meteor/ohif:core';
import { cornerstone } from 'meteor/ohif:cornerstone';
import { $ } from 'meteor/jquery';
import { JF } from 'meteor/jf:core';

Template.slider.onCreated( () => {
    const instance = Template.instance();
    instance.isTuberculosis = new ReactiveVar(false);
    instance.isNormal = new ReactiveVar(false);
    instance.sliderValue = new ReactiveVar(-1);
    instance.imageData = {};
    instance.isInit = true;
});

Template.slider.events({
    'click #normal'() {
        const instance = Template.instance();
        instance.isInit = false;
        instance.isNormal.set(true);
        instance.isTuberculosis.set(false);
        instance.sliderValue.set(-1);
    },
	'click  #tuberculosis'() {
        const instance = Template.instance();
        instance.isInit = false;
        instance.isNormal.set(false);
        instance.isTuberculosis.set(true);
	},
    'click .radio-inline'() {
        const instance = Template.instance();
        instance.isInit = false;
        const radios = instance.$("input[name='tb']");
        for (let i = 0; i < radios.length; ++i) {
            if (radios[i].checked) {
                const val = radios[i].value;
                instance.sliderValue.set(val);
                console.log('set value ' + val);
                break;
            }
        }
    }
});

Template.slider.helpers({
    isTb() {
        return Template.instance().isTuberculosis.get();
    },
    isNormal() {
        return Template.instance().isNormal.get();
    },
    sliderValue() {
        return Template.instance().sliderValue.get();
    },
    disableRadios() {
        return Template.instance().isTuberculosis.get()?'':'disabled';
    }
});

Template.slider.onRendered( () => {
    const instance = Template.instance();
    
    instance.autorun( () => {
        const radios = instance.$("input[name='tb']");
        const val = instance.sliderValue.get();
        for (let i = 0; i < radios.length; ++i) {
            if (radios[i].value == val) {
                radios[i].checked = 'checked';
            } else {
                radios[i].checked = '';
            }
        }
    });
    
    instance.autorun( () => {
        const instance = Template.instance();
        const val = instance.sliderValue.get();
        if (!(instance.isNormal.get() || instance.isTuberculosis.get()) || instance.isInit) {
            return;
        }

        let tbData = {
            userId: Meteor.userId(),
            tb: instance.isTuberculosis.get(),
            score: val,
            lastModified: new Date()
        };
        Object.assign(tbData, instance.imageData);
        console.log('saving... ', tbData);
        Meteor.call('saveTbRating', tbData, (error, sucess) => {
            if (error) {
                alert(error.message);
            }
        });
    });
    
    instance.autorun( () => {
        const viewportIndex = Session.get('activeViewport') || 0;
        const viewport = $('.imageViewerViewport').get(viewportIndex);
        Session.get('CornerstoneNewImage' + viewportIndex);
        const enabledElements = cornerstone.getEnabledElements();
        let elem;
        for (let i = 0; i < enabledElements.length; i++) {
            if (enabledElements[i].element === viewport) {
              elem = enabledElements[i];
              break;
            }
        }

        if (elem) {
            instance.isInit = true;
            const study = cornerstone.metaData.get('study', elem.image.imageId);
            const series = cornerstone.metaData.get('series', elem.image.imageId);
            const inst = cornerstone.metaData.get('instance', elem.image.imageId);
            const studyUid = study.studyInstanceUid;
            const seriesUid = series.seriesInstanceUid;
            const imageUid = inst.sopInstanceUid;
            const server = OHIF.servers.collections.currentServer.findOne();
            instance.imageData = {
                serverId: server._id,
                studyUid,
                seriesUid,
                imageUid,
            }
            console.log(instance.imageData);
            const TbRatings = JF.tbrating.collections.tbRatings;
            const userId = Meteor.userId();
            const qry = instance.imageData;
            const tb = TbRatings.findOne(qry);
            console.log(tb);
            let found = false;
            if (tb) {
                tb.results.forEach( (rec) => {
                    console.log(rec);
                    if (rec.userId === userId) {
                        //setTimeout( () => {
                            instance.isTuberculosis.set(rec.tb===undefined?false:rec.tb);
                            instance.isNormal.set(rec.tb===undefined?false:(!rec.tb));
                            instance.sliderValue.set(rec.score);
                        //}, 0);
                        
                        found = true;
                    }
                });
            }

            if (!found) {
                instance.isTuberculosis.set(false);
                instance.isNormal.set(false);
                instance.sliderValue.set(-1);
            }
        }
    });
});
