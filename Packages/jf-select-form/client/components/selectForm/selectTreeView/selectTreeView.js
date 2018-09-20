import { OHIF } from 'meteor/ohif:core';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import { ReactiveVar } from 'meteor/reactive-var';
import { _ } from 'meteor/underscore';
import { $ } from 'meteor/jquery';

Template.selectTreeView.onCreated(() => {
  const instance = Template.instance();
  if (instance.data.item.control) {
    instance.channel = new ReactiveVar([]);
    if (!instance.data.checks) {
      instance.data.checks = new ReactiveVar([]);
    }
  }

  const root = instance.data.item;
  const items = root.items;
  const type = root.type;
  const groups = root.groups;

  instance.applyRules = () => {
    if (type === 'master') {
      let enableCodes = [];
      let checkCodes = []
      const checkedItems = _.where(items, {checked: true});
      if (instance.isGrouped) {
        let neutralGroup;
        let nonNeutralGroup;
        checkedItems.forEach(item => {
          groups.forEach(group => {
            if (group.members.indexOf(item.code) >= 0) {
              if (group.neutral) {
                neutralGroup = group;
              } else {
                nonNeutralGroup = group;
              }
            }
          });
        });

        let disableCodes = [];
        if (nonNeutralGroup) {
          groups.forEach(group => {
            if (!group.neutral && group != nonNeutralGroup) {
              disableCodes = disableCodes.concat(group.members);
            }
          });
          enableCodes = nonNeutralGroup.enables;
        } else if (neutralGroup) {
          enableCodes = neutralGroup.enables;
        }
        instance.disables.set(disableCodes);
      } else {
        checkedItems.forEach(item => {
          enableCodes = enableCodes.concat(item.enables || []);
          checkCodes = checkCodes.concat(item.checks || []);
        });
      }
      instance.data.channel.set(enableCodes);
      if (checkCodes.length > 0) instance.data.checks.set(checkCodes)
    }
  }

  if (!(items.length && items[0].items && items[0].items.length)) {
    instance.isGrouped = root.groups && root.groups.length > 0;
    instance.disables = new ReactiveVar([]);
    instance.needUpdate = new Tracker.Dependency();

    items.forEach(item => {
      item.checked = instance.data.codes.indexOf(item.code) > -1;
    });

    instance.applyRules();
  }
});

Template.selectTreeView.onRendered(() => {
  const instance = Template.instance();
  const items = instance.data.item.items;
  if (!(items.length && items[0].items && items[0].items.length) && instance.data.checks) {
    instance.autorun(() => {
      const currentCode = instance.data.item.code;
      const checkCodes = instance.data.checks.get();
      checkCodes = checkCodes.filter(code => {
        return currentCode.slice(0, 4) === code.slice(0, 4);
      });
      if (!checkCodes || !checkCodes.length) return;
      for (let item of items) {
        item.checked = checkCodes.indexOf(item.code) >= 0
      }

      instance.applyRules();
      instance.needUpdate.changed();
    });
  }
});

Template.selectTreeView.events({
    'mouseover .node-name'(event, instance){
        $(event.currentTarget).addClass("hover");
    },

    'mouseout .node-name'(event, instance){
        $(event.currentTarget).removeClass("hover");
    },

    'click .node-name'(event, instance){
        event.stopPropagation();
        let $dom = $(event.currentTarget);
        let $i = $dom.find('i');
        $dom.siblings().slideToggle();
        if($i.hasClass('fa-caret-down')){
            $i.removeClass('fa-caret-down').addClass('fa-caret-right');
        }else{
            $i.removeClass('fa-caret-right').addClass('fa-caret-down');
        }

    },

    'click .tree-leaf>input'(event, instance) {
        event.stopPropagation();
        const $target = $(event.currentTarget);
        const checked = $target.is(':checked');
        const code = $target.val();

        const items = instance.data.item.items;
        const currItem = _.findWhere(items, {code});
        if (!currItem) {
          OHIF.log.info('Something went wrong here.');
          return;
        }

        currItem.checked = checked;
        let hasChecksItem = false;
        for (let item of items) {
          if (item.checked && item.checks && item.checks.length) {
            hasChecksItem = true;
            break;
          }
        }

        const exclusive = !instance.data.item.multi || hasChecksItem;
        if (exclusive && checked) {
          items.forEach(item => {
            item.checked = false;
          });
        }

        currItem.checked = checked;
        instance.applyRules();
        instance.needUpdate.changed();
    }
});

Template.selectTreeView.helpers({
    allLeaves() {
        const instance = Template.instance();
        const items = instance.data.item && instance.data.item.items;
        return !(items.length && items[0].items && items[0].items.length)
    },
    isDisabled(item) {
      let disabled = false;
      const instance = Template.instance();
      const type = instance.data.item.type;
      instance.needUpdate.depend();

      if (type === 'master') {
        if (instance.isGrouped) {
          const disables = instance.disables.get();
          disabled = disables.indexOf(item.code) >= 0;
        }
      } else if (type === 'slave') {
        const codes = instance.data.channel.get();
        disabled = !codes || !codes.length || codes.indexOf(item.code)<0;
      }

      if (disabled) {
        item.checked = false;
        return 'disabled';
      }
      return '';
    }
});
