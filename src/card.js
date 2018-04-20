import utils from './utils.js';
import state from './state.js';
import $ from 'jquery';

export const createStatement = (id, top, left) => {
  let priorPercent = parseFloat(prompt("Best guess probability for the new proposition?", "50"));
  state.setPrior(id, priorPercent / 100);
  state.setPosition(id, top, left);
  let newCard = createCard(id, top, left, priorPercent);
  $("#canvas").append(newCard);
  $(`#${id} .text`).focus();

  // Power saving/editing the statement text
  $(`#${id} .text`).on('input', function (e) {
    state.setText(id, e.delegateTarget.innerHTML);
  })

  // Power the prior editing capability
  $(`#${id} .prior input`).change(function () {
    let statement = $(this).parents('.window').attr('id');
    state.setPrior(statement, (this.value / 100));
    return false;
  });

  // Power the delete item control
  $(`#${id} .tools .delete`).click(function (id) {
    let statementId = $(this).parents('.card').attr('isd');
    if (state.exists(statementId)) {
      instance.remove(statementId);
      state.deleteStatement(statementId);
      rePlumb(instance, statementId);
    }
  });
}

const createCard = (id, top, left, priorPercent, loadedText, loadedProbability) => {
  let text = loadedText ? loadedText : "";
  let probability = loadedProbability ? loadedProbability : (priorPercent / 100);
  let newCard = `
      <div class="statement card" id="${id}" style="top:${top}px; left:${left}px">
        <p class="text" contenteditable="true">${text}</p>
        <label class="prior">
          <label class="label" for="${id}-prior-input">Prior</label>
          <input
            name="${id}-prior-input"
            value="${priorPercent}"
            min="0"
            max="100"
            type="number"
            placeholder="&mdash;"
          />
          <label for="${id}-prior-input" class="unit">%</label>
          <div class="popover">
            <a class="popover-toggle">-</a>
            <div class="prior-control popover-content">
              <div class="control-range">
                <label for ${id}-prior-content>
                  ${utils.displayProbability(priorPercent)}
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
        </label>
        <div class="probability">
          <span>Probability</span><span class="value">${utils.displayProbability(probability)}</span><span class="unit">%</span>
        </div>
        <div class="tools">
          <div class="drag-handle" />
          <button class="delete">
            <div class="close-bars">
              <div class="close-bar" />
              <div class="close-bar" />
            </div>
            <span class="label">Delete</span>
          </button>
        </div>
        <!--<a class="createFollowingHandle">
          <p>Create following statement</p>
        </a>-->
        <!--<a class="createPrecedingHandle">
          <p>Create preceding statement</p>
        </a>-->
      </div>
    `;
  return newCard;
}
