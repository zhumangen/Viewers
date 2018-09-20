Package.describe({
    name: 'jf:metadata',
    summary: 'JF Metadata classes',
    version: '0.0.1'
});

Package.onUse(function(api) {
    api.versionsFrom('1.4');

    api.use('ecmascript');

    api.use('ohif:core');
    api.use('jf:viewerbase');
    api.use('jf:core');

    api.mainModule('main.js', 'client');
});
