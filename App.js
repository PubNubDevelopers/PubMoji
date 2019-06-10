import React, {Component} from 'react';
import {StyleSheet, Text, View, Image, Button, TouchableOpacity} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import PubNubReact from 'pubnub-react';
import * as Animatable from 'react-native-animatable';
import Modal from "react-native-modal";
import SplashScreen from './src/components/SplashScreen';
import EmojiBar from './src/components/EmojiBar/EmojiBar'
import ModalAppInit from './src/components/ModalAppInit'
import ModalAppUpdate from './src/components/ModalAppUpdate'
import AsyncStorage from '@react-native-community/async-storage';

export default class App extends Component {

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
      isLoading: true,
      selectedIndexRowOne: -1,
      selectedIndexRowTwo: -1,
      currentPicture: null,
      visibleModalStart: true,
      visibleModalUpdate: false,
      text: '',
      isFocused: false ,
      emoji: 0,
      emojiType: 0,
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

    // Store boolean value so modal init only opens on app boot
    const wasShown = await AsyncStorage.getItem('key'); // get key

    if(wasShown === null) {
      await AsyncStorage.setItem('key', '"true"');
      this.setState({visibleModalStart: true, wasShown});
    }

    else{
      this.setState({visibleModalStart: false, wasShown});   
    }
     
    // get profile pic if available
    const storeProfilePic =  await AsyncStorage.getItem('profile_pic_key');
    if(storeProfilePic !=  null){
      this.setState({currentPicture: parseInt(storeProfilePic)});
    }

    this.pubnub.subscribe({
      channels: ['channel1'],
      withPresence: true
    });

    this.pubnub.getMessage('channel1', (msg) => {
        coord = [msg.message.latitude,msg.message.longitude]; //Format GPS Coordinates for Payload
        let oldUser = this.state.users.get(msg.message.uuid); //Obtain User's Previous State Object
        //emojiCount
        let emojiCount;
        //emojiType
        let emojiType;
        if(msg.message.emoji != -1){ //Add Payload Emoji Count to emojiCount and Reset Count if EmojiType Changes
          if(oldUser){
            if(oldUser.emojiType == msg.message.emojiType){
              emojiCount = oldUser.emoji + msg.message.emoji;
            }else{emojiCount = 1;}
          }else{
            emojiCount = msg.message.emoji;
          }
        }else{
          emojiCount = 0; //reset EmojiCount to 0
        }
        emojiType = msg.message.emojiType;
        let newUser = {uuid: msg.message.uuid, coords: coord, emoji: msg.message.emoji, emojiType: emojiType }; //User's Updated State
        //Check If State Has Changed With User
        if(!this.isEquivalent(oldUser, newUser)){
          let tempMap = this.state.users;
          newUser = {uuid: msg.message.uuid, coords: coord, emoji: emojiCount, emojiType: emojiType}; //add in the emoji count
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
        console.log(msg.message)
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
        console.log(this.state.emoji);
        this.pubnub.publish({
          message: {latitude: this.state.latitude, longitude: this.state.longitude, uuid: this.pubnub.getUUID(), emoji: this.state.emoji,},
          channel: 'channel1'
        });
      },
      error => console.log(error),
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000,
        distanceFilter: 100
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

  // //Increment Emoji Count
  // showEmoji = () => {
  //   this.pubnub.publish({
  //     message: {latitude: this.state.latitude, longitude: this.state.longitude, uuid: this.pubnub.getUUID(), emoji: 1},
  //     channel: 'channel1'
  //   });
  // };

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

  changeProfilePicture = async (e) => {
    await AsyncStorage.setItem('profile_pic_key', JSON.stringify(e));
    this.setState({currentPicture: e });
  }

  closeModalInit = (e) => {
    this.setState({visibleModalStart: e });
  }
  
  closeModalUpdate = (e) => {
    this.setState({visibleModalUpdate: e });
  }

  render() {
    if(this.state.isLoading){
      return <SplashScreen />;
    }

    let usersArray = Array.from(this.state.users.values());

    killEmoji = () => {
      console.log(this.state.emoji);
      this.pubnub.publish({
        message: {
          latitude: this.state.latitude,
          longitude: this.state.longitude,
          uuid: this.pubnub.getUUID(),
          emoji: -1,
          emojiType: this.state.emojiType},
        channel: 'channel1'});
    };   

    return (
    <View style={styles.container}>
       <Modal isVisible={this.state.visibleModalStart}>
          <ModalAppInit 
          changeProfilePicture={this.changeProfilePicture}
          closeModalInit={this.closeModalInit}
          />           
        </Modal>

        <MapView style={styles.map} region={this.setRegion()}>
               { usersArray.map((item, index)=>(
                 <Marker key={index} coordinate={{latitude: item.coords[0], longitude: item.coords[1]}}>
                    {
                      function() {
                          let rows = [];
                          for(let i = 0 ; i < item.emoji; i++){
                            rows.push(<Animatable.View style={styles.marker} animation="fadeOutUp" duration={2000} iterationCount={1} direction="normal" easing = "ease-out" onAnimationEnd = {() => this.killEmoji()} key = {i}>
                                      {(item.emojiType == 1) && <Image source={require('./src/Images/ic_like.png')} style={{height: 35, width:35, }} />}
                                      {(item.emojiType == 2) && <Image source={require('./src/Images/love2.png')} style={{height: 35, width:35, }} />}
                                      {(item.emojiType == 3) && <Image source={require('./src/Images/haha2.png')} style={{height: 35, width:35, }} />}
                                      {(item.emojiType == 4) && <Image source={require('./src/Images/wow2.png')} style={{height: 35, width:35, }} />}
                                      {(item.emojiType == 5) && <Image source={require('./src/Images/sad2.png')} style={{height: 35, width:35, }} />}
                                      {(item.emojiType == 6) && <Image source={require('./src/Images/angry2.png')} style={{height: 35, width:35, }} />}
                                    </Animatable.View> );
                          }
                          return rows;
                      }()
                    }
                       <Image source={this.state.currentPicture} style={{height: 35, width:35, }} />
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
            <ModalAppUpdate 
              changeProfilePicture={this.changeProfilePicture}
              closeModalUpdate={this.closeModalUpdate}
              />            
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
  container: {
    flex:1,
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
    top: 30,
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
  marker: {
    position: 'absolute',
  },
});