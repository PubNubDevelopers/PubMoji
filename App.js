// Modal implented with modifying profile pic in map

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, TextInput, Button, View, Image, Switch,TouchableOpacity,TouchableWithoutFeedback, Header, Alert} from 'react-native';
import MapView, {Marker, AnimatedRegion } from 'react-native-maps';
import PubNubReact from 'pubnub-react';
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

export default class App extends Component {
  constructor(props) {
    super(props);
    this.pubnub = new PubNubReact({
        publishKey: 'pub-c-a64b528c-0749-416f-bf75-50abbfa905f9',
        subscribeKey: 'sub-c-8a8e493c-f876-11e6-80ea-0619f8945a4f',
    });

    //Base State
    this.state = {
      currentLoc: {
        latitude: -1,
        longitude : -1
      },
      numUsers: 0,
      username: "A Naughty Moose",
      fixedOnUUID: "",
      focusOnMe: false,
      users: new Map(),
      messages: new Map(),
      allowGPS: true,
      showAbout: false,

     // Oscar's states
     selectedIndexRowOne: -1,
     selectedIndexRowTwo: -1,
     currentPicture: null,
     visibleModalStart: true,
     visibleModalUpdate: false,
     usernameTemp: '',
     isFocused: false ,
     isLoading: false,
    };
    this.pubnub.init(this);
  }

  // performTimeConsumingTask = async() => {
  //   return new Promise((resolve) =>
  //     setTimeout(
  //       () => { resolve('result') },
  //       3000
  //     )
  //   );
  // }

  //Track User GPS Data
    componentDidMount() {
    //PubNub

    console.log('mounting');
    // this.pubnub.getMessage('channel1.messages',(msg) =>{
    //   if(this.state.users.has(msg.message.uuid)){
    //     let tempMap = this.state.messages;
    //     if(this.state.messages.has(msg.message.uuid)){
    //       this.stopMessageTimer(this.state.messages.get(msg.message.uuid).timerId)
    //     }
    //     let message = {uuid: msg.message.uuid, message: msg.message.message, timerId: setTimeout(this.clearMessage, 5000, msg.message.uuid) }
    //     tempMap.set(msg.message.uuid, message)
    //     this.setState({
    //       messages: tempMap
    //     })
    //   }
    // })

    this.pubnub.getMessage('channel1', (msg) => {
      if(msg.message.uuid == this.state.fixedOnUUID){
        this.animateToCurrent({latitude: msg.message.latitude, longitude: msg.message.longitude},400)
      }
      let oldUser = this.state.users.get(msg.message.uuid)
      let newUser = {uuid: msg.message.uuid, latitude: msg.message.latitude, longitude: msg.message.longitude, image: msg.message.image, username: msg.message.username };
      if(!this.isEquivalent(oldUser, newUser)){
        let tempMap = this.state.users;

        if(msg.message.hideUser){
            tempMap.delete(newUser.uuid)
        }else{
          tempMap.set(newUser.uuid, newUser);
        }

        this.setState({
          users: tempMap
        })
      }
       //this.publishMessage()
    });
    this.pubnub.subscribe({
        channels: ['channel1'],
        withPresence: true
    });
    // this.pubnub.subscribe({
    //     channels: ['channel1.messages'],
    //     withPresence: true
    // });
    this.pubnub.getPresence('channel1', (presence) => {
        console.log(presence);
    });
    //Get Stationary Coordinate
    navigator.geolocation.getCurrentPosition(
      position => {
        if(this.state.allowGPS){
          this.pubnub.publish({
            message: {latitude: position.coords.latitude, longitude: position.coords.longitude, uuid: this.pubnub.getUUID(), image: this.state.currentPicture, username: this.state.username},
            channel: 'channel1'
          });
          this.setState({
            currentLoc: position.coords
          })

        }
      },
      error => console.log("Maps Error: ",error),
      { enableHighAccuracy: true, timeout: 200, maximumAge: 1000 }
    );
    //Track motional Coordinates
    navigator.geolocation.watchPosition(
      position => {
        this.setState({
          currentLoc: position.coords
        })
        if(this.state.allowGPS){
          this.pubnub.publish({
            message: {latitude: position.coords.latitude, longitude: position.coords.longitude, uuid: this.pubnub.getUUID(), image: this.state.currentPicture, username: this.state.username},
            channel: 'channel1'
          });
          if(this.state.focusOnMe){
            this.animateToCurrent(position.coords,1000)
          }
        }

      },
      error => console.log("Maps Error: ",error),
      {
        enableHighAccuracy: true,
        timeout: 200,
        maximumAge: 1000,
        distanceFilter: 100
      }
    );

     //setInterval(this.publishMessage, 10000);
    // console.log('unmounting');
    // const data = await this.performTimeConsumingTask();
    //
    // if (data !== null) {
    //   this.setState({ isLoading: false });
    // }
  }

