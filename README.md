#这是个使用React Native开发的应用
###(目前只对Android平台进行了适配)
用户可以使用它设定一个闹钟，并且这个闹钟可以在后台获取服务器端的信息，决定是否自动地取消闹钟。
[服务器端代码的仓库](https://github.com/ChenKS12138/aifuwu_scrapy)
##我该怎么使用?
首先确保本地安装有 node 和 npm
再安装React Native 的cli
```bash
npm install react-native -g
```
然后再下载依赖

```bash
npm install
```
待连接好Android设备(并打开开发者模式)或打开AVD，运行
```bash
npm run android
```
应用将会被安装至设备中
##我该怎么调试我的代码?
在设备中按menu键选择`Debug JS Remotely`或在终端中输入
```bash
adb logcat *:S ReactNative:V ReactNativeJS:V
```
##我还应该注意些什么?
在Windows环境下，下载依赖后,为了避免位置的错误还需要手动做一些更改，将`/android/settings.gradle`中的`\`替换为`/`
