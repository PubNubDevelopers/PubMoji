import React, { Component } from 'react';
import {StyleSheet, Text, TouchableHighlight, View, Image, TextInput, Animated,Dimensions, Keyboard,Alert, TouchableOpacity} from 'react-native';
import { ButtonGroup } from 'react-native-elements';

const img1 = require('../../assets/images/anon_mask.png');
const img2 = require('../../assets/images/bear.png');
const img3 = require('../../assets/images/rabbit.png');
const img4 = require('../../assets/images/corgi.png');
const img5 = require('../../assets/images/cat.png');
const img6 = require('../../assets/images/dolphin.png');
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
            shift: new Animated.Value(0),
            isFocused: false ,
            pressStatus: false
         };
      }
      componentDidMount() {
        this.keyboardDidShowSub = Keyboard.addListener('keyboardWillShow', this.handleKeyboardDidShow);
        this.keyboardDidHideSub = Keyboard.addListener('keyboardWillHide', this.handleKeyboardDidHide);
      }
      componentWillUnmount(){
        this.keyboardDidShowSub.remove();
        this.keyboardDidHideSub.remove();
      }
      handleKeyboardDidShow = (event) => {
        const { height: windowHeight } = Dimensions.get('window');
        const keyboardHeight = event.endCoordinates.height;
        this.textInput.measure( (fx, fy, width, height, px, py) => {

        const gap = (windowHeight - keyboardHeight ) - (py + height)

        Animated.timing(
          this.state.shift,
          {
            toValue: gap,
            duration: 180,
            useNativeDriver: true,
          }
          ).start();
        })
      }

      handleKeyboardDidHide = () => {
        Animated.timing(
          this.state.shift,
          {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }
        ).start();
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
        Alert.alert('Error', 'Username should be less than 16 characters.');
      }
      else{
        // publish username and image to channel
        let getRowPic = (selectedIndexRowOne  > -1) ? true: false;
        getRowPic = (getRowPic) ? imgArrayRowOne[selectedIndexRowOne]:
          imgArrayRowTwo[selectedIndexRowTwo];
        this.props.changeProfile(getRowPic,this.state.text);
        this.setState({text: ''});
        this.props.closeModalInit(false);
      }
    }

    onHideUnderlay = () => {
      this.setState({ pressStatus: false });
    }

    onShowUnderlay = () => {
      this.setState({ pressStatus: true });
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

        const buttonsOne = [{ element: component1 }, { element: component2 }, { element: component3 }];
        const buttonsTwo = [{ element: component4 }, { element: component5 }, { element: component6 }];

        return (
          <View>
            <Animated.View style={[styles.content, { transform: [{translateY: this.state.shift}] }]}>
                <View style={styles.textContent}>
                    <Text style={styles.text}>Profile</Text>
                </View>
                <ButtonGroup
                    selectedIndex={this.state.selectedIndexRowOne}
                    selectedButtonStyle={styles.buttonGroupSelectedButton}
                    buttons={buttonsOne}
                    onPress={this.updateIndexOne}
                    containerStyle={{height: 70}}
                />
                <ButtonGroup
                    selectedIndex={this.state.selectedIndexRowTwo}
                    selectedButtonStyle={styles.buttonGroupSelectedButton}
                    buttons={buttonsTwo}
                    onPress={this.updateIndexTwo}
                    containerStyle={{height: 70}}
                />

                <View style={styles.username}>
                    <TextInput
                        ref={view => { this.textInput = view; }}
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
                            onPress={this.confirmProfile}
                          >
                            <Text
                              style={
                              this.state.pressStatus
                                  ? styles.cancelPressed
                                  : styles.cancelNotPressed
                                  }
                              >
                              Confirm
                            </Text>
                      </TouchableHighlight>
                </View>
            </Animated.View>
          </View>
        );
    }
}

const styles = StyleSheet.create({
  buttonGroupSelectedButton:{
    backgroundColor: 'rgb(208,33,41)'
  },
  buttonContainer: {
    alignItems: 'stretch',
    textAlign: 'center',
    paddingLeft: 9,
    paddingRight: 9,
    marginBottom: 5,
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
  textContent: {
    alignItems: 'center',
    marginBottom: 6,  
    marginTop: 3
  },
  text: {
    fontFamily: 'ProximaNova-Regular',
    color: 'rgb(208,33,41)',
    fontSize: 34,
    fontWeight: 'bold',
  },
  username:{
    flexDirection: 'row',
    height: 40,
    marginBottom: 10,
    paddingLeft: 8,
    paddingRight: 8
  },
  content: {
    backgroundColor: 'white',
    padding: 5,
    justifyContent: 'center',
    borderRadius: 5,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
});
