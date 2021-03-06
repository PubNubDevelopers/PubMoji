import React, { Component } from "react";
import {
  Animated,
  BackHandler,
  Image,
  PanResponder,
  Text,
  TouchableOpacity,
  Platform,
  View,

} from "react-native";
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import Sound from "react-native-sound";

import styles from "./EmojiBarStyle";
import images from "../../Images/Images.js";

import FastImage from "react-native-fast-image";

export default class AnimationScreen extends Component {
  constructor(props) {
    super(props);

    this.soundBoxDown = new Sound(
      "box_down.mp3",
      Sound.MAIN_BUNDLE,
      error => {}
    );
    this.soundBoxUp = new Sound("box_up.mp3", Sound.MAIN_BUNDLE, error => {});
    this.soundIconChoose = new Sound(
      "icon_choose.mp3",
      Sound.MAIN_BUNDLE,
      error => {}
    );
    this.soundIconFocus = new Sound(
      "icon_focus.mp3",
      Sound.MAIN_BUNDLE,
      error => {}
    );
    this.soundShortTouchLike = new Sound(
      "short_press_like.mp3",
      Sound.MAIN_BUNDLE,
      error => {}
    );

    // Slow down speed animation here (1 = default)
    this.timeDilation = 1;



    // Variables to check
    // 0 = nothing, 1 = like, 2 = love, 3 = haha, 4 = wow, 5 = sad, 6 = angry

    this.isLongTouch = false;
    this.isLiked = true;

    this.whichIconUserChoose = 0;
    this.currentIconFocus = 0;
    this.previousIconFocus = 0;
    this.isDragging = true;
    this.isDraggingOutside = false;
    this.isJustDragInside = true;

    // Duration animation
    this.durationAnimationBox = 500;
    this.durationAnimationQuickTouch = 500;
    this.durationAnimationLongTouch = 150;
    this.durationAnimationIconWhenDrag = 150;
    this.durationAnimationIconWhenRelease = 1000;

    // ------------------------------------------------------------------------------
    // Animation button when quick touch button
    this.tiltIconAnim = new Animated.Value(0);
    this.zoomIconAnim = new Animated.Value(0);
    this.zoomTextAnim = new Animated.Value(0);

    // ------------------------------------------------------------------------------
    // Animation when button long touch button
    this.tiltIconAnim2 = new Animated.Value(0);
    this.zoomIconAnim2 = new Animated.Value(0);
    this.zoomTextAnim2 = new Animated.Value(0);
    // Animation of the box
    this.fadeBoxAnim = new Animated.Value(1);

    // Animation for emoticons
    this.moveRightGroupIcon = new Animated.Value(0);
    // Like
    this.pushIconLikeUp = new Animated.Value(0);
    // I don't know why, but when I set to 0.0, it seem blink,
    // so temp solution is set to 0.01
    this.zoomIconLike = new Animated.Value(0.01);
    // Love
    this.pushIconLoveUp = new Animated.Value(0);
    this.zoomIconLove = new Animated.Value(0.01);
    // Haha
    this.pushIconHahaUp = new Animated.Value(0);
    this.zoomIconHaha = new Animated.Value(0.01);
    // Wow
    this.pushIconWowUp = new Animated.Value(0);
    this.zoomIconWow = new Animated.Value(0.01);
    // Sad
    this.pushIconSadUp = new Animated.Value(0);
    this.zoomIconSad = new Animated.Value(0.01);
    // Angry
    this.pushIconAngryUp = new Animated.Value(0);
    this.zoomIconAngry = new Animated.Value(0.01);

    // ------------------------------------------------------------------------------
    // Animation for zoom emoticons when drag
    this.zoomIconChosen = new Animated.Value(1);
    this.zoomIconNotChosen = new Animated.Value(1);
    this.zoomIconWhenDragOutside = new Animated.Value(1);
    this.zoomIconWhenDragInside = new Animated.Value(1);
    this.zoomBoxWhenDragInside = new Animated.Value(1);
    this.zoomBoxWhenDragOutside = new Animated.Value(0.95);

    // Animation for text description at top icon
    this.pushTextDescriptionUp = new Animated.Value(60);
    this.zoomTextDescription = new Animated.Value(1);

    // ------------------------------------------------------------------------------
    // Animation for jump emoticon when release finger
    this.zoomIconWhenRelease = new Animated.Value(1);
    this.moveUpDownIconWhenRelease = new Animated.Value(0);
    this.moveLeftIconLikeWhenRelease = new Animated.Value(20);
    this.moveLeftIconLoveWhenRelease = new Animated.Value(72);
    this.moveLeftIconHahaWhenRelease = new Animated.Value(124);
    this.moveLeftIconWowWhenRelease = new Animated.Value(173);
    this.moveLeftIconSadWhenRelease = new Animated.Value(226);
    this.moveLeftIconAngryWhenRelease = new Animated.Value(278);
  }

