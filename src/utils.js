import config from './config.js';

const readableProbabilityDecimals = 2;

export default {

  displayProbability: (prob) => {
    let displayableProb = Math.round(prob, readableProbabilityDecimals);
    return displayableProb;
  }

};