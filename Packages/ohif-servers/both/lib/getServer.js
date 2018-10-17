import { OHIF } from 'meteor/ohif:core';
import { Servers } from 'meteor/ohif:servers/both/collections';

/**
 * Retrieves the current server configuration used to retrieve studies
 */
OHIF.servers.getServer = serverId => {
    const serverConfiguration = Servers.findOne({ _id: serverId });

    return serverConfiguration;
};
