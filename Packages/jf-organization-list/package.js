Package.describe({
    name: 'jf:organization-list',
    summary: 'JF organizations management',
    version: '0.0.1'
});

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

    // JF dependencies
    api.use('jf:core');
    api.use('jf:design');
    api.use('jf:organizations');

    // Main module definition
    api.mainModule('main.js', 'client');

    // Client imports
    api.addFiles('client/index.js', 'client');

    api.addFiles('server/index.js', 'server');
});
