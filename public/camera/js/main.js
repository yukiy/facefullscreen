"use strict";

//todo 顔をよらせる
//todo まゆげのあたり調整

var camera, scene, renderer;
let faceGeo, faceMat, faceMes;
let faceTex;
let wireMesh;

let vid;
let webglCvs;
let videoCvs, videoCtx;
let resultCvs, resultCtx;

let faceGlPos;

let debugDot;

// const width = 640;
// const height = 480;

const vidW = 640;
const vidH = 480;
let dotMeshes = [];
let isLandscape;
let isTrackOn = false;
let isWebcamOn = false;
let isOverWireframe = false;
let isShowDots = true;
let isShowDebugDot = false;


function updateDotPosition (id, position)
{
	dotMeshes[id].position.set(position.x, position.y, position.z);
}


function getGlPositions (pixelPositions)
{
	const dom = $("#numbers");
	let glPositions = [];
	let x, y, z;
	for (let i=0; i<pixelPositions.length; i++){
		/*//---縦横比も反映する場合
		if(isLandscape){
			x = pixelPositions[i][0] / vidW * 2;
			y = 1 - pixelPositions[i][1] / vidH * 2 * vidH/vidW;
		}else{
			x = pixelPositions[i][0] / vidW * 2 * vidW/vidH;
			y = 1 - pixelPositions[i][1] / vidH * 2;			
		}
		*/

		// x = pixelPositions[i][0] / vidW * 2;
		// y = 1 - pixelPositions[i][1] / vidH * 2;
		x = pixelPositions[i][0] / vidW;
		y = 1 - pixelPositions[i][1] / vidH;
		z = 0;

		glPositions.push( new THREE.Vector3( x, y, z));
	}

	return glPositions;
}


function centerize (glPositions)
{
	//---62を中心にする
	const gapX = glPositions[62].x;
	const gapY = glPositions[62].y;
	for (let i=0; i<glPositions.length; i++){
		glPositions[i].x -= gapX;
		glPositions[i].y -= gapY;
	}
	return glPositions;
}


function flip (glPositions)
{
	for (let i=0; i<glPositions.length; i++){
		glPositions[i].y = 1 - glPositions[i].y;
	}
	return glPositions;
}


function extend (glPositions)
{
	for (let i=0; i<glPositions.length; i++){
		const xy = calcExtend(i, glPositions[i].x, glPositions[i].y);
		glPositions[i].x = xy.x;
		glPositions[i].y = xy.y;
	}
	//---[0]-[15]をメッシュの中間点にする場合
	// for(let i=0; i<15; i++){
	// 	const xy = getMiddlePoint(glPositions[i+71], glPositions[i+95]);
	// 	glPositions[i].x = xy.x;
	// 	glPositions[i].y = xy.y;
	// }

	return glPositions;
}


function getMiddlePoint (p1, p2)
{
	return { x: (p1.x+p2.x)/2, 
			 y: (p1.y+p2.y)/2 }
}


