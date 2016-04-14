anonymizeStudies = function(studiesToAnonymize) {
    if (studiesToAnonymize.length < 1) {
        return;
    }

    queryStudies(studiesToAnonymize, anonymizeQueriedStudies);
};

function anonymizeQueriedStudies(studiesToAnonymize) {
    var numberOfStudiesToAnonymize = 0;
    studiesToAnonymize.forEach(function(study) {
        numberOfStudiesToAnonymize += getNumberOfFilesInStudy(study);
    });

    var anonymizedStudies = [];
    var anonymizationStatus = { numberOfStudiesAnonymized: 0, numberOfStudiesFailed: 0 };

    progressDialog.show("Anonymizing Studies...", numberOfStudiesToAnonymize);

    studiesToAnonymize.forEach(function(study) {
        sortStudy(study);
        study.seriesList.forEach(function(series) {
            series.instances.forEach(function(instance) {
                //  Download the dicom file
                var xhr = new XMLHttpRequest();
                xhr.open("GET", instance.wadouri, true);
                xhr.responseType = "blob";

                //  Downloaded the dicom file completely
                xhr.onload = function(e) {
                    //  Failed to export a file
                    if (xhr.readyState === 4 && xhr.status !== 200) {
                        updateAnonymizationStatus(anonymizationStatus, false);
                        return;
                    }

                    var blobFile = new Blob([xhr.response], {type: 'application/dicom'});

                    var fileReader = new FileReader();

                    fileReader.onload = function() {
                        // Parse the DICOM File
                        var dicomPart10AsArrayBuffer = fileReader.result;
                        var byteArray = new Uint8Array(dicomPart10AsArrayBuffer);
                        var dataSet = dicomParser.parseDicom(byteArray);

                        dataSet = anonymizeDataSet(dataSet);

                        console.log(dataSet.string('x00100010'));
                        console.log(dataSet.string('x00100020'));

                        //  Create a new file with the anonymized study
                        var anonymizedStudy = new Blob([dataSet.byteArray], {type: "application/dicom"});
                        anonymizedStudy.lastModifiedDate = new Date();
                        anonymizedStudy.name = instance.sopInstanceUid + ".dcm";

                        anonymizedStudies.push(anonymizedStudy);

                        updateAnonymizationStatus(anonymizationStatus, true);

                        var numberOfStudiesProcessed = anonymizationStatus.numberOfStudiesAnonymized + anonymizationStatus.numberOfStudiesFailed;

                        if (numberOfStudiesToAnonymize === numberOfStudiesProcessed) {
                            //  Import anonymized studies
                            importStudies(anonymizedStudies);

                            if (anonymizationStatus.numberOfStudiesFailed > 0) {
                                //TODO: Some files failed to upload, so let user know
                                console.log("Failed to anonymize " + anonymizationStatus.numberOfStudiesFailed + " of " + numberOfStudiesToAnonymize + " studies");
                            }
                        }
                    };

                    fileReader.readAsArrayBuffer(blobFile);
                };

                //  Failed to download the dicom file
                xhr.onerror = function() {
                    updateAnonymizationStatus(anonymizationStatus, false);
                };

                xhr.send();
            });
        });
    });
}

function updateAnonymizationStatus(anonymizationStatus, isSuccess) {
    if (isSuccess) {
        anonymizationStatus.numberOfStudiesAnonymized++;
    } else {
        anonymizationStatus.numberOfStudiesFailed++;
    }

    var numberOfStudiesProcessed = anonymizationStatus.numberOfStudiesAnonymized + anonymizationStatus.numberOfStudiesFailed;
    progressDialog.update(numberOfStudiesProcessed);
}

function anonymizeDataSet(dataSet) {
    dataSet = anonymizeDataSetElement(dataSet, dataSet.elements.x00100010, "Patient^Anonymous"); //  Patients Name (0010,0010)
    //TODO: Anonymize other dicom tags

    return dataSet;
}

function anonymizeDataSetElement(dataSet, targetElement, newValue) {
    //  Resize byte array of data set
    var gapInLength = newValue.length - targetElement.length;
    var newByteArray = new Uint8Array(dataSet.byteArray.length + gapInLength);

    newByteArray.set(dataSet.byteArray.slice(0, targetElement.dataOffset), 0);
    newByteArray.set(dataSet.byteArray.slice(targetElement.dataOffset + targetElement.length, dataSet.byteArray.length), targetElement.dataOffset + newValue.length);

    for(var i = 0; i < newValue.length; i++) {
        newByteArray[targetElement.dataOffset + i] = newValue.charCodeAt(i);
    }

    dataSet.byteArray = newByteArray;

    //  Update elements of data set
    var elementsAfterTargetElement = Object.keys(dataSet.elements).filter(function(key) {
        return dataSet.elements[key].dataOffset > targetElement.dataOffset;
    });

    for(var i = 0; i < elementsAfterTargetElement.length; i++) {
        var elementKeyAfterTargetElement = elementsAfterTargetElement[i];
        dataSet.elements[elementKeyAfterTargetElement].dataOffset += gapInLength;
    }

    dataSet.elements[targetElement.tag].length = newValue.length;

    return dataSet;
}