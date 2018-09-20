Package.describe({
    name: 'jf:wl-presets',
    summary: 'JF window/level presets management',
    version: '0.0.1'
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

    // OHIF dependencies
    api.use('jf:core');

    // Main module definition
    api.mainModule('main.js', 'client');

    // Client imports
    api.addFiles('client/index.js', 'client');
});
