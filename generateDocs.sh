#!/bin/bash

# How to run this script:
# npm install -g documentation (If it is not installed)
# ./generateDocs.sh

docsDir="docs"

mkdir -p $docsDir
rm -rf $docsDir/*

document() {
    mkdir -p $docsDir/$1
    for fileOrDirToDoc in $1/*
    do
        # Skip if it is a node module
        if [[ "$fileOrDirToDoc" == *node_modules* ]]
        then
            continue
        fi

        # Skip if it is a test
        if [[ "$fileOrDirToDoc" == *test* ]]
        then
            continue
        fi

        # Skip if it is a file and not js file
        if [ -f $fileOrDirToDoc ] && [ "$fileOrDirToDoc" != *.js ]
        then
            continue
        fi

        # Skip if it is a directory and does not contain any js file even in its sub directories
        if [ -d $fileOrDirToDoc ] && [ `find $fileOrDirToDoc -name *.js | wc -l` -le 0 ]
        then
            continue
        fi

        echo "Documenting in $2... " $fileOrDirToDoc
        documentation build $fileOrDirToDoc/**/*.js -f $2 -o $docsDir/$fileOrDirToDoc.$2
    done
}

# Generate documentation for all project folders in markdown
document Packages md
document OHIFViewer md
document LesionTracker md
