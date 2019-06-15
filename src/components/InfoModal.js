import React, {Component} from 'react';
import {StyleSheet, Text, View, Image, TouchableHighlight} from 'react-native';

const img1 = require("../../assets/images/PubMojiPic.png");

export default class InfoModal extends Component{
    constructor(props) {
        super(props);
        this.state = { 
            // selectedIndexRowOne: -1,
            // selectedIndexRowTwo: -1,
            // text: '',
            // isFocused: false ,
            pressStatus: false
         };
    }

    onHideUnderlay = () => {
        this.setState({ pressStatus: false });
    }
  
    onShowUnderlay = () => {
        this.setState({ pressStatus: true });
    } 
    // resizeMode="cover"
render() {
    return (
        <View style={styles.content}>
            <Image style={{alignSelf: 'center'}} source={img1}/>
            <View style={styles.titleContent}>
                <Text style={styles.titleText}>Welcome to PubMoji!</Text>
            </View>
            
           <View style={styles.textContent}> 
                <Text style={styles.text}>Pubmoji is an interactive phone app designed to demonstrate PubNub's capabilities.</Text>
                <Text style={styles.text}>Let others know how you're feeling by spamming the different emojis or typing in a message!</Text>  
                <Text style={styles.text}>Zoom in the map and watch emojis and messages fly out of people's avatars in realtime!</Text>
            </View>

            <View style={styles.buttonContainer}>
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

        </View>
    );
  }
}

const styles = StyleSheet.create({
    buttonContainer: {
        alignItems: 'stretch',
        textAlign: 'center',
        paddingLeft: 34,
        paddingRight: 34,
        marginBottom: 5,
        marginTop: 10
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
        color: 'rgb(208,33,41)',
        fontSize: 16,
        textAlign: 'center',
        alignItems: 'center',
    },
    cancelNotPressed: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
        alignItems: 'center',
    },
    titleContent: {
        alignItems: 'center',
        marginTop: 8,  
    },
    titleText: {
        fontFamily: 'ProximaNova-Regular',
        color: 'rgb(208,33,41)',
        fontSize: 28,
        fontWeight: 'bold',
    },
    textContent: {
        textAlign: 'justify',
        justifyContent: 'center',
        paddingLeft: 35,
        paddingRight: 35,
    },
    text: {
        color: 'black',
        textAlign: 'justify',
        fontFamily: 'ProximaNova-Regular',
        fontSize: 18,
        marginTop: 5,
    },        
    content: {
        backgroundColor: 'white',
        padding: 5,
        justifyContent: 'center',
        borderRadius: 5,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
});
