let socket;
let currentDragId = null;


function init()
{
	$.get("/api/getDisplayNum", (res) => {
		for(let i=0; i<res; i++){
			$("#displayList").append("<span><p id='displayId'>"+i+"</p><span id='display"+i+"'><img src='../_uploads/sample"+i+".jpg' val="+i+" /></span></span>");

			const dnd = new DragNDrop();
			dnd.setSource("display"+i, 
				(data) => { //---dragstartFunc
					currentDragId = data.id;
					data.style.opacity = '0.4';
				}, 
				(data) =>{ //---dragendFunc
					this.dropSource.style.opacity = '1.0';
				}
			);

			dnd.setTarget("display"+i, (htmlText, originalHtmlText) => {
				const imgSrc = htmlText.split("<img src=\"")[1].split(".jpg")[0] + ".jpg";
				const id = i;
				const oriImgSrc = originalHtmlText.split("<img src=\"")[1].split(".jpg")[0] + ".jpg";
				//const oriImgId = originalHtmlText.split("val=\"")[1].split("\"")[0];

				//console.log(oriImgId);
				console.log(originalHtmlText);

				const data = { imgSrc : imgSrc, id: id };
				if(currentDragId != null){
					document.getElementById(currentDragId).style.opacity = 1.0;
					document.getElementById(currentDragId).innerHTML = "<img src='"+oriImgSrc+"' val="+id+" /><p>"+oriImgSrc+"</p>";
					//document.getElementById(currentDragId).innerHTML = originalHtmlText;
					currentDragId = null;
				}
				socket.emit("updateDisplayImage", data);
			});
		}
	})

	$.getJSON("/api/getStockImageList", (res) => {
		console.log(res);

		for(let i=0; i<res.files.length; i++){
			const filename = "../" + res.files[i];
			const dom = "<span id='stock"+i+"' draggable='true'><img src='"+filename+"'/><p>"+res.files[i]+"</p></span>";
			$("#stockList").append(dom);

			const dnd = new DragNDrop();
			dnd.setSource("stock"+i);
		}
	});

}


$(()=>{
	socket = io();
	socket.on('connect', () => {
		init();
	});
})
