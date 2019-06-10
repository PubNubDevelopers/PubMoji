import React, { Component } from 'react';
import { StyleSheet } from 'react-native'
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
      message: { message: event.nativeEvent.text},
      channel: 'channel1.messages'
    });
    this.setState({
      message: ""
    })
  }
  render() {
    return (
      <Container style={styles.custom}>
        <Header style={styles.custom} searchBar rounded>
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
        </Header>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  custom: {
    marginTop: 0,
    width: 300,
    marginLeft: 35,
    marginRight: 35,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: '#00000000'
  },
  messageBox: {
    backgroundColor: 'white'
  }
})
