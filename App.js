import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  Button,
  View,
  Image, Animated,
  Switch,
  TouchableOpacity,
  KeyboardAvoidingView
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
import Timeout from "smart-timeout";
console.disableYellowBox = true;
export default class App extends Component {
  constructor(props) {
    super(props);
    this.pubnub = new PubNubReact({
      publishKey: "pub-c-d93d7b15-4e46-42f4-ba03-c5d997844b9e",
      subscribeKey: "sub-c-1ef826d4-78df-11e9-945c-2ea711aa6b65"
    });
    this.moveAnimation = new Animated.ValueXY({ x: 10, y: 450 })
    //Base State
    this.state = {
      currentLoc: {
        latitude: -1,
        longitude: -1
      },
      numUsers: 0,
      username: "A Naughty Moose",
      fixedOnUUID: "",
      focusOnMe: false,
      users: new Map(),
      isLoading: false,
      currentPicture: null,
      visibleModalStart: false,
      visibleModalUpdate: false,
      isFocused: false ,
      allowGPS: true,
      showAbout: false,
      emojiCount: 0,
      emojiType: 1,
    };

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

  //Track User GPS Data
  async componentDidMount() {
    // Store boolean value so modal init only opens on app boot
    const wasShown = await AsyncStorage.getItem('key'); // get key

    if(wasShown === null) {
      await AsyncStorage.setItem('key', '"true"');
      this.setState({visibleModalStart: true, wasShown});
    }else{
      this.setState({visibleModalStart: false, wasShown});
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



    this.pubnub.getMessage("global", msg => {
      let users = this.state.users;
      if (msg.message.hideUser) {
        users.delete(msg.publisher);
        this.setState({
          users
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
          // if(oldUser){
          //   emojiCount =
          // }
          emojiCount = 0; //reset EmojiCount to 0
          emojiType = 0;
        }
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
        });

      }


    });
    this.pubnub.subscribe({
      channels: ["global"],
      withPresence: true
    });

    //Get Stationary Coordinate
    navigator.geolocation.getCurrentPosition(
      position => {
        if (this.state.allowGPS) {
          this.pubnub.publish({
            message: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              image: this.state.currentPicture,
              username: this.state.username,
            },
            channel: "global"
          });
          let users = this.state.users;
          let tempUser = {
            uuid: this.pubnub.getUUID(),
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            image: this.state.currentPicture,
            username: this.state.username
          };
          users.set(tempUser.uuid, tempUser);
          this.setState({
            users,
            currentLoc: position.coords
          });
        }
      },
      error => console.log("Maps Error: ", error),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 1000 }
    );
    //Track motional Coordinates
    navigator.geolocation.watchPosition(
      position => {
        this.setState({
          currentLoc: position.coords
        });
        if (this.state.allowGPS) {
          this.pubnub.publish({
            message: {
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
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 1000,
        distanceFilter: 100
      }
    );
    const data = await this.performTimeConsumingTask();

    if (data !== null) {
      this.setState({ isLoading: false });
    }
  }

  clearMessage = uuid => {
    let users = this.state.users;
    let user = users.get(uuid)
    delete user.message;
    users.set(uuid,user);
    this.setState(
    {
      users,
    });
  };


  componentWillUnmount() {
    this.pubnub.publish({
      message: {
        hideUser: true
      },
      channel: "global"
    });
    this.pubnub.unsubscribeAll();
    navigator.geolocation.clearWatch(this.watchID);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.allowGPS != this.state.allowGPS) {
      if (this.state.allowGPS) {
        console.log(this.state.users);
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
            users
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

        users.delete(uuid);
        this.setState({
          users,
        });
        this.pubnub.publish({
          message: {
            hideUser: true
          },
          channel: "global"
        });
      }
    }
  }
  isEquivalent = (a, b) => {
    if (!a || !b) {
      if (a === b) return true;
      return false;
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
  };
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
      return { height: 50, width: 50, borderRadius: 25 };
    }
    return { height: 30, width: 30, borderRadius: 15 };
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
      this.pubnub.publish({
        message: {
          latitude: this.state.currentLoc.latitude,
          longitude: this.state.currentLoc.longitude,
          image: currentPicture,
          username: username,
        },
        channel: "global"
      });
      await AsyncStorage.setItem('profile_pic_key', JSON.stringify(currentPicture));
      await AsyncStorage.setItem('username_key', username);
      this.setState({currentPicture,username})
    }else if(username == ""){
      this.pubnub.publish({
        message: {
          latitude: this.state.currentLoc.latitude,
          longitude: this.state.currentLoc.longitude,
          image: currentPicture,
          username: this.state.username
        },
        channel: "global"
      });
      await AsyncStorage.setItem('profile_pic_key', JSON.stringify(currentPicture));
      this.setState({currentPicture})
    }else{
      this.pubnub.publish({
        message: {
          latitude: this.state.currentLoc.latitude,
          longitude: this.state.currentLoc.longitude,
          image: this.state.currentPicture,
          username: username
        },
        channel: "global"
      });
      await AsyncStorage.setItem('username_key', username);
      this.setState({username})
    }
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

    let gpsImage;
    if (this.state.focusOnMe || this.state.fixedOnUUID) {
      gpsImage = require("./assets/images/fixedGPS.png");
    } else {
      gpsImage = require("./assets/images/notFixedGPS.png");
    }

    let usersArray = Array.from(this.state.users.values());
    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : null} enabled>
        <Modal isVisible={this.state.visibleModalStart}>
          <ModalAppInit
            changeProfile={this.changeProfile}
            closeModalInit={this.closeModalInit}
          />
        </Modal>


