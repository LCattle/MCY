//确定支付
define(["base/baseApp", "./base/wxconfig"], function(app, wxconfig) {
	app.initPage = function() {};
	var wx = wxconfig.getWxObj();
	var isHaveOpenId = false;
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
		//if(app.UrlParams.payway == 10) { //
        if(/micromessenger/.test(navigator.userAgent.toLowerCase())) {
            wxAuthorization();
        }
		//}
		$("#payBtn").removeClass("btn_disable");
        if(app.UrlParams.payway==30){
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
		if(app.UrlParams.payway == 30){
			$("#payBtn").text("确认");
		}
		//执行扣款
		$("#payBtn").on("click", function() {
			if(app.UrlParams.payway==30){//货到付款
				app.replace("paysuccess.html" + location.search);
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
			10: "wx",
			40: "offline",
			30: "cod",
			50: "union"
		};
		//执行类型5的订单支付
		function pay() {
			app.POSTRequest("weixin/mall/order/moneyConfirmPayment.do", {
				data: {
					payway: paywayMap[app.UrlParams.payway], //用户选择的支付方式(wx-微信支付，union-银联支付，offline-线下转账，cod-货到付款)
					orderId: app.UrlParams.oid,
					openId:localStorage.wxMemberOpenid
				},
				success: function(data) {
					if(data.resultCode == 1) {
						if(app.UrlParams.payway == 10 && app.UrlParams.type == 9) {//微信
							wxPayone(data.resultObj);
						}else if(app.UrlParams.payway == 10){
							wxPay(data.resultObj);
						}else if(app.UrlParams.payway == 50){//银联
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
		//一元购调用微信支付
		function wxPayone(data) {
			console.log(data);
			wx.chooseWXPay({
				timestamp: data.timeStamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
				nonceStr: data.nonceStr, // 支付签名随机串，不长于 32 位
				package: data.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
				signType: data.signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
				paySign: data.paySign, // 支付签名
				success: function(res) {
					if(res.errMsg = "chooseWXPay:ok"){
						if(app.UrlParams.type == 5) { //如果是充值卡订单
							app.replace("rechargeSuccess.html" + location.search);
						}else{
							app.replace("purchaseSuccess.html" + location.search);
						}
					}
				}
			});
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
					var isCoupon = data.resultObj.isCoupon;
					if(data.resultCode === "1") {
						app.replace("paysuccess.html" + location.search + "&isCoupon=" + isCoupon);
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