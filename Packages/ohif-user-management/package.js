Package.describe({
    name: 'ohif:user-management',
    summary: 'OHIF User Management',
    version: '0.0.1'
});

Npm.depends({
    'simpl-schema': '0.2.3'
});

Package.onUse(function(api) {
    api.versionsFrom('1.4');

    api.use('ecmascript');
    api.use('jquery');
    api.use('templating');
    api.use('stylus');
    api.use('random');

    // Schema for Data Models
    api.use('aldeed:collection2-core');
    
    // Template overriding
    api.use('aldeed:template-extension');

    // Our custom packages
    api.use('ohif:design');
    api.use('ohif:core');
    api.use('ohif:user');
    api.use('ohif:study-list');

    // Load icons
    api.addAssets('assets/user-menu-icons.svg', 'client');

    api.addFiles('both/collections.js', ['client', 'server']);
    //api.addFiles('both/schema/reviewers.js', ['client', 'server']);

    // Client imports
    api.addFiles('client/index.js', 'client');

    api.addFiles('server/createDemoUser.js', [ 'server' ]);
    api.addFiles('server/reviewers.js', [ 'server' ]);
    api.addFiles('server/publications.js', [ 'server' ]);

    api.export('Reviewers', [ 'client', 'server' ]);
});
