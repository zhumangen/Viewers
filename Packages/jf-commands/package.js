Package.describe({
    name: 'jf:commands',
    summary: 'JF commands management',
    version: '0.0.1'
});

Package.onUse(function(api) {
    api.versionsFrom('1.4');

    // Meteor packages
    api.use([
        'ecmascript',
        'reactive-var'
    ]);

    // OHIF dependencies
    api.use('ohif:core');
    api.use('ohif:log');
    api.use('jf:core');

    // Main module definition
    api.mainModule('main.js', 'client');
});
