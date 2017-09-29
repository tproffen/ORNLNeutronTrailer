'use strict';

var canvas = document.getElementById('scattering');
var context = canvas.getContext('2d');

// This is the capture size of the camera

var width=512;
var height=width;

var videoElement = document.getElementById('video');
navigator.mediaDevices.enumerateDevices().then(connectStream).then(setup).catch(handleError);	

// Mapping key strokes

document.onkeydown = function (e) {
  e = e || window.event;
  switch (e.which || e.keyCode) {
        case 13 : snapImage();   // Enter key
            break;
  }
}

//================================================================================
// Functions below
//================================================================================

function setup () {
	
	canvas.height=height; 
	canvas.width=width;
	determineSizes();

	window.addEventListener("resize", determineSizes, false);
}

function determineSizes () {
	
	var newHeight=window.innerHeight - 175;
	canvas.style.width=newHeight + 'px';
	canvas.style.height=newHeight + 'px';
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
	context.drawImage(videoElement, 0, 0, width/4, height/4);
}

function handleError(error) {
	console.log('navigator.getUserMedia error: ', error);
}