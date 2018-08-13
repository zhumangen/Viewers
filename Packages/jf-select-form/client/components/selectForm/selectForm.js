import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

Template.selectForm.onCreated(() => {
    const instance = Template.instance();
    instance.isRemoved = true;
    instance.bodyPart = 'tuberculosis';
    instance.toolGroupId = new ReactiveVar('');
    instance.removeTreeView = () => {
        if (instance.treeView) {
            Blaze.remove(instance.treeView);
            instance.treeView = undefined;
        }
    };
});

Template.selectForm.onDestroyed(() => {
    const instance = Template.instance();

    instance.isRemoved = true;
    Session.set('measurementData', false);
    instance.removeTreeView();
});

Template.selectForm.onRendered(() => {
    const instance = Template.instance();
    instance.$('#selectForm').resizable().draggable().bounded();

    instance.autorun((computation) => {
        instance.removeTreeView();

        const measurement = Session.get('measurementData');
        if (computation.firstRun || !measurement) return;

        const api = instance.data.measurementApi;
        const toolType = measurement.toolType;
        const toolGroup = api.toolsGroupsMap[toolType];
        instance.toolGroupId.set(toolGroup);

        if (!toolGroup) return;

        const collection = JF.collections.definitions[toolGroup];
        const definition = collection.findOne({part: instance.bodyPart});
        const item = definition;

        const checkedCodes = (items, codes) => {
          if (items && items instanceof Array) {
              items.forEach(item => {
                if (item.items) {
                  checkedCodes(item.items, codes)
                } else {
                  codes.push(item.code);
                }
              });
          }
        };

        const codes = [];
        checkedCodes(measurement.location, codes);

        const data = {
            measurement,
            item,
            codes
        };
        instance.measurementData = data;
        const parentElement = instance.$('.scrollable')[0];
        instance.treeView = Blaze.renderWithData(Template.selectTreeRoot, data, parentElement);
    });
});

Template.selectForm.helpers({
    headerText() {
        const instance = Template.instance();
        const groupId = instance.toolGroupId.get();
        if (groupId && groupId !== '') {
            const config = JF.measurements.MeasurementApi.getConfiguration();
            const group = _.findWhere(config.measurementTools, { id: groupId });
            return group.name;
        }
        return '';
    },
    formHidden() {
        const instance = Template.instance();
        const isOpen = !!Session.get('measurementData');
        if (isOpen) {
            instance.isRemoved = false;
            return 'dialog-animated dialog-open';
        }

        return instance.isRemoved !== true ? 'dialog-animated dialog-closed' : 'hidden';
    }
});

Template.selectForm.events({
    'click #save'(event, instance) {
        const measurement = instance.measurementData.measurement;
        const rootItem = instance.measurementData.item;

        const removeNonChecked = item => {
          if (item) {
            if (item.items && item.items instanceof Array) {
              for (let i = 0; i < item.items.length; ++i) {
                const subItem = item.items[i];
                if (subItem.items && subItem.items instanceof Array) {
                  removeNonChecked(subItem);
                  if (subItem.items.length === 0) {
                    item.items.splice(i, 1);
                    i--;
                  }
                } else {
                  if (!subItem.checked) {
                    item.items.splice(i, 1);
                    i--;
                  }
                }
              }
            }
          }
        }

        removeNonChecked(rootItem)
        measurement.location = rootItem.items.length>0 && rootItem.items;

        const api = instance.data.measurementApi;
        const groupId = api.toolsGroupsMap[measurement.toolType];
        const config = JF.measurements.MeasurementApi.getConfiguration();
        const group = _.findWhere(config.measurementTools, { id: groupId });
        const tool = _.findWhere(group.childTools, { id: measurement.toolType });

        if (!tool.options.caseProgress.nonTarget || !measurement.isCreating) {
            if (measurement.isCreating !== undefined)
                delete measurement.isCreating;

            api.tools[tool.id].update({
                measurementNumber: measurement.measurementNumber,
                patientId: measurement.patientId
            }, {
                $set: {
                    location: measurement.location
                }
            }, {
                multi: true
            });
        } else {
            delete measurement.isCreating;

            api.tools[tool.id].insert(measurement);
        }

        Session.set('measurementData', false);

        // Notify that viewer suffered changes
        if (tool.toolGroup !== 'temp') {
            JF.measurements.triggerTimepointUnsavedChanges(tool.id);
        }
    },
    'click #cancel'(event, instance) {
        Session.set('measurementData', false);
    }
});
