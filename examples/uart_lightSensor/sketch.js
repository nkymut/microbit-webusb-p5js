
/*
 * @name WebUSB Control bulb object with lightsensor value
 * @description This example receives lightsensor value from micro:bit over WebUSB. 
 *  Using microbit-webusb library. https://github.com/bsiever/microbit-webusb
 
 Setup: 
 1. Upgrade Micro:bit to latest firmware (above version 249) 
** [Updating your micro:bit firmware](https://microbit.org/guide/firmware/)

2. Program the Micro:bit with one of the example programs that generates serial data
[micro:bit code](https://makecode.microbit.org/_c5iHFsERyPhr)

 */

//The Bulb object
let bulb = {
  brightness: 0,
  bulbOnImage: "",
  bulbOffImage: "",
  on: function() {
    this.brightness = 255;
  },
  off: function() {
    this.brightness = 0
  },
  draw: function(xPos, yPos, width, height) {
    if (this.brightness > 0) {
      //show bulbOnImage
      tint(this.brightness);
      image(this.bulbOnImage, xPos, yPos, width, height);
    } else {
      //shoe bulbOffImage
      tint(255);
      image(this.bulbOffImage, xPos, yPos, width, height);
    }
  }
}

// Buttons to connect/disconnect to micro:bit
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

  microBit.setReceiveUARTCallback(function(receivedData){
    let val = int(receivedData);
    bulb.brightness = val;
    
    fadeSlider.value(bulb.brightness);
  });

  // microBit.setReceiveUARTCallback(handleData);

  //add connect button
  connectBtn = createButton("connect");
  connectBtn.mousePressed(connect);
  //add disconnect button
  disconnectBtn = createButton("disconnect");
  disconnectBtn.mousePressed(disconnect);
  

  //add bulbOnImage/bulbOffImages as properties
  bulb.bulbOnImage = loadImage("images/bulb_on.png");
  bulb.bulbOffImage = loadImage("images/bulb_off.png");

  //set default brightness  
  bulb.brightness = 0;
  
  //create a slider
  fadeSlider = createSlider(0,255,0,1); //createSlider(MIN,MAX,default,step)
  fadeSlider.style("width","300px");
  fadeSlider.class("slider") // set a CSS class to change appearence.
  fadeSlider.position(50,height - 40);
  fadeSlider.input(fade); // assign fade() function for the callback


}

function draw() {
  background(200);
  fill(0);

  //Check whether brightness is 0:off or 1:on.
  bulb.draw(50, 50, 300, 300);

}

//When a mouse button is pressed
function mousePressed() {
  //switch on the bulb
  bulb.on();
}

//When a mouse button is released
function mouseReleased() {
  //switch off the bulb
  bulb.off();

}

//Fade brightness with the slider value
function fade(){
  brightness = fadeSlider.value();
}

//connect to microBit
function connect() {
  microBit.connectDevice();
}

//disconnect from microBit

function disconnect() {
  microBit.disconnectDevice();
}



function handleData(data){
  //print(data);
  let val = int(data);
  bulb.brightness = val;
  
  fadeSlider.value(bulb.brightness);
}






