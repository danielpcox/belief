// Stashes


// Filled-out displayProbability function.
// Needs to be turned into a function in render(),
// or something to that effect, so that it can
// update live probabilities.
displayProbability: (probability, style) => {
  let readableProbability = '';
  style = style ? style : 'probability';

  switch (style) {
    case 'odds':
      let numerator = '1';
      let denominator = (1 / probability) - 1;
      readableProbability = numerator + ":" + Math.round(denominator, readableDecimals);
      return (`<span class="probability style-odds">${readableProbability}</span>`);
      break;
    default:
      let value = Math.round(probability * 100, readableDecimals).toString();
      let unit = '%';
      readableProbability = value;
      return (`<span class="probability style-percent">${readableProbability}${unit}</span>`);
      break;
  }
},