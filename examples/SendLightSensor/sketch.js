
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
  bulbOn: "",
  bulbOff: "",
  on: function() {
    this.brightness = 255;
  },
  off: function() {
    this.brightness = 0
  },
  draw: function(xPos, yPos, width, height) {
    if (this.brightness > 0) {
      //show bulbOn image
      tint(this.brightness);
      image(this.bulbOn, xPos, yPos, width, height);
    } else {
      //shoe bulbOff image
      tint(255);
      image(this.bulbOff, xPos, yPos, width, height);
    }
  }
}

// Buttons to connect/disconnect to micro:bit
let connectBtn;
let disconnectBtn;

function setup() {
  createCanvas(400, 400);
  
  //add connect button
  connectBtn = createButton("connect");
  connectBtn.mousePressed(connect);
  //add disconnect button
  disconnectBtn = createButton("disconnect");
  disconnectBtn.mousePressed(disconnect);
  

  //add bulbOn/bulbOff images as properties
  bulb.bulbOn = loadImage("images/bulb_on.png");
  bulb.bulbOff = loadImage("images/bulb_off.png");

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

//connect to micro:bit
function connect() {
  uBitConnectDevice(uBitEventHandler);

}

//disconnect to micro:bit
function disconnect() {
  //connectedDevice.close();
  uBitDisconnect(connectedDevice);

}


function handleData(data){
  //print(data);
  let val = int(data.data);
  bulb.brightness = val;
  
  
  
  fadeSlider.value(bulb.brightness);
}






