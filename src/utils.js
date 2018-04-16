import config from './config.js';

const readableDecimals = 2;

export default {

  displayProbability: (prob, style) => {
    let readableProb = '';
    let unit = '';

    console.log(style);

    switch (style) {
      case 'odds':
        let numerator = '1';
        let denominator = (1 / prob) - 1;
        readableProb = numerator + ":" + Math.round(denominator, readableDecimals);
        break;
      default:
        let value = Math.round(prob * 100, readableDecimals).toString();
        let unit = '%';
        readableProb = value;
        break;
    }

    // create a display component classed with display method for styiling control
    // Display the resulting readable probability
    // If there's a unit to display, display it too
    return (`
      <span class="probability style-${style}">
        <span>${readableProb}</span>
      </span>
    `);
  }

};