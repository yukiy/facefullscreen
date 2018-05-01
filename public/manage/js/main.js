let socket;
let currentDragId = null;
let displayNum = 7;
let serverAddr;


/*
function replaceDisplayImageHTML(id, html)
{
	$("#display"+id).html(html);
}

function getDisplayImageHTML(id)
{
	return $("#display"+id).html();
}

function moveDisplayImage(fromId, toId)
{
	const fromHTML = getDisplayImageHTML(fromId);
	const toHTML = getDisplayImageHTML(toId);
	replaceDisplayImageHTML(toHTML, fromHTML);
	return toHTML;
}
*/


function addDnDListener (id)
{
	const dnd = new DragNDrop();

	dnd.setSource(
		"display"+id, 
		(data) => { //---dragstartFunc
			currentDragId = data.id;
			data.dom.style.opacity = '0.4';
		}, 
		(data) =>{ //---dragendFunc
			data.dom.style.opacity = '1.0';
		}
	);

	dnd.setTarget(
		"display"+id, 
		(obj) => {
			const imgSrc = obj.newHtmlText.split("<img src=\"")[1].split(".jpg")[0] + ".jpg";
			const data = { imgSrc : imgSrc, id: id };

			socket.emit("updateDisplayImage", data);

			/*---ドラッグ先とドラッグ元の画像を交換する
			//---TODO 実装する場合は、app.js側のimgsrcを交換する。以下はapp.jsを使わない場合に動くもの。
			if(currentDragId != null){
				const oriImgSrc = obj.originalHtmlText.split("<img src=\"")[1].split(".jpg")[0] + ".jpg";
				document.getElementById(currentDragId).style.opacity = 1.0;
				document.getElementById(currentDragId).innerHTML = "<img src='"+oriImgSrc+"' /><p>"+oriImgSrc+"</p>";
				currentDragId = null;
			}
			*/
		}
	);
}


function updateDisplayImages (data)
{
	$("#displayList").html("");

	for(let i=0; i<displayNum; i++){
		$("#displayList").append(
			"<span><p id='displayId'>"+i+"</p>"
			+"<span id='display"+i+"'><img src='"+data[i].imgSrc+"' /></span>"
			+"</span>");

		addDnDListener(i);
	}
}


function updateStockImages (list)
{
	for(let i=0; i<list.files.length; i++){
		const filename = list.files[i];
		const dom = "<span id='stock"+i+"' draggable='true'><img src='"+filename+"'/><p>"+list.files[i]+"</p></span>";
		$("#stockList").append(dom);

		const dnd = new DragNDrop();
		dnd.setSource("stock"+i);
	}
}

function init()
{
	$.get("/api/getDisplayNum", (res) => {
		displayNum = res;

		socket.emit("getDisplayImageList"), (data)=>{
			updateDisplayImages(data);
		}
	})

	$.getJSON("/api/getStockImageList", (res) => { //socket.emit("getStockImageList")でもよい
		//console.log(res);
		updateStockImages(res);
	});

	setEvents();

}


function setEvents()
{
	$("#refresh_btn").click( ()=> {
		socket.emit("allRefresh");
		location.reload();
	})

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


$(()=>{
	socket = io();

	socket.on('connect', () => {
		init();

		$.getJSON("/api/getIp", (res)=>{
			serverAddr = res.ipv4[0].address;
			$("#serverAddr").html(serverAddr);
		})

	});

	socket.on('updateDisplayImageList', (data) => {
		//console.log(data);
		updateDisplayImages(data);
	});

	socket.on('updateStockImageList', (data) => {
		//console.log(data);
		updateStockImages(data);
	});


})

