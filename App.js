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

import ReactNativeAN from 'react-native-alarm-notification';
import { DeviceEventEmitter } from 'react-native';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

const parseTimeNum = (raw) => {
  return raw<10?'0'+String(raw):String(raw);
}

// let  fireDate = ReactNativeAN.parseDate(new Date(Date.now() + 1000));     // set the fire date for 1 second from now
// let  alarmNotifData = {
// 	id: "12345",                                  // Required
// 	title: "My Notification Title",               // Required
// 	message: "My Notification Message",           // Required
// 	channel: "my_channel_id",                     // Required. Same id as specified in MainApplication's onCreate method
// 	ticker: "My Notification Ticker",
// 	auto_cancel: false,                            // default: true
// 	vibrate: true,
// 	vibration: 2000,                               // default: 100, no vibration if vibrate: false
// 	small_icon: "ic_launcher",                    // Required
// 	large_icon: "ic_launcher",
// 	play_sound: true,
// 	sound_name: null,                             // Plays custom notification ringtone if sound_name: null
// 	color: "black",
// 	schedule_once: true,                          // Works with ReactNativeAN.scheduleAlarm so alarm fires once
// 	tag: 'some_tag',
// 	fire_date: fireDate,                          // Date for firing alarm, Required for ReactNativeAN.scheduleAlarm.

// 	// You can add any additional data that is important for the notification
// 	// It will be added to the PendingIntent along with the rest of the bundle.
// 	// e.g.
//   data: { foo: "bar" },
// };
const setAlarmNotifData=(rawDateObj) => {
  let fireDate=ReactNativeAN.parseDate(rawDateObj);
  return {
    id: "12345",                                  // Required
    title: "My Notification Title",               // Required
    message: "My Notification Message",           // Required
    channel: "my_channel_id",                     // Required. Same id as specified in MainApplication's onCreate method
    ticker: "My Notification Ticker",
    auto_cancel: false,                            // default: true
    vibrate: true,
    vibration: 200,                               // default: 100, no vibration if vibrate: false
    small_icon: "ic_launcher",                    // Required
    large_icon: "ic_launcher",
    play_sound: true,
    sound_name: null,                             // Plays custom notification ringtone if sound_name: null
    color: "black",
    schedule_once: false,                          // Works with ReactNativeAN.scheduleAlarm so alarm fires once
    tag: 'some_tag',
    fire_date: fireDate,                          // Date for firing alarm, Required for ReactNativeAN.scheduleAlarm.

    // You can add any additional data that is important for the notification
    // It will be added to the PendingIntent along with the rest of the bundle.
    // e.g.
    data: { foo: "bar" },
  }
}

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
    // ReactNativeAN.scheduleAlarm(setAlarmNotifData(this.state.selectTime));
    // ReactNativeAN.sendNotification(setAlarmNotifData(this.state.selectTime));
  };

  componentDidMount() {
    DeviceEventEmitter.addListener('OnNotificationDismissed', async function(e) {
      const obj = JSON.parse(e);
      console.log(obj);
      ReactNativeAN.stopAlarm();
    });
  
    DeviceEventEmitter.addListener('OnNotificationOpened', async function(e) {
      const obj = JSON.parse(e);
      console.log(obj);
    });
  }
    
  componentWillUnmount() {
    DeviceEventEmitter.removeListener('OnNotificationDismissed');
    DeviceEventEmitter.removeListener('OnNotificationOpened');
  }

  render() {

    

    let req=new Request('http://47.106.250.72:3001');
    fetch(req).then((response) => {
      let responseJSON=JSON.parse(response._bodyText);
      // console.log(responseJSON);
    })

    let pic={
      uri:"http://b394.photo.store.qq.com/psb?/V14XRS3d4HjYJC/sB.R0bG2xkBiTtSi095CASruF1WKEnuvTvSVKeCTjxM!/b/dIoBAAAAAAAA&bo=gAKAAoACgAIRECc!"
    };
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>欢迎使用Morning Running Alarm</Text>
        <Text style={styles.instructions}>您需要选取一个时间</Text>
        <TouchableOpacity onPress={this._showDateTimePicker}>
          <Text style={styles.showTime}>{parseTimeNum(this.state.selectTime.getHours())+":"+parseTimeNum(this.state.selectTime.getMinutes())}</Text>
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
