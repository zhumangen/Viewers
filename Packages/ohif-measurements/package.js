Package.describe({
    name: 'ohif:measurements',
    summary: 'OHIF Measurement Tools',
    version: '0.0.1'
});

Npm.depends({
    ajv: '4.10.4',
    jspdf: '1.3.2',
    'simpl-schema': '0.2.3'
});

Package.onUse(function(api) {
    api.versionsFrom('1.4');

    api.use('ecmascript');
    api.use('templating');
    api.use('jquery');
    api.use('stylus');
    api.use('random');

    api.use('momentjs:moment');

    api.use('validatejs');

    // Schema for Data Models
    api.use('aldeed:collection2-core');

    // Template overriding
    api.use('aldeed:template-extension');

    // Our custom packages
    api.use('ohif:cornerstone');
    api.use('ohif:design');
    api.use('ohif:core');
    api.use('ohif:log');
    api.use('ohif:study-list');
    api.use('ohif:hanging-protocols');

    // Client and server imports
    api.addFiles('both/index.js', ['client', 'server']);

    // Client imports
    api.addFiles('client/index.js', 'client');

    api.export('MeasurementSchemaTypes', ['client', 'server']);
});
