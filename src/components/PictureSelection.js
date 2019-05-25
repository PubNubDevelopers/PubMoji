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
*/

export default class Username extends Component{
    constructor(props) {
        super(props);
        this.state = { 
            selectedIndexRowOne: -1,
            selectedIndexRowTwo: -1,
        };
        this.updateIndexOne = this.updateIndexOne.bind(this);
        this.updateIndexTwo = this.updateIndexTwo.bind(this);
      }

      updateIndexOne (selectedIndexRowOne) {
        if(this.state.selectedIndexRowTwo != -1){
            this.setState({selectedIndexRowTwo: -1});;  
        }  
        this.setState({selectedIndexRowOne});
    }

      updateIndexTwo (selectedIndexRowTwo) {
        if(this.state.selectedIndexRowOne != -1){
            this.setState({selectedIndexRowOne: -1});;  
        }  
        this.setState({selectedIndexRowTwo});
    }

       submitPic = () => {
            console.log('in subitPic function');
            alert('Submit picture');
        }

    render() {
        const component1 = () =>                 
        <Image
        source={require('../../img/favicon.png')}
        />

        const component2 = () =>                 
        <Image
        source={require('../../img/favicon.png')}
        />

        const component3 = () =>                 
        <Image
        source={require('../../img/favicon.png')}
        />

        const buttonsOne = [{ element: component1 }, { element: component2 }, { element: component3 }];
        const { selectedIndexRowOne } = this.state;
        const { selectedIndexRowTwo } = this.state;
        const isRowOneEnabled = (selectedIndexRowOne  > -1) ? true: false;
        const isRowTwoEnabled = (selectedIndexRowTwo  > -1) ? true: false;
        const isEnabled = (isRowOneEnabled || isRowTwoEnabled) ? true: false;

        return (
        <View style={styles.container}>
            <Text style={styles.textTitle}>PubMoji</Text>
                <ButtonGroup
                    selectedIndex={selectedIndexRowOne}
                    buttons={buttonsOne}
                    onPress={this.updateIndexOne}
                    containerStyle={{height: 70}}
                    />   

                <ButtonGroup
                    selectedIndex={selectedIndexRowTwo}
                    buttons={buttonsOne}
                    onPress={this.updateIndexTwo}
                    containerStyle={{height: 70}}
                />    
                <Button 
                    disabled={!isEnabled} 
                    type="button" 
                    name="myButton" 
                    title="Next"
                    onPress={this.submitPic} 
                />              
        </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: 'rgb(208,33,41)'
    },
    rowPics:{
        alignItems: 'center', 
    },
    textTitle: {
        fontFamily: 'proxima-nova',
      //   marginBottom: 250,
        color: 'white',  
        fontSize: 45,
        fontWeight: 'bold',
      },  
      textMain: {
        fontFamily: 'proxima-nova',
        alignItems: 'center',   
      //   marginBottom: 250,
        color: 'white',  
        fontSize: 30,
      }, 
      FacebookStyle: {
        borderWidth: 1,
        borderColor: '#333',    
        backgroundColor: '#FFF',
        height: 70,
        width: 70
      },
      ImageIconStyle: {
        padding: 10,
        margin: 5,
        height: 25,
        width: 25,
        alignItems: 'center',
        resizeMode: 'stretch',
      },
});

