//确定支付
define(["base/baseApp", "./base/wxconfig"], function(app, wxconfig) {
	app.initPage = function() {};
	var wx = wxconfig.getWxObj();
	var isHaveOpenId = false;
	var payway = 10;
	//开始执行
	app.init = function() {
		$("#wx-pay").trigger("click");
        if(/micromessenger/.test(navigator.userAgent.toLowerCase())) {
            wxAuthorization();
        }
		var oid = app.UrlParams.oid;
		if(oid) {
			$("#orderId").text(app.UrlParams.ono);
			var num = app.UrlParams.money;
			$("#label").text("需支付金额");
			$("#number").html(app.getPriceStr(num));
		}
		//执行扣款
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
		if(app.UrlParams.type == 3){
            app.getSysParam("OFFLINEPAY", function(data) {
                $.each(data, function(i, item) {
                    if(item.innercode == "PAYMENT") {
                        if(parseFloat(app.UrlParams.money) >= parseFloat( item.paramvalue)) {
                            $("#offlinePay").show();
                        }
                    }
                });
            },"biz");
		}
		$("#payBtn").on("click", function() {
			pay();
		});
		var paywayMap = {
			10: "wx",
			40: "offline",
			30: "cod",
			50: "union"
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
                        if(app.UrlParams.type == app.ORDER_TYPE_ENTITY_CARD && payway == '40') {
                            app.replace("../html/offlinePay.html?oid=" + app.UrlParams.oid);
                            return;
                        }
		    			app.POSTRequest("weixin/mall/order/moneyConfirmPayment.do", {
							data: {
								payway: paywayMap[payway], //用户选择的支付方式(wx-微信支付，union-银联支付，offline-线下转账，cod-货到付款)
								orderId: app.UrlParams.oid,
								openId:localStorage.wxMemberOpenid
							},
							success: function(data) {
								if(data.resultCode == 1) {
									if(payway == 10){
										wxPay(data.resultObj);
									}else if(payway == 50){//银联
										$("body").append(data.resultObj);
									} else {
										if(app.UrlParams.type == app.ORDER_TYPE_RECHARGE_CARD){
											app.replace("rechargeSuccess.html" + location.search);
										}else if(app.UrlParams.type == 9){
											app.replace("purchaseSuccess.html" + location.search);
										}else if(app.UrlParams.type == 10){
											app.replace("planterList.html" + location.search);
										}else{
											app.replace("paysuccess.html" + location.search);
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
		//调用微信支付
		function wxPay(data) {
			console.log(data);
			wx.chooseWXPay({
				timestamp: data.timeStamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
				nonceStr: data.nonceStr, // 支付签名随机串，不长于 32 位
				package: data.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
				signType: data.signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
				paySign: data.paySign, // 支付签名
				success: function(res) {
					if(res.errMsg = "chooseWXPay:ok"){
						if(app.UrlParams.type == 5 && app.UrlParams.replay == 99){
							app.replace("replaceSuccess.html" + location.search);
						}else if(app.UrlParams.type == 5) { //如果是充值卡订单
							app.replace("rechargeSuccess.html" + location.search);
						}else{
							app.replace("paysuccess.html" + location.search);
						}
						
					}
				}
			});
		} 
	};
	
	//获取js-sdk授权签名
	function getJS_SDK() {
		app.POSTRequest_i("infrastructure/wx/mp/getJSSDKConfig.do", {
			data: {
				url: encodeURIComponent(location.href)
			},
			success: function(data) {
				if(data.resultCode == 1)
					wxconfig.JsSDKConfig(data.resultObj);
				}
		});
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
	//微信成功回调
	wx.ready(function() {
		console.log("授权成功");
	});
	//微信失败会掉
	wx.error(function(res) {});

	//微信授权
	function wxAuthorization() {
		getJS_SDK();
		if(localStorage.wxMemberOpenid && localStorage.wxMemberOpenid.length > 20) {
            isHaveOpenId = true;
            $("#payBtn").removeClass("btn_disable");
			return;
		}
		if(app.UrlParams.code) { //有code，授权成功
			//用code 向服务器请求openid
			app.POSTRequest_i("infrastructure/wx/mp/getOpenid.do", {
				data: {
					wx_code: app.UrlParams.code,
					loginedtoken: localStorage.loginedToken
				},
				loading:"加载中",
				success: function(data) {
					if(data.resultCode == 1) {
						localStorage.wxMemberOpenid = data.resultObj.openid;
                        isHaveOpenId = true;
                        $("#payBtn").removeClass("btn_disable");
					} else {
						app.tipInfo(data.resultMsg);
					}
				}
			})
		} else { //没code，跳转到授权页
			wxconfig.wxauthorization(location.href);
		}
	}
	return app;
});