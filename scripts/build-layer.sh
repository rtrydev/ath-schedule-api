#!/bin/bash

LAYER_DIR=./dist/layers/nodejs

mkdir -p $LAYER_DIR;
cp package*.json $LAYER_DIR;

cd $LAYER_DIR;
npm ci --production;

cd ..;

zip -r layer.zip nodejs;