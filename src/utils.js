import config from './config';
import state from './state';
import $ from 'jquery';

const readableDecimals = 2;
let dontProcessConnectionEvents = false;

// 
const stopDoubleclickPropagation = (id) => {
  $(id ? `#canvas #${id}` : "#canvas *").dblclick(function (e) {
    e.stopPropagation();
  });
};

export default {

  displayProbability: (probability, style) => {
    let readableProbability = '';
    style = style ? style : 'probability';

    switch (style) {
      case 'odds':
        let numerator = '1';
        let denominator = (1 / probability) - 1;
        readableProbability = numerator + ":" + Math.round(denominator, readableDecimals);
        break;
      default:
        let value = Math.round(probability * 100, readableDecimals).toString();
        let unit = '%';
        readableProbability = value;
        break;
    }

    // Create a display component classed with display
    // method for styling control, then display
    // the resulting readable probability. If there's 
    // a unit to display, display it too.
    return (`
      <span class="probability style-${style}">
        <span>${readableProbability}</span>
      </span>
    `);
  },

  stopDoubleclickPropagation: (id) => {
    stopDoubleclickPropagation(id);
  },

  // Extracted function for reapplying jsPlumb
  rePlumb: (instance, id) => {
    instance.batch(function () {

      // Create event bindings 
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

      // Add input and output endpoints
      let instanceElement = jsPlumb.getSelector(`#${id}`);
      instance.addEndpoint(instanceElement, { anchor: "LeftMiddle" }, config.InputEndpoint);
      instance.addEndpoint(instanceElement, { anchor: "RightMiddle" }, config.OutputEndpoint);
    });
  },

};
