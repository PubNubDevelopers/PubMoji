import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View,Image, Switch,TouchableOpacity,TouchableWithoutFeedback, Header} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import PubNubReact from 'pubnub-react';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.pubnub = new PubNubReact({
        publishKey: 'pub-c-a64b528c-0749-416f-bf75-50abbfa905f9',
        subscribeKey: 'sub-c-8a8e493c-f876-11e6-80ea-0619f8945a4f',
        uuid: "pizza boiii"
    });
    //Base State
    this.state = {
      region: {lat: 37.43376254, lon: -122.2412125},
      error:null,
      users: [],
      allowGPS: true,
      showAbout: false
    };
    this.pubnub.init(this);
  }

  //Track User GPS Data
  componentDidMount() {
    //PubNub
    this.pubnub.getMessage('channel1', (msg) => {
        console.log("Message Receioved: ",msg);

          let oldUser =  null;
          let oldIndex = -1;
        if (this.state.users !== undefined || this.state.users.length !== 0) {
          console.log("users: ", this.state.users)
           oldUser = this.state.users.find(element => element.uuid === msg.message.uuid);
           oldIndex = this.state.users.findIndex(element => element.uuid === msg.message.uuid);
        }
        console.log(this.state.users)


        const newUser = {uuid: msg.message.uuid, lat: msg.message.latitude, lon: msg.message.longitude };
        console.log(oldUser)
        if(!this.isEquivalent(oldUser, newUser)){
          let tempArray = this.state.users;

          if(oldIndex === -1 && !msg.message.hideUser){
            console.log("adds in for first time")
            tempArray.push(newUser);
          }else if(msg.message.hideUser){
            console.log("deletes old")
            if(oldIndex !== -1){
              delete tempArray[oldIndex]
            }
          }else{
            console.log("deletes old and adds new")
            tempArray[oldIndex] = newUser;
          }
          this.setState({
            users: tempArray
          })
        }
    });
    this.pubnub.subscribe({
        channels: ['channel1'],
        withPresence: true
    });
    //Get Stationary Coordinate
    navigator.geolocation.getCurrentPosition(
      position => {
        if(this.state.allowGPS){
          this.pubnub.publish({
            message: {latitude: position.coords.latitude, longitude: position.coords.longitude, uuid: this.pubnub.getUUID()},
            channel: 'channel1'
          });
        }
      },
      error => this.setState({ error: error.message }),
      { enableHighAccuracy: true, timeout: 200000, maximumAge: 1000 }
    );
    //Track motional Coordinates
    navigator.geolocation.watchPosition(
      position => {
        if(this.state.allowGPS){
          this.pubnub.publish({
            message: {latitude: position.coords.latitude, longitude: position.coords.longitude, uuid: this.pubnub.getUUID()},
            channel: 'channel1'
          });
        }
      },
      error => console.log("Error: ",error),
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000,
        distanceFilter: 100
      }
    );
  }
  componentWillUnmount() {
    this.pubnub.unsubscribeAll();
    navigator.geolocation.clearWatch(this.watchID);
  }
  componentDidUpdate(prevProps,prevState){
    if(prevState.allowGPS != this.state.allowGPS){
      console.log("allow GPS: ",this.state.allowGPS)
      if(this.state.allowGPS === false){
        this.pubnub.publish({
          message: {latitude: -1, longitude: -1, uuid: this.pubnub.getUUID(), hideUser: true},
          channel: 'channel1'
        });
      }else{
        navigator.geolocation.getCurrentPosition(
          position => {
            if(this.state.allowGPS){
              this.pubnub.publish({
                message: {latitude: position.coords.latitude, longitude: position.coords.longitude, uuid: this.pubnub.getUUID()},
                channel: 'channel1'
              });
            }
          },
          error => this.setState({ error: error.message }),
          { enableHighAccuracy: true, timeout: 200000, maximumAge: 1000 }
        );
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
    //Coordinate Setter
  setRegion = () => ({
   latitude: this.state.region.lat,
   longitude: this.state.region.lon,
   latitudeDelta: 0,
   longitudeDelta: 0
  });

  toggleAbout = () =>{
    this.setState({
      showAbout: true //!this.state.showAbout
    })
  }
  handleMapPress = () => {
    if(this.state.showAbout){
      this.setState({
        showAbout: false
      })
    }
  }

  render() {
    let about;
    if(this.state.showAbout){
      about = <AboutPage/>
    }else{
      about = null;
    }
    return (
      <TouchableWithoutFeedback onPress={this.handleMapPress}>
       <View style={styles.container}>
           <MapView style={styles.map}
             onPanDrag ={e => console.log(e.nativeEvent)}
             >
              { this.state.users.map((item, index)=>(
                <Marker key={index} coordinate={{latitude: item.lat, longitude: item.lon}}>
                      <Image source={require('./boss.png')} style={{height: 35, width:35, }} />
                </Marker>
              )) }

           </MapView >
           <View style={styles.topBar}>
            <TouchableOpacity onPress={this.toggleAbout}>
              <Image
                style={styles.button}
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
                }
              }/>
           </View>
         {about}
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
  topBar:{
    top: 50,
    right: 10,
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
    width: 30,
    height: 30,
    marginHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    marginVertical: 20,
    backgroundColor: "transparent"
  }
});

const AboutPage = () => {
  return(
    <View style={styles.aboutView}>
      <Text>Test about</Text>
    </View>
  )
}
