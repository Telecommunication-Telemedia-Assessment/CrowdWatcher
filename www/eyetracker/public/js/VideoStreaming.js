"use strict";

// Handles Video Recording or Streaming
class StreamController extends Controller {
	constructor(streamingType){
		super();

		if (!streamingType)
			throw new Error("Error - streamingType is required for StreamController!");

		this.streamingType = streamingType;
		this.stream = null;

		// recordRTC
		this.recordRTC = null;
		this.blob = null;

		// WebRTC streaming variables
		this.recordStack = [];
		this.localPeerConnection = this.remotePeerConnection = null;
		this.streamingLoopThreadID = null;
		this.streamingCutLoopThreadID = null;
		this.lastUploadEnded = true;
		this.nbVideoPieces = 0;
	}

	// Receive stream from getUserMedia
	handleStream(stream) {
		trace("Received local stream");
		this.stream = stream;
		this.emit("hasStream");
	}

	// handle Failure of getUserMedia
	handleFail(error) {
		trace("navigator.getUserMedia error: ", error);
		alert("To pass the test you are required have a webcam _AND_ let the page turn the camera on. If you decide to not do it, you will not be able to continue the test and you will NOT be paid.");
	}

	requestStream() {
		trace("Requesting local stream");
    navigator.getUserMedia(
      {audio:false, video:true},
      this.handleStream.bind(this),
      this.handleFail.bind(this)
    );
	}

	startRecording() {
		if (this.streamingType == 'StreamVideo') {
			trace("Start stream");
			this.isStreaming = true;
			this.recordRTC = RecordRTC(this.stream, options);
			this.recordRTC.startRecording();

			this.recordStack.push(this.recordRTC);

			// check every 5s if there is a video to post to the server.
			this.streamingLoopThreadID = setInterval(SendCurrentStatusLoop, 5000);

			// Cut the video in 5s piece.
			this.streamingCutLoopThreadID = setInterval(CutVideo, 5000);

		// assume streamingType as "POST-Video"
		} else {
			trace("Start recording");
			this.isRecording = true;
			this.recordRTC = RecordRTC(this.stream, options);
			this.recordRTC.startRecording();
		}
		this.emit("startedRecording");
	}

	stopRecording() {
    trace("Ending call");

    this.recordRTC.stopRecording(function(videoURL) {
			this.blob = this.recordRTC.getBlob();
			this.stream.stop();
			this.emit("stoppedRecording");
    }.bind(this));
	}

	getObjectURL() {
		if (!this.stream)
			return null;

		return URL.createObjectURL(this.stream);
	}

	getDataURL(callback) {
		this.recordRTC.getDataURL(callback);
	}

	getBlob() {
		if (!this.blob)
			throw new Error("Blob not yet ready, call stopRecording first");

		return this.blob;
	}

	// stopStreaming() {
		// clearInterval(streamingCutLoopThreadID);
	// }

	// streaming methods
	// gotRemoteStream(event) {
	// 	remoteVideo.src = URL.createObjectURL(event.stream);
	// 	trace("Received remote stream");
	// }
	//
	// gotLocalIceCandidate(event) {
	// 	if (event.candidate) {
	// 		this.remotePeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
	// 		trace("Local ICE candidate: \n" + event.candidate.candidate);
	// 	}
	// }
	//
	// gotRemoteIceCandidate(event) {
	// 	if (event.candidate) {
	// 		this.localPeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
	// 		trace("Remote ICE candidate: \n " + event.candidate.candidate);
	// 	}
	// }
	//
	// handleUploadProgress(e) {
	// 	 if(!progressBar) return;
	// 	 trace(e.total);
	// 	 console.log('Uploading from header: ' + e.total);
	// 	 if (e.lengthComputable) {
	// 			 progressBar.value = 100 * e.loaded / e.total;
	// 	 }
	//
	// 	 if(progressBar.value == 100){
	// 				progressBar.value = 0;
	// 	 }
	// }
	//
	// transferComplete(e) {
	// 	 progressBar.value = 100;
	// 	 releaseToken();
	// }
	//
	// SendCurrentStatusLoop() {
	// 	trace("hello")
	// 	if(recordStack.length == 0)
	// 		return;
	//
	// 	trace("there is something to upload")
	// 	if(!lastUploadEnded)
	// 		return;
	//
	// 	trace("upload")
	// 	lastUploadEnded = false;
	//
	// 	trace("yep not cached")
	// 	var record = recordStack[0];
	// 	recordStack.splice(0,1);
	// 	var blob = record.getBlob();
	// 	trace("try to stream")
	// 	PostBlob(blob, 'video', fileName + "-" +nbVideoPieces + '.webm');
	// 	++nbVideoPieces;
	// }
	//
	// CutVideo = function() {
	// 	recordRTC.stopRecording(function(videoURL) {
	// 		trace("cut one video");
	//
	// 		recordStack.push(recordRTC);
	//
	//
	// 		this.recordRTC = RecordRTC(this.stream, options);
	// 		this.recordRTC.startRecording();
	// 	});
	// }
}


