import uuid from 'uuid/v4'
import _ from 'lodash'

let statements = {}; // e.g., { 'uuid1': {position: {top:0,left:0}, text:"Statement", prior:0.5, contributions:1, probability:0.5} }
let connections = {}; // e.g. {'uuid1': {'uuid2': 3.0}}
let probabilityUpdatedCallback = Function.prototype; // callback function to call with id of updated probability and new probability

const recalculateProbabilitiesFrom = (id) => {
  let priorOdds = statements[id].prior / (1 - statements[id].prior)
  let posteriorOdds = priorOdds * statements[id].contributions;
  let posteriorProbability = posteriorOdds / (1 + posteriorOdds)
  statements[id].probability = posteriorProbability;

  // call back UI
  probabilityUpdatedCallback(id, posteriorProbability);

  // update contributions to all downstream and recurse
  _.each(connections[id], (lr,targetId) => {

    let sourceProb = statements[id].probability;
    let previousTargetContributions = statements[targetId].contributions;
    let lrProbProj = lr / (lr + 1)
    let combinedProb = (sourceProb * lrProbProj) + ((1 - sourceProb) * (1 - lrProbProj))
    console.log("combinedProb", combinedProb);
    let combinedLikelihoodRatio = combinedProb / (1 - combinedProb)
    console.log("combinedLikelihoodRatio", combinedLikelihoodRatio);
    let newTargetContributions = previousTargetContributions * combinedLikelihoodRatio
    console.log("newContributions", newTargetContributions);
    statements[targetId].contributions = newTargetContributions;

    recalculateProbabilitiesFrom(targetId);
  });



  //  let sourceProb = statements[sourceId].probability
  //  let previousTargetProbability = statements[targetId].probability
  //  let previousTargetOdds = previousTargetProbability / (1 - previousTargetProbability)
  //  let lrProbProj = lr / (lr + 1)
  //  let combinedProb = (sourceProb * lrProbProj) + ((1 - sourceProb) * (1 - lrProbProj))
  //  console.log("combinedProb", combinedProb);
  //  let combinedLikelihoodRatio = combinedProb / (1 - combinedProb)
  //  console.log("combinedLikelihoodRatio", combinedLikelihoodRatio);
  //  let newOdds = previousTargetOdds * combinedLikelihoodRatio
  //  let newTargetProbability = newOdds / (newOdds + 1)
  //  console.log("newTargetProbability", newTargetProbability);
  //  statements[targetId].probability = newTargetProbability;

  // propagate forward
  //if (connections[targetId]) {
  //  _.keys(connections[targetId])
  //}
    //_.each(connections[id],(lr,targetId) => );

};

export default {

  newStatement: (top, left) => {
    let id = uuid();
    statements[id] = {
      position: {
        top: top,
        left: left
      },
      text: "Statement",
      prior: 0.5,
      contributions: 1,
      probability: 0.5 // Note that you don't set the probability directly. It is calculated from connections.
    };
    return id;
  },

  setText: (id, text) => {
    statements[id].text = text;
  },

  setPrior: (id, prior) => {
    statements[id].prior = prior;
    recalculateProbabilitiesFrom(id);
  },

  setConnection: (sourceId, targetId, lr) => {
    _.set(connections, [sourceId, targetId], lr);
    recalculateProbabilitiesFrom(sourceId);

  },

  setPosition: (id, top, left) => {
    statements[id].position = {
      top: top,
      left: left
    };
  },


  deleteStatement: (id) => {
    // remove id from statements
    targetIds = _.keys(connections[sourceId]);
    delete connections[sourceId];
    // propagate forward
    _.each(targetIds,(targetId) => {
      recalculateProbabilitiesFrom(targetId);
    });
  },

  deleteConnection: (sourceId, targetId) => {
    // remove pair from connections
    delete connections[sourceId][targetId];
    // propagate forward
    recalculateProbabilitiesFrom(targetId);
  },


  setProbabilityUpdatedCallback: (cb) => { // cb needs to be a function that takes the id of the updated probability, and new probability
    probabilityUpdatedCallback = cb;
  },

  // TODO
  // save
  // load

};
