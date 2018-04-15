import { jsPlumb } from 'jsplumb';
import $ from 'jquery';
import uuid from 'uuid/v4'
import state from './state'
require('../style/app.scss');

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
let propositions = {} // e.g., { '5cd58f3c-82db-481f-8395-11950a92e5d5': {prob:1,prior:1} }
const updateProposition = (id, newProp) => {
  propositions[id] = newProp;
  $("#" + id + " .prior .value").text(newProp.prior.toString() + "%");
  $("#" + id + " .probability .value").text(newProp.prob.toString() + "%");
}

state.setProbabilityUpdatedCallback((id, newProbability) => {
  $("#" + id + " .probability .value").text((newProbability*100).toString() + "%");
});

// Update Connections (callback)
//
const updateProb = function (conn, isRemoval) {
  if (!conn.getOverlay("label")) {
    let likelihoodRatio = parseFloat(prompt("How many times more likely is the target if the source turns out to be true?", "1"));
    conn.addOverlay(["Label", { label: likelihoodRatio.toString(), id: "label" }]);
    stopDoubleclickPropagation();

    state.setConnection(conn.source.id, conn.target.id, likelihoodRatio);

    //    // calculate new odds and apply
    //    let sourceProb = propositions[conn.source.id].prob / 100
    //    let oldTargetProb = propositions[conn.target.id].prob / 100
    //    let oldTargetOdds = oldTargetProb / (1 - oldTargetProb)
    //    let oldTargetPrior = propositions[conn.target.id].prior
    //    let lrProbProj = likelihoodRatio / (likelihoodRatio + 1)
    //    let combinedProb = (sourceProb * lrProbProj) + ((1 - sourceProb) * (1 - lrProbProj))
    //    console.log("combinedProb", combinedProb);
    //    let combinedLikelihoodRatio = combinedProb / (1 - combinedProb)
    //    console.log("combinedLikelihoodRatio", combinedLikelihoodRatio);
    //    let finalOdds = oldTargetOdds * combinedLikelihoodRatio
    //    let finalProb = finalOdds / (finalOdds + 1)
    //    console.log("finalProb", finalProb);
    //
    //    updateProposition(conn.target.id, { prob: finalProb * 100, prior: oldTargetPrior });
  }
};




// Extracted function for reapplying jsPlumb
// TODO: This might be adding all new endpoints with every call. Is addEndpoint idempotent?
// TODO: Getting ".each iteration failed : TypeError: Cannot read property 'force' of undefined" for each pre-existing card when rePlumb is called
const rePlumb = (instance) => {
  instance.batch(function () {

    // event bindings
    instance.bind("connection", function (info, originalEvent) {
      updateProb(info.connection);
    });
    instance.bind("connectionDetached", function (info, originalEvent) {
      updateProb(info.connection, true);
    });

    instance.bind("click", function (component, originalEvent) {
      console.log("Connection clicked.");
    });

    // make .window divs draggable
    instance.draggable(jsPlumb.getSelector(".drag-drop .window"), { handle: ".drag-drop .window .dragHandle" });

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
  // $(id ? `#canvas ${id}` : "#canvas *").dblclick(function (e) {
  //   e.stopPropagation();
  // });
}

$(document).ready(function () {

  $("#canvas").dblclick(function (e) {
    let priorPercent = parseFloat(prompt("Best guess probability for the new proposition?", "50"));
    let top = e.pageY;
    let left = e.pageX;
    let id = state.newStatement(top, left);
    state.setPrior(id, priorPercent / 100);
    let newCard = `
    <div class="window" id="${id}" style="top:${top}px; left:${left}px">
      <div class="dragHandle" />
      <p class="text" contenteditable="true">Statement</p>
      <div class="popover">
        <p class="prior popover-toggle">
          <span class="label">Prior</span>
          <span class="value">${priorPercent}%</span>
        </p>
        <div class="prior-control popover-content">
          <div class="control-range">
            <label for ${id}-prior-content>
              ${priorPercent}
              <input class="control-range" type="range" name="${id}-prior-control" defaultValue=${priorPercent}/>
              <div class="probability-slider-help">
                <span>0%</span>
                <span>|</span>
                <span>|</span>
                <span>|</span>
                <span>100%</span>
              </div>
            </label>
          </div>
        </div>
      </div>
      <div class="probability">
        <div class="value" style="width: ${priorPercent}%" />
      </div>
      <div class="expandHandle" />
    </div>
    `
    $("#canvas").append(newCard);
    //updateProposition(id, { prob: prior, prior: prior });


    // Open popovers on click of their trigger
    //
    $('.popover').click(function () {
      $(this).toggleClass('popover-open');
      return false;
    });

    // reapply stopPropagation
    stopDoubleclickPropagation(id);
    rePlumb(instance);
  });

  stopDoubleclickPropagation();
})

<<<<<<< HEAD
//id1 = state.newStatement(0,0);
//state.newStatement(1,1);
//state.setConnection();
=======
console.log(network)
>>>>>>> master