// -------------------------------------------------------------------
// UI to help the user with setting up his camera
class VideoSetupController extends Controller {
	constructor(streamController) {
		super();
		this.handleTrackerEvent = this.handleTrackerEvent.bind(this);
		this.streamController = streamController;

		var canvas = document.createElement('canvas');
		canvas.width = options.canvas.width;
		canvas.height = options.canvas.height;

		this.histogram_ctx = canvas.getContext('2d');
		this.qualityMetric = new QualityMetric(16);
		this.headtracker = null;
		this.messageShown = false;
		this.timeoutId = null;
	}

	start() {
		// Page elements
		this.localVideo = document.getElementById("localVideo");
		this.callButton = document.getElementById("callButton");
		var startButton = document.getElementById("startButton");

		// Wait for start Button
		var handleStart = function() {
			startButton.removeEventListener("click", handleStart);
			startButton.disabled = true;
			this.streamController.requestStream();
			this.streamController.once("hasStream", this.startTracker.bind(this));
		}.bind(this);
		startButton.addEventListener("click", handleStart);
	}

	// ------------------------------------------------------------
	// Methods for showing tips for face alignment
	hideTrackerMessage() {
		var messageContainer = document.getElementById("headtrackerMessage");
		messageContainer.innerHTML = "";
		this.messageShown = false;
	}

	showTrackerMessage(message) {
		if (this.messageShown)
			return;

		var messageContainer = document.getElementById("headtrackerMessage");
		messageContainer.innerHTML = message;
		this.messageShown = true;

		this.timeoutId = setTimeout(this.hideTrackerMessage.bind(this), 3000);
	}

	// Receive headtrackr events
	handleTrackerEvent(event) {
		// face is too small
		if (event.width < options.faceSize.width || event.height < options.faceSize.height) {
			this.showTrackerMessage("You are too far from the camera, please move forward... If that does not help, try to move out of the frame and move back in.");

		} else {
			// compute histograms of RGB values.
			this.histogram_ctx.drawImage(this.localVideo, 0, 0, options.canvas.width, options.canvas.height);

			var imgd = this.histogram_ctx.getImageData(
				Math.min(1.3 * event.x, options.canvas.width),
				Math.min(options.canvas.height, event.y + event.height / 4),
				Math.min(options.canvas.width, 2 * event.width),
				event.height
			);

			// debug.
			this.histogram_ctx.rect(1.3*event.x, event.y+event.height/4, 2*event.width, event.height);
			this.histogram_ctx.stroke();

			var metric = this.qualityMetric.evalImage(imgd.data, Math.min(options.canvas.width, 2*event.width), event.height);

			// trace("metric: " + metric);
			if (this.messageShown)
				return;

			if (metric > 0) {
				this.showTrackerMessage("Perfect! You can start the test!");
				this.stopTracker();

			} else {
				this.showTrackerMessage("Your eyes could not be detected clearly, please check if there is no source light masking your eyes... If it does not help, try to move in front of the camera and eventually reload the page...");
			}
		}
	}

	// try to detect the participants face
	startTracker() {
		this.localVideo.src = this.streamController.getObjectURL();
		var canvasInput = document.getElementById("inputCanvas");
		this.headtracker = new headtrackr.Tracker();
		this.headtracker.init(this.localVideo, this.streamController.stream, canvasInput);
		this.headtracker.start();
		document.addEventListener("facetrackingEvent", this.handleTrackerEvent.bind(this));
	}

	stopTracker() {
		// stop headtrackr
		document.removeEventListener("facetrackingEvent", this.handleTrackerEvent);
		this.headtracker.stop();
		this.headtracker = null;
		if (this.timeoutId)
		 	clearTimeout(this.timeoutId);

		// wait for click on Call button
		var handleCall = function() {
			this.callButton.removeEventListener("click", handleCall)
			this.streamController.startRecording.call(this.streamController);
		}.bind(this);
		this.callButton.disabled = false;
		this.callButton.addEventListener("click", handleCall);
	}

