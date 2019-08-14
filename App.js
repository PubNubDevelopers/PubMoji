import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  Button,
  View,
  Image,
  Animated,
  Switch,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  Keyboard,
  PermissionsAndroid,
  AppState,
} from "react-native";import MapView, {Marker} from 'react-native-maps';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import PubNubReact from 'pubnub-react';
import * as Animatable from 'react-native-animatable';
import Modal from "react-native-modal";
import SplashScreen from './src/components/SplashScreen';
import EmojiBar from './src/components/EmojiBar/EmojiBar';
import ModalAppInit from './src/components/ModalAppInit';
import ModalAppUpdate from './src/components/ModalAppUpdate';
import InfoModal from './src/components/InfoModal';
import AsyncStorage from '@react-native-community/async-storage';
import MessageInput from './src/components/MessageInput/MessageInput';
import UserCount from './src/components/UserCount/UserCount';
import Timeout from "smart-timeout";
console.disableYellowBox = true;

export default class App extends Component {
  constructor(props) {
    super(props);
    this.pubnub = new PubNubReact({
      publishKey: "INSERT_PUB_KEY_HERE",
      subscribeKey: "INSERT_SUB_KEY_HERE",
      presenceTimeout: 120
    });

    //Base State
    this.state = {
      currentLoc: {
        latitude: -1,
        longitude: -1
      },
      splashLoading: true,
      numUsers: 0,
      username: "A Naughty Moose",
      fixedOnUUID: "",
      focusOnMe: false,
      users: new Map(),
      emoji: 0,
      emojiType: 0,
      splashLoading: true,
      keyboardShown: false,
      shiftKeyboard: new Animated.Value(0),
      shiftBottomUI: new Animated.Value(0),
      currentPicture: null,
      visibleModalStart: false,
      visibleModalUpdate: false,
      allowGPS: true,
      hideBottomUI: false,
      showAbout: false,
      emojiCount: 0,
      userCount: 0,
      appState: AppState.currentState,
    };

    this.pubnub.init(this);
  }

  async componentDidMount() {
    const wasShown = await AsyncStorage.getItem('key'); // get key

    if(wasShown === null) {
      this.setState({visibleModalStart: true, wasShown});
    }else{
      this.setState({visibleModalStart: false, wasShown});
      this.setUpApp();
    }
    this.setState({ splashLoading: false});    
  }

