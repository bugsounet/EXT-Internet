/**
 ** Module : EXT-Internet
 ** @bugsounet
 ** ©01-2022
 ** support: http://forum.bugsounet.fr
 **/
 
 // @todo: notification & translate

logNOTI = (...args) => { /* do nothing */ }

Module.register("EXT-Internet", {
  defaults: {
    debug: true,
    displayPing: true,
    delay: 30 * 1000,
    scan: "google.fr",
    command: "pm2 restart 0",
    showAlert: true,
    needRestart: false,
    language: config.language
  },

  start: function () {
    if (this.config.debug) logINTERNET = (...args) => { console.log("[INTERNET]", ...args) }
    this.DateTranslate = {
      day: " " + this.translate("DAY") + " ",
      days: " " + this.translate("DAYS") + " ",
      hour: " " + this.translate("HOUR") + " ",
      hours: " " + this.translate("HOURS") + " ",
      minute: " " + this.translate("MINUTE") + " ",
      minutes: " " + this.translate("MINUTES") + " ",
      second: " " + this.translate("SECOND"),
      seconds: " " + this.translate("SECONDS")
    }
  },

  getStyles: function () {
    return [
      "EXT-Internet.css"
    ]
  },

  getTranslations: function() {
    return {
      en: "translations/en.json",
      fr: "translations/fr.json",
      it: "translations/it.json",
      de: "translations/de.json",
      es: "translations/es.json",
      nl: "translations/nl.json",
      pt: "translations/pt.json",
      ko: "translations/ko.json"
    }
  },

  getDom: function() {
    /** internet Ping **/
    var internet = document.createElement("div")
    internet.id = "EXT_INTERNET"
    if (!this.config.displayPing) internet.className = "hidden"
    var internetText = document.createElement("div")
    internetText.id = "EXT_INTERNET_TEXT"
    internetText.textContent = "Ping:"
    internet.appendChild(internetText)
    var internetPing = document.createElement("div")
    internetPing.id = "EXT_INTERNET_PING"
    internetPing.classList.add("ping")
    internetPing.textContent = "Loading..."
    internet.appendChild(internetPing)
    return internet
  },

  notificationReceived: function(noti, payload) {
    switch(noti) {
      case "DOM_OBJECTS_CREATED":
        this.sendSocketNotification("INIT", this.config)
        this.sendNotification("EXT_HELLO", this.name)
        break
    }
  },

  socketNotificationReceived: function(noti, payload) {
    switch(noti) {
      /** new internet module (v2) **/
      case "INTERNET_DOWN":
        if (payload.ticks == 1) this.sendSocketNotification("EXT_SCREEN-WAKEUP")
        let FormatedSince = moment(payload.date).fromNow()
        this.sendNotification("EXT_ALERT", {
          type: "warning",
          message: this.translate("InternetDown", { VALUES: FormatedSince }),
          icon: "modules/EXT-Internet/resources/Internet-Logo.png",
          timer: 10000
        })
        break
      case "INTERNET_RESTART":
        this.sendSocketNotification("EXT_SCREEN-WAKEUP")
        this.sendNotification("EXT_ALERT", {
          type: "information",
          message: this.translate("InternetRestart")
        })
        break
      case "INTERNET_AVAILABLE":
        let DateDiff = payload
        this.sendSocketNotification("EXT_SCREEN-WAKEUP")
        // sport time ! translate the time elapsed since no internet into all languages !!!
        let FormatedMessage = (DateDiff.day ? (DateDiff.day + (DateDiff.day > 1 ? this.DateTranslate.days : this.DateTranslate.day)) : "")
          + (DateDiff.hour ? (DateDiff.hour + (DateDiff.hour > 1 ? this.DateTranslate.hours : this.DateTranslate.hour)): "")
          + (DateDiff.min ? (DateDiff.min + (DateDiff.min > 1 ? this.DateTranslate.minutes : this.DateTranslate.minute)): "")
          + DateDiff.sec + (DateDiff.sec > 1 ? this.DateTranslate.seconds : this.DateTranslate.second)
        this.sendNotification("EXT_ALERT", {
          type: "information",
          message: this.translate("InternetAvailable", { VALUES: FormatedMessage }),
          icon: "modules/EXT-Internet/resources/Internet-Logo.png",
          timer: 10000
        })
        break
      case "INTERNET_PING":
        var ping = document.getElementById("EXT_INTERNET_PING")
        ping.textContent = payload
        break
      case "WARNING":
        this.sendSocketNotification("EXT_SCREEN-WAKEUP")
        this.sendNotification("EXT_ALERT", {
          type: "error",
          message: payload,
          timer: 10000
        })
        break
    }   
  },

  /** internet utils **/
  dateDiff: function (date1, date2) {
    var diff = {}
    var tmp = date2 - date1
    tmp = Math.floor(tmp/1000)
    diff.sec = tmp % 60
    tmp = Math.floor((tmp-diff.sec)/60)
    diff.min = tmp % 60
    tmp = Math.floor((tmp-diff.min)/60)
    diff.hour = tmp % 24
    tmp = Math.floor((tmp-diff.hour)/24)
    diff.day = tmp
    return diff
  },
})
