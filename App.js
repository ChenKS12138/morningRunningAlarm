/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 * @lint-ignore-every XPLATJSCOPYRIGHT1
 */

import React, {Component} from 'react';
import {Platform, StyleSheet,TouchableOpacity, Text, View,Image} from 'react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

type Props = {};
export default class App extends Component<Props> {
  state = {
    isDateTimePickerVisible: false,
    selectTime: new Date()
  };

  _showDateTimePicker = () => this.setState({ isDateTimePickerVisible: true });

  _hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false });

  _handleDatePicked = (date) => {
    this.setState({
      selectTime:date
    });
    this._hideDateTimePicker();
  };

  render() {
    let pic={
      uri:"http://b394.photo.store.qq.com/psb?/V14XRS3d4HjYJC/sB.R0bG2xkBiTtSi095CASruF1WKEnuvTvSVKeCTjxM!/b/dIoBAAAAAAAA&bo=gAKAAoACgAIRECc!"
    };
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>欢迎使用Morning Running Alarm</Text>
        <Text style={styles.instructions}>您需要选取一个时间</Text>
        <TouchableOpacity onPress={this._showDateTimePicker}>
          <Text style={styles.showTime}>{this.state.selectTime.getHours()+':'+this.state.selectTime.getMinutes()}</Text>
        </TouchableOpacity>
        <DateTimePicker style='marginTop:30'
          isVisible={this.state.isDateTimePickerVisible}
          onConfirm={this._handleDatePicked}
          onCancel={this._hideDateTimePicker}
          mode='time'
          is24Hour={true}
        />
        <Image source ={pic} style={{width:109,height:100}}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  showTime:{
    textAlign:'center',
    color:'black',
    fontSize:40
  }
});
