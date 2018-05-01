
class DragNDrop{
	/*
		setSouce  : dragされるときの振る舞いを記述
		setTarget : dropされるときの振る舞いを記述
	*/

	constructor ()
	{
	}

	setSource (elId, startFunc, endFunc)
	{
		const dom = document.getElementById(elId);
		const obj = { dom: dom, id: elId };

		dom.addEventListener('dragstart', (ev) => {
			//console.log("dragstart");
			ev.dataTransfer.effectAllowed = 'all';
			ev.dataTransfer.setData('text', dom.innerHTML);//---dragした対象のhtmlを、dataTransferにtext形式で保持
			if(startFunc) startFunc(obj);
		}, false);

		dom.addEventListener('dragend', (ev) => {
			//console.log("dragend");
			if(endFunc) endFunc(obj);
		}, false);
	}

	setTarget (elId, callback)
	{
		const dom = document.getElementById(elId);
		const obj = { originalHtmlText: dom.innerHTML, newHtmlText: null }

		dom.addEventListener('dragover', function (ev) {
			ev.preventDefault();
		});

		dom.addEventListener('dragleave', function (ev) {
			ev.preventDefault();
		});

		dom.addEventListener('drop', function (ev) {
			ev.preventDefault();
			obj.newHtmlText = ev.dataTransfer.getData("text");
			callback(obj);
		});

		//---TODO: clickでも配置できるようにする
		dom.addEventListener('click', function () {
			//fileInput.click();
		});

		// // ファイル参照で画像を追加した場合
		// fileInput.addEventListener('change', function (ev) {
		// 	output.textContent = '';
		// 	// ev.target.files に複数のファイルのリストが入っている
		// 	organizeFiles(ev.target.files);
		// 	// 値のリセット
		// 	fileInput.value = '';
		// });
	}
}

// class DragNDrop{
// 	/*
// 		setSouce  : dragされるときの振る舞いを記述
// 		setTarget : dropされるときの振る舞いを記述
// 	*/

// 	constructor ()
// 	{
// 	}

// 	setSource (sourceId, startFunc, endFunc)
// 	{
// 		this.dom = document.getElementById(sourceId);

// 		this.dom.addEventListener('dragstart', (ev) => {
// 			//console.log("dragstart");
// 			ev.dataTransfer.effectAllowed = 'all';
// 			ev.dataTransfer.setData('text', this.dom.innerHTML);
// 			if(startFunc) startFunc(this.dom);
// 		}, false);

// 		this.dom.addEventListener('dragend', (ev) => {
// 			//console.log("dragend");
// 			if(endFunc) endFunc(this);
// 		}, false);
// 	}

// 	setTarget (targetId, callback)
// 	{
// 		const that = this;

// 		this.dom = document.getElementById(targetId);

// 		this.dom.addEventListener('dragover', function (ev) {
// 			ev.preventDefault();
// 		});

// 		this.dom.addEventListener('dragleave', function (ev) {
// 			ev.preventDefault();
// 		});

// 		this.dom.addEventListener('drop', function (ev) {
// 			ev.preventDefault();
// 			const originalHtmlText = that.dom.innerHTML;
// 			const htmlText = ev.dataTransfer.getData("text");
// 			this.innerHTML = htmlText;
// 			//$($(this.innerHTML)[0]).attr("val", 0);//---imgタグ($(this.innerHTML)[0]で取得)に、valを追加
// 			callback(htmlText, originalHtmlText);
// 		});

// 		//---TODO: clickでも配置できるようにする
// 		this.dom.addEventListener('click', function () {
// 			//fileInput.click();
// 		});
// 		// // ファイル参照で画像を追加した場合
// 		// fileInput.addEventListener('change', function (ev) {
// 		// 	output.textContent = '';
// 		// 	// ev.target.files に複数のファイルのリストが入っている
// 		// 	organizeFiles(ev.target.files);
// 		// 	// 値のリセット
// 		// 	fileInput.value = '';
// 		// });
// 	}
// }


