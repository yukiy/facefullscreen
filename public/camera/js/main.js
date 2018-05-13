"use strict";

//todo まゆげのあたり調整

var camera, scene, renderer;

let vid;
let webglCvs;
let videoCvs, videoCtx;
let resultCvs, resultCtx;

let faceClm;

const vidW = 640;
const vidH = 480;
let dotMeshes = [];
let isLandscape;
let isTrackOn = false;
let isWebcamOn = false;
let isOverWireframe = false;
let isShowDots = false;
let isPosting = false;


//---デバッグ用ワイヤフレーム
function drawPointsOnCanvas (context, positions, isWireframe=false)
{
	if(!positions || positions==undefined) return;

	context.clearRect(0, 0, vid.width, vid.height);
	let x, y;
	for(let i=0; i<positions.length; i++){
		x = positions[i][0];
		y = positions[i][1];
		context.fillStyle = "rgb(200, 0, 0)";
		context.fillRect(x, y, 3, 3);
	}

	if(isWireframe){
		for(let i=0; i<faceFaceArray.length; i++){
			const x1 = positions[ faceFaceArray[i][0] ] [0];
			const y1 = positions[ faceFaceArray[i][0] ] [1];
			const x2 = positions[ faceFaceArray[i][1] ] [0];
			const y2 = positions[ faceFaceArray[i][1] ] [1];
			const x3 = positions[ faceFaceArray[i][2] ] [0];
			const y3 = positions[ faceFaceArray[i][2] ] [1];

			context.beginPath();
			context.moveTo(x1, y1);
			context.lineTo(x2, y2);
			context.lineTo(x3, y3);
			context.lineTo(x1, y1);
			context.stroke();
		}
	}
}

//---UI用ワイヤフレーム
function drawPointsOnCanvas2 (context, positions, isWireframe=false)
{
	if(!positions || positions==undefined) return;

	context.clearRect(0, 0, vid.width, vid.height);
	let x, y;
	for(let i=0; i<positions.length; i++){
		if( 71 <= i && i <= 118) continue

		x = positions[i][0];
		y = positions[i][1];
		context.fillStyle = "#ffffff";
		context.shadowColor = "#ffffff";
		context.shadowBlur = 10;
		//context.fillRect(x, y, 3, 3);
		context.beginPath();
		context.arc(x, y, 2, 0, Math.PI*2, false);
		context.fill();
	}

	if(isWireframe){
		context.strokeStyle = "rgb(255, 255, 255)";
		for(let i=0; i<faceFaceArray.length; i++){
			const x1 = positions[ faceFaceArray[i][0] ] [0];
			const y1 = positions[ faceFaceArray[i][0] ] [1];
			const x2 = positions[ faceFaceArray[i][1] ] [0];
			const y2 = positions[ faceFaceArray[i][1] ] [1];
			const x3 = positions[ faceFaceArray[i][2] ] [0];
			const y3 = positions[ faceFaceArray[i][2] ] [1];

			context.beginPath();
			context.moveTo(x1, y1);
			context.lineTo(x2, y2);
			context.lineTo(x3, y3);
			context.lineTo(x1, y1);
			context.stroke();
		}
	}
}