	render() {
		return `
		<div style="text-align: center; ">
			<video id="localVideo" autoplay muted style="border:1px solid #000000;" width="640" height="480" ></video>
			<div id="facePositionMarker" class="faceMarker" ></div>
		</div>

		<div id="ControlButtons" style="text-align:center; margin-top: 50px; " >
		  <button id="startButton" type="button">Turn on Camera</button>
		  <button id="callButton" type="button" disabled>Start test</button>
		</div>

		<canvas id="inputCanvas" width="320" height="240" class="hidden" ></canvas>

		<div id="trackingStatusHolder"></div>`;
	}
}

// ----------------------------------
// fake loading bar...

// var loadingValue = 0;
// function pleaseWait() {
//
//     progressBar.value = ++loadingValue;
//
//     if(loadingValue == 100) {
//         clearInterval(loopThreadID);
//         progressBar.value = 0;
//         releaseToken();
//     }
//
// }

// ----------------------------------------------------------
// Data Uploading
class UploadController extends Controller {
	constructor(userId, streamController, clickXML) {
		super();

		this.userId = userId;
		this.streamController = streamController;
		this.clickXML = clickXML;
		this.handleSkip = this.handleSkip.bind(this);

		this.buckets = [];
		this.values = [];
		this.progressBar = null;
	}

	handleProgress(bucket, value) {
		var index = this.buckets.indexOf(bucket);
		if (index == -1){
			this.buckets.push(bucket);
			this.values.push(value);
		} else {
			this.values[index] = value;
		}
		this.progressBar.value = this.values.reduce(function(a, b){return a + b});
	}

	postBlob(blob, filetype, filename, callback) {
		var data = new FormData();
		data.append(filetype + "-filename", filename);
		data.append(filetype + "-blob", blob);

		ajax("save.php", {
			type: "POST",
			data: data,
			progress: function(e) {
				this.handleProgress("video", (e.loaded / e.total) * 100);
			}.bind(this),
			complete: this.handleProgress.bind(this, "video", 100),
			success: callback
		});
	}

  postClicks(content, filename, callback) {
		ajax("save_clicks.php?filename=" + filename, {
			data: content,
			type: "POST",
			mimeType: "text/plain; charset=x-user-defined-binary",
			success: callback
		});
  }

	// start upload
	handleSkip() {
		this.previewButtonHolder.classList.add("hidden");
		this.localVideo.removeEventListener("ended", this.handleSkip);
		this.skipPreviewButton.removeEventListener("click", this.handleSkip);

		var requests = 1;
		var done = 0;
		var handleDone = function() {
			if (++done == requests)
				this.emit("end");
		}.bind(this)

		// always upload clicks
		this.postClicks(this.clickXML, this.userId + ".xml", handleDone)

		// only upload video if we didn't stream
		if (this.streamController.isRecording) {
			requests++;
			var videoBlob = this.streamController.getBlob();
			this.postBlob(videoBlob, 'video', this.userId + ".webm", handleDone);
		}
	}

	start() {
		this.skipPreviewButton = document.getElementById("skipPreview");
		this.progressBar = document.getElementById("progressBar");
		this.localVideo = document.getElementById("localVideo");
		this.previewButtonHolder = document.getElementById("previewButtonHolder");
		var waitEncodingCaption = document.getElementById("waitEncodingCaption");
		var uploadCaption = document.getElementById("uploadCaption");

		this.streamController.getDataURL(function(dataURL) {
			this.localVideo.src = dataURL;
			uploadCaption.classList.add("hidden");
			waitEncodingCaption.classList.add("hidden");
			this.previewButtonHolder.classList.remove("hidden");
			// skipPreviewButton.addEventListener("click", )
		}.bind(this));
		this.skipPreviewButton.addEventListener("click", this.handleSkip);
		this.localVideo.addEventListener("ended", this.handleSkip);
	}

	render() {
		return `<div style="text-align: center;">
				<video id="localVideo" autoplay muted style="border:1px solid #000000;" width="640" height="480" ></video>
			</div>

			<div id="progressHolder">
			  <div class="row">
			    <p id="uploadCaption" class="hidden">Video which will be uploaded to our server: </p>
			    <p id="waitEncodingCaption">Processing video...</p>
					<progress class="hidden" id="progressBar" value="0" max="100"> </progress>
			  </div>
			</div>

			<div id="previewButtonHolder" class="row hidden">
				<input type="button" id="skipPreview" class="button right" value="Start uploading now!" />
			</div>`;
	}
}
