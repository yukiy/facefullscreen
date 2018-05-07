let displayId = 0;


function setEvents()
{
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
		socket.emit("getDisplayVideoList");
	});

	socket.on("updateDisplayVideoList", (data)=>{
		console.log(data);
		const dirPath = data.dirPath;
		const videoSrc = data.list[displayId].videoSrc;
		$("#mainImage").html("<video src='/"+dirPath+videoSrc+"_m.mp4' autoplay loop/>");
	})

	socket.on('client console', function(msg){
		console.log(msg);
	});

	socket.on("refresh", ()=>{
		location.reload();
	});

})
