import { StyleSheet, Platform } from "react-native";
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';

export default StyleSheet.create({
  // Container
  viewContainer: {
    flexDirection: "column",
    flex: 1
  },

  // Toolbar
  // toolbar: {
  //   width: "100%",
  //   height: Platform.OS === "android" ? 48 : 68,
  //   alignItems: "center",
  //   backgroundColor: "#3b5998",
  //   borderWidth:2,
  //   borderColor:'black',
  //   flexDirection: "row"
  // },
  icBack: {
    width: 23,
    height: 23,
    marginLeft: 26,
    tintColor: "white",
    marginTop: Platform.OrS === "android" ? 0 : 20
  },
  icTrail: {
    width: 23,
    height: 23,
    marginLeft: 26,
    marginTop: Platform.OS === "android" ? 0 : 20
  },
  titleToolbar: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
    marginTop: Platform.OS === "android" ? 0 : 20
  },

  // Body
  viewBody: {
    borderWidth: 0,
    borderColor: 'purple'
  },

  // Top blank space
  // viewTopSpace: {
  //   width: "100%",
  //   height: 100
  // },

  // Main content
  viewContent: {
    borderWidth: 0,
    borderColor: "red",
    flexDirection: "row",
    height: hp("10%"),
  },

  // Box
  viewBox: {
    borderRadius: 30,
    width: wp("96%"),
    marginHorizontal: wp("2%"),
    height: hp("6%"),
    marginTop: hp("2.4%"),

    position: "absolute",
    // Has to set color for elevation
    backgroundColor: "white"
    // elevation: 6,
  },

  // Button like
  viewBtn: {
    flexDirection: "row",
    width: hp("12%"),
    justifyContent: "space-around",
    alignItems: "center",
    borderWidth: 0,
    padding: 10,
    borderRadius: 3,
    marginTop: hp("19%"),
    backgroundColor: "white"
  },
  textBtn: {
    color: "grey",
    fontSize: 14,
    fontWeight: "bold"
  },
  imgLikeInBtn: {
    width: 25,
    height: 25
  },

  // Group icon
  viewWrapGroupIcon: {
    flexDirection: "row",
    width: wp("100%"),
    height: hp("8%"),
    position: "absolute",
    borderWidth: 0,
    borderColor: "blue",
    alignItems: "flex-end",
    justifyContent: "space-around",
    paddingLeft: 5,
    paddingRight: 5
  },
  viewWrapIcon: {
    justifyContent: "center",
    alignItems: "center"
  },
  imgIcon: {
    width: hp("5%"),
    height: hp("5%"),

  },
  viewWrapTextDescription: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    width: wp("10%"),
    paddingLeft: wp("1%"),
    paddingRight: wp("1%"),
    paddingTop: 2,
    paddingBottom: 2,
    position: "absolute"
  },
  textDescription: {
    color: "white",
    fontSize: 8
  },

  // Group jump icon
  viewWrapGroupJumpIcon: {
    flexDirection: "row",
    width: wp("93%"),

    height: hp("10%"),
    borderWidth: 0,
    borderColor: "green",

    position: "absolute",
    alignItems: "flex-end",
    flex: 1
  }
});
