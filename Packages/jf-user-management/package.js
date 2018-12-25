Package.describe({
    name: 'jf:user-management',
    summary: 'JF Lesion Tracker Tools',
    version: '0.0.1'
});

Package.onUse(function(api) {
    api.versionsFrom('1.4');

    api.use('ecmascript');
    api.use('standard-app-packages');
    api.use('jquery');
    api.use('stylus');
    api.use('random');

    // Schema for Data Models
    api.use('aldeed:simple-schema');
    api.use('aldeed:collection2');

    // Template overriding
    api.use('aldeed:template-extension@4.0.0');

    // Our custom packages
    api.use('jf:design');
    api.use('jf:core');
    api.use('jf:user');
    api.use('jf:active-entry');

    // Load icons
    api.addAssets('assets/user-menu-icons.svg', 'client');

    api.addFiles('both/index.js', ['server', 'client']);

    // Client imports
    api.addFiles('client/index.js', 'client');

    api.addFiles('server/index.js', [ 'server' ]);
});
