import uuid from 'uuid/v4'
import _ from 'lodash'

export let statements = {}; // e.g., { 'uuid1': {position: {top:0,left:0}, text:"Statement", prior:0.5, contributions:['uuid1','uuid2'], probability:0.5} }
let connections = {}; // e.g. {'uuid1': {'uuid2': 3.0}}
let probabilityUpdatedCallback = Function.prototype; // callback function to call with id of updated probability and new probability
let onLoadCallback = Function.prototype;

const recalculateProbabilitiesFrom = (id) => {
  let priorOdds = statements[id].prior / (1 - statements[id].prior)
  let incomingLRsandProbs = _.map(statements[id].contributions, (cid) => ({ lr: connections[cid][id], prob: statements[cid].probability }))
  let contributions = _.map(incomingLRsandProbs, (contrib) => {
    let lrProbProj = contrib.lr / (contrib.lr + 1)
    let combinedProb = (contrib.prob * lrProbProj) + ((1 - contrib.prob) * (1 - lrProbProj))
    let combinedLR = combinedProb / (1 - combinedProb)
    return combinedLR;
  });
  let combinedContributions = _.reduce(contributions, (a, b) => a * b, 1);
  let posteriorOdds = priorOdds * combinedContributions;
  let posteriorProbability = 0.5;
  if (posteriorOdds == Infinity) {
    posteriorProbability = 1;
  } else {
    posteriorProbability = posteriorOdds / (1 + posteriorOdds);
  }
  statements[id].probability = posteriorProbability;

  // call back UI
  probabilityUpdatedCallback(id, posteriorProbability);

  // update contributions to all downstream and recurse
  _.each(connections[id], (lr, targetId) => {
    recalculateProbabilitiesFrom(targetId);
  });

};

export default {

  createStatement: ({ text, top, left, prior, contributions }) => {
    let id = 'uuid' + uuid();
    statements[id] = {
      text: '',
      position: {
        top: top ? top : 200,
        left: left ? left : 200
      },
      prior: prior ? prior : 0.5,
      contributions: contributions ? contributions : [],
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
    let s = new Set(statements[targetId].contributions);
    let sWithSource = s.add(sourceId);
    statements[targetId].contributions = Array.from(sWithSource);
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

  save: () => {
    let exportName = "beliefs";
    let exportObj = {
      statements: statements,
      connections: connections
    };
    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    let downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  },

  onLoad: (cb) => {
    onLoadCallback = cb;
  },

  load: (e) => {
    let file = e.target.files[0];
    if (!file) {
      return;
    }
    let reader = new FileReader();
    reader.onload = function (e) {
      let contents = e.target.result;
      let loaded = JSON.parse(contents);
      console.log("Loaded save file: ", loaded)
      statements = loaded.statements;
      connections = loaded.connections;
      onLoadCallback(statements, connections);
    };
    reader.readAsText(file);
  }

};
