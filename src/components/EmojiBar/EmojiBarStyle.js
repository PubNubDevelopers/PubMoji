import { StyleSheet, Platform } from "react-native";

export default StyleSheet.create({
  // Container
  viewContainer: {
    flexDirection: "column",
    flex: 1
  },

  // Toolbar
  toolbar: {
    width: "100%",
    height: Platform.OS === "android" ? 48 : 68,
    alignItems: "center",
    backgroundColor: "#3b5998",
    flexDirection: "row"
  },
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
    borderColor: "purple",
    marginTop: 550,
    marginBottom: 16
  },

  // Top blank space
  viewTopSpace: {
    width: "100%",
    height: 100
  },

  // Main content
  viewContent: {
    borderWidth: 0,
    borderColor: "red",
    flexDirection: "row",
    height: 140,
    marginLeft: 10,
    marginRight: 10
  },

  // Box
  viewBox: {
    borderRadius: 30,
    width: 350,
    height: 50,
    marginTop: 75,
    marginLeft: 0,
    position: "absolute",
    // Has to set color for elevation
    backgroundColor: "white"
    // elevation: 6,
  },

  // Button like
  viewBtn: {
    flexDirection: "row",
    width: 100,
    justifyContent: "space-around",
    alignItems: "center",
    borderWidth: 0,
    padding: 10,
    borderRadius: 3,
    marginTop: 170,
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
    width: 350,
    height: 120,
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
    width: 36,
    height: 36
  },
  viewWrapTextDescription: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    paddingLeft: 7,
    paddingRight: 7,
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
    width: 350,
    height: 140,
    borderWidth: 0,
    borderColor: "green",
    marginLeft: 10,
    marginRight: 10,
    position: "absolute",
    alignItems: "flex-end",
    flex: 1
  }
});
