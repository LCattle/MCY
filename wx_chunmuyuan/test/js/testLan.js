//自选菜列表
define(["base/baseApp", "../lib/refresher/js/iscroll","../lib/refresher/js/pullToRefresh.mini"], function(app,iscroll, pull) {
	//开始执行
	app.init = function() {
	};
	app.addNode = function(){
		var str = "<div><span lan-res='newnode'>11</span></div>";
		str = this.language.getLanStr(str);
		$("#nodeParent").append(str);
	}
	return app;
});
