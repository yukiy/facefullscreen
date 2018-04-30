const displayNum = 7;
let displayImageList = [];
let nextUpdateId = 0;
const imageDirPath = "_uploads/";


for(let i=0; i<displayNum; i++){
	displayImageList.push(
	{ 
		imgSrc : "../"+imageDirPath + "sample"+i+".jpg" 
	});
}


module.exports = {

	getImageDirPath : () => { return imageDirPath; },

	getDisplayNum : () => { return displayNum; },

	getDisplayImageList : () => { return displayImageList; },

	//getDisplayImageFilename : (id) => { return displayImageList[id].filename; },

	updateDisplayImageFilename : (id=undefined, imgSrc) => {
		if(id==undefined){
			displayImageList[nextUpdateId].imgSrc = imgSrc;
			nextUpdateId++;
		}else{
			displayImageList[id].imgSrc = imgSrc;
		}
	},

}