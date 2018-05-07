/*
camera.js Cameraで撮影 base64を　/api/saveImage/ にPOST
app.js _uploads/　に保存
app.js socketでfilenames　をbroadcast
view.js socketを受けて画像更新

*/

const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const base64 = require("urlsafe-base64");

const app = express();
const server = app.listen( 3000, () => {
	console.log("listening : " + server.address().port);
})

const io = require("socket.io").listen(server);


const fList = require("./viewModule.js");
const ip = require("./LocalIPModule.js");
const ff = require("./videoModule.js");


const publicDirPath = __dirname+"/public/";
const imageDirPath = "_uploads/";
const videoDirPath = "_videos/";




app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.use(bodyParser.urlencoded({limit:'50mb', extended: true}));

app.use(express.static("public"));


// app.post("/api/saveimage", (req, res) => {
// 	console.log("saveimage");
// 	const filename = req.body.filename;
// 	const temp = req.body.data.split(",");
// 	//---temp[0]: string like "data:image/jpeg;base64"
// 	//---temp[1]: actual data
// 	const data = temp[1];
// 	const img = base64.decode(data);
// 	const savedir = __dirname+"/public";
// 	const imgSrc = "/_uploads/"+filename;
// 	fs.writeFile(savedir+imgSrc, img, (err) => {
// 		console.log(err);
// 		res.send(req.body.filename+" 書き込み完了");
// 		fList.updateDisplayImageFilename("new", imgSrc);
// 		io.sockets.emit("updateDisplayImageList", fList.getDisplayImageList());		
// 	});
// });


function saveImage (filename, alldata, callback)
{
	const temp = alldata.split(",");
	//---temp[0]: string like "data:image/jpeg;base64"
	//---temp[1]: actual data
	const data = temp[1];
	const img = base64.decode(data);
	// const savedir = __dirname+"/public";
	// const imgSrc = "/_uploads/"+filename;

	fs.writeFile(publicDirPath+imageDirPath+filename, img, (err) => {
		console.log(err);
		callback();
	});
}

app.post("/api/saveimage", (req, res) => 
{
	console.log("saveimage");

	const filename = req.body.filename;
	const data = req.body.data;

	saveImage(filename, data, ()=>{
		res.send(filename+" 書き込み完了");
		fList.updateDisplayImageFilename("new", filename);
		//fList.updateDisplayImageFilename("new", imageDirPath+filename);
		io.sockets.emit("updateDisplayImageList", {
			dirPath : fList.getImageDirPath(), 
			list : fList.getDisplayImageList()
		});
	})
});


function saveVideo (req, res)
{
	const filename = req.body.filename;
	const temp = req.body.data.split(",");
	//---temp[0]: string like "data:image/jpeg;base64"
	//---temp[1]: actual data
	const data = temp[1];
	const video = base64.decode(data);
	// const savedir = __dirname+"/public";//
	// const videoSrc = "/_videos/"+filename;//

	fs.writeFile(publicDirPath+videoDirPath+filename, video, (err) => {
		console.log(err);
		ff.exportReverseVideo(publicDirPath+videoDirPath+filename, ()=>{
 		//ff.exportReverseVideo(savedir+videoSrc, ()=>{
			res.send(filename+" 書き込み完了");
			fList.updateDisplayVideoFilename("new", filename);
			//fList.updateDisplayVideoFilename("new", videoDirPath+filename);
 			//fList.updateDisplayVideoFilename("new", videoSrc);
			setTimeout(()=>{
				io.sockets.emit('updateDisplayVideoList', {
					dirPath : fList.getVideoDirPath(),
					list : fList.getDisplayVideoList()
				});

			}, 500);
		});
	});
}


app.post("/api/savevideo", (req, res) => {
	console.log("savevideo");
	saveVideo(req, res);
});



app.get("/api/getDisplayNum", (req, res) => {
	console.log("getDisplayNum");
	res.type("text");
	res.send(fList.getDisplayNum().toString());
})

app.get("/api/getPathList", (req, res) => {
	console.log("getPathList");
	res.json({
		publicDirPath : publicDirPath,
		imageDirPath : imageDirPath,
		videoDirPath : videoDirPath
	});
})


// app.get("/api/getDisplayImageList", (req, res) => {
// 	console.log("getDisplayImageList");
// 	res.type("json");
// 	res.json({
// 		"imageDirPath": fList.getImageDirPath(),
// 		"imgSrc" : fList.getDisplayImageList()
// 	})
// })

app.get("/api/getStockImageList", (req, res, next) => {
	console.log("getStockImageList");
	fList.getStockFileList(publicDirPath, (data)=>{
		res.json(data);
	});
});


app.get("/api/getimage", (req, res, next) => {
	console.log("getimage");
	const buf = fs.readFileSync("yay.jpg");
	const b64 = new Buffer(buf).toString('base64');
	res.type("text");
	res.send(b64);
})

app.get("/api/getIp", (req, res) => {
	console.log("localIP");
	const addr = ip.getIp;
	res.json(addr);
})


io.sockets.on('connection', (socket) => {
	let id = socket.id;
	socket.emit('client console', id);

	socket.on('join', () => {
		console.log("join");
		io.sockets.emit('client console', id + ' joined');
	});

	socket.on("getDisplayImageList", () => {
		socket.emit("updateDisplayImageList", {
			dirPath : fList.getImageDirPath(), 
			list : fList.getDisplayImageList()
		});
	});

	socket.on("getDisplayVideoList", () => {
		socket.emit('updateDisplayVideoList', {
			dirPath : fList.getVideoDirPath(),
			list : fList.getDisplayVideoList()
		});
	});

	socket.on("updateDisplayImage", (data) => {
		fList.updateDisplayImageFilename(data.id, data.imgSrc);
		io.sockets.emit("updateDisplayImageList", {
			dirPath : fList.getImageDirPath(), 
			list : fList.getDisplayImageList()
		});
		//io.sockets.emit("client console", "update");
	});

	socket.on("updateDisplayVideo", (data) => {
		fList.updateDisplayVideoFilename(data.id, data.videoSrc);
		//io.sockets.emit("updateDisplayVideoList", fList.getDisplayVideoList());
		//io.sockets.emit("client console", "update");
		io.sockets.emit("updateDisplayVideoList", {
			dirPath : fList.getVideoDirPath(),
			list : fList.getDisplayVideoList()
		});
	});

	socket.on("updateStockImage", () => {
		fList.getStockFileList(publicDirPath, (list)=>{
			res.json(list);
		});
	});

	socket.on("allRefresh", () => {
		io.sockets.emit('refresh');
	});

	/*---ref
	socket.on('to me', (msg) => {
		socket.emit('client console', str);
	});

	socket.on('to others', (msg) => {
		socket.broadcast.emit('client console', str);
	});

	socket.on('to everyone', (msg) => {
		io.sockets.emit('client console', str);
	});
	*/
})