function calcExtend (id, x, y)
{
	/*
	//中心が0,0 範囲が-1から1のとき
	if (x == 0 && y == 0)  return {x:x, y:y};
	if (id > 22) return {x:x, y:y};
	if (id == 0) return {x:-1, y:1};
	if (id == 4) return {x:-1, y:-1};
	if (id == 10) return {x:1, y:-1};
	if (id == 14) return {x:1, y:1};

	let direction;
	if(Math.abs(x) > Math.abs(y)) direction = "LR";
	else direction = "TB";

	let maxX = x;
	let maxY = y;
	if(direction == "LR"){
		maxX = (x > 0) ? 1 : -1 ;
		maxY = y/x * maxX;
	}else{
		maxY = (y > 0) ? 1 : -1 ;
		maxX = x/y * maxY;
	}
	*/

	//中心が0,0 範囲が-0.5から0.5のとき
	const maxNum =  0.5;
	const minNum = -0.5;
	const leftTopPos     = {x: minNum, y: maxNum};
	const rightTopPos    = {x: maxNum, y: maxNum};
	const leftBottomPos  = {x: minNum, y: minNum};
	const rightBottomPos = {x: maxNum, y: minNum};

	if (x == 0 && y == 0)  return {x:x, y:y};

	// const leftTopIds     = [ 0, 71,  95];
	// const rightTopIds    = [14, 85, 109];
	const leftTopIds     = [19, 90, 114];
	const rightTopIds    = [15, 86, 110];
	const leftBottomIds  = [4,  75, 99];
	const rightBottomIds = [10, 81, 105];

	// if (id==leftTopIds[0]    || id==leftTopIds[1]     || id==leftTopIds[2]) return leftTopPos;
	// if (id==rightTopIds[0]   || id==rightTopIds[1]    || id==rightTopIds[2]) return rightTopPos;
	if (id==leftTopIds[1] ) return leftTopPos;
	if (id==rightTopIds[1] ) return rightTopPos;
	if (id==leftBottomIds[0] || id==leftBottomIds[1]  || id==leftBottomIds[2]) return leftBottomPos;
	if (id==rightBottomIds[0]|| id==rightBottomIds[1] || id==rightBottomIds[2]) return rightBottomPos;


	if ( id < 15 || (70 < id && id < 110)){
	//if ( id > 70 && id < 95 ){
		let direction;

		//(Math.abs(x) > Math.abs(y)) ? direction = "LR" : "TB";

		if( ( 0 <= id && id < leftBottomIds[0]) || (rightBottomIds[0] < id && id < rightTopIds[0])
		 || (71 <= id && id < leftBottomIds[1]) || (rightBottomIds[1] < id && id < rightTopIds[1])
		 || (95 <= id && id < leftBottomIds[2]) || (rightBottomIds[2] < id && id < rightTopIds[2])
		){
			direction = "LR";	
		}else{
			direction = "TB";
		}

		let newX = x;
		let newY = y;
		if(direction == "LR"){
			newX = (x > 0) ? maxNum : minNum ;
			newY = y/x * newX;
		}else{
			newX = x/y * newY;
			newY = (y > 0) ? maxNum : minNum;
		}

		if(newX > maxNum) newX = maxNum;
		if(newY > maxNum) newY = maxNum;
		if(newX < minNum) newX = minNum;
		if(newY < minNum) newY = minNum;

		return {x: newX, y:newY};
	}
	else {
		return {x:x, y:y};
	}

	/*
	//中心が0.5,0.5 範囲が0から1のとき
	if (x == 0 && y == 0)  return {x:x, y:y};
	if (id > 22) return {x:x, y:y};
	if (id == 0) return {x:0, y:1};
	if (id == 4) return {x:0, y:0};
	if (id == 10) return {x:1, y:0};
	if (id == 14) return {x:1, y:1};

	let direction;
	if(Math.abs(x-0.5) > Math.abs(y-0.5)) direction = "LR";
	else direction = "TB";

	const p = new THREE.Vector2(x, y);

	// let y, x;
	// 0 - 0.5 = (p.y-0.5 / p.x-0.5) (x-0.5);
	// -0.5 =  ((p.y-0.5) / (p.x-0.5) * x) - ((p.y-0.5) / (p.x-0.5) * -0.5);
	// 0 =  ((p.y-0.5) / (p.x-0.5) * x) - ((p.y-0.5) / (p.x-0.5) * -0.5) + 0.5;
	// ((p.y-0.5) / (p.x-0.5) * x) =  ((p.y-0.5) / (p.x-0.5) * -0.5) - 0.5;
	maxX = ( ((y-0.5) / (x-0.5) * -0.5) - 0.5 ) / (y-0.5) / (x-0.5)

	let maxX = x;
	let maxY = y;
	if(direction == "LR"){
		if(x > 0.5) {
			maxX = 1 ;
			maxY = y/x;
		}
		else {	
			maxX = 0;
			maxY = -x/y;
		}
	}else{
		if(y > 0.5) {
			maxX = x/y;
			maxY = 1 ;
		}
		else {	
			maxX = -y/x;
			maxY = 0;
		}
	}
	*/

}


