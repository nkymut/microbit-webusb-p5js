/*
 * @name WebUSB RGB Control
 * @description This example sends and receives multiple values to micro:bit over WebUSB. 
 *  Using microbit-webusb library. https://github.com/bsiever/microbit-webusb
 */
let connectBtn;


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
  
  //Connect/Disconnect Buttons
  connectBtn = createButton("connect");
  connectBtn.position(20,height-30);
  connectBtn.mousePressed(connect);
  connectBtn.style("width:180px");
  
  disconnectBtn = createButton("disconnect");
  disconnectBtn.position(200,height-30);
  disconnectBtn.mousePressed(disconnect);
  disconnectBtn.style("width:180px");

  // Red Slider
  sliderR = createSlider(0,255);
  sliderR.position(width/2 - 175, 10);
  sliderR.changed(sliderInput);
  sliderR.style("width:350px");

  // Green Slider
  sliderG = createSlider(0,255);
  sliderG.position(width/2 - 175, 35);
  sliderG.changed(sliderInput);
  sliderG.style("width:350px");
  
  // Blue Slider
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
  uBitSend(connectedDevice,data);
  }else{
    print("device not connected!");
  }
}

function connect() {
  uBitConnectDevice(uBitEventHandler);

}

function disconnect() {
  //connectedDevice.close();
  uBitDisconnect(connectedDevice);

}

function handleData(data){
  
  //received data as a text string
  let recvText = data.data;
  print(recvText); // "R,G,B"
  
  //split the text into a value array and convert to integer numbers. 
  //"R,G,B" -> value[0] = R value[1] = G value[2] = B
  let value = int(recvText.split(",")); 
  print(value);
  
  //map value range from microbit's accelerometer(-1023,1023) to RGB color(0,255)
  //and assign values to RGB color variables. 
  R = map(value[0],-1023,1023,0,255);
  G = map(value[1],-1023,1023,0,255);
  B = map(value[2],-1023,1023,0,255);
  
  //change slider position to assigned value
  sliderR.value(R);
  sliderG.value(G);
  sliderB.value(B);
  
}


