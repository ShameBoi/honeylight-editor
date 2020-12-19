// @flow

import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import App from './App';

export default function mount() {
  const rootNode = document.getElementById('root');
  if (!rootNode) {
    throw new Error('Cannot find root node to mount on');
  }
  ReactDOM.render(
    <AppContainer>
      <App />
    </AppContainer>,
    rootNode
  );
}
