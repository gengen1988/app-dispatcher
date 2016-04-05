# APP Dispatcher

APP Dispatcher 会查询 Context Stack，根据当前的系统上下文，把消息发到相应的作用域中。

本文中，作用域、上下文、应用 ID 是同一个值

## 系统输入

这个事件来源于其他系统的输入，payload 具体由其他系统指定

* MQTT topic: input.system.*

如果当前作用域不为空，则将该消息路由至 Node-RED 中。否则发到默认 topic 处理。如果被 Node-RED 拒绝，也会发送到默认逻辑中。

## 用户输入

这个事件来源于其他系统的输入，payload 具体由其他系统指定

* MQTT topic: input.user.*

如果被 Node-RED 拒绝，则不发到默认逻辑中。

## 默认处理逻辑

系统中可能存在多个默认处理程序，这里的是运行在 APP Dispatcher 中的默认处理逻辑

### 应用启动

将消息送到 Context Stack 的启动应用接口中

* MQTT topic: default.input.system.startup
* payload: 如下

key   | value  | description
----- | ------ | ----------
appId | string | 要启动的应用 ID

## 相关 Node-RED node

在应用中，可以通过以下 Node-RED node 与 APP Dispatcher 交互

## APP Dispatcher Input Node-RED node

Node-RED 的输入节点。

APP Dispatcher Input Node-RED node 是每个应用输入的触发条件。这个节点配置了输入属于哪个作用域。

应用上架时，应用商店会检查提交的应用的全部 APP Dispatcher Input Node-RED node。如果发现这些节点配置的作用域与应用的 ID 不匹配，则拒绝上架。

## APP Dispatcher Acknowledgement Node-RED node

Node-RED 输出节点。

当 Node-RED msg 到达该节点时，代表消息已经被处理。

## APP Dispatcher Rejection Node-RED node

Node-RED 输出节点。

当 Node-RED msg 到达该节点时，代表消息应该被系统处理。

## APP shutdown Node-RED node

Node-RED 的输出节点。

会调用 Context Stack 的结束应用接口。终止当前正在运行的应用。

# Context Stack

系统上下文栈，用于执行应用的启动命令与结束命令。同时允许查询当前正在运行的应用。

## 启动应用接口

启动一个应用

* MQTT topic: contextstack.startup
* payload: 如下

key   | value  | description
----- | ------ | -----------
appId | string | 启动的应用的作用域

## 结束应用接口

结束当前应用

* MQTT topic: contextstack.shutdown
* payload: 无

## 查询接口

查询当前正处于哪个应用中

* MQTT topic: contextstack.getcurrentcontext
* payload: 无
