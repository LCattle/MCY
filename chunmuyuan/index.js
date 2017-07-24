define(["./base/baseApp", "swipe", "refresher"], function(app, swipe, refresher) {
	//变量定义
	//广告位置
	var positionData = [{
		"position": "APPOPTIONAL",
		"title": "自选菜",
		"sort": 2,
		"img": "/upload/image/20170414/1492162977314063907.jpg",
		"url": "html/OptionalList.html"
	}, {
		"position": "APPENTRY",
		"title": "导航",
		"sort": 1,
		"url": "html/cardList.html"
	}, {
		"position": "APPPLANT",
		"title": "种植机",
		"img": "/upload/image/20170414/1492162977314063907.jpg",
		"sort": 4,
		"url": "html/website.html"
	}, {
		"position": "APPPOTTEDPLANT",
		"title": "盆栽",
		"img": "/upload/image/20170414/1492162977314063907.jpg",
		"sort": 6,
		"url": "html/indoorPackages.html"
	}, {
		"position": "APPHOTSELL",
		"title": "热销推荐",
		"img": "/upload/image/20170414/1492162977314063907.jpg",
		"sort": 6,
		"url": "html/indoorPackages.html"
	}, {
		"position": "APPCAMPAIGNS",
		"title": "营销活动",
		"img": "/upload/image/20170414/1492162977314063907.jpg",
		"sort": 7,
		"url": "html/cardList.html"
	}, {
		"position": "APPPACKAGE",
		"title": "宅配套餐",
		"img": "/upload/image/20170414/1492162977314063907.jpg",
		"sort": 6,
		"url": "html/indoorPackages.html"
	}];
	//宅配套餐
	var packageGoods = [{
		"price": 3000,
		"name": "水培宅配套餐C",
		"img": "/upload/image/20170323/1490258022875099363.jpg",
		"url": "goods/goodsDetails.html?pid=s4359"
	}];
	//热销
	var hotSellData = [{
		"price": 3000,
		"label": "recommend",
		"ads": "好的产品",
		"name": "水培宅配套餐C",
		"img": "/upload/image/20170323/1490258022875099363.jpg",
		"url": "goods/goodsDetails.html?pid=s4359"
	}, {
		"price": 3000,
		"label": "recommend",
		"ads": "好的产品",
		"name": "水培宅配套餐C",
		"img": "/upload/image/20170323/1490258022875099363.jpg",
		"url": "goods/goodsDetails.html?pid=s4359"
	}, {
		"price": 3000,
		"label": "recommend",
		"ads": "好的产品",
		"name": "水培宅配套餐C",
		"img": "/upload/image/20170323/1490258022875099363.jpg",
		"url": "goods/goodsDetails.html?pid=s4359"
	}];
	//种植机
	var plantMachineData = [{
		"price": 3000,
		"label": "recommend",
		"ads": "好的产品",
		"name": "水培宅配套餐C",
		"img": "/upload/image/20170323/1490258022875099363.jpg",
		"url": "goods/goodsDetails.html?pid=s4359"
	}, {
		"price": 3000,
		"label": "recommend",
		"ads": "好的产品",
		"name": "水培宅配套餐C",
		"img": "/upload/image/20170323/1490258022875099363.jpg",
		"url": "goods/goodsDetails.html?pid=s4359"
	}, {
		"price": 3000,
		"label": "recommend",
		"ads": "好的产品",
		"name": "水培宅配套餐C",
		"img": "/upload/image/20170323/1490258022875099363.jpg",
		"url": "goods/goodsDetails.html?pid=s4359"
	}];
	//盆栽
	var pottedPlantData = [{
		"price": 3000,
		"label": "recommend",
		"ads": "好的产品",
		"name": "水培宅配套餐C",
		"img": "/upload/image/20170323/1490258022875099363.jpg",
		"url": "goods/goodsDetails.html?pid=s4359"
	}, {
		"price": 3000,
		"label": "recommend",
		"ads": "好的产品",
		"name": "水培宅配套餐C",
		"img": "/upload/image/20170323/1490258022875099363.jpg",
		"url": "goods/goodsDetails.html?pid=s4359"
	}, {
		"price": 3000,
		"label": "recommend",
		"ads": "好的产品",
		"name": "水培宅配套餐C",
		"img": "/upload/image/20170323/1490258022875099363.jpg",
		"url": "goods/goodsDetails.html?pid=s4359"
	}];
	var optionalGoods = [{
		"price": 350,
		"name": "水培西兰花",
		"img": "/upload/image/20170323/1490257560968053710.jpg",
		"url": "goods/goodsDetails.html?pid=s4335"
	}];
	//营销活动
	var campaingsData = [{
		"name": "水培西兰花",
		"img": "/upload/image/20170323/1490257560968053710.jpg",
		"url": "goods/goodsDetails.html?pid=s4335"
	}, {
		"name": "水培西兰花",
		"img": "/upload/image/20170323/1490257560968053710.jpg",
		"url": "goods/goodsDetails.html?pid=s4335"
	}, {
		"name": "水培西兰花",
		"img": "/upload/image/20170323/1490257560968053710.jpg",
		"url": "goods/goodsDetails.html?pid=s4335"
	}];

	var bannerData = [{
		"name": "一元送菜",
		"img": "/upload/image/20170414/1492162977314063907.jpg",
		"url": "./html/yiyuangou.html"
	}, {
		"name": "观光券",
		"img": "/upload/image/20170330/1490865148385023483.jpg",
		"url": "./html/ticketList.html"
	}];
	var navigationData = [{
		"name": "尝鲜",
		"img": "imgs/index/actionIcon03.png",
		"url": "./html/yiyuangou.html"
	}, {
		"name": "电子卡",
		"img": "imgs/index/actionIcon05.png",
		"url": "./html/ticketList.html"
	}, {
		"name": "电子卡",
		"img": "imgs/index/actionIcon05.png",
		"url": "./html/ticketList.html"
	}, {
		"name": "电子卡",
		"img": "imgs/index/actionIcon05.png",
		"url": "./html/ticketList.html"
	}, {
		"name": "电子卡",
		"img": "imgs/index/actionIcon07.png",
		"url": "./html/ticketList.html"
	}, {
		"name": "电子卡",
		"img": "imgs/index/actionIcon09.png",
		"url": "./html/ticketList.html"
	}, {
		"name": "电子卡",
		"img": "imgs/index/actionIcon05.png",
		"url": "./html/ticketList.html"
	}];
	//变量定义结束

	//显示广告
	function showAdvs(data) {
		//先对广告位 按后台设置顺序排序
		data.sort(function(row1, row2) {
			return row1.sort > row2.sort;
		})
		//循环处理各个广告位
		$.each(data, function(i, item) {
			if(item.position === "APPOPTIONAL") {
				//处理自选菜和宅配套餐的
				initAdvVegetables(item, optionalGoods, packageGoods);
			} else if(item.position === "APPENTRY") {
				//处理导航数据
				initNaviAction(navigationData);
			} else if(item.position == "APPHOTSELL") {
				//处理热销
				initGoods2(item, hotSellData);
			} else if(item.position == "APPPLANT") {
				//处理种植机
				initGoods2(item, plantMachineData);
			} else if(item.position == "APPPOTTEDPLANT") {
				//处理种盆栽
				initGoods2(item, pottedPlantData);
			} else if(item.position == "APPCAMPAIGNS") {
				//营销活动
				initCampaings(item, campaingsData);
			}
		});
	}

	/**
	 * 舒适轮播图信息
	 * @param {Object} data
	 */
	function initBannerView(data) {
		//计算banner图高度(计算原则 设计图是 width:height = 2:1)
		var bannerHeight = $(window).width() / 2;
		//设置banner顶级容器高度
		$("#bannerbox").css("height", bannerHeight + "px");
		//找到模板
		var temp = app.getTempBySelector("#bannerTemplate");
		//找到存放banner的容器
		var box = $("#bannerbox .swiper-wrapper");
		for(var i = 0; i < data.length; i++) {
			var item = data[i];
			//计算图片全路径
			item.img = app.getImgPath(item.img);
			//将元素添加到容器
			box.append(temp(item));
		}
		//开启swipe
		startSwipe("#bannerbox");
	}
	/**
	 * 开始启用swipe组件
	 */
	function startSwipe(selector) {
		app.mySwiper = new Swiper(selector, {
			loop: true,
			initialSlide: 0,
			autoplay: 5000,
			pagination: '.swiper-pagination'
		});
	}

	//加载资讯内容
	function loadInformation() {

	}
	/**
	 * 将盒子从body中移除，添加到contentbox，并显示
	 * @param {Object} boxSelector
	 */
	function changeBoxPosition(box) {
		//将盒子从body中移除
		box.remove();
		//将盒子添加到contentbox
		$("#contentBox").append(box);
		//将盒子设置为显示
		box.show();
	}
	//初始化导航按钮
	function initNaviAction(data) {
		//找到导航的盒子
		var box = $("#advNavigation");
		//生成盒子第一个子容器
		var row1 = $('<div layout class="aui-margin-b-15"></div>');
		//生成盒子第二个子容器
		var row2 = $('<div layout class="aui-margin-b-15"></div>');
		//找到模板
		var temp = app.getTempBySelector("#advNavigationTemplate");
		for(var i = 0; i < 8; i++) {
			var item = data[i];
			if(i < 4) {
				//前面4个添加到第一行 如果没数据就添加一个占位div
				row1.append(item ? temp(item) : "<div flex></div>");
			} else {
				//后面4个添加到第二行 如果没数据就添加一个占位div
				row2.append(item ? temp(item) : "<div flex></div>");
			}
		}
		//将子容器加到盒子中
		box.append(row1, row2);
		//将盒子从body中移除，添加到contentbox，并显示
		changeBoxPosition(box);
	}
	//生成一个广告的头部
	function createTitleBox(item, hideImg, hideMore) {
		item.hideImg = hideImg;
		item.hideMore = hideMore;
		//计算广告位 图片的真实地址
		item.img = app.getImgPath(item.img);
		var box = app.advTitleTemp(item);
		return $(box);
	}

	//初始化 蔬菜广告（自选菜和宅配）
	function initAdvVegetables(item, optionalGoods, packageGoods) {
		//生成容器盒子
		var box = $("<div></div>");
		//生成自选菜盒子
		var optionalBox = createTitleBox(item);
		//去掉下边距
		optionalBox.removeClass("aui-margin-b-10");
		box.append(optionalBox);
		var listStr = '<div style="overflow: scroll;">' +
			'<div  class="swiper-wrapper">' +
			'</div></div>';
		var optionalList = $(listStr);
		optionalBox.append(optionalList);
		//找到蔬菜商品的模板
		var temp = app.getTempBySelector("#vegetablesTemplate");
		//计算一个模板的宽度(计算规则，全屏的2/5)
		var itemWidth = $(window).width() / 5 * 2;
		//添加自选菜
		$.each(optionalGoods, function(i, item) {
			item.width = itemWidth;
			//计算蔬菜图片的全路径
			item.img = app.getMiddelPath(item.img);
			//添加模板进去
			optionalList.find(".swiper-wrapper").append(temp(item));
		});

		//添加宅配套餐
		//生成宅配套餐盒子
		var packageBox = null;
		$.each(positionData, function(i, item) {
			if(item.position == "APPPACKAGE") {
				packageBox = createTitleBox(item, true);
			}
		});
		var packList = $(listStr);
		packageBox.append(packList);
		box.append(packageBox);
		$.each(packageGoods, function(i, item) {
			item.width = itemWidth;
			//计算蔬菜图片的全路径
			item.img = app.getMiddelPath(item.img);
			//添加模板进去
			packageBox.find(".swiper-wrapper").append(temp(item));

		});
		//显示盒子
		changeBoxPosition(box);
	}
	//初始化热销商品
	function initGoods2(item, data) {
		var box = createTitleBox(item, false, true);
		//找到热销商品的模板
		var temp = app.getTempBySelector("#hotsellTemplate");
		//计算一个模板的宽度(计算规则，全屏的1/2)
		var itemWidth = $(window).width() / 2;
		var row = null;
		$.each(data, function(i, item) {
			if(i % 2 == 0) {
				row = $("<div layout class='app_bg_white'></div>");
				box.append(row);
			}
			item.width = itemWidth;
			//计算图片的全路径
			item.img = app.getMiddelPath(item.img);
			row.append(temp(item));
		})
		changeBoxPosition(box);
	}
	//营销活动
	function initCampaings(item, data) {
		//改变标题颜色
		var last2Ch = item.title.substring(item.title.length - 2);
		item.title = item.title.substring(0, item.title.length - 2) +
			'<span class="app-text-orange">' + last2Ch + '</span>';
		//生成盒子
		var box = createTitleBox(item, true);

		var temp = null;
		var boxwidth = $(window).width();
		app.actImg1Height = boxwidth / 5 * 3;
		if(data.length == 1) { //一张图
			temp = app.getTempBySelector("#campaing1temp");
			//标准是 （750/450）
		} else if(data.length == 2) { //2张图
			temp = app.getTempBySelector("#campaing2temp");
		} else if(data.length == 3) {
			temp = app.getTempBySelector("#campaing3temp");
			app.actImg1Width = boxwidth / 25 * 14;
		} else {
			temp = app.getTempBySelector("#campaing4temp");
		}
		//计算图片全路径
		$.each(data, function(i, item) {
			item.img = app.getImgPath(item.img);
		});
		box.append(temp(data));
		changeBoxPosition(box);
	}

	//初始化下拉刷新
	function initRefresh() {
		$("#wrapper").css("height", $(window).height() - app.REM2PX(2.5))
		var isInpull = false;
		refresher.domDown = {
			domClass: 'nulldom',
			domRefresh: '<div></div>',
			domLoad: '<div></div>',
			domNoData: '<div></div>'
		}
		var dtime = 500; //头部隐藏和显示的动画时间
		refresher.onStartPull = function() {
			if(isInpull) {
				return;
			}
			isInpull = true;
			$("#header").animate({
				opacity: 0
			}, dtime, function() {
				$("#header").hide();
			});
			$("#headerbg").animate({
				opacity: 0
			}, dtime, function() {
				$("#headerbg").hide();
			});
		}
		refresher.onCancelPull = function() {
			$("#headerbg").show();
			$("#header").show();

			$("#header").animate({
				opacity: 1
			}, dtime, function() {
				isInpull = false;
			});
			$("#headerbg").animate({
				opacity: 0.5
			}, dtime, function() {});
		}
		app.pageRefresher = refresher.initDropload("#wrapper",
			function(me) {
				setTimeout(function() {
					me.resetload();
					refresher.onCancelPull();
				}, 2000);
			},
			function(me) {
				me.noData();
				me.resetload();
			});
	}
	//初始化底部栏
	function initTab() {
		var tab = new auiTab({
			element: document.getElementById("footer"),
			repeatClick: true
		}, function(ret) {
			if(ret.index == 4) {
				if(!app.checkLogin()) {
					app.toLoginPage();
				} else {
					app.href("html/userCenter.html");
				}
			} else if(ret.index == 3) {
				app.href("html/shoppingCar.html");
			} else if(ret.index == 2) {
				app.href("liveVideo/index.html");
			} else {
				app.replace(location.href);
			}
		});
	}
	app.init = function() {
		require([app.getNetServer("d") + "app_index_data.js?_=" + new Date().getTime()], function() {
			initTab();
			//标题头模板
			app.advTitleTemp = app.getTempBySelector("#advTitleTemplate");
			//显示banner
			initBannerView(bannerData);
			//加载资讯
			loadInformation();
			//显示各个广告
			showAdvs(positionData);
			initRefresh();
		}, function() {
			app.tipInfo("数据加载失败");
		});

	};
	return app;
});