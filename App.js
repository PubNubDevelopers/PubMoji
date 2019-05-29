import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Image, Button} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import hi from './boss.png';
import PubNubReact from 'pubnub-react';
import User from './Components/User.js';
import * as Animatable from 'react-native-animatable';


const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

export default class App extends React.Component {

  constructor(props) {
    super(props);

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
      emoji: false
    };



    this.pubnub.init(this);

  }


  //PubNub 
  componentWillMount() {

              this.pubnub.subscribe({
          channels: ['channel1'],
          withPresence: true       
      });

  }
 
  componentWillUnmount() {
      this.pubnub.unsubscribe({
          channels: ['channel1']
      });
  }


  //Track User GPS Data
  componentDidMount() {



    this.pubnub.getMessage('channel1', (msg) => {
        //console.log("Message Receioved: ",msg);

        coord = [msg.message.latitude,msg.message.longitude];
        let oldUser = this.state.users.get(msg.message.uuid)
        let newUser = {uuid: msg.message.uuid, coords: coord, emoji: msg.message.emoji };
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


        console.log("USERS: ");
        console.log(this.state.users);
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
          message: {latitude: this.state.latitude, longitude: this.state.longitude, uuid: this.pubnub.getUUID(), emoji: false},
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



    // this.pubnub.getMessage('channel1', (msg) => {
    //     console.log(msg);

    //     const coord = [msg.message.latitude,msg.message.longitude];
    //     const temp = this.state.users.find(element => element.uuid === msg.message.uuid);

    //     if (temp != msg.message.uuid) {

    //       if(msg.message.uuid != undefined){
    //       var user = {uuid: msg.message.uuid, coords: coord, emoji: msg.message.emoji};
    //       this.setState({users: this.state.users.concat(user), emoji: msg.message.emoji})//this.state.users.concat(user)});
    //     }
    //     }else{

    //       if(msg.message.uuid != undefined){
    //       var newuser = [{uuid: msg.message.uuid, coords: coord, emoji: msg.message.emoji}];
    //       olduser = this.state.users.splice(temp,1);
    //       if(olduser.length === 0){
    //         this.setState({users: newuser, emoji: msg.message.emoji})
    //       }else{
    //       this.setState({users: olduser.concat(newuser), emoji: msg.message.emoji})//this.state.users.concat(user)});
    //     }
    //     }


    //     }
    //     console.log("USERS: ");
    //     console.log(this.state.users);
    //     //getUserLocation(msg.uuid);
    // });











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


  hideEmoji = () => {
        this.pubnub.publish({
          message: {latitude: this.state.latitude, longitude: this.state.longitude, uuid: this.pubnub.getUUID(), emoji: false},
          channel: 'channel1'
        });
  };

   showEmoji = () => {
        this.pubnub.publish({
          message: {latitude: this.state.latitude, longitude: this.state.longitude, uuid: this.pubnub.getUUID(), emoji: true},
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

    return ( 
 
    <View style={styles.container}>
      <MapView style={styles.map}
             region={this.setRegion()}>
               { usersArray.map((item, index)=>(
                 <Marker key={index} coordinate={{latitude: item.coords[0], longitude: item.coords[1]}}>
                       <Image source={require('./boss.png')} style={{height: 35, width:35, }} />

                      <Button title="show Emoji" onPress={() => this.showEmoji()}/>
                      <Button title="hide Emoji" onPress={() => this.hideEmoji()}/>

                       {item.emoji && <Animatable.View animation="fadeOutUp" iterationCount={1} direction="normal" easing = "ease-out">
                          <Image source={require('./heart.png')} style={{height: 35, width:35, }} />
                       </Animatable.View> }
                    
                 </Marker>
               )) }

      </MapView>



     </View>

  
   );
  }
}




const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center"
  },
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
    backgroundColor: "transparent"
  }
});

