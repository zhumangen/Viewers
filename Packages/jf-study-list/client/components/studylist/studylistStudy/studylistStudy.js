import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';
import Hammer from 'hammerjs';
import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

// Clear all selected studies
function doClearStudySelections() {
    JF.studylist.collections.Studies.update({}, {
        $set: { selected: false }
    }, { multi: true });
}

function doSelectRow($studyRow, data) {
    // Mark the current study as selected if it's not marked yet
    if (!data.selected) {
        const filter = { studyInstanceUid: data.studyInstanceUid };
        const modifiers = { $set: { selected: true } };
        JF.studylist.collections.Studies.update(filter, modifiers);
    }

    // Set it as the previously selected row, so the user can use Shift to select from this point on
    JF.studylist.$lastSelectedRow = $studyRow;
}

function doSelectSingleRow($studyRow, data) {
    // Clear all selected studies
    doClearStudySelections();

    // Add selected row to selection list
    doSelectRow($studyRow, data);
}

function doUnselectRow($studyRow, data) {
    // Find the current studyInstanceUid in the stored list and mark as unselected
    const filter = { studyInstanceUid: data.studyInstanceUid };
    const modifiers = { $set: { selected: false } };
    JF.studylist.collections.Studies.update(filter, modifiers);
}

function handleShiftClick($studyRow, data) {
    let study;
    let $previousRow = JF.studylist.$lastSelectedRow;
    if ($previousRow && $previousRow.length > 0) {
        study = Blaze.getData($previousRow.get(0));
        if (!study.selected) {
            $previousRow = $(); // undefined
            JF.studylist.$lastSelectedRow = $previousRow;
        }
    }

    // Select all rows in between these two rows
    if ($previousRow.length) {
        let $rowsInBetween;
        if ($previousRow.index() < $studyRow.index()) {
            // The previously selected row is above (lower index) the
            // currently selected row.

            // Fill in the rows upwards from the previously selected row
            $rowsInBetween = $previousRow.nextAll('tr');
        } else if ($previousRow.index() > $studyRow.index()) {
            // The previously selected row is below the currently
            // selected row.

            // Fill in the rows upwards from the previously selected row
            $rowsInBetween = $previousRow.prevAll('tr');
        } else {
            // nothing to do since $previousRow.index() === $studyRow.index()
            // the user is shift-clicking the same row...
            return;
        }

        // Loop through the rows in between current and previous selected studies
        $rowsInBetween.each((index, row) => {
            const $row = $(row);

            // Retrieve the data context through Blaze
            const data = Blaze.getData(row);

            // If we find one that is already selected, do nothing
            if (data.selected) return;

            // Set the current study as selected
            doSelectRow($row, data);

            // When we reach the currently clicked-on $row, stop the loop
            return !$row.is($studyRow);
        });
    } else {
        // Set the current study as selected
        doSelectSingleRow($studyRow, data);
    }
}

function handleCtrlClick($studyRow, data) {
    const handler = data.selected ? doUnselectRow : doSelectRow;
    handler($studyRow, data);
}

Template.studylistStudy.helpers({
    numberOf() {
        return Template.instance().data.number;
    },
    status() {
        const instance = Template.instance();
        const length = instance.data.markedImages;
        if (length === 0) {
            return '待完成';
        } else if (length < instance.data.numberOfStudyRelatedInstances) {
            return '标注中';
        } else {
            return '已完成';
        }
    },

    statusStyle() {
        const instance = Template.instance();
        const length = instance.data.markedImages;
        if (length === 0) {
            return 'uncompleted';
        } else if (length < instance.data.numberOfStudyRelatedInstances) {
            return 'completing';
        } else {
            return 'completed';
        }
    }
});

Template.studylistStudy.onRendered(() => {
    const instance = Template.instance();
    const data = instance.data;
    const $row = instance.$('tr.studylistStudy').first();

    // Enable HammerJS to allow touch support
    const mc = new Hammer.Manager($row.get(0));
    const doubleTapRecognizer = new Hammer.Tap({
        event: 'doubletap',
        taps: 2,
        interval: 500,
        threshold: 30,
        posThreshold: 30
    });
    mc.add(doubleTapRecognizer);

    // Check if current row has been previously selected
    if (data.selected) {
        doSelectRow($row, data);
    }
});

Template.studylistStudy.events({
    'click tr.studylistStudy'(event, instance) {
        const $studyRow = $(event.currentTarget);
        const data = instance.data;

        // Remove the ID so we can directly insert this into our client-side collection
        delete data._id;

        if (event.shiftKey) {
            handleShiftClick($studyRow, data);
        } else if (event.ctrlKey || event.metaKey) {
            handleCtrlClick($studyRow, data);
        } else {
            doSelectSingleRow($studyRow, data);
        }
    },

    'mousedown tr.studylistStudy'(event, instance) {
        // This event handler is meant to handle middle-click on a study
        if (event.which !== 2) {
            return;
        }

        const middleClickOnStudy = JF.studylist.callbacks.middleClickOnStudy;
        if (middleClickOnStudy && typeof middleClickOnStudy === 'function') {
            middleClickOnStudy(instance.data);
        }
    },

    'dblclick tr.studylistStudy, doubletap tr.studylistStudy'(event, instance) {
        if (event.which !== undefined && event.which !== 1) {
            return;
        }

        const dblClickOnStudy = JF.studylist.callbacks.dblClickOnStudy;

        if (dblClickOnStudy && typeof dblClickOnStudy === 'function') {
            dblClickOnStudy(instance.data);
        }
    },

    'contextmenu tr.studylistStudy, press tr.studylistStudy'(event, instance) {
        const $studyRow = $(event.currentTarget);

        if (!instance.data.selected) {
            doSelectSingleRow($studyRow, instance.data);
        }

        event.preventDefault();
        OHIF.ui.showDropdown(JF.studylist.dropdown.getItems(), {
            event,
            menuClasses: 'dropdown-menu-left'
        });
        return false;
    }
});