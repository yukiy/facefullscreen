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

const publicDirPath = __dirname+"/public/";

const fList = require("./viewModule.js");
const ip = require("./LocalIPModule.js");



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


app.post("/api/saveimage", (req, res) => {
	console.log("saveimage");
	const filename = req.body.filename;
	const temp = req.body.data.split(",");
	//---temp[0]: string like "data:image/jpeg;base64"
	//---temp[1]: actual data
	const data = temp[1];
	const img = base64.decode(data);
	const savedir = __dirname+"/public";
	const imgSrc = "/_uploads/"+filename;
	fs.writeFile(savedir+imgSrc, img, (err) => {
		console.log(err);
		res.send(req.body.filename+" 書き込み完了");

		fList.updateDisplayImageFilename("new", imgSrc);
		io.sockets.emit("updateDisplayImageList", fList.getDisplayImageList());
		io.sockets.emit("client console", "update");

	});
});

app.get("/api/getDisplayNum", (req, res) => {
	console.log("getDisplayNum");
	res.type("text");
	res.send(fList.getDisplayNum().toString());
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
	fList.getStockImageList(publicDirPath, (list)=>{
		res.json(list);
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
		socket.emit('updateDisplayImageList', fList.getDisplayImageList());
	});

	socket.on("updateDisplayImage", (data) => {
		fList.updateDisplayImageFilename(data.id, data.imgSrc);
		io.sockets.emit("updateDisplayImageList", fList.getDisplayImageList());
		//io.sockets.emit("client console", "update");
	});

	socket.on("updateStockImage", () => {
		fList.getStockImageList(publicDirPath, (list)=>{
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

