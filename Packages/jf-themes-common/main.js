import { ThemesManager } from 'meteor/jf:themes-common/client/classes/ThemesManager';

const themes = new ThemesManager();
JF.managers.themes = themes;

export { themes };
