# MQTT topics

payload 如无特殊说明，均为 json

## 设备输入

设备输入指的是，可以被重定向的操作。

其中，`input.system.*` 的具有默认处理程序。`input.user.*` 的没有默认处理程序。

### input.system.keydown

向 APP Dispatcher 发送的按钮按下事件

**payload**

key     | value | description
------- | ----- | ----------
keyCode | int   | 按键码

### input.system.begincontext

向 APP Dispatcher 发送的启动应用消息

**payload**

key   | value  | description
----- | ------ | ----------
appId | string | 要启动的应用

### input.system.endcontext

向 APP Dispatcher 发送的结束当前应用消息

### input.user.unrecognizedvoice
向 APP Dispatcher 发送的用户麦克风输入消息

**payload**

key  | value  | description
---- | ------ | ----------
file | string | 音频文件存储的位置

## 默认处理程序

默认处理程序是指，某个 `input.system.*` 消息没有被处理后，执行的默认动作。

### default.input.system.keydown
向默认处理程序发送的按钮事件

**payload**

key     | value | description
------- | ----- | ----------
keyCode | int   | 按键码

### default.input.system.begincontext

向默认处理程序发送的启动应用消息

**payload**

key   | value  | description
----- | ------ | ----------
appId | string | 要启动的应用

### default.input.system.endcontext

向默认处理程序发送的结束当前应用消息

## native app 交互

与某个 native app 交互的接口

### device.shutdown

关机

### device.reboot

重启

### contextstack.begin

向 Context Stack 发送的启动应用消息

**payload**

key   | value  | description
----- | ------ | ----------
appId | string | 要启动的应用

### contextstack.end

向 Context Stack 发送的结束当前应用消息

### contextstack.getcurrentcontext.request

向 Context Stack 发送的查询当前作用域请求

**payload**

key    | value  | description
------ | ------ | -------------
ticket | string | 用于区分操作的唯一标识，UUID

### contextstack.getcurrentcontext.response

Context Stack 发送的查询结果回应

**payload**

key    | value  | description
------ | ------ | -------------
ticket | string | 用于区分操作的唯一标识，UUID
appId  | string | 当前正在运行的应用

### text2speech.do.request

向 text to speech 处理程序发送的请求

**payload**

key    | value  | description
------ | ------ | -----------------------
ticket | string | 用于区分操作的唯一标识，UUID
text   | string | 要生成语音的文本信息

### text2speech.do.response

text to speech 处理程序返回的内容

**payload**

key    | value  | description
------ | ------ | -----------------------
ticket | string | 用于区分操作的唯一标识，UUID
text   | string | 要生成语音的文本信息
file   | string | 生成完毕后的文件位置

### speech2text.do.request

向 speech to text 处理程序发送的请求

**payload**

key    | value  | description
------ | ------ | -----------------------
ticket | string | 用于区分操作的唯一标识，UUID
file   | string | 要识别的音频文件位置

### speech2text.do.response

text to speech 处理程序返回的内容

**payload**

key    | value  | description
------ | ------ | -----------------------
ticket | string | 用于区分操作的唯一标识，UUID
file   | string | 要识别的音频文件位置
text   | string | 识别结果

### appdispatcher.acknownledgement

确认回执。APP Dispatcher 收到这个消息后，会解除超时事件。

APP Dispatcher 向 APP Dispatcher Input Node-RED node 发送信息时，会加入 ticket

**payload**

root

key     | value  | description
------- | ------ | -----------------------
ticket  | string | 标明消息的 ID
topic   | string | 消息的名称，如：input.system.keydown
payload | string | 消息的 payload

### appdispatcher.rejection

拒绝回执。APP Dispatcher 收到这个消息后，会解除超时事件。同时，向 MQTT 中发布事件对应的默认处理消息。

例如：

input.system.keydown 在收到 rejection 后。会发送 default.input.system.keydown

**payload**

key     | value  | description
------- | ------ | -----------------------
ticket  | string | 标明消息的 ID
topic   | string | 消息的名称，如：input.system.keydown
payload | string | 消息的 payload

## 硬件输出

本质来讲和 native app 交换一样。不过效果是操作的外部硬件执行器。

### output.led.set

操作 led 的事件

**payload**

key | value   | description
--- | ------- | -------------
id  | string  | 要操作的 LED ID
on  | boolean | 开关状态

### output.led.get.request

查询 led 的状态

**payload**

key    | value  | description
------ | ------ | -----------------------
ticket | string | 用于区分操作的唯一标识，UUID
id     | string | 要操作的 LED ID

### output.led.get.response

查询 led 的状态，返回结果

**payload**

key    | value   | description
------ | ------- | -----------------------
ticket | string  | 用于区分操作的唯一标识，UUID
id     | string  | 要操作的 LED ID
on     | boolean | 开关状态

### output.motor.set

操作电机。可以是直流电机，也可以是步进电机。

**payload**

key    | value   | description
------ | ------- | ------------
id     | string  | 电机的 ID
rotate | integer | 步进电机转动的角度
speed  | integer | 速度。正负为方向。0 为停止

### output.motor.get.request

查询电机的状态

**payload**

key    | value   | description
------ | ------- | -----------------------
ticket | string  | 用于区分操作的唯一标识，UUID
id     | string  | 查询的电机 ID

### output.motor.get.response

电机查询结果

**payload**

key       | value   | description
--------- | ------- | -----------------------
ticket    | string  | 用于区分操作的唯一标识，UUID
id        | string  | 查询的电机 ID
speed     | integer | 速度。0 为停止
