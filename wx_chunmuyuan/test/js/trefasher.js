//自选菜列表
define(["base/baseApp", "../lib/refresher/js/iscroll","../lib/refresher/js/pullToRefresh.mini"], function(app,iscroll, pull) {
	function addList() {
		var wrap = document.getElementById("list")
		var lis = wrap.querySelectorAll('.aui-card-list');
		for(var i = lis.length, length = i + 10; i < length; i++) {
			var html = '<div class="aui-card-list">' +
				'<div class="aui-card-list-header">' +
				'卡片布局头部区域' + (i + 1) + '' +
				'</div>' +
				'<div class="aui-card-list-content-padded">' +
				'内容区域，卡片列表布局样式可以实现APP中常见的各类样式' +
				'</div>' +
				'<div class="aui-card-list-footer">' +
				'底部区域' +
				'</div>' +
				'</div>';
			wrap.insertAdjacentHTML('afterbegin', html);
		}
	};
	//初始化下拉刷新
	function initRefresh() {
		addList();
		refresher.init({
			id: "wrapper",
			pullDownAction: function(){
				wrapper.refresh();
			},
			pullUpAction: function(){
				wrapper.refresh();
			}
		});
	}
	//开始执行
	app.init = function() {
		initRefresh();
	};
	return app;
});
