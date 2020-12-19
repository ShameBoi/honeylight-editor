// @flow

import mount from './components/MountPoint';

window.addEventListener('load', () => {
  try {
    mount();

    if (module.hot) {
      module.hot.accept('./components/MountPoint', () => {
        mount();
      });
    }
  } catch (err) {
    console.error('Uncaught Exception', err);
  }
});
