import React from 'react';
import {Provider} from 'react-redux';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {store} from './redux/store';
import {MainContainer} from './containers';

const App = () => {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <MainContainer />
      </SafeAreaProvider>
    </Provider>
  );
};

export default App;
