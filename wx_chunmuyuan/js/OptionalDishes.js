//自选菜列表
define(["base/baseApp", "refresher", "animate", "./base/baseCar", "./base/basePage","./base/discount"], function(app, refresher, animate, car, page, discount) {
	app.car = car; //购物车对象赋值
    app.getStartFee();

    app.stock = {};

    app.sellMin = discount.currDiscount();
    
	//显示购物车总数
	function setCarSum() {
		var sum = app.car.sum;
		if(sum < 1) {
			$("#shoppingCar .aui-badge").hide();
		} else {
			$("#shoppingCar .aui-badge").show();
			$("#shoppingCar .aui-badge").text(sum > 99 ? 99 : sum);
		}
		countWeight();
	}
	/**
	 *选中的分类id 
	 */
	var selectedCate = '';
 
 	if(app.UrlParams.columnId != ""){
		selectedCate = app.UrlParams.columnId;
	}
	    
	/**选择分类*/
	app.selectCate = function(self,cateId) {
		$(self).closest("ul").find(".aui-list-item-right").hide();
		$(self).find(".aui-list-item-right").show();
        $("#list").empty();
        app.showEnable = false;
        app.closeCate();
		selectedCate = cateId;
		page.reset();
		app.pageRefresher.noData(false); //置为有数据
		loadData();
	};

	/**显示分类信息*/
	function showCate() {
		var temp = app.getTempBySelector("#cateTemplate");
		$.each(app.cateData, function(i, item) {
			$("#cateBox").before(temp(item));
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
				console.log(data);
				if(data.resultCode == 1) {
					app.cateData = data.resultObj;
					showCate();
				} else {
					app.tipInfo(data.resultMsg);
				}
			}
		});
	}
	//显示引导
	function showCurve() {
		if(!localStorage.isShowCurve) {
			$("body").append('<div class="dlg_bg"></div>');
			$(".curve").show();
			$(".curve").on("touchmove", function(e) {
				e.preventDefault();
			});
			$(".dlg_bg").on("touchmove", function(e) {
				e.preventDefault();
			});
			$(".dlg_bg").on("click", function() {
				$(".curve").remove();
				$(".dlg_bg").remove();
				localStorage.isShowCurve = true;
			});
			$(".curve").on("click", function() {
				$(".curve").remove();
				$(".dlg_bg").remove();
				localStorage.isShowCurve = true;
			});
		}
	}
	app.addList = function(data) {
		if(page.pageIndex == 1) {
			$("#list").empty();
		}
		for(var i = 0; i < data.length; i++) {
			var item = data[i];
			if(app.car.data[item.id]) { //购物车同步到页面
				item.count = app.car.data[item.id].skucount;
				if(app.car.data[item.id].skucount > app.stock[item.id].stock){
                    item.count = app.stock[item.id].stock;
                    app.car.minus(item.id, app.car.data[item.id].skucount - app.stock[item.id].stock, function() {
                        setCarSum();
                    });
				}
			} else {
				item.count = 0;
			}
			$("#list").append(this.template(item));
		}
		if(page.data.length == 0) {
			app.emptyList("#list");
		}
	};
	//点击加号后的动画效果
	app.showCarAnimate = function(e, event) {
		event.stopPropagation();
		var x = event.pageX;
		var y = event.pageY;
		var dx = this.carLeft;
		var dy = this.carTop;
		var id = "move_logo" + this.uuid();
		$("body").append("<div id='" + id + "' class='move_logo' style='top:" + y + "px;left:" + x + "px;'>1<div>");
		setTimeout(function() {
			$("#" + id).animate({
				"left": dx + "px",
				"top": dy + "px"
			}, 500, function() {
				$("#" + id).remove();
			});
		}, 10);
	}

	app.clickCar = function(el, e) {
		location.href = "shoppingCar.html";
	};
	app.clickPlus = function(el, e, sku) {
        if(app.car.data[sku] && ((app.car.data[sku].skucount + 1) > app.stock[sku].stock)){
            app.tipInfo(app.stock[sku].skuname + "商品库存只有" + app.stock[sku].stock + "个哦！");
            return;
        }
		if(app.car.isNetBack) {
            app.car.add(sku, 1, function() {
				var num = $(el).prev().val();
				$(el).prev().val(++num);
				app.showCarAnimate(el, e);
				setCarSum(); //显示购物车总数
			});
		}

	};
	app.clickMinus = function(el, e, sku) {
		var num = $(el).next().val();
		if(num<=1){
			$(el).parent().hide();
			$(el).parent().prev().show();
		}
		if(num <= 0) {
			$(el).next().val(0);
			return;
		}
		if(app.car.isNetBack) {
			this.car.minus(sku, 1, function() {
				$(el).next().val(--num);
				setCarSum(); //显示购物车总数
			});
		}
	};
	app.clickShow = function(el, e, sku){
		if((app.car.data[sku]?app.car.data[sku].skucount + 1:1) > app.stock[sku].stock){
            app.tipInfo(app.stock[sku].skuname + "商品库存只有" + app.stock[sku].stock + "个哦！");
            return;
        }
		$(el).hide();
		$(el).next().show();
		$(el).next().find('input').val(1);
		if(app.car.isNetBack) {
			app.car.add(sku, 1, function() {
				var num = $(el).next().find('input').val();
				$(el).prev().val(++num);
				app.showCarAnimate(el, e);
				setCarSum(); //显示购物车总数
			});
		}
	}
	app.showVipDailog = function(){
		$(".vipDialog").show();
	};
	app.hideVipDailog = function(){
        $(".vipDialog").hide();
    };
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

	app.tempId = "#template1";
	//切换模板
	app.changeTemp = function(el) {
		if(this.tempId === "#template") {
			this.tempId = "#template1"
		} else {
			this.tempId = "#template"
		}
		el = $(el).find("i");
		if($(el).hasClass("icon-icon1460187865317")) {
			$(el).removeClass("icon-icon1460187865317");
			$(el).addClass("icon-iconfontzhizuobiaozhun30");
		} else {
			$(el).removeClass("icon-iconfontzhizuobiaozhun30");
			$(el).addClass("icon-icon1460187865317");
		}
		this.template = this.getTempBySelector(this.tempId);
		$("#list").animateCss(animate.zoomOut, function() {
			$("#list").empty()
			app.addList(page.data);
			$("#list").animateCss(animate.zoomIn);
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
		app.template = app.getTempBySelector(app.tempId);
	}
	app.initPage = function() {
		var h = $(window).height();
		/**
		 * 计算动画结束的位置
		 */
		this.carTop = h - $("#shoppingCar").height() * 2;
		this.carLeft = $(window).width() - $("#shoppingCar").height();
		//列表定高宽
		$("#list").css("min-height", h + "px");
		$("#wrapper").css("height", (h - $("#footer")[0].clientHeight-$("header")[0].clientHeight) + "px");
		$("#wrapper").css("overflow", "scroll");
	};

	/**是否只显示有货,默认都显示*/
	app.showEnable = false;
	/**
	 *点击是否显示有货 
	 */
	app.checkShowEnable = function(self) {
        $(self).closest("ul").find(".aui-list-item-right").hide();
        $(self).find(".aui-list-item-right").show();
        $("#list").empty();
		app.showEnable = !app.showEnable;
        selectedCate = "";
		// if(app.showEnable) {
		// 	$(".icon-duihao").addClass("app_color_green");
		// 	$(".icon-duihao").removeClass("app_text_gray");
		// } else {
		// 	$(".icon-duihao").removeClass("app_color_green");
		// 	$(".icon-duihao").addClass("app_text_gray");
		// }
		this.closeCate();
		page.reset();
		loadData();

	};
	//开始执行
	app.init = function() {
		//showCurve(); //显示引导
		loadCate(); //加载分类信息
		initTemplate(); //初始化模板
		initRefresh(); //初始化下拉组件
		car.init(function() { //初始化完成后回掉
			setCarSum(); //显示购物车总数
			loadData(); //加载商品数据
			loadCard();
		}); //初始化购物车数据
		$("header").on("touchmove", function(e) {
			e.preventDefault();
		})
		$(".cateListBox").on("touchmove", function(e) {
			e.preventDefault();
		})
		$("#footer").on("touchmove", function(e) {
			e.preventDefault();
		});
		$("#shoppingCar").on("touchmove", function(e) {
			e.preventDefault();
		});
	};

	//加载商品数据
	function loadData(key) {
		app.POSTRequest("weixin/mall/sku/skuLists.do", {
			data: {
				productType: 1, //商品类型(1:自选菜,2:宅配套餐,3:礼品卡,4:充值卡)
				columnId: selectedCate, //商品所属分类id
				beginPage: page.pageIndex,
				key: $("#search-input").val().trim(), //搜索关键字
				hide: app.showEnable ? "1" : 0, //是否隐藏售罄商品
				pageSize: page.pageSize,
				skuids: app.UrlParams.ids
			},
			loading: "加载中...",
			success: function(data) {
				console.log(data);
				app.pageRefresher.resetload();
				if(data.resultCode === "1") {
					page.hasNextPage = data.basePageObj.hasNextPage;
                    $.each(data.basePageObj.dataList,function (i,it) {
                        app.stock[it.id] = it	;
                        it.minPrice = (it.sellprice*app.sellMin).toFixed(2);
                    });
					page.addData(data.basePageObj.dataList); //往page添加数据
					app.addList(data.basePageObj.dataList); //会掉
					addCarSkus(data.basePageObj.dataList);
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
	var carSkus = {};
	//添加数据
	function addCarSkus(data) {
		$.each(data, function(index, item) {
			carSkus["sku" + item.id] = item;
		});
	}

	function loadCard() {
		var ids = car.getSkus();
		if(ids.length < 1) {
			return;
		};
		app.POSTRequest("weixin/mall/sku/queryBySkuid.do", {
			data: {
				skuid: ids
			},
			success: function(data) {
				if(data.resultCode == 1) {
					addCarSkus(data.resultObj);
					countWeight();
				} else {
					app.tipInfo("购物车商品加载失败");
				}
			},
			complete: function() {
				app.pageRefresher.resetload();
			}
		});

	}
	//计算购物车重量
	function countWeight() {
		var ids = car.getSkus();
		ids = ids.split(",");
		var sum = 0;
        if(app.checkLogin()){
            $.each(ids, function(i, item) {
                var data = carSkus["sku" + item];
                if(data) {
                    if(data.stock < 1 || data.product.isonline == "N") {} else {
                        sum += (data.sellprice*app.sellMin).toFixed(2) * car.data[item].skucount;
                    }
                }
            });
		} else {
            $.each(ids, function(i, item) {
                var data = carSkus["sku" + item];
                if(data) {
                    if(data.stock < 1 || data.product.isonline == "N") {} else {
                        sum += (data.sellprice).toFixed(2) * car.data[item].skucount;
                    }
                }
            });
		}
        if(!app.checkLogin()){
			$("#priceName").text("总计:");
            $("#vipTip").show();
        } else {
            $("#priceName").text(app.vipLeave);
		}
		$("#nowkg").html(app.getPriceStr(sum));
		$("#wrapper").css("height", ($(window).height() - $("#footer")[0].clientHeight-$("header")[0].clientHeight) + "px");
		$("#sumWeight").text(app.getKg(sum));

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