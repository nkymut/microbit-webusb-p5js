
/*
 * JavaScript functions for interacting with micro:bit microcontrollers over WebUSB
 * (Only works in Chrome browsers;  Pages must be either HTTPS or local)
 */


const MICROBIT_VENDOR_ID = 0x0d28
const MICROBIT_PRODUCT_ID = 0x0204
const MICROBIT_DAP_INTERFACE = 4

const controlTransferGetReport = 0x01
const controlTransferSetReport = 0x09
const controlTransferOutReport = 0x200
const controlTransferInReport = 0x100

const uBitBadMessageDelay = 500         // Delay if message failed
const uBitIncompleteMessageDelay = 150  // Delay if no message ready now
const uBitGoodMessageDelay = 20         // Time to try again if message was good


class uBitWebUSB {

    constructor(){
        this.device;
        this.connected;

        this.CONSOLE_LOG = false;

        
        this.DAPOutReportRequest = {
            requestType: "class",
            recipient: "interface",
            request: controlTransferSetReport,
            value: controlTransferOutReport,
            index: MICROBIT_DAP_INTERFACE
        }
        
        this.DAPInReportRequest =  {
            requestType: "class",
            recipient: "interface",
            request: controlTransferGetReport,
            value: controlTransferInReport,
            index: MICROBIT_DAP_INTERFACE
        }

        this.onConnectCallback=function(){};
        this.onDisconnectCallback=function(){};
        this.onReceiveUARTCallback = function(){};
        

    }

    onReceiveUART(callbackFunction){
        this.onReceiveUARTCallback = callbackFunction;
    }

    onReceiveSerial(callbackFunction){
        this.onReceiveUART(callbackFunction);
    }

    setReceiveUARTCallback(callbackFunction){
        this.onReceiveUARTCallback = callbackFunction;
    }
    
    onConnect(callbackFunction){
    this.onConnectCallback=callbackFunction;
    }

    onDisconnect(callbackFunction){
    this.onDisconnectCallback=callbackFunction;
    }
    /**
     * CallbackHandler for micro:bit events
     * 
     
    Event data varies based on the event string:
    <ul>
    <li>"connection failure": null</li>
    <li>"connected": null</li>
    <li>"disconnected": null</li>
    <li>"error": error object</li>
    <li>"console":  { "time":Date object "data":string}</li>
    <li>"graph-data": { "time":Date object "graph":string "series":string "data":number}</li>
    <li>"graph-event": { "time":Date object "graph":string "series":string "data":string}</li>
    </ul>

    * @callback uBitEventCallbackHandler
    * @param {string} event ("connection failure", "connected", "disconnected", "error", "console", "graph-data", "graph-event" )
    * @param {USBDevice} device triggering the callback
    * @param {*} data (event-specific data object). See list above for variants
    * 
    */

