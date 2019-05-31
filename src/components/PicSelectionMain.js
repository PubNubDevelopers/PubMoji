import React, {Component} from 'react';
import {StyleSheet, Text, View, TextInput, Button, Alert, Image, TouchableOpacity} from 'react-native';
import PictureSelection from './PictureSelection'

const img1 = require('../../img/favicon.png');
const img2 = require('../../img/apple-logo.png');
const img3 = require('../../img/twitter-logo.png');
const img4 = require('../../img/linkedin-logo.png');
const img5 = require('../../img/microsoft-logo.png');
const img6 = require('../../img/chrome-logo.png');

const imgArrayRowOne = [img1, img2, img3];
const imgArrayRowTwo = [img4, img5, img6];

export default class PicSelectionMain extends Component{
    constructor(props) {
        super(props);
        this.state = { 
            selectedIndexRowOne: -1,
            selectedIndexRowTwo: -1,
        };
        // this.updateIndexOne = this.updateIndexOne.bind(this);
        // this.updateIndexTwo = this.updateIndexTwo.bind(this);
      }

      updateIndexOne = (selectedIndexRowOne) => {
        if(this.state.selectedIndexRowTwo != -1){
            this.setState({selectedIndexRowTwo: -1});;  
        }  
        this.setState({selectedIndexRowOne});
    }

      updateIndexTwo =  (selectedIndexRowTwo) => {
        if(this.state.selectedIndexRowOne != -1){
            this.setState({selectedIndexRowOne: -1});;  
        }  
        this.setState({selectedIndexRowTwo});
    }

    render() {
        const { selectedIndexRowOne } = this.state;
        const { selectedIndexRowTwo } = this.state;

        const isRowOneEnabled = (selectedIndexRowOne  > -1) ? true: false;

        return (
        <View style={styles.container}>
                <View>  
                    <Image
                    source={(isRowOneEnabled) ? imgArrayRowOne[selectedIndexRowOne]:
                            imgArrayRowTwo[selectedIndexRowTwo]         
                    }
                    />

                    <PictureSelection 
                    selectedIndexRowOne={this.state.selectedIndexRowOne}
                    selectedIndexRowTwo={this.state.selectedIndexRowTwo}
                    updateIndexOne={this.updateIndexOne}
                    updateIndexTwo={this.updateIndexTwo}
                    />
                </View>
        </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: 'rgb(208,33,41)'
    },
});

