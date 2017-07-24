//确定支付
define(["base/baseApp"], function(app) {
	app.initPage = function() {};
	if(!isInAppEnviroment){
		app.href("../html/confirmpay.html?"+location.search);
		return;
	}
	var isHaveOpenId = true;
    var temp = app.getTempBySelector("#payAccountLi");

    function showClosepay() {
        var flag = false;
        var num = app.UrlParams.money;
        app.getUser(function(currUser) {
            console.log(currUser);
            var name = "我的账户余额：￥" + currUser.cashMoney;
            var checkbtn = "";
            if(currUser.cashMoney * 1 >= num * 1) {
                checkbtn = '<div class="checkBtn" data-value="0"></div>';
            }
            $("#payAccoutUl").append(temp({
                name: name,
                checkbtn: checkbtn
            }));
            payQuery();
        });

        function payQuery() {
            app.POSTRequest_m("member/closepay/payQuery.do", {
                success: function(data) {
                    console.log(data);
                    if(data.resultCode == 1) {
                        if(!data.resultObj || data.resultObj.length == 0) {
                            return;
                        }
                        flag = true;
                        $.each(data.resultObj, function(index, item) {
                            var remain = item.remain
                            if(item.mastercashmoney * 1 < remain * 1) {
                                remain = item.mastercashmoney;
                            }
                            var name = "亲密付余额：￥" + remain;
                            var checkbtn = "";
                            if(remain * 1 >= num * 1) {
                                checkbtn = '<div class="checkBtn" data-value="' + item.id + '"></div>';
                            }
                            $("#payAccoutUl").append(temp({
                                name: name,
                                checkbtn: checkbtn
                            }));
                        });
                        if(flag) {
                            $("#payAccoutUl").show();
                        }
                        $($("#payAccoutUl .checkBtn")[0]).addClass("active");
                        selectPayAccount();
                    }
                }
            });
        }
    }

    function selectPayAccount() {
        $("#payAccoutUl").on("click", "li", function() {
            if($(this).find(".checkBtn").length == 0) {
                return;
            }
            $("#payAccoutUl").find(".checkBtn").removeClass("active");
            $(this).find(".checkBtn").addClass("active");
        });
    }

	//开始执行
	app.init = function() {
		$("#payBtn").removeClass("btn_disable");
		if(app.UrlParams.payway == 30) {
			$("#payBtn").removeClass("btn_disable");
		}
		var oid = app.UrlParams.oid;
		if(oid) {
			$("#orderId").text(app.UrlParams.ono);
			var num = app.UrlParams.money;
			if(app.UrlParams.type == 1 || app.UrlParams.type == 2) {
				$("#number").text('¥' + (num*1).toFixed(2));
				$("#label").text("需支付金额");
                showClosepay();
			} else {
				$("#label").text("需支付金额");
				$("#number").html(app.getPriceStr(num));
			}
		}
		if(app.UrlParams.payway == 30) {
			$("#payBtn").text("确认");
		}
		//执行扣款
		$("#payBtn").on("click", function() {
			if(app.UrlParams.payway == 30) { //货到付款
				app.replace("../html/zzpaysuccess.html" + location.search);
				return;
			}
			if(!$(this).hasClass("btn_disable") && isHaveOpenId) {
				if(app.UrlParams.type == 1 || app.UrlParams.type == 2) {
					pay1_2();
				} else {
					pay();
				}
			}
		});
		var paywayMap = {
			10: "wxapp",
			40: "offline",
			30: "cod",
			20: "balance",
			80: "alipay",
			90: "apple",
			50: "unionc"
		};
		//执行类型5的订单支付
		function pay() {
			app.POSTRequest("weixin/mall/order/moneyConfirmPayment.do", {
				data: {
					payway: paywayMap[app.UrlParams.payway], //用户选择的支付方式(wx-微信支付，union-银联支付，offline-线下转账，cod-货到付款)
					orderId: app.UrlParams.oid,
					openId: localStorage.wxMemberOpenid
				},
				loading: "正在准备支付...",
				success: function(data) {
					if(data.resultCode == 1) {
						if(app.UrlParams.payway == 10) {
							if(data.resultObj.hasOwnProperty("appid")) {
								wxPay(data.resultObj);
							} else {
								app.tipInfo(data.resultObj);
							}
						} else if(app.UrlParams.payway == 80) { //支付宝
							//支付宝采用表单提交的方式，会默认打开wap，如果本机有app会尝试唤醒app
//							$("body").append(data.resultObj);
							aliPay(data.resultObj);
						} else if(app.UrlParams.payway == 50) { //银联
							if(data.resultObj) {
								unionPay(data.resultObj)
							} else {
								app.tipInfo("网络开小差，再试试~");
							}

						} else if(app.UrlParams.payway == 90) { //apple
							if(data.resultObj) {
								applePay(data.resultObj)
							} else {
								app.tipInfo("网络开小差，再试试~");
							}

						} else {
							if(app.UrlParams.type == app.ORDER_TYPE_RECHARGE_CARD) {
								app.replace("../html/rechargeSuccess.html" + location.search);
							} else if(app.UrlParams.type == 9) {
								app.replace("../html/purchaseSuccess.html" + location.search);
							} else if(app.UrlParams.type == 10) {
								app.replace("../html/planterList.html" + location.search);
							} else {
								app.replace("../html/paysuccess.html" + location.search);
							}
						}
					} else {
						app.tipInfo(data.resultMsg);
					}
				}
			});
		};
		//微信支付
		function wxPay(data) {
			var param = {
				type: "wxPay",
				payInfo: data
			}
			window.nativeOpenPay(param, function(res) {
				app.onPayBack(res);
			});
		}
		//支付宝支付
		function aliPay(data) {
			var param = {
				type: "aliPay",
				payInfo: {tn:data}
			}
			window.nativeOpenPay(param, function(res) {
				app.onPayBack(res);
			});
		}
		app.onPayBack = function(res) {
			if(Object.prototype.toString.call(res) === "[object String]") {
				res = $.parseJSON(res);
			}
			var isAndroidSuc = res.hasOwnProperty("status") && res.status == "1";
			var isIos = res.hasOwnProperty("errCode") && res.errCode == "0"
			var isSuc = isAndroidSuc || isIos;
			if(isSuc) {
				if(app.UrlParams.type == 5 && app.UrlParams.replay == 99) {
					var urlParam = $.extend({},app.UrlParams);
					app.replace("../html/replaceSuccess.html?" + app.dataToSearchStr(urlParam));
					return;
				}else if(app.UrlParams.type == 5) {
					var urlParam = $.extend({},app.UrlParams);
					urlParam.money = urlParam.sprice;
					app.replace("../html/rechargeSuccess.html?" + app.dataToSearchStr(urlParam));
					return;
				}
				app.replace("../html/paysuccess.html" + location.search);
			} else {
				var msg = res.msg;
				if(!msg){
					msg = "支付失败";
				}
				app.tipInfo(msg);
			}
		}
		//类型12的支付
		function pay1_2() {
            var data = {
                orderId: app.UrlParams.oid
            };
            var selectBtn = $("#payAccoutUl").find(".checkBtn.active");
            if(selectBtn.length > 0 && selectBtn.data("value") > '0') {
                data.closepayid = selectBtn.data("value");
            }
			app.POSTRequest("weixin/mall/order/newEntityConfirmPayment.do", {
				data: data,
				loading: "正在处理...",
				success: function(data) {
					console.log(data);
					if(data.resultCode === "1") {
						app.replace("../html/paysuccess.html" + location.search);
					} else {
						app.tipInfo(data.resultMsg);
					}
				},
				error: function() {
					app.tipInfo(data.resultMsg);
				}
			});
		}
	};
	//交给原生处理苹果支付
	function applePay(data) {
		var payData = {
			type: "applePay",
			payInfo: {
				tn: data
			}
		};
		nativeOpenPay(payData, function(res) {
			app.onPayBack(res);
		})
	}

	//处理银联支付
	function unionPay(data) {
		var payData = {
			type: "unionPay",
			payInfo: {
				tn: data
			}
		};
		nativeOpenPay(payData, function(res) {
			app.onPayBack(res);
		})
	}

	return app;
});