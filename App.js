/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 * @lint-ignore-every XPLATJSCOPYRIGHT1
 */

import React, {Component} from 'react';
import {Platform, StyleSheet,TouchableOpacity, Text, View,Image,Button,Alert,ToastAndroid,StatusBar,AppState} from 'react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';
import {Header} from 'react-native-elements';
import SwitchSelector from 'react-native-switch-selector';

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
    console.log("again");
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
let positionValue = 1;

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
        console.log(Date.now());
        if(fireDate){
          console.log(positionValue);
          if(fireDate.getTime() - Date.now() < 3600000){
            fetchData((res) => {
              if((positionValue === 1 &&(((new Date(res.data.time[0]*1000)).getDay()) !== ((new Date(res.data.currentTime*1000)).getDay())))||(positionValue === 2 &&(((new Date(res.data.time2[0]*1000)).getDay()) !== ((new Date(res.data.currentTime*1000)).getDay())))){
                ReactNativeAN.cancelAllNotifications();
                ReactNativeAN.deleteAlarm("12345");
                ReactNativeAN.stopAlarm();
                BackgroundJob.cancel({jobKey:'backgroundDownloadTask'})
                ToastAndroid.show("闹钟已自动取消",ToastAndroid.SHORT);
                ReactNativeAN.sendNotification({
                  id: "123",                                  // Required
                  title: "闹钟已被取消",               // Required
                  message: "您的闹钟已被自动取消",           // Required
                  channel: "my_channel_id",                     // Required. Same id as specified in MainApplication's onCreate method
                  ticker: "My Notification Ticker",
                  auto_cancel: true,                            // default: true
                  vibrate: false,
                  vibration: 0,                               // default: 100, no vibration if vibrate: false
                  small_icon: "ic_launcher",                    // Required
                  large_icon: "ic_launcher",
                  play_sound: false,
                  sound_name: null,                             // Plays custom notification ringtone if sound_name: null
                  color: "black",
                  schedule_once: true,                          // Works with ReactNativeAN.scheduleAlarm so alarm fires once
                  tag: 'some_tag',
                })
              }
            })
          }
          else{
            console.log('时间还很早');
          }
        }
        else{
          console.log('尚未选取时间');
        }
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
    btnDisabled:false,
    paoStringColor:'#333333',
    showTimeColor:'#C7C7C7',
    btnString:'点击以选取一个时间',
    positionBtn:{
      xianlin:true,
      paipaipai:false
    }
  };

  _fetch = (value = positionValue) => {
    this.setState({
      paoString:"查询中。。。"
    })
    fetchData((res) => {
      if(res.data.time.length ===0){
        this.setState({
          paoString:"服务器似乎开小差惹...",
          paoStringColor:"#333333"
        })
      }
      else{
        switch(value){
          case 1:
            if(((new Date(res.data.time[0]*1000)).getDay()) === ((new Date(res.data.currentTime*1000)).getDay())){
              this.setState({
                paoString:"今天要跑操",
                paoStringColor:'#B22222'
              })
            }
            else{
              this.setState({
                paoString:"今天不跑操",
                paoStringColor:"#9ACD32"
              })
            };
            break;
          case 2:
            if(((new Date(res.data.time2[0]*1000)).getDay()) === ((new Date(res.data.currentTime*1000)).getDay())){
              this.setState({
                paoString:"今天要跑操",
                paoStringColor:'#B22222'
              })
            }
            else{
              this.setState({
                paoString:"今天不跑操",
                paoStringColor:"#9ACD32"
              })
            }
        }
      }
    });
  }
  _showDateTimePicker = () => this.setState({ isDateTimePickerVisible: true });
  _hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false });
  _handleDatePicked = (date) => {
    let isTomorrow=String();
    if(date.getTime() < (Date.now())){
      date= new Date(date.setTime(date.getTime() + 86400000));//若设定的时间小于当前时间，则将时间向后推一天
      isTomorrow="明天";
    }
    this.setState({
      selectTime:date,
    });
    fireDate=date;
    ReactNativeAN.scheduleAlarm(setAlarmNotifData(this.state.selectTime));
    this.setState({
      btnDisabled:true
    })
    this.setState({
      showTimeColor:'#000000'
    });
    Alert.alert(
      '请注意👇',
      `闹钟将于 ${isTomorrow} ${+date.getHours()+':'+date.getMinutes()} 响铃,若那时不需要跑操,闹钟将自动取消.为了避免未知的意外,请不要将程序退出或清除后台`,
      [
        {text:'好的',onPress: () => {ToastAndroid.show("闹钟已生效",ToastAndroid.SHORT);}}
      ],
      {cancelable:false}
    );
    this.setState({
      btnString:"时间已选取"
    })
    BackgroundJob.schedule({
      jobKey: "backgroundDownloadTask",//后台运行任务的key
      period: 500,                     //任务执行周期   500 => 5秒一次
      exact: true,                     //安排一个作业在提供的时间段内准确执行
      allowWhileIdle: true,            //允许计划作业在睡眠模式下执行
      allowExecutionInForeground: true,//允许任务在前台执行
    });
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
    this._fetch();
    AppState.addEventListener('change',(nextState) => {
      if(nextState === 'active'){
        this._fetch(positionValue);
      }
    })
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
        <StatusBar translucent={true} backgroundColor='#1874CD'/>
        <Header 
          placement="center"
          centerComponent={{ text: 'MR Alarm', style: { color: '#fff' ,fontSize:30} }}
          containerStyle={{
            backgroundColor:'#1874CD',
            shadowColor:'black'
          }}
        />
        <Text style={{
          fontSize:30,
          marginTop:100,
          marginBottom:20,
          color:this.state.paoStringColor
        }} >{this.state.paoString}</Text>
        <Text style={{
          marginBottom:5
        }}>我在哪个校区:</Text>
        <SwitchSelector
          options={[
            {label:"仙林",value:1},
            {label:"牌牌牌楼",value:2}
          ]}
          initial={0}//这是指options中的第几个,而不是value
          onPress={value => {
            positionValue=value
            this._fetch();
          }}
          style={{
            width:200,
            marginBottom:30
          }}
          selectedColor={'white'}
          buttonColor={'#1874CD'}
          borderColor={'#1874CD'}
          borderRadius={10}
          hasPadding={true}
          // disabled={true}
        />
        <Button disabled={this.state.btnDisabled}
          style={styles.btn}
          title={this.state.btnString} 
          onPress={this._showDateTimePicker}/>
        <DateTimePicker style='marginTop:30'
          isVisible={this.state.isDateTimePickerVisible}
          onConfirm={this._handleDatePicked}
          onCancel={this._hideDateTimePicker}
          mode='time'
          is24Hour={true}
        />
        <Text style={{
          textAlign:'center',
          color:this.state.showTimeColor,
          fontSize:45,
          borderWidth:3,
          marginTop:30,
          borderColor: this.state.showTimeColor,
        }}>{parseTimeNum(this.state.selectTime.getHours())+":"+parseTimeNum(this.state.selectTime.getMinutes())}</Text>
        <Image source ={pic} style={{width:109,height:100}}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
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
  btn:{
    marginBottom:30
  }
});
