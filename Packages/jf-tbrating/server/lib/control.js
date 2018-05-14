import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';
import { TbRatings } from 'meteor/jf:tbrating/both/collections';

JF.tbrating.control = {
    writeCallback(error, affected) {
        if (error) {
            throw new Meteor.Error('data-write', error);
        }
    },
    
    save(tbData) {
        const qry = {
            serverId: tbData.serverId,
            studyUid: tbData.studyUid,
            seriesUid: tbData.seriesUid,
            imageUid: tbData.imageUid
        };
        
        let record = {
            serverId: tbData.serverId,
            studyUid: tbData.studyUid,
            seriesUid: tbData.seriesUid,
            imageUid: tbData.imageUid,
            results: [{
                tb: tbData.tb,
                score: tbData.score,
                userId: tbData.userId,
                lastModified: new Date()
            }]
        }
        
        let exist = TbRatings.findOne(qry);
        if (!exist) {
            return TbRatings.insert(record, this.writeCallback);
        } else {
            let found = false;
            exist.results.forEach( (tbRec, idx) => {
                if (tbRec.userId === tbData.userId) {
                    exist.results[idx] = record.results[0];
                    found = true;
                }
            });
            if (!found) {
                exist.results.push(record.results[0]);
            }
            
            return TbRatings.update({_id: exist._id}, exist, null, this.writeCallback);
        }
    }
}