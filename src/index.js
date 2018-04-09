import { jsPlumb } from 'jsplumb';
import $ from 'jquery';

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
  conn.addOverlay(["Label", {label: prompt("Likelihood ratio?", "1:1"), id:"label"}]);
};


// Run jsPlumb
// TODO: This might be adding all new endpoints with every call. Is addEndpoint idempotent?
const rePlumb = (instance) => {
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
      console.log("Connection clicked.");
    });

    // make .window divs draggable
    instance.draggable(jsPlumb.getSelector(".drag-drop-demo .window"));

    // add input and output endpoints.
    instance.addEndpoint(jsPlumb.getSelector(".drag-drop-demo .window"), { anchor: "LeftMiddle" }, InputEndpoint);
    instance.addEndpoint(jsPlumb.getSelector(".drag-drop-demo .window"), { anchor: "RightMiddle" }, OutputEndpoint);
  });
}
let instance;
jsPlumb.ready(function () {

  // instantiate jsPlumb instance
  instance = jsPlumb.getInstance(instanceOptions);

  rePlumb(instance);

});


// New Proposition Card Creation
//
$(document).ready(function() {
  $("#canvas").dblclick(function (e) {
    console.log("canvas clicked! ", e.pageX, e.pageY);
    let newCard = `
    <div class="window" style="top:${e.pageY}px; left:${e.pageX}px">
      <textarea class="proposition">Proposition</textarea>
      <p class="prior">
        <span class="label">Prior</span>
        <span class="ratio">
          <span class="n">1</span>
          <span class="d">1</span>
      </p>
      <p class="odds-probability">
        <span class="label">Odds</span>
        <span class="ratio">
          <span class="n">1</span>
          <span class="d">1</span>
      </p>
    </div>
    `
    $("#canvas").append(newCard);
    // reapply stopPropagation (TODO: make efficient)
    $("#canvas *").dblclick(function(e) {
      e.stopPropagation();
    });
    rePlumb(instance);
  });

  $("#canvas *").dblclick(function(e) {
    e.stopPropagation();
  });
})