    uBitEventHandler(event, data) {
       // console.log("ubitEventHandler this",this);
    switch (event) {
        case "connected":
        if(this.CONSOLE_LOG) console.log("connected");
        //      consolePrintln("<b>Connected!</b>")
        // this.onConnected();
        this.onConnectCallback();

        break
        case "disconnected":
        if(this.CONSOLE_LOG) console.log("disconnected");
        this.onDisconnectCallback();


        break
        case "connection failure":
        if(this.CONSOLE_LOG) console.log("connection failure");
        //      consolePrintln("<b>Connection Failure</b>")
        break
        case "error":
        if(this.CONSOLE_LOG) console.error("error",data);
        // consolePrintln("<b>Error</b>")
        break
        case "console":

        if(this.CONSOLE_LOG) console.log("Console Data: " + data.data);
        this.onReceiveUARTCallback(data.data);

        break
        case "graph-event":
        if(this.CONSOLE_LOG) console.log(`Graph Event:  ${data.data} (for ${data.graph}${data.series.length?" / series "+data.series:""})`)
        break
        case "graph-data":
        if(this.CONSOLE_LOG) console.log(`Graph Data: ${data.data} (for ${data.graph}${data.series.length?" / series "+data.series:""})`)
        break
    }
    }


/*
   Open and configure a selected device and then start the read-loop
 */
async uBitOpenDevice() {
    const transport = new DAPjs.WebUSB(this.device)
    const target = new DAPjs.DAPLink(transport)
    let buffer=""                               // Buffer of accumulated messages
    const parser = /([^.:]*)\.*([^:]+|):(.*)/   // Parser to identify time-series format (graph:info or graph.series:info)
        
    target.on(DAPjs.DAPLink.EVENT_SERIAL_DATA, data => {
        buffer += data;
        let firstNewline = buffer.indexOf("\n")
        while(firstNewline>=0) {
            let messageToNewline = buffer.slice(0,firstNewline)
            let now = new Date() 
            // Deal with line
            // If it's a graph/series format, break it into parts
            let parseResult = parser.exec(messageToNewline)
            if(parseResult) {
                let graph = parseResult[1]
                let series = parseResult[2]
                let data = parseResult[3]
                let callbackType = "graph-event"
                // If data is numeric, it's a data message and should be sent as numbers
                if(!isNaN(data)) {
                    callbackType = "graph-data"
                    data = parseFloat(data)
                }
                // Build and send the bundle
                let dataBundle = {
                    time: now,
                    graph: graph, 
                    series: series, 
                    data: data
                }
                callback(callbackType, dataBundle)
            } else {
                // Not a graph format.  Send it as a console bundle
                let dataBundle = {time: now, data: messageToNewline}
                this.uBitEventHandler("console", dataBundle)
            }
            buffer = buffer.slice(firstNewline+1)  // Advance to after newline
            firstNewline = buffer.indexOf("\n")    // See if there's more data
        }
    });
    await target.connect();
    await target.setSerialBaudrate(115200)
    //await target.disconnect();
    this.device.target = target;   // Store the target in the device object (needed for write)
    //this.device.callback = callback // Store the callback for the device
    this.uBitEventHandler("connected", null)    
    target.startSerialRead()
    return Promise.resolve()
}


/**
 * Disconnect from a device 
 * @param {USBDevice} device to disconnect from 
 */
async disconnectDevice(){
    this.uBitDisconnect();
}

async uBitDisconnect() {
    if(this.device) {
        try {
            await this.device.target.stopSerialRead()
        } catch(error) {
            // Failure may mean already stopped
        }
        try {
            await this.device.target.disconnect()
        } catch(error) {
            // Failure may mean already disconnected
        }
        try {
            await this.device.close()
        } catch(error) {
            // Failure may mean already closed
        }
        // Call the callback with notification of disconnect
        this.uBitEventHandler("disconnected", null);
    }
}

/**
 * Send a string to a specific device
 * @param {USBDevice} device 
 * @param {string} data to send (must not include newlines)
 */
 uBitSend(data) {
    if(!this.device.opened)
        return
    let fullLine = data+'\n'
    this.device.target.serialWrite(fullLine)
}


/**
 * Callback for micro:bit events
 * 
 
   Event data varies based on the event string:
  <ul>
   <li>"connection failure": null</li>
   <li>"connected": null</li>
   <li>"disconnected": null</li>
   <li>"error": error object</li>
   <li>"console":  { "time":Date object "data":string}</li>
   <li>"graph-data": { "time":Date object "graph":string "series":string "data":number}</li>
   <li>"graph-event": { "time":Date object "graph":string "series":string "data":string}</li>
  </ul>

 * @callback uBitEventCallback
 * @param {string} event ("connection failure", "connected", "disconnected", "error", "console", "graph-data", "graph-event" )
 * @param {USBDevice} device triggering the callback
 * @param {*} data (event-specific data object). See list above for variants
 * 
 */
    writeUARTData(data){
        this.uBitSend(data);
    }

    sendSerial(data){
        this.uBitSend(data);
    }

/**
 * Allow users to select a device to connect to.
 * 
 * @param {uBitEventCallback} callback function for device events
 */
//  connectDevice() { 
//     navigator.usb.requestDevice({filters: [{ vendorId: MICROBIT_VENDOR_ID, productId: MICROBIT_PRODUCT_ID }]})
//         .then(  d => { if(!d.opened) uBitOpenDevice(d,callback)} )
//         .catch( () => callback("connection failure", null, null))
    
// }

connectDevice() { 
    navigator.usb.requestDevice({filters: [{ vendorId: MICROBIT_VENDOR_ID, productId: MICROBIT_PRODUCT_ID }]})
        .then(  d => { if(!d.opened){
            // console.log("Connected To Device ", this.device);
            this.device = d;
            this.uBitOpenDevice();
            this.connected = true;

        } }).catch( () => this.uBitEventHandler("connection failure", null, null))
}


}

//stackoverflow.com/questions/5892845/how-to-load-one-javascript-file-from-another
var newScript = document.createElement('script');
newScript.type = 'text/javascript';
newScript.src = 'https://unpkg.com/dapjs@2.3.0/dist/dap.umd.js';
// newScript.src = 'dap.umd.js';

document.getElementsByTagName('head')[0].appendChild(newScript);

// navigator.usb.addEventListener('disconnect', (event) => {
//     if("device" in event && "callback" in event.device && event.device.callback!=null && event.device.productName.includes("micro:bit")) {
//         uBitDisconnect(event.device)
//     }
//  })