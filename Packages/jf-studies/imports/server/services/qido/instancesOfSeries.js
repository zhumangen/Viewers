import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

/**
 * Creates a QIDO URL given the server settings and a series instance UID
 * @param server
 * @param studyInstanceUid
 * @param seriesInstanceUid
 * @returns {string} URL to be used for QIDO calls
 */
function buildUrl(server, studyInstanceUid, seriesInstanceUid) {
    return server.qidoRoot + '/studies/' + studyInstanceUid + '/series/' + seriesInstanceUid + '/instances';
}

/**
 * Parses data returned from a QIDO search and transforms it into
 * an array of series that are present in the series
 *
 * @param server The DICOM server
 * @param seriesInstanceUid
 * @param resultData
 * @returns {Array} Series List
 */
function resultDataToStudyMetadata(server, studyInstanceUid, seriesInstanceUid, resultData) {
    var instanceMap = {};
    var instanceList = [];

    resultData.forEach(function(instance) {
        // Use instanceMap to cache instance data
        // If the sop instance UID has already been used to
        // process instance data, continue using that instance
        var sopInstanceUid = DICOMWeb.getString(instance['00080018']);
        var instance = instanceMap[sopInstanceUid];

        // If no instance data exists in the instanceMap cache variable,
        // process any available instance data
        if (!instance) {
          // The uri for the dicomweb
          // NOTE: DCM4CHEE seems to return the data zipped
          // NOTE: Orthanc returns the data with multi-part mime which cornerstoneWADOImageLoader doesn't
          //       know how to parse yet
          //var uri = DICOMWeb.getString(instance['00081190']);
          //uri = uri.replace('wado-rs', 'dicom-web');

          // manually create a WADO-URI from the UIDs
          // NOTE: Haven't been able to get Orthanc's WADO-URI to work yet - maybe its not configured?

          var uri = server.wadoUriRoot + '?requestType=WADO&studyUID=' + studyInstanceUid + '&seriesUID=' + seriesInstanceUid + '&objectUID=' + sopInstanceUid + '&contentType=application%2Fdicom';

          instance = {
            sopClassUid: DICOMWeb.getString(instance['00080016']),
            sopInstanceUid: sopInstanceUid,
            uri: uri,
            instanceNumber: DICOMWeb.getString(instance['00200013'])
          };

          // Save this data in the instanceMap cache variable
          instanceMap[sopInstanceUid] = instance;
        }

        instanceList.push(instance);
    });

    return instanceList;
}

/**
 * Retrieve a set of instances using a QIDO call
 * @param server
 * @param studyInstanceUid
 * @throws ECONNREFUSED
 * @returns {{wadoUriRoot: String, studyInstanceUid: String, seriesInstanceUid: String, instanceList: Array}}
 */
JF.studies.services.QIDO.InstancesOfSeries = function(server, studyInstanceUid, seriesInstanceUid) {
    var url = buildUrl(server, seriesInstanceUid, seriesInstanceUid);

    try {
        var result = DICOMWeb.getJSON(url, server.requestOptions);

        return {
            wadoUriRoot: server.wadoUriRoot,
            studyInstanceUid: studyInstanceUid,
            seriesInstanceUid: seriesInstanceUid,
            instanceList: resultDataToSeriesMetadata(server, seriesInstanceUid, result.data)
        };
    } catch (error) {
        OHIF.log.trace();

        throw error;
    }

};
