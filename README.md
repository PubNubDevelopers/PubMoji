# Welcome to PubMoji!

Pubmoji is an interactive phone application designed to demonstrate PubNub's capabilities. You will see just how easy it is to integrate Pub/Sub, Prescence, and other keystone multi-user features into a phone application.

Using the PubNub-React-Native SDK, PubMoji is a React-Native phone application similar to SnapChat's SnapMaps and CookieClicker:

* Multiple users are rendered on a Geographic map as either a pre-selected avatar or their very own Bitmoji.
* Each user can then spam/select up to 5 different emojis to emerge out of their head.
...

"Image of App"

All user-data is handled securley and reliably through PubNub. Each user publishes their data across a PubNub channel of which the other users receive in realtime by subscribing to that channel. This entails instances such as rendering people on a map based on the GPS coordinates they Published or tracking each user's state by having them publish user-specific values such as UUID, GPS permission, etc. 

# How to run

 ```npm i```

 ```react-native link```
 
 ```react-native run-ios``` or ```react-native run-android```

"Image of PubNub Abstraction"
      
      
#### To get started, sign up for a free PubNub account to get your Pub/Sub keys!

"PubNub Key image link"

      
      
## FREQUENTLY ASKED QUESTIONS     
      
What is PubNub?
PubNub is a global Data Stream Network (DSN) and realtime network-as-a-service. PubNub's primary product is a realtime publish/subscribe messaging API built on a global data stream network which is made up of a replicated network with multiple points of presence around the world.

PubNub is a low cost, easy to use, infrastructure API that can be integrated quckly and smoothly into any application. Check out THIS PAGE to see how quck and easy it really is to instantiate a PubNub instance into your code!