  componentWillMount() {
    this.setupPanResponder();
  }

  publishEmojiMessage =  () => {
    // const result = await this.onDragRelease();
    this.props.pubnub.publish({
      message: {
        emojiType: this.whichIconUserChoose,
        emojiCount: 1,
        uuid: this.props.pubnub.getUUID(),
        latitude: this.props.currentLoc.latitude,
        longitude: this.props.currentLoc.longitude,
        image: this.props.currentPicture,
        username: this.props.username,
       },
      channel: "global"
    });
  }

  // Handle the drag gesture
  setupPanResponder() {
    this.rootPanResponder = PanResponder.create({
      // prevent if user's dragging without long touch the button
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,

      onPanResponderGrant: (evt, gestureState) => {
        this.handleEmoticonWhenDragging(evt, gestureState);
      },

      onPanResponderMove: (evt, gestureState) => {
        this.handleEmoticonWhenDragging(evt, gestureState);
      },

      onPanResponderRelease: (evt, gestureState) => {
        this.isDragging = false;
        this.isDraggingOutside = false;
        this.isJustDragInside = true;
        this.previousIconFocus = 0;
        this.currentIconFocus = 0;
        this.setState({});

        this.publishEmojiMessage();
      }
    });
  }

  handleEmoticonWhenDragging = (evt, gestureState) => {
    // the margin top the box is 100
    // and plus the height of toolbar and the status bar
    // so the range we check is about 150 -> 450
    if (gestureState.y0 + gestureState.dy >= hp('80%') && gestureState.y0 + gestureState.dy <= hp('87%')){

      this.isDragging = true;
      this.isDraggingOutside = false;


      if (this.isJustDragInside) {
        this.controlIconWhenDragInside();
      }

      if (
        gestureState.x0 + gestureState.dx >= wp("0%") &&
        gestureState.x0 + gestureState.dx < wp("16.6%")
      ) {
        if (this.currentIconFocus !== 1) {
          this.handleWhenDragBetweenIcon(1);
        }
      } else if (
        gestureState.x0 + gestureState.dx >= wp("16.6%") &&
        gestureState.x0 + gestureState.dx < wp("33.2%")
      ) {
        if (this.currentIconFocus !== 2) {
          this.handleWhenDragBetweenIcon(2);
        }
      } else if (
        gestureState.x0 + gestureState.dx >= wp("33.2%") &&
        gestureState.x0 + gestureState.dx < wp("49.8%")
      ) {
        if (this.currentIconFocus !== 3) {
          this.handleWhenDragBetweenIcon(3);
        }
      } else if (
        gestureState.x0 + gestureState.dx >= wp("49.8%") &&
        gestureState.x0 + gestureState.dx < wp("66.4%")
      ) {
        if (this.currentIconFocus !== 4) {
          this.handleWhenDragBetweenIcon(4);
        }
      } else if (
        gestureState.x0 + gestureState.dx >= wp("66.4%") &&
        gestureState.x0 + gestureState.dx < wp("83%")
      ) {
        if (this.currentIconFocus !== 5) {
          this.handleWhenDragBetweenIcon(5);
        }
      } else if (
        gestureState.x0 + gestureState.dx >= wp("83%") &&
        gestureState.x0 + gestureState.dx <= wp("100%")
      ) {
        if (this.currentIconFocus !== 6) {
          this.handleWhenDragBetweenIcon(6);
        }
      }
    } else {
      this.whichIconUserChoose = 0;
      this.previousIconFocus = 0;
      this.currentIconFocus = 0;
      this.isJustDragInside = true;

      if (this.isDragging && !this.isDraggingOutside) {
        this.isDragging = true;
        this.isDraggingOutside = false;
        this.setState({});

        this.controlBoxWhenDragOutside();
        this.controlIconWhenDragOutside();
      }
    }
  };


