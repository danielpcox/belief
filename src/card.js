import utils from './utils';
import state, { statements } from './state';
import $ from 'jquery';

const createCardFromStatement = (id) => {
  let statement = statements[id];

  let top = statement.position.top ? statement.position.top : 200;
  let left = statement.position.left ? statement.position.left : 200;
  let text = statement.text ? statement.text : '';
  let prior = statement.prior ? statement.prior : 0.5;
  let probability = prior;

  let newCard = `
      <div class="statement card" id="${id}" style="top:${top}px; left:${left}px">
        <p class="text" contenteditable="true">${text}</p>
        <label class="prior">
          <label class="label" for="${id}-prior-input">Prior</label>
          <input
            name="${id}-prior-input"
            value="${prior * 100}"
            min="0"
            max="100"
            type="number"
            placeholder="&mdash;"
          />
          <label for="${id}-prior-input" class="unit">%</label>
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
      </div>
    `;
  return newCard;
}


export const displayStatement = (id, instance) => {

  let newCard = createCardFromStatement(id);
  $("#canvas").append(newCard);
  $(`#${id} .text`).focus();

  // Power statement text editing
  $(`#${id} .text`).on('input', function (e) {
    state.setText(id, e.delegateTarget.innerHTML);
  })

  // Power statement prior editing
  $(`#${id} .prior input`).change(function () {
    state.setPrior(id, (this.value / 100));
    return false;
  });

  // Power statement deletion
  // 
  // TODO: Card doesn't know what instance or
  // rePlumb are, so it can't use them from here.
  $(`#${id} .tools .delete`).click(function (id) {
    let statementId = $(this).parents('.card').attr('id');
    alert('Sorry, card deletion is broken.');
    // if (state.exists(statementId)) {
    //   instance.remove(statementId);
    //   state.deleteStatement(statementId);
    //   rePlumb(instance, statementId);
    // }
  });
}