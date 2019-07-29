# Welcome to PubMoji!

Pubmoji is an interactive app designed to demonstrate PubNub's realtime capabilities. You will see just how easy it is to integrate Pub/Sub, Prescence, and other keystone multi-user features into a phone application.

Using the PubNub React SDK, PubMoji is built using React Native, and is an app that allows users to 

* Multiple users are rendered on a map as a pre-selected avatar.
* When users move a set distance, a message is published to others connected wither their updated location.
* Both messages and emojis appeear over each users' heads.
* Emojis can be spammed to your hearts content!
* Toggle a switch to stop sharing your location in Incognito Mode.
* See how many users are connected using PubNub's Presence Badge!

![pubmoji gif](https://pubnubdevelopers.github.io/PubMoji-Product-Page/img/demo.gif)

All user data is handled [securley](https://www.pubnub.com/developers/tech/security/) and [reliably](https://www.pubnub.com/blog/build-a-reliable-product-that-never-fails/) through PubNub. Each user publishes their data across a PubNub channel, and other users who are subscribed to that channel receive those messages in realtime. 

# How to run

- [ ] Clone this repository to your computer

- [ ] Replace the placeholder keys on line 37 and 38 of your App.js with your own PubNub keys through the link below!

<a href="https://dashboard.pubnub.com/signup?devrel_gh=PubMoji">
    <img alt="PubNub Signup" src="https://i.imgur.com/og5DDjf.png" width=260 height=97/>
</a>

- [ ] These next steps need to be completed if you would like to run PubMoji on Android
    - [ ] [Get a Google Maps API](https://developers.google.com/maps/documentation/javascript/get-api-key) 
    - [ ] Create the file 'gradle.properties' and 'local.properties' under the 'android' folder. Insert the following lines into them:  
    - [ ] ```Google_Maps_ApiKey="YOUR_API_KEY"``` into 'gradle.properties', replacing the placeholder with your Google Maps API key. 
    - [ ] ```sdk.dir = /Users/USERNAME/Library/Android/sdk``` into 'local.properties', replacing USERNAME with your computer username. Check out [this stackoverflow question](https://stackoverflow.com/questions/32634352/react-native-android-build-failed-sdk-location-not-found) for help with other operating systems besides MacOS. 

- [ ] Next install all the required packages using ```npm i```

- [ ] Link packages to your project with ```react-native link```
 
- [ ] Either run ```react-native run-ios``` or ```react-native run-android```. Your android emulator needs to be running for ADB to see it. 

      
# What is PubNub?
[PubNub](https://www.pubnub.com/?devrel_gh=PubMoji) is a global Data Stream Network (DSN) and realtime network-as-a-service. PubNub's primary product is a realtime publish/subscribe messaging API built on a global data stream network which is made up of a replicated network with multiple points of presence around the world.

PubNub is a low cost, easy to use, infrastructure API that can be integrated quckly and smoothly into any application. Check out THIS PAGE to see how quck and easy it really is to instantiate a PubNub instance into your code!

![pubnub gif](https://www.pubnub.com/wp-content/uploads/2016/08/pubsub-1.gif)

## Related Tutorials
Here are a few tutorials that can help you create a realtime app similar to PubMoji.
* [Realtime Basics in React Native: Pub/Sub, Presence, Functions, and History](https://www.pubnub.com/blog/pubnub-react-native-basics-pub-sub-history-gelocation-presence/?devrel_gh=PubMoji)
* [Publish and Receive geolocation data in a React Native app](https://www.pubnub.com/blog/pubnub-react-native-basics-pub-sub-history-gelocation-presence/?devrel_gh=PubMoji)
* [Add a Notification Badge to Icons in React Native](https://www.pubnub.com/blog/how-to-add-a-realtime-badge-to-icons-in-react-native/?devrel_gh=PubMoji)
* [Create a Multiplayer Tic Tac Toe Game in React Native](https://www.pubnub.com/blog/multiplayer-mobile-tic-tac-toe-react-native-ios-android-part-one/?devrel_gh=PubMoji)
