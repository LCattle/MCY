//首页
define(["base/baseApp", "../lib/aui/script/aui-slide", "animate","base/baseCar", "base/cmycounts"], function(app, slide, animate,baseCar, _CMY) {
	var adColor = ["app_bg_green", "app_bg_yellow", "app_bg_red", "app_bg_yellow", "app_bg_green"];
	console.log('统计有吗？');
    console.log(_CMY.init({}));
    
	function showItems(data) {
		data.sort(function(row1, row2) {
			return row1.sort > row2.sort;
		})
		var itemIndex = 0;
		$.each(data, function(i, item) {
			if(item.position === "BANNER") {
				insertBanner(item);
				return;
			}
			
			if(item.position === "OPTIONAL") {
				inserItemTitle(item, itemIndex++,true);
				insertOPTIONAL(item);
			} else if(item.position === "PACKAGE") {
				inserItemTitle(item, itemIndex++,true);
				insertPACKAGE(item);
			} else if(item.position === "CARD") {
				inserItemTitle(item, itemIndex++);
				insertCARD(item);
			} else if(item.position === "KNOWLEDGE") {
				inserItemTitle(item, itemIndex++);
				insertKNOWLEDGE(item);
			} else if(item.position === "VISUAL") {
				inserItemTitle(item, itemIndex++);
				insertVISUAL(item);
			}
		});
	}

	function inserItemTitle(data, index,showmoer) {
		var temp = app.getTempBySelector("#iTemTemplate");
		data.color = adColor[index];
		data.showMoer = showmoer;
		$("#itemsBox").append(temp(data));
	}

	function appendListData(id, tempId, data) {
		var temp = app.getTempBySelector("#" + tempId);
		for(var i = 0; i < data.length; i++) {
			$("#" + id).append(temp(data[i]));
		}
	}

	function insertGoodsBox(data, id,showMoer) {
		var temp = app.getTempBySelector("#goodsBoxTemplate");
		$("#item_" + data.position).append(temp({
			id: id,
			showMoer:showMoer
		}));
	}

	function insertPACKAGE(data, index) {
		var id = data.position + "List";
		insertGoodsBox(data, id,true);
		$.each(packageGoods,function(i,item){
			if(item&&item.name&&item.name.length>7){
				item.name =item.name.substr(0,7)+"...";
			}
		});
		appendListData(id, "goodsTemplate", packageGoods);
	}

	function insertCARD(data, index) {
		var id = "item_" + data.position;
		appendListData(id, "img1Template", cardData);
	}

	function insertKNOWLEDGE(data, index) {
		var id = data.position + "List";
		var temp = app.getTempBySelector("#knTemplate");
		$("#item_" + data.position).append(temp({
			id: id
		}));
		appendListData(id, "img2Template", knowledgeData);
	}

	function insertOPTIONAL(data, index) {
		var id = data.position + "List";
		insertGoodsBox(data, id,true);
		$.each(optionalGoods,function(i,item){
			if(item&&item.name&&item.name.length>7){
				item.name =item.name.substr(0,5)+"...";
			}
		});
		appendListData(id, "goodsTemplate", optionalGoods);
	}

	function insertVISUAL(data, index) {
		var id = "item_" + data.position;
		appendListData(id, "img1Template", visualData);
	}
	//插入轮播图
	function insertBanner(data) {
		appendListData("bannerImgs", "bannerTemplate", bannerData);
	}

	//初始化底部栏
	function initTab() {
		var tab = new auiTab({
			element: document.getElementById("footer"),
			repeatClick:true
		}, function(ret) {
			if(ret.index == 4) {
				if(!app.checkLogin()) {
					app.toLoginPage();
				}else{
                    app.href("html/userCenter.html");
				}
			} else if(ret.index == 3) {
                app.href("html/shoppingCar.html");
			} else if(ret.index == 2) {
                app.href("liveVideo/index.html");
			}else{
				app.replace(location.href);
			}
		});
	}

	app.clickItem = function() {
		console.log("123");
	};
	//初始化宽高
	app.initPage = function() {
		app.slideWidth = $(window).width();
		app.slideHeight = app.slideWidth / 2.3;
		app.goodsWidth = app.slideWidth / 3; //商品盒子宽度
		app.goodsImgheight = app.goodsWidth * 0.8; //商品图片高度
		var winHeight = $(window).height();
		var headrHeight = $("header")[0].clientHeight;
		var footerHeight = $("footer")[0].clientHeight;
		$("#slideBox").css({
			"margin-top": headrHeight + "px",
			"width": "100%",
			"height": app.slideHeight + "px"
		})
		if(app.slide) {
			app.slide.destroy();
			startSlide();
		}
	};
	window.onresize = function() {
		app.replace(location.href);
	};
	//开始执行轮播
	function startSlide() {
		app.slide = new auiSlide({
			container: document.getElementById("aui-slide"),
			"width": app.slideWidth,
			"height": app.slideHeight,
			"speed": 400,
			"autoPlay": 5000, //自动播放
			"loop": true,
			"pageShow": true,
			"pageStyle": 'dot',
			'dotPosition': 'center'
		})
	}
	app.appBefore = function() {
		this.template1 = this.getTempBySelector("#template1");
		this.template2 = this.getTempBySelector("#template2");
	};
	//	加载数据
	function loadData() {
		require([app.getNetServer("d") + "wx_index_data.js?_=" + new Date().getTime()], function() {
			showItems(positionData);
			$("#wx_ewm").show();
			startSlide();
		}, function() {
			app.tipInfo("数据加载失败");
		});
	}
	//开始执行
	app.init = function() {
		loadData();
		initTab();
		baseCar.init(function(){
			if(baseCar.sum>0){
				var sum = baseCar.sum>99?99:baseCar.sum;
				$("#carNum").show().text(sum);
			}
		});
		if(!app.checkLogin()) {
			$("#loginbtn").show();
		}
	};

    app.bannerGo = function(url){
        if(url == './html/scanCard.html' && !app.checkLogin()){
            localStorage.loginBackUrl = 'scanCard.html';
            return "./html/loginNew.html?back=true";
        }

//      if(url == './html/yiyuangou.html' && !app.checkLogin()){
//          localStorage.loginBackUrl = 'yiyuangou.html';
//          return "./html/login.html?back=true";
//		}

        if(url == './html/v315.html' && !app.checkLogin()){
            localStorage.loginBackUrl = 'v315.html';
            return "./html/loginNew.html?back=true";
        }

        return url;
    }
    
    app.yxActivityGo = function () {
        if(!app.checkLogin()){
            app.replace("./html/loginNew.html");
            return;
		}

        yxActivityCheck();
    }
    
    function yxActivityCheck() {
        var lt = localStorage.loginedToken;
        var flag = false;
        app.POSTRequest("weixin/mall/activity/activity.do", {
            data: {
                loginedtoken: lt
            },
			success: function(data) {
                if(data && data.resultCode == 1) {
                    location.href = "./html/yxActivity.html";
                } else {
                    app.tipInfo(data.resultMsg);
                }
            }
        });
    }
    
	return app;
});