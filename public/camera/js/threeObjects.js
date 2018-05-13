let faceGeo, faceMat, faceMes;
let faceTex, videoTex;
let wireMesh;
let faceGlPos;
const faceScale = 0.3;


/*---unused
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
*/


function getGlPositions (pixelPositions)
{
	const dom = $("#numbers");
	let glPositions = [];
	let x, y, z;
	for (let i=0; i<pixelPositions.length; i++){
		// //---縦横比も反映する場合
		// if(isLandscape){
		// 	x = pixelPositions[i][0] / vidW * 2;
		// 	y = 1 - pixelPositions[i][1] / vidH * 2 * vidH/vidW;
		// }else{
		// 	x = pixelPositions[i][0] / vidW * 2 * vidW/vidH;
		// 	y = 1 - pixelPositions[i][1] / vidH * 2;			
		// }
		// 

		// x = pixelPositions[i][0] / vidW * 2;
		// y = 1 - pixelPositions[i][1] / vidH * 2;
		x = pixelPositions[i][0] / vidW;
		y = 1 - pixelPositions[i][1] / vidH;
		z = 0;

		glPositions.push( new THREE.Vector3( x, y, z));
	}

	return glPositions;
}


/*　座標の計算 general  ----------------------------------------------------------*/
function getMiddlePoint (a, b)
{
	return { x: (a.x+b.x)/2, 
			 y: (a.y+b.y)/2 }
}

function getLengthBetween (a, b)
{
	return Math.sqrt( (a.x-b.x)*(a.x-b.x) + (a.y-b.y)*(a.y-b.y) );
}


/* glPositions全体の計算、操作 ----------------------------------------------------------*/
function centerize (glPositions, centerId)
{
	const gapX = glPositions[centerId].x;
	const gapY = glPositions[centerId].y;
	for (let i=0; i<glPositions.length; i++){
		glPositions[i].x -= gapX;
		glPositions[i].y -= gapY;
	}
	return glPositions;
}


