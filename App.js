import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  Button,
  View,
  Image,
  Switch,
  TouchableOpacity,
} from "react-native";import MapView, {Marker} from 'react-native-maps';
import PubNubReact from 'pubnub-react';
import * as Animatable from 'react-native-animatable';
import Modal from "react-native-modal";
import SplashScreen from './src/components/SplashScreen';
import EmojiBar from './src/components/EmojiBar/EmojiBar';
import ModalAppInit from './src/components/ModalAppInit';
import ModalAppUpdate from './src/components/ModalAppUpdate';
import AsyncStorage from '@react-native-community/async-storage';
import MessageInput from './src/components/MessageInput/MessageInput';
import Timeout from "smart-timeout";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.pubnub = new PubNubReact({
      publishKey: "pub-c-d93d7b15-4e46-42f4-ba03-c5d997844b9e",
      subscribeKey: "sub-c-1ef826d4-78df-11e9-945c-2ea711aa6b65"
    });

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
      isLoading: true,
      currentPicture: null,
      visibleModalStart: false,
      visibleModalUpdate: true,
      isFocused: false ,
      messages: new Map(),
      emojis: new Map(),
      allowGPS: true,
      showAbout: false,
      emojiCount: 0,
      emojiType: 1
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
    
    //PubNub
    this.pubnub.getMessage("message", msg => {
      console.log("MSG: ", msg);
      if (this.state.users.has(msg.publisher)) {
        let messages = this.state.messages;

        Timeout.set(msg.publisher, this.clearMessage, 5000, msg.publisher);
        let message = { uuid: msg.publisher, message: msg.message.message }; //, timerId: Timeout.set(msg.publisher,this.clearMessage,5000,msg.publisher)  }//setTimeout(this.clearMessage, 5000, msg.publisher)
        messages.set(msg.publisher, message);
        this.setState({
          messages
        });
      }
    });
    this.pubnub.getMessage("emoji", msg => {
      console.log("Emoji Message", msg.message);
      let oldEmoji = this.state.emojis.get(msg.publisher); //Obtain User's Previous State Object
      let emojis = this.state.emojis;
      let newEmoji;
      //emojiCount
      let emojiCount;
      let emojiType;
      if (msg.message.emojiCount != -1) {
        //Add Payload Emoji Count to emojiCount

        emojiType = msg.message.emojiType;
        if (oldEmoji) {
          // if (oldEmoji.emojiType == emojiType) {
            emojiCount = oldEmoji.emojiCount + msg.message.emojiCount;
          //  else {
          //   emojiCount = 1;
          // }
        } else {
          emojiCount = msg.message.emojiCount;
        }
      } else {
        emojiCount = 0; //reset EmojiCount to 0
      }
      newEmoji = {
        uuid: msg.publisher,
        emojiCount: emojiCount,
        emojiType: emojiType
      };
      emojis.set(msg.publisher, newEmoji);

      this.setState(
        {
          emojis
        },
        () => {
          console.log(emojis);
        }
      );
    });

    this.pubnub.getMessage("location", msg => {
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
      let newUser = {
        uuid: msg.publisher,
        latitude: msg.message.latitude,
        longitude: msg.message.longitude,
        image: msg.message.image,
        username: msg.message.username
      };
      if (!this.isEquivalent(oldUser, newUser)) {
        let users = this.state.users;

        if (msg.message.hideUser) {
          let emojis = this.state.emojis;
          let messages = this.state.messages;

          users.delete(newUser.uuid);
          emojis.delete(newUser.uuid);
          messages.delete(newUser.uuid);
          this.setState({
            emojis,
            messages
          });
        } else {
          users.set(newUser.uuid, newUser);
        }

        this.setState({
          users
        });
      }
    });
    this.pubnub.subscribe({
      channels: ["location"],
      withPresence: true
    });
    this.pubnub.subscribe({
      channels: ["emoji"],
      withPresence: true
    });
    this.pubnub.subscribe(
      {
        channels: ["message"],
        withPresence: true
      },
      function(status, response) {
        console.log(status, response);
      }
    );
    //this.pubnub.getStatus()
    // this.pubnub.getPresence(
    //   "",
    //   presence => {
    //     console.log("Presence", presence);
    //   },
    //   function(status, response) {
    //     console.log(status, response);
    //   }
    // );
    //Get Stationary Coordinate
    navigator.geolocation.getCurrentPosition(
      position => {
        if (this.state.allowGPS) {
          this.pubnub.publish({
            message: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              image: this.state.currentPicture,
              username: this.state.username
            },
            channel: "location"
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
      { enableHighAccuracy: true, timeout: 2000, maximumAge: 1000 }
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
            channel: "location"
          });
          if (this.state.focusOnMe) {
            this.animateToCurrent(position.coords, 1000);
          }
        }
      },
      error => console.log("Maps Error: ", error),
      {
        enableHighAccuracy: true,
        timeout: 2000,
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
    let messages = this.state.messages;
    messages.delete(uuid);
    this.setState(
      {
        messages
      },
      () => {
        console.log("piza", this.state.messages);
      }
    );
  };
  // stopMessageTimer = (timerId) => {
  //   console.log("clearing timeout");
  //   clearTimeout(timerId)
  // }
  publishMessage = () => {
    const testMessage = "Testing messages";
    this.pubnub.publish(
      {
        message: { message: Math.random() },
        channel: "message"
      },
      function(status, response) {
        console.log(status, response);
      }
    );
    console.log("publishing");
  };

  componentWillUnmount() {
    this.pubnub.publish({
      message: {
        latitude: -1,
        longitude: -1,
        image: this.state.currentPicture,
        hideUser: true
      },
      channel: "location"
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
              channel: "location"
            });
          }
        );
      } else {
        let users = this.state.users;
        let emojis = this.state.emojis;
        let messages = this.state.messages;
        let uuid = this.pubnub.getUUID();

        users.delete(uuid);
        emojis.delete(uuid);
        messages.delete(uuid);
        this.setState({
          users,
          emojis,
          messages
        });
        this.pubnub.publish({
          message: {
            latitude: -1,
            longitude: -1,
            image: this.state.currentPicture,
            hideUser: true
          },
          channel: "location"
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
    this.publishMessage();
    this.setState({
      showAbout: !this.state.showAbout
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
    console.log(uuid, " : ", this.pubnub.getUUID());
    if (uuid === this.pubnub.getUUID()) {
      this.focusLoc();
    } else {
      this.setState({
        fixedOnUUID: uuid,
        focusOnMe: false
      });
    }
  };
  displayMesasges = () => {
    console.log(this.state.messages);
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
  messageOutPut = message => {
    if (message) {
      return (
        <View style={styles.textBackground}>
          <Text style={styles.text}>{message.message}</Text>
        </View>
      );
    }
  };
  showUsername = user => {
    if (
      (this.state.focusOnMe && user.uuid == this.pubnub.getUUID()) ||
      this.state.fixedOnUUID == user.uuid
    ) {
      //console.log("user",user.username)
      return (
        <View style={styles.textBackground}>
          <Text style={styles.text}>{user.username}</Text>
        </View>
      );
    }
  };
  killEmoji = () => {
    this.pubnub.publish({
      message: {
        emojiCount: -1,
        emojiType: this.state.emojiType
      },
      channel: "emoji"
    });
  };
  //Increment Emoji Count
  showEmoji = () => {
    this.pubnub.publish(
      {
        message: {
          emojiCount: 1,
          emojiType: this.state.emojiType
        },
        channel: "emoji"
      },
      function(status, response) {
        console.log(status, response);
      }
    );
  };

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

    let about;
    let usersMap = this.state.users;
    let messagesMap = this.state.messages;
    let emojiMap = this.state.emojis;
    let gpsImage;
    if (this.state.focusOnMe || this.state.fixedOnUUID) {
      gpsImage = require("./assets/images/fixedGPS.png");
    } else {
      gpsImage = require("./assets/images/notFixedGPS.png");
    }

    for (let key of emojiMap.keys()) {
      let tempUser = usersMap.get(key);
      if (tempUser) {
        tempUser.emojiCount = emojiMap.get(key).emojiCount;
        tempUser.emojiType = emojiMap.get(key).emojiType;
        usersMap.set(key, tempUser);
      }
    }
    let usersArray = Array.from(usersMap.values());
    return (
      <View style={styles.container}>
        <Modal isVisible={this.state.visibleModalStart}>
          <ModalAppInit 
          changeProfilePicture={this.changeProfilePicture}
          closeModalInit={this.closeModalInit}
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
                    console.log(item.emojiCount);
                    rows.push(
                      <Animatable.View
                        animation="fadeOutUp"
                        duration={1000}
                        iterationCount={1}
                        direction="normal"
                        easing="ease-out"
                        onAnimationEnd={this.killEmoji}
                        key={i}
                      >
                        {item.emojiType == 1 && (
                          <Image
                            source={require("./src/Images/like2.png")}
                            style={styles.emoji}
                          />
                        )}
                        {item.emojiType == 2 && (
                          <Image
                            source={require("./src/Images/love2.png")}
                            style={styles.emoji}
                          />
                        )}
                        {item.emojiType == 3 && (
                          <Image
                            source={require("./src/Images/haha2.png")}
                            style={styles.emoji}
                          />
                        )}
                        {item.emojiType == 4 && (
                          <Image
                            source={require("./src/Images/wow2.png")}
                            style={styles.emoji}
                          />
                        )}
                        {item.emojiType == 5 && (
                          <Image
                            source={require("./src/Images/sad2.png")}
                            style={styles.emoji}
                          />
                        )}
                        {item.emojiType == 6 && (
                          <Image
                            source={require("./src/Images/angry2.png")}
                            style={styles.emoji}
                          />
                        )}
                      </Animatable.View>
                    );
                  }
                  return rows;
                })()}
                {this.messageOutPut(this.state.messages.get(item.uuid))}
                <Image
                  source={this.state.currentPicture}
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
      </View>
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
    alignItems: "center"
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
    top: 30,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  rightBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center"
  },
  locationSwitch: {
    right: 10
  },
  container: {
    flex: 1
  },
  bottom: {
    position: "absolute",
    bottom: 16,
    //right: 0,
    justifyContent: "flex-end",
    alignSelf: "center",
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth:0,
    borderColor: 'blue'
  },
  focusLoc: {
    width: 30,
    height: 30,
    right: 16,
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  emoji: {
    height: 35,
    width: 35,
    position: "absolute",
  },
  info: {
    width: 30,
    height: 30,
    marginHorizontal: 15
  },
  profile: {
    width: 30,
    height: 30,
    marginHorizontal: 25
  },

  textContent: {
    alignItems: "center",
    marginBottom: 10
  },
  content: {
    backgroundColor: "white",
    padding: 22,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    borderColor: "rgba(0, 0, 0, 0.1)"
  },
  buttonContainer: {
    flexDirection: "row"
  },
});
