'use strict';

var screen = document.getElementById('screen');
var message = document.getElementById('message');
var footer = document.getElementById('footer');
var canvas = document.getElementById('scattering');
var context = canvas.getContext('2d');
var sampleImg;

// This is the capture size of the camera

var width=512;
var height=width;

// Countdown timer 

var clockCount=0;
var countTimer=0;
var expNumber=1;
var sample=0; 

var imageElement = document.getElementById('image');
var videoElement = document.getElementById('video');
navigator.mediaDevices.enumerateDevices().then(connectStream).then(setup).catch(handleError);	

// Build in sample images

var samples = ["images/Samples/GratingNarrow.jpg",
               "images/Samples/GratingWide.jpg",
               "images/Samples/Crystal.jpg",
               "images/Samples/Disordered.jpg",
               "images/Samples/Powder.jpg"];				   
// Mapping key strokes

document.onkeydown = function (e) {
  e = e || window.event;
  switch (e.which || e.keyCode) {
        case 13 :  // Enter
			if (clockCount===0) {expose();} 
            break;
		case 73 : // Key 'i'
			saveImage();
			break;
		case 83 :  // Key 's'
			changeSample();
			break;
  }
}

document.getElementById('inp').onchange = function(e) {
   samples.push(URL.createObjectURL(this.files[0]));
   sample = samples.length-1; 
   changeSample();
};

//================================================================================
// Functions below
//================================================================================

function saveImage() {
  var a = document.createElement("a");
  var sc = document.createElement("canvas");
  var sctx = sc.getContext("2d");
  var cssFilter = getComputedStyle(canvas).filter;
  
  sc.height = height; 
  sc.width = 2*width;  
  sctx.filter = cssFilter;
  sctx.drawImage(canvas, 0, 0);
  sctx.putImageData(sampleImg,width,0);
  
  a.download = "diffraction.png"; a.href = sc.toDataURL("image/png"); a.click();
  a.remove(); sc.remove();
  
}

function setCookie (cname, cvalue) {
	
    var d = new Date();
    d.setTime(d.getTime() + (30*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
	
}

function getCookie (cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function blankCanvas (color){

		context.beginPath();
		context.rect(0,0,width,height);
		context.fillStyle = color;
		context.fill();
}

function expose () {
	
	clockCount=1.5;
	blankCanvas("red");
	message.innerHTML = "<font color=\"#FF0000\">BEAM<br>ON</font>";
	countTimer = setInterval(countDown,500);
}

function countDown () {

	clockCount = clockCount-0.5;
	message.innerHTML = "<font color=\"#FFFF00\">Acquiring data<br>" + clockCount.toFixed(1) + " s</font>";
	
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
	
	footer.innerHTML = "Experiment #" + expNumber;
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
	
	if(sample > 0) {
		context.drawImage(imageElement, 0, 0, width, height);
		sampleImg = context.getImageData(0, 0, width, height);
		fourierTransform();
		writeValues();
	} else {
		context.drawImage(videoElement, 0, 0, width, height);
		videoElement.pause();
		sampleImg = context.getImageData(0, 0, width, height);
		fourierTransform();
		videoElement.play();
		writeValues();
	}
}

function changeSample () {

	sample++;
	if (sample > samples.length) {sample = 0};
	
	if (sample == 0) {
		imageElement.style.display="none";
		videoElement.style.display="block";
	} else {
		imageElement.src = samples[sample-1];
		videoElement.style.display="none";
		imageElement.style.display="block";
	}
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
}

function handleError(error) {
	console.log('navigator.getUserMedia error: ', error);
}


