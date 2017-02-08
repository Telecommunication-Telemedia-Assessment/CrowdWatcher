"use strict";

// Embeds an application in an iframe and waits for client messages
class ApplicationController extends Controller {
  constructor(userId, platform) {
    super();
    this.handleClientMessage = this.handleClientMessage.bind(this);
    this.userId = userId;
    this.platform = platform;
    this.frame = null;
  }

  // Handle received inter-frame messages
  handleClientMessage() {
    var source = event.source.frameElement; //this is the iframe that sent the message
    var message = event.data;              	//this is the message

    switch(message.type) {
    case "tree":
      this.platform.xmlLog.createTag("tree", null, message.tree)
      return;

    case "newPage":
      this.platform.xmlLog.createTag("newPage", {time: Date.now(), name: message.page});
      return;

    case "distraction":
      this.platform.xmlLog.createTag("distraction", {time: Date.now(), x: message.x, y: message.y});
      return;

    case "videoStart":
      this.platform.xmlLog.createTag("videoStart", {time: Date.now(), file: message.file});
      return;

    case "videoEnd":
      this.platform.xmlLog.createTag("videoEnd", {time: Date.now(), width: message.width, height: message.height});
      return;

    case "scroll":
      this.platform.xmlLog.createTag("scrollTo", {time: Date.now(), x: message.pageXOffset, y: message.pageYOffset});
      return;

    // forward click message to the click logger.
    case "click":
      this.platform.handleClick(message);
      return;

    case "quit":
      this.handleQuit();
      return;
    }

    console.error('Unhandled ClientMessage:', message);
  }

  start() {
    this.frame = document.getElementById("webContentIFrame");
    this.frame.width  = window.innerWidth;
    this.frame.height = window.innerHeight-50;

    var footer = document.getElementById("footer");
    if (footer)
      footer.style.visibility = "hidden";

    // Setup message handling
    window.addEventListener("message", this.handleClientMessage);
  }

  handleQuit() {
    window.removeEventListener("message", this.handleClientMessage);
    this.emit("end");
  }

  render() {
    return `<iframe id="webContentIFrame" src="${options.applicationUrl}?token=${this.userId}" width="100%" height="100%" frameborder="0" scrolling="yes" allowfullscreen="allowfullscreen"></iframe>`;
  }
}
