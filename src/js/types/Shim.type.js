// @flow

// This should be in React's types, but it's wrong, so I have to add it here

export type Ref<T> = {| current: null | T |};
