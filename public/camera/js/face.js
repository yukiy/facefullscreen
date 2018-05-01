var webGLContext;

let faceClm;


function adjustVideoProportions() {
	// resize overlay and video if proportions are not 4:3 keep same height, just change width
	var proportion = vid.videoWidth/vid.videoHeight;
	vid.width = Math.round(vid.height * proportion);
	webglCvs.width = vid.width;
	webGLContext.viewport(0,0,webGLContext.canvas.width,webGLContext.canvas.height);
}

function gumSuccess ( stream ) {
	// add camera stream if getUserMedia succeeded
	if ("srcObject" in vid) {
		vid.srcObject = stream;
	} else {
		vid.src = (window.URL && window.URL.createObjectURL(stream));
	}

	vid.onloadedmetadata = function() {
		//adjustVideoProportions();
		//faceClm.fd.init(webglCvs);
		vid.play();
	}

	vid.onresize = function() {
		//adjustVideoProportions();
		//faceClm.fd.init(webglCvs);
		if (faceClm.trackingStarted) {
			faceClm.ctrack.stop();
			faceClm.ctrack.reset();
			faceClm.ctrack.start(vid);
		}
	}
}

function gumFail () {
	alert("There was some problem trying to fetch video from your webcam, using a fallback video instead.");
}


function setupWebcam (callback)
{
	faceClm = new Clm();

/*
	// check whether browser supports webGL
	if (window.WebGLRenderingContext) {
		webGLContext = webglCvs.getContext('webgl') || webglCvs.getContext('experimental-webgl');
		if (!webGLContext || !webGLContext.getExtension('OES_texture_float')) {
			webGLContext = null;
		}
	}
	if (webGLContext == null) {
		alert("Your browser does not seem to support WebGL. Unfortunately this face mask example depends on WebGL, so you'll have to try it in another browser. :(");
	}
*/

	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
	window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;

	// check for camerasupport
	if (navigator.mediaDevices) {
		navigator.mediaDevices.getUserMedia({video : true}).then(gumSuccess).catch(gumFail);
	} else if (navigator.getUserMedia) {
		navigator.getUserMedia({video : true}, gumSuccess, gumFail);
	} else {
		alert("Your browser does not seem to support getUserMedia, using a fallback video instead.");
	}


	vid.addEventListener('canplay', ()=>{
		var startbutton = document.getElementById('start_btn');
		startbutton.innerHTML = "start";
		startbutton.disabled = null;
		callback();
		startbutton.addEventListener("click", () => {
			isTrackOn = true;
			faceClm.startVideo();
			initThreeObjects();
			startbutton.disabled = true;
		})
	}, false);
}



/*********** Code for face tracking and face masking *********/

class Clm
{
	constructor ()
	{
		this.a = 0;

		this.ctrack = new clm.tracker();
		this.fd = new faceDeformer();

		this.trackingStarted = false;
		this.originalPositions = null;
		this.positions = null;
		this.center = null;
		this.currentMask = 0;
		this.animationRequest;
		this.isLoaded = false;

		this.ctrack.init(pModel);
	}


	startVideo () {
		vid.play();
		//this.ctrack.start(videoCvs);
		this.ctrack.start(vid);
		this.trackingStarted = true;
		//this.drawGridLoop();
	}

	update () {
		this.originalPositions = this.ctrack.getCurrentPosition();
		if(this.originalPositions[62]){
			this.positions = this.originalPositions;
			this.center = this.originalPositions[62];
			this.addOffsetPositions();
		}
		//requestAnimFrame(this.update.bind(this));
	}

	addOffsetPositions () {
		let x,y,scale;

		//---add outside offset
		scale = 1.2;

		//---add positions[71]-[93]
		for( let i=0; i<23; i++){
			const distance = Math.sqrt( 
				(this.positions[i][0] - this.center[0]) * (this.positions[i][0] - this.center[0])
				+ (this.positions[i][1] - this.center[1]) * (this.positions[i][1] - this.center[1])
			)
			const angle = Math.atan2(this.positions[i][1] - this.center[1], this.positions[i][0] - this.center[0] )
			const newDistance = distance * scale;
			x = Math.cos(angle) * newDistance + this.center[0];
			y = Math.sin(angle) * newDistance + this.center[1];
			this.positions.push([x, y]);
		}

		//---add positions[94]
		x = (this.positions[89][0] + this.positions[93][0]) / 2;
		y = (this.positions[89][1] + this.positions[93][1]) / 2;
		this.positions.push([x, y]);


		//---add inside offset
		scale = 0.9;

		//---add positions[95]-[117]
		for( let i=0; i<23; i++){
			const distance = Math.sqrt( 
				(this.positions[i][0] - this.center[0]) * (this.positions[i][0] - this.center[0])
				+ (this.positions[i][1] - this.center[1]) * (this.positions[i][1] - this.center[1])
			)
			const angle = Math.atan2(this.positions[i][1] - this.center[1], this.positions[i][0] - this.center[0] )
			const newDistance = distance * scale;
			x = Math.cos(angle) * newDistance + this.center[0];
			y = Math.sin(angle) * newDistance + this.center[1];
			this.positions.push([x, y]);
		}

		//---add positions[118]
		x = (this.positions[113][0] + this.positions[117][0]) / 2;
		y = (this.positions[113][1] + this.positions[117][1]) / 2;
		this.positions.push([x, y]);

	}

	//---NOT WORKED
	// minusOffsetPositions () {
	// 	console.log("of"+this.a);
	// 	this.a++;
	// 	//for( let i=15; i<23; i++){
	// 	let x,y;
	// 	const scale = 1;
	// 	//---add positions[71]-[93]
	// 	for( let i=0; i<23; i++){
	// 		const distance = Math.sqrt( 
	// 			(this.positions[i][0] - this.center[0]) * (this.positions[i][0] - this.center[0])
	// 			+ (this.positions[i][1] - this.center[1]) * (this.positions[i][1] - this.center[1])
	// 		)
	// 		const angle = Math.atan2(this.positions[i][1] - this.center[1], this.positions[i][0] - this.center[0] )
	// 		const newDistance = distance * scale;
	// 		x = Math.cos(angle) * newDistance + this.center[0];
	// 		y = Math.sin(angle) * newDistance + this.center[1];
	// 		this.positions[i][0] = x;
	// 		this.positions[i][1] = y;
	// 	}
	// }

	draw () {
		/*
		const pn = this.ctrack.getConvergence();
		if (pn < 0.4) {
			this.exportToText(this.positions);
			this.exportToImg(this.resultCvs);
			this.exportToImg(this.videoCvs);
			this.fd.load(vid, this.positions, pModel);
			this.drawMask;
		} else {
			this.drawGrid;
		}
		*/
	}

	drawGrid (canvas) {
		canvas.getContext.clearRect(0, 0, canvas.width, canvas.height);
		if (this.positions) {
			this.ctrack.draw(canvas);
		}
	}

	drawMask () {
		if (positions) {
			this.fd.draw(this.positions);
		}
	}

	exportToText (positions) {
		let str = "";
		str += "[";
		for(let i=0; i<positions.length; i++){
			str += "["+ positions[i][0] +","+ positions[i][1] +"],";
		}
		str += "]";
		console.log(str);
		//$("#positionArray").html(str);
	}

	exportToImg (cvs) {
		const photo = document.createElement("img");
		document.getElementById("result").appendChild(photo);
		const data = cvs.toDataURL('image/png');					
		photo.setAttribute('src', data);				
	}

}




