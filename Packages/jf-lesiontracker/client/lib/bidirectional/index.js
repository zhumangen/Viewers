import { JF } from 'meteor/jf:core';
import getSelectedHandleKey from './getSelectedHandleKey';
import repositionBidirectionalArmHandle from './repositionBidirectionalArmHandle';
import getLongestAndShortestDiameters from './getLongestAndShortestDiameters';

JF.lesiontracker.bidirectional = {
    toolType: 'bidirectional',
    inverseKeyMap: {
        start: 'end',
        end: 'start',
        perpendicularStart: 'perpendicularEnd',
        perpendicularEnd: 'perpendicularStart'
    },
    perpendicularKeyMap: {
        start: 'perpendicularStart',
        end: 'perpendicularEnd',
        perpendicularStart: 'start',
        perpendicularEnd: 'end'
    },
    getSelectedHandleKey,
    repositionBidirectionalArmHandle,
    getLongestAndShortestDiameters
};
