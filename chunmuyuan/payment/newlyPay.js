//确定支付
define(["base/baseApp"], function(app) {
	app.initPage = function() {};
	if(!isInAppEnviroment){
		app.href("../html/confirmpay.html?"+location.search);
		return;
	}
	var isHaveOpenId = true;
	var payway = 10;
	if(window.WebViewJavascriptBridge){//如果是在ios下显示applePay
		$("#applePay").show();
	}
	app.clickCk = function(e, pw) { //10/50
		$(".checkBtn.active").removeClass("active");
		$(e).find(".checkBtn").addClass("active");
		payway = pw;
		if(pw==10&&app.UrlParams.money>10000){
			$("#wxTip").show();
		}else{
			$("#wxTip").hide();
		}
	}
	//开始执行
	app.init = function() {
		$("#wx-pay").trigger("click");
		$("#payBtn").removeClass("btn_disable");
		var oid = app.UrlParams.oid;
		if(oid) {
			$("#orderId").text(app.UrlParams.ono);
			var num = app.UrlParams.money;
			$("#label").text("需支付金额");
			$("#number").html(app.getPriceStr(num));
		}
		if(app.UrlParams.type != 4 && app.UrlParams.type != 8 && app.UrlParams.type != 10 && app.UrlParams.type != 5) {
			app.getSysParam("CODLIMIT", function(data) {
				$.each(data, function(i, item) {
					if(item.innercode == "MYRIAD") {
						if(parseFloat( app.UrlParams.money) > parseFloat( item.paramvalue)) {
							$("#hdhk").show();
						}
					}
				});
			},"biz");
		}
		if(app.UrlParams.type == 10){
            app.getSysParam("CODLIMIT", function(data) {
            	console.log(data);
                $.each(data, function(i, item) {
                    if(item.innercode == "PLANT") {
                        if(parseFloat( app.UrlParams.money) > parseFloat( item.paramvalue)) {
                            $("#hdhk").show();
                        }
                    }
                });
            },"biz");
		}
		//执行扣款
		$("#payBtn").on("click", function() {
			if(!$(this).hasClass("btn_disable") && isHaveOpenId) {
					pay();
				}
		});
		var paywayMap = {
			10: "wx",
			40: "offline",
			30: "cod",
			50: "union",
		    80: "alipay",
		    90: "apple"
		};
		var payotherWay = {
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
		    app.POSTRequest("weixin/mall/order/modifyOrderPayWay.do",{
		    	data: {
		    		loginedtoken:localStorage.loginedToken,
		    		payway: paywayMap[payway], 
		    		orderId: app.UrlParams.oid
		    	},
		    	success: function(data){
		    		if(data.resultCode == 1){
                        if(payway == 30) { //货到付款
                            app.replace("../html/zzpaysuccess.html" + location.search);
                            return;
                        }
		    			app.POSTRequest("weixin/mall/order/moneyConfirmPayment.do", {
							data: {
								payway: payotherWay[payway], //用户选择的支付方式(wx-微信支付，union-银联支付，offline-线下转账，cod-货到付款)
								orderId: app.UrlParams.oid,
								openId:localStorage.wxMemberOpenid
							},
							success: function(data) {
								if(data.resultCode == 1) {
									if(payway == 10) {
										if(data.resultObj.hasOwnProperty("appid")) {
											wxPay(data.resultObj);
										} else {
											app.tipInfo(data.resultObj);
										}
									} else if(payway == 80) { //支付宝
										//支付宝采用表单提交的方式，会默认打开wap，如果本机有app会尝试唤醒app
			//							$("body").append(data.resultObj);
										aliPay(data.resultObj);
									} else if(payway == 50) { //银联
										if(data.resultObj) {
											unionPay(data.resultObj)
										} else {
											app.tipInfo("网络开小差，再试试~");
										}
									} else if(payway == 90) { //apple
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
		    		} else {
						app.tipInfo(data.resultMsg);
					}
		    	}
		    })

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