  // clearMessage = (uuid) =>{
  //   let tempMap = this.state.messages;
  //   console.log("deleted", tempMap.delete(uuid))
  //   this.setState({
  //     messages: tempMap
  //   },()=>{console.log("piza",this.state.messages)})
  //   //console.log("clearing message")
  // }
  // stopMessageTimer = (timerId) => {
  //   console.log("clearing timeout");
  //   clearTimeout(timerId)
  // }
  // publishMessage = () => {
  //   const testMessage = "Testing messages";
  //   this.pubnub.publish({
  //     message: {message: Math.random( ), uuid: this.pubnub.getUUID()},
  //     channel: 'channel1.messages'
  //   });
  //   console.log("publishing")
  // }
  componentWillUnmount() {
    this.pubnub.publish({
      message: {latitude: -1, longitude: -1, uuid: this.pubnub.getUUID(),image: this.state.currentPicture, hideUser: true},
      channel: 'channel1'
    });
    this.pubnub.unsubscribeAll();
    navigator.geolocation.clearWatch(this.watchID);
  }
  componentDidUpdate(prevProps,prevState){
    if(prevState.allowGPS != this.state.allowGPS){
      console.log("allow GPS: ",this.state.allowGPS)
      if(this.state.allowGPS){
        if(this.state.focusOnMe){
          this.animateToCurrent(this.state.currentLoc,1000)
        }
        let tempMap = this.state.users;
        let tempUser = {latitude: this.state.currentLoc.latitude, longitude: this.state.currentLoc.longitude, uuid: this.pubnub.getUUID(), image: this.state.currentPicture, username: this.state.username}
        tempMap.set(tempUser.uuid, tempUser)
        this.setState({
          users: tempMap
        },()=>{
          this.pubnub.publish({
            message: tempUser,
            channel: 'channel1'
          });
        })
      }else{
        this.pubnub.publish({
          message: {latitude: -1, longitude: -1, uuid: this.pubnub.getUUID(),image: this.state.currentPicture, hideUser: true},
          channel: 'channel1'
        });
      }
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
  animateToCurrent = (coords,speed) =>{
    region = {
      latitude: coords.latitude,
      longitude: coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }
    this.map.animateToRegion(region,speed)
  }
  // animate(newCoords) {
  //   const { coordinate } = new AnimatedRegion(this.state.coords),
  //   const newCoordinate = newCoords;
  //
  //   if (Platform.OS === 'android') {
  //     if (this.marker) {
  //       this.marker._component.animateMarkerToCoordinate(newCoordinate, 500);
  //     }
  //   } else {
  //     coordinate.timing(newCoordinate).start();
  //   }
  // }
  toggleAbout = () =>{
    this.setState({
      showAbout: !this.state.showAbout
    })
  }
  toggleGPS = () => {
    this.setState({
      allowGPS: !this.state.allowGPS
    })
  }
  focusLoc = () => {
    if(this.state.focusOnMe || this.state.fixedOnUUID){
      this.setState({
        focusOnMe: false,
        fixedOnUUID: "",
      })
    }else{
      region = {
        latitude: this.state.currentLoc.latitude,
        longitude: this.state.currentLoc.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
      this.setState({
        focusOnMe: true
      })
      this.map.animateToRegion(region,2000)
    }
  }
  draggedMap = () =>{
    this.setState({
      focusOnMe: false,
      fixedOnUUID: ""

    })

  }
  touchUser = (uuid) =>{
    if(uuid === this.pubnub.getUUID()){
      this.focusLoc()
    }else{
      this.setState({
        fixedOnUUID: uuid,
        focusOnMe: false
      })
    }
  }
  selectedStyle = (uuid) =>{
    if((this.state.focusOnMe && uuid == this.pubnub.getUUID()) || this.state.fixedOnUUID == uuid)
    {
      return { height: 50, width:50}
    }
    return { height: 30, width:30}
  }
  messageOutPut = (message) => {
    if(message){
      return(
        <Text style={styles.messagePopUp}>{message}</Text>
      )
    }
  }
  showUsername = (user) => {
    if((this.state.focusOnMe && user.uuid == this.pubnub.getUUID()) || this.state.fixedOnUUID == user.uuid)
    {
      console.log(user.username)
      return (
        <Text>{user.username}</Text>
      )
    }
  }
  // selectUserImage = (imageNum) =>{
  //   switch (imageNum) {
  //     case 1:
  //       return (require('./assets/images/boss.png'))
  //
  //       break;
  //     default:
  //       return (require('./assets/images/boss.png'))
  //
  //   }
  // }

  // Oscars functions
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
      console.log('show splashscreen');
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
    const {usernameTemp} = this.state;

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
      else if(usernameTemp.length === 0){
        Alert.alert('Error','Please enter your username.');
      }
      else if(usernameTemp.length > 16){
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
        this.setState({usernameTemp: ''});
        this.setState({ visibleModalStart: false  });
      }
    }

    const cancelProfile = () => {
        this.setState({selectedIndexRowOne: -1});
        this.setState({selectedIndexRowTwo: -1});
        this.setState({usernameTemp: ''});
        this.setState({ visibleModalUpdate: false });
    }

    const updateProfile = () => {
        if(selectedIndexRowOne === -1 && selectedIndexRowTwo === -1){
          if(usernameTemp.length === 0){
            Alert.alert('Error','No changes were made');
          }
          else if(usernameTemp.length > 16){
            Alert.alert('Error', 'Username should be less than 16 characters');
          }
          else{
            // if(usernameTemp.length > 0){
            //   // publish username to channel and database
            // }
            this.setState({usernameTemp: ''});
            this.setState({ visibleModalUpdate: false });
          }
        }
        // else if(usernameTemp.length)
        else{
          let getRowPic = (selectedIndexRowOne  > -1) ? true: false;
          getRowPic = (getRowPic) ? imgArrayRowOne[selectedIndexRowOne]:
            imgArrayRowTwo[selectedIndexRowTwo];
          this.setState({ currentPicture: getRowPic });
          this.setState({selectedIndexRowOne: -1});
          this.setState({selectedIndexRowTwo: -1});
          this.setState({usernameTemp: ''});
          this.setState({ visibleModalUpdate: false });
        }
      }


    let about;
    let usersMap = this.state.users;
    let messagesMap = this.state.messages;
    let gpsImage;
    if(this.state.focusOnMe || this.state.fixedOnUUID)
    {
      gpsImage = require('./assets/images/fixedGPS.png')
    }else{
      gpsImage = require('./assets/images/notFixedGPS.png')
    }


    for( let key of messagesMap.keys()){
      let tempUser = usersMap.get(key)
      if(tempUser){
        tempUser.message = messagesMap.get(key).message
        usersMap.set(key, tempUser)
      }
    }
    let usersArray = Array.from(usersMap.values());
    //MAKE SURE TO ADD NSLocationWhenInUseUsageDescription INTO INFO.PLST

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

                    <View>
                        <TextInput
                            type="TextInput"
                            name="myTextInput"
                            style={{height: 40, marginBottom: 10}}
                            placeholder='Enter your username'
                            underlineColorAndroid={
                            isFocused ?
                            "rgb(208,33,41)" : "#D3D3D3"
                            }
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            value={this.state.usernameTemp}
                            onChangeText={(usernameTemp) => this.setState({usernameTemp})}
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

           <MapView
             style={styles.map}
             ref={(ref) => this.map = ref}
             onMoveShouldSetResponder={this.draggedMap}
            >
              { usersArray.map((item, index)=>(
                  //TRY SWITCHING UP TO CALLOUTS
                  <Marker
                    style={styles.marker}
                    key={index}
                    coordinate={{latitude: item.latitude, longitude: item.longitude}}
                    ref={marker => {
                      this.marker = marker;
                    }}>
                    <TouchableOpacity onPress={() =>{this.touchUser(item.uuid)}} >
                      {this.messageOutPut(item.message)}
                      <View style={styles.selectedUserBackground}>
                        <Image source={currentPicture} style={this.selectedStyle(item.uuid)} />
                      </View>
                      {this.showUsername(item)}
                    </TouchableOpacity>
                </Marker>


              )) }
           </MapView >

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
                            value={this.state.usernameTemp}
                            onChangeText={(usernameTemp) => this.setState({usernameTemp})}
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
              <Switch
                value={this.state.allowGPS}
                style={styles.locationSwitch}
                onValueChange={this.toggleGPS}/>
            </View>
           </View>

           <View style={styles.bottom}>
             <TouchableOpacity onPress={this.focusLoc}>
               <Image
                 style={styles.focusLoc}
                 source={gpsImage}
               />
             </TouchableOpacity>
          </View>

       </View>

   );
  }
}

const styles = StyleSheet.create({
  aboutView:{
    backgroundColor: '#9FA8DA',
  },
  marker:{
    justifyContent: 'center',
    alignSelf: 'center',
  },
  messagePopUp:{
    backgroundColor: '#C5C8D7',

  },
  topBar:{
    top: 50,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  rightBar:{
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  locationSwitch:{
    right: 10
  },
  container: {
    flex:1,
  },
  bottom:{
    position: "absolute", bottom: 0, right: 0,
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
    marginHorizontal: 25,
    marginVertical: 25,
  },
  focusLoc:{
    width: 30,
    height: 30,

  },
  map: {
    ...StyleSheet.absoluteFillObject
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
  buttonContainer: {
    flexDirection: 'row',
  },
  button: {
    flex: 1
  }
});
