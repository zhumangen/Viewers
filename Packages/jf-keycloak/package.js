Package.describe({
    name: 'jf:keycloak',
    summary: 'JF keycloak connector',
    version: '0.0.1'
});

Package.onUse(function(api) {
    api.versionsFrom('1.4');

    // Meteor packages
    api.use([
        'ecmascript',
        'keycloak-js'
    ]);

    // JF dependencies
    api.use('jf:core');

    api.addFiles('main.js', [ 'client', 'server' ]);
});
