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
      text: 'Pizza',
      top: 200,
      left: 200,
      prior: 0.1
    });
    let tutorialCard1 = id;
    displayStatement({ instance, id });

    id = state.createStatement({
      text: 'Cake',
      top: 200,
      left: 400,
      prior: 0.9
    });
    let tutorialCard2 = id;
    displayStatement({ instance, id });

    id = state.createStatement({
      text: 'Ice Cream',
      top: 200,
      left: 600,
      prior: 0.6
    });
    displayStatement({ instance, id });
    let tutorialCard3 = id;


    // state.setConnection(tutorialCard1, tutorialCard2, 10);
    // state.setConnection(tutorialCard2, tutorialCard3, 5);
    // utils.rePlumb(instance, tutorialCard1);
    // utils.rePlumb(instance, tutorialCard2);
    // utils.rePlumb(instance, tutorialCard3);
    // state.recalculateProbabilitiesFrom(tutorialCard1);

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
      displayStatement(id, statements[id].position.top, statements[id].position.left, statements[id].prior * 100, statements[id].text, statements[id].probability);
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

