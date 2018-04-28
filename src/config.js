
// jsPlumb Setup
//
const colorRed = "rgb(255,59,48)";
const colorBlue = "rgb(0,122,255)";
const colorGreen = "rgb(76,217,100)";
const defaultConnectionCurviness = 50;
const InputColor = colorRed;
const OutputEndpointColor = colorGreen;
const exampleDropOptions = {
  tolerance: "touch",
  hoverClass: "dropHover",
  activeClass: "dragActive"
};

export default {
  instanceOptions: {
    DragOptions: { cursor: 'pointer', zIndex: 2000 },
    PaintStyle: { stroke: colorGreen },
    EndpointHoverStyle: { fill: colorBlue },
    HoverPaintStyle: { stroke: colorBlue },
    EndpointStyle: { width: 16, height: 16, stroke: colorGreen },
    Endpoint: "Dot",
    Anchors: ["TopCenter", "TopCenter"],
    Container: "canvas"
  },


  InputEndpoint: {
    endpoint: ["Dot", { radius: 8 }],
    paintStyle: { fill: colorGreen },
    isSource: false,
    isTarget: true,
    scope: "probabilityConnection",
    connectorStyle: { stroke: colorGreen, strokeWidth: 2 },
    connector: ["Bezier", { curviness: defaultConnectionCurviness }],
    maxConnections: -1,
    dropOptions: exampleDropOptions
  },

  OutputEndpoint: {
    endpoint: ["Dot", { radius: 8 }],
    paintStyle: { fill: colorGreen },
    isSource: true,
    isTarget: false,
    scope: "probabilityConnection",
    connectorStyle: { stroke: colorGreen, strokeWidth: 2 },
    connector: ["Bezier", { curviness: defaultConnectionCurviness }],
    maxConnections: -1,
    dropOptions: exampleDropOptions
  },

  // 
  autoCreatedStatementsStartPosition: [100, 100],
  autoCreatedStatementIterationSize: 20,

  // 
  cardOriginX: -8 * 9, // negative spacing-base * 9
  cardOriginY: -8 * 4, // negative spacing-base * 4

  // Direction
  ShowTutorial: false,

  //
  readableDecimals: 2
};
