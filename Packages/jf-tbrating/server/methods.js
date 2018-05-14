import { Meteor } from 'meteor/meteor';
import { OHIF } from 'meteor/ohif:core';
import { JF } from 'meteor/jf:core';

Meteor.methods({
    saveTbRating: tbData => {
        OHIF.log.info('Storing TbRatings on the server.');
        OHIF.log.info(JSON.stringify(tbData, null, 2));
        return JF.tbrating.control.save(tbData);
    }

});
