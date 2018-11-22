Package.describe({
  name: 'jf:active-entry',
  version: '0.0.1',
  summary: 'SignIn, SignUp, and ForgotPassword pages for Clinical Framework.'
});

Package.onUse(function (api) {
  api.versionsFrom('1.4');

  api.use('ecmascript');
  api.use('stylus');
  api.use('jf:core');

  api.use([
    'meteor-platform',
    'templating',
    'iron:router@1.0.13',
    'session',
    'reactive-dict'
  ], ['client']);

  api.use([
    'accounts-base',
    'accounts-password'
  ]);

  api.use([
    'zuuk:stale-session@1.0.8',
    'random'
  ], ['client', 'server']);

  api.addFiles('client/index.js', 'client');

  api.addFiles('server/index.js', 'server');
});
