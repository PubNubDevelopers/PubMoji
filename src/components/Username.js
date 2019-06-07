import React, {Component} from 'react';
import Form from 'react-native-form';
import {StyleSheet, Text, View, TextInput, Button} from 'react-native';
import PictureSelection from './PictureSelection';

export default class Username extends Component{
    constructor(props) {
        super(props);
        this.state = { text: '' };
      }

    submitForm = () => {
        const {text} = this.state;
        if(text.length > 16){
            alert('Username should be less than 16 characters');
        }
        else{
            return <PictureSelection />
        }
    }

    render() {
        const {text} = this.state;
        const isEnabled = (text.length > 0) ? true : false;
        return (
        <View style={styles.container}>
          <Text style={styles.text}>PubMoji</Text>
            <Form ref="form">
                <TextInput 
                    type="TextInput" 
                    name="myTextInput" 
                    placeholder='Enter your username' 
                    style={styles.textInput}
                    value={this.state.text}
                    onChangeText={(text) => this.setState({text})}                 
                />
                <Button 
                    disabled={!isEnabled} 
                    type="button" 
                    name="myButton" 
                    title="Next"
                    onPress={this.submitForm} 
                />   
            </Form>            
        </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',   
      backgroundColor: 'white'
    },
    text: {
        fontFamily: 'proxima-nova',
      //   ,
        color: 'rgb(208,33,41)',  
        fontSize: 80,
        fontWeight: 'bold',
      },  
    textInput: {
        height: 50,
        borderWidth: 1,
        borderColor: 'black',
        paddingLeft: 20,
        margin: 10,
        borderRadius: 5 
    },
});
