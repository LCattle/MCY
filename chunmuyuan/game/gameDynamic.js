//我的收藏
define(["base/baseApp", "refresher", "animate", "./base/basePage", "swipe"],
	function(app, refresher, animate, page, swipe) {
		//变量定义

		//变量定义结束

		//初始化下拉刷新
		function initRefresh() {
			app.pageRefresher = refresher.initDropload("#wrapper",
				function(me) {
					me.resetload();
				},
				function(me) {
					me.resetload();
				});
		}

		app.initPage = function() {
			var h = $(window).height();
			$("#list").css("width", $(window).width() + "px");
			$("#list").css("min-height", h + "px");
			$("#wrapper").css("height", h + "px");
			$("#wrapper").css("overflow", "scroll");
		};
		app.init = function() {
			initRefresh();
		};
		return app;
	});