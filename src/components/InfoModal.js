import React, {Component} from 'react';
import {StyleSheet, Text, View, Image} from 'react-native';


const img1 = require("../../assets/images/Pubmoji.png");

export default class InfoModal extends Component{

    constructor(props) {
        super(props);
    }

render() {
    return (

        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.textContent}> 
                    <Image source={img1} style={{height: 180, width:250, marginLeft: 15 }}/>
                    <Text style={styles.text}>Pubmoji is an interactive phone application designed to demonstrate PubNub's capabilities.</Text>
                    <Text style={styles.text}>Let others know how you're feeling by spamming the different emojis or typing in a message!</Text>  
                    <Text style={styles.text}>Zoom in the map and watch as emojis and messages fly out of people's avatars in realtime!</Text>
                </View>
            </View>
        </View>

    );
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignContent: 'center',
     // alignItems: 'flex-start',   
      backgroundColor: 'white',
      marginBottom: 80,
      marginTop: 50,
    },
    bottom: {
      fontFamily: 'roboto',
      color: 'rgb(208,33,41)',  
      fontSize: 30,
      },
    text: {
      color: 'rgb(208,33,41)',  //or #1E1E1E
      fontSize: 18,
      fontWeight: 'bold',
      alignContent: 'center',
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 20,
      marginRight: 20,
      marginTop: 40,
      },
    textContent: {
      alignItems: 'baseline',
      justifyContent: 'center',
      alignContent: 'center',
      marginTop: 20,
      },
    content: {
        backgroundColor: 'white',
        padding: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
});