function createLabelTexture (str, isBackground=false)
{
	const cvs = document.createElement("canvas");
	cvs.width  = 32;
	cvs.height = 32;
	const cxt = cvs.getContext("2d");

	if(isBackground){
		cxt.fillStyle =  "#ffffff";
		cxt.fillRect(0, 0, cvs.width, cvs.height);
	}

	cxt.font = "32px 'Monotype'";
	cxt.textAlign = "center";
	cxt.textBaseline = "middle";
	cxt.fillStyle = "#ff0000";
	cxt.fillText(str, cvs.width/2, cvs.height/2, cvs.width);

	const texture = new THREE.CanvasTexture(cvs);

//	const texture = new THREE.Texture(cvs);
//	texture.needsUpdate = true;
	return texture;
}


function createSprite (str, size, x, y, z)
{
	var tex = createLabelTexture(str, true);
	var mat = new THREE.SpriteMaterial( { map: tex } );
	var sprite = new THREE.Sprite( mat );
	sprite.scale.set(size, size, size);
	sprite.position.set(x, y, z);
	scene.add( sprite );
	return sprite;
}


function createDot (size, x, y, z)
{
	const dotGeo = new THREE.PlaneGeometry(size, size);
	const dotMat = new THREE.MeshBasicMaterial({color: 0xff0000});
	const dotMes = new THREE.Mesh(dotGeo, dotMat);
	dotMes.position.set(x, y, z);
	scene.add(dotMes);
	return dotMes;
}


function createDots (glPositions)
{
	for (let i=0; i<glPositions.length; i++){
		const dot = createSprite(i, 0.02, glPositions[i].x, glPositions[i].y, glPositions[i].z);
		//const dot = createDot(0.1, glPositions[i].x, glPositions[i].y, glPositions[i].z);
		dotMeshes.push( dot );
	}
}

