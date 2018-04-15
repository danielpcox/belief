// New Proposition Card Creation
//

export default {

  createCard: (id, top, left, priorPercent) => {
    let newCard = `
      <div class="window" id="${id}" style="top:${top}px; left:${left}px">
        <div class="dragHandle" />
        <p class="text" contenteditable="true">Statement</p>
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
        </label>
        <div class="probability">
          <span>Probability</span><span class="value">${priorPercent}</span><span class="unit">%</span>
        </div>
        <div class="tools">
          <a class="delete">
            <div class="close-bars">
              <div class="close-bar" />
              <div class="close-bar" />
            </div>
            <span class="label">Delete</span>
          </a>
        </div>
        <!--<a class="createFollowingHandle">
          <p>Create following statement</p>
        </a>-->
        <!--<a class="createPrecedingHandle">
          <p>Create preceding statement</p>
        </a>-->
        <!--<div class="expandHandle" />-->
      </div>
    `;
    return newCard;
  }
}
