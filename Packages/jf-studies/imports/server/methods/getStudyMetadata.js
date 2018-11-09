import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

Meteor.methods({
    /**
     * Retrieves Study metadata given a Study Instance UID
     * This Meteor method is available from both the client and the server
     */
    GetStudyMetadata: function(serverId, studyInstanceUid) {
        OHIF.log.info('GetStudyMetadata(%s)', serverId + ', ' + studyInstanceUid);

        // Get the server data. This is user-defined in the config.json files or through servers
        // configuration modal
        const server = OHIF.servers.getServer(serverId);

        if (!server) {
            throw new Meteor.Error('improper-server-config', 'No properly configured server was available over DICOMWeb or DIMSE.');
        }

        try {
            if (server.type === 'dicomWeb') {
                return JF.studies.services.WADO.RetrieveMetadata(server, studyInstanceUid);
            } else if (server.type === 'dimse') {
                return JF.studies.services.DIMSE.RetrieveMetadata(studyInstanceUid);
            }
        } catch (error) {
            OHIF.log.trace();

            throw error;
        }
    }
});
