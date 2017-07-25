//选择充值
define(["base/baseApp", "../lib/aui/script/aui-slide"], function(app,slide) {
	app.initPage = function(){
	};

	//开始执行
	app.init = function() {
	};
	/**
	 * 跳转页面前检查登录
	 * @param {Object} url
	 */
	app.gotoPageCheck = function(url) {
		if(this.checkLogin()) {
			location.href = url;
		} else {
			this.toLoginPage(location.href);
		}
	}
	return app;
});