import { jsPlumb } from 'jsplumb';
import $ from 'jquery';
import uuid from 'uuid/v4'
import state from './state'
import config from './config'
require('../style/app.scss');

state.setProbabilityUpdatedCallback((id, newProbability) => {
  $("#" + id + " .probability .value").text((newProbability * 100).toString() + "%");
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
      <div class="tools">
        <p class="delete">Delete</p>
      </div>
      <div class="probability">
        <div class="value" style="width: ${priorPercent}%" />
      </div>
      <div class="expandHandle" />
    </div>
    `
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
    //
    $('.popover').click(function () {
      $(this).toggleClass('popover-open');
      return false;
    });

    // Delete item control
    //
    $('.tools .delete').click(function (id) {
      instance.remove(id);
      state.deleteStatement(id);
      return false;
    });

    // reapply stopPropagation
    stopDoubleclickPropagation(id);
    rePlumb(instance);
  });

  stopDoubleclickPropagation();
});
