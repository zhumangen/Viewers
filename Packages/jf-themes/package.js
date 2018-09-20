Package.describe({
    name: 'jf:themes',
    summary: 'JF Themes overridable package',
    version: '0.0.1'
});

Package.onUse(function(api) {
    api.versionsFrom('1.4.2.3');

    api.use('stylus');

    api.use('jf:themes-common', 'client');

    // Importable themes related variables
    api.addFiles('themes.styl', 'client', { isImport: true });
});
