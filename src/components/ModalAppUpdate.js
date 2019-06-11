import React, { Component } from 'react';
import {StyleSheet, Text, TouchableHighlight, View, Image, TextInput, Alert, TouchableOpacity, Button} from 'react-native';
import { ButtonGroup } from 'react-native-elements';

const img1 = require('../../assets/images/person-male.png');
const img2 = require('../../assets/images/person-female.png');
const img3 = require('../../assets/images/cat.png');
const img4 = require('../../assets/images/doge.png');
const img5 = require('../../assets/images/anonymous-mask.png');
const img6 = require('../../assets/images/corgi.png');
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
            isFocused: false,
            pressStatusConfirm: false,
            pressStatusCancel: false
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
          console.log('profile updated');
          this.setState({text: ''}); 
          this.setState({ visibleModalUpdate: false });
        }
      }
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

    onHideUnderlayCancelButton = () => {
      this.setState({ pressStatusCancel: false });
    }

    onShowUnderlayCancelButton = () => {
      this.setState({ pressStatusCancel: true });
    }   
    
    onHideUnderlayConfirmButton = () => {
      this.setState({ pressStatusConfirm: false });
    }

    onShowUnderlayConfirmButton = () => {
      this.setState({ pressStatusConfirm: true });
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

            <View style={styles.container}>
              <View style={styles.buttonContainer}>
                <TouchableHighlight
                      activeOpacity={1}
                      underlayColor={'white'}
                      style={
                        this.state.pressStatusCancel
                            ? styles.buttonPressed
                            : styles.buttonNotPressed
                      }     
                        onHideUnderlay={this.onHideUnderlayCancelButton}
                        onShowUnderlay={this.onShowUnderlayCancelButton}               
                        onPress={this.cancelProfile}
                      >
                        <Text 
                          style={
                          this.state.pressStatusCancel
                              ? styles.cancelPressed
                              : styles.cancelNotPressed
                              }
                          > 
                          Cancel
                        </Text>
                  </TouchableHighlight>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableHighlight
                      activeOpacity={1}
                      underlayColor={'white'}
                      style={
                        this.state.pressStatusConfirm
                            ? styles.buttonPressed
                            : styles.buttonNotPressed
                      }     
                        onHideUnderlay={this.onHideUnderlayConfirmButton}
                        onShowUnderlay={this.onShowUnderlayConfirmButton}               
                        onPress={this.updateProfile}
                      >
                        <Text 
                          style={
                          this.state.pressStatusConfirm
                              ? styles.cancelPressed
                              : styles.cancelNotPressed
                              }
                          > 
                          Confirm
                        </Text>
                  </TouchableHighlight>
              </View>
            </View>
          </View>
        );
    }       
}


const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  buttonContainer: {
    paddingRight: 5,
    paddingLeft: 6
  },

  buttonPressed:{
    borderColor: 'rgb(208,33,41)',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
  },
  buttonNotPressed: {
    backgroundColor: 'rgb(208,33,41)',
    borderColor: 'rgb(208,33,41)',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,

  },
  cancelPressed:{
    color: 'rgb(208,33,41)'
  },
  cancelNotPressed: {
    color: 'white'
  },
  username:{
    flexDirection: 'row', 
    height: 40, 
    marginBottom: 10,
    paddingLeft: 6
  },
  textContent: {
    alignItems: 'center',
    marginBottom: 10,
  },
  text: {
    fontFamily: 'roboto',
    color: 'rgb(208,33,41)',  
    fontSize: 34,
    fontWeight: 'bold',
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