function scaling (glPositions, scale)
{
	for (let i=0; i<glPositions.length; i++){
		glPositions[i].x *= scale;
		glPositions[i].y *= scale;
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


	if ( id < 15 || (70 < id && id < 110) ){
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

		//todo 目のところ
		//if(id == 95 || id == 109) return {x:x, y:y};

		let newX = x;
		let newY = y;
		if(direction == "LR"){
			newX = (x > 0) ? maxNum : minNum;
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


/*-----デバッグ用メッシュ　アップデート ----------------------------------------------------------*/

function updateDots (glPositions)
{
	for (let i=0; i<glPositions.length; i++){
		dotMeshes[i].position.set( glPositions[i].x, glPositions[i].y, glPositions[i].z );
		(isShowDots)? dotMeshes[i].visible = true : dotMeshes[i].visible = false;
	}	
}


function updateDotPosition (id, position)
{
	dotMeshes[id].position.set(position.x, position.y, position.z);
}


/*-----デバッグ用メッシュ　初期 ----------------------------------------------------------*/

function createWireMesh (geo)
{
	const wireMat = new THREE.MeshBasicMaterial({color: 0x8888ff, wireframe: true});
	return new THREE.Mesh(geo, wireMat);
}


function createDots ()
{
	for (let i=0; i<verticesNum; i++){
		const size = 0.015;
		const dot = createSprite(i, size, 0, 0, 0);
		//const dot = createDot(0.1, 0, 0, 0);
		dotMeshes.push( dot );
	}
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


/*-----メイン　アップデート ----------------------------------------------------------*/

function updatePolygon (glPositions)
{
	//---キャプチャするUVマップ座標を更新
	updateFaceVertexUvs(glPositions);

	//---指定した特徴点を、画面中央に固定
	faceGlPos = centerize(glPositions, 62);

	//---鼻筋の長さを基準にスケール
	const noseLength = getLengthBetween(glPositions[23], glPositions[62]);
	const scale = faceScale / noseLength;
	faceGlPos = scaling(glPositions, scale);

	//---全顔面になるように輪郭の座標を再計算
	faceGlPos = extend(faceGlPos);

	//---計算結果を反映
	updateVertices(faceGlPos);
}


function updateFaceVertexUvs (glPositions)
{
	let newFaceVertexUvs = [];
	for(let i=0; i<faceFaceArray.length; i++){
		newFaceVertexUvs.push([
			glPositions[ faceFaceArray[i][0] ],
			glPositions[ faceFaceArray[i][1] ],
			glPositions[ faceFaceArray[i][2] ],
			glPositions[ faceFaceArray[i][3] ],
		]);		
	}

	for(let i=0; i<newFaceVertexUvs.length; i++){
		updateUvs(faceMes.geometry.faceVertexUvs[0][i], newFaceVertexUvs[i]);
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


function updateVertices (glPositions)
{
	for(let i=0; i<glPositions.length; i++){
		faceMes.geometry.vertices[i].set(glPositions[i].x, glPositions[i].y, glPositions[i].z);
	}
	faceMes.geometry.computeFaceNormals();
	faceMes.geometry.computeVertexNormals();
	faceMes.geometry.verticesNeedUpdate = true;
}


function updateTexture ()
{
	//---なくても動く（？）
	// const videTex = new THREE.VideoTexture( vid );
	// videTex.minFilter = THREE.LinearFilter;
	// videTex.magFilter = THREE.LinearFilter;
	// videTex.format = THREE.RGBFormat;
	// faceMes.material.map = videTex;
	// faceMes.material.map.needsUpdate = true;
	// faceTex.needsUpdate = true;
}


function updateThreeObjects ()
{
	if(faceClm.positions && faceClm.positions.length > 0) {
		faceGlPos = getGlPositions(faceClm.positions);
		updatePolygon(faceGlPos);
		updateTexture();
		updateDots(faceGlPos);
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


/*-----メイン　初期 ----------------------------------------------------------*/

function createGeometry (vertexIdOrder)
{
	const faceGeo = new THREE.Geometry();

	//---vertexを作成 座標の初期値は全部（0,0,0） 
	for (let i=0; i<verticesNum; i++){
		faceGeo.vertices.push( new THREE.Vector3( 0, 0, 0) );
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
	//---video上の座標を0-1にして、UV座標に設定
	for(let i=0; i<faceFaceArray.length; i++){
		geo.faceVertexUvs[0][i] = [
			new THREE.Vector2( geo.vertices[ faceFaceArray[i][0] ] [0] / vidW,  1.0 - geo.vertices[ faceFaceArray[i][0] ] [1] / vidH ),
			new THREE.Vector2( geo.vertices[ faceFaceArray[i][1] ] [0] / vidW,  1.0 - geo.vertices[ faceFaceArray[i][1] ] [1] / vidH ),
			new THREE.Vector2( geo.vertices[ faceFaceArray[i][2] ] [0] / vidW,  1.0 - geo.vertices[ faceFaceArray[i][2] ] [1] / vidH ),
			new THREE.Vector2( geo.vertices[ faceFaceArray[i][3] ] [0] / vidW,  1.0 - geo.vertices[ faceFaceArray[i][3] ] [1] / vidH ),

			// new THREE.Vector2( pxPositions[ faceFaceArray[i][0] ] [0] / vidW,  1.0 - pxPositions[ faceFaceArray[i][0] ] [1] / vidH ),
			// new THREE.Vector2( pxPositions[ faceFaceArray[i][1] ] [0] / vidW,  1.0 - pxPositions[ faceFaceArray[i][1] ] [1] / vidH ),
			// new THREE.Vector2( pxPositions[ faceFaceArray[i][2] ] [0] / vidW,  1.0 - pxPositions[ faceFaceArray[i][2] ] [1] / vidH ),
			// new THREE.Vector2( pxPositions[ faceFaceArray[i][3] ] [0] / vidW,  1.0 - pxPositions[ faceFaceArray[i][3] ] [1] / vidH ),
		];
	}

	//---texture をvideoにする
	vid = document.getElementById('videoel');
	videTex = new THREE.VideoTexture( vid );
	videTex.minFilter = THREE.LinearFilter;
	videTex.magFilter = THREE.LinearFilter;
	videTex.format = THREE.RGBFormat;
	const mat = new THREE.MeshBasicMaterial({　map:videTex, side:THREE.DoubleSide　});

	return mat;
}


function initThreeObjects () 
{
	//let glPositions = getGlPositions(imagePositions);
	//glPositions = centerize(glPositions);
	//glPositions = extend(glPositions);//
	//setInputNumbers(glPositions);

	//faceTex = new THREE.TextureLoader().load('sampleface.png');
	faceGeo = createGeometry(faceFaceArray);
	faceTex = new THREE.Texture(videoCvs);
	faceMat = createMaterial(faceGeo, faceTex);
	faceMes = new THREE.Mesh(faceGeo, faceMat);
	scene.add(faceMes);

	wireMesh = createWireMesh(faceGeo);
	wireMesh.visible = false;
	scene.add(wireMesh);		
	
	createDots();

}




