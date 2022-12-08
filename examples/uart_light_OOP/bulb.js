/* Bulb Class

properties:
- bulbOnImageImg : an image when bulb is on
- bulbOffImageImg : an image when bulb is off
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
    this.bulbOnImage = loadImage(onImageFile);
    this.bulbOffImage = loadImage(offImageFile);
    // properties to store brightness of the bulb
    this.brightness = 0;
  }
  
  //draw the bulb image
  draw(xPos,yPos,width,height){
    
  
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