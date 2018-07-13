Package.describe({
    name: 'jf:select-form',
    summary: 'JF Select Form component',
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
    api.use('jf:measurements');

    api.addFiles('both/index.js', ['client', 'server']);
    // Client imports
    api.addFiles('client/index.js', 'client');
    
    api.addFiles('server/index.js', 'server');
});