  clearMessage = uuid => {
    let users = this.state.users;
    let user = users.get(uuid);
    if(user != null){
      delete user.message;
      users.set(uuid,user);
      this.setState(
      {
        users,
      });
    }
  };
  async setUpApp(){
    let keyEvent1 = 'keyboardWillShow'
    let keyEvent2 = 'keyboardWillHide'
    if(Platform.OS === "android"){
      keyEvent1 = 'keyboardDidShow'
      keyEvent2 = 'keyboardDidHide'
    }
    this.keyboardDidShowSub = Keyboard.addListener(keyEvent1, this.handleKeyboardDidShow);
    this.keyboardDidHideSub = Keyboard.addListener(keyEvent2, this.handleKeyboardDidHide);
    AppState.addEventListener('change', this.handleAppState);
    // Store boolean value so modal init only opens on app boot


    // get uuid if available
    const storedUUID =  await AsyncStorage.getItem('uuid');
    if(storedUUID !=  null){
      this.pubnub.setUUID(storedUUID);
    }else{
      await AsyncStorage.setItem('uuid', this.pubnub.getUUID());
    }

    // get profile pic if available
    const storeProfilePic =  await AsyncStorage.getItem('profile_pic_key');
    if(storeProfilePic !=  null){
      this.setState({currentPicture: parseInt(storeProfilePic)});
    }
    //Get the username if availible
    const username =  await AsyncStorage.getItem('username_key');
    if(username !=  null){
      this.setState({username});
    }
    this.getOnlineInfo();
    

    this.pubnub.getMessage("global", msg => {
      let users = this.state.users;
      if (msg.message.hideUser) {
        users.delete(msg.publisher);
        this.setState({
          users
        },()=>{
          this.updateUserCount();
        });
      }else{
        coord = [msg.message.latitude, msg.message.longitude]; //Format GPS Coordinates for Payload

        if (msg.publisher == this.state.fixedOnUUID) {
          this.animateToCurrent(
            {
              latitude: msg.message.latitude,
              longitude: msg.message.longitude
            },
            400
          );
        }
        let oldUser = this.state.users.get(msg.publisher);
        //emojiCount
        let emojiCount;
        let emojiType;
        if (msg.message.emojiCount == 1) {
          if (oldUser) {
              emojiCount = oldUser.emojiCount + msg.message.emojiCount;
          } else {
            emojiCount = msg.message.emojiCount;
          }
          emojiType = msg.message.emojiType;
        } else {
          emojiCount = 0; //reset EmojiCount to 0
          emojiType = 0;
        }
        if(msg.message.latitude != undefined && msg.message.longitude != undefined && msg.message.image != undefined && msg.message.username != undefined){

          let newUser = {
            uuid: msg.publisher,
            latitude: msg.message.latitude,
            longitude: msg.message.longitude,
            image: msg.message.image,
            username: msg.message.username,
            emojiCount: emojiCount,
            emojiType: emojiType,
  
          };
          if(msg.message.message){
            Timeout.set(msg.publisher, this.clearMessage, 5000, msg.publisher);
            newUser.message = msg.message.message;
          }else if(oldUser){
            newUser.message = oldUser.message
          }
          users.set(newUser.uuid, newUser);
          this.setState({
            users
          },()=>{
            this.updateUserCount();
          });
        }
      }
    });
    this.pubnub.subscribe({
      channels: ["global"],
      withPresence: true
    });

    let granted;

    // Get user's permission to access their location
    if (Platform.OS === "android"){
      granted = await PermissionsAndroid.request( PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION ,
        {
          title: 'Location Permission',
          message:
            'PubMoji needs to access your location',
          buttonNegative: 'No',
          buttonPositive: 'Yes',
        });
    }

    if (granted === PermissionsAndroid.RESULTS.GRANTED || Platform.OS === "ios") {
      navigator.geolocation.watchPosition(
        position => {
          this.setState({
            currentLoc: position.coords
          });
          if (this.state.allowGPS) {
            this.pubnub.publish({
              message: {
                uuid: this.pubnub.getUUID(),
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                image: this.state.currentPicture,
                username: this.state.username
              },
              channel: "global"
            });
            if (this.state.focusOnMe) {
              this.animateToCurrent(position.coords, 1000);
            }
          }
          
        },
        error => console.log("Maps Error: ", error),
        {
          enableHighAccuracy: false,
          distanceFilter: 100
        }
      );
    }
    else {
      console.log( "ACCESS_FINE_LOCATION permission denied" )
    }
  }

