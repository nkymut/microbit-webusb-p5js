/*
 * @name WebUSB RGB Control
 * @description This example sends and receives multiple values to micro:bit over WebUSB. 
 *  Using microbit-webusb library. https://github.com/bsiever/microbit-webusb
 
 Setup: 
 1. Upgrade Micro:bit to latest firmware (above version 249) 
** [Updating your micro:bit firmware](https://microbit.org/guide/firmware/)

2. Program the Micro:bit with one of the example programs that generates serial data
[micro:bit code](https://makecode.microbit.org/_c5iHFsERyPhr)

 */

let connectBtn;
let disconnectBtn;


let microBit;

let sliderR;
let sliderG;
let sliderB;

let brightness = 0;
let sendText = "sent:";
let recvText = "recv:";

let R = 0;
let G = 0;
let B = 0;


function setup() {
  createCanvas(400, 400);

  microBit = new uBitWebUSB();

  microBit.onConnect(function(){
    console.log("connected");
  });

  microBit.onDisconnect(function(){
    console.log("disconnected");
  });


  microBit.setUARTCallback(handleData);


  // connectBtn = createButton("connect");
  // connectBtn.position(20,height-30);
  // connectBtn.mousePressed(connect);
  // connectBtn.style("width:360px");


  connectBtn = createButton("connect");
  connectBtn.style("width:200px;height:30px");
  connectBtn.mousePressed(connect);

  disconnectBtn = createButton("disconnect");
  disconnectBtn.style("width:200px;height:30px");
  disconnectBtn.mousePressed(disconnect);
  

  // 
  sliderR = createSlider(0,255);
  sliderR.position(width/2 - 175, 10);
  sliderR.changed(sliderInput);
  sliderR.style("width:350px");

  // 
  sliderG = createSlider(0,255);
  sliderG.position(width/2 - 175, 35);
  sliderG.changed(sliderInput);
  sliderG.style("width:350px");
  
  // 
  sliderB = createSlider(0,255);
  sliderB.position(width/2 - 175, 60);
  sliderB.changed(sliderInput);
  sliderB.style("width:350px");
}

function draw() {
  background(color(R,G,B));
  fill(255);
  textSize(32);
  text(sendText,20,100);
  text(recvText,20,125);
  
  //colorMode(HSB, 255);
  
  // ellipse(r,g,b);
}

function sliderInput(){
  //print(slider.value());
  R = sliderR.value();
  G = sliderG.value();
  B = sliderB.value();
  let sendData = R + "," + G + "," + B;
  send(sendData);

}

function send(data){
  if(connectedDevice != null){
  sendText = "sent: "+data; 
  microBit.uBitSend(data);
  }else{
    print("device not connected!");
  }
}


function connect() {
  microBit.connectDevice();

}

function disconnect() {
  //connectedDevice.close();
  microBit.disconnectDevice();

}


function handleData(data){
  //print(data);
  recvText = "recv: "+ data;
  
  
}



// Example event call-back handler
function uBitEventHandler(reason, device, data) {
  switch (reason) {
    case "connected":
      if(CONSOLE_LOG) print("connected");
      //      consolePrintln("<b>Connected!</b>")
      connectedDevice = device;
      //connectBtn.html("disconnect");
      //connectBtn.mousePressed(disconnectMicrobit);
      break
    case "disconnected":
      if(CONSOLE_LOG) print("disconnected");
      //connectBtn.html("connect");
      //connectBtn.mouseClicked(connectMicrobit);
      // 
      //      consolePrintln("<b>Disconnected</b>")
      connectedDevice = "";

      break
    case "connection failure":
      if(CONSOLE_LOG) print("connection failure");
      //      consolePrintln("<b>Connection Failure</b>")
      break
    case "error":
      if(CONSOLE_LOG) print("error");
      // consolePrintln("<b>Error</b>")
      break
    case "console":

      if(CONSOLE_LOG) print("Console Data: " + data.data)
      handleData(data);
      break
    case "graph-event":
      if(CONSOLE_LOG) print(`Graph Event:  ${data.data} (for ${data.graph}${data.series.length?" / series "+data.series:""})`)
      break
    case "graph-data":
      if(CONSOLE_LOG) print(`Graph Data: ${data.data} (for ${data.graph}${data.series.length?" / series "+data.series:""})`)
      break
  }
}