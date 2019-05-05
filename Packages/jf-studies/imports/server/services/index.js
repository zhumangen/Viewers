import './namespace.js';

// DICOMWeb instance, study, and metadata retrieval
import './qido/instancesOfStudy.js';
import './qido/instancesOfSeries.js';
import './qido/studies.js';
import './qido/series.js';
import './qido/instances.js';
import './wado/retrieveMetadata.js';

// DIMSE instance, study, and metadata retrieval
import './dimse/instances.js';
import './dimse/studies.js';
import './dimse/retrieveMetadata.js';
import './dimse/setup.js';

// Study, instance, and metadata retrieval from remote PACS via Orthanc as a proxy
import './remote/instances.js';
import './remote/studies.js';
import './remote/retrieveMetadata.js';
