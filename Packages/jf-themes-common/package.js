Package.describe({
    name: 'jf:themes-common',
    summary: 'JF Common Themes',
    version: '0.0.1'
});

Package.onUse(function(api) {
    api.versionsFrom('1.4.2.3');

    api.use('ecmascript');
    api.use('templating');
    api.use('stylus');

    api.use('jf:core');

    // Client imports
    api.addFiles('client/index.js', 'client');

    // Importable themes
    api.addFiles([
        'themes.styl',
        'themes/theme-tide.styl',
        'themes/theme-tigerlily.styl',
        'themes/theme-crickets.styl',
        'themes/theme-honeycomb.styl',
        'themes/theme-mint.styl',
        'themes/theme-overcast.styl',
        'themes/theme-quartz.styl'
    ], 'client', {
        isImport: true
    });

    // Main module definition
    api.mainModule('main.js', 'client');
});
