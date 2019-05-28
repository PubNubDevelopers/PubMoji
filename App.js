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
      users: [],
      show: false
    };



    this.pubnub.init(this);
//          this.pubnub.hereNow(
//     {
//         channels: ["channel1"],
//         includeUUIDs: true,
//         includeState: true
//     },
//     (status, response) => {
//         console.log(status);
//         console.log(response);
//     }
// );
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



    this.pubnub.getMessage('channel1', (msg) => {
        console.log(msg);

        const coord = [msg.message.latitude,msg.message.longitude];
        const temp = this.state.users.find(element => element.uuid === msg.message.uuid);

        if (!temp) {
          var user = {uuid: msg.message.uuid, coords: coord, emoji: msg.message.emoji};
          this.setState({users: this.state.users.concat(user)})//this.state.users.concat(user)});
        }
        console.log("USERS: ");
        console.log(this.state.users);
        //getUserLocation(msg.uuid);
    });

  }


  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
  }

  componentDidUpdate(){

      // this.pubnub.setState(
      //     {
      //         state: this.state,
      //         channels: ['channel1'],
      //     },
      //     function (status, response) {
      //         // handle status, response
      //     }
      // );



      // this.pubnub.hereNow(
      //     {
      //         channels: ["channel1"],
      //         includeState: true
      //     },
      //     function (status, response) {
      //         // console.log("hereNow: ");
      //         // console.log(response);
      //         this.setState({users: response.channels.channel1.occupants});
      //         // console.log("occupants");
      //         // console.log(this.state.users);
      //         // console.log("----------");
      //     }.bind(this)
      // );


      // this.pubnub.getState(
      //     {
      //         uuid: this.pubnub.getUUID(),
      //         channels: ['channel1'],
      //     },
      //     function (status, response) {
      //         // console.log("user state is: ");
      //         // console.log(response);
      //         // console.log("----------");
      //     }
      // );
  }



  getUserLocation(uuid){
    const location = users.find(element => element.uuid === uuid);

    if (location) {
      return location.coordinates;
    }
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
          message: {latitude: this.state.latitude, longitude: this.state.longitude, emoji: false},
          channel: 'channel1'
        });
  };

   showEmoji = () => {
        this.pubnub.publish({
          message: {latitude: this.state.latitude, longitude: this.state.longitude, emoji: true},
          channel: 'channel1'
        });

        this.pubnub.publish({
          message: {latitude: this.state.latitude, longitude: this.state.longitude, emoji: false},
          channel: 'channel1'
        });
  };

  render() {

    return ( 
 
    <View style={styles.container}>
      <MapView style={styles.map}
             region={this.setRegion()}>
               { this.state.users.map((item, index)=>(
                 <Marker key={index} coordinate={{latitude: item.coords[0], longitude: item.coords[1]}}>
                       <Image source={require('./boss.png')} style={{height: 35, width:35, }} />

                      <Button title="" onPress={this.showEmoji}/>


                      {item.emoji ? (
                       <Animatable.View animation="fadeOutUp" iterationCount={"infinite"} direction="normal" easing = "ease-out">
                          <Image source={require('./heart.png')} style={{height: 35, width:35, }} />
                       </Animatable.View>
                      ) : null}


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

