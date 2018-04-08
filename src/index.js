import { jsPlumb } from 'jsplumb'


// Configuration
//

const colorRed = "rgb(255,59,48)";
const colorBlue = "rgb(0,122,255)";
const colorGreen = "rgb(76,217,100)";
const defaultConnectionCurviness = 50;
const InputColor = colorRed;
const OutputEndpointColor = colorGreen;

const instanceOptions = {
  DragOptions: { cursor: 'pointer', zIndex: 2000 },
  PaintStyle: { stroke: colorGreen },
  EndpointHoverStyle: { fill: colorBlue },
  HoverPaintStyle: { stroke: colorBlue },
  EndpointStyle: { width: 16, height: 16, stroke: colorGreen },
  Endpoint: "Dot",
  Anchors: ["TopCenter", "TopCenter"],
  Container: "canvas"
};

const exampleDropOptions = {
  tolerance: "touch",
  hoverClass: "dropHover",
  activeClass: "dragActive"
};

const InputEndpoint = {
  endpoint: ["Dot", { radius: 8 }],
  paintStyle: { fill: colorGreen },
  isSource: true,
  isTarget: true,
  scope: "probabilityConnection",
  connectorStyle: { stroke: colorGreen, strokeWidth: 2 },
  connector: ["Bezier", { curviness: defaultConnectionCurviness }],
  maxConnections: -1,
  dropOptions: exampleDropOptions
};

const OutputEndpoint = {
  endpoint: ["Dot", { radius: 8 }],
  paintStyle: { fill: colorGreen },
  isSource: true,
  isTarget: true,
  scope: "probabilityConnection",
  connectorStyle: { stroke: colorGreen, strokeWidth: 2 },
  connector: ["Bezier", { curviness: defaultConnectionCurviness }],
  maxConnections: -1,
  dropOptions: exampleDropOptions
};


// Update Connections callback
//

const updateConnections = function (conn, isRemoval) {
  console.log("[DEBUG] ", "New connection info: ", isRemoval?"(removal)":"", conn);
};


// Run jsPlumb
//

jsPlumb.ready(function () {

  // instantiate jsPlumb instance
  var instance = jsPlumb.getInstance(instanceOptions);

  instance.batch(function () {

    // event bindings
    instance.bind("connection", function (info, originalEvent) {
      updateConnections(info.connection);
    });
    instance.bind("connectionDetached", function (info, originalEvent) {
      updateConnections(info.connection, true);
    });
    instance.bind("connectionMoved", function (info, originalEvent) {
      updateConnections(info.connection, true);
    });

    instance.bind("click", function (component, originalEvent) {
      alert("click!")
    });

    // make .window divs draggable
    instance.draggable(jsPlumb.getSelector(".drag-drop-demo .window"));

    // add input and output endpoints.
    instance.addEndpoint(jsPlumb.getSelector(".drag-drop-demo .window"), { anchor: "LeftMiddle" }, InputEndpoint);
    instance.addEndpoint(jsPlumb.getSelector(".drag-drop-demo .window"), { anchor: "RightMiddle" }, OutputEndpoint);
  });


});

