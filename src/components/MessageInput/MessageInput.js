import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native'
import { Container, Header, Item, Input, Icon, Button, Text } from 'native-base';

export default class MessageInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: ""
    };
  }
  publishMessage = (event) => {
    this.props.pubnub.publish({
      message: {
        message: event.nativeEvent.text,
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
  render() {
    return (
        <View style={styles.custom} searchBar rounded>
          <Item style={styles.messageBox}>
            <Icon name="chatbubbles" />
            <Input
              placeholder="Type a message..."
              onSubmitEditing={(event) => this.publishMessage(event)}
              ref={input => { this.textInput = input }}
              value={this.state.message}
              onChangeText={(text) => this.setState({ message: text })}/>
            <Icon name="return-right" />
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

    width: 300,
    marginLeft: 8,

    marginRight: 35,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: '#00000000',
    borderColor: 'red',
    borderWidth: 0
  },
  messageBox: {
    borderRadius: 24,
    paddingRight: 8,
    paddingLeft: 16,
    backgroundColor: 'white'
  }
})
