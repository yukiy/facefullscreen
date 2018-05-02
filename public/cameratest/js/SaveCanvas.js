function postCanvas(canvasId, filename, isWebGl=false)
{

	let canvas;
	let imageType = "image/png";
	let ext = "png";
	let arr = filename.toLowerCase().split(".");
	if(arr[arr.length-1] == "jpg" || arr[arr.length-1] == "jpeg"){
		imageType = "image/jpeg";
	}
	else{
		imageType = "image/png";
	}

	if(isWebGl){
		canvas = document.getElementById(canvasId).children[0];
		canvas.getContext("experimental-webgl", {preserveDrawingBuffer: true});
	}else{
		canvas = document.getElementById(canvasId);		
	}

	const base64 = canvas.toDataURL(imageType);

	const data = { 
		data : base64,
		filename: filename
	};

	$.post("/api/saveimage", data, (res) => {
		console.log(res);
	})			
}

function saveCanvas (canvasId, filename, isWebGl = false)
{
	const blob = getBlob (canvasId, filename, isWebGl);
	downloadBlob(blob, filename);
}

function getBlob (canvasId, filename, isWebGl = false)
{
	const base64 = getBase64(canvasId, filename, isWebGl);
	const blob = Base64toBlob(base64);
}

function getBase64 (canvasId, filename, isWebGl = false)
{
	let canvas;
	let imageType = "image/png";
	let ext = "png";
	let arr = filename.toLowerCase().split(".");
	if(arr[arr.length-1] == "jpg" || arr[arr.length-1] == "jpeg"){
		imageType = "image/jpeg";
	}
	else{
		imageType = "image/png";
	}
	if(isWebGl){
		canvas = document.getElementById(canvasId).children[0];
		canvas.getContext("experimental-webgl", {preserveDrawingBuffer: true});
	}else{
		canvas = document.getElementById(canvasId);		
	}
	const base64 = canvas.toDataURL(imageType);
	return base64;
}

function Base64toBlob (base64)
{
	// カンマで分割して以下のようにデータを分ける
	// tmp[0] : データ形式（data:image/png;base64）
	// tmp[1] : base64データ（iVBORw0k～）
	var tmp = base64.split(',');
	// base64データの文字列をデコード
	var data = atob(tmp[1]);
	// tmp[0]の文字列（data:image/png;base64）からコンテンツタイプ（image/png）部分を取得
	var mime = tmp[0].split(':')[1].split(';')[0];
	//  1文字ごとにUTF-16コードを表す 0から65535 の整数を取得
	var buf = new Uint8Array(data.length);
	for (var i = 0; i < data.length; i++) {
		buf[i] = data.charCodeAt(i);
	}
	// blobデータを作成
	var blob = new Blob([buf], { type: mime });
	return blob;
}


function downloadBlob (blob, fileName)
{
	var url = (window.URL || window.webkitURL);
	var dataUrl = url.createObjectURL(blob);
	var event = document.createEvent("MouseEvents");
	event.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
	var a = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
	a.href = dataUrl;
	a.download = fileName;
	a.dispatchEvent(event);
}



