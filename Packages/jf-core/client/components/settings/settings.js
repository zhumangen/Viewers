import { JF } from 'meteor/jf:core';
import { Tracker } from 'meteor/tracker';
import { ReactiveVar } from 'meteor/reactive-var';
import { _ } from 'meteor/underscore';

class SettingsManager {
  constructor() {
    this.data = new ReactiveVar();
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
        }
        if (data) resolve(data);
        this.data.set(data);
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

  setLeftSidebarOpen(value) {
    const data = this.data.get();
    data.private.ui.leftSidebarOpen = value;
    this.data.set(data);
    this.storeSettings();
  }

  setRightSidebarOpen(value) {
    const data = this.data.get();
    data.private.ui.rightSidebarOpen = value;
    this.data.set(data);
    this.storeSettings();
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
      this.storeSettings();
    }
  }

  setTheme(theme) {
    const data = this.data.get();
    if (data.private.ui.theme !== theme) {
      data.private.ui.theme = theme;
      this.storeSettings();
    }
  }

  storeSettings() {
    const data = this.data.get();
    const user = Session.get('userInfo');
    if (user && user.userId) {
      data.userId = user.userId;
      new Promise((resolve, reject) => {
        Meteor.call('storeSettings', data, (error, response) => {
          if (error) {
            OHIF.log.error('Save user settings failed: ', error);
            reject(error);
          } else {
            resolve(response);
          }
        });
      });
    }
  }
}

const settingsManager = new SettingsManager();
JF.managers.settings = settingsManager;

export { settingsManager }
