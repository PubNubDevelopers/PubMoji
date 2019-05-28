/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import Username from './src/components/Username';
import SplashScreen from './src/components/SplashScreen';
import PictureSelection from './src/components/PictureSelection';
import PicSelectionMain from './src/components/PicSelectionMain';

// import {createStackNavigator, createAppContainer} from 'react-navigation';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

export default class App extends Component{
  constructor(props){
    super(props);
    this.state = { isLoading: true };
  }

  // performTimeConsumingTask = async() => {
  //   return new Promise((resolve) =>
  //     setTimeout(
  //       () => { resolve('result') },
  //       3000
  //     )
  //   );
  // }

  // async componentDidMount() {
  //   // Preload data from an external API
  //   // Preload data using AsyncStorage
  //   const data = await this.performTimeConsumingTask();
  
  //   if (data !== null) {
  //     this.setState({ isLoading: false });
  //   }
  // }

  render() {
    
    if(this.state.isLoading){
      return <PicSelectionMain />;
    }

    return (
      <PictureSelection />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
