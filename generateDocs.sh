#!/bin/bash

# This script is used to generate docs in the given format for each js file in the given path separately

# How to run:
# 1. npm install -g documentation (if not installed)
# 2. Install additional npm modules (if required based on project)
#   2.1. npm install babel-preset-env (if not installed for cornerstone)
# 3. ./generateDocs.sh

docsDir="docs/jsDocs"

mkdir -p $docsDir

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

        # Skip if it is public
        if [[ "$fileOrDirToDoc" == *public* ]]
        then
            continue
        fi

        if [ -d $fileOrDirToDoc ] && [ `find $fileOrDirToDoc -name '*.js' | wc -l` -gt 0 ]
        then
            document $fileOrDirToDoc $2
            continue
        fi

        if [ -f $fileOrDirToDoc ] && [[ "$fileOrDirToDoc" == *.js ]]
        then
            echo "Documenting in $2... " $fileOrDirToDoc
            documentation build $fileOrDirToDoc -f $2 --shallow -o $docsDir/$fileOrDirToDoc.$2
        fi
    done
}

# Generate documentation in markdown
document OHIFViewer md
document LesionTracker md
document Packages md
