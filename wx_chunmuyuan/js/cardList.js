//礼品卡列表
define(["base/baseApp", "refresher", "animate", "./base/basePage", "./base/baseCardCar"], function(app, refresher, animate, page, baseCardCar) {
	//绘制信息
	app.addList = function(data) {
		if(page.pageIndex == 1) {
			$("#list").empty();
		}
		for(var i = 0; i < data.length; i++) {
			$("#list").append(this.template(data[i]));
		}
		if(!page.data || page.data.length == 0) {
			app.emptyList("#list");
		}
	};

	//初始化下拉刷新
	function initRefresh() {
		app.pageRefresher = refresher.initDropload("#wrapper", function(me) {
			page.reset();
			me.noData(false);
			loadData();
		}, function(me) {
			if(page.hasNextPage) {
				loadData();
			} else {
				me.noData();
				me.resetload();
			}
		});
	}

	//加载商品数据
	function loadData() {
		app.POSTRequest("weixin/mall/sku/queryProductList.do", {
			data: {
				productType: 3, //商品类型(1:自选菜,2:宅配套餐,3:礼品卡,4:充值卡)
				beginPage: page.pageIndex,
				pageSize: page.pageSize
			},
			success: function(data) {
				app.pageRefresher.resetload();
				if(data.resultCode === "1") {
					page.hasNextPage = data.basePageObj.hasNextPage;
					page.addData(data.basePageObj.dataList); //往page添加数据
					app.addList(data.basePageObj.dataList);
					page.pageIndex++;
				} else if(data.resultCode === "-1") {
					app.toLoginPage(location.href);
				} else {
					app.tipInfo(data.resultMsg);
				}
			},
			error: function() {
				app.pageRefresher.resetload();
			}
		});

	}
	//跳转到详情页
	app.gotoDetails = function(id, e) {
		app.stopBubble(e);
		location.href = "../goods/goodsDetails.html?pid=p" + id;
	}
	//初始化页面
	app.initPage = function() {
		this.template = this.getTempBySelector("#cardTemplate");
		var h = $(window).height() - $("header").height();
		$("#list").css("min-height", h + "px");
		$("#wrapper").css("height", h + "px");
		$("#wrapper").css("overflow", "scroll");
	};
	//开始执行
	app.init = function() {
		initRefresh();
		loadData();
		//获取用户，拼接imurl
		app.getUser(function(data) {
			app.imLinkUrlReal = app.imLinkUrl + "&nickName=" + data.crmnickname + "&customerId=" + data.crmnickname;
		});
		//显示购物车数量
		baseCardCar.init(function() {
			var sum = baseCardCar.sum;
			if(sum < 1) {
				$("#shoppingCar .aui-badge").hide();
			} else {
				$("#shoppingCar .aui-badge").show();
				$("#shoppingCar .aui-badge").text(sum > 99 ? 99 : sum);
			}
		});
	};
	return app;
});