function setupWebcam (callback)
{
	var gumSuccess = (stream) => {
		// add camera stream if getUserMedia succeeded
		if ("srcObject" in vid) {
			vid.srcObject = stream;
		} else {
			vid.src = (window.URL && window.URL.createObjectURL(stream));
		}

		vid.onloadedmetadata = function() {
			vid.play();
		}

		vid.onresize = function() {
			if (faceClm.trackingStarted) {
				faceClm.ctrack.stop();
				faceClm.ctrack.reset();
				faceClm.ctrack.start(vid);
			}
		}
	}

	var gumFail = () => {
		alert("There was some problem trying to fetch video from your webcam, using a fallback video instead.");
	}


/*
	//---check whether browser supports webGL
	var webGLContext;
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

	navigator.mediaDevices.enumerateDevices().then( (devices)=>
	{
		let deviceId;

		for(let i=0; i<devices.length; i++){
			const label = devices[i].label;
			const kind = devices[i].kind;
			if(kind=="videoinput" && label.indexOf("C922") > -1 ){
				deviceId = devices[i].deviceId;
			}
		}

        const constraints = {
            video: {deviceId: deviceId ? {exact: deviceId} : undefined}
        };

        //const constraints = { video : true};

		// check for camerasupport
		// if (navigator.mediaDevices) {
		// 	navigator.mediaDevices.getUserMedia({video : true}).then(gumSuccess).catch(gumFail);
		// } else if (navigator.getUserMedia) {
		// 	navigator.getUserMedia({video : true}, gumSuccess, gumFail);
		if (navigator.mediaDevices) {
			navigator.mediaDevices.getUserMedia(constraints).then(gumSuccess).catch(gumFail);
		} else if (navigator.getUserMedia) {
			navigator.getUserMedia(constraints, gumSuccess, gumFail);
		} else {
			alert("Your browser does not seem to support getUserMedia, using a fallback video instead.");
		}

		vid.addEventListener('canplay', ()=>{
			callback();
		}, false);
	});
}


function setupCanvas ()
{
	const winW = window.innerWidth;
	const winH = window.innerHeight;

	//---webcam from rtc 
	vid = document.getElementById('videoel');
	vid.width = vidW;
	vid.height = vidH;

	//---canvas for rendered video
	videoCvs = document.getElementById("videoCvs");
	videoCvs.width = vidW;//---実際のpixelサイズ
	videoCvs.height = vidH;
	videoCtx = videoCvs.getContext("2d");
	$("#videoCvs").width(winW);//---ブラウザ表示のサイズ
	$("#videoCvs").height(winH);


	//----canvas to draw points
	resultCvs = document.getElementById("resultCvs");
	resultCvs.width = vidW;//---実際のpixelサイズ
	resultCvs.height = vidH;
	resultCtx = resultCvs.getContext("2d");
	$("#resultCvs").width(winW);//---ブラウザ表示のサイズ
	$("#resultCvs").height(winH);


	//---canvas for threejs
	// const webglCvsW = 1024;
	// const webglCvsH = 576;
	const webglCvsW = "100%";
	const webglCvsH = "100%";
	$("#webgl").width(webglCvsW);
	$("#webgl").height(webglCvsH);
	webglCvs = document.getElementById("webgl");
	webglCvs.width = webglCvsW;
	webglCvs.height = webglCvsH;

}


function createRenderer (domId)
{
	renderer = new THREE.WebGLRenderer( { 
		antialias: true,
		preserveDrawingBuffer: true //---to export jpg
	} );
	const domW = $("#"+domId).width();
	const domH = $("#"+domId).height();
	isLandscape = (domW - domH) > 0 ? true : false;
	renderer.setSize( domW, domH );
	document.getElementById(domId).appendChild( renderer.domElement );
}


function setupEvents ()
{
	const post = ()=> {
	//	isPosting = true;
		$("#whitescreen").show();
		$("#whitescreen").fadeOut(2000);

		//saveCanvas("webgl", "test.jpg", true);
		const n = new Date();
		const filename = n.getFullYear() + ("0"+(n.getMonth()+1)).slice(-2) + ("0"+n.getDate()).slice(-2)
					   +"_" 
					   + ("0"+n.getHours()).slice(-2) + ("0"+n.getMinutes()).slice(-2) + ("0"+n.getSeconds()).slice(-2);

		//postCanvas("webgl", filename+".jpg", true);
		//postVideo("webgl", filename+".mp4");
		postImageAndVideo("webgl", filename);
	}

	const startWebcam = () => {
		var startbutton = document.getElementById('start_btn');
		startbutton.innerHTML = "start";
		startbutton.disabled = null;
		isWebcamOn = true;
	}

	const startTracking = () => {
		isTrackOn = true;
		faceClm.startVideo(vid);
		initThreeObjects();
		$("#start_btn").attr("disabled", true);
	}

	$("#cameraOn_btn").click( () => {
		$("#cameraOn_btn").attr("disabled", true);
		setupWebcam ( () => {
			startWebcam();
		});
	});

	$("#overWire_btn").click( () => {
		if(isOverWireframe) {
			isOverWireframe = false;
			//$("#resultCvs").hide();
		}else {
			isOverWireframe = true;
			//$("#resultCvs").show();
		}
	});

	$("#exportJpg_btn").on("click touchstart", () => {
		post();
	});

	$("#showCameraCanvas_btn").click( ()=> {
		$("#canvasArea").toggle();
	})

	$("#showResult_btn").click( ()=> {
		$("#webglArea").toggle();
	})

	$("#start_btn").click( () => {
		startTracking();
	})


	let isTouchHold = false;
	$(window).keypress((e)=>{
		//console.log(e.keyCode);
		if(e.keyCode == 100){//---enter
			$("#debugCtrl").toggle();
		}

		if(e.keyCode == 119){//---w
			(isOverWireframe) ? isOverWireframe = false : isOverWireframe = true;
		}

		if(e.keyCode == 32){//---space
			$("#cameraOn_btn").attr("disabled", true);
			setupWebcam ( () => {
				startWebcam();
				startTracking();
				$("#webglArea").toggle();
			});
		}

		if(e.keyCode == 99){
			if(!isTouchHold && isWebcamOn && !isPosting){
				post();
				isTouchHold = true;
			}
		}
	})

	$(window).keyup((e)=>{
		if(e.keyCode == 67){
			isTouchHold = false;
		}
	})


	$(window).resize(()=>{
		//---全画面
		const width = window.innerWidth;
		const height = window.innerHeight;

		$("#videoCvs").width(width);
		$("#videoCvs").height(height);

		$("#resultCvs").width(width);
		$("#resultCvs").height(height);

		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(width, height);

	});

	document.addEventListener("keydown", function(e) {
		if (e.keyCode == 13) {
			if (!document.webkitFullscreenElement) {
				document.documentElement.webkitRequestFullscreen();
			}
			else {
				if (document.webKitExitFullscreen) {
					document.webKitExitFullscreen(); 
				}
			}
		}
	}, false);
}




function animate ()
{
	requestAnimationFrame( animate );

	if(isWebcamOn){
		videoCtx.drawImage(vid, 0, 0, videoCvs.width, videoCvs.height);
	}

	if(isTrackOn){
		faceClm.update();

		//---scoreが低いときは全顔面にしない
		if(faceClm.ctrack.getScore() > 0.4){
			updateThreeObjects();
			$("#webglArea").show();
			$("#instr2").show();
			$("#instr1").hide();
		}
		else{
			//drawPointsOnCanvas(resultCtx, faceClm.positions, true);
			drawPointsOnCanvas2(resultCtx, faceClm.positions, false);
			$("#webglArea").hide();
			$("#instr1").show();
			$("#instr2").hide();
		}

	}

	renderer.render( scene, camera );
}


function init ()
{
	setupCanvas();

	scene = new THREE.Scene();
	//---THREE.OrthographicCamera ( left, right, top, bottom, near, far )
	//camera = new THREE.OrthographicCamera(-1, 1, 1*domH/domW, -1*domH/domW, 0.01, 2);//---縦横比を考慮,この場合vertexの座標も要考慮する
	//camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0.01, 2);//---それぞれ縦幅を1,横幅を1としたとき
	camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.01, 2);//---それぞれ縦幅を1,横幅を1としたとき
    camera.position.set(0, 0, 2);

	createRenderer("webgl");

	faceClm = new Clm();

	$("#webglArea").hide();//---作成してから非表示にする
	$("#debugCtrl").hide();

	setupEvents();
}


$(function(){
	init();
	animate();
})

