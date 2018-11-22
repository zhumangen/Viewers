import { JF } from 'meteor/jf:core';
import { Tracker } from 'meteor/tracker';
import { ReactiveVar } from 'meteor/reactive-var';
import { _ } from 'meteor/underscore';

class SettingsManager {
  constructor() {
    this.data = new ReactiveVar();
    this.hasUserData = new ReactiveVar(false);

    this.promise = new Promise((resolve, reject) => {
      Tracker.autorun(() => {
        const collection = JF.collections.settings;
        const docs = collection.find({}).fetch();
        let systemData, customData;
        for (const doc of docs) {
          if (doc.userId === '_system_') {
            systemData = doc;
          } else {
            if (!customData) customData = doc;
            else if (!!systemData) break;
          }
        }

        const data = systemData;
        if (data && customData) {
          data.private = customData.private;
          this.hasUserData.set(true);
        }

        if (data) resolve(data);
        this.data.set(data);
      });
    });

    this.userPromise = new Promise((resolve, reject) => {
      Tracker.autorun(() => {
        const hasUserData = this.hasUserData.get();
        if (hasUserData) {
          Tracker.nonreactive(() => {
            resolve(this.data.get());
          })
        }
      });
    });
  }

  systemTitle() {
    return this.data.get()?this.data.get().public.system.title:'';
  }

  systemVersion() {
    return this.data.get()?this.data.get().public.system.version:'';
  }

  rmisApis() {
    return this.promise.then(data => data.public.apis.rmis);
  }

  aiApis() {
    return this.promise.then(data => data.public.apis.ai);
  }

  viewerApis() {
    return this.promise.then(data => data.public.apis.viewer);
  }

  lesionCode() {
    return this.data.get()?this.data.get().public.lesion.current:'';
  }

  leftSidebarOpen() {
    return this.data.get()?this.data.get().private.ui.leftSidebarOpen:'';
  }

  rightSidebarOpen() {
    return this.data.get()?this.data.get().private.ui.rightSidebarOpen:'';
  }

  treeRect() {
    return this.data.get()?this.data.get().private.ui.treeRect:null;
  }

  theme() {
    return this.data.get()?this.data.get().private.ui.theme:'tide';
  }

  passwordOptions() {
    return this.promise.then(data => data.public.password);
  }

  hotkeys(contextName) {
    return new Promise((resolve, reject) => {
      this.userPromise.then(data => {
        const hotkeys = data.private.preference.hotkeys;
        if (_.isArray(hotkeys)) {
          for (let hotkey of hotkeys) {
            if (hotkey.contextName === contextName) {
              resolve(hotkey.definitions);
            }
          }
        }
      });
    });
  }

  wlPresets() {
    return new Promise((resolve, reject) => {
      this.userPromise.then(data => resolve(data.private.preference.wlPresets));
    });
  }

  setLeftSidebarOpen(value) {
    const data = this.data.get();
    if (!_.isEqual(data.private.ui.leftSidebarOpen, value)) {
      data.private.ui.leftSidebarOpen = value;
      this.data.set(data);
      this.storeSettings();
    }
  }

  setRightSidebarOpen(value) {
    const data = this.data.get();
    if (!_.isEqual(data.private.ui.rightSidebarOpen, value)) {
      data.private.ui.rightSidebarOpen = value;
      this.data.set(data);
      this.storeSettings();
    }
  }

  setTreeRect(rect) {
    const data = this.data.get();
    if (!_.isEqual(data.private.ui.treeRect, rect)) {
      data.private.ui.treeRect = {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height
      };
      this.data.set(data);
      this.storeSettings();
    }
  }

  setTheme(theme) {
    const data = this.data.get();
    if (!_.isEqual(data.private.ui.theme, theme)) {
      data.private.ui.theme = theme;
      this.data.set(data);
      this.storeSettings();
    }
  }

  setHotkeys(contextName, definitions) {
    return new Promise((resolve, reject) => {
      const data = this.data.get();
      const thisHotkey = { contextName, definitions };
      let hotkeys = data.private.preference.hotkeys;
      if (!hotkeys || !_.isArray(hotkeys)) hotkeys = [];
      let update = true;
      let pushNew = true;
      for (const hotkey of hotkeys) {
        if (hotkey.contextName === contextName) {
          if (_.isEqual(hotkey.definitions, definitions)) {
            update = false;
          } else {
            hotkey.definitions = definitions;
            pushNew = false;
          }
          break;
        }
      }
      if (update) {
        if (pushNew) hotkeys.push(thisHotkey);
        data.private.preference.hotkeys = hotkeys;
        this.data.set(data);
        this.storeSettings().then(resolve).catch(reject);
      } else resolve();
    });
  }

  setWLPresets(definitions) {
    return new Promise((resolve, reject) => {
      const data = this.data.get();
      if (!_.isEqual(data.private.preference.wlPresets, definitions)) {
        data.private.preference.wlPresets = definitions;
        this.data.set(data);
        this.storeSettings().then(resolve).catch(reject);
      } else resolve();
    });
  }

  rowsPerPage() {
    return 25;
  }

  storeSettings() {
    return new Promise((resolve, reject) => {
      const data = this.data.get();
      const userId = Meteor.userId();
      if (userId) {
        data.userId = userId;
        Meteor.call('storeSettings', data, (error, response) => {
          if (error) {
            OHIF.log.error('Save user settings failed: ', error);
            reject(error);
          } else {
            resolve(response);
          }
        });
      } else {
        reject(new Error('User id not found.'));
      }
    });
  }
}

const settingsManager = new SettingsManager();
JF.managers.settings = settingsManager;

export { settingsManager }
