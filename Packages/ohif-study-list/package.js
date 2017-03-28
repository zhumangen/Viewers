Package.describe({
    name: 'ohif:study-list',
    summary: 'Basic study list for web-based DICOM viewers',
    version: '0.0.1'
});

Npm.depends({
    hammerjs: '2.0.6',
    'simpl-schema': '0.2.3'
});

Package.onUse(function(api) {
    api.versionsFrom('1.4');

    api.use('ecmascript');
    api.use('templating');
    api.use('jquery');
    api.use('session');
    api.use('stylus');
    api.use('http');
    api.use('random');
    api.use('webapp');
    api.use('silentcicero:jszip');

    api.use('accounts-base');
    api.use('aldeed:collection2-core');

    // Note: MomentJS appears to be required for Bootstrap3 Datepicker, but not a dependency for some reason
    api.use('momentjs:moment');

    api.use('gilbertwat:bootstrap3-daterangepicker');

    // Our custom packages
    api.use('ohif:design');
    api.use('ohif:core');
    api.use('ohif:log');
    api.use('ohif:dicom-services');
    api.use('ohif:viewerbase');
    api.use('ohif:wadoproxy');

    // Client and server imports
    api.addFiles('both/index.js', [ 'client', 'server' ]);

    // Server imports
    api.addFiles('server/index.js', 'server');

    // Client imports
    api.addFiles('client/index.js', 'client');

    // Export Servers and CurrentServer Collections
    api.export('Servers', ['client', 'server']);
    api.export('CurrentServer', ['client', 'server']);

    // Export shared lib functions
    api.export('getCurrentServer', ['client', 'server']);

    api.export('Services', 'server');
});
