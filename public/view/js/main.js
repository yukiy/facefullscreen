let displayId = 0;


function getImage(id)//---unused
{
	$.get("/api/getimage", {id:id}, (res) => {
		$("body").append('<img src="data:image/jpeg;base64,'+res+'" />');
	})			
}


function setEvents()
{
	$("#getList_btn").click(function(){
		socket.emit("getDisplayImageList");
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


$(()=>{

	displayId = window.location.search.substring(1);

	setEvents();

	var socket = io();

	socket.on('connect', function()
	{
		//console.log("connected");
		socket.emit('join');
		socket.emit("getDisplayImageList");
	});

	socket.on("updateDisplayImageList", (data)=>{
		//console.log(data);
		const dirPath = data.dirPath;
		const filename = data.list[displayId].imgSrc;
		$("#mainImage").html("<img src='/"+dirPath+filename+"' />");
	})

	socket.on('client console', function(msg){
		console.log(msg);
	});

	socket.on("refresh", ()=>{
		location.reload();
	});

})
