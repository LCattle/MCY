/**
 * Created by wuxuanhua on 17/5/10.
 */
define(["base/baseApp", "animate", "dialog", "refresher", "./base/basePage"], function(app, animate, dialog, refresher, page) {
	var total;
	//获取页面模版 gardenDynamics
	var noExchange = app.getTempBySelector("#noExchangeTemplate"); //未兑换
	var hasExchange = app.getTempBySelector("#hasExchangeTemplate"); //已兑换

	var exchangeFlag = 1; //1未兑换的菜 2已兑换的菜
	var usedTag = 'list-noExchange'; //list-hasExchange
	var noCheckObj = {};
	var locked = false;
    var startNum = 5;
	function getStartNum() {
        app.getSysParam("VEGETABLEORDER", function(data) {
            $.each(data, function(i, it) {
                if(it.innercode == "GAMEORDER") {
                    if(it.paramvalue) {
                        startNum = it.paramvalue * 1;
                    }
                }
            });
        }, "biz");
    };

	app.init = function() {
        getStartNum(); //获取起送斤数
		initRefresh('wrapper-noExchange');
		myBasketSum('1'); //未兑换
		myBasketSum('2'); //已经兑换
		getMyBasketList();
	};

	app.initPage = function() {
		var hNo = $(window).height() - $("#tab").height() - $("footer").height();
		var hHas = $(window).height() - $("#tab").height();

		$("#wrapper-noExchange ul").css("width", $(window).width() + "px");
		$("#wrapper-noExchange ul").css("min-height", hNo + "px");

		$("#wrapper-noExchange").css("height", hNo + "px");
		$("#wrapper-noExchange").css("overflow", "scroll");

		$("#wrapper-hasExchange ul").css("width", $(window).width() + "px");
		$("#wrapper-hasExchange ul").css("min-height", hHas + "px");

		$("#wrapper-hasExchange").css("height", hHas + "px");
		$("#wrapper-hasExchange").css("overflow", "scroll");
	};

	//初始化下拉刷新
	function initRefresh(domId) {
		page.reset();
		$('.dropload-down').remove();
		app.pageRefresher = refresher.initDropload("#" + domId, function(me) {
			page.reset();
			me.noData(false);
			getMyBasketList(me);
		}, function(me) {
			if(page.hasNextPage) {
				getMyBasketList(me);
			} else {
				me.noData(true);
				me.resetload();
			}
		});
	}

	//切换Tab
	var animateFinished = true;
	app.changeTab = function(tagId) {
		if(!animateFinished) return;
		if(tagId == 'no-exchange' && !$("#no-exchange").hasClass('aui-active')) {
			$("#no-exchange").addClass('aui-active');
			$("#has-exchange").removeClass('aui-active');

			animateFinished = false;
			$(".has-exchange").show().animateCss("slideOutRight", function() {
				$(".has-exchange").hide();
			});
			$("footer").show().animateCss("slideInLeft");
			$(".no-exchange").show().animateCss("slideInLeft", function() {
				animateFinished = true;
			});

			exchangeFlag = 1;
			usedTag = 'list-noExchange';
			initRefresh('wrapper-noExchange');
			$("#" + usedTag).empty();
			getMyBasketList();

		} else if(tagId == 'has-exchange' && !$("#has-exchange").hasClass('aui-active')) {
			$("#no-exchange").removeClass('aui-active');
			$("#has-exchange").addClass('aui-active');

			animateFinished = false;
			$(".no-exchange").show().animateCss("slideOutLeft", function() {
				$(".no-exchange").hide();
			});
			$("footer").show().animateCss("slideOutLeft", function() {
				$("footer").hide();
			});
			$(".has-exchange").show().animateCss("slideInRight", function() {
				animateFinished = true;
			});

			exchangeFlag = 2;
			usedTag = 'list-hasExchange';
			initRefresh('wrapper-hasExchange');
			$("#" + usedTag).empty();
			getMyBasketList();
		}
	};

	//选择
	app.checked = function(id, productid) {
		var state = false;
		if($("#" + id).hasClass('active')) {
			$("#" + id).removeClass('active');
			state = false;
		} else {
			$("#" + id).addClass('active');
			state = true;
		}

		noCheckObj[id + ''].checked = state;
		total = 0;
		var allChecked = true;
		for(var key in noCheckObj) {
			if(noCheckObj[key].checked) {
				total += noCheckObj[key].sellprice * noCheckObj[key].eAmount;
			} else {
				allChecked = false;
			}
		}
		if(allChecked) {
			$('#all-checked').addClass('active');
		} else {
			$('#all-checked').removeClass('active');
		}
		$("#total").html( '￥'+ total.toFixed(2));
	};
	app.isSelectAll = function() {
		return $("#all-checked").hasClass("active");
	};
	//选择所以
	app.checkedAll = function(event) {
		var state = false;
		if($(event).hasClass('active')) {
			$(event).removeClass('active');
			state = false;
		} else {
			$(event).addClass('active');
			state = true;
		}

		total = 0;
		for(var key in noCheckObj) {
			noCheckObj[key].checked = state;
			if(state) {
				$("#" + key).addClass('active');
				total += noCheckObj[key].sellprice * noCheckObj[key].eAmount;
			} else {
				$("#" + key).removeClass('active');
			}
		}
		$("#total").html('￥' + total.toFixed(2));
	};
	
	function clear() {
        $("#exchangeBtn").hide();
        $("#exchangeBtn").removeClass("btn_disable");
        $("#allprice").hide();
        $("#needDiv").hide();
        $("#allcheck").hide();
    }

	function showNoExchange(dataList) {
        if(dataList.length == 0) {
            var url = "game.html";
            var goto = "<a href=\"javascript:app.href('"+ url +"')\" style='text-decoration:underline;color:#f28b02;'>种植~</a>";
            app.emptyList("#" + usedTag, "<p>您还没有种植出可兑换的蔬菜</p><p>赶紧去" + goto +"</p>");
            $("#allprice").show();
            $("#exchangeBtn").addClass("btn_disable");
            $("#exchangeBtn").show();
        } else {
            var num = 0;
            $.each(dataList,function (index,item) {
                num += parseInt(item.eAmount || 0)
            });
            if(num > 0 && num < startNum){
                $("#exchangeBtn").addClass("btn-order")
                $("#exchangeBtn").text("下单即赠");
                $("#needNum").text(startNum-num);
                $("#needDiv").show();
            } else {
                $("#allcheck").show();
            }

            $("#allprice").show();
            $("#exchangeBtn").show();
        }
    }

    //空列表处理方法
    app.emptyList = function(id, msg) {
        msg = msg ? msg : "这里什么都没有哦~"
        $(id).html("<div style='height:2rem;'></div><div class='null'></div><div class='aui-text-center app_text_gray' style='width: 60%;margin:auto'>" + msg + "</div>");
    };
    
    function showHasExchange(dataList) {
        if(dataList.length == 0) {
            var url = "game.html";
            var goto = "<a href=\"javascript:app.href('"+ url +"')\" style='text-decoration:underline;color:#f28b02;'>种植</a>";
            app.emptyList("#" + usedTag, "<p>您还没有兑换蔬菜，</p><p>赶紧去" + goto +"吧</p>");
		}
    }

	function drawList(dataList) {
		console.log(page.pageIndex);
        clear();
		if(page.pageIndex == 1) {
			noCheckObj = {};
			$("#" + usedTag).empty();
			var tagId = $("#tab .aui-active").attr("id");
			if(tagId == 'no-exchange'){
				showNoExchange(dataList);
			} else {
				showHasExchange(dataList);
			}
            if(dataList.length == 0) {
                return;
			}
		}

		var basketList = '';
		dataList.forEach(function(item, i) {
			item.picpath = app.getImgPath(item.picpath);
			item.checked = false;
			noCheckObj[item.id + ''] = item;
			if(usedTag == 'list-noExchange') {
				basketList += noExchange(item);
			} else {
				basketList += hasExchange(item);
			}
		});

		$("#" + usedTag).append(basketList);
	}

	/**
	 * 兑换总量
	 */
	function myBasketSum(exchangeFlag) {
		var action = "weixin/mall/bottle/myBasketSum.do";
		app.POSTRequest(action, {
			data: {
				flag: exchangeFlag //1未兑换的菜 2已兑换的菜
			},
			loading: "请求中...",
			success: function(data) {
				if(data.resultCode === "1") {
					if(exchangeFlag == '1') {
						$("#no-exchange-num").html(data.resultObj || 0);
					} else {
						$("#has-exchange-num").html(data.resultObj || 0);
					}
				} else if(data.resultCode === "-1") {
					app.toLoginPage(location.href);
				} else {
					//app.tipInfo(data.resultMsg);
				}
			}
		});
	};

	/**
	 * 可兑换的种子列表
	 */
	function getMyBasketList(me) {
		me = me || app.pageRefresher;
		if(locked) return;
		locked = true;
		var action = "weixin/mall/bottle/myBasket.do";
		app.POSTRequest(action, {
			data: {
				beginPage: page.pageIndex,
				pageSize: page.pageSize,
				flag: exchangeFlag
			},
			loading: "请求中...",
			success: function(data) {
				me.resetload();
				if(data.resultCode === "1") {
					page.hasNextPage = data.basePageObj.hasNextPage;
					var dataList = data.basePageObj.dataList || data.dataList || [];
					page.addData(dataList); //往page添加数据

					//eAmount 可兑换数量
					//uAmount 已兑换数量
					drawList(dataList);
					locked = false;
					if(app.isSelectAll()) {
						total = 0;
						for(var key in noCheckObj) {
							noCheckObj[key].checked = true;
							$("#" + key).addClass('active');
							total += noCheckObj[key].sellprice * noCheckObj[key].eAmount;
						}
						$("#total").html('￥' + total.toFixed(2));
					} else {
                        $("#total").html('￥0.00');
					}
					page.pageIndex++;
				} else if(data.resultCode === "-1") {
					app.toLoginPage(location.href);
				} else {
					app.tipInfo(data.resultMsg);
				}
			}
		});
	};
	/**
	 * 点击兑换
	 */
	app.clickexchange = function(e) {
		if($(e).hasClass("btn_disable")){
			return;
		}
		if($(e).hasClass("btn-order")){
			app.href("../html/OptionalList.html")
			return;
		}
		if(total < app.startFee) {
			new auiDialog().alert({
				title: "",
				msg: "还未达到起送斤数(" + (app.startFee / 1000) + "kg)哦，您可以选择随单配送",
				buttons: ["确定"]
			}, function() {});
			return;
		}
		var checks = $(".aui-list-item-media.head-checkbox .checkBtn.active");
		var selectedSku = [];
		checks.map(function(index) {
			var id_num = checks.eq(index).attr("data-sku");
			var ary = id_num.split(":");
			selectedSku.push({
				skuid: ary[0],
				num: ary[1]
			});
		});
		if(selectedSku.length < 1) {
			app.tipInfo("请选择要兑换的蔬菜");
			return;
		} else {
			//清空选择地址
			app.setLocalObjet("selectAddress", ''); //清空选择的地址
			app.setLocalObjet("selectProduts", selectedSku);
			//跳转到确认订单页
			app.href("../html/confirmOrder.html?type=9");
		}
	}

	return app;
});