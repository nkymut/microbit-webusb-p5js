
/*
 * JavaScript library for interacting with micro:bit microcontrollers over WebUSB
 * (Only works in Chrome browsers;  Pages must be either HTTPS or local)
 */

// Add a delay() method to promises 
// NOTE: I found this on-line somewhere but didn't note the source and haven't been able to find it!
Promise.delay = function(duration){
    return new Promise(function(resolve, reject){
        setTimeout(function(){
            resolve();
        }, duration)
    });
}

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

    uBitEventHandler(event, device, data) {
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
    uBitOpenDevice() {
        let buffer=""                               // Buffer of accumulated messages
        let decoder = new TextDecoder("utf-8")      // Decoder for byte->utf conversion
        const parser = /([^.:]*)\.*([^:]+|):(.*)/   // Parser to identify time-series format (graph:info or graph.series:info)

        console.log("uBitOpenDevice",this);

        let transferLoop = () => {
            this.device.controlTransferOut(this.DAPOutReportRequest, Uint8Array.from([0x83])) // DAP ID_DAP_Vendor3: https://github.com/ARMmbed/DAPLink/blob/0711f11391de54b13dc8a628c80617ca5d25f070/source/daplink/cmsis-dap/DAP_vendor.c
            .then(() => this.device.controlTransferIn(this.DAPInReportRequest, 64))
            .then((data) => { 
                if (data.status != "ok") {
                    return Promise.delay(uBitBadMessageDelay).then(transferLoop);
                }
                // First byte is echo of get UART command: Ignore it

                let arr = new Uint8Array(data.data.buffer)
                if(arr.length<2)  // Not a valid array: Delay
                    return Promise.delay(uBitIncompleteMessageDelay).then(transferLoop)

                // Data: Process and get more
                let len = arr[1]  // Second byte is length of remaining message
                if(len==0) // If no data: Delay
                    return Promise.delay(uBitIncompleteMessageDelay).then(transferLoop)
                
                let msg = arr.slice(2,2+len)  // Get the actual UART bytes
                let string =  decoder.decode(msg);
                buffer += string;
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
                        this.uBitEventHandler(callbackType, this.device, dataBundle)
                    } else {
                        // Not a graph format.  Send it as a console bundle
                        let dataBundle = {time: now, data: messageToNewline}
                        this.uBitEventHandler("console", this.device, dataBundle)
                    }

                    buffer = buffer.slice(firstNewline+1)  // Advance to after newline
                    firstNewline = buffer.indexOf("\n")    // See if there's more data
                }
                // Delay long enough for complete message
                return Promise.delay(uBitGoodMessageDelay).then(transferLoop);
            })
            // Error here probably means micro:bit disconnected
            .catch(error => { if(this.device.opened) this.uBitEventHandler("error", this.device, error); this.device.close(); this.uBitEventHandler("disconnected", this.device, null);});
        }

        this.device.open()
            .then(() => this.device.selectConfiguration(1))
            .then(() => this.device.claimInterface(4))
            .then(this.controlTransferOutFN(Uint8Array.from([2, 0])))  // Connect in default mode: https://arm-software.github.io/CMSIS_5/DAP/html/group__DAP__Connect.html
            .then(this.controlTransferOutFN(Uint8Array.from([0x11, 0x80, 0x96, 0x98, 0]))) // Set Clock: 0x989680 = 10MHz : https://arm-software.github.io/CMSIS_5/DAP/html/group__DAP__SWJ__Clock.html
            .then(this.controlTransferOutFN(Uint8Array.from([0x13, 0]))) // SWD Configure (1 clock turn around; no wait/fault): https://arm-software.github.io/CMSIS_5/DAP/html/group__DAP__SWD__Configure.html
            .then(this.controlTransferOutFN(Uint8Array.from([0x82, 0x00, 0xc2, 0x01, 0x00]))) // Vendor Specific command 2 (ID_DAP_Vendor2): https://github.com/ARMmbed/DAPLink/blob/0711f11391de54b13dc8a628c80617ca5d25f070/source/daplink/cmsis-dap/DAP_vendor.c ;  0x0001c200 = 115,200kBps
            .then(() => { this.uBitEventHandler("connected", this.device, null); return Promise.resolve()}) 
            .then(transferLoop)
            .catch(error => this.uBitEventHandler("error", this.device, error))
    }
    
    controlTransferOutFN(data) {
        return () => { return this.device.controlTransferOut(this.DAPOutReportRequest, data) }
    }

    /**
     * Disconnect from a device 
     */
    disconnectDevice() {
        if(this.device && this.device.opened) {
            this.device.close();
            this.connected = false;
        }
    }

    /**
     * Send a string to a specific device
     * @param {string} data to send (must not include newlines)
     */
    uBitSend(data) {
        if(!this.device.opened){
            console.error("microBit is not connected!");
            return;
        }
            
        // Need to send 0x84 (command), length (including newline), data's characters, newline
        let fullLine = data+'\n'
        let encoded = new TextEncoder("utf-8").encode(fullLine)
        let message = new Uint8Array(1+1+fullLine.length)
        message[0] = 0x84
        message[1] = encoded.length
        message.set(encoded, 2)
        this.device.controlTransferOut(this.DAPOutReportRequest, message) // DAP ID_DAP_Vendor3: https://github.com/ARMmbed/DAPLink/blob/0711f11391de54b13dc8a628c80617ca5d25f070/source/daplink/cmsis-dap/DAP_vendor.c
    }

    /**
     * Send a string to a specific device, an alias of uBitSend(data)
     * for compativility with ubitwebble.js
     * @param {string} data to send (must not include newlines)
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
    connectDevice() { 
        navigator.usb.requestDevice({filters: [{ vendorId: MICROBIT_VENDOR_ID, productId: 0x0204 }]})
            .then(  d => { if(!d.opened){
                // console.log("Connected To Device ", this.device);
                this.device = d;
                this.uBitOpenDevice();
                this.connected = true;

            } }).catch( () => this.uBitEventHandler("connection failure", null, null))
    }

}
