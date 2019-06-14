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
      justifyContent: 'space-around',
      alignItems: 'center',   
      backgroundColor: 'white',
    },
    text: {
      fontFamily: 'ProximaNova-Regular',
      color: 'rgb(208,33,41)',  
      fontSize: 78,
      fontWeight: 'bold'
    },
    bottom: {
      fontFamily: 'ProximaNova-Regular',
      color: 'rgb(208,33,41)',  
      fontSize: 25,
      marginBottom: -165
    }
});
