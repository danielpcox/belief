import { jsPlumb } from 'jsplumb';
import $ from 'jquery';
import utils from './utils';
import { displayStatement } from './card'
import state from './state'
import config from './config'
import { SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS } from 'constants';
require('../style/app.scss');

state.setProbabilityUpdatedCallback((id, newProbability) => {
  $("#" + id + " .probability .value").html(utils.displayProbability(newProbability));
});

// Extracted function for reapplying jsPlumb
let dontProcessConnectionEvents = false;
const rePlumb = (instance, id) => {
  instance.batch(function () {

    // event bindings 
    instance.bind("connection", function (info, originalEvent) {
      if (!dontProcessConnectionEvents) {
        let conn = info.connection;
        if (!conn.getOverlay("label")) {
          let likelihoodRatio = parseFloat(prompt("How many times more likely is the target if the source turns out to be true?", "1"));
          conn.addOverlay(["Label", { label: likelihoodRatio.toString(), id: "label" }]);
          stopDoubleclickPropagation();

          state.setConnection(conn.source.id, conn.target.id, likelihoodRatio);
        }
      }
    });

    instance.bind("connectionDetached", function (info, originalEvent) {
      let conn = info.connection;
      state.deleteConnection(conn.source.id, conn.target.id);
    });

    let statementSelector = `#${id}`;
    let el = jsPlumb.getSelector(statementSelector);

    // make .card divs draggable
    instance.draggable(el, {
      handle: (statementSelector + " .drag-handle"),
      stop: function (params) {
        state.setPosition(id, params.pos[1], params.pos[0]);
      }
    });

    // add input and output endpoints.
    instance.addEndpoint(el, { anchor: "LeftMiddle" }, config.InputEndpoint);
    instance.addEndpoint(el, { anchor: "RightMiddle" }, config.OutputEndpoint);
  });
}



// Actually run jsPlumb
let instance;
jsPlumb.ready(function () {
  instance = jsPlumb.getInstance(config.instanceOptions);
});


const stopDoubleclickPropagation = (id) => {
  $(id ? `#canvas #${id}` : "#canvas *").dblclick(function (e) {
    e.stopPropagation();
  });
}

$(document).ready(function () {

  $("#canvas").dblclick(function (e) {
    let id = state.createStatement({ top: e.pageY, left: e.pageX });
    displayStatement(id, instance = instance);
    stopDoubleclickPropagation(id);
    rePlumb(instance, id);
  });

  stopDoubleclickPropagation();

  $('#create-statement').click(function (e) {
    let id = state.createStatement();
    displayStatement(id, instance = instance);
    stopDoubleclickPropagation(id);
    rePlumb(instance, id);
  });
  $('#file-input').change(state.load);
  $('#save').click(state.save);

  state.onLoad((statements, connections) => {
    dontProcessConnectionEvents = true;
    _.each(_.keys(statements), (id) => {
      displayStatement(id, statements[id].position.top, statements[id].position.left, statements[id].prior * 100, statements[id].text, statements[id].probability);
      stopDoubleclickPropagation(id);
      rePlumb(instance, id);
    });
    _.each(_.keys(connections), (id) => {
      _.each(connections[id], (lr, targetId) => {
        let conn = instance.connect({
          source: id,
          target: targetId,
          anchors: ["RightMiddle", "LeftMiddle"],
          //overlays: ["Label", { label: lr.toString(), id: "label" }]
        });
        conn.addOverlay(["Label", { label: lr.toString(), id: "label" }]);
      });
    });
    dontProcessConnectionEvents = false;

  });
});

