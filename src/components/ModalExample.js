import React, { Component } from 'react';
import {StyleSheet, Text, Button, View, Image, TextInput, Alert} from 'react-native';
import Modal from 'react-native-modal';
import { ButtonGroup } from 'react-native-elements';

const img1 = require('../../img/favicon.png');
const img2 = require('../../img/apple-logo.png');
const img3 = require('../../img/twitter-logo.png');
const img4 = require('../../img/linkedin-logo.png');
const img5 = require('../../img/microsoft-logo.png');
const img6 = require('../../img/chrome-logo.png');
const imgArrayRowOne = [img1, img2, img3];
const imgArrayRowTwo = [img4, img5, img6];

//Get random image on app boot for fi
const randomInt = Math.floor(Math.random() * 2);
const randomIndex= Math.floor(Math.random() * 3)
const bootImage = (randomInt === 0) ? imgArrayRowOne[randomIndex] :
  imgArrayRowTwo[randomIndex];

export default class ModelExample extends Component {
  constructor(props) {
    super(props);
    this.state = { 
        selectedIndexRowOne: -1,
        selectedIndexRowTwo: -1,
        currentPicture: bootImage,
        visibleModalId: null,
        text: '',
        isFocused: false
    };
  }
  componentWillUnmount() {
    this.setState({
      currentPicture: img2
    })
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

  render() {
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

    const { selectedIndexRowOne } = this.state;
    const { selectedIndexRowTwo } = this.state;
    const { currentPicture } = this.state;
    const { isFocused } = this.state;
    const {text} = this.state;

    const handleFocus = () => {
      this.setState({isFocused: true});
    }
  
    const handleBlur = () => {
      this.setState({isFocused: false});
    }

    const cancelProfile = () => {
      this.setState({selectedIndexRowOne: -1}); 
      this.setState({text: ''}); 
      this.setState({ visibleModal: null });
    }

    const updateProfile = () => {
      if(selectedIndexRowOne === -1 && selectedIndexRowTwo === -1){
        if(text.length === 0){
          Alert.alert('Warning','No changes were made');
        }
        else if(text.length > 16){
          Alert.alert('Warning', 'Username should be less than 16 characters');         
        }
        else{ 
          // if(text.length > 0){
          //   // publish username to channel and database
          // }
          this.setState({ visibleModal: null });
        }
      }
      // else if(text.length)
      else{
        let getRowPic = (selectedIndexRowOne  > -1) ? true: false;
        getRowPic = (getRowPic) ? imgArrayRowOne[selectedIndexRowOne]:
          imgArrayRowTwo[selectedIndexRowTwo];
        this.setState({ currentPicture: getRowPic });
        this.setState({selectedIndexRowOne: -1}); 
        this.setState({selectedIndexRowTwo: -1}); 
        this.setState({ visibleModal: null });
      }

    }

    return (
      <View style={styles.container}>
      <Image
          source={ currentPicture }
      />

       <Button
          onPress={() => this.setState({ visibleModal: 'default' })}
          title="Press me"
        />
        <Modal isVisible={this.state.visibleModal === 'default'}>
          <View style={styles.content}>
            <View style={styles.textContent}> 
              <Text style={styles.text}>Profile</Text> 
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
                onFocus={handleFocus}
                onBlur={handleBlur}
                value={this.state.text}
                onChangeText={(text) => this.setState({text})}                 
              />            
            </View>

            <View style={styles.buttonContainer}>
              <View style={styles.button}>
                <Button
                  onPress={cancelProfile}
                  title="Cancel"
                />
              </View>
              <View style={styles.button}>
                <Button
                  onPress={updateProfile}
                  title="Confirm"
                />
              </View>
            </View>
           </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(208,33,41)'
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
  buttonContainer: {
    flexDirection: 'row',
  },
  button: {
    flex: 1
  }
});