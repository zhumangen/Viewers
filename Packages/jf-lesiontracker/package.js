Package.describe({
    name: 'jf:lesiontracker',
    summary: 'JF Lesion Tracker Tools',
    version: '0.0.1'
});

Package.onUse(function(api) {
    api.versionsFrom('1.4');

    api.use('ecmascript');
    api.use('standard-app-packages');
    api.use('jquery');
    api.use('stylus');
    api.use('random');

    api.use('validatejs');

    // Template overriding
    api.use('aldeed:template-extension@4.0.0');

    // Our custom packages
    api.use('jf:design');
    api.use('ohif:cornerstone');
    api.use('ohif:core');
    api.use('ohif:cornerstone-settings');
    api.use('jf:studies');
    api.use('jf:core');
    api.use('jf:measurements');

    api.addFiles('both/index.js', [ 'client', 'server' ]);

    api.addFiles('server/index.js', 'server');

    api.addFiles('client/index.js', 'client');
});
