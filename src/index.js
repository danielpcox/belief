import { jsPlumb } from 'jsplumb';
import $ from 'jquery';
import uuid from 'uuid/v4'
import utils from './utils';
import card from './card'
import state from './state'
import config from './config'
require('../style/app.scss');

state.setProbabilityUpdatedCallback((id, newProbability) => {
  $("#" + id + " .probability .value").text(utils.displayProbability(newProbability));
  console.log(newProbability.toString());
  console.log(id.toString());
  console.log($("#" + id + " .probability .value"));
});

// Extracted function for reapplying jsPlumb
const rePlumb = (instance) => {
  instance.batch(function () {

    // event bindings
    instance.bind("connection", function (info, originalEvent) {
      let conn = info.connection;
      if (!conn.getOverlay("label")) {
        let likelihoodRatio = parseFloat(prompt("How many times more likely is the target if the source turns out to be true?", "1"));
        conn.addOverlay(["Label", { label: likelihoodRatio.toString(), id: "label" }]);
        stopDoubleclickPropagation();

        state.setConnection(conn.source.id, conn.target.id, likelihoodRatio);
      }
    });
    instance.bind("connectionDetached", function (info, originalEvent) {
      let conn = info.connection;
      state.deleteConnection(conn.source.id, conn.target.id);
    });

    //    instance.bind("click", function (component, originalEvent) {
    //      console.log("Connection clicked.");
    //    });

    // make .window divs draggable
    instance.draggable(jsPlumb.getSelector(".drag-drop .window"), { handle: ".drag-drop .window .dragHandle" });

    // add input and output endpoints.
    instance.addEndpoint(jsPlumb.getSelector(".drag-drop .window"), { anchor: "LeftMiddle" }, config.InputEndpoint);
    instance.addEndpoint(jsPlumb.getSelector(".drag-drop .window"), { anchor: "RightMiddle" }, config.OutputEndpoint);
  });
}





// Actually run jsPlumb
let instance;
jsPlumb.ready(function () {
  instance = jsPlumb.getInstance(config.instanceOptions);
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
    let priorPercent = parseFloat(prompt("Best guess probability for the new proposition?", "50"));
    let top = e.pageY;
    let left = e.pageX;
    let id = state.newStatement(top, left);
    state.setPrior(id, priorPercent / 100);
    let newCard = card.createCard(id, top, left, priorPercent);
    $("#canvas").append(newCard);
    //updateProposition(id, { prob: prior, prior: prior });

    // Update prior probability value from range input
    //
    // $('.prior-control input').onChange(function () {
    //   alert('pop');
    //   $(this).setPrior(this.id, this.value);
    //   return false;
    // });


    // Open popovers on click of their trigger
    $('.popover').click(function () {
      $(this).toggleClass('popover-open');
      return false;
    });

    // Power the create-following statement capability
    $('.createFollowingHandle').click(function () {
      // Get the current statement ID
      let priorPercent = parseFloat(prompt("Best guess probability for the new proposition?", "50"));
      let oldStatement = $(this).parents('.window').attr('id');
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

    // Power the prior editing capability
    $('.prior input').change(function () {
      let statement = $(this).parents('.window').attr('id');

      state.setPrior(statement, (this.value / 100));
      return false;
    });

    // Delete item control
    $('.tools .delete').click(function (id) {
      let statement = $(this).parents('.window').attr('id');

      // instance.detachAllConnections(statement);
      jsPlumb.remove(statement);
      state.deleteStatement(statement);
      rePlumb(instance);
    });

    // reapply stopPropagation
    stopDoubleclickPropagation(id);
    rePlumb(instance);
  });

  stopDoubleclickPropagation();
});
