const displayNum = 7;

const imageDirPath = "_uploads/";
const videoDirPath = "_videos/";

let displayImageList = [];
let displayVideoList = [];

const fs = require("fs");


for(let i=0; i<displayNum; i++){
	displayImageList.push(
	{ 
		//imgSrc : imageDirPath + "0" + i + "_sample.jpg" 
		imgSrc :  "0" + i + "_sample.jpg" 
	});
}

for(let i=0; i<displayNum; i++){
	displayVideoList.push(
	{ 
		//videoSrc : videoDirPath + "0" + i + "_sample.mp4" 
		videoSrc :  "0" + i + "_sample.mp4" 
	});
}


// displayVideoList[0] = {videoSrc : videoDirPath + "20180505_132506.mp4"};
// displayVideoList[1] = {videoSrc : videoDirPath + "20180505_134202.mp4"}; 
// displayVideoList[2] = {videoSrc : videoDirPath + "20180505_175712.mp4"};
// displayVideoList[3] = {videoSrc : videoDirPath + "20180505_131250.mp4"};
// displayVideoList[4] = {videoSrc : videoDirPath + "20180505_110059.mp4"};
// displayVideoList[5] = {videoSrc : videoDirPath + "20180505_174656.mp4"};
// displayVideoList[3] = {videoSrc : videoDirPath + "20180505_173938.mp4"};
displayVideoList[0] = {videoSrc : "20180505_132506.mp4"};
displayVideoList[1] = {videoSrc : "20180505_134202.mp4"}; 
displayVideoList[2] = {videoSrc : "20180505_175712.mp4"};
displayVideoList[3] = {videoSrc : "20180505_131250.mp4"};
displayVideoList[4] = {videoSrc : "20180505_110059.mp4"};
displayVideoList[5] = {videoSrc : "20180505_174656.mp4"};
displayVideoList[6] = {videoSrc : "20180505_173938.mp4"};




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

			// for(let i=0; i<fileList.length; i++){
			// 	fileList[i] = dirPath + fileList[i];
			// }

			const obj = { 
				"dirPath": dirPath,
				"files": fileList
			}

			callback(obj);
		})
	},
}

