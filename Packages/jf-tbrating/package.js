Package.describe({
    name: 'jf:tbrating',
    summary: 'Jiu Feng Tuberculosis Rating Tool',
    version: '0.0.1'
});

Package.onUse(function(api) {
    api.versionsFrom('1.4');

    api.use('ecmascript');
    api.use('standard-app-packages');
    api.use('jquery');
    api.use('stylus');
    api.use('random');

    api.use('validatejs');
    
    api.use('jf:core');

    // Template overriding
    api.use('aldeed:template-extension@4.0.0');

    api.addFiles('client/components/slider/build.css', 'client');
    api.addFiles('client/components/slider/font-awesome.css', 'client');
    
    api.mainModule('main.js', ['client', 'server']);

    api.addFiles('both/index.js', [ 'client', 'server' ]);

    api.addFiles('server/index.js', 'server');

    api.addFiles('client/index.js', 'client');
});
