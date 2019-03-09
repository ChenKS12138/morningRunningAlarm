/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 * @lint-ignore-every XPLATJSCOPYRIGHT1
 */

import React, {Component} from 'react';
import {Platform, StyleSheet,TouchableOpacity, Text, View,Image,Button} from 'react-native';
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

const fetchData= async (callback) => {
  let response = await fetch('http://47.106.250.72:3001');
  response = await response.json();
  if(response.ret === 201){
    return fetchData();
  }
  else{
    if(callback){
      callback(response);
    }
    return response;
  }
}

const parseTimeNum = (rawString) => {
  return rawString<10?'0'+String(rawString):String(rawString);
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
let fireDate=null;

if(Platform.OS === 'android'){
  const backgroundJob = {
      jobKey: "backgroundDownloadTask",
      job: () => {
        console.log(fireDate);
        fetchData((res) => {
          console.log(res.data.time[0]);
          if(((new Date(res.data.time[0]*1000)).getDay()) !== ((new Date(res.data.currentTime*1000)).getDay())){
            ReactNativeAN.cancelAllNotifications();
            ReactNativeAN.deleteAlarm("12345");
            ReactNativeAN.stopAlarm();
          }
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
    paoString:'查询中。。。',
    btnDisabled:true
  };

  _showDateTimePicker = () => this.setState({ isDateTimePickerVisible: true });

  _hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false });

  _handleDatePicked = (date) => {
    // console.log(date.getTime());
    console.log(new Date().getTime())
    if(date.getTime() < (new Date().getTime())){
      date= new Date(date.setTime(date.getTime() + 86400000));//若设定的时间小于当前时间，则将时间向前推进一天
    }
    this.setState({
      selectTime:date,
    });
    fireDate=date;
    ReactNativeAN.scheduleAlarm(setAlarmNotifData(this.state.selectTime));
    this.setState({
      btnDisabled:false
    })
  };
  _resetClick = () => {
    ReactNativeAN.cancelAllNotifications();
    ReactNativeAN.deleteAlarm("12345");
    ReactNativeAN.stopAlarm();
    this.setState({
      selectTime:new Date(),
      isDateTimePickerVisible:true
    });
    fireDate=null;
    this._showDateTimePicker();
  }

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
      period: 500,                     //任务执行周期   500 => 5秒一次
      exact: true,                     //安排一个作业在提供的时间段内准确执行
      allowWhileIdle: true,            //允许计划作业在睡眠模式下执行
      allowExecutionInForeground: true,//允许任务在前台执行
    });
    fetchData((res) => {
      if(res.data.time.length ===0){
        this.setState({
          paoString:"服务器似乎开小差惹..."
        })
      }
      else if(((new Date(res.data.time[0]*1000)).getDay()) === ((new Date(res.data.currentTime*1000)).getDay())){
        this.setState({
          paoString:"今天要跑操"
        })
      }
      else{
        this.setState({
          paoString:"今天不跑操"
        })
      }
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
        <Text style={styles.welcome}>欢迎使用</Text>
        <Text style={styles.appName}>Morning Running Alarm</Text>
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
        <Button disabled={this.state.btnDisabled} style={styles.reset} title="RESET" onPress={this._resetClick}/>
        <Text style={styles.paoString}>{this.state.paoString}</Text>
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
    fontSize: 30,
    textAlign: 'center',
    margin: 5,
  },
  appName:{
    fontSize: 32,
    textAlign: 'center',
    margin: 5,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginTop: 10,
  },
  showTime:{
    textAlign:'center',
    color:'black',
    fontSize:45
  },
  paoString:{
    fontSize:30,
    marginBottom:30
  }
});
