import { JF } from 'meteor/jf:core';
import { OperationsManager } from 'meteor/jf:operations/both/classes/operationsManager';

const Operations = new OperationsManager();
JF.managers.operations = Operations;

export { Operations }
