import { JF } from 'meteor/jf:core';
import { DicomsManager } from 'meteor/jf:import-dicom/client/classes/DicomsManager';

const ImportDicom = new DicomsManager();
JF.managers.importDicom = ImportDicom;

export { ImportDicom };
