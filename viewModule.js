const displayNum = 7;

let displayImageList = [];
const imageDirPath = "/_uploads/";

let displayVideoList = [];
const videoDirPath = "/_videos/";

const fs = require("fs");


for(let i=0; i<displayNum; i++){
	displayImageList.push(
	{ 
		imgSrc : imageDirPath + "0" + i + "_sample.jpg" 
	});
}

for(let i=0; i<displayNum; i++){
	displayVideoList.push(
	{ 
		videoSrc : videoDirPath + "0" + i + "_sample.mp4" 
	});
}


module.exports = {

	getDisplayNum : () => { return displayNum; },

	getImageDirPath : () => { return imageDirPath; },

	getVideoDirPath : () => { return videoDirPath; },

	getDisplayImageList : () => { return displayImageList; },

	getDisplayVideoList : () => { return displayVideoList; },

	//getDisplayImageFilename : (id) => { return displayImageList[id].filename; },

	updateDisplayImageFilename : (id, imgSrc) => {
		if(id=="new"){
			displayImageList.unshift({imgSrc:imgSrc});
			displayImageList.pop();
		}else{
			displayImageList[id].imgSrc = imgSrc;
		}
	},

	updateDisplayVideoFilename : (id, videoSrc) => {
		if(id=="new"){
			displayVideoList.unshift({videoSrc:videoSrc});
			displayVideoList.pop();
		}else{
			displayVideoList[id].videoSrc = videoSrc;
		}
	},

	getStockFileList : (publicDirPath, callback, isVideo=false) => {
		const dirPath = (isVideo) ? videoDirPath : imageDirPath;
		
		fs.readdir(publicDirPath+dirPath, (err, files)=>{

			if(err) throw err;

			files = files.reverse();

			const fileList = files.filter( (filename) => {
				filename = publicDirPath+dirPath+filename;
				if(isVideo){
					return fs.statSync(filename) && /.*\.mp4$/.test(filename);
				}
				else{
					return fs.statSync(filename) && /.*\.jpg$/.test(filename);
				}
			});

			for(let i=0; i<fileList.length; i++){
				fileList[i] = dirPath + fileList[i];
			}

			const obj = { 
				"dirPath": dirPath,
				"files": fileList
			}

			callback(obj);
		})
	},
}