        <Modal isVisible={this.state.infoModal}>
          <InfoModal
          toggleAbout={this.toggleAbout}
          />
        </Modal>




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
          {usersArray.map((item, index) => (
            //TRY SWITCHING UP TO CALLOUTS
            <Marker
              onPress={() => {
                this.touchUser(item.uuid);
              }}
              style={styles.marker}
              key={index}
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
            <TouchableOpacity onPress={() => this.setState({ visibleModalUpdate: !this.state.visibleModalUpdate })}>
              <Image
                style={styles.profile}
                source={require('./assets/images/profile.png')}
              />
            </TouchableOpacity>



            <View style={styles.rightBar}>
              <TouchableOpacity onPress={() => {console.log("coming soon")}}>
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

        <View style={styles.bottom}>
            <EmojiBar {...this.state} pubnub={this.pubnub} />
            <View style={styles.bottomRow}>
              <MessageInput {...this.state} pubnub={this.pubnub}/>
                <TouchableOpacity onPress={this.focusLoc}>
                  <Image style={styles.focusLoc} source={gpsImage} />
                </TouchableOpacity>
            </View>
        </View>
        <Modal isVisible={this.state.visibleModalUpdate}>
          <ModalAppUpdate
            currentUsername={this.state.username}
            changeProfile={this.changeProfile}
            closeModalUpdate={this.closeModalUpdate}
            />
        </Modal>

      </KeyboardAvoidingView>
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
    marginTop: Platform.OS === "android" ? 50 : 0,
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
    marginHorizontal: wp("3.5%"),
  },
  rightBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
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
    borderWidth: 0,
    borderColor: 'red',
    //right: 0,
    justifyContent: "center",
    alignSelf: "center",

    width: "100%",
    marginBottom: hp("4%"),

  },
  focusLoc: {
    width: hp("4.5%"),
    height: hp("4.5%"),
    marginRight: wp("5%")

  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  emoji: {
    height: hp("4%"),
    width: hp("4%"),
    position: "absolute",

  },
  info: {
    width: hp("4.5%"),
    height: hp("4.5%"),
    marginHorizontal: 15
  },
  profile: {
    width: hp("4.5%"),
    height: hp("4.5%"),

  },
  content: {
    backgroundColor: "white",
    padding: 22,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    borderColor: "rgba(0, 0, 0, 0.1)"
  },

});
