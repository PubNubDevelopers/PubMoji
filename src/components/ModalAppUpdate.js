import React, { Component } from 'react';
import {StyleSheet, Text, TouchableHighlight, View, Image, TextInput, Animated,Dimensions, Keyboard,Alert, TouchableOpacity} from 'react-native';
import { ButtonGroup } from 'react-native-elements';

const window = Dimensions.get('window');
const {width, height, scale} = window;

const img1 = require('../../assets/images/lion.png');
const img2 = require('../../assets/images/fox.png');
const img3 = require('../../assets/images/dog.png');
const img4 = require('../../assets/images/panda.png');
const img5 = require('../../assets/images/monkey.png');
const img6 = require('../../assets/images/cat.png');
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
            shift: new Animated.Value(0),
            isFocused: false,
            pressStatusConfirm: false,
            pressStatusCancel: false
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

        const gap = (windowHeight - keyboardHeight ) - (py + height) - 10

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
          Alert.alert('Error','No changes were made.');
        }else if(text.length > 16){
          Alert.alert('Error', 'Username should be less than 16 characters.');
        }else{
          this.props.changeProfile(-1,this.state.text);
          this.setState({text: ''});
          this.props.closeModalUpdate(false);
        }
      }
      else{
        let getRowPic = (selectedIndexRowOne  > -1) ? true: false;
        getRowPic = (getRowPic) ? imgArrayRowOne[selectedIndexRowOne]: imgArrayRowTwo[selectedIndexRowTwo];

        if(text.length != 0 && text.length < 16){
          this.props.changeProfile(getRowPic,this.state.text);
          this.setState({text: ''});
        }else{
          this.props.changeProfile(getRowPic,"");
        }
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
          <View >
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
                      placeholder= {this.props.currentUsername}
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
                    <View style={styles.buttonContainer}
                      ref={view => { this.buttonGroup = view; }}>
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
                    <View style={styles.buttonBorder}/>
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
          </Animated.View>
        </View>
        );
      }
  }

const styles = StyleSheet.create({
  buttonGroupSelectedButton:{
    backgroundColor: 'rgb(208,33,41)'
  },
  container: {
    flexDirection: 'row',
    marginBottom: 5,
    paddingLeft: 9,
    paddingRight: 9
  },
  profileImages: {
    width: 55, 
    height: 55
  },
  buttonContainer: {
    flex: 1,
    textAlign: 'center',
  },
  buttonBorder: {
    borderLeftWidth: 4,
    borderLeftColor: 'white'
  },
  buttonPressed:{
    borderColor: 'rgb(208,33,41)',
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: 5,
  },
  buttonNotPressed: {
    backgroundColor: 'rgb(208,33,41)',
    alignSelf: 'stretch',
    borderColor: 'rgb(208,33,41)',
    borderWidth: 1,
    borderRadius: 5,
  },
  cancelPressed:{
    textAlign: 'center',
    color: 'rgb(208,33,41)',
    paddingTop: 9,
    paddingBottom: 9,
    fontSize: 16,
  },
  cancelNotPressed: {
    textAlign: 'center',
    color: 'white',
    paddingTop: 9,
    paddingBottom: 9,
    fontSize: 16,
  },
  username:{
    flexDirection: 'row',
    height: 40,
    marginBottom: 10,
    paddingLeft: 8,
    paddingRight: 8
  },
  textContent: {
    alignItems: 'center',
    marginBottom: 6,
  },
  text: {
    fontFamily: 'ProximaNova-Regular',
    color: 'rgb(208,33,41)',
    fontSize: 34,
    fontWeight: 'bold',
  },
  content: {
    backgroundColor: 'white',
    padding: 5,
    justifyContent: 'center',
    borderRadius: 5,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
});
