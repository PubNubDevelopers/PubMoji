import React, {Component} from 'react';
import {Platform, StyleSheet, Text,Button, View, Image, Switch,TouchableOpacity,TouchableWithoutFeedback, Header} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import PubNubReact from 'pubnub-react';
import Modal from "react-native-modal";

export default class App extends React.Component {
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
      selectedImage: 1,
      users: new Map(),
      messages: new Map(),
      allowGPS: true,
      showAbout: false,
      bsState: false,
    };
    this.pubnub.init(this);
  }

  //Track User GPS Data
  componentDidMount() {
    //PubNub
    this.pubnub.getMessage('channel1.messages',(msg) =>{
      if(this.state.users.has(msg.message.uuid)){
        let tempMap = this.state.messages;
        if(this.state.messages.has(msg.message.uuid)){
          this.stopMessageTimer(this.state.messages.get(msg.message.uuid).timerId)
        }
        let message = {uuid: msg.message.uuid, message: msg.message.message, timerId: setTimeout(this.clearMessage, 5000, msg.message.uuid) }
        tempMap.set(msg.message.uuid, message)
        this.setState({
          messages: tempMap
        })
      }
    })

    this.pubnub.getMessage('channel1', (msg) => {

        let oldUser = this.state.users.get(msg.message.uuid)
        let newUser = {uuid: msg.message.uuid, latitude: msg.message.latitude, longitude: msg.message.longitude, image: msg.message.image };
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
            message: {latitude: position.coords.latitude, longitude: position.coords.longitude, uuid: this.pubnub.getUUID(), image: this.state.selectedImage},
            channel: 'channel1'
          });
          this.setState({
            currentLoc: position.coords
          })
        }
      },
      error => console.log("Maps Error: ",error),
      { enableHighAccuracy: true, timeout: 200000, maximumAge: 1000 }
    );
    //Track motional Coordinates
    navigator.geolocation.watchPosition(
      position => {
        if(this.state.allowGPS){
          this.pubnub.publish({
            message: {latitude: position.coords.latitude, longitude: position.coords.longitude, uuid: this.pubnub.getUUID(), image: this.state.selectedImage},
            channel: 'channel1'
          });
          this.setState({
            currentLoc: position.coords
          })
        }
      },
      error => console.log("Maps Error: ",error),
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000,
        distanceFilter: 100
      }
    );
    //setInterval(this.publishMessage, 7000);
    //this.publishMessage()

  }
  clearMessage = (uuid) =>{
    let tempMap = this.state.messages;
    console.log("deleted", tempMap.delete(uuid))
    this.setState({
      messages: tempMap
    },()=>{console.log("piza",this.state.messages)})
    //console.log("clearing message")
  }
  stopMessageTimer = (timerId) => {
    console.log("clearing timeout")
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
      message: {latitude: -1, longitude: -1, uuid: this.pubnub.getUUID(),image: this.state.selectedImage, hideUser: true},
      channel: 'channel1'
    });
    this.pubnub.unsubscribeAll();
    navigator.geolocation.clearWatch(this.watchID);
  }
  componentDidUpdate(prevProps,prevState){
    if(prevState.allowGPS != this.state.allowGPS){
      console.log("allow GPS: ",this.state.allowGPS)
      if(this.state.allowGPS){
        let tempMap = this.state.users;
        let tempUser = {latitude: this.state.currentLoc.latitude, longitude: this.state.currentLoc.longitude, uuid: this.pubnub.getUUID(), image: this.state.selectedImage}
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
          message: {latitude: -1, longitude: -1, uuid: this.pubnub.getUUID(),image: this.state.selectedImage, hideUser: true},
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

  toggleAbout = () =>{
    this.setState({
      showAbout: !this.state.showAbout
    })
  }
  handleMapPress = () => {
    if(this.state.showAbout){
      this.setState({
        showAbout: false
      })
    }
  }
  focusLoc = () => {
    console.log("Focusing")
  }

  render() {
    let about;
    let usersMap = this.state.users;
    let messagesMap = this.state.messages;

    for( let key of messagesMap.keys()){
      let tempUser = usersMap.get(key)
      if(tempUser){
        tempUser.message = messagesMap.get(key).message
        usersMap.set(key, tempUser)
      }
    }
    let usersArray = Array.from(usersMap.values());
    // if(this.state.showAbout){
    //   about = <AboutPage/>
    // }else{
    //   about = null;
    // }
    return (
      <TouchableWithoutFeedback onPress={this.handleMapPress}>
       <View style={styles.container}>
           <MapView style={styles.map} onPanDrag ={e => console.log(e.nativeEvent)}
            >
              { usersArray.map((item, index)=>(
                <Marker style={styles.marker} key={index} coordinate={{latitude: item.latitude, longitude: item.longitude}}>
                  <Text style={styles.text}>{item.message}</Text>
                  <Image source={require('./boss.png')} style={{height: 35, width:35, }} />
                </Marker>
              )) }

           </MapView >
           <View style={styles.topBar}>
             <TouchableOpacity onPress={this.toggleAbout}>
               <Image
                 style={styles.profile}
                 source={require('./profile.png')}
               />
             </TouchableOpacity>
            <View style={styles.rightBar}>
              <TouchableOpacity onPress={this.toggleAbout}>
                <Image
                  style={styles.info}
                  source={require('./info.png')}
                />
              </TouchableOpacity>
              <Switch
                value={this.state.allowGPS}
                style={styles.locationSwitch}
                onValueChange={
                  (value) => {
                    this.setState({
                      allowGPS: value
                    })
                    console.log("PENNNNIUS")
                  }
                }/>
            </View>
           </View>
           <View style={styles.bottom}>
             <TouchableOpacity onPress={this.focusLoc}>
               <Image
                 style={styles.focusLoc}
                 source={require('./notFixedGPS.png')}
               />
             </TouchableOpacity>
           </View>

         <Modal isVisible={this.state.showAbout}>
           <View style={{ flex: 1 }}>
            <Text>Hello!</Text>
            <Button title="Hide modal" onPress={this.toggleAbout} />
          </View>
         </Modal>
       </View>
     </TouchableWithoutFeedback>

   );
  }
}
const styles = StyleSheet.create({
  aboutView:{
    backgroundColor: '#9FA8DA',
    flex: 0,
  },
  marker:{
    justifyContent: 'center',
    alignSelf: 'center',
  },
  text:{
    //fontFamily: "RuneScape-UF",
    backgroundColor: '#9FA8DA',
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
    ...StyleSheet.absoluteFillObject,
    flex: 10,

  },
  bottom:{
    flex: 1,
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
  },
  focusLoc:{
    width: 30,
    height: 30,
    marginHorizontal: 25,
    marginVertical: 25,
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

});

const AboutPage = () => {
  return(
    <View style={styles.aboutView}>
      <Text>Test about</Text>
    </View>
  )
}
