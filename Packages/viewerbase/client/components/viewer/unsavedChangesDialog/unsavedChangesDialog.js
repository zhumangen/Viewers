
import { $ } from 'meteor/jquery'
import { Template } from 'meteor/templating'

ViewerBase.UnsavedChangesDialog = (function () {

    // global object of key names (TODO: put this somewhere else)
    const Keys = {
        ESC: 27,
        ENTER: 13
    };

    // local context object
    const Context = {
        isNotShowing: true,
        Dialog: null,
        Backdrop: null,
        Callback: null
    };

    function doClose(confirmed) {

        // remove rendered views
        UI.remove(Context.Dialog);
        UI.remove(Context.Backdrop);

        // execute callback
        if (typeof Context.Callback === 'function') {
            Context.Callback.call(null, confirmed);
        }

        // restore context to what it was...
        Context.Callback = null;
        Context.Backdrop = null;
        Context.Dialog = null;
        Context.isNotShowing = true;

        // restore the focus to the active viewport
        setFocusToActiveViewport();

    }

    /**
     * Displays the unsaved changes dialog
     *
     * @param callback (a function to be executed after user )
     * @param options (an object to be passed to the templates)
     */
    function doShow(callback, options) {
        if (Context.isNotShowing) {

            Context.isNotShowing = false;
            Context.Callback = callback;
            Context.Backdrop = UI.renderWithData(Template.removableBackdrop, options, document.body);
            Context.Dialog = UI.renderWithData(Template.unsavedChangesDialog, options, document.body);

            // make sure dialog is visible and has focus
            $('#unsavedChangesDialog').css('display', 'block').focus();
            // make sure the context menu is dismissed when the user clicks away
            $('.removableBackdrop').one('mousedown touchstart', function() {
                doClose(false);
            });

        }
    }

    Template.unsavedChangesDialog.events({
        'click .action-no': function() {
            doClose(false);
        },
        'click .action-yes': function() {
            doClose(true);
        },
        'keydown #unsavedChangesDialog': function(e) {
            if (e.which === Keys.ESC) {
                doClose(false);
            }
        }
    });

    // only the show method is exposed
    return {
        show: doShow
    };

}());
