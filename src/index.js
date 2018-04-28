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

// Actually run jsPlumb
export let instance;
jsPlumb.ready(function () {
  instance = jsPlumb.getInstance(config.instanceOptions);
});

$(document).ready(function () {

  if (config.ShowTutorial == true) {

    let id = '';

    id = state.createStatement({
      text: 'Pizza is good to eat',
      top: 200,
      left: 200,
      prior: 0.95
    });
    let tutorialCard1 = id;
    displayStatement({ instance, id });

    id = state.createStatement({
      text: 'I should eat Pizza',
      top: 200,
      left: 500,
      prior: 0.5
    });
    let tutorialCard2 = id;
    displayStatement({ instance, id });

    state.setConnection(tutorialCard1, tutorialCard2, 10.0);
    utils.rePlumb(instance, tutorialCard1);
    utils.rePlumb(instance, tutorialCard2);
  }

  $("#canvas").dblclick(function (e) {
    let cardPosition = {
      y: (e.pageY + config.cardOriginY),
      x: (e.pageX + config.cardOriginX),
    }
    let id = state.createStatement({ top: cardPosition.y, left: cardPosition.x });
    displayStatement({ instance, id });
    utils.stopDoubleclickPropagation(id);
    utils.rePlumb(instance, id);
  });

  utils.stopDoubleclickPropagation();

  $('#create-statement').click(function () {
    let id = state.createStatement({ top: config.autoCreatedStatementsStartPosition[0], left: config.autoCreatedStatementsStartPosition[1] });
    displayStatement({ instance, id });
    config.autoCreatedStatementsStartPosition[0] += config.autoCreatedStatementIterationSize;
    config.autoCreatedStatementsStartPosition[1] += config.autoCreatedStatementIterationSize;
    utils.stopDoubleclickPropagation(id);
    utils.rePlumb(instance, id);
  });
  $('#file-input').change(state.load);
  $('#save').click(state.save);

  state.onLoad((statements, connections) => {
    state.processConnectionEvents = false;
    _.each(_.keys(statements), (id) => {
      displayStatement({instance, id});
      utils.stopDoubleclickPropagation(id);
      utils.rePlumb(instance, id);
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
    state.processConnectionEvents = true;

  });
});

