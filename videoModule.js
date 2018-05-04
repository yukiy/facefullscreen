const ffmpeg = require('fluent-ffmpeg');

function exportReverseVideo(filename, callback){
	const sizeCmd = ffmpeg(filename)
	.size("640x480")
	.on("end", ()=>{
		const reverseCmd = ffmpeg(filename+"_s.mp4")
		.videoFilters("reverse")
		.on("end", ()=>{
			console.log("merge" + filename+"_r.mp4");
			const mergeCmd = ffmpeg(filename+"_s.mp4")
			.input(filename+"_r.mp4")
			.on("error", (e)=> {
				console.log(e);
			})
			.on("end", ()=> {
				callback();
			})
			.mergeToFile(filename+"_m.mp4", __dirname+"/temp/")
			;
		})
		.save(filename+"_r.mp4");
		// .output(filename+"_r.mp4")
		// .run();		
	})
	.save(filename+"_s.mp4");
}

module.exports.exportReverseVideo = exportReverseVideo;
