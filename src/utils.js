import config from './config.js';

const readableDecimals = 2;

export default {

  displayProbability: (prob) => {
    let displayableProb = Math.round(prob * 100, readableDecimals).toString();
    return displayableProb;
  }

};