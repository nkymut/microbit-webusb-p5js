# microbit-webusb-p5js
A javascript library to interact with [BBC micro:bit](http://microbit.org/) using web usb API.

Based on the library created by [bsiever/microbit-webusb](https://github.com/bsiever/microbit-webusb) and updated to provide the same API for UART properties as [nkymut/microbit-webble-p5js](https://github.com/nkymut/microbit-webble-p5js) and enabled easy transition from WebUSB to WebBluetooth  development interoperability.

# Setup

1. Upgrade Micro:bit to latest firmware (above version 249) 
** [Updating your micro:bit firmware](https://microbit.org/guide/firmware/)

2. Program the Micro:bit with one of the example programs that generates serial data
3. Setup a Web Server & Open the project's page to run the sample application.
   [VSCode](https://code.visualstudio.com/) + [Live Server Extention](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)


## Constructor

- `microBit=new uBitWebUSB()`


## Properties

- `microBit.connected`

## Functions


- `microBit.connectDevice()`

  Search for WebUSB devices and connect.
　<br><br>example:
  ```js
  connectButton = createButton("connect");
  connectButton.mousePressed(
    function(){
      microBit.searchDevice();
    }
  );
  ```

- `microBit.onConnect(callbackFunction)`

  Register a callback function invoked when the microBit connects

  example:
  ```js
  microBit.onConnect(
    function(){
      console.log("connected");
    }
  );
  ```

- `microBit.onDisconnect(callbackFunction)`

  Register a callback function invoked when the microBit disconnects
 
  example:
  ```js
  microBit.onDisconnect(
    function(){
      console.log("disconnected");
    }
  );
  ```

  - `microBit.setReceiveUARTCallback(callbackFunction)`

  Register a callback function to be invoked when UART data is received.

  example:
  ```js
  microBit.setReceiveUARTCallback(
    function(data){
      console.log("UART received",data);
      receivedText = data;
    }
  );
  ```

- `microBit.writeUARTData(text)`
  
  Send text message to microbit via UART.

  example:
  ```js
  var messageText = "Hello!";
  microBit.writeUARTData(messageText);
  ```

# Examples

## Receive Lightsensor

## Send/Receive Text Message


## Control Neopixel

<!-- ** [p5*js code](https://editor.p5js.org/didny/sketches/cTFjpyKd) -->

** [micro:bit code](https://makecode.microbit.org/_c5iHFsERyPhr)


# References 

* [bsiever/microbit-webusb](https://github.com/bsiever/microbit-webusb):WebUSB Utils for Micro:bit (( [live DEMO](https://bsiever.github.io/microbit-webusb/)

* [micro:bit](https://microbit.org/)
* [p5*js](https://p5js.org/)

