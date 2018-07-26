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
  }

  const root = instance.data.item;
  const items = root.items;
  const type = instance.data.item.type;
  if (!(items.length && items[0].items && items[0].items.length)) {
    instance.isGrouped = root.groups && root.groups.length > 0;
    if (type === 'master') {
      if (!instance.isGrouped) {
        items.forEach(item => {
          item.checked = instance.data.codes.indexOf(item.code) > -1;
          if (item.checked) {
            instance.data.channel.set(item.enable || []);
          }
        });
      } else {
        instance.disables = new ReactiveVar([]);
        const groups = root.groups;
        let nonNeutralGroup;
        items.forEach(item => {
          item.checked = instance.data.codes.indexOf(item.code) > -1;
          if (item.checked) {
            for (let i = 0; i < groups.length; ++i) {
              const group = groups[i];
              if (group.indexOf(item.code) >= 0 && !group.neutral) {
                nonNeutralGroup = group;
                break;
              }
            }
          }
        });

        if (nonNeutralGroup) {
          let disables = [];
          groups.forEach(group => {
            if (nonNeutralGroup != group) {
              disables = disables.concat(group.members);
            }
          })
          instance.disables.set(disables);
          instance.data.channel.set(nonNeutralGroup.enables);
        }
      }
    }

    instance.needUpdate = new Tracker.Dependency();
  }
});

Template.selectTreeView.onRendered(() => {
  const instance = Template.instance();

  if (instance.data.item.type === 'slave') {
    instance.autorun((computation) => {
      if (computation.firstRun) return;
      const allowedItems  = instance.data.channel.get();
      console.log(allowedItems);
    });
  }
});

Template.selectTreeView.events({
    'mouseover .node-name'(event, instance){
        $(event.currentTarget).addClass("hover")
    },

    'mouseout .node-name'(event, instance){
        $(event.currentTarget).removeClass("hover")
    },

    'click .node-name'(event, instance){
        event.stopPropagation()
        let $dom = $(event.currentTarget)
        let $i = $dom.find('i')
        $dom.siblings().slideToggle()
        if($i.hasClass('fa-caret-down')){
            $i.removeClass('fa-caret-down').addClass('fa-caret-right')
        }else{
            $i.removeClass('fa-caret-right').addClass('fa-caret-down')
        }

    },

    'click .tree-leaf>input'(event, instance) {
        event.stopPropagation();
        const $target = $(event.currentTarget);
        const checked = $target.is(':checked');
        const code = $target.val();
        const channel = instance.data.channel;
        const type = instance.data.item.type;

        if (!instance.data.item.multi && checked) {
          const items = instance.data.item.items;
          let update = false;
          items.forEach(item => {
            if (item.checked && item.code !== code) {
              item.checked = false;
              update = true;
            }
          });
          if (update) instance.needUpdate.changed();
        }

        let codes = [];
        let currItem;
        let neutralGroup;
        let nonNeutralGroup;
        const items = instance.data.item.items;
        for (let i = 0; i < items.length; ++i) {
            const item = items[i];
            if (item.code === code) {
                item.checked = checked;
                currItem = item;
                if (!instance.isGrouped) break;
            }
            if (item.checked && instance.isGrouped) {
              const groups = instance.data.item.groups;
              groups.forEach(group => {
                if (group.members.indexOf(item.code) >= 0) {
                  if (group.neutral) {
                    neutralGroup = group;
                  } else {
                    nonNeutralGroup = group;
                  }
                }
              })
            }
        }

        if (currItem) {
          if (type === 'master') {
            if (instance.isGrouped) {
              let disables = [];
              if (nonNeutralGroup) {
                const groups = instance.data.item.groups;
                groups.forEach(group => {
                  if (!group.neutral && group != nonNeutralGroup) {
                    disables = disables.concat(group.members);
                  }
                });
                codes = nonNeutralGroup.enables;
              } else if (neutralGroup) {
                codes = neutralGroup.enables;
              }
              instance.disables.set(disables);
            } else {
              codes = checked?currItem.enable:[];
            }
            channel.set(codes);
          }
        } else {
          OHIF.log.info('Something went wrong here.');
        }
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
