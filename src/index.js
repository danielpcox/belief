import { jsPlumb } from 'jsplumb';
import $ from 'jquery';
import uuid from 'uuid/v4'

// Setup
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
  isSource: false,
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
  isTarget: false,
  scope: "probabilityConnection",
  connectorStyle: { stroke: colorGreen, strokeWidth: 2 },
  connector: ["Bezier", { curviness: defaultConnectionCurviness }],
  maxConnections: -1,
  dropOptions: exampleDropOptions
};

// Propositions datastructure
let propositions = {} // e.g., { '5cd58f3c-82db-481f-8395-11950a92e5d5': {odds:1,prior:1} }
const updateProposition = (id, newProp) => {
  propositions[id] = newProp;
  $("#" + id + " .prior .ratio .n").text(newProp.prior);
  $("#" + id + " .odds .ratio .n").text(newProp.odds);
}



// Update Connections (callback)
//
const updateOdds = function (conn, isRemoval) {
  if (!conn.getOverlay("label")) {
    let likelihoodRatio = parseFloat(prompt("How many times more likely is the target if the source turns out to be true?", "1"));
    conn.addOverlay(["Label", { label: likelihoodRatio.toString(), id: "label" }]);
    stopDoubleclickPropagation();

    // calculate new odds and apply
    let sourceOdds = propositions[conn.source.id].odds
    let oldTargetPropOdds = propositions[conn.target.id].odds
    let oldTargetPropPrior = propositions[conn.target.id].prior
    let sourceProb = sourceOdds / (sourceOdds + 1);
    let lrProbProj = likelihoodRatio / (likelihoodRatio + 1)
    let combinedProb = (sourceProb * lrProbProj) + ( (1-sourceProb)*(1-lrProbProj) )
    console.log("combinedProb", combinedProb);
    let combinedLikelihoodRatio = combinedProb / (1 - combinedProb)
    console.log("combinedLikelihoodRatio", combinedLikelihoodRatio);

    updateProposition(conn.target.id,{odds:oldTargetPropOdds*combinedLikelihoodRatio, prior:oldTargetPropPrior});
  }
};




// Extracted function for reapplying jsPlumb
// TODO: This might be adding all new endpoints with every call. Is addEndpoint idempotent?
// TODO: Getting ".each iteration failed : TypeError: Cannot read property 'force' of undefined" for each pre-existing card when rePlumb is called
const rePlumb = (instance) => {
  instance.batch(function () {

    // event bindings
    instance.bind("connection", function (info, originalEvent) {
      updateOdds(info.connection);
    });
    instance.bind("connectionDetached", function (info, originalEvent) {
      updateOdds(info.connection, true);
    });

    instance.bind("click", function (component, originalEvent) {
      console.log("Connection clicked.");
    });

    // make .window divs draggable
    instance.draggable(jsPlumb.getSelector(".drag-drop .window"));

    // add input and output endpoints.
    instance.addEndpoint(jsPlumb.getSelector(".drag-drop .window"), { anchor: "LeftMiddle" }, InputEndpoint);
    instance.addEndpoint(jsPlumb.getSelector(".drag-drop .window"), { anchor: "RightMiddle" }, OutputEndpoint);
  });
}



// Actually run jsPlumb
let instance;
jsPlumb.ready(function () {
  instance = jsPlumb.getInstance(instanceOptions);
  rePlumb(instance);
});




// New Proposition Card Creation
//
const stopDoubleclickPropagation = (id) => {
  $(id ? `#canvas ${id}` : "#canvas *").dblclick(function (e) {
    e.stopPropagation();
  });
}

$(document).ready(function () {
  $("#canvas").dblclick(function (e) {
    let id = uuid();
    let prior = parseFloat(prompt("Prior odds for new proposition?", "1"));
    let newCard = `
    <div class="window" id="${id}" style="top:${e.pageY}px; left:${e.pageX}px">
      <textarea class="proposition">Proposition</textarea>
      <p class="prior">
        <span class="label">Prior</span>
        <span class="ratio">
          <span class="n">${prior}</span>
          <span class="d">1</span>
      </p>
      <p class="odds">
        <span class="label">Odds</span>
        <span class="ratio">
          <span class="n">${prior}</span>
          <span class="d">1</span>
      </p>
    </div>
    `
    $("#canvas").append(newCard);
    //propositions[id] = {odds:prior, prior:prior}
    //console.log(propositions);
    updateProposition(id, { odds: prior, prior: prior });
    // reapply stopPropagation
    stopDoubleclickPropagation(id);
    rePlumb(instance);
  });

  stopDoubleclickPropagation();
})

