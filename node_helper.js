"use strict";

var NodeHelper = require("node_helper");
const internet = require("./components/InternetLib.js");

module.exports = NodeHelper.create({
  start () {
    this.internet = null;
  },

  socketNotificationReceived (noti, payload) {
    switch (noti) {
      case "INIT":
        console.log("[INTERNET] EXT-Internet Version:", require("./package.json").version, "rev:", require("./package.json").rev);
        this.initialize(payload);
        break;
    }
  },

  async initialize (config) {
    this.config = config;
    this.internet = new internet( this.config, (noti, params) => { this.sendSocketNotification(noti, params); }, this.config.debug );
    this.internet.start();
  }
});
