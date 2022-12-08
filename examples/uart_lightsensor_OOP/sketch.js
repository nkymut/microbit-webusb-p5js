
/*
 * @name WebUSB Control bulb object with lightsensor value (OOP version)
 * @description This example receives lightsensor value from micro:bit over WebUSB. 
 *  Using microbit-webusb library. https://nkymut.github.io/microbit-webusb-p5js/
 
 Setup: 
 1. Upgrade Micro:bit to latest firmware (above version 249) 
    [Updating your micro:bit firmware](https://microbit.org/guide/firmware/)

 2. Program the Micro:bit with one of the example programs that generates serial data
[micro:bit code](https://makecode.microbit.org/_c5iHFsERyPhr)

 */


//The Bulb object
let bulb;

let connectBtn;
let disconnectBtn;

let microBit;

function setup() {
  createCanvas(400, 400);
  
  microBit = new uBitWebUSB();

  microBit.onConnect(function(){
    console.log("connected");
  });

  microBit.onDisconnect(function(){
    console.log("disconnected");
  });

  // microBit.setReceiveUARTCallback(function(data){
  //   console.log("UART received",data);
  //   receivedText = data;
  //   print(bulb);
  //   bulb.brightness = int(data);
  // });


  microBit.setReceiveUARTCallback(handleData);

  connectBtn = createButton("connect");
  connectBtn.style("width:200px;height:30px");
  connectBtn.mousePressed(connect);

  disconnectBtn = createButton("disconnect");
  disconnectBtn.style("width:200px;height:30px");
  disconnectBtn.mousePressed(disconnect);
  
  
  bulb = new Bulb("images/bulb_on.png","images/bulb_off.png");
  
}

function draw() {
  background(200);
  fill(0);
  
  //Check whether brightness is 0:off or 1:on.
  bulb.draw(50,50,300,300);
 
  
}

function connect() {
  microBit.connectDevice();

}

function disconnect() {
  //connectedDevice.close();
  microBit.disconnectDevice();

}


function send(data){
  // if(connectedDevice != null){
  //   sendText = "sent: "+data; 
  //   uBitSend(connectedDevice,data);
  // }else{
  //   print("device not connected!");
  // }
}


function handleData(data){
  print(data);
  recvText = "recv: "+ data;
  bulb.brightness = int(data);
  
}