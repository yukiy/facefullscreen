const displayNum = 7;
let displayImageList = [];
const imageDirPath = "/_uploads/";
const fs = require("fs");


for(let i=0; i<displayNum; i++){
	displayImageList.push(
	{ 
		imgSrc : imageDirPath + "0" + i + "_sample.jpg" 
	});
}


module.exports = {

	getImageDirPath : () => { return imageDirPath; },

	getDisplayNum : () => { return displayNum; },

	getDisplayImageList : () => { return displayImageList; },

	//getDisplayImageFilename : (id) => { return displayImageList[id].filename; },

	updateDisplayImageFilename : (id, imgSrc) => {
		if(id=="new"){
			displayImageList.unshift({imgSrc:imgSrc});
			displayImageList.pop();
		}else{
			displayImageList[id].imgSrc = imgSrc;
		}
	},

	getStockImageList : (publicDirPath, callback) => {
		const dirPath = imageDirPath;
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

			callback({ 
				"imageDirPath": dirPath,
				"files": fileList
			})
		})
	}
}

