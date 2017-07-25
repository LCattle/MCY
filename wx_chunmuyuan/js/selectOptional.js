//自选菜列表
define(["base/baseApp", "refresher", "animate", "./base/basePage"], function(app, refresher, animate, page) {

	/**
	 *选中的分类id 
	 */
	var selectedCate = '';
	
	var selectSku = {};
	
	var  skuMap = {};
	
	/**选择分类*/
	app.selectCate = function(cateId) {
		app.closeCate();
		if(cateId != selectedCate) {
			selectedCate = cateId;
			page.reset();
			app.pageRefresher.noData(false); //置为有数据
			loadData();
		}
	};

	/**显示分类信息*/
	function showCate() {
		var temp = app.getTempBySelector("#cateTemplate");
		$.each(app.cateData, function(i, item) {
			$("#cateBox").append(temp(item));
		});
	}
	/**
	 *加载分类信息 
	 */
	function loadCate() {
		app.POSTRequest("weixin/mall/column/getColumnLists.do", {
			data: {
				columnId: 1
			},
			success: function(data) {
				if(data.resultCode == 1) {
					app.cateData = data.resultObj;
					showCate();
				} else {
					app.tipInfo(data.resultMsg);
				}
			}
		});
	}

	app.clickPlus = function(el, e, sku) {
		var num = $(el).prev().val();
		var count = ++num;
		$(el).prev().val(count);
		putSelectSku(sku,count);

	};
	
	function putSelectSku(sku,count){
		var skuObj = skuMap[sku];
		var item = {
			"skuname":skuObj.skuname,
			"skupic":skuObj.picpath,
			"productpic":skuObj.picpath,
			"virtualfee":skuObj.virtualvalue,
			"skuid":skuObj.id,
			"count":count,
			"refundamount":count
		}
		selectSku[sku] = item;
	}
	app.clickMinus = function(el, e, sku) {
		var num = $(el).next().val();
		if(num <= 0) {
			$(el).next().val(0);
			return;
		}
		var count = --num;
        $(el).next().val(count);
        if(count == 0){
        	delete selectSku[sku];
        } else {
			putSelectSku(sku,count);
        }
	};
	//确定
	app.clickNext = function(){
		var kobe = app.UrlParams.oid;
		var timstamp = (new Date()).valueOf();
		app.setLocalObjet("selectskus",selectSku);
		//history.go(-1);
		location.href = "amend.html?oid="+ kobe + "&t=" + timstamp;
	}
	/**打开分类*/
	app.OpenCate = function() {
		$(".dlg_bg").remove();
		$("body").append('<div class="dlg_bg"></div>');
		$(".cateListBox").show();
		$(".dlg_bg").on("touchmove", function(e) {
			e.preventDefault();
		});
		setTimeout(function() {
			$(".cateListBox").animateCss("fadeInDown");
		}, 10)
	};
	/**关闭分类*/
	app.closeCate = function() {
		$(".cateListBox").animateCss("fadeOutUp", function() {
			$(".dlg_bg").remove();
			$(".cateListBox").hide();
		});
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
		app.pageRefresher._threshold = 50;
	}

	function initTemplate() {
		app.cateTemplate = app.getTempBySelector("#catetemplate")
		app.template = app.getTempBySelector("#template");
	}
	app.initPage = function() {
		var h = $(window).height();
		//列表定高宽
		$("#list").css("min-height", h + "px");
        $("#wrapper").css("height", (h - $("header")[0].clientHeight) + "px");
		$("#wrapper").css("overflow", "scroll");
	};

	//开始执行
	app.init = function() {
		loadCate(); //加载分类信息
		initTemplate(); //初始化模板
		initRefresh(); //初始化下拉组件

        loadData(); //加载商品数据
		// 初始化购物车数据
		$("header").on("touchmove", function(e) {
			e.preventDefault();
		});
		$(".cateListBox").on("touchmove", function(e) {
			e.preventDefault();
		});
	};
	
	
        
    var localSkus = app.getLocalObject("localcombo");
    var selectskus1 = app.getLocalObject("selectskus1");

    app.addList = function(data) {
        if(page.pageIndex == 1) {
            $("#list").empty();
        }
        for(var i = 0; i < data.length; i++) {
            var item = data[i];
            if((localSkus && (localSkus[item.id] || localSkus[item.id] == 0))
            	|| (selectskus1 && (selectskus1[item.id] || selectskus1[item.id] == 0))){
            	continue;
            }
            skuMap[item.id] = item;
			item.count = 0;
			
            $("#list").append(this.template(item));
        }
        if(page.data.length == 0) {
            app.emptyList("#list");
        }
    };

	//加载商品数据
	function loadData(key) {
		app.POSTRequest("weixin/mall/sku/skuLists.do", {
			data: {
				productType: 1, //商品类型(1:自选菜,2:宅配套餐,3:礼品卡,4:充值卡)
				columnId: selectedCate, //商品所属分类id
				beginPage: page.pageIndex,
				key: $("#search-input").val().trim(), //搜索关键字
				hide: "1", //是否隐藏售罄商品
				pageSize: page.pageSize,
				skuids: app.UrlParams.ids
			},
			loading: "加载中...",
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

	/**触发搜索 
	 */
	app.search = function(e) {
		$(e).blur();
		$("body").focus();
		page.reset();
		loadData();
	};
	//跳转到详情页
	app.toDetails = function(id) {
		$.each(page.data, function(i, item) {
			if(item && item.id == id) {
				app.setLocalObjet("goodsobj", item);
				location.href = "../goods/goodsDetails.html";
			}
		});
	}
	return app;
});