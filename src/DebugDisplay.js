import React, { Component } from 'react';
import styled from 'styled-components';
import { DebugConsole } from './config';


const DebugDisplayWrap = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  pointer-events: none;
`;



class DebugDisplay extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };

    this.renderDebugLogs = this.renderDebugLogs.bind(this);
    this.renderCursorPositionOnScreen = this.renderCursorPositionOnScreen.bind(this);
    this.renderCursorPositionOnScreen = this.renderCursorPositionOnScreen.bind(this);
  }

  renderDebugLogs(e) {
    if (DebugConsole) {
      this.renderCursorPositionOnScreen(e);
    } else {
      return;
    }
  }

  renderCursorPositionOnScreen(e) {
    console.log('Mouse position on screen:', e.pageX, e.pageY);
    return e.pageX, e.pageY;
  }

  render() {
    return (
      <DebugDisplayWrap onMouseMove={this.renderDebugLogs}>
      </DebugDisplayWrap>
    );
  }
}

export default DebugDisplay;