  componentWillUnmount() {
    console.log("unmounting")
    this.pubnub.unsubscribeAll();
    AppState.removeEventListener('change', this.handleAppState);

  }
  handleAppState = (nextAppState) =>{
    if (nextAppState === 'active') {
      //this.setUpApp()
      if (this.state.allowGPS) {
        this.pubnub.publish({
          message: {
            uuid: this.pubnub.getUUID(),
            latitude: this.state.currentLoc.latitude,
            longitude: this.state.currentLoc.longitude,
            image: this.state.currentPicture,
            username: this.state.username
          },
          channel: "global"
        });
      }
    }else if (nextAppState === 'inactive' || nextAppState === 'background') {
      this.pubnub.publish({
        message: {
          uuid: this.pubnub.getUUID(),
          hideUser: true
        },
        channel: "global"
      },function(status,response){
        console.log(status)
      });
      //this.pubnub.unsubscribeAll();
      navigator.geolocation.clearWatch(this.watchID);

    }
    this.setState({appState: nextAppState});
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.allowGPS != this.state.allowGPS) {
      if (this.state.allowGPS) {
        if (this.state.focusOnMe) {
          this.animateToCurrent(this.state.currentLoc, 1000);
        }
        let users = this.state.users;
        let tempUser = {
          uuid: this.pubnub.getUUID(),
          latitude: this.state.currentLoc.latitude,
          longitude: this.state.currentLoc.longitude,
          image: this.state.currentPicture,
          username: this.state.username
        };
        users.set(tempUser.uuid, tempUser);
        this.setState(
          {
            users,
            hideBottomUI: false,
          },
          () => {
            this.pubnub.publish({
              message: tempUser,
              channel: "global"
            });
          }
        );
        

      } else {
        let users = this.state.users;
        let uuid = this.pubnub.getUUID();
        this.hideBottomUI()
        users.delete(uuid);
        this.setState({
          users,
        });
        this.pubnub.publish({
          message: {
            uuid: this.pubnub.getUUID(),
            hideUser: true
          },
          channel: "global"
        });
      }
      this.updateUserCount();
    }
  }


   getOnlineInfo = () => {

      this.pubnub.hereNow({
        includeUUIDs: true,
      },
      (status, response) => {
        let uuids = [];
        for(i in response.channels){
          let online = response.channels[i].occupants;
          for( i in online){
            uuids.push(online[i].uuid)
          }
          let users = this.state.users;
          let loopCount = 0;
          while(uuids.length != 0 && loopCount < 10){
            let timetoken = "0";
            this.pubnub.history({
              channel: 'global',
              start: null,
              stringifiedTimeToken: true // false is the default
              
            }, (status, response) => {
              timetoken = response.startTimeToken;
              for(i in response.messages){
                let u = response.messages[i].entry;
                let index = uuids.indexOf(u.uuid);
                if( index != -1 ){
                  if(users.has(uuids[index])){
                    delete uuids[index];
                  }else{
                    if( u.hideUser == true){
                      delete uuids[index];
                    }else if(u.latitude != undefined && u.longitude != undefined && u.image != undefined && u.username != undefined){
                      let newUser = {
                        uuid: uuids[index],
                        latitude: u.latitude,
                        longitude: u.longitude,
                        image: u.image,
                        username: u.username,
                      };
                      delete uuids[index];
                      users.set(newUser.uuid, newUser);
                    }
                  }
                }
              }
              if(response.messages.length < 100)
              {
                loopCount = 1000
              } 
            })
            loopCount = loopCount + 1;
          }
          this.setState({
            users
          }, () =>{
            this.updateUserCount();
          });
        }
      });
  }
  

  animateToCurrent = (coords, speed) => {
    region = {
      latitude: coords.latitude,
      longitude: coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01
    };
    this.map.animateToRegion(region, speed);
  };
  toggleAbout = () => {
    this.setState({
      infoModal: !this.state.infoModal
    });
  };
  toggleGPS = () => {
    this.setState({
      allowGPS: !this.state.allowGPS
    });
  };
  focusLoc = () => {
    if (this.state.focusOnMe || this.state.fixedOnUUID) {
      this.setState({
        focusOnMe: false,
        fixedOnUUID: ""
      });
    } else {
      region = {
        latitude: this.state.currentLoc.latitude,
        longitude: this.state.currentLoc.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01
      };
      this.setState({
        focusOnMe: true
      });
      this.map.animateToRegion(region, 2000);
    }
  };
  draggedMap = () => {
    this.setState({
      focusOnMe: false,
      fixedOnUUID: ""
    });
  };
  touchUser = uuid => {
    if (uuid === this.pubnub.getUUID()) {
      this.focusLoc();
    } else {
      this.setState({
        fixedOnUUID: uuid,
        focusOnMe: false
      });
    }
  };
  selectedStyle = uuid => {
    if (
      (this.state.focusOnMe && uuid == this.pubnub.getUUID()) ||
      this.state.fixedOnUUID == uuid
    ) {
      return { height: hp("7%"), width: hp("7%"), borderRadius: 25 };
    }
    return { height: hp("5%"), width: hp("5%"), borderRadius: 15 };
  };
  messageOutPut = (message) => {
    if (message) {
      return (
        <View style={styles.textBackground}>
          <Text style={styles.text}>{message}</Text>
        </View>
      );
    }
  };
  showUsername = (user) => {
    if (this.state.focusOnMe && user.uuid == this.pubnub.getUUID()){
      return (
        <View style={styles.textBackground}>
          <Text style={styles.text}>{this.state.username}</Text>
        </View>
      );
    }else if(this.state.fixedOnUUID == user.uuid){
      return (
        <View style={styles.textBackground}>
          <Text style={styles.text}>{user.username}</Text>
        </View>
      );
    }
  };

  changeProfile = async (currentPicture,username) => {
    if(currentPicture != -1 && username != ""){
      if(this.state.allowGPS){
        this.pubnub.publish({
          message: {
            uuid: this.pubnub.getUUID(),
            latitude: this.state.currentLoc.latitude,
            longitude: this.state.currentLoc.longitude,
            image: currentPicture,
            username: username,
          },
          channel: "global"
        });
      }
      await AsyncStorage.setItem('profile_pic_key', JSON.stringify(currentPicture));
      await AsyncStorage.setItem('username_key', username);
      this.setState({currentPicture,username})
    }else if(username == ""){
      if(this.state.allowGPS){
        this.pubnub.publish({
          message: {
            uuid: this.pubnub.getUUID(),
            latitude: this.state.currentLoc.latitude,
            longitude: this.state.currentLoc.longitude,
            image: currentPicture,
            username: this.state.username
          },
          channel: "global"
        });
      }

      await AsyncStorage.setItem('profile_pic_key', JSON.stringify(currentPicture));
      this.setState({currentPicture})
    }else{
      if(this.state.allowGPS){
        this.pubnub.publish({
          message: {
            uuid: this.pubnub.getUUID(),
            latitude: this.state.currentLoc.latitude,
            longitude: this.state.currentLoc.longitude,
            image: this.state.currentPicture,
            username: username
          },
          channel: "global"
        });
      }

      await AsyncStorage.setItem('username_key', username);
      this.setState({username})
    }
  }

  closeModalInit = async (e) => {
    this.setState({visibleModalStart: e });
    await AsyncStorage.setItem('key', '"true"');
    this.setUpApp();
  }
  closeModalUpdate = (e) => {
    this.setState({visibleModalUpdate: e });
  }
  handleKeyboardDidShow = (event) => {
    this.setState({
      keyboardShown: true
    })
    if(Platform.OS === "ios"){
      const { height: windowHeight } = Dimensions.get('window');
      const keyboardHeight = event.endCoordinates.height;
      const gap = (keyboardHeight * -1 ) + 20
      Animated.timing(
        this.state.shiftKeyboard,
        {
          toValue: gap,
          duration: 180,
          useNativeDriver: true,
        }
      ).start();
      console.log(this.state.keyboardShown)
    }


  }
  hideBottomUI = () =>{

    Animated.timing(
      this.state.shiftBottomUI,
      {
        toValue: 300,
        duration: 300,
        useNativeDriver: true,
      }
    ).start(() => {
      this.setState({
        hideBottomUI: true
      })
    });
  }


  handleKeyboardDidHide = () => {
    this.setState({
      keyboardShown: false
    })
    if(Platform.OS === "ios"){
      Animated.timing(
        this.state.shiftKeyboard,
        {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }
      ).start();
    }
  }
  showProfile = () =>{
    this.setState({
      visibleModalUpdate: !this.state.visibleModalUpdate
    })
  }
  updateUserCount = () => {
    var presenceUsers = 0;
    this.pubnub.hereNow({
        includeUUIDs: true,
    },
     (status, response) => {
      // handle status, response
      presenceUsers = response.totalOccupancy;
      console.log(presenceUsers, this.state.users.size)
      var totalUsers = Math.min(presenceUsers, this.state.users.size)
      this.setState({userCount: totalUsers})
    });
    

  };

  returnBottomUI = () =>{
    if(!this.state.hideBottomUI){
      let gpsImage;
      if (this.state.focusOnMe || this.state.fixedOnUUID) {
        gpsImage = require("./assets/images/fixedGPS.png");
      } else {
        gpsImage = require("./assets/images/notFixedGPS.png");
      }
      return (
        <Animated.View style={[styles.bottom, { transform: [{translateY: this.state.shiftBottomUI}] }]}>
            <EmojiBar {...this.state} pubnub={this.pubnub} />
            <View style={styles.bottomRow}>
              <MessageInput {...this.state} pubnub={this.pubnub} />
                <TouchableOpacity onPress={this.focusLoc}>
                  <Image style={styles.focusLoc} source={gpsImage} />
                </TouchableOpacity>
            </View>
        </Animated.View>
      )
    }

  }
  hideKeyboard = () =>{
    Keyboard.dismiss()
  }

  render() {
    if(this.state.splashLoading){
      return <SplashScreen />;
    }

    let usersArray = Array.from(this.state.users.values());
    return (
      <TouchableWithoutFeedback onPress={this.hideKeyboard} disabled={!this.state.keyboardShown}>
        <View style={styles.container}  >
          <Modal isVisible={this.state.visibleModalStart}
          backdropOpacity={0.1}
          >
            <ModalAppInit
              changeProfile={this.changeProfile}
              closeModalInit={this.closeModalInit}
            />
          </Modal>
          <Modal isVisible={this.state.visibleModalUpdate}
            backdropOpacity={0.1}
          >
            <ModalAppUpdate
              currentUsername={this.state.username}
              changeProfile={this.changeProfile}
              closeModalUpdate={this.closeModalUpdate}
              />
          </Modal>


          <Modal isVisible={this.state.infoModal}
            backdropOpacity={0.1}>
            <InfoModal
            toggleAbout={this.toggleAbout}
            />
          </Modal>

          <Animated.View style={[styles.container, { transform: [{translateY: this.state.shiftKeyboard}] }]}>
            <MapView
              style={styles.map}
              ref={ref => (this.map = ref)}
              onMoveShouldSetResponder={this.draggedMap}
              initialRegion={{
                latitude: 36.81808,
                longitude: -98.640297,
                latitudeDelta: 60.0001,
                longitudeDelta: 60.0001
              }}
            >
              {usersArray.map((item) => (
                <Marker
                  onPress={() => {
                    this.touchUser(item.uuid);
                  }}
                  style={styles.marker}
                  key={item.uuid}
                  coordinate={{
                    latitude: item.latitude,
                    longitude: item.longitude
                  }}
                  ref={marker => {
                    this.marker = marker;
                  }}
                >
                  <View style={styles.marker}>
                    {(function() {
                      let rows = [];
                      for (let i = 0; i < item.emojiCount; i++) {
                        let emoji;
                        switch (item.emojiType) {
                          case 1: emoji = require("./src/Images/like2.png")
                            break;
                          case 2: emoji = require("./src/Images/love2.png")
                            break;
                          case 3: emoji = require("./src/Images/haha2.png")
                            break;
                          case 4: emoji = require("./src/Images/wow2.png")
                            break;
                          case 5: emoji = require("./src/Images/sad2.png")
                            break;
                          case 6: emoji = require("./src/Images/angry2.png")
                            break;

                          default:

                        }
                        rows.push(
                          <Animatable.Image
                            animation="fadeOutUp"
                            duration={1500}
                            iterationCount={1}
                            direction="normal"
                            easing="ease-out"
                            key={i}
                            source={emoji}
                            style={styles.emoji}
                            useNativeDriver
                          >
                        </Animatable.Image>
                        );
                      }
                      return rows;
                    })()}
                    {this.messageOutPut(item.message)}
                    <Image
                      source={item.image}
                      style={this.selectedStyle(item.uuid)}
                    />
                    {this.showUsername(item)}
                  </View>
                </Marker>
              ))}
            </MapView>

              <View style={styles.topBar}>
                <View style={styles.leftBar}>
                <TouchableOpacity onPress={this.showProfile}>
                  <Image
                    style={styles.profile}
                    source={require('./assets/images/profile.png')}
                  />
                </TouchableOpacity>
                  <View style={styles.userCount}>
                    <UserCount {...this.state} />
                  </View>
                </View>


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
                  onValueChange={this.toggleGPS}
                />
              </View>
            </View>

            {this.returnBottomUI()}

          </Animated.View>
        </View>
      </TouchableWithoutFeedback>

   );
  }
}

