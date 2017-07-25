//激活成功
define(["base/baseApp", "../lib/aui/script/aui-slide"], function(app,slide) {
	app.initPage = function(){
	};
	
	//开始执行
	app.init = function() {
		$("#countNum").text(app.UrlParams.num);
	};
	return app;
});