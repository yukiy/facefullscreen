/*********** Code for face tracking *********/
class Clm
{
	constructor ()
	{
		this.ctrack = new clm.tracker(
			//{scoreThreshold : 0.1}
		);

		this.trackingStarted = false;
		this.originalPositions = null;
		this.positions = null;
		this.center = null;
		this.currentMask = 0;
		this.animationRequest;
		this.isLoaded = false;

		this.ctrack.init(pModel);
	}


	startVideo (videoEl) 
	{
		videoEl.play();
		//this.ctrack.start(videoCvs);
		this.ctrack.start(videoEl);
		this.trackingStarted = true;
		//this.drawGridLoop();
	}

	update () 
	{
		this.originalPositions = this.ctrack.getCurrentPosition();
		if(this.originalPositions[62]){
			this.positions = this.originalPositions;
			this.center = this.originalPositions[62];
			this.addOffsetPositions();
		}
		//requestAnimFrame(this.update.bind(this));
	}

	addOffsetPositions () 
	{
		let x, y, scale;

		//---add outside offset
		scale = 1.2;

		//---add positions[71]-[93]
		for( let i=0; i<23; i++){
			const distance = Math.sqrt( 
				(this.positions[i][0] - this.center[0]) * (this.positions[i][0] - this.center[0])
				+ (this.positions[i][1] - this.center[1]) * (this.positions[i][1] - this.center[1])
			)
			const angle = Math.atan2(this.positions[i][1] - this.center[1], this.positions[i][0] - this.center[0] )
			const newDistance = distance * scale;
			x = Math.cos(angle) * newDistance + this.center[0];
			y = Math.sin(angle) * newDistance + this.center[1];
			this.positions.push([x, y]);
		}

		//---add positions[94]
		x = (this.positions[89][0] + this.positions[93][0]) / 2;
		y = (this.positions[89][1] + this.positions[93][1]) / 2;
		this.positions.push([x, y]);


		//---add inside offset
		scale = 0.9;

		//---add positions[95]-[117]
		for( let i=0; i<23; i++){
			const distance = Math.sqrt( 
				(this.positions[i][0] - this.center[0]) * (this.positions[i][0] - this.center[0])
				+ (this.positions[i][1] - this.center[1]) * (this.positions[i][1] - this.center[1])
			)
			const angle = Math.atan2(this.positions[i][1] - this.center[1], this.positions[i][0] - this.center[0] )
			const newDistance = distance * scale;
			x = Math.cos(angle) * newDistance + this.center[0];
			y = Math.sin(angle) * newDistance + this.center[1];
			this.positions.push([x, y]);
		}

		//---add positions[118]
		x = (this.positions[113][0] + this.positions[117][0]) / 2;
		y = (this.positions[113][1] + this.positions[117][1]) / 2;
		this.positions.push([x, y]);

	}

	//---NOT WORKED
	// minusOffsetPositions () {
	// 	console.log("of"+this.a);
	// 	this.a++;
	// 	//for( let i=15; i<23; i++){
	// 	let x,y;
	// 	const scale = 1;
	// 	//---add positions[71]-[93]
	// 	for( let i=0; i<23; i++){
	// 		const distance = Math.sqrt( 
	// 			(this.positions[i][0] - this.center[0]) * (this.positions[i][0] - this.center[0])
	// 			+ (this.positions[i][1] - this.center[1]) * (this.positions[i][1] - this.center[1])
	// 		)
	// 		const angle = Math.atan2(this.positions[i][1] - this.center[1], this.positions[i][0] - this.center[0] )
	// 		const newDistance = distance * scale;
	// 		x = Math.cos(angle) * newDistance + this.center[0];
	// 		y = Math.sin(angle) * newDistance + this.center[1];
	// 		this.positions[i][0] = x;
	// 		this.positions[i][1] = y;
	// 	}
	// }


	drawGrid (canvas) 
	{
		canvas.getContext.clearRect(0, 0, canvas.width, canvas.height);
		if (this.positions) {
			this.ctrack.draw(canvas);
		}
	}

	exportToText (positions) 
	{
		let str = "";
		str += "[";
		for(let i=0; i<positions.length; i++){
			str += "["+ positions[i][0] +","+ positions[i][1] +"],";
		}
		str += "]";
		console.log(str);
		//$("#positionArray").html(str);
	}
}