const styles = StyleSheet.create({
  bottomRow:{
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  aboutView: {
    backgroundColor: "#9FA8DA"
  },
  marker: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: Platform.OS === "android" ? 100 : 0,
  },
  textBackground: {
    backgroundColor: "#D22028",
    alignItems: "center",
    padding: 5,
    borderRadius: 5
  },
  userImage: {
    borderRadius: 10
  },
  text: {
    fontSize: 12,
    color: "#E1E4F3",
    fontWeight: "bold"
  },
  topBar: {
    top: Platform.OS === "android" ? hp('2%') : hp('5%'),

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: wp("2%"),
  },
  rightBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center"
  },
  leftBar: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center"
  },
  locationSwitch: {
    right: 0,
  },
  container: {
    flex: 1
  },
  bottom: {
    position: "absolute",
    flexDirection:'column',
    bottom: 0,
    justifyContent: "center",
    alignSelf: "center",
    width: "100%",
    marginBottom: hp("4%"),
  },
  focusLoc: {
    width: hp("4.5%"),
    height: hp("4.5%"),
    marginRight: wp("2%")
  },

  userCount: {
    marginHorizontal: 10
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  emoji: {
    height: hp("5%"),
    width: hp("5%"),
    position: "absolute",

  },
  info: {
    width: hp("4.5%"),
    height: hp("4.5%"),
    marginHorizontal: 10
  },
  profile: {
    width: hp("4.5%"),
    height: hp("4.5%")
  },
  content: {
    backgroundColor: "white",
    padding: 22,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    borderColor: "rgba(0, 0, 0, 0.1)"
  }
});