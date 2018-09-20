import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { JF } from 'meteor/jf:core';

Template.themeSelectorModal.onCreated(() => {
    const instance = Template.instance();
    let currentTheme = JF.managers.settings.theme();
    instance.state = new ReactiveDict();
    instance.state.set('selectedTheme', currentTheme);

    JF.managers.themes.setThemeToBody(currentTheme);

    instance.container = {
        currentTheme,
        previewTheme(theme, state) {
            state.set('selectedTheme', theme);
            JF.managers.themes.setThemeToBody(theme);
        },
        applyTheme(state) {
          JF.managers.settings.setTheme(state.get('selectedTheme'));
        },
        resetState(state) {
            const theme = JF.managers.settings.theme();
            state.set('selectedTheme', theme);
            JF.managers.themes.setThemeToBody(theme);
        }
    };

    const { promise } = instance.data;
    promise.then(() => instance.container.applyTheme(instance.state));
    promise.catch(() => instance.container.resetState(instance.state));
});

Template.themeSelectorModal.helpers({
    themes: [ 'crickets', 'honeycomb', 'mint', 'overcast', 'quartz', 'tide', 'tigerlily' ],

    ucFirst(text) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    },

    printClassIfSelected(theme) {
        const instance = Template.instance();

        return theme === instance.state.get('selectedTheme') ? 'selected' : '';
    }
});

Template.themeSelectorModal.events({
    'click .preview-theme'(event, instance) {
        instance.container.previewTheme(event.currentTarget.dataset.theme, instance.state);
    }
});
