import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

Meteor.methods({
    /**
     * Use the specified filter to conduct a search from the DICOM server
     * @param serverId
     * @param filter
     */
    DicomListSearch(serverId, level, filter) {
        // Get the server data. This is user-defined in the config.json files or through servers
        // configuration modal
        const server = OHIF.servers.getServer(serverId);

        if (!server) {
            throw new Meteor.Error('improper-server-config', 'No properly configured server was available over DICOMWeb or DIMSE.');
        }

        try {
            if (server.type === 'dicomWeb') {
              let l = level.toUpperCase();
              if (l === 'STUDY') {
                return JF.studies.services.QIDO.Studies(server, filter);
              } else if (l === 'SERIES') {
                return JF.studies.services.QIDO.Series(server, filter);
              } else if (l === 'INSTANCE') {
                return JF.studies.services.QIDO.Instances(server, filter);
              } else {
                return new Error('Not supported query level: ' + level);
              }
            } else if (server.type === 'dimse') {
                return JF.studies.services.DIMSE.Series(filter);
            }
        } catch (error) {
            OHIF.log.trace();

            throw error;
        }
    }
});
