import React, { Component } from 'react';
import Statement from './Statement';
import uuid from 'uuid';
import config from './config';
import { jsPlumb } from 'jsplumb';
import styled from 'styled-components';


const ArgumentWrap = styled.article`
  position: relative;
`;


class Argument extends Component {

  constructor(props) {
    super(props);
    this.state = {
      instance: jsPlumb.getInstance(config.instanceOptions),
      statements: {
        'fuuid-ba7d707d-88ca-4fab-8c69-c93f516ff93b': {
          text: 'test text',
          position: {
            top: 200,
            left: 200
          },
          prior: 0.5,
          probability: 0.5,
          contributions: []
        },
        'fuuid-19addb00-0e3a-4848-bcbd-6a5055354935': {
          text: 'test text',
          position: {
            top: 200,
            left: 200
          },
          prior: 0.5,
          probability: 0.5,
          contributions: []
        }
      },
      processConnectionEvents: true
    };

    this.removeStatement = this.removeStatement.bind(this);
    this.addStatement = this.addStatement.bind(this);
    this.setStatementPrior = this.setStatementPrior.bind(this);
    this.setStatementText = this.setStatementText.bind(this);
    this.setStatementPosition = this.setStatementPosition.bind(this);
    this.setConnection = this.setConnection.bind(this);
    this.removeConnection = this.removeConnection.bind(this);
    this.stopDoubleclickPropagation = this.stopDoubleclickPropagation.bind(this);
    this.rePlumb = this.rePlumb.bind(this);
  }

  addStatement() {
    let statements = this.state.statements;

    let id = 'uuid-' + uuid();
    statements[id] = {
      text: 'new statement you just created',
      position: {
        top: 200,
        left: 200,
      },
      prior: 0.5,
      probability: 0.5,
      connections: []
    };

    this.setState({ statements: statements });
    return id;
  }

  removeStatement(targetId) {
    let statements = this.state.statements;
    delete statements[targetId];
    this.setState({ statements: statements });
  }

  setStatementPrior(id, prior) {
    let statements = Object.assign({}, this.state.statements);
    statements[id].prior = prior;
    this.setState({ statements });
  }

  setStatementText(id, text) {
    let statements = Object.assign({}, this.state.statements);
    statements[id].text = text;
    this.setState({ statements });
  }

  setStatementPosition(id, x, y) {
    let statements = Object.assign({}, this.state.statements);
    statements[id].position.top = y;
    statements[id].position.left = x;
    this.setState({ statements });
  }

  setConnection(sourceId, targetId, likelihoodRatio) {
    return;
    // TODO: Logic
  }

  removeConnection(sourceId, targetId) {
    return;
    // TODO: Logic
  }

  stopDoubleclickPropagation(e) {
    return;
    // TODO: Logic
  }

  rePlumb(id) {
    // TODO: Convert to React-able function

    // Extracted function for reapplying jsPlumb
    this.state.instance.batch(function () {

      // Create event bindings..

      // On new connection...
      this.state.instance.bind("connection", function (info, originalEvent) {
        if (this.state.processConnectionEvents) {
          let conn = info.connection;
          if (!conn.getOverlay("label")) {
            let likelihoodRatio = parseFloat(prompt("How many times more likely is the target if the source turns out to be true?", "1"));
            conn.addOverlay(["Label", { label: likelihoodRatio.toString(), id: "label" }]);
            this.stopDoubleclickPropagation();

            this.setConnection(conn.source.id, conn.target.id, likelihoodRatio);
          }
        }
      });

      // on removing a connection...
      this.state.instance.bind("connectionDetached", function (info, originalEvent) {
        let conn = info.connection;
        this.deleteConnection(conn.source.id, conn.target.id);
      });

      // Add input and output endpoints
      let instanceElement = jsPlumb.getSelector(`#${id}`);
      this.state.instance.addEndpoint(instanceElement, { anchor: "LeftMiddle" }, config.InputEndpoint);
      this.state.instance.addEndpoint(instanceElement, { anchor: "RightMiddle" }, config.OutputEndpoint);

      console.log('plumbed', id);
    });
  }

  // save

  // load

  // onLoad

  // setProbabilityUpdatedCallback

  getStatement(id) { this.state.statements[id]; }

  renderStatements() {
    var statementsList = [];

    for (var id in this.state.statements) (
      statementsList.push(
        <Statement
          key={id}
          id={id}
          text={this.state.statements[id].text}
          prior={this.state.statements[id].prior}
          probability={this.state.statements[id].probability}
          top={this.state.statements[id].position.top}
          left={this.state.statements[id].position.left}
          contributions={this.state.statements[id].contributions}
          removeStatement={this.removeStatement}
          setStatementPrior={this.setStatementPrior}
          setStatementText={this.setStatementText}
          setStatementPosition={this.setStatementPosition}
          rePlumb={this.rePlumb}
        />
      )
    );

    return statementsList;
  }

  render() {
    return (
      <ArgumentWrap>
        <button onClick={this.addStatement}>Add Statement</button>
        {this.renderStatements()}
      </ArgumentWrap>
    );
  }
}

export default Argument;