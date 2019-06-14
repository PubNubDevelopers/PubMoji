import React, {Component} from 'react';
import {StyleSheet, Text, View, Image, Button, TouchableHighlight} from 'react-native';
//import { ButtonGroup } from 'react-native-elements';


const img1 = require("../../assets/images/Pubmoji.png");

export default class InfoModal extends Component{

    constructor(props) {
        super(props);
        this.state = { 
            selectedIndexRowOne: -1,
            selectedIndexRowTwo: -1,
            text: '',
            isFocused: false ,
            pressStatus: false
         };
    }

render() {
    return (

        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.textContent}> 
                    <Image source={img1} style={{height: 180, width:300}}/>
                    <Text style={styles.text}>Pubmoji is an interactive phone application designed to demonstrate PubNub's capabilities.</Text>
                    <Text style={styles.text}>Let others know how you're feeling by spamming the different emojis or typing in a message!</Text>  
                    <Text style={styles.text}>Zoom in the map and watch as emojis and messages fly out of people's avatars in realtime!</Text>
                </View>
            </View>

            <TouchableHighlight
                activeOpacity={1}
                underlayColor={'white'}
                style={
                this.state.pressStatus
                    ? styles.buttonPressed
                    : styles.buttonNotPressed
                }     
                onHideUnderlay={this.onHideUnderlay}
                onShowUnderlay={this.onShowUnderlay}               
                onPress={this.props.toggleAbout}
                >
                <Text 
                    style={
                    this.state.pressStatus
                        ? styles.cancelPressed
                        : styles.cancelNotPressed
                        }
                    > 
                    Close
                </Text>
            </TouchableHighlight>

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
      color: '#1E1E1E',
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
    buttonContainer: {
        flexDirection: 'row',
    },
    button: {
        flex: 1
    },
    buttonPressed:{
        borderColor: 'rgb(208,33,41)',
        borderWidth: 1,
        padding: 10,
        borderRadius: 5
    },
    buttonNotPressed: {
        backgroundColor: 'rgb(208,33,41)',
        borderColor: 'rgb(208,33,41)',
        borderWidth: 1,
        padding: 10,
        borderRadius: 5
    },
    cancelPressed:{
        color: 'rgb(208,33,41)'
    },
    cancelNotPressed: {
        color: 'white'
    },
    textContent: {
        alignItems: 'center',
        marginBottom: 10,
    },
});
