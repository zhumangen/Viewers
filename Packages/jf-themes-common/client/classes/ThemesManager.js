import { Tracker } from 'meteor/tracker';

export class ThemesManager {
  constructor() {
    Tracker.autorun(() => {
      const theme = JF.managers.settings.theme();
      this.setThemeToBody(theme);
    });
  }

  addThemeToBody(theme) {
    document.body.classList.add('theme-' + theme)
  }

  removeThemesFromBody() {
    const classList = document.body.classList;
    for (let i = classList.length - 1; i >= 0; i--) {
      if (classList[i].search('theme-') !== -1) {
          document.body.classList.remove(classList[i]);
      }
    }
  }

  setThemeToBody(theme) {
    this.removeThemesFromBody();
    this.addThemeToBody(theme);
  }
}
