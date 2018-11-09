Package.describe({
    name: 'jf:order-list',
    summary: 'Basic order list for lesion marker system',
    version: '0.0.1'
});

Npm.depends({
    hammerjs: '2.0.8'
});

Package.onUse(function(api) {
    api.versionsFrom('1.4');

    api.use('ecmascript');
    api.use('standard-app-packages');
    api.use('jquery');
    api.use('stylus');
    api.use('http');
    api.use('random');
    api.use('silentcicero:jszip');
    api.use('aldeed:simple-schema');
    api.use('accounts-base');
    api.use('aldeed:collection2');

    // Note: MomentJS appears to be required for Bootstrap3 Datepicker, but not a dependency for some reason
    api.use('momentjs:moment');

    api.use('dangrossman:bootstrap-daterangepicker@2.1.13');

    // Our custom packages
    api.use('jf:design');
    api.use('ohif:core');
    api.use('ohif:log');
    api.use('ohif:servers');
    api.use('ohif:dicom-services');
    api.use('jf:viewerbase');
    api.use('ohif:wadoproxy');
    api.use('jf:studies');
    api.use('jf:core');

    api.mainModule('main.js', [ 'client', 'server' ]);

    // Client and server imports
    api.addFiles('both/index.js', [ 'client', 'server' ]);

    // Server imports
    api.addFiles('server/index.js', 'server');

    // Client imports
    api.addFiles('client/index.js', 'client');
});
