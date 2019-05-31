import React, {Component} from 'react';
import {StyleSheet, Text, View, TextInput, Button, Alert, Image, TouchableOpacity} from 'react-native';
import { ButtonGroup } from 'react-native-elements';
import { TagSelect } from 'react-native-tag-select';
/*
- Add bitmoji button
- when user clicks on button, they will be asked to connect to snapshat so
theit bitmoji can be retrieved
- user is taken to snapchat and asked if they want to connect Snapchat bitmoji to
the app their using
- if yes, then user is taken back to the app and they can see their bitmoji if they
have one

Implementation:
- add backend to native android and ios
- set up component with js and import the code from native android and ios
to the component

TODO:
- invert colors for background and text: red text and white background
- select random image id and display that image
*/

const img1 = require('../../img/favicon.png');
const img2 = require('../../img/apple-logo.png');
const img3 = require('../../img/twitter-logo.png');
const img4 = require('../../img/linkedin-logo.png');
const img5 = require('../../img/microsoft-logo.png');
const img6 = require('../../img/chrome-logo.png');

const imgArrayRowOne = [img1, img2, img3];
const imgArrayRowTwo = [img4, img5, img6];

export default class PictureSelection extends Component{
    // constructor(props) {
    //     super(props);
    //     this.state = { 
    //         selectedIndexRowOne: -1,
    //         selectedIndexRowTwo: -1,
    //     };
    //     this.updateIndexOne = this.updateIndexOne.bind(this);
    //     this.updateIndexTwo = this.updateIndexTwo.bind(this);
    //   }

    //   updateIndexOne (selectedIndexRowOne) {
    //     if(this.state.selectedIndexRowTwo != -1){
    //         this.setState({selectedIndexRowTwo: -1});;  
    //     }  
    //     console.log('hi ' + selectedIndexRowOne);
    //     this.setState({selectedIndexRowOne});
    // }

    //   updateIndexTwo (selectedIndexRowTwo) {
    //     if(this.state.selectedIndexRowOne != -1){
    //         this.setState({selectedIndexRowOne: -1});;  
    //     }  
    //     this.setState({selectedIndexRowTwo});
    // }

    render() {
        const component1 = () => 
        <Image
        source={require('../../img/favicon.png')}
        />

        const component2 = () =>     
        <Image
        source={require('../../img/apple-logo.png')}
        />

        const component3 = () => 
        <Image
        source={require('../../img/twitter-logo.png')}
        />

        const component4 = () =>                 
        <Image
        source={require('../../img/linkedin-logo.png')}
        />

        const component5 = () =>                 
        <Image
        source={require('../../img/microsoft-logo.png')}
        />

        const component6 = () =>                 
        <Image
        source={require('../../img/chrome-logo.png')}
        />

        const buttonsOne = [{ element: component1, id: 1 }, { element: component2, id: 2 }, { element: component3, id: 3 }];
        const buttonsTwo = [{ element: component4, id: 4 }, { element: component5, id: 5 }, { element: component6, id: 6 }];

        // console.log(buttonsOne[0].element);

        // const { selectedIndexRowOne } = this.state;
        // const { selectedIndexRowTwo } = this.state;
        // console.log(selectedIndexRowOne);
        // console.log(selectedIndexRowTwo);
        // const isRowOneEnabled = (selectedIndexRowOne  > -1) ? true: false;
        // const isRowTwoEnabled = (selectedIndexRowTwo  > -1) ? true: false;
        // const isEnabled = (isRowOneEnabled || isRowTwoEnabled) ? true: false;

        return (
        <View style={styles.container}>
                <ButtonGroup
                    selectedIndex={this.props.selectedIndexRowOne}
                    buttons={buttonsOne}
                    onPress={this.props.updateIndexOne}
                    containerStyle={{height: 70}}
                    />   

                <ButtonGroup
                    selectedIndex={this.props.selectedIndexRowTwo}
                    buttons={buttonsTwo}
                    onPress={this.props.updateIndexTwo}
                    containerStyle={{height: 70}}
                />    
        </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center', 
        justifyContent: 'center',
      },
});

