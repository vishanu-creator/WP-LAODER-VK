(async () => {
  try {
    const chalk = await import("chalk");
    const { makeWASocket } = await import("@whiskeysockets/baileys");
    const qrcode = await import("qrcode-terminal");
    const fs = await import('fs');
    const pino = await import('pino');
    const { green, red, yellow } = chalk.default; // Destructure the colors
    const {
      delay,
      useMultiFileAuthState,
      BufferJSON,
      fetchLatestBaileysVersion,
      PHONENUMBER_MCC,
      DisconnectReason,
      makeInMemoryStore,
      jidNormalizedUser,
      Browsers,
      makeCacheableSignalKeyStore
    } = await import("@whiskeysockets/baileys");
    const Pino = await import("pino");
    const NodeCache = await import("node-cache");
    console.log(yellow(`
    
  .
 /$$    /$$ /$$$$$$  /$$$$$$  /$$   /$$  /$$$$$$  /$$   /$$ /$$   /$$
| $$   | $$|_  $$_/ /$$__  $$| $$  | $$ /$$__  $$| $$$ | $$| $$  | $$
| $$   | $$  | $$  | $$  \__/| $$  | $$| $$  \ $$| $$$$| $$| $$  | $$
|  $$ / $$/  | $$  |  $$$$$$ | $$$$$$$$| $$$$$$$$| $$ $$ $$| $$  | $$
 \  $$ $$/   | $$   \____  $$| $$__  $$| $$__  $$| $$  $$$$| $$  | $$
  \  $$$/    | $$   /$$  \ $$| $$  | $$| $$  | $$| $$\  $$$| $$  | $$
   \  $/    /$$$$$$|  $$$$$$/| $$  | $$| $$  | $$| $$ \  $$|  $$$$$$/
    \_/    |______/ \______/ |__/  |__/|__/  |__/|__/  \__/ \______/ 
                                                                                                                                                                                                          
======================================================================                                                              
                                       WHATSAPP LOADER MADE BY - VISHANU                      
======================================================================                                                             

    `));
    const phoneNumber = "+91***********";
    const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code");
    const useMobile = process.argv.includes("--mobile");

    const rl = (await import("readline")).createInterface({ input: process.stdin, output: process.stdout });
    const question = (text) => new Promise((resolve) => rl.question(text, resolve));

    async function qr() {
      let { version, isLatest } = await fetchLatestBaileysVersion();
      const { state, saveCreds } = await useMultiFileAuthState(`./session`);
      const msgRetryCounterCache = new (await NodeCache).default();

      const MznKing = makeWASocket({
        logger: (await pino).default({ level: 'silent' }),
        printQRInTerminal: !pairingCode,
        mobile: useMobile,
        browser: Browsers.macOS("Safari"),
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, (await Pino).default({ level: "fatal" }).child({ level: "fatal" })),
        },
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        getMessage: async (key) => {
          let jid = jidNormalizedUser(key.remoteJid);
          let msg = await store.loadMessage(jid, key.id);
          return msg?.message || "";
        },
        msgRetryCounterCache,
        defaultQueryTimeoutMs: undefined,
      });

      if (pairingCode && !MznKing.authState.creds.registered) {
        if (useMobile) throw new Error('Cannot use pairing code with mobile api');

        let phoneNumber;
        if (!!phoneNumber) {
          phoneNumber = phoneNumber.replace(/[^0-9]/g, '');

          if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
            console.log(chalk.default.bgBlack(chalk.default.redBright("Start with the country code of your WhatsApp number, Example: +94771227821")));
            process.exit(0);
          }
        } else {
          console.log(yellow("==================================="));
          phoneNumber = await question(chalk.default.bgBlack(chalk.default.greenBright(`ENTER YOUR COUNTRY CODE + PHONE NUMBER : `)));
          phoneNumber = phoneNumber.replace(/[^0-9]/g, '');

          if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
            console.log(chalk.default.bgBlack(chalk.default.redBright("ENTER YOUR COUNTRY CODE + PHONE NUMBER : ")));

            phoneNumber = await question(chalk.default.bgBlack(chalk.default.greenBright(`Please Enter Valid Number... !! Like 91******** : `)));
            phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
            rl.close();
          }
        }

        setTimeout(async () => {
          let code = await MznKing.requestPairingCode(phoneNumber);
          code = code?.match(/.{1,4}/g)?.join("-") || code;
          console.log(yellow("==================================="));
          console.log(chalk.default.black(chalk.default.bgGreen(`THIS IS YOUR LOGIN CODE : `)), chalk.default.black(chalk.default.cyan(code)));
        }, 3000);
      }
      
      MznKing.ev.on("connection.update", async (s) => {
        const { connection, lastDisconnect } = s;
        if (connection == "open") {
          console.log(yellow("YOUR WHATSAPP SUCCESSFULLY LOGIN DEAR USER"));

          // Prompt the user to enter the target number and message
          console.log(yellow("==================================="));
          const targetNumber = await question(chalk.default.bgBlack(chalk.default.greenBright(`ENTER YOUR TARGET NUMBER : `)));
          console.log(yellow("==================================="));
          const message = await question(chalk.default.bgBlack(chalk.default.greenBright(`ENTER YOUR MESSAGE WHAT YOU WANT TO SEND : `)));
          console.log(yellow("==================================="));
          const delaySeconds = await question(green(`ENTER YOUR DELAY OF SECONDS : `));
          console.log(yellow("==================================="));
           
          // Infinite message sending
          const sendMessageInfinite = async () => {
            await MznKing.sendMessage(targetNumber + '@c.us', { text: message });
            console.log(green(`===================================\n YOUR MESSAGE IS :- ${message}\n =======================================\n YOUR TARGET NO. IS ${targetNumber} \n ==============================\n YOUR TIME AFTER SENDING MESSAGE IS ${delaySeconds}\n`));
            setTimeout(sendMessageInfinite, delaySeconds * 1000); // Milliseconds mein convert kiya
          };
          sendMessageInfinite();
        }
        if (
          connection === "close" &&
          lastDisconnect &&
          lastDisconnect.error &&
          lastDisconnect.error.output.statusCode != 401
        ) {
          qr();
        }
      });
      MznKing.ev.on('creds.update', saveCreds);
      MznKing.ev.on("messages.upsert", () => { });
    }

    qr();

    process.on('uncaughtException', function (err) {
      let e = String(err);
      if (e.includes("Socket connection timeout")) return;
      if (e.includes("rate-overlimit")) return;
      if (e.includes("Connection Closed")) return;
      if (e.includes("Timed Out")) return;
      if (e.includes("Value not found")) return;
      console.log('Caught exception: ', err);
    });
  } catch (error) {
    console.error("Error importing modules:", error);
  }
})();
