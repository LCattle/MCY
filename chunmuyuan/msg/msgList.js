//浏览历史
define(["./base/baseApp", "refresher"], function(app, refresher) {
	//变量定义
	app.listItemTemp = app.getTempBySelector("#listItemTemp"); //模板
	app.pageIndex = 1;
	app.pageSize = 10;
	app.hasNextPage = true;
	if(!app.checkLogin()) {
		app.toLoginPage(location.href);
		return;
	}
	//变量定义结束

	//初始化
	app.init = function() {
		initRefresh(); //初始化懒加载组件
		loadData();
	};

	function loadData() {
		app.POSTRequest("weixin/mall/notice/list.do", {
			data: {
				beginPage: app.pageIndex,
				pageSize: app.pageSize
			},
			loading: "加载中...",
			success: function(data) {
				console.log(data);
				if(data.resultCode == 1) {
					app.hasNextPage = data.basePageObj.hasNextPage;
					if(app.pageIndex == 1) {
						$("#list").empty();
					}
					showData(data.resultObj);
					if($("#list .listItem").length == 0) {
						app.emptyList("#list", "没有消息")
					}
					app.pageIndex++;
				} else {
					app.tipInfo(data.resultMsg);
				}
				app.pageRefresher.resetload();
				app.pageRefresher.noData(app.hasNextPage);
			},
			error: function() { //保存重置
				app.pageRefresher.resetload();
			}
		});
	}

	function resetPageInfo() {
		app.pageIndex = 1;
		app.pageRefresher.noData(false);

	}

	app.initPage = function() {
		var h = $(window).height() - $("#btn")[0].offsetHeight;
		$("#list").css("min-height", h + "px");
		$("#wrapper").css("height", h + "px");
		$("#wrapper").css("overflow", "scroll");
		$("#btn").show();
	};

	function showData(data) {
		var temp = app.getTempBySelector("#itemtemp")
		$.each(data, function(i, item) {
			item.pushtime = item.pushtime.substring(5).substring(0, 11);
			var el = $(temp(item));
			el.longPress(function() {
				new auiDialog().alert({
					title: "提示",
					msg: "是否删除该消息"
				}, function(ret) {
					if(ret.buttonIndex == 2) {
						delMsg(item.noticeid, el);
					}
				});
			});
			$("#list").append(el);
		});
	}

	function delMsg(id, el) {
		app.POSTRequest("weixin/mall/notice/delete.do", {
			data: {
				noticeId: id
			},
			success: function(data) {
				if(data.resultCode == 1) {
					el.animate({
						height: 0
					}, 200, function() {
						el.remove();
						if($("#list .listItem").length == 0) {
							app.emptyList("#list", "没有消息")
						}
					});

				} else {
					app.tipInfo(data.resultMsg);
				}
			}
		})
	}

	//初始化下拉刷新
	function initRefresh() {
		app.pageRefresher = refresher.initDropload("#wrapper",
			function(me) {
				resetPageInfo();
				loadData();
			},
			function(me) {
				if(app.hasNextPage) {
					loadData();
				} else {
					me.resetload();
					me.noData();
				}

			});
	}
	$.fn.longPress = function(fn) {
		var timeout = undefined;
		var $this = this;
		for(var i = 0; i < $this.length; i++) {
			$this[i].addEventListener('touchstart', function(event) {
				timeout = setTimeout(fn, 800);
			}, false);
			$this[i].addEventListener('touchmove', function(event) {
				clearTimeout(timeout);
			}, false);
			$this[i].addEventListener('touchend', function(event) {
				clearTimeout(timeout);
			}, false);
		}
	}
	app.toDetails = function(id) {
		app.href("msgDetail.html?id=" + id);
	};
	app.clickClean = function() {
		if($("#list .listItem").length == 0) {
			return;
		}
		new auiDialog().alert({
			title: "提示",
			msg: "是否清空消息"
		}, function(ret) {
			if(ret.buttonIndex == 2) {
				app.clean();
			}
		})
	}
	app.clean = function() {
		app.POSTRequest("weixin/mall/notice/delete.do", {
			data: {},
			success: function(data) {
				if(data.resultCode == 1) {
					app.emptyList("#list", "没有消息")
				} else {
					app.tipInfo(data.resultMsg);
				}
			}
		})

	}
	return app;
});