  onDragRelease =  () => {

    // // To lower the emoticons
    // this.doAnimationLongTouchReverse();
    //
    // // To jump particular emoticon be chosen
    // this.controlIconWhenRelease();
  };


  // ------------------------------------------------------------------------------
  // Animation when long touch button
  doAnimationLongTouch = () => {
    this.soundBoxUp.play();

    this.isLongTouch = true;
    this.setState({});

    this.tiltIconAnim2.setValue(0);
    this.zoomIconAnim2.setValue(1);
    this.zoomTextAnim2.setValue(1);

    this.fadeBoxAnim.setValue(1);

    this.moveRightGroupIcon.setValue(0);

    this.pushIconLikeUp.setValue(0);
    this.zoomIconLike.setValue(0.01);

    this.pushIconLoveUp.setValue(0);
    this.zoomIconLove.setValue(0.01);

    this.pushIconHahaUp.setValue(0);
    this.zoomIconHaha.setValue(0.01);

    this.pushIconWowUp.setValue(0);
    this.zoomIconWow.setValue(0.01);

    this.pushIconSadUp.setValue(0);
    this.zoomIconSad.setValue(0.01);

    this.pushIconAngryUp.setValue(0);
    this.zoomIconAngry.setValue(0.01);

    Animated.parallel([
      // Button
      Animated.timing(this.tiltIconAnim2, {
        toValue: 1,
        duration: this.durationAnimationLongTouch * this.timeDilation
      }),
      Animated.timing(this.zoomIconAnim2, {
        toValue: 0.8,
        duration: this.durationAnimationLongTouch * this.timeDilation
      }),
      Animated.timing(this.zoomTextAnim2, {
        toValue: 0.8,
        duration: this.durationAnimationLongTouch * this.timeDilation
      }),

      // Box
      Animated.timing(this.fadeBoxAnim, {
        toValue: 1,
        duration: this.durationAnimationBox * this.timeDilation,
        delay: 350
      }),

      // Group emoticon
      Animated.timing(this.moveRightGroupIcon, {
        toValue: 20,
        duration: this.durationAnimationBox * this.timeDilation
      }),


      Animated.timing(this.zoomIconLike, {
        toValue: 1,
        duration: 250 * this.timeDilation
      }),


      Animated.timing(this.zoomIconLove, {
        toValue: 1,
        duration: 250 * this.timeDilation,
        delay: 50
      }),


      Animated.timing(this.zoomIconHaha, {
        toValue: 1,
        duration: 250 * this.timeDilation,
        delay: 100
      }),


      Animated.timing(this.zoomIconWow, {
        toValue: 1,
        duration: 250 * this.timeDilation,
        delay: 150
      }),

      Animated.timing(this.zoomIconSad, {
        toValue: 1,
        duration: 250 * this.timeDilation,
        delay: 200
      }),


      Animated.timing(this.zoomIconAngry, {
        toValue: 1,
        duration: 250 * this.timeDilation,
        delay: 250
      })
    ]).start();
  };

  doAnimationLongTouchReverse = () => {
    this.tiltIconAnim2.setValue(1);
    this.zoomIconAnim2.setValue(0.8);
    this.zoomTextAnim2.setValue(0.8);

    this.fadeBoxAnim.setValue(1);

    this.moveRightGroupIcon.setValue(0);

    this.pushIconLikeUp.setValue(1);
    this.zoomIconLike.setValue(1);

    this.pushIconLoveUp.setValue(1);
    this.zoomIconLove.setValue(1);

    this.pushIconHahaUp.setValue(1);
    this.zoomIconHaha.setValue(1);

    this.pushIconWowUp.setValue(1);
    this.zoomIconWow.setValue(1);

    this.pushIconSadUp.setValue(1);
    this.zoomIconSad.setValue(1);

    this.pushIconAngryUp.setValue(1);
    this.zoomIconAngry.setValue(1);

    Animated.parallel([
      // Button
      Animated.timing(this.tiltIconAnim2, {
        toValue: 0,
        duration: this.durationAnimationLongTouch * this.timeDilation
      }),
      Animated.timing(this.zoomIconAnim2, {
        toValue: 1,
        duration: this.durationAnimationLongTouch * this.timeDilation
      }),
      Animated.timing(this.zoomTextAnim2, {
        toValue: 1,
        duration: this.durationAnimationLongTouch * this.timeDilation
      }),

      // Box
      Animated.timing(this.fadeBoxAnim, {
        toValue: 1,
        duration: this.durationAnimationLongTouch * this.timeDilation
      }),


      Animated.timing(this.zoomIconLike, {
        toValue: 0.1,
        duration: 250 * this.timeDilation
      }),


      Animated.timing(this.zoomIconLove, {
        toValue: 0.01,
        duration: 250 * this.timeDilation
      }),

      Animated.timing(this.zoomIconHaha, {
        toValue: 0.01,
        duration: 250 * this.timeDilation
      }),

      Animated.timing(this.zoomIconWow, {
        toValue: 0.01,
        duration: 250 * this.timeDilation
      }),

      Animated.timing(this.zoomIconSad, {
        toValue: 0.01,
        duration: 250 * this.timeDilation
      }),


      Animated.timing(this.zoomIconAngry, {
        toValue: 0.01,
        duration: 250 * this.timeDilation
      })
    ]).start(this.onAnimationLongTouchComplete);
  };

