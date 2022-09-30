#!/usr/bin/env node
const doc = `
Usage:
    ./run-bot.js [options]
Options:
    -h --help            Show this screen
    -u --url=<url>       URL
    -o --host=<host>     Hubs host if URL is not specified [default: localhost:8080]
    -r --room=<room>     Room id
    -a --audio=<file>    File to replay for the bot's outgoing audio
    -v --volume=<number> Audio volume (default: 1.0)
    -d --data=<file>     File to replay for the bot's data channel
    -s --spawn=<string>  Spawn point
`;

const docopt = require("docopt").docopt;
const options = docopt(doc);

const puppeteer = require("puppeteer");
const querystring = require("query-string");
const nodemailer = require('nodemailer'); 

const readFileSync = require("fs").readFileSync;

function log(...objs) {
  console.log.call(null, [new Date().toISOString()].concat(objs).join(" "));
}

(async () => {
  const transporter = nodemailer.createTransport({
    pool: true,
    host: "mail.your-server.de",
    port: 465,
    secure: true, // use TLS
    auth: {
      user: "app@farvel.space",
      pass: "82II475CZ7uVvWtp",
    },
  });
  
  const mailOptions = {
    from: 'app@farvel.space',
    to: 'hi@farvel.space',
    subject: '[farvel Bot] Neuer Kommentar',
    //text: 'Neuer Kommentar in Raum: ' + options["--url"] + "\n\nKommentar: \n"
    text: ''
  };

  const browser = await puppeteer.launch({
    // for docker with preinstalled google chome
    // executablePath: 'google-chrome-stable',
    devtools: false,
    headless: true,
    ignoreHTTPSErrors: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--ignore-gpu-blacklist", "--ignore-certificate-errors"]
  });
  const page = await browser.newPage();
  await page.setBypassCSP(true);
  // page.on("console", msg => log("PAGE: ", msg.text())); 
  page.on("error", err => log("ERROR: ", err.toString().split("\n")[0]));
  // page.on("pageerror", err => log("PAGE ERROR: ", err.toString().split("\n")[0]));

  // TODO: Write mail! console.log("LeaveMessageSystem: Pinned comment.");
  page.on("console", msg => {
    log("PAGE: ", msg.text());
    if (msg.text().includes("LeaveMessageSystem: Pinned comment:")) {
      // let tmpMailOptions = mailOptions;
      const commentForMail = msg.text().replace("LeaveMessageSystem: Pinned comment: ", "")
      mailOptions.text = "Neuer Kommentar in Raum: " + options["--url"] + "\n\nKommentar: \n" + commentForMail;
      log("Sending mail notification...");
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      }); 
    }
  });

  page.on("pageerror", err => {
    const e = err.toString().split("\n")[0];
    log("PAGE ERROR: ", e);
    if (e.includes("Cannot read property 'off' of") || e.includes("Cannot read property 'systems' of") || e.includes("Failed to fetch") ) {
      log("## Reload page after error");
      navigate();
    }
  });

  

  // 2021-05-21T13:30:45.436Z PAGE ERROR:  Error: TypeError: Cannot read property 'off' of null
  // 2021-05-21T13:30:45.453Z PAGE ERROR:  Error: TypeError: Cannot read property 'systems' of undefined

  const baseUrl = options["--url"] || `https://${options["--host"]}/hub.html`;

  const params = {
    bot: true,
    allow_multi: true,
    allow_idle: true
  };
  const roomOption = options["--room"];
  if (roomOption) {
    params.hub_id = roomOption;
  }
  const volumeOption = options["--volume"];
  if (volumeOption !== null && options["--audio"]) {
    params.audio_volume = volumeOption;
  }
  const spawnPoint = options["--spawn"] ? `#${options["--spawn"]}` : "";

  const url = `${baseUrl}?${querystring.stringify(params)}${spawnPoint}`;
  log(url);

  //
  // farvel 
  // 

  // create localStorage
  const { email, token } = JSON.parse(readFileSync(".ret.credentials"));
  const lStorage = {
    credentials: {
      email: email,
      token: token
    },
    profile: {
      avatarId: "Kj2cAKk",
      displayName: "farvel Bot"
    }
  };
  const lStorageStr = JSON.stringify(lStorage);

  await page.evaluateOnNewDocument ( hubsStore => {
      //localStorage.clear();
      localStorage.setItem('___hubs_store', hubsStore);
  }, lStorageStr);

  // browser.on('targetchanged', async (target) => {
  //   const targetPage = await target.page();
  //   const client = await targetPage.target().createCDPSession();
  //   await client.send('Runtime.evaluate', {
  //     expression: `localStorage.setItem('___hubs_store', ${lStorageStr})`,
  //   }, lStorageStr);
  // });

  // await page.setRequestInterception(true);
  // page.on('request', (request) => {
  //     console.log("reqUrl: ", request.url());
  //     request.continue();
  // });



  // f12 = await page.target().createCDPSession();
  // await f12.send('Network.enable');
  // await f12.send('Page.enable');

  // const handledObjects = [];
  // const handleWebSocketFrameReceived = (params) => {
  //   var payload = params.response.payloadData;

  //   //if (payload.includes("#interactable-media") && payload.includes(".mp3") && payload.includes('\\"persistent\\":false')) {
  //   if (payload.includes("#interactable-media") && payload.includes(".mp3") && !payload.includes('\\"pinned\\":true') && payload.includes('\\"persistent\\":false')) {
      
      
  //     const networkid =  payload.match(/(?:"networkId\\":\\")(\w*)(?:\\")/);// e.g. "networkId\":\"asju3hg\"
  //     //if (handledObjects.indexOf(networkid) > -1) return;

  //     console.log("");
  //     console.log("##################");
  //     console.log("mp3 spawned: ", networkid[1]);
  //     //handledObjects.push(networkid[1]);
  //     //console.log("added to handledObjects", handledObjects);



  //     // execute js
  //     page.evaluate(networkid => {
  //       // this will be executed within the page, that was loaded before

  //       const el = document.getElementById("naf-" + networkid[1]);


  //       setTimeout(() => {
  //         // console.log("tmpPos 2: ", el.object3D.position.x, el.object3D.position.y, el.object3D.position.z);

  //         // pin it
  //         NAF.utils.getNetworkedEntity(el).then(networkedEl => {
  //           const mine = NAF.utils.isMine(networkedEl);
  //           // console.log("tmpPos: ", networkedEl.object3D.position.x, networkedEl.object3D.position.y, networkedEl.object3D.position.z);
  //           if (!mine) var owned = NAF.utils.takeOwnership(networkedEl);
  //           // console.log("tmpPos: ", networkedEl.object3D.position.x, networkedEl.object3D.position.y, networkedEl.object3D.position.z);
  //           // networkedEl.object3D.position.x += 1;
  //           //console.log("tmpPos: ", el.object3D.position.x, el.object3D.position.y, el.object3D.position.z);

  //           networkedEl.setAttribute("pinnable", {pinned:true});
  //           console.log("pinned");
  //           networkedEl.emit("pinned", { el });
  //           console.log("emit pinned");
  //         });
  //       }, 1000);
  //     }, networkid);
  //   }
  // };
  
  // f12.on('Network.webSocketFrameReceived', handleWebSocketFrameReceived);
  
  //
  // farvel End
  // 
  
  const navigate = async () => {
    try {
      log("Spawning bot...");
      await page.goto(url);
      await page.evaluate(() => console.log(navigator.userAgent));
      let retryCount = 5;
      let backoff = 1000;
      const loadFiles = async () => {
        try {
          // Interact with the page so that audio can play.
          await page.mouse.click(100, 100);

          await page.evaluate(payload => {
            setTimeout(() => {
              console.log("initial setup");
              document.querySelector("#avatar-rig").object3D.position.y -= 10;
              console.log("moved to y: -10");
              window.APP.store.update({
                  profile: { displayName : "farvel Bot"}
              });
              try {
                console.log("updated displayName");
                window.APP.scene.systems["hubs-systems"].leaveMessageSystem.setIsLeaveMessageManager(true);
                console.log("isLeaveMessageManager: ", window.APP.scene.systems["hubs-systems"].leaveMessageSystem.isLeaveMessageManager);
              } catch (error) {
                console.error("Could not set to leaveMessageManager. Maybe leaveMessage System is not active or bot has not sufficient rights.", error);
              }
            }, 10000);
          });
          
          if (options["--audio"]) {
            const audioInput = await page.waitForSelector("#bot-audio-input");
            audioInput.uploadFile(options["--audio"]);
            log("Uploaded audio file.");
          }
          if (options["--data"]) {
            const dataInput = await page.waitForSelector("#bot-data-input");
            dataInput.uploadFile(options["--data"]);
            log("Uploaded data file.");
          }
        } catch (e) {
          log("Interaction error", e.message);
          if (retryCount-- < 0) {
            // If retries failed, throw and restart navigation.
            throw new Error("Retries failed");
          }
          log("Retrying...");
          backoff *= 2;
          // Retry interaction to start audio playback
          setTimeout(loadFiles, backoff);
        }
      };

      await loadFiles();

      // Do a periodic sanity check of the state of the bots.
      setInterval(async function() {
        // farvel: START move
        await page.evaluate( payload => {
          try {
            const elPos = document.querySelector("#avatar-rig").object3D.position;
            if (elPos.x < 0) {
              elPos.x = 1;
            } else {
              elPos.x = -1;
            }
            console.info("Moved bot to x=" + elPos.x);
          } catch (error) {
            console.error("Could not move bot", error);
          }
          
        });
        // farvel: END move

        let avatarCounts;
        try {
          avatarCounts = await page.evaluate(() => ({
            connectionCount: Object.keys(NAF.connection.adapter.occupants).length,
            avatarCount: document.querySelectorAll("[networked-avatar]").length - 1
          }));
          log(JSON.stringify(avatarCounts));
        } catch (e) {
          // Ignore errors. This usually happens when the page is shutting down.
        }
        // Check for more than two connections to allow for a margin where we have a connection but the a-frame
        // entity has not initialized yet.
        if (avatarCounts && avatarCounts.connectionCount > 2 && avatarCounts.avatarCount === 0) {
          // It seems the bots have dog-piled on to a restarting server, so we're going to shut things down and
          // let the hubs-ops bash script restart us.
          log("Detected avatar dog-pile. Restarting.");
          process.exit(1);
        }
      }, 60 * 1000);
    } catch (e) {
      log("Navigation error", e.message);
      setTimeout(navigate, 1000);
    }
  };

  navigate();
})();
