"use strict";
const Mfrc522 = require("mfrc522-rpi");
const SoftSPI = require("rpi-softspi");
const LCD = require('raspberrypi-liquid-crystal');
const lcd = new LCD( 1, 0x3f, 16, 2 );

lcd.begin();

//# This loop keeps checking for chips. If one is near it will get the UID and authenticate
console.log("scanning...");
console.log("Please put chip or keycard in the antenna inductive zone!");
console.log("Press Ctrl-C to stop.");

const softSPI = new SoftSPI({
  clock: 23, // pin number of SCLK
  mosi: 19, // pin number of MOSI
  miso: 21, // pin number of MISO
  client: 24 // pin number of CS
});

// GPIO 24 can be used for buzzer bin (PIN 18), Reset pin is (PIN 22).
// I believe that channing pattern is better for configuring pins which are optional methods to use.
const mfrc522 = new Mfrc522(softSPI).setResetPin(22).setBuzzerPin(18);

setInterval(function() {
  //# reset card
  mfrc522.reset();
  lcd.clearSync();

  //# Scan for cards
  let response = mfrc522.findCard();
  if (!response.status) {
    console.log("No Card");
    lcd.printSync("Please scan card");
    lcd.setCursorSync(0, 1);
    return;
  }
  console.log("Card detected, CardType: " + response.bitSize);

  //# Get the UID of the card
  response = mfrc522.getUid();
  if (!response.status) {
    console.log("UID Scan Error");
    return;
  }
  //# If we have the UID, continue
  const uid = response.data;
  console.log(
    "Card read UID: %s %s %s %s",
    uid[0].toString(16),
    uid[1].toString(16),
    uid[2].toString(16),
    uid[3].toString(16)
  );

  //# Select the scanned card
  const memoryCapacity = mfrc522.selectCard(uid);
  console.log("Card Memory Capacity: " + memoryCapacity);

  //# This is the default key for authentication
  const key = [0xff, 0xff, 0xff, 0xff, 0xff, 0xff];

  //# Authenticate on Block 8 with key and uid
  if (!mfrc522.authenticate(8, key, uid)) {
    console.log("Authentication Error");
    return;
  }

  //# Dump Block 8
  console.log("Block: 8 Data: " + mfrc522.getDataForBlock(8));
  let block = mfrc522.getDataForBlock(8);
  let StudentID = block[0].toString();

  if(StudentID ==="0"){
    //Assuming "0" indicates an invalid or not found StudentID
    lcd.clearSync();
    lcd.printSync("Error:Student ID");
    lcd.setCursorSync(0,1);
    lcd.printSync("not found");
  } else{ 

  
    lcd.printSync("Card scan");
    lcd.setCursorSync(0, 1);
    lcd.printSync("successfully");
    lcd.setCursorSync(1, 1);
  }

  //Delay for a moment before moving to the next step
  setTimeout(() => {
  // Print additional messages
  lcd.clearSync();
  lcd.setCursorSync(0, 0);
  lcd.printSync("Please pickup");
  lcd.setCursorSync(0, 1);
  lcd.printSync("a meditator");
}, 3000);

//Delay for a moment before stopping the process
setTimeout(() => {
    //# Stop
  mfrc522.stopCrypto();
}, 4000);

}, 5000);


