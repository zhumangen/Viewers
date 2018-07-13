import { OHIF } from 'meteor/ohif:core';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import { ReactiveVar } from 'meteor/reactive-var';
import { _ } from 'meteor/underscore';
import { $ } from 'meteor/jquery';

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
        const value = $target.val();
        const items = instance.data.items;
        for (let i = 0; i < items.length; ++i) {
            if (items[i].code === value) {
                items[i].checked = checked;
                break;
            }
        }
    }
});

Template.selectTreeView.helpers({
    allLeaves() {
        const instance = Template.instance();
        const items = instance.data.items;
        return !(items.length && items[0].items && items[0].items.length)
    }
});
