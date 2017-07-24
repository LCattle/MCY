//我的评论
define(["base/baseApp", "refresher", "animate"], function(app, refresher, animate) {
	app.data = [{
		a: 1
	}, {
		a: 2
	}, {
		a: 3
	}, {
		a: 4
	}, {
		a: 1
	}, {
		a: 2
	}, {
		a: 3
	}, {
		a: 4
	}];

	app.addList = function() {
		for(var i = 0; i < this.data.length; i++) {
			$("#list").append(this.template(this.data[i]));
		}
	};

	function setTouch() {

	}
	
		//初始化下拉刷新
	function initRefresh() {
		app.pageRefresher = refresher.initDropload("#wrapper", function(me) {
			me.resetload();
		}, function(me) {
			setTimeout(function() {
				// 无数据
				me.noData();
				me.resetload();
			}, 2000);
		});
	}
	app.initPage = function() {
			this.template = this.getTempBySelector("#template");
			var h = $(window).height() - $("header").height();
			console.log(h)
			wrapper
			$("#list").css("min-height", h + "px");
			$("#wrapper").css("height", h + "px");
			$("#wrapper").css("overflow", "scroll");
			this.addList();
		}
		//开始执行
	app.init = function() {
		initRefresh();
	};
	return app;
});