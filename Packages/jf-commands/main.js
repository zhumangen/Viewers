import { ReactiveVar } from 'meteor/reactive-var';
import { JF } from 'meteor/jf:core';
import { CommandsManager } from 'meteor/jf:commands/client/classes/CommandsManager';

// Create context namespace using a ReactiveVar
const contextName = new ReactiveVar(null);

// Append context namespace to OHIF namespace
JF.managers.contextName = contextName;

// Create commands namespace using a CommandsManager class instance
const commands = new CommandsManager(contextName);

// Append commands namespace to OHIF namespace
JF.managers.commands = commands;

// Export relevant objects
export { context, commands };
