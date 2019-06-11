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

                    <Text style={styles.text}>I am the modal content. I am the modal content. I am the modal content. I am the modal content. I am the modal content. I am the modal content. I am the modal content. I am the modal content.</Text> 
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
      color: 'rgb(208,33,41)',  
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
