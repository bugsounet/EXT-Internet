"use strict"

var NodeHelper = require("node_helper")
var logINTERNET = (...args) => { /* do nothing */ }

const internet = require("./lib/InternetLib.js")

module.exports = NodeHelper.create({
  start: function () {
    this.internet = null
  },

  socketNotificationReceived: function (noti, payload) {
    switch (noti) {
      case "INIT":
        console.log("[INTERNET] EXT-Internet Version:", require('./package.json').version, "rev:", require('./package.json').rev)
        this.initialize(payload)
      break
    }
  },

  initialize: async function (config) {
    this.config = config
    if (this.config.debug) logINTERNET = (...args) => { console.log("[INTERNET]", ...args) }
    this.internet = new internet(
      this.config,
      (noti, params) => {
        this.sendSocketNotification(noti, params)
      },
      this.config.debug
    )
    this.internet.start()
  }

})
