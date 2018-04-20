import { jsPlumb } from 'jsplumb';
import $ from 'jquery';
import utils from './utils';
import { createStatement } from './card'
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

    //    instance.bind("click", function (component, originalEvent) {
    //      console.log("Connection clicked.");
    //    });

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


// New Proposition Card Creation
//
const stopDoubleclickPropagation = (id) => {
  $(id ? `#canvas #${id}` : "#canvas *").dblclick(function (e) {
    e.stopPropagation();
  });
}

$(document).ready(function () {

  $("#canvas").dblclick(function (e) {
    let id = state.newStatement(e.pageY, e.pageX);
    createStatement(id, e.pageY, e.pageX);
    // reapply stopPropagation
    stopDoubleclickPropagation(id);
    rePlumb(instance, id);
  });

  stopDoubleclickPropagation();

  $('#file-input').change(state.load);
  $('#save').click(state.save);

  state.onLoad((statements, connections) => {
    dontProcessConnectionEvents = true;
    _.each(_.keys(statements), (id) => {
      let newCard = card.createCard(id, statements[id].position.top, statements[id].position.left, statements[id].prior * 100, statements[id].text, statements[id].probability);
      $("#canvas").append(newCard);

      /////////EWWWWW COPIED IN FROM ABOVE. REFACTOR THIS. vvvvvvv
      // Power the create-following statement capability
      $(`#${id} .createFollowingHandle`).click(function () {
        // Get the current statement ID
        let priorPercent = parseFloat(prompt("Best guess probability for the new proposition?", "50"));
        let oldStatement = $(this).parents('.card').attr('id');
        let newTop = oldStatement.top;
        let newLeft = oldStatement.left + 100;
        let newStatementId = state.newStatement(newTop, newLeft);
        state.setPrior(newStatementId, priorPercent / 100);
        // run function to create new statment from template
        // with the same top property as the source statement
        // and the left property as some spacing value added
        // to the source statement
        // end
        card.createCard(newStatementId, newTop, newLeft, priorPercent);
        $("#canvas").append(newCard);
        return false;
      });

      // Power saving/editing the statement text
      $(`#${id} .text`).on('input', function (e) {
        state.setText(id, e.delegateTarget.innerHTML);
      })

      // Power the prior editing capability
      $(`#${id} .prior input`).change(function () {
        state.setPrior(id, (this.value / 100));
        return false;
      });

      // Power the delete item control
      $(`#${id} .tools .delete`).click(function (id) {
        if (state.exists(id)) {
          instance.remove(id);
          state.deleteStatement(id);
          rePlumb(instance, id);
        }
      });

      // reapply stopPropagation
      stopDoubleclickPropagation(id);
      rePlumb(instance, id);


      /////////EWWWWW COPIED IN FROM ABOVE. REFACTOR THIS. ^^^^^^^^
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
