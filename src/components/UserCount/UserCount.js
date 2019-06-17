import React, { Component } from 'react';
import {Platform, StyleSheet, Text, View, Image, Button, TouchableOpacity} from 'react-native';
import { Icon } from "react-native-elements";
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import withBadge from "./withBadge";

export default class UserCount extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const BadgedIcon = withBadge(this.props.userCount)(Icon);
    return (
      <View>
        <React.Fragment>
          <BadgedIcon
            name={`${Platform.OS === "ios" ? "ios" : "md"}-people`}
            type="ionicon"
            color="black"
            containerStyle={styles.padRight}
            value={this.props.userCount}
            size={hp("4.5%")}
          />
        </React.Fragment>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  padLeft: {
    paddingLeft: 2
  },
  padRight: {
    paddingRight: 20
  },
  usersView: {
    flexDirection: 'row',
    alignItems:"flex-start",
  },
  usersText: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'left',
  },
})