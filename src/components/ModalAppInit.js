import React, { Component } from 'react';
import {StyleSheet, Text, TouchableHighlight, View, Image, TextInput, Animated,Dimensions, Keyboard,Alert, Linking} from 'react-native';
import { ButtonGroup, CheckBox} from 'react-native-elements';

const img1 = require('../../assets/images/lion.png');
const img2 = require('../../assets/images/fox.png');
const img3 = require('../../assets/images/dog.png');
const img4 = require('../../assets/images/panda.png');
const img5 = require('../../assets/images/monkey.png');
const img6 = require('../../assets/images/cat.png');
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
            checked: false,
            pressStatus: false,
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
        this.buttonGroup.measure( (fx, fy, width, height, px, py) => {

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

      if(text.length > 16){
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

    allChecked = () => {
      if (this.state.checked === false || this.state.text === '' ||
      this.state.selectedIndexRowOne === -1 || this.state.selectedIndexRowTwo === -1) {
        return false;
      }
      return true;
    }

    render() {
        const { isFocused } = this.state;

        const component1 = () =>
        <Image
          style={styles.profileImages}
          source={img1}
        />

        const component2 = () =>
        <Image
          style={styles.profileImages}
          source={img2}
        />

        const component3 = () =>
        <Image
          style={styles.profileImages}
          source={img3}
        />

        const component4 = () =>
        <Image
          style={styles.profileImages}
          source={img4}
        />

        const component5 = () =>
        <Image
          style={styles.profileImages}
          source={img5}
        />

        const component6 = () =>
        <Image
          style={styles.profileImages}
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

                <View>
                  <CheckBox
                      title=
                      {
                        <Text style={{color: 'black'}}> I agree to the <Text onPress={() => 
                          Linking.openURL('https://www.pubnub.com/developers/demos/pubmoji/terms-of-use/')} 
                            style={styles.checkBoxTextStyle}>
                            Terms of Use</Text>
                        </Text>           
                      }
                      containerStyle={styles.checkBoxContainer}
                      checkedIcon='dot-circle-o'
                      uncheckedIcon='circle-o'
                      checkedColor='rgb(208,33,41)'
                      checked={this.state.checked}
                      onPress={() => this.setState({checked: !this.state.checked})}
                    />
                </View>

                <View style={styles.buttonContainer}
                    ref={view => { this.buttonGroup = view; }}>
                  <TouchableHighlight
                          activeOpacity={1}
                          underlayColor={'white'}
                          style={
                            ((this.state.selectedIndexRowOne != -1 || this.state.selectedIndexRowTwo != -1)  && this.state.text != '' 
                            && this.state.checked === true) 
                            ? (this.state.pressStatus
                                ? styles.buttonPressed
                                : styles.buttonNotPressed)
                            : styles.buttonDisabled
                          }
                            onHideUnderlay={this.onHideUnderlay}
                            onShowUnderlay={this.onShowUnderlay}
                            disabled={
                              ((this.state.selectedIndexRowOne != -1 || this.state.selectedIndexRowTwo != -1)  && 
                              this.state.text != '' && this.state.checked === true) ? false : true
                            }
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
  checkBoxContainer:{
    backgroundColor: 'white',
    borderColor: 'white',
    alignItems:'flex-start',
    marginLeft: 4,
    marginTop: -5
  },
  checkBoxTextStyle:{
    color: 'blue',
    marginLeft: 5,
    fontSize: 16,
  },
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
  buttonDisabled: {
    backgroundColor: 'gray',
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5
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
  profileImages: {
    width: 55, 
    height: 55
  },
  content: {
    backgroundColor: 'white',
    padding: 5,
    justifyContent: 'center',
    borderRadius: 5,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
});
