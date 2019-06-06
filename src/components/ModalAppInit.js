import React, { Component } from 'react';
import {StyleSheet, Text, Button, View, Image, TextInput, Alert} from 'react-native';
import { ButtonGroup } from 'react-native-elements';

const img1 = require('../../assets/images/favicon.png');
const img2 = require('../../assets/images/apple-logo.png');
const img3 = require('../../assets/images/twitter-logo.png');
const img4 = require('../../assets/images/linkedin-logo.png');
const img5 = require('../../assets/images/microsoft-logo.png');
const img6 = require('../../assets/images/chrome-logo.png');
const imgArrayRowOne = [img1, img2, img3];
const imgArrayRowTwo = [img4, img5, img6];

// Modal for initial app boot
export default class ModalAppInit extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            selectedIndexRowOne: -1,
            selectedIndexRowTwo: -1,
            text: '',
            isFocused: false ,
            textTemp: 'hi'
         };
      }

    updateIndexOne = (selectedIndexRowOne) => {
    if(this.state.selectedIndexRowTwo != -1){
        this.setState({selectedIndexRowTwo: -1}); 
    }  
    this.setState({selectedIndexRowOne});
    }

    updateIndexTwo =  (selectedIndexRowTwo) => {
    if(this.state.selectedIndexRowOne != -1){
        this.setState({selectedIndexRowOne: -1});  
    }  
    this.setState({selectedIndexRowTwo});
    }

    handleFocus = () => {
      this.setState({isFocused: true});
    }
  
    handleBlur = () => {
      this.setState({isFocused: false});
    }
    
    confirmProfile = () => {
      const { selectedIndexRowOne } = this.state;
      const { selectedIndexRowTwo } = this.state;
      const {text} = this.state;

      if(selectedIndexRowOne === -1 && selectedIndexRowTwo === -1){
          Alert.alert('Error','Please select a profile picture.');
      }
      else if(text.length === 0){
        Alert.alert('Error','Please enter your username.');
      }
      else if(text.length > 16){
        Alert.alert('Error', 'Username should be less than 16 characters');         
      }
      else{        
        // publish username and image to channel
        let getRowPic = (selectedIndexRowOne  > -1) ? true: false;
        getRowPic = (getRowPic) ? imgArrayRowOne[selectedIndexRowOne]:
          imgArrayRowTwo[selectedIndexRowTwo];
        this.props.changeProfilePicture(getRowPic);
        this.setState({selectedIndexRowOne: -1}); 
        this.setState({selectedIndexRowTwo: -1}); 
        this.setState({text: ''}); 
        this.props.closeModalInit(false);
      }
    }

    render() {
        const { isFocused } = this.state;

        const component1 = () => 
        <Image
          source={img1}
        />
    
        const component2 = () =>     
        <Image
        source={img2}
        />
    
        const component3 = () => 
        <Image
        source={img3}
        />
    
        const component4 = () =>                 
        <Image
        source={img4}
        />
    
        const component5 = () =>                 
        <Image
        source={img5}
        />
    
        const component6 = () =>                 
        <Image
        source={img6}
        />
    
        const buttonsOne = [{ element: component1}, { element: component2, id: 2 }, { element: component3, id: 3 }];
        const buttonsTwo = [{ element: component4, id: 4 }, { element: component5, id: 5 }, { element: component6, id: 6 }];
                
        return (
          <View>
            <View style={styles.content}>
                <View style={styles.textContent}> 
                    <Text style={styles.text}>Profile Picture</Text> 
                </View>
                <ButtonGroup
                    selectedIndex={this.state.selectedIndexRowOne}
                    buttons={buttonsOne}
                    onPress={this.updateIndexOne}
                    containerStyle={{height: 70}}
                />   
                <ButtonGroup
                    selectedIndex={this.state.selectedIndexRowTwo}
                    buttons={buttonsTwo}
                    onPress={this.updateIndexTwo}
                    containerStyle={{height: 70}}
                />    

                <View style={styles.username}> 
                    <TextInput 
                        style={{flex: 1}}
                        type="TextInput" 
                        name="myTextInput" 
                        placeholder='Enter your username' 
                        underlineColorAndroid={
                        isFocused ?
                        "rgb(208,33,41)" : "#D3D3D3"
                        }
                        onFocus={this.handleFocus}
                        onBlur={this.handleBlur}
                        value={this.state.text}
                        onChangeText={(text) => this.setState({text})}                 
                    />            
                </View>
                <View style={styles.buttonContainer}>
                    <View style={styles.button}>
                        <Button
                        onPress={this.confirmProfile}
                        title="Confirm"
                        />
                    </View>
                </View>
            </View>
          </View>
        );
    }       
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
  },
  button: {
    flex: 1
  },
  textContent: {
    alignItems: 'center',
    marginBottom: 10,
  },
  text: {
    fontFamily: 'proxima-nova',
    color: 'rgb(208,33,41)',  
    fontSize: 37,
    fontWeight: 'bold',
  },
  username:{
    flexDirection: 'row', 
    height: 40, 
    marginBottom: 10,
    paddingLeft: 6
  },
  content: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
});