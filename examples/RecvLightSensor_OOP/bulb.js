/* Bulb Class

properties:
- bulbOnImg : an image when bulb is on
- bulbOffImg : an image when bulb is off
- brightness: brightness of the bulb 0:off 255:max brightness

methods:
- draw(): draw the bulb image based on the brightness 
- on() : on the bulb (set brightness 255)
- off() : off the bulb (set brightness 0)
- setBrightness(val): set the bulb brighteness to the specified value 

*/

class Bulb { 
  constructor(onImageFile, offImageFile) {
    // properties to store images to show bulb statuses
    this.bulbOn = loadImage(onImageFile);
    this.bulbOff = loadImage(offImageFile);
    // properties to store brightness of the bulb
    this.brightness = 0;
  }
  
  //draw the bulb image
  draw(xPos,yPos,width,height){
    
  
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
  
  //Switch on the bulb
  on(){
    this.brightness = 255;
  }

  //Switch off the bulb
  off(){
    this.brightness = 0;
  }

  //Set the bulb brightness
  setBrightness(val){
    this.brightness = val;
  }

}