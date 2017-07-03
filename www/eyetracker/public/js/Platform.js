"use strict";

/* Features:
		- ES6 classes (Chrome 42 in strict mode, Firefox 45)
		- ES6 template literals (Chrome 41, Firefox 43)
 */

window.options = {
	applicationUrl: "https://192.168.56.101/study",
	type: 'video',
	video: {
		width: 640,
		height: 480
	},
	canvas: {
		width: 640,
		height: 480
	},
	faceSize: {
		width: 60,
		height: 100
	}
	// faceSize: {
	// 	width: 100,
	// 	height: 160
	// }
}

navigator.getUserMedia = navigator.getUserMedia ||
  navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

// ----------------------------------------------------------
// The Platform controls the progression of the eyetracking experiment
class Platform {
  constructor() {
    // Get script arguments from HTML page
    var queryString = document.currentScript.src.replace(/^[^\?]+\??/, '');
    this.params = parseQuery(queryString);
    trace("params: " + JSON.stringify(this.params));

		if (!this.params.streamingType || !this.params.userId)
			throw new Error("Platform params 'streamingType' and 'userId' must be set!");

		this.videoContainer = document.getElementById("videoContainer");
		this.contentContainer = document.getElementById("contentContainer");

		if (!this.videoContainer || !this.contentContainer)
			throw new Error("Required elements #videoContainer or #contentContainer not found");

		this.handleClick = this.handleClick.bind(this);
		this.firstClick = true;

    // Create xml logger
    this.xmlLog = new XMLLogger();
    this.xmlLog.openTag("EyeTrackingRecords");

		// attach video streaming controller
		this.streamController = new StreamController(this.params.streamingType);
		this.startController(this.streamController, videoContainer);

		// start with video setup
		this.setupVideo();
  }

	startController(controller, container) {
		container.innerHTML = controller.render();
		controller.start();
	}

	setupVideo() {
		var controller = new VideoSetupController(this.streamController)
		this.startController(controller, contentContainer);

		this.streamController.once("startedRecording", function() {
			window.addEventListener("click", this.handleClick);
			this.startGame();
		}.bind(this));
	}

	startGame() {
		var controller = new GameController();
		this.startController(controller, contentContainer);
		controller.once("end", this.startApplication.bind(this));
	}

	startApplication() {
		var controller = new ApplicationController(this.params.userId, this);
		this.startController(controller, contentContainer);

		// stop recording
		controller.once("end", function() {
			this.streamController.stopRecording();
			window.removeEventListener("click", this.handleClick);
		}.bind(this));

		// wait for blob
		this.streamController.once("stoppedRecording", this.startUpload.bind(this));
	}

  startUpload() {
		var controller;

		// close xmlLogger
		this.xmlLog.closeTag("click");
		this.xmlLog.closeTag("EyeTrackingRecords");
		var clickXML = this.xmlLog.getContent();

console.log(clickXML);

		// for streaming video
		if (this.streamController.isStreaming) {
			this.streamController.stopStreaming();
			controller = new UploadController(this.params.userId, this.streamController, clickXML);

		// assume streaming type "POST-Video"
		} else {

			controller = new UploadController(this.params.userId, this.streamController, clickXML);
		}

		this.startController(controller, contentContainer);
		controller.once("end", function() {
			trace("done!");
			location.href = location.protocol + "//192.168.56.101/platform/post_session_assessments/new";
		});
	}

  // ----------------------------------------------------------
  // click logging
  handleClick(event) {
		var clickX = event.pageX;
		var clickY = event.pageY;
    console.log("click", clickX, clickY);

    if (this.firstClick) {
      this.firstClick = false;
    } else {
      this.xmlLog.closeTag("click");
    }

    this.xmlLog.openTag("click", {time: Date.now(), x: clickX, y: clickY});
     // console.log(this.xmlLog._content);

		// Creates colored squares in the video recording, see RecordRTC
		__DRAW_RED_BOX_ = true;
		__DRAW_RED_BOX_INDEX__ = 0;
  }
}

window.eyetrackingPlatform = new Platform();
