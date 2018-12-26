Accounts.onCreateUser(function(options, user) {
  // We still want the default hook's 'profile' behavior.
  if (options.profile){
    user.profile = options.profile;
  }

  return user;
});
