/** internet scan
/** bugsounet **/

const childProcess = require("child_process");
const ping = require("ping");
const moment = require("moment");

var logINTERNET = (...args) => { /* do nothing */ };

class INTERNET {
  constructor (config, callback, debug) {
    this.config = config;
    this.callback = callback;
    if (debug === true) logINTERNET = (...args) => { console.log("[INTERNET]", ...args); };
    this.default = {
      delay: 30 * 1000,
      scan: "google.fr",
      command: "pm2 restart 0",
      needRestart: true,
      showAlert: true,
      language: "en"
    };
    this.config = Object.assign(this.default, this.config);
    this.internet = {
      running: false,
      status : false,
      ping : null,
      ticks: 0,
      date : Date.now()
    };
    this.interval = null;
    moment.locale(this.config.language);
    this.usePM2 = false;
    this.PM2 = null;
    this.version = global.version;
    this.root_path = global.root_path;
    console.log("[INTERNET] Internet library initialized...");
  }

  async start () {
    logINTERNET("Scan Start");
    this.internet.running = true;
    this.internetStatus();
    this.startScan();
  }

  stop () {
    clearInterval(this.interval);
    this.interval = null;
    this.internet.running = false;
    logINTERNET("Scan Stop");
  }

  startScan () {
    if (!this.internet.running) return;
    clearInterval(this.interval);
    this.interval = null;
    this.interval = setInterval(()=> {
      clearInterval(this.interval);
      this.interval = null;
      this.internetStatus();
    }, this.config.delay);
  }

  internetStatus () {
    ping.promise.probe(this.config.scan).then( (res)=> {
      if (res.alive) {
        this.internet.status = true;
        this.internet.ping = res.time;
      } else {
        this.internet.status = false;
        this.internet.ping = null;
        this.internet.ticks +=1;
      }
      this.needRestart();
    });
  }

  needRestart () {
    if (this.internet.status) {
      var available = Date.now();
      if (this.internet.ticks === 0) {
        this.internet.date = available;
        logINTERNET("Ping:", `${this.internet.ping  } ms`);
        this.callback("INTERNET_PING", `${this.internet.ping  } ms`);
        this.startScan();
      } else {
        this.callback("INTERNET_PING", "Available");
        var DateDiff = {};
        DateDiff = this.dateDiff(this.internet.date, available);
        console.log(`[INTERNET] [ALERT] Internet is now AVAILABLE -- After ${
          DateDiff.day ? `${DateDiff.day  } days ` : ""
        }${DateDiff.hour ? `${DateDiff.hour  } hours ` : ""
        }${DateDiff.min ? `${DateDiff.min  } minutes ` : ""
        }${DateDiff.sec  } seconds`);
        this.internet.ticks = 0;
        if (this.config.needRestart) {
          if (this.config.showAlert) this.callback("INTERNET_RESTART");
          logINTERNET("I will restart in 5 secs");
          setTimeout (() => { this.callback("RESTART"); }, 5000);
        }
        else {
          if (this.config.showAlert) this.callback("INTERNET_AVAILABLE", DateDiff);
          this.startScan();
        }
      }
    } else {
      logINTERNET(`[ALERT] Internet is DOWN -- ${  moment(this.internet.date).fromNow()}`);
      this.callback("INTERNET_PING", "999 ms");
      if (this.config.showAlert) this.callback("INTERNET_DOWN", { date: this.internet.date, ticks: this.internet.ticks });
      this.startScan();
    }
  }

  dateDiff (date1, date2) {
    var diff = {};
    var tmp = date2 - date1;
    tmp = Math.floor(tmp/1000);
    diff.sec = tmp % 60;
    tmp = Math.floor((tmp-diff.sec)/60);
    diff.min = tmp % 60;
    tmp = Math.floor((tmp-diff.min)/60);
    diff.hour = tmp % 24;
    tmp = Math.floor((tmp-diff.hour)/24);
    diff.day = tmp;
    return diff;
  }
}

module.exports = INTERNET;
