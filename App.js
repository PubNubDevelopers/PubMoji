import React, {Component} from 'react';
import {StyleSheet, Text, TextInput, View, Image, Button, Alert, TouchableOpacity} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import PubNubReact from 'pubnub-react';
import * as Animatable from 'react-native-animatable';
import Modal from "react-native-modal";
import { ButtonGroup } from 'react-native-elements';
import SplashScreen from './src/components/SplashScreen';

const img1 = require('./assets/images/favicon.png');
const img2 = require('./assets/images/apple-logo.png');
const img3 = require('./assets/images/twitter-logo.png');
const img4 = require('./assets/images/linkedin-logo.png');
const img5 = require('./assets/images/microsoft-logo.png');
const img6 = require('./assets/images/chrome-logo.png');
const imgArrayRowOne = [img1, img2, img3];
const imgArrayRowTwo = [img4, img5, img6];

export default class App extends React.Component {

  constructor(props) {
    super(props);

    //Pub Sub Keys
    this.pubnub = new PubNubReact({
        publishKey: 'pub-c-a64b528c-0749-416f-bf75-50abbfa905f9',
        subscribeKey: 'sub-c-8a8e493c-f876-11e6-80ea-0619f8945a4f'
    });

    console.disableYellowBox = true;

    //Base State
    this.state = {
      latitude: -6.270565,
      longitude: 106.759550,
      error:null,
      users: new Map(),
      emoji: 0,

      isLoading: true,
      selectedIndexRowOne: -1,
      selectedIndexRowTwo: -1,
      currentPicture: null,
      visibleModalStart: true,
      visibleModalUpdate: false,
      text: '',
      isFocused: false ,
    };

    //Initialize PubNub Instance
    this.pubnub.init(this);

  }

  performTimeConsumingTask = async() => {
    return new Promise((resolve) =>
      setTimeout(
        () => { resolve('result') },
        3000
      )
    );
  }

  //Unsubscribe PubNub Channel
  componentWillUnmount() {
    this.pubnub.unsubscribe({
      channels: ['channel1']
    });
  }

