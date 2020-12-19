// @flow

import * as React from 'react';

import Main from './Main';

type AppProps = {};

type AppLocalState = {};

export default class App extends React.Component<AppProps, AppLocalState> {
  state: AppLocalState;

  static propTypes = {};

  constructor(props: AppProps, context: any) {
    super(props, context);
  }

  render() {
    return <Main />;
  }
}
