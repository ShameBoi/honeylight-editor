// @flow

import PropTypes from 'prop-types';

export type BootstrapStyle = 'default' | 'primary' | 'success' | 'info' | 'warning' | 'danger';
export const BootstrapStylePropType = PropTypes.oneOf([
  'default',
  'primary',
  'success',
  'info',
  'warning',
  'danger'
]);
