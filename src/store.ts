// store.js
import React, { createContext, useReducer } from 'react';

const initialState = {
  web3: null,
  instance: null,
  accounts: [],
  stars: {},
};
const store = createContext(initialState);
const { Provider: ProviderComponent } = store;

const StateProvider = ({ children }) => {
  const [state, dispatch] = useReducer((oldState, action) => {
    switch (action.type) {
      case 'setWeb3':
        return { ...oldState, web3: action.web3 }; // do something with the action
      case 'setInstance':
        return { ...oldState, instance: action.instance }; // do something with the action
      case 'setAccounts':
        return { ...oldState, accounts: action.accounts }; // do something with the action
      case 'setStars':
        return {
          ...oldState,
          stars: { ...oldState.stars, [action.id]: action.star },
        };
      default:
        throw new Error();
    }
  }, initialState);

  return <ProviderComponent>{children}</ProviderComponent>;

  return (
    <ProviderComponent value={{ state, dispatch }}>
      {children}
    </ProviderComponent>
  );
};

export { store, StateProvider };
