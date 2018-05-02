const ffmpeg = require('fluent-ffmpeg');

function exportReverseVideo(filename, callback){
	const command = ffmpeg(filename)
	.videoFilters("reverse")
	.output(filename+"_r.mp4")
	.on("end", ()=>{
		console.log(filename+"_r.mp4");
		const mergeCmd = ffmpeg(filename)
		.input(filename+"_r.mp4")
		.on("end", ()=> {
			callback();
		})
		.mergeToFile(filename+"_m.mp4", __dirname+"/temp/");
	})
	.run();
}

module.exports.exportReverseVideo = exportReverseVideo;
