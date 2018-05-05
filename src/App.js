import React from 'react';
import './App.css';
import Argument from './Argument';
import DebugDisplay from './DebugDisplay';
import styled from 'styled-components';


const AppWrap = styled.div`
  background-color: var(--color-content-background);
  color: var(--color-content);
  height: 100vh;
  width: 100vw;
  font-family: var(--font-family-base);
  font-weight: var(--font-weight-base);
  position: relative;
`;


const App = () => {
  return (
    <AppWrap>
      <Argument />
      <DebugDisplay />
    </AppWrap>
  );
};

export default App;