  onAnimationLongTouchComplete = () => {
    this.isLongTouch = true;
    this.setState({});
  };

  // ------------------------------------------------------------------------------
  // Animation for zoom emoticons when drag
  handleWhenDragBetweenIcon = currentIcon => {
    this.whichIconUserChoose = currentIcon;
    this.previousIconFocus = this.currentIconFocus;
    this.currentIconFocus = currentIcon;

    this.soundIconFocus.play();

    this.controlIconWhenDrag();
  };

  controlIconWhenDrag = () => {
    // this.zoomIconChosen.setValue(0.8);
    // this.zoomIconNotChosen.setValue(1.8);
    // this.zoomBoxWhenDragInside.setValue(1.0);

    this.pushTextDescriptionUp.setValue(60);
    this.zoomTextDescription.setValue(1.0);

    // For update logic at render function
    this.setState({});

    // Need timeout so logic check at render function can update
    // setTimeout(
    //   () =>
    //     Animated.parallel([
    //       Animated.timing(this.zoomIconChosen, {
    //         toValue: 1.8,
    //         duration: this.durationAnimationIconWhenDrag * this.timeDilation
    //       }),
    //       Animated.timing(this.zoomIconNotChosen, {
    //         toValue: 0.8,
    //         duration: this.durationAnimationIconWhenDrag * this.timeDilation
    //       }),
    //       Animated.timing(this.zoomBoxWhenDragInside, {
    //         toValue: 0.95,
    //         duration: this.durationAnimationIconWhenDrag * this.timeDilation
    //       }),
    //
    //       Animated.timing(this.pushTextDescriptionUp, {
    //         toValue: 90,
    //         duration: this.durationAnimationIconWhenDrag * this.timeDilation
    //       }),
    //       Animated.timing(this.zoomTextDescription, {
    //         toValue: 1.7,
    //         duration: this.durationAnimationIconWhenDrag * this.timeDilation
    //       })
    //     ]).start(),
    //   50
    // );
  };

  controlIconWhenDragInside = () => {
    this.setState({});

    // this.zoomIconWhenDragInside.setValue(1.0);
    // Animated.timing(this.zoomIconWhenDragInside, {
    //   toValue: 0.8,
    //   duration: this.durationAnimationIconWhenDrag * this.timeDilation
    // }).start(this.onAnimationIconWhenDragInsideComplete);
  };

  onAnimationIconWhenDragInsideComplete = () => {
    this.isJustDragInside = false;
    this.setState({});
  };

  controlIconWhenDragOutside = () => {
    // this.zoomIconWhenDragOutside.setValue(0.8);
    //
    // Animated.timing(this.zoomIconWhenDragOutside, {
    //   toValue: 1.0,
    //   duration: this.durationAnimationIconWhenDrag * this.timeDilation
    // }).start();
  };

  controlBoxWhenDragOutside = () => {
    // this.zoomBoxWhenDragOutside.setValue(0.95);
    //
    // Animated.timing(this.zoomBoxWhenDragOutside, {
    //   toValue: 1.0,
    //   duration: this.durationAnimationIconWhenDrag * this.timeDilation
    // }).start();
  };