function updateDots (glPositions)
{
	for (let i=0; i<glPositions.length; i++){
		dotMeshes[i].position.set( glPositions[i].x, glPositions[i].y, glPositions[i].z );
		(isShowDots)? dotMeshes[i].visible = true : dotMeshes[i].visible = false;
	}	
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


function createGeometry (verticesVec3, vertexIdOrder)
{
	const faceGeo = new THREE.Geometry();

	//---vertexを作成
	for (let i=0; i<verticesVec3.length; i++){
		faceGeo.vertices.push( verticesVec3[i] );
	}

	//---vertexを結んでfaceを作成
	for (let i=0; i<vertexIdOrder.length; i++){
		faceGeo.faces.push( new THREE.Face3(vertexIdOrder[i][0], vertexIdOrder[i][1], vertexIdOrder[i][2]) )		
	}

	faceGeo.computeFaceNormals();
	faceGeo.computeVertexNormals();

	return faceGeo;
}


function createMaterial (geo, tex, pxPositions)
{
	//---画像上のfaceの座標３点を指定
	for(let i=0; i<faceFaceArray.length; i++){
			geo.faceVertexUvs[0][i] = [
				new THREE.Vector2( pxPositions[ faceFaceArray[i][0] ] [0] / vidW,  1.0 - pxPositions[ faceFaceArray[i][0] ] [1] / vidH ),
				new THREE.Vector2( pxPositions[ faceFaceArray[i][1] ] [0] / vidW,  1.0 - pxPositions[ faceFaceArray[i][1] ] [1] / vidH ),
				new THREE.Vector2( pxPositions[ faceFaceArray[i][2] ] [0] / vidW,  1.0 - pxPositions[ faceFaceArray[i][2] ] [1] / vidH ),
				new THREE.Vector2( pxPositions[ faceFaceArray[i][3] ] [0] / vidW,  1.0 - pxPositions[ faceFaceArray[i][3] ] [1] / vidH ),
			];
	}

	// //---texture をvideoにする
	
	vid = document.getElementById('videoel');
	const videTex = new THREE.VideoTexture( vid );
	videTex.minFilter = THREE.LinearFilter;
	videTex.magFilter = THREE.LinearFilter;
	videTex.format = THREE.RGBFormat;
	const mat = new THREE.MeshBasicMaterial({map:videTex, side: THREE.DoubleSide});
	

	/*
	const mat = new THREE.MeshBasicMaterial({map:tex, side: THREE.DoubleSide});
	*/
	return mat;
}


function createWireMesh (geo)
{
	const wireMat = new THREE.MeshBasicMaterial({color: 0x8888ff, wireframe: true});
	return new THREE.Mesh(geo, wireMat);
}


function setInputNumbers (glPositions)
{
	for (let i=0; i<glPositions.length; i++){
		const x = glPositions[i].x.toFixed(4);
		const y = glPositions[i].y.toFixed(4);
		$("#numbers").append( i + ":<input type='text' value='"+x+"' />,<input type='text' value='"+y+"'/>" );
		if(i % 4 == 3 ) $("#numbers").append("<br/>");
	}
}


function getGlPositionsFromInput ()
{
	let glPositions = [];
	const domList = $("#numbers").children("input[type='text']");
	for(let i=0; i<domList.length; i+=2){
		const x = Number(domList[i].value);
		const y = Number(domList[i+1].value);
		const z = 0;
		glPositions.push( new THREE.Vector3( x, y, z) );
	};
	return glPositions;
}


function updatePolygon (glPositions)
{
	if(faceClm.positions.length > 0) {
		updateVertexUvs (glPositions);//---カメラ画像のUVマップを更新
		faceGlPos = centerize(glPositions);
		faceGlPos = extend(faceGlPos);
		//setInputNumbers(faceGlPos);
		updateVertices(faceGlPos);
	}
}


function updateVertices (glPositions)
{
	for(let i=0; i<glPositions.length; i++){
		faceMes.geometry.vertices[i].set(glPositions[i].x, glPositions[i].y, glPositions[i].z);
	}
	faceMes.geometry.computeFaceNormals();
	faceMes.geometry.computeVertexNormals();
	faceMes.geometry.verticesNeedUpdate = true;
}


function updateVertexUvs (glPositions)
{
	let newUvsMap = [];
	for(let i=0; i<faceFaceArray.length; i++){
		newUvsMap.push([
			glPositions[ faceFaceArray[i][0] ],
			glPositions[ faceFaceArray[i][1] ],
			glPositions[ faceFaceArray[i][2] ],
			glPositions[ faceFaceArray[i][3] ],
		]);		
	}

	for(let i=0; i<newUvsMap.length; i++){
		updateUvs(faceMes.geometry.faceVertexUvs[0][i], newUvsMap[i]);
	}
	/*
	for(let i=0; i<faceFaceArray.length; i++){
		faceGeo.faceVertexUvs[0][i] = [
			// new THREE.Vector2( vidImagePositions[ faceFaceArray[i][0] ] [0] / vidW,  1.0 - vidImagePositions[ faceFaceArray[i][0] ] [1] / vidH ),
			// new THREE.Vector2( vidImagePositions[ faceFaceArray[i][1] ] [0] / vidW,  1.0 - vidImagePositions[ faceFaceArray[i][1] ] [1] / vidH ),
			// new THREE.Vector2( vidImagePositions[ faceFaceArray[i][2] ] [0] / vidW,  1.0 - vidImagePositions[ faceFaceArray[i][2] ] [1] / vidH )
			new THREE.Vector2( glPositions[ faceFaceArray[i][0] ].x,  1.0 - glPositions[ faceFaceArray[i][0] ].y ),
			new THREE.Vector2( glPositions[ faceFaceArray[i][1] ].x,  1.0 - glPositions[ faceFaceArray[i][1] ].y ),
			new THREE.Vector2( glPositions[ faceFaceArray[i][2] ].x,  1.0 - glPositions[ faceFaceArray[i][2] ].y )
		];
	}
	*/
	faceMes.geometry.uvsNeedUpdate = true;
	faceMes.geometry.elementNeedUpdate = true;
}


function updateUvs (currentUvs, newUvs)
{
	/*
	currentUvs = newUvs;//---これはうごかなかった。
	*/
//	console.log(newUvs[0]);
	if(newUvs[0].x){ //---newUvsがVec2
		currentUvs[0].x = newUvs[0].x;
		currentUvs[0].y = newUvs[0].y;
		currentUvs[1].x = newUvs[1].x;
		currentUvs[1].y = newUvs[1].y;
		currentUvs[2].x = newUvs[2].x;
		currentUvs[2].y = newUvs[2].y;
	}
	else if(newUvs.length > 0 && newUvs.length[0] > 0){ //---newUvsがArray
		currentUvs[0].x = newUvs[0][0];
		currentUvs[0].y = newUvs[0][1];
		currentUvs[1].x = newUvs[1][0];
		currentUvs[1].y = newUvs[1][1];
		currentUvs[2].x = newUvs[2][0];
		currentUvs[2].y = newUvs[2][1];		
	}
}


function updateTexture ()
{
	const videTex = new THREE.VideoTexture( vid );
	videTex.minFilter = THREE.LinearFilter;
	videTex.magFilter = THREE.LinearFilter;
	videTex.format = THREE.RGBFormat;

	faceMes.material.map = videTex;
	faceMes.material.map.needsUpdate = true;
	faceTex.needsUpdate = true;
}


function initThreeObjects () 
{
	let initGlPositions = [];
	for(let i=0; i<verticesNum; i++){
		initGlPositions.push( new THREE.Vector3( 0, 0, 0) );
	}
	//let glPositions = getGlPositions(imagePositions);
	//glPositions = centerize(glPositions);
	//glPositions = extend(glPositions);//
	//setInputNumbers(glPositions);

	//faceTex = new THREE.TextureLoader().load('sampleface.png');
	faceGeo = createGeometry(initGlPositions, faceFaceArray);
	faceTex = new THREE.Texture(videoCvs);
	faceMat = createMaterial(faceGeo, faceTex, initGlPositions);
	faceMes = new THREE.Mesh(faceGeo, faceMat);
	scene.add(faceMes);

	wireMesh = createWireMesh(faceGeo);
	scene.add(wireMesh);		
	
	createDots(initGlPositions);

	debugDot = createDot(.05, 0, 0, 0);
	debugDot.visible = false;
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


function setupEvents ()
{
	$("#cameraOn_btn").click( () => {
		setupWebcam ( () => {
			isWebcamOn = true;
		});
	});

	$("#ok_btn").click( () => {
		const glPositions = getGlPositionsFromInput();
		updateVertices(glPositions);
	});

	$("#overWire_btn").click( () => {
		if(isOverWireframe) {
			isOverWireframe = false;
		}else {
			isOverWireframe = true;
		}
	});

	$("#exportJpg_btn").click( () => {
		//saveCanvas("webgl", "test.jpg", true);

		const n = new Date();
		const filename = n.getFullYear() + ("0"+(n.getMonth()+1)).slice(-2) + ("0"+n.getDate()).slice(-2)
					   +"_" 
					   + ("0"+n.getHours()).slice(-2) + ("0"+n.getMinutes()).slice(-2) + ("0"+n.getSeconds()).slice(-2)
					   + ".jpg";
		postCanvas("webgl", filename, true);
	});


	$("#showCameraCanvas_btn").click( ()=> {
		$("#canvasArea").toggle();
	})

	$("#showResult_btn").click( ()=> {
		$("#webglArea").toggle();
	})

	$(window).keypress((e)=>{
		console.log(e.keyCode);
		if(e.keyCode == 100){
			$("#debugCtrl").toggle();
		}

		if(e.keyCode == 119){
			(isOverWireframe) ? isOverWireframe = false : isOverWireframe = true;
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


function animate ()
{
	requestAnimationFrame( animate );
	if(isWebcamOn){
		videoCtx.drawImage(vid, 0, 0, videoCvs.width, videoCvs.height);
		/*
		faceTex = new THREE.Texture(videoCvs);
		faceMes.material.map = faceTex;
		faceTex.needsUpdate = true;
		faceMes.material.map.needsUpdate = true;
		*/
	}

	if(isTrackOn){
		faceClm.a = 0;
		faceClm.update();
		drawPointsOnCanvas(resultCtx, faceClm.positions, true);

		if(faceClm.positions && faceClm.positions.length > 0) {
			faceGlPos = getGlPositions(faceClm.positions);

			updatePolygon(faceGlPos);
			updateTexture();

			updateDots(faceGlPos);

		}

		if(isShowDebugDot){
			debugDot.position.set(faceGlPos[71].x, faceGlPos[71].y, 0 );
			debugDot.visible = true;
		}else{
			debugDot.visible = false;
		}

		if(wireMesh){
			if(isOverWireframe){
				wireMesh.visible = true;
				isShowDots = true;
			}else{
				wireMesh.visible = false;
				isShowDots = false;
			}
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

	$("#webglArea").toggle();//---作成してから非表示にする
	setupEvents();
}


$(function(){
	init();
	animate();
})

