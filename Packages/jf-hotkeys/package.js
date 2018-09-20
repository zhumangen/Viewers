Package.describe({
    name: 'jf:hotkeys',
    summary: 'JF hotkeys management',
    version: '0.0.1'
});

Npm.depends({
    'jquery.hotkeys': '0.1.0'
});

Package.onUse(function(api) {
    api.versionsFrom('1.4');

    // Meteor packages
    api.use([
        'ecmascript',
        'templating',
        'stylus',
        'reactive-var',
        'session',
        'iron:router',
        'u2622:persistent-session'
    ]);

    // JF dependencies
    api.use('jf:commands');
    api.use('jf:core');
    api.use('ohif:core');

    // Main module definition
    api.mainModule('main.js', 'client');

    // Client imports
    api.addFiles('client/index.js', 'client');
});
