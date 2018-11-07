import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';
import { Session } from 'meteor/session';
import { OHIF } from 'meteor/ohif:core';
import { JF } from 'meteor/jf:core';
import { HotkeysContext } from 'meteor/jf:hotkeys/client/classes/HotkeysContext';

JF.managers.defaultHotkeys = {
  // Tool hotkeys
  defaultTool: 'ESC',
  zoom: 'Z',
  wwwc: 'W',
  pan: 'P',
  angle: 'A',
  stackScroll: 'S',
  magnify: 'M',
  length: '',
  annotate: '',
  dragProbe: '',
  ellipticalRoi: '',
  rectangleRoi: '',

  // Viewport hotkeys
  flipH: 'H',
  flipV: 'V',
  rotateR: 'R',
  rotateL: 'L',
  invert: 'I',
  zoomIn: '',
  zoomOut: '',
  zoomToFit: '',
  resetViewport: '',
  clearTools: '',

  // Viewport navigation hotkeys
  scrollDown: 'DOWN',
  scrollUp: 'UP',
  scrollLastImage: 'END',
  scrollFirstImage: 'HOME',
  previousDisplaySet: 'PAGEUP',
  nextDisplaySet: 'PAGEDOWN',
  nextPanel: 'RIGHT',
  previousPanel: 'LEFT',

  // Miscellaneous hotkeys
  toggleOverlayTags: 'SHIFT',
  toggleCinePlay: 'SPACE',
  toggleCineDialog: '',
  toggleDownloadDialog: '',

  // Preset hotkeys
  WLPreset0: '1',
  WLPreset1: '2',
  WLPreset2: '3',
  WLPreset3: '4',
  WLPreset4: '5',
  WLPreset5: '6',
  WLPreset6: '7',
  WLPreset7: '8',
  WLPreset8: '9',
  WLPreset9: '0'
};

export class HotkeysManager {
    constructor() {
        this.contexts = {};
        this.defaults = {};
        this.currentContextName = null;
        this.enabled = new ReactiveVar(true);
        this.retrieveFunction = null;
        this.storeFunction = null;
        this.changeObserver = new Tracker.Dependency();

        Tracker.autorun(() => {
            const contextName = JF.managers.contextName.get();

            // Avoind falling in MongoDB collections reactivity
            Tracker.nonreactive(() => this.switchToContext(contextName));
        });
    }

    setRetrieveFunction(retrieveFunction) {
        this.retrieveFunction = retrieveFunction;
    }

    setStoreFunction(storeFunction) {
        this.storeFunction = storeFunction;
    }

    store(contextName, definitions) {
        const storageKey = `hotkeysDefinitions.${contextName}`;
        return new Promise((resolve, reject) => {
            if (this.storeFunction) {
                this.storeFunction.call(this, contextName, definitions).then(resolve).catch(reject);
            } else if (Meteor.userId()) {
                JF.user.setData(storageKey, definitions).then(resolve).catch(reject);
            } else {
                Session.setPersistent(storageKey, definitions);
                resolve();
            }
        });
    }

    retrieve(contextName) {
        const storageKey = `hotkeysDefinitions.${contextName}`;
        return new Promise((resolve, reject) => {
            if (this.retrieveFunction) {
                this.retrieveFunction(contextName).then(resolve).catch(reject);
            } else if (JF.user) {
                try {
                    resolve(JF.user.getData(storageKey));
                } catch(error) {
                    reject(error);
                }
            } else {
                resolve(Session.get(storageKey));
            }
        });
    }

    disable() {
        this.enabled.set(false);
    }

    enable() {
        this.enabled.set(true);
    }

    getContext(contextName) {
        return this.contexts[contextName];
    }

    getCurrentContext() {
        return this.getContext(this.currentContextName);
    }

    load(contextName) {
        return new Promise((resolve, reject) => {
            const context = this.getContext(contextName);
            if (!context) return reject();
            this.retrieve(contextName).then(defs => {
                const definitions = defs || this.defaults[contextName];
                if (!definitions) {
                    this.changeObserver.changed();
                    return reject();
                }

                context.destroy();
                context.definitions = definitions;
                context.initialize();
                this.changeObserver.changed();
                resolve(definitions);
            }).catch(reject);
        });
    }

    set(contextName, contextDefinitions, isDefaultDefinitions=false) {
        const enabled = this.enabled;
        const context = new HotkeysContext(contextName, contextDefinitions, enabled);
        const currentContext = this.getCurrentContext();
        if (currentContext && currentContext.name === contextName) {
            currentContext.destroy();
            context.initialize();
        }

        this.contexts[contextName] = context;
        if (isDefaultDefinitions) {
            this.defaults[contextName] = contextDefinitions;
        }
    }

    register(contextName, command, hotkey) {
        if (!command || !hotkey) return;
        const context = this.getContext(contextName);
        if (!context) {
            this.set(contextName, {});
        }

        context.register(command, hotkey);
    }

    unsetContext(contextName) {
        if (contextName === this.currentContextName) {
            this.getCurrentContext().destroy();
        }

        delete this.contexts[contextName];
        delete this.defaults[contextName];
    }

    resetDefauls(contextName) {
        const context = this.getContext(contextName);
        const definitions = this.defaults[contextName];
        if (!context || !definitions) return;
        context.extend(definitions);
        return this.store(contextName, definitions).then(this.changeObserver.changed);
    }

    switchToContext(contextName) {
        const currentContext = this.getCurrentContext();
        if (currentContext) {
            currentContext.destroy();
        }

        const newContext = this.contexts[contextName];
        if (!newContext) return;

        this.currentContextName = contextName;
        newContext.initialize();
        this.load(contextName).catch(() => {});
    }
}
