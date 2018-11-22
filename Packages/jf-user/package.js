Package.describe({
    name: 'jf:user',
    summary: 'JF User Authentication Handling',
    version: '0.0.1'
});

Package.onUse(function(api) {
    api.versionsFrom('1.4');

    // Meteor client and server packages
    api.use([
        'ecmascript',
        'accounts-base',
        'accounts-password',
        'alanning:roles'
    ]);

    // Meteor client-only packages
    api.use([
        'templating',
        'stylus',
        'iron:router'
    ], 'client');

    // OHIF dependencies
    api.use('jf:design');
    api.use('jf:core');
    api.use('ohif:core');

    // Main module
    api.mainModule('main.js', ['client', 'server']);

    // Server imports
    api.addFiles('server/index.js', 'server');

    // Client imports
    api.addFiles('client/index.js', 'client');
});
