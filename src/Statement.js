import React, { Component } from 'react';
import styled from 'styled-components';

const StatementCard = styled.div.attrs({
  draggable: true
}) `
  border: 2px solid blue;
  border-radius: 8px;
  margin: 1em;
  padding: 1em;
  position: absolute;
  background-color: #fff;
  top: ${props => props.positionTop}px;
  left: ${props => props.positionLeft}px;
`;

const Text = styled.p`
  display: block;
`;

const Prior = styled.p`
  display: block;
`;

const Probability = styled.p`
  display: block;
`;


class Statement extends Component {

  constructor(props) {
    super(props);
    this.rePlumb = this.rePlumb.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.removeStatement = this.removeStatement.bind(this);
    this.setStatementPrior = this.setStatementPrior.bind(this);
    this.setStatementText = this.setStatementText.bind(this);
    this.setStatementPosition = this.setStatementPosition.bind(this);
    // 
  }

  rePlumb() {
    this.props.rePlumb(this.props.id);
  }

  removeStatement() {
    this.props.removeStatement(this.props.id);
  }

  setStatementPrior(e) {
    this.props.setStatementPrior(this.props.id, e.target.value / 100);
  }

  setStatementText(e) {
    this.props.setStatementText(this.props.id, e.target.value);
  }

  onDragEnd(e) {
    this.props.setStatementPosition(this.props.id, e.pageX, e.pageY);
    this.props.rePlumb(this.props.id);
  }

  setStatementPosition(e) {
    this.props.setStatementPosition(this.props.id, e.pageX, e.pageY);
  }

  render() {
    return (
      <StatementCard
        positionTop={this.props.top}
        positionLeft={this.props.left}
        onDragEnd={this.onDragEnd}
      >
        <Text>
          <label>
            Text:
            <input
              onChange={this.setStatementText}
              defaultValue={this.props.text}
            />
          </label>
        </Text>

        <Prior>
          <label>
            Prior:
            <input
              onChange={this.setStatementPrior}
              defaultValue={this.props.prior * 100}
            />
          </label>
        </Prior>

        <Probability>probability: {this.props.probability}</Probability>

        <button onClick={this.removeStatement}>Remove Statement</button>
      </StatementCard>
    );
  }
}

export default Statement;