Npm.depends({
    ajv: '4.10.4',
    jspdf: '1.3.3'
});

Package.describe({
    name: 'jf:measurements',
    summary: 'JF Measurement Tools',
    version: '0.0.1'
});

Package.onUse(function(api) {
    api.versionsFrom('1.4');

    api.use('ecmascript');
    api.use('standard-app-packages');
    api.use('jquery');
    api.use('stylus');
    api.use('random');

    api.use('momentjs:moment');

    api.use('validatejs');

    // Schema for Data Models
    api.use('aldeed:simple-schema');
    api.use('aldeed:collection2');

    // Template overriding
    api.use('aldeed:template-extension@4.0.0');

    // Our custom packages
    api.use('ohif:cornerstone');
    api.use('jf:design');
    api.use('ohif:log');
    api.use('jf:studies');
    api.use('jf:hanging-protocols');
    api.use('jf:viewerbase');
    api.use('jf:core');

    // Client and server imports
    api.addFiles('both/index.js', ['client', 'server']);

    // Client imports
    api.addFiles('client/index.js', 'client');

    api.export('MeasurementSchemaTypes', ['client', 'server']);
});
