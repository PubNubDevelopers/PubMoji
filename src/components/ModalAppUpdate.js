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

// Modal for updating profile image/username
export default class ModalAppUpdate extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            selectedIndexRowOne: -1,
            selectedIndexRowTwo: -1,
            text: '',
            isFocused: false ,
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
    
    cancelProfile = () => {
      this.setState({selectedIndexRowOne: -1}); 
      this.setState({selectedIndexRowTwo: -1}); 
      this.setState({text: ''}); 
      this.props.closeModalUpdate(false);
    }

    updateProfile = () => {
      const { selectedIndexRowOne } = this.state;
      const { selectedIndexRowTwo } = this.state;
      const {text} = this.state;

      if(selectedIndexRowOne === -1 && selectedIndexRowTwo === -1){
        if(text.length === 0){
          Alert.alert('Error','No changes were made');
        }
        else if(text.length > 16){
          Alert.alert('Error', 'Username should be less than 16 characters');         
        }
        else{ 
          // if(text.length > 0){
          //   // publish username to channel and database
          // }
          console.log('profile updated');
          this.setState({text: ''}); 
          this.setState({ visibleModalUpdate: false });
        }
      }
      // else if(text.length)
      else{
        let getRowPic = (selectedIndexRowOne  > -1) ? true: false;
        getRowPic = (getRowPic) ? imgArrayRowOne[selectedIndexRowOne]:
          imgArrayRowTwo[selectedIndexRowTwo];
        this.props.changeProfilePicture(getRowPic);
        this.setState({selectedIndexRowOne: -1}); 
        this.setState({selectedIndexRowTwo: -1}); 
        this.setState({text: ''}); 
        this.props.closeModalUpdate(false);
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

                <View> 
                    <TextInput 
                      type="TextInput" 
                      name="myTextInput" 
                      style={{height: 40, marginBottom: 10}}
                      placeholder='Change your username' 
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
                      onPress={this.cancelProfile}
                      title="Cancel"
                      />
                  </View>
                  <View style={styles.button}>
                      <Button
                      onPress={this.updateProfile}
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
container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "flex-start",  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  button: {
    flex: 1
  },
  modal: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 100,
    marginTop: 100,
    marginBottom: 100,
    marginLeft: 20,
    marginRight: 20,
  },
  text: {
      color: '#3f2949',
      marginTop: 10,
      alignItems: 'center',
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
  content: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },    
});