//宅配套餐列表列表
define(["base/baseApp", "refresher", "animate", "./base/basePage"], function(app, refresher, animate, page) {
	//绘制信息
	app.addList = function(data) {
		if(page.pageIndex == 1) {
			$("#list").empty();
		}
		for(var i = 0; i < data.length; i++) {
			if(data[i].id != 401){
				data[i].minPrice = (data[i].sellprice*app.sellMin).toFixed(2);
				$("#list").append(this.template(data[i]));
			}
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
		app.POSTRequest("weixin/mall/sku/skuLists.do", {
			data: {
				productType: 2, //商品类型(1:自选菜,2:宅配套餐,3:礼品卡,4:充值卡)
				columnId: '', //商品所属分类id
				beginPage: page.pageIndex,
				hide: 0,
				key: '',
				pageSize: page.pageSize
			},
			success: function(data) {
				console.log(data);
				app.pageRefresher.resetload();
				app.getSysParam("MEMBERLEVELDISCOUNT",function(data){
						var arr = [];
						$.each(data,function(i,item){
						    arr.push(item.paramvalue);
						})
						app.sellMin = Math.min.apply(null, arr);
					},'biz');
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
	app.gotoDetails = function(id, e) {
		app.stopBubble(e);
		location.href = "../goods/goodsDetails.html?pid=s" + id;
	}
	//初始化页面
	app.initPage = function() {
		this.template = this.getTempBySelector("#template");
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
	};
	return app;
});