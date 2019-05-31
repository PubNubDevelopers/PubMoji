/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
// import Username from './src/components/Username';
// import SplashScreen from './src/components/SplashScreen';
import PictureSelection from './src/components/PictureSelection';
// import PicSelectionMain from './src/components/PicSelectionMain';
import ModalExample from './src/components/ModalExample';

export default class App extends Component{
  constructor(props){
    super(props);
    // this.state = { isLoading: true };
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
        // if(this.state.isLoading){
    //   return <ModalExample />;
    // }
    return (
      <ModalExample />
    );
  }
}

const styles = StyleSheet.create({

});
