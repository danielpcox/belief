import uuid from 'uuid/v4'
import _ from 'lodash'

let statements = {}; // e.g., { 'uuid1': {position: {top:0,left:0}, text:"Statement", prior:0.5, contributions:['uuid1','uuid2'], probability:0.5} }
let connections = {}; // e.g. {'uuid1': {'uuid2': 3.0}}
let probabilityUpdatedCallback = Function.prototype; // callback function to call with id of updated probability and new probability

const recalculateProbabilitiesFrom = (id) => {
  let priorOdds = statements[id].prior / (1 - statements[id].prior)
  let incomingLRsandProbs = _.map(Array.from(statements[id].contributions),(cid) => ({lr:connections[cid][id],prob:statements[cid].probability}))
  let contributions = _.map(incomingLRsandProbs,(contrib) => {
    let lrProbProj = contrib.lr / (contrib.lr + 1)
    let combinedProb = (contrib.prob * lrProbProj) + ((1 - contrib.prob) * (1 - lrProbProj))
    let combinedLR = combinedProb / (1 - combinedProb)
    return combinedLR;
  });
  let combinedContributions = _.reduce(contributions,(a,b) => a*b, 1);
  let posteriorOdds = priorOdds * combinedContributions;
  let posteriorProbability = posteriorOdds / (1 + posteriorOdds)
  statements[id].probability = posteriorProbability;

  // call back UI
  probabilityUpdatedCallback(id, posteriorProbability);

  // update contributions to all downstream and recurse
  _.each(connections[id], (lr,targetId) => {
    recalculateProbabilitiesFrom(targetId);
  });

};

export default {

  newStatement: (top, left) => {
    let id = 'uuid'+uuid();
    statements[id] = {
      position: {
        top: top,
        left: left
      },
      text: "Statement",
      prior: 0.5,
      contributions: new Set(),
      probability: 0.5 // Note that you don't set the probability directly. It is calculated from connections.
    };
    return id;
  },

  exists: (id) => statements[id],

  setText: (id, text) => {
    statements[id].text = text;
  },

  setPrior: (id, prior) => {
    statements[id].prior = prior;
    recalculateProbabilitiesFrom(id);
  },

  setConnection: (sourceId, targetId, lr) => {
    _.set(connections, [sourceId, targetId], lr);
    statements[targetId].contributions.add(sourceId);
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
    let targetIds = _.keys(connections[id]);
    delete connections[id];
    // propagate forward
    _.each(targetIds, (targetId) => {
      statements[targetId].contributions.delete(id);
      recalculateProbabilitiesFrom(targetId);
    });
  },

  deleteConnection: (sourceId, targetId) => {
    // remove pair from connections
    delete connections[sourceId][targetId];
    statements[targetId].contributions.delete(sourceId);
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
