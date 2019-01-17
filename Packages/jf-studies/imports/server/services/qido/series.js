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
    if (filter.seriesInstanceUid) {
        let seriesUids = filter.seriesInstanceUid;
        seriesUids = Array.isArray(seriesUids) ? seriesUids.join() : seriesUids;
        seriesUids = seriesUids.replace(/[^0-9.]+/g, '\\');
        parameters.SeriesInstanceUID = seriesUids;
    }

    return server.qidoRoot + '/series?' + encodeQueryData(parameters);
}

/**
 * Parses resulting data from a QIDO call into a set of Study MetaData
 *
 * @param resultData
 * @returns {Array} An array of Study MetaData objects
 */
function resultDataToSeries(resultData) {
    const seriesArr = [];

    if (!resultData || !resultData.length) return;

    resultData.forEach(series => seriesArr.push({
        studyInstanceUid: DICOMWeb.getString(series['0020000D']),
        // 00080005 = SpecificCharacterSet
        studyDate: DICOMWeb.getString(series['00080020']),
        studyTime: DICOMWeb.getString(series['00080030']),
        accessionNumber: DICOMWeb.getString(series['00080050']),
        referringPhysicianName: DICOMWeb.getString(series['00080090']),
        // 00081190 = URL
        patientName: DICOMWeb.getName(series['00100010']),
        patientId: DICOMWeb.getString(series['00100020']),
        patientBirthdate: DICOMWeb.getString(series['00100030']),
        patientSex: DICOMWeb.getString(series['00100040']),
        studyId: DICOMWeb.getString(series['00200010']),
        studyDescription: DICOMWeb.getString(series['00081030']),
        modalities: DICOMWeb.getString(series['00080060']),
        seriesInstanceUid: DICOMWeb.getString(series['0020000E']),
        seriesDate: DICOMWeb.getString(series['00080021']),
        seriesTime: DICOMWeb.getString(series['00080031']),
        seriesNumber: DICOMWeb.getString(series['00200011']),
        description: DICOMWeb.getString(series['0008103E']),
        institutionName: DICOMWeb.getString(series['00080080']),
        bodyPartExamined: DICOMWeb.getString(series['00180015']),
        numberOfSeriesRelatedInstances: DICOMWeb.getString(series['00201209'])
    }));

    return seriesArr;
}

JF.studies.services.QIDO.Series = (server, filter) => {
    const url = filterToQIDOURL(server, filter);

    try {
        const result = DICOMWeb.getJSON(url, server.requestOptions);
        return { data: resultDataToSeries(result.data), remaining: result.remaining };
    } catch (error) {
        OHIF.log.trace();

        throw error;
    }
};
