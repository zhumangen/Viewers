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

  const items = instance.data.item.items;
  const type = instance.data.item.type;
  if (!(items.length && items[0].items && items[0].items.length)) {
    items.forEach(item => {
      item.checked = instance.data.codes.indexOf(item.code) > -1;
      if (type === 'master' && item.checked) {
        instance.data.channel.set(item.enable || []);
      }
    })

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
          items.forEach(item => {
            if (item.checked && item.code !== code) {
              item.checked = false;
              instance.needUpdate.changed();
            }
          });
        }

        let codes = [];
        let currItem;
        const items = instance.data.item.items;
        for (let i = 0; i < items.length; ++i) {
            if (items[i].code === code) {
                items[i].checked = checked;
                currItem = items[i];
                break;
            }
        }

        if (type === 'master') {
          codes = checked?(currItem?currItem.enable:[]):[];
          channel.set(codes);
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
      const instance = Template.instance();
      instance.needUpdate.depend();
      const codes = instance.data.channel.get();
      const disabled = instance.data.item.type==='slave'&&(!codes||!codes.length||codes.indexOf(item.code)<0);
      if (disabled) {
        item.checked = false;
        return 'disabled';
      }
      return '';
    }
});
