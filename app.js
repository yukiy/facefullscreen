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




app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));


app.post("/api/saveimage", (req, res) => {
	console.log("saveimage");
	const filename = req.body.filename;
	const temp = req.body.data.split(",");
	//---temp[0]: string like "data:image/jpeg;base64"
	//---temp[1]: actual data
	const data = temp[1];
	const img = base64.decode(data);
	const savedir = __dirname+"/public/_uploads/"
	fs.writeFile(savedir+filename, img, (err) => {
		console.log(err);
		res.send(req.body.filename+"書き込み完了");
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
	const dirPath = fList.getImageDirPath();
	fs.readdir(publicDirPath+dirPath, (err, files)=>{
		if(err) throw err;

		files = files.reverse();

		const fileList = files.filter( (filename) => {
			filename = publicDirPath+dirPath+filename;
			return fs.statSync(filename) && /.*\.jpg$/.test(filename);
		});

		for(let i=0; i<fileList.length; i++){
			fileList[i] = dirPath + fileList[i];
		}

		res.json({ 
			"imageDirPath": dirPath,
			"files": fileList
		});
	})
});

app.get("/api/getimage", (req, res, next) => {
	console.log("getimage");
	const buf = fs.readFileSync("yay.jpg");
	const b64 = new Buffer(buf).toString('base64');
	res.type("text");
	res.send(b64);
})




io.sockets.on('connection', (socket) => {

	let id = socket.id;
	socket.emit('client console', id);

	socket.on('join', () => {
		console.log("join");
		io.sockets.emit('client console',  id + ' joined');
	});


	socket.on("getDisplayImageList", () => {
		socket.emit('updateDisplayImageList', fList.getDisplayImageList());
	})

	socket.on("updateDisplayImage", (data) => {
		fList.updateDisplayImageFilename(data.id, data.imgSrc);
		io.sockets.emit("updateDisplayImageList", fList.getDisplayImageList());
		io.sockets.emit("client console", "update");
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


