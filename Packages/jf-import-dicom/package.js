Package.describe({
    name: 'jf:import-dicom',
    summary: 'JF dicom import from dicom archive server',
    version: '0.0.1'
});

Npm.depends({
  hammerjs: '2.0.8'
})

Package.onUse(function(api) {
    api.versionsFrom('1.4');

    // Meteor packages
    api.use([
        'ecmascript',
        'templating',
        'stylus',
        'tracker',
        'reactive-var',
        'underscore',
        'jquery'
    ]);

    api.use('momentjs:moment');
    api.use('dangrossman:bootstrap-daterangepicker@2.1.13');

    // JF dependencies
    api.use('jf:core');
    api.use('jf:design');
    api.use('ohif:core');

    // Main module definition
    api.mainModule('main.js', 'client');

    // api.addFiles('both/index.js', ['client', 'server']);
    // Client imports
    api.addFiles('client/index.js', 'client');

    api.addFiles('server/index.js', 'server');
});
