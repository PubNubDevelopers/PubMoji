import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Image, Button, TouchableOpacity} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import PubNubReact from 'pubnub-react';
import * as Animatable from 'react-native-animatable';
import Modal from "react-native-modal";
import EmojiBar from './src/components/EmojiBar/EmojiBar';
import MessageInput from './src/components/MessageInput/MessageInput';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});


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
      emoji: 0
    };

    //Initialize PubNub Instance
    this.pubnub.init(this);

  }


  //Subscribe to a PubNub Channel
  componentWillMount() {
    this.pubnub.subscribe({
      channels: ['channel1'],
      withPresence: true
    });
  }

  //Unsubscribe PubNub Channel
  componentWillUnmount() {
    this.pubnub.unsubscribe({
      channels: ['channel1']
    });
  }

  //Track User GPS Data
  componentDidMount() {

    this.pubnub.getMessage('channel1', (msg) => {
        coord = [msg.message.latitude,msg.message.longitude]; //Format GPS Coordinates for Payload
        let oldUser = this.state.users.get(msg.message.uuid); //Obtain User's Previous State Object
        //emojiCount
        let emojiCount;
        if(msg.message.emoji != -1){ //Add Payload Emoji Count to emojiCount
          if(oldUser){
            emojiCount = oldUser.emoji + msg.message.emoji;
          }else{
            emojiCount = msg.message.emoji;
          }
        }else{
          emojiCount = 0; //reset EmojiCount to 0
        }
        console.log("emoji: ",msg.message.emoji)
        console.log(emojiCount)

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
       // console.log(position);
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



  //Increment Emoji Count
  showEmoji = () => {
        this.pubnub.publish({
          message: {latitude: this.state.latitude, longitude: this.state.longitude, uuid: this.pubnub.getUUID(), emoji: 1},
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

  render() {
    let usersArray = Array.from(this.state.users.values());
    //Decrement Emoji Count
    //Reset Emoji Count
    killEmoji = () => {
      this.pubnub.publish({
        message: {
          latitude: this.state.latitude,
          longitude: this.state.longitude,
          uuid: this.pubnub.getUUID(),
          emoji: -1},
        channel: 'channel1'});
    };
    return (
    <View>
    <View style={styles.container}>
       <MapView style={styles.map} region={this.setRegion()}>
               { usersArray.map((item, index) => (
                 <Marker key={index} coordinate={{latitude: item.coords[0], longitude: item.coords[1]}}>
                    {
                      function() {
                          let rows = [];
                          for(let i = 0 ; i < item.emoji; i++){
                            rows.push(<Animatable.View animation="fadeOutUp" duration={2000} iterationCount={1} direction="normal" easing = "ease-out" onAnimationEnd = {() => this.killEmoji()} key = {i}>
                                      <Image source={require('./assets/images/heart.png')} style={{height: 35, width:35, }} />
                                    </Animatable.View> );
                          }
                          return rows;
                      }()
                    }
                       <Image source={require('./assets/images/marker.png')} style={{height: 35, width:35, }} />
                 </Marker>
               )) }
       </MapView>
       </View>
       <MessageInput {...this.state} pubnub={this.pubnub}/>
       <EmojiBar {...this.state} pubnub={this.pubnub}/>
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
  bubble: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.7)",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20
  },
  latlng: {
    width: 200,
    alignItems: "stretch"
  },
  button: {
    width: 80,
    paddingHorizontal: 12,
    alignItems: "center",
    marginHorizontal: 10
  },
  buttonContainer: {
    flexDirection: "row",
    marginVertical: 20,
    backgroundColor: "transparent",

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
   view: {
      alignItems: 'center',
      // backgroundColor: '#ede3f2',
      padding: 100,
   },
   image: {
      alignItems: 'center',
      // backgroundColor: '#ede3f2',
      padding: 100,
   },
});
