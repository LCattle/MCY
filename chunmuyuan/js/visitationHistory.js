//浏览历史
define(["./base/baseApp", "refresher"], function(app, refresher) {
	//变量定义
	app.isOnEditing = false; //是否处于编辑状态
	app.listItemTemp = app.getTempBySelector("#listItemTemp"); //模板
	app.listData = [{
		title: "西瓜",
		details: "大的西瓜变量定义结束变量定义结束变量定义结束变量定义结束变量定义结束",
		price: "300g"
	}, {
		title: "西瓜",
		details: "大的西瓜",
		price: "300g"
	}, {
		title: "西瓜",
		details: "大的西瓜",
		price: "300g"
	}, {
		title: "西瓜",
		details: "大的西瓜变量定义结束变量定义结束变量定义结束变量定义结束变量定义结束",
		price: "300g"
	}, {
		title: "西瓜",
		details: "大的西瓜",
		price: "300g"
	}, {
		title: "西瓜",
		details: "大的西瓜",
		price: "300g"
	}];
	//变量定义结束

	//初始化
	app.init = function() {
		$("#editBtn").click(function() {
			if(app.isOnEditing) {
				app.hideEdit();
			} else {
				app.showEdit();
			}
			app.isOnEditing = !app.isOnEditing;
		});
		this.showListData(app.listData);
		initRefresh(); //初始化懒加载组件
	};
	//隐藏编辑状态
	app.hideEdit = function() {
		$("#editBtn").text("编辑");
		$(".listItem").css("padding-left", "0.75rem");
		$(".itemcheck").hide();
		$("#footer").hide();
		$("#wrapper").css("height", app.listH + "px");
		$(".checkBtn").removeClass("active");
	};
	//显示编辑状态
	app.showEdit = function(btn) {
		$("#editBtn").text("取消");
		$(".listItem").css("padding-left", "0.25rem");
		$(".itemcheck").show();
		$("#wrapper").css("height", (app.listH-app.footerH) + "px");
		$("#footer").show();
		
	};

	app.initPage = function() {
		var winH = $(window).height();
		var headH = $("#header").height();
		app.footerH = $("#footer").height();
		var h = winH - headH;
		app.listH = h;
		$("#list").css("min-height", h + "px");
		$("#wrapper").css("height", h + "px");
		$("#wrapper").css("overflow", "scroll");
	}

	//显示列表数据
	app.showListData = function(data) {
			var list = $("#list");
			list.empty(); //清空
			$.each(data, function(index, item) {
				list.append(app.listItemTemp(item));
			});
		}
		//当点击选择或者取消时调用
	function onCheckBtnChange() {
		var checks = $("#list .checkBtn");
		if(checks.length > 0) {
			var actives = $("#list .checkBtn.active");
			if(checks.length == actives.length) {
				$("#footer .checkBtn").addClass("active");
				return;
			}
		}
		$("#footer .checkBtn").removeClass("active");
	}
	/**
	 * 点击一栏时执行
	 * @param {Object} id
	 */
	app.clickItem = function(el, id) {
		$(el).find(".checkBtn").toggleClass("active");
		onCheckBtnChange();
	}
	
	app.clickAll = function(){
		$("#footer .checkBtn").toggleClass("active")
		if($("#footer .checkBtn").hasClass("active")){
			$(".checkBtn").addClass("active");
		}else{
			$(".checkBtn").removeClass("active");
		}
	}

	//初始化下拉刷新
	function initRefresh() {
		app.pageRefresher = refresher.initDropload("#wrapper",
			function(me) {
				me.resetload();
			},
			function(me) {
				me.resetload();
				me.noData();
			});
	}
	return app;
});