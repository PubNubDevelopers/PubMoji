import React, { Component } from 'react';
import { StyleSheet,TouchableOpacity, Keyboard,View } from 'react-native'
import { Container, Header, Item, Input, Icon, Button, Text } from 'native-base';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';

export default class MessageInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: ""
    };
  }
  publishMessage = () => {
    if(this.state.message){
      this.props.pubnub.publish({
        message: {
          uuid: this.props.pubnub.getUUID(),
          message: this.state.message,
          latitude: this.props.currentLoc.latitude,
          longitude: this.props.currentLoc.longitude,
          image: this.props.currentPicture,
          username: this.props.username,
        },
        channel: 'global'
      });
      this.setState({
        message: ""
      })

    }

  }
  render() {
    return (
        <View style={styles.custom} searchBar rounded>
          <Item style={styles.messageBox}>
            <Icon name="chatbubbles" />
            <Input
              placeholder="Type a message..."
              onSubmitEditing={this.publishMessage}
              value={this.state.message}
              onChangeText={(text) => this.setState({ message: text })}/>
            <TouchableOpacity onPress={this.publishMessage}>
              <Icon name="return-right" />
            </TouchableOpacity>

          </Item>
        </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  custom: {

    width: wp("84%"),
    marginLeft: wp("2%"),

    marginRight: wp("2%"),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: 'rgba(52, 52, 52, 0.0)',
    borderColor: 'red',
    borderWidth: 0
  },
  messageBox: {
    height:hp("6%"),
    borderRadius: 30,
    paddingRight: 8,
    paddingLeft: 16,
    backgroundColor: 'white',
  }
})
