import { OHIF } from 'meteor/ohif:core';
import { JF } from 'meteor/jf:core';
import { measurementTools } from 'meteor/jf:lesiontracker/both/configuration/measurementTools';

export default function storeMeasurements(measurementData, options) {
    OHIF.log.info('Storing Measurements on the Server');

    OHIF.MongoUtils.validateUser();

    const orderId = options.orderId;
    const orderStatus = options.status;

    let filter = {
      orderId,
      userId: Meteor.userId(),
      status: 0
    };

    measurementTools.forEach(tool => {
        MeasurementCollections[tool.id].remove(filter);
    });

    Object.keys(measurementData).forEach(toolId => {
        if (!MeasurementCollections[toolId]) {
            return;
        }

        const measurements = measurementData[toolId];
        measurements.forEach(measurement => {
            delete measurement._id;
            MeasurementCollections[toolId].insert(measurement);
        });
    });

    return JF.orderlist.updateEditStatus(orderId, status, true);
}
