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

import BackgroundJob from 'react-native-background-job';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

const parseTimeNum = (rawString) => {
  return rawString<10?'0'+String(rawString):String(rawString);
}
let paoString='不知道诶';

const dataParse = (rawDataTime,rawCurrentTime) => {
  // ReactNativeAN.getScheduledAlarms().then(res => {
  //   console.log(res);
  // })
  if(((new Date(rawDataTime*1000)).getDay()) === ((new Date(rawCurrentTime*1000)).getDay())){
    console.log('pao');
    ReactNativeAN.cancelAllNotifications();
    ReactNativeAN.deleteAlarm("12345");
    ReactNativeAN.stopAlarm();
    paoString='今天要跑操';
  }
  else{
    console.log('bu pao');
    paoString='今天不跑操';
  }
}

const setAlarmNotifData=(rawDateObj) => {
  let fireDate=ReactNativeAN.parseDate(rawDateObj);
  return {
    id: "12345",                                  // Required
    title: "My Notification Title",               // Required
    message: "My Notification Message",           // Required
    channel: "my_channel_id",                     // Required. Same id as specified in MainApplication's onCreate method
    ticker: "My Notification Ticker",
    auto_cancel: true,                            // default: true
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
    data: { foo: "bar" },
  }
}

if(Platform.OS === 'android'){
  const backgroundJob = {
      jobKey: "backgroundDownloadTask",
      job: () => {
        fetch('http://47.106.250.72:3001').then(res => {
          res.json().then(res => {
            if(res.ret === 200){
              dataParse(res.data.time[0],res.data.currentTime);
            }
          })
        })
      }
  };
  BackgroundJob.register(backgroundJob);
}

type Props = {};
export default class App extends Component<Props> {
  state = {
    isDateTimePickerVisible: false,
    selectTime: new Date(),
    paoString:paoString
  };

  _showDateTimePicker = () => this.setState({ isDateTimePickerVisible: true });

  _hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false });

  _handleDatePicked = (date) => {
    this.setState({
      selectTime:date
    });
    ReactNativeAN.scheduleAlarm(setAlarmNotifData(this.state.selectTime));
    // ReactNativeAN.sendNotification(setAlarmNotifData(this.state.selectTime));

    
    // ReactNativeAN.cancelAllNotifications();
    // ReactNativeAN.deleteAlarm("12345");
    // ReactNativeAN.stopAlarm();


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

    BackgroundJob.schedule({
      jobKey: "backgroundDownloadTask",//后台运行任务的key
      period: 100,                     //任务执行周期   500 => 5秒一次
      exact: true,                     //安排一个作业在提供的时间段内准确执行
      allowWhileIdle: true,            //允许计划作业在睡眠模式下执行
      allowExecutionInForeground: true,//允许任务在前台执行
    });
  }
    
  componentWillUnmount() {
    DeviceEventEmitter.removeListener('OnNotificationDismissed');
    DeviceEventEmitter.removeListener('OnNotificationOpened');
  }

  render() {
    const pic={
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
        <Text>{paoString}</Text>
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
