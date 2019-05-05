import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

/**
 * Creates a QIDO date string for a date range query
 * Assumes the year is positive, at most 4 digits long.
 *
 * @param date The Date object to be formatted
 * @returns {string} The formatted date string
 */
function dateToString(date) {
    if (!date) return '';
    let year = date.getFullYear().toString();
    let month = (date.getMonth() + 1).toString();
    let day = date.getDate().toString();
    year = '0'.repeat(4 - year.length).concat(year);
    month = '0'.repeat(2 - month.length).concat(month);
    day = '0'.repeat(2 - day.length).concat(day);
    return ''.concat(year, month, day);
}

/**
 * Produces a QIDO URL given server details and a set of specified search filter
 * items
 *
 * @param server
 * @param filter
 * @returns {string} The URL with encoded filter query data
 */
function filterToQIDOURL(server, filter) {
    const commaSeparatedFields = [
        '00081030', // Study Description
        '00080060', //Modality
        '00080080'
        // Add more fields here if you want them in the result
    ].join(',');

    const parameters = {
        PatientName: filter.patientName,
        PatientID: filter.patientId,
        AccessionNumber: filter.accessionNumber,
        SeriesNumber: filter.seriesNumber,
        SeriesDescription: filter.seriesDescription,
        Modality: filter.modality,
        InstitutionName: filter.institutionName,
        limit: filter.limit,
        offset: filter.offset,
        includefield: server.qidoSupportsIncludeField ? 'all' : commaSeparatedFields
    };

    // build the SeriesDate range parameter
    if (filter.studyDateFrom || filter.studyDateTo) {
        const dateFrom = dateToString(new Date(filter.studyDateFrom));
        const dateTo = dateToString(new Date(filter.studyDateTo));
        parameters.StudyDate = `${dateFrom}-${dateTo}`;
    }

    // Build the SeriesInstanceUID parameter
    if (filter.sopInstanceUid) {
        let sopUids = filter.sopInstanceUid;
        sopUids = Array.isArray(sopUids) ? sopUids.join() : sopUids;
        sopUids = sopUids.replace(/[^0-9.]+/g, '\\');
        parameters.SopInstanceUID = sopUids;
    }

    return server.qidoRoot + '/instances?' + encodeQueryData(parameters);
}

/**
 * Parses resulting data from a QIDO call into a set of Study MetaData
 *
 * @param resultData
 * @returns {Array} An array of Study MetaData objects
 */
function resultDataToInstances(resultData) {
    const instanceArr = [];

    if (!resultData || !resultData.length) return;

    resultData.forEach(instance => instanceArr.push({
        studyInstanceUid: DICOMWeb.getString(instance['0020000D']),
        // 00080005 = SpecificCharacterSet
        studyDate: DICOMWeb.getString(instance['00080020']),
        studyTime: DICOMWeb.getString(instance['00080030']),
        accessionNumber: DICOMWeb.getString(instance['00080050']),
        referringPhysicianName: DICOMWeb.getString(instance['00080090']),
        // 00081190 = URL
        patientName: DICOMWeb.getName(instance['00100010']),
        patientId: DICOMWeb.getString(instance['00100020']),
        patientBirthdate: DICOMWeb.getString(instance['00100030']),
        patientSex: DICOMWeb.getString(instance['00100040']),
        studyId: DICOMWeb.getString(instance['00200010']),
        studyDescription: DICOMWeb.getString(instance['00081030']),
        modalities: DICOMWeb.getString(instance['00080060']),
        seriesInstanceUid: DICOMWeb.getString(instance['0020000E']),
        seriesDate: DICOMWeb.getString(instance['00080021']),
        seriesTime: DICOMWeb.getString(instance['00080031']),
        seriesNumber: DICOMWeb.getString(instance['00200011']),
        description: DICOMWeb.getString(instance['0008103E']),
        institutionName: DICOMWeb.getString(instance['00080080']),
        bodyPartExamined: DICOMWeb.getString(instance['00180015']),
        sopClassUid: DICOMWeb.getString(instance['00080016']),
        sopInstanceUid: DICOMWeb.getString(instance['00080018']),
        InstanceNumber: DICOMWeb.getString(instance['00200013']),
        ContentDate: DICOMWeb.getString(instance['00080023']),
        ContentTime: DICOMWeb.getString(instance['00080033'])
    }));

    return instanceArr;
}

JF.studies.services.QIDO.Instances = (server, filter) => {
    const url = filterToQIDOURL(server, filter);

    try {
        const result = DICOMWeb.getJSON(url, server.requestOptions);
        return { data: resultDataToInstances(result.data), remaining: result.remaining };
    } catch (error) {
        OHIF.log.trace();

        throw error;
    }
};
