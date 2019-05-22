import React, {Component} from 'react';
import {StyleSheet, Text, View} from 'react-native';

export default class SplashScreen extends Component{
render() {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>PubMoji</Text>
        <Text style={styles.bottom}>Powered By PubNub</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
    //   flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',   
      backgroundColor: 'rgb(208,33,41)'
    },
    text: {
      fontFamily: 'proxima-nova',
    //   marginBottom: 250,
      color: 'white',  
      fontSize: 80,
      fontWeight: 'bold',
    },
    bottom: {
      marginBottom: -50,
      fontFamily: 'proxima-nova',
      color: 'white',  
      fontSize: 30,
      justifyContent: 'center',
    //   fontWeight: 'bold',
      }
});
