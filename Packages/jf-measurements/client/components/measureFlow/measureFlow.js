import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';
import { _ } from 'meteor/underscore';
import { $ } from 'meteor/jquery';

Template.measureFlow.onRendered(() => {
    const instance = Template.instance();
    const $measureFlow = instance.$('.measure-flow');
    const $btnAdd = instance.$('.btn-add');

    // Make the measure flow bounded by the window borders
    $measureFlow.bounded();

    $btnAdd.focus();

    if (instance.data.autoClick) {
        $btnAdd.trigger('click', {
            clientX: instance.data.position.x,
            clientY: instance.data.position.Y
        });
    } else {
        if (instance.data.direction) {
            const direction = instance.data.direction;
            let { left, top } = $measureFlow.offset();

            left = direction.x === -1 ? left -= $btnAdd.outerWidth() : left;
            top = direction.y === -1 ? top -= $btnAdd.outerHeight() : top;

            const distance = 5;
            left += direction.x * distance;
            top += direction.y * distance;

            $measureFlow.css({
                left,
                top
            });
        }

        // Display the button after reposition it
        $btnAdd.css('opacity', 1);
    }
});

Template.measureFlow.events({
    'click, mousedown, mouseup'(event, instance) {
        event.stopPropagation();
    },

    'click .measure-flow .btn-add'(event, instance) {
        Session.set('measurementData', instance.data.measurement);
        instance.$('.measureFlow').trigger('close');
    },

    'blur .measure-flow'(event, instance) {
        const $measureFlow = $(event.currentTarget);
        const element = $measureFlow[0];
        Meteor.defer(() => {
            const focused = $(':focus')[0];
            if (element !== focused && !$.contains(element, focused)) {
                $measureFlow.trigger('close');
            }
        });
    },

    'mouseleave .measure-flow'(event, instance) {
        const $measureFlow = $(event.currentTarget);
        if (!$.contains($measureFlow[0], event.toElement)) {
            $measureFlow.trigger('close');
        }
    },

    'mouseenter .measure-flow'(event, instance) {
        // Prevent from closing if user go out and in too fast
        clearTimeout(instance.closingTimeout);
        $(event.currentTarget).off('animationend').removeClass('fadeOut');
    },

    'close .measure-flow'(event, instance) {
        const $measureFlow = $(event.currentTarget);

        // Clear the timeout to prevent executing the close process twice
        clearTimeout(instance.closingTimeout);

        instance.closingTimeout = setTimeout(() => {
            const animationEndHandler = event => {
                // Prevent closing if the animation is coming from actions panel
                if (event.target !== $measureFlow[0]) {
                    $measureFlow.one('animationend', animationEndHandler);
                    return;
                }

                instance.data.doneCallback();
            };

            $measureFlow.one('animationend', animationEndHandler).addClass('fadeOut');
        }, 300);
    }
});
