import React, { Component } from 'react';
import {Platform, StyleSheet, Text, View, Image, Button, TouchableOpacity} from 'react-native';

export default class UserCount extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <View style={styles.usersView}>
      <Text style={styles.usersText}> {'Active Users: ' + this.props.userCount} </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  usersView: {
    flexDirection: 'row',
    alignItems:"flex-end"
  },
  usersText: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'left',
  },
})