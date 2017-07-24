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
			var data = [];
			for(var i = 0; i < 9; i++) {
				data.push({
					seedname: "奶油生菜" + i
				});
			}
			showPaihang(data);
		};

		/**
		 * 显示排行信息
		 */
		function showPaihang(data) {
			var temp = app.getTempBySelector("#paihangTemp")
			$.each(data, function(i, item) {
				if(i == 0) {
					item.storeStr = '<img src="../imgs/game/jinpai.png" />';
				} else if(i == 1) {
					item.storeStr = '<img src="../imgs/game/yinpai.png" />';
				} else if(i == 2) {
					item.storeStr = '<img src="../imgs/game/tongpai.png" />';
				} else {
					item.storeStr = i + 1;
				}
				$("#list").append(temp(item));
			});
		}
		return app;
	});