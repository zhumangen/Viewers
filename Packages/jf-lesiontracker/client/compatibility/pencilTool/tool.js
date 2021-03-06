import { JF } from 'meteor/jf:core';
import { Viewerbase } from 'meteor/ohif:viewerbase';
import { cornerstone, cornerstoneMath, cornerstoneTools } from 'meteor/ohif:cornerstone';
import { toolType } from './definitions';
import addNewMeasurement from './addNewMeasurement';
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
  // mouseMoveCallback,
  // mouseDownCallback
});

toolInterface.touch = cornerstoneTools.touchTool({
  addNewMeasurement,
  createNewMeasurement,
  onImageRendered,
  pointNearTool: pointNearToolTouch,
  toolType,
  mouseMoveCallback,
  mouseDownCallback
});

cornerstoneTools.targetPencil = toolInterface.mouse;
cornerstoneTools.targetPencil.setConfiguration(configuration);
cornerstoneTools.targetPencilTouch = toolInterface.touch;
