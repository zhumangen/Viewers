import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';
import { OHIFStudyMetadataSource } from './OHIFStudyMetadataSource';
import { OHIFStudySummary } from './OHIFStudySummary';

JF.studies.classes = {
    OHIFStudyMetadataSource,
    OHIFStudySummary
};
