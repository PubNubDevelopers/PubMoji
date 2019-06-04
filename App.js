// Modal implented with modifying profile pic in map

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, TextInput, Button, View, Image, Switch,TouchableOpacity,TouchableWithoutFeedback, Header, Alert} from 'react-native';
import MapView, {Marker, AnimatedRegion, Callout } from 'react-native-maps';
import PubNubReact from 'pubnub-react';
//import Modal from "react-native-modal";

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
      currentPicture: require('./boss.png')
    }


    this.pubnub.init(this);
  }


  //Track User GPS Data
  componentDidMount() {
    //PubNub

    this.pubnub.getMessage('channel1.messages',(msg) =>{
      if(this.state.users.has(msg.publisher)){
        let tempMap = this.state.messages;
        if(this.state.messages.has(msg.publisher)){
          this.stopMessageTimer(this.state.messages.get(msg.publisher).timerId)
        }
        let message = {uuid: msg.publisher, message: msg.message.message, timerId: setTimeout(this.clearMessage, 5000, msg.publisher) }
        tempMap.set(msg.publisher, message)
        this.setState({
          messages: tempMap
        })
      }
    })

    this.pubnub.getMessage('channel1', (msg) => {
      // console.log("MSG: ", msg)
      if(msg.publisher == this.state.fixedOnUUID){
        this.animateToCurrent({latitude: msg.message.latitude, longitude: msg.message.longitude},400)
      }
      let oldUser = this.state.users.get(msg.publisher)
      let newUser = {uuid: msg.publisher, latitude: msg.message.latitude, longitude: msg.message.longitude, image: msg.message.image, username: msg.message.username };
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
    this.pubnub.subscribe({
        channels: ['channel1.messages'],
        withPresence: true
    });
    this.pubnub.getPresence('channel1', (presence) => {
        console.log(presence);
    });
    //Get Stationary Coordinate
    navigator.geolocation.getCurrentPosition(
      position => {
        if(this.state.allowGPS){
          this.pubnub.publish({
            message: {latitude: position.coords.latitude, longitude: position.coords.longitude,  image: this.state.currentPicture, username: this.state.username},
            channel: 'channel1'
          });
          this.setState({
            currentLoc: position.coords
          })

        }
      },
      error => console.log("Maps Error: ",error),
      { enableHighAccuracy: true, timeout: 2000, maximumAge: 1000 }
    );
    //Track motional Coordinates
    navigator.geolocation.watchPosition(
      position => {
        this.setState({
          currentLoc: position.coords
        })
        if(this.state.allowGPS){
          this.pubnub.publish({
            message: {latitude: position.coords.latitude, longitude: position.coords.longitude,  image: this.state.currentPicture, username: this.state.username},
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
        timeout: 2000,
        maximumAge: 1000,
        distanceFilter: 100
      }
    );

     setInterval(this.publishMessage, 10000);

  }

  clearMessage = (uuid) =>{
    let tempMap = this.state.messages;
    console.log("deleted", tempMap.delete(uuid))
    this.setState({
      messages: tempMap
    },()=>{console.log("piza",this.state.messages)})
  }
  stopMessageTimer = (timerId) => {
    console.log("clearing timeout");
    clearTimeout(timerId)
  }
  publishMessage = () => {
    const testMessage = "Testing messages";
    this.pubnub.publish({
      message: {message: Math.random( ), uuid: this.pubnub.getUUID()},
      channel: 'channel1.messages'
    });
    console.log("publishing")
  }
  componentWillUnmount() {
    this.pubnub.publish({
      message: {latitude: -1, longitude: -1, image: this.state.currentPicture, hideUser: true},
      channel: 'channel1'
    });
    this.pubnub.unsubscribeAll();
    navigator.geolocation.clearWatch(this.watchID);
  }
  componentDidUpdate(prevProps,prevState){
    if(prevState.allowGPS != this.state.allowGPS){
      if(this.state.allowGPS){
        console.log(this.state.users)
        if(this.state.focusOnMe){
          this.animateToCurrent(this.state.currentLoc,1000)
        }
        let tempMap = this.state.users;
        let tempUser = {uuid: this.pubnub.getUUID(),latitude: this.state.currentLoc.latitude, longitude: this.state.currentLoc.longitude,  image: this.state.currentPicture, username: this.state.username}
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
          message: {latitude: -1, longitude: -1, image: this.state.currentPicture, hideUser: true},
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
    console.log(uuid," : ", this.pubnub.getUUID())
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
        <View style={styles.messagePopUp}>
          <Text style={styles.messagePopUp}>{message}</Text>
        </View>
      )
    }
  }

  showUsername = (user) => {
    if((this.state.focusOnMe && user.uuid == this.pubnub.getUUID()) || this.state.fixedOnUUID == user.uuid)
    {
      console.log("user",user.username)
      return (
        <View style={styles.messagePopUp}>
          <Text>{user.username}</Text>
        </View>



      )
    }
  }

  render() {


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
                      <View style={styles.marker}>
                        {this.messageOutPut(item.message)}
                        <Image source={this.state.currentPicture} style={this.selectedStyle(item.uuid)} />
                        {this.showUsername(item)}
                      </View>
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
    alignItems: 'center',
  },
  messagePopUp:{
    backgroundColor: '#C5C8D7',
    alignItems: 'center'

  },
  topBar:{
    top: 50,
    right: 10,
    flexDirection:'row',
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
    color: 'rgb(208,33,41)',
    fontSize: 37,
    fontWeight: 'bold',
  },
  usernameView:{

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
