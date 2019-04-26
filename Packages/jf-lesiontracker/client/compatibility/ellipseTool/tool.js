import { JF } from 'meteor/jf:core';
import { Viewerbase } from 'meteor/jf:viewerbase';
import { cornerstone, cornerstoneMath, cornerstoneTools } from 'meteor/ohif:cornerstone';
import { toolType } from './definitions';
import addNewMeasurement from './addNewMeasurement';
import addNewMeasurementTouch from './addNewMeasurementTouch';
import doubleClickCallback from './doubleClickCallback';
import onImageRendered from './onImageRendered';
import createNewMeasurement from './createNewMeasurement';
import mouseMoveCallback from './mouseMoveCallback';
import mouseDownCallback from './mouseDownCallback';
import { pointNearTool, pointNearToolTouch } from './pointNearTool';

const toolDefaultStates = Viewerbase.toolManager.getToolDefaultStates();
const textBoxConfig = toolDefaultStates.textBoxConfig;

const configuration = {
    drawHandles: false,
    drawHandlesOnHover: true,
    arrowFirst: true,
    textBox: textBoxConfig
};

// Used to cancel tool placement
const toolInterface = { toolType };

toolInterface.mouse = cornerstoneTools.mouseButtonTool({
  addNewMeasurement,
  createNewMeasurement,
  onImageRendered,
  pointNearTool,
  toolType,
  mouseDoubleClickCallback: doubleClickCallback,
  mouseMoveCallback,
  mouseDownCallback
});

Object.assign(toolInterface.mouse, {mouseMoveCallback, mouseDownCallback});

toolInterface.touch = cornerstoneTools.touchTool({
  addNewMeasurement: addNewMeasurementTouch,
  createNewMeasurement,
  onImageRendered,
  pointNearTool: pointNearToolTouch,
  toolType
});

cornerstoneTools[toolType] = toolInterface.mouse;
cornerstoneTools[toolType].setConfiguration(configuration);
cornerstoneTools[toolType + 'Touch'] = toolInterface.touch;