  // ------------------------------------------------------------------------------
  // Animation for jump emoticon when release finger0.01
  controlIconWhenRelease = () => {
    this.zoomIconWhenRelease.setValue(1);
    this.moveUpDownIconWhenRelease.setValue(0);
    this.moveLeftIconLikeWhenRelease.setValue(wp("8.3%"));
    this.moveLeftIconLoveWhenRelease.setValue(wp("24.9%"));
    this.moveLeftIconHahaWhenRelease.setValue(wp("41.5%"));
    this.moveLeftIconWowWhenRelease.setValue(wp("58.1%"));
    this.moveLeftIconSadWhenRelease.setValue(wp("74.7%"));
    this.moveLeftIconAngryWhenRelease.setValue(wp("91.3%"));

    Animated.parallel([
      Animated.timing(this.zoomIconWhenRelease, {
        toValue: 0,
        duration: this.durationAnimationIconWhenRelease * this.timeDilation
      }),
      Animated.timing(this.moveUpDownIconWhenRelease, {
        toValue: 3,
        duration: this.durationAnimationIconWhenRelease * this.timeDilation
      }),
      Animated.timing(this.moveLeftIconLikeWhenRelease, {
        toValue: 0,
        duration: this.durationAnimationIconWhenRelease * this.timeDilation
      }),
      Animated.timing(this.moveLeftIconLoveWhenRelease, {
        toValue: 0,
        duration: this.durationAnimationIconWhenRelease * this.timeDilation
      }),
      Animated.timing(this.moveLeftIconHahaWhenRelease, {
        toValue: 0,
        duration: this.durationAnimationIconWhenRelease * this.timeDilation
      }),
      Animated.timing(this.moveLeftIconWowWhenRelease, {
        toValue: 0,
        duration: this.durationAnimationIconWhenRelease * this.timeDilation
      }),
      Animated.timing(this.moveLeftIconSadWhenRelease, {
        toValue: 0,
        duration: this.durationAnimationIconWhenRelease * this.timeDilation
      }),
      Animated.timing(this.moveLeftIconAngryWhenRelease, {
        toValue: 0,
        duration: this.durationAnimationIconWhenRelease * this.timeDilation
      })
    ]).start();

    if (this.whichIconUserChoose === 0) {
      this.soundBoxDown.play();
    } else {
      this.soundIconChoose.play();
    }
  };

  render() {
    return (
      <View style={styles.viewBody} {...this.rootPanResponder.panHandlers}>

        <View style={styles.viewContent}>
          {/* Box */}
          <Animated.View
            style={[
              styles.viewBox,
              {
                opacity: this.fadeBoxAnim,
              }
            ]}
          />

          {/* Group emoticon */}
          {this.renderGroupIcon()}


        </View>
      </View>
    );
  }

