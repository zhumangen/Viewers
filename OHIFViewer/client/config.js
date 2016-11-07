import { cornerstoneWADOImageLoader } from 'meteor/cornerstone';

Meteor.startup(function() {
	const maxWebWorkers = Math.max(navigator.hardwareConcurrency - 1, 1);
    const config = {
	    maxWebWorkers: maxWebWorkers,	
    	startWebWorkersOnDemand: true,
        webWorkerPath : '/packages/cornerstone/public/js/cornerstoneWADOImageLoaderWebWorker.js',
        taskConfiguration: {
            'decodeTask' : {
		        loadCodecsOnStartup : true,
		        initializeCodecsOnStartup: false,
                codecsPath: '/packages/cornerstone/public/js/cornerstoneWADOImageLoaderCodecs.js',
                usePDFJS: false
            }
        }
    };

    cornerstoneWADOImageLoader.webWorkerManager.initialize(config);
});