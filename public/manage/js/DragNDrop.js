class DragNDrop{

	constructor ()
	{
	}

	setSource (sourceId, startFunc, endFunc)
	{
		this.dropSource = document.getElementById(sourceId);
		this.dropSource.addEventListener('dragstart', (ev) => {
			ev.dataTransfer.effectAllowed = 'all';
			ev.dataTransfer.setData('text', this.dropSource.innerHTML);
			if(startFunc) startFunc(this.dropSource);
		}, false);

		this.dropSource.addEventListener('dragend', (ev) => {
			if(endFunc) endFunc(this);
		}, false);

	}

	setTarget (targetId, callback)
	{
		const that = this;

		this.dropTarget = document.getElementById(targetId);

		this.dropTarget.addEventListener('dragover', function (ev) {
			ev.preventDefault();
		});

		this.dropTarget.addEventListener('dragleave', function (ev) {
			ev.preventDefault();
		});

		this.dropTarget.addEventListener('drop', function (ev) {
			ev.preventDefault();
			//ev.dataTransfer.dropEffect = 'copy';
			const originalHtmlText = that.dropTarget.innerHTML;
			const htmlText = ev.dataTransfer.getData("text");
			this.innerHTML = htmlText;
			$($(this.innerHTML)[0]).attr("val", 0);//---imgタグ($(this.innerHTML)[0]で取得)に、valを追加
			callback(htmlText, originalHtmlText);
		});

		//---TODO: clickでも配置できるようにする
		this.dropTarget.addEventListener('click', function () {
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


