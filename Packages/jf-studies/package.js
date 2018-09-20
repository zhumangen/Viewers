Package.describe({
    name: 'jf:studies',
    summary: 'JF Studies Library to deal with studies UI, retrieval and manipulation',
    version: '0.0.1'
});

Package.onUse(function(api) {
    api.versionsFrom('1.4');

    api.use([
        'ecmascript',
        'templating',
        'stylus',
        'http'
    ]);

    // Our custom packages
    api.use([
        'jf:design',
        'ohif:core',
        'ohif:log',
        'ohif:servers',
        'ohif:dicom-services',
        'jf:viewerbase',
        'ohif:wadoproxy',
        'jf:core'
    ]);

    // Client and server imports
    api.addFiles('both/main.js', [ 'client', 'server' ]);

    // Server imports
    api.addFiles('server/main.js', 'server');

    // Client imports
    api.addFiles('client/main.js', 'client');
});
