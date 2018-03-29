'use strict';

var message = document.getElementById('message');
var footer = document.getElementById('footer');
var canvas = document.getElementById('scattering');
var context = canvas.getContext('2d');

// This is the capture size of the camera

var width=512;
var height=width;

// Countdown timer 

var clockCount=0;
var countTimer=0;
var expNumber=1;

var videoElement = document.getElementById('video');
navigator.mediaDevices.enumerateDevices().then(connectStream).then(setup).catch(handleError);	

// Mapping key strokes

document.onkeydown = function (e) {
  e = e || window.event;
  switch (e.which || e.keyCode) {
        case 13 : if (clockCount===0) {expose();}   // Enter key
            break;
  }
}

//================================================================================
// Functions below
//================================================================================

function blankCanvas (color){

		context.beginPath();
		context.rect(0,0,width,height);
		context.fillStyle = color;
		context.fill();
}

function expose () {
	
	clockCount=2.5;
	blankCanvas("red");
	message.innerHTML = "<font color=\"#FF0000\">BEAM<br>ON</font>";
	countTimer = setInterval(countDown,500);
}

function countDown () {

	clockCount = clockCount-0.5;
	message.innerHTML = "<font color=\"#FFFF00\">Aquiring data<br>" + clockCount.toFixed(1) + " s</font>";
	
	if (clockCount<=0) {
		clearInterval(countTimer);
		message.innerHTML = "<font color=\"#00FF00\">BEAM<br>OFF</font>";
		snapImage();
		
		expNumber++;
		footer.innerHTML = "Experiment #" + expNumber;
	}
}

function setup () {
	
	canvas.height=height; 
	canvas.width=width;
	
	blankCanvas("green");
	readValues();
	
	window.addEventListener("unload", writeValues, false);
}

function writeValues () {
	
	setCookie('expNumber', expNumber);
}

function readValues () {

    var val;
	if (val=getCookie('expNumber')) {expNumber = val}
}

function connectStream() {
	
	if (window.stream) {
		window.stream.getTracks().forEach(function(track) {track.stop();});
	}
	
	var constraints = {video: {width: {ideal: width}, height: {ideal: height}}};
	navigator.mediaDevices.getUserMedia(constraints)
		.then(function(mediaStream) {videoElement.srcObject = mediaStream;}).catch(handleError);
}

function snapImage () {
	
	context.drawImage(videoElement, 0, 0, width, height);
	videoElement.pause();
	fourierTransform();
	videoElement.play();
}

function fourierTransform () {
	
	var img = context.getImageData(0, 0, width, height);
	var i;
	var ampReal = [];
	var ampImag = [];
	
	FFT.init(width);
	FrequencyFilter.init(width);
	SpectrumViewer.init(context);
	
	for(var y=0; y<height; y++) {
		i = y*width;
		for(var x=0; x<width; x++) {
			ampReal[i + x] = Math.sqrt(img.data[(i << 2) + (x << 2)]);
			ampImag[i + x] = 0.0;
		}
	}
	
	FFT.fft2d(ampReal, ampImag); 					// calculate the 2D FFT
    FrequencyFilter.swap(ampReal, ampImag); 		// origin in the middle
	SpectrumViewer.render(ampReal, ampImag, true);	// render the result
	//context.drawImage(videoElement, 0, 0, width/4, height/4);
}

function handleError(error) {
	console.log('navigator.getUserMedia error: ', error);
}