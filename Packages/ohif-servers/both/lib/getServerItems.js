import { OHIF } from 'meteor/ohif:core';
import { Servers, CurrentServer } from 'meteor/ohif:servers/both/collections';

OHIF.servers.getServerItems = () => {
    const items = [];
    const servers = Servers.find().fetch();
    servers.forEach(s => {
        items.push({ value: s._id, label: s.name });
    });
    return items;
}