  renderButton() {
    let tiltBounceIconAnim = this.tiltIconAnim.interpolate({
      inputRange: [0, 0.2, 0.8, 1],
      outputRange: ["0deg", "20deg", "-15deg", "0deg"]
    });
    let zoomBounceIconAnim = this.zoomIconAnim.interpolate({
      inputRange: [0, 0.2, 0.8, 1],
      outputRange: [1, 0.8, 1.15, 1]
    });
    let zoomBounceTextAnim = this.zoomIconAnim.interpolate({
      inputRange: [0, 0.2, 0.8, 1],
      outputRange: [1, 0.8, 1.15, 1]
    });

    let tiltBounceIconAnim2 = this.tiltIconAnim2.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "20deg"]
    });

    return (
      <View
        style={[styles.viewBtn, { borderColor: this.getBorderColorBtn() }]}
      >
        <Animated.Image
          source={this.getIconBtn()}
          style={[
            styles.imgLikeInBtn,
            {
              transform: [
                {
                  rotate: this.isLongTouch
                    ? tiltBounceIconAnim2
                    : tiltBounceIconAnim
                },
                {
                  scale: this.isLongTouch
                    ? this.zoomIconAnim2
                    : zoomBounceIconAnim
                }
              ]
            }
          ]}
        />
        <Animated.Text
          style={[
            styles.textBtn,
            { color: this.getColorTextBtn() },
            {
              transform: [
                {
                  scale: this.isLongTouch
                    ? this.zoomTextAnim2
                    : zoomBounceTextAnim
                }
              ]
            }
          ]}
        >
          {this.getTextBtn()}
        </Animated.Text>
      </View>
    );
  }

  getBorderColorBtn() {
    if (!this.isLongTouch && this.isLiked) {
      return "#3b5998";
    } else if (!this.isDragging) {
      switch (this.whichIconUserChoose) {
        case 1:
          return "#3b5998";
        case 2:
          return "#ED5167";
        case 3:
        case 4:
        case 5:
          return "#FFD96A";
        case 6:
          return "#F6876B";
        default:
          return "grey";
      }
    } else {
      return "grey";
    }
  }

  getColorTextBtn() {
    if (!this.isLongTouch && this.isLiked) {
      return "#3b5998";
    } else if (!this.isDragging) {
      switch (this.whichIconUserChoose) {
        case 1:
          return "#3b5998";
        case 2:
          return "#ED5167";
        case 3:
        case 4:
        case 5:
          return "#FFD96A";
        case 6:
          return "#F6876B";
        default:
          return "grey";
      }
    } else {
      return "grey";
    }
  }

  getIconBtn() {
    if (!this.isLongTouch && this.isLiked) {
      return images.like_static_fill;
    } else if (!this.isDragging) {
      switch (this.whichIconUserChoose) {
        case 1:
          return images.like_static_fill;
        case 2:
          return images.love_static;
        case 3:
          return images.haha_static;
        case 4:
          return images.wow_static;
        case 5:
          return images.sad_static;
        case 6:
          return images.angry_static;
        default:
          return images.like_static;
      }
    } else {
      return images.like_static;
    }
  }

  getTextBtn() {
    if (this.isDragging) {
      return "Like";
    }
    switch (this.whichIconUserChoose) {
      case 1:
        return "Like";
      case 2:
        return "Love";
      case 3:
        return "Haha";
      case 4:
        return "Wow";
      case 5:
        return "Sad";
      case 6:
        return "Angry";
      default:
        return "Like";
    }
  }

  renderGroupIcon() {
    return (
      <Animated.View
        style={[
          styles.viewWrapGroupIcon,
          { marginLeft: this.moveRightGroupIcon }
        ]}
      >
        {/* Icon like */}
        <View style={styles.viewWrapIcon}>
          {this.currentIconFocus === 1 ? (
            <Animated.View
              style={[
                styles.viewWrapTextDescription,
                {
                  bottom: this.pushTextDescriptionUp,
                  transform: [{ scale: this.zoomTextDescription }]
                }
              ]}
            >
              <Text style={styles.textDescription}>Like</Text>
            </Animated.View>
          ) : null}
          <Animated.View
            style={{
              marginBottom: this.pushIconLikeUp,
              transform: [
                {
                  scale:
                    this.currentIconFocus === 1
                      ? this.zoomIconChosen
                      : this.previousIconFocus === 1
                      ? this.zoomIconNotChosen
                      : this.isJustDragInside
                      ? this.zoomIconWhenDragInside
                      : 0.8
                }
              ]
            }}
          >
            <FastImage
              style={styles.imgIcon}
              source={{
                uri:
                  "https://raw.githubusercontent.com/PubNubDevelopers/PubMoji/master/src/Images/like.gif"
              }}
            />
          </Animated.View>
        </View>

        {/* Icon love */}
        <View style={styles.viewWrapIcon}>
          {this.currentIconFocus === 2 ? (
            <Animated.View
              style={[
                styles.viewWrapTextDescription,
                {
                  bottom: this.pushTextDescriptionUp,
                  transform: [{ scale: this.zoomTextDescription }]
                }
              ]}
            >
              <Text style={styles.textDescription}>Love</Text>
            </Animated.View>
          ) : null}
          <Animated.View
            style={{
              marginBottom: this.pushIconLoveUp,
              transform: [
                {
                  scale:
                    this.currentIconFocus === 2
                      ? this.zoomIconChosen
                      : this.previousIconFocus === 2
                      ? this.zoomIconNotChosen
                      : this.isJustDragInside
                      ? this.zoomIconWhenDragInside
                      : 0.8
                }
              ]
            }}
          >
            <FastImage
              style={styles.imgIcon}
              source={{
                uri:
                  "https://raw.githubusercontent.com/PubNubDevelopers/PubMoji/master/src/Images/love.gif"
              }}
            />
          </Animated.View>
        </View>

        {/* Icon haha */}
        <View style={styles.viewWrapIcon}>
          {this.currentIconFocus === 3 ? (
            <Animated.View
              style={[
                styles.viewWrapTextDescription,
                {
                  bottom: this.pushTextDescriptionUp,
                  transform: [{ scale: this.zoomTextDescription }]
                }
              ]}
            >
              <Text style={styles.textDescription}>Haha</Text>
            </Animated.View>
          ) : null}
          <Animated.View
            style={{
              marginBottom: this.pushIconHahaUp,
              transform: [
                {
                  scale:
                    this.currentIconFocus === 3
                      ? this.zoomIconChosen
                      : this.previousIconFocus === 3
                      ? this.zoomIconNotChosen
                      : this.isJustDragInside
                      ? this.zoomIconWhenDragInside
                      : 0.8
                }
              ]
            }}
          >
            <FastImage
              style={styles.imgIcon}
              source={{
                uri:
                  "https://raw.githubusercontent.com/PubNubDevelopers/PubMoji/master/src/Images/haha.gif"
              }}
            />
          </Animated.View>
        </View>

        {/* Icon wow */}
        <View style={styles.viewWrapIcon}>
          {this.currentIconFocus === 4 ? (
            <Animated.View
              style={[
                styles.viewWrapTextDescription,
                {
                  bottom: this.pushTextDescriptionUp,
                  transform: [{ scale: this.zoomTextDescription }]
                }
              ]}
            >
              <Text style={styles.textDescription}>Wow</Text>
            </Animated.View>
          ) : null}
          <Animated.View
            style={{
              marginBottom: this.pushIconWowUp,
              transform: [
                {
                  scale:
                    this.currentIconFocus === 4
                      ? this.zoomIconChosen
                      : this.previousIconFocus === 4
                      ? this.zoomIconNotChosen
                      : this.isJustDragInside
                      ? this.zoomIconWhenDragInside
                      : 0.8
                }
              ]
            }}
          >
            <FastImage
              style={styles.imgIcon}
              source={{
                uri:
                  "https://raw.githubusercontent.com/PubNubDevelopers/PubMoji/master/src/Images/wow.gif"
              }}
            />
          </Animated.View>
        </View>

        {/* Icon sad */}
        <View style={styles.viewWrapIcon}>
          {this.currentIconFocus === 5 ? (
            <Animated.View
              style={[
                styles.viewWrapTextDescription,
                {
                  bottom: this.pushTextDescriptionUp,
                  transform: [{ scale: this.zoomTextDescription }]
                }
              ]}
            >
              <Text style={styles.textDescription}>Sad</Text>
            </Animated.View>
          ) : null}
          <Animated.View
            style={{
              marginBottom: this.pushIconSadUp,
              transform: [
                {
                  scale:
                    this.currentIconFocus === 5
                      ? this.zoomIconChosen
                      : this.previousIconFocus === 5
                      ? this.zoomIconNotChosen
                      : this.isJustDragInside
                      ? this.zoomIconWhenDragInside
                      : 0.8
                }
              ]
            }}
          >
            <FastImage
              style={styles.imgIcon}
              source={{
                uri:
                  "https://raw.githubusercontent.com/PubNubDevelopers/PubMoji/master/src/Images/sad.gif"
              }}
            />
          </Animated.View>
        </View>

        {/* Icon angry */}
        <View style={styles.viewWrapIcon}>
          {this.currentIconFocus === 6 ? (
            <Animated.View
              style={[
                styles.viewWrapTextDescription,
                {
                  bottom: this.pushTextDescriptionUp,
                  transform: [{ scale: this.zoomTextDescription }]
                }
              ]}
            >
              <Text style={styles.textDescription}>Angry</Text>
            </Animated.View>
          ) : null}
          <Animated.View
            style={{
              marginBottom: this.pushIconAngryUp,
              transform: [
                {
                  scale:
                    this.currentIconFocus === 6
                      ? this.zoomIconChosen
                      : this.previousIconFocus === 6
                      ? this.zoomIconNotChosen
                      : this.isJustDragInside
                      ? this.zoomIconWhenDragInside
                      : 0.8
                }
              ]
            }}
          >
            <FastImage
              style={styles.imgIcon}
              source={{
                uri:
                  "https://raw.githubusercontent.com/PubNubDevelopers/PubMoji/master/src/Images/angry.gif"
              }}
            />
          </Animated.View>
        </View>
      </Animated.View>
    );
  }


}
