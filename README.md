## 根据关键字获取微博指数

早期版本以常规的构造cookie,token,[sign](https://github.com/cclient/tmallSign)的访问api的方式实现，因官方改版失效

移动端web逆向反而比桌面端简单，并没有涉及到token,sign,http请求方式已经实现，公司采用直接的http请求，代码就不方便公开了，一共也就不到50行。

这里主要是尝试另处一种思路，以headless的方式来实现(虽然没必要)

### 选型

#### [phantomjs](https://github.com/ariya/phantomjs)

之前写过些 新浪账号批量自动登录 [自动化工具](https://github.com/cclient/sina_multi_account_login)，开发体验很差

主要缺点

* 1:原生功能有限，又难以引入第三方包，要实现相对复杂的功能，成本很高，如需第三方包支持。
  * 1:引入第三方包需重新编译，小题大作；
  * 2:将系统功能拆分，如拆为c/s结构，原生作为s，需第三方包控制的部分统一集成在c中，这也是曾经选择的方式，因为逻辑被拆散了，开发上不是很直观。

* 2:语法只支持es5,15,16年倒无所谓，现在则难以接受了，不支持async/await,开发效率低

### [electron](https://github.com/electron/electron)

`Electron is designed for UI applications and not for command-line applications.`官方不推荐,服务端的场景也觉得过重，不方便在服务器上部署

### [chrome extensions](https://developer.chrome.com/extensions)

之前改写过 网易有道的插件 [chrome-extensions-youdaowithwordnode](https://github.com/cclient/chrome-extensions-youdaowithwordnode)

桌面写点辅助的小工具还好，但不适合在服务器上，或许有在服务器上执行的方案，会多花不少功夫

### [puppeteer](https://github.com/GoogleChrome/puppeteer/)

支持[chrome-devtools-protocol](https://github.com/ChromeDevTools/awesome-chrome-devtools#chrome-devtools-protocol)的工具有不少，以前也用过一些，这里选择puppeteer，因为chrome官方支持

资料少，[文档](https://github.com/GoogleChrome/puppeteer/blob/v1.5.0/docs/api.md#class-response)很精简

要实现的功能也很简单，简单浏览一遍文档，需要的功能都具备

实现起来很容易,开发时在[https://try-puppeteer.appspot.com/](https://try-puppeteer.appspot.com/)就把功能实现完了

再拿到本地作个封装，工作就完成

开发效率上强过phantomjs和electron

最大的缺点反而不是开发，而是部署和服务管理，性能消耗较重，也会有额外的依赖，好在docker能减轻依赖问题，同时也会有些其他限制

如果对性能有要求，资源有限，还是得phantomjs

##### 执行方式两种

* 1 launtch(默认方式)
  
  通过的本地的可执行文件启动chrome实例,在已安装Chrome的mac上可以直接执行，搜索本机的chrome程序实例通信

  getValByWord("世界杯")

* 2 connect(通过远程chrome实例接口调用)

   以chrome-devtools-protoco连接远程实例

  * 1 启动远程实例

   docker run -d -p 9222:9222 --name=chrome-headless [alpeware/chrome-headless-trunk](https://hub.docker.com/r/alpeware/chrome-headless-trunk/)

  * 查看实例接口信息ws(可通过服务启动日志docker logs,或服务状态curl http://127.0.0.1:9222/json 获取)

   docker logs --tail 100 -f chrome-headless

```log
   
Looking for CA certificate in /data/certificates
Keystore created
Fontconfig warning: "/etc/fonts/fonts.conf", line 86: unknown element "blank"
[0730/105014.373363:ERROR:gpu_process_transport_factory.cc(1007)] Lost UI shared context.
DevTools listening on ws://0.0.0.0:9222/devtools/browser/49f5281e-8668-44f5-896f-ee2eee6553ab

```

`ws://0.0.0.0:9222/devtools/browser/49f5281e-8668-44f5-896f-ee2eee6553ab`

或 curl http://127.0.0.1:9222/json

```json
    
[ {
   "description": "",
   "devtoolsFrontendUrl": "/devtools/inspector.html?ws=127.0.0.1:9222/devtools/page/9C81EA41D18B2C20EDC5982B476FF20C",
   "id": "9C81EA41D18B2C20EDC5982B476FF20C",
   "title": "about:blank",
   "type": "page",
   "url": "about:blank",
   "webSocketDebuggerUrl": "ws://127.0.0.1:9222/devtools/page/9C81EA41D18B2C20EDC5982B476FF20C"
} ]

```

`ws://127.0.0.1:9222/devtools/page/9C81EA41D18B2C20EDC5982B476FF20`

    ws://127.0.0.1:9222/devtools/page/9C81EA41D18B2C20EDC5982B476FF20C 和 ws://0.0.0.0:9222/devtools/browser/49f5281e-8668-44f5-896f-ee2eee6553ab都可以
    

    调用远程实例调试接口
    
    getValByWord("世界杯","ws://0.0.0.0:9222/devtools/page/9C81EA41D18B2C20EDC5982B476FF20C")