  //Track User GPS Data
  async componentDidMount() {
    this.pubnub.subscribe({
      channels: ['channel1'],
      withPresence: true
    });

    this.pubnub.getMessage('channel1', (msg) => {
        coord = [msg.message.latitude,msg.message.longitude]; //Format GPS Coordinates for Payload
        let oldUser = this.state.users.get(msg.message.uuid); //Obtain User's Previous State Object

        console.log(msg);
        //emojiCount
        let emojiCount;
        if(msg.message.emoji != 2){ //Add Payload Emoji Count to emojiCount
          if(oldUser){
            emojiCount = oldUser.emoji + msg.message.emoji;
          }else{
            emojiCount = msg.message.emoji;
          }
        }else{
          emojiCount = 0; //reset EmojiCount to 0
        }


        let newUser = {uuid: msg.message.uuid, coords: coord, emoji: msg.message.emoji }; //User's Updated State
        //Check If State Has Changed With User
        if(!this.isEquivalent(oldUser, newUser)){
          let tempMap = this.state.users;
          newUser = {uuid: msg.message.uuid, coords: coord, emoji: emojiCount}; //add in the emoji count
          //Add/Remove User depending on hideUser
          if(msg.message.hideUser){
            tempMap.delete(newUser.uuid)
          }else{
            tempMap.set(newUser.uuid, newUser);
          }

          this.setState({
            users: tempMap
          })
        }
    });


    //Get Stationary Coordinate
    navigator.geolocation.getCurrentPosition(
      position => {
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null
        });
      },
      error => this.setState({ error: error.message }),
      { enableHighAccuracy: true, timeout: 200000, maximumAge: 1000 }
    );


    //Track motional Coordinates
    navigator.geolocation.watchPosition(
      position => {
        const { latitude, longitude } = position.coords;
        this.setState({ latitude,longitude });
        this.pubnub.publish({
          message: {latitude: this.state.latitude, longitude: this.state.longitude, uuid: this.pubnub.getUUID(), emoji: this.state.emoji},
          channel: 'channel1'
        });

      },
      error => console.log(error),
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000,
        distanceFilter: 1000
      }
    );
    const data = await this.performTimeConsumingTask();
  
    if (data !== null) {
      this.setState({ isLoading: false });
    }
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
  }

  //Coordinate Setter
  setRegion = () => ({
   latitude: this.state.latitude,
   longitude: this.state.longitude,
   latitudeDelta: 0,
   longitudeDelta: 0

  });

  //Decrement Emoji Count
  hideEmoji = () => {
    this.pubnub.publish({
      message: {latitude: this.state.latitude, longitude: this.state.longitude, uuid: this.pubnub.getUUID(), emoji: -1},
      channel: 'channel1'
    });
  };

  //Increment Emoji Count
  showEmoji = () => {
    this.pubnub.publish({
      message: {latitude: this.state.latitude, longitude: this.state.longitude, uuid: this.pubnub.getUUID(), emoji: 1},
      channel: 'channel1'
    });
  };

  //Reset Emoji Count
  killEmoji = () => {
    this.pubnub.publish({
      message: {latitude: this.state.latitude, longitude: this.state.longitude, uuid: this.pubnub.getUUID(), emoji: 2},
      channel: 'channel1'
    });
  };

  showText = () => {
    if(this.state.show == true){
      this.setState({show: false});
    }else{
      this.setState({show:true});
    }
  }

  isEquivalent = (a, b) => {
    if(!a || !b){
      if(a === b) return true;
      return false
    }
    // Create arrays of property names
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);

    // If number of properties is different,
    // objects are not equivalent
    if (aProps.length != bProps.length) {
        return false;
    }

    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];

        // If values of same property are not equal,
        // objects are not equivalent
        if (a[propName] !== b[propName]) {
            return false;
        }
    }

    // If we made it this far, objects
    // are considered equivalent
    return true;
  }

  printHello (){
    Alert.alert('You tapped the button!');
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
    if(this.state.isLoading){
      return <SplashScreen />;
    }

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

    const confirmProfile = () => {
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
        this.setState({ currentPicture: getRowPic });
        this.setState({selectedIndexRowOne: -1}); 
        this.setState({selectedIndexRowTwo: -1}); 
        this.setState({text: ''}); 
        this.setState({ visibleModalStart: false  });
      }
    }

    const cancelProfile = () => {
      this.setState({selectedIndexRowOne: -1}); 
      this.setState({selectedIndexRowTwo: -1}); 
      this.setState({text: ''}); 
      this.setState({ visibleModalUpdate: false });
    }

    const updateProfile = () => {
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
        this.setState({ currentPicture: getRowPic });
        this.setState({selectedIndexRowOne: -1}); 
        this.setState({selectedIndexRowTwo: -1}); 
        this.setState({text: ''}); 
        this.setState({ visibleModalUpdate: false });
      }
    }

    let usersArray = Array.from(this.state.users.values());

    return (
    <View style={styles.container}>
      <Modal isVisible={this.state.visibleModalStart}>
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

              <View style={{flexDirection: 'row', height: 40, marginBottom: 10}}> 
                <TextInput 
                    style={{flex: 1}}
                    type="TextInput" 
                    name="myTextInput" 
                    placeholder='Enter your username' 
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
                    onPress={confirmProfile}
                    title="Confirm"
                    />
                </View>
            </View>
          </View>
        </Modal>

       <MapView style={styles.map} region={this.setRegion()}>
          { usersArray.map((item, index)=>(
            <Marker key={index} coordinate={{latitude: item.coords[0], longitude: item.coords[1]}}>

              {(item.emoji > 0 ) && <Animatable.View animation="fadeOutUp" duration={2000} iterationCount={1} direction="normal" easing = "ease-out" onAnimationEnd={() => this.hideEmoji()}>
                <Image source={require('./assets/images/favicon.png')} style={{height: 35, width:35, }} />
              </Animatable.View> }

              {(item.emoji-1 > 0 ) && <Animatable.View animation="fadeOutUp" duration={1500} iterationCount={1} direction="normal" easing = "ease-out" onAnimationEnd={() => this.hideEmoji()}>
                <Image source={require('./assets/images/favicon.png')} style={{height: 35, width:35, }} />
              </Animatable.View> }

              {(item.emoji-2 > 0 ) && <Animatable.View animation="fadeOutUp" duration={1000} iterationCount={1} direction="normal" easing = "ease-out" onAnimationEnd={() => this.hideEmoji()}>
                <Image source={require('./assets/images/favicon.png')} style={{height: 35, width:35, }} />
              </Animatable.View> }

              {(item.emoji-3 > 0 ) && <Animatable.View animation="fadeOutUp" duration={2000} iterationCount={1} direction="normal" easing = "ease-out" onAnimationEnd={() => this.hideEmoji()}>
                <Image source={require('./assets/images/favicon.png')} style={{height: 35, width:35, }} />
              </Animatable.View> }

              {(item.emoji-4 > 0 ) && <Animatable.View animation="fadeOutUp" duration={1500} iterationCount={1} direction="normal" easing = "ease-out" onAnimationEnd={() => this.hideEmoji()}>
                <Image source={require('./assets/images/favicon.png')} style={{height: 35, width:35, }} />
              </Animatable.View> }

              {(item.emoji-5 > 0 ) && <Animatable.View animation="fadeOutUp" duration={2000} iterationCount={1} direction="normal" easing = "ease-out" onAnimationEnd={() => this.hideEmoji()}>
                <Image source={require('./assets/images/favicon.png')} style={{height: 35, width:35, }} />
              </Animatable.View> }

              {(item.emoji-6 > 0 ) && <Animatable.View animation="fadeOutUp" duration={2000} iterationCount={1} direction="normal" easing = "ease-out" onAnimationEnd={() => this.hideEmoji()}>
                <Image source={require('./assets/images/favicon.png')} style={{height: 35, width:35, }} />
              </Animatable.View> }

              {(item.emoji-7 > 0 ) && <Animatable.View animation="fadeOutUp" duration={2000} iterationCount={1} direction="normal" easing = "ease-out" onAnimationEnd={() => this.killEmoji()}>
                <Image source={require('./assets/images/favicon.png')} style={{height: 35, width:35, }} />
              </Animatable.View> }

              <Image source={currentPicture} style={{height: 35, width:35, }} />
            </Marker>
          )) }
       </MapView>

       <View style={styles.topBar}> 
          <TouchableOpacity onPress={() => this.setState({ visibleModalUpdate: !this.state.visibleModalUpdate })}>
            <Image
              style={styles.profile}
              source={require('./assets/images/profile.png')}
            />
          </TouchableOpacity>
                
          <Modal isVisible={this.state.visibleModalUpdate}>
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

          <View style={styles.rightBar}>
            <TouchableOpacity onPress={this.toggleAbout}>
              <Image
                style={styles.info}
                source={require('./assets/images/info.png')}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomBar}>
            <Button onPress={this.showEmoji} title="Emoji Bar Here"/>
        </View>
    </View>
   );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
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
  topBar:{
    top: 50,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  bottomBar:{
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 36
  },
  rightBar:{
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  container: {
    flex:1,
  },
  info: {
    width: 30,
    height: 30,
    marginHorizontal: 15,
  },
  profile: {
    width: 30,
    height: 30,
    marginHorizontal: 25,
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