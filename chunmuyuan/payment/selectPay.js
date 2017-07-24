//选择支付方式-充值卡
define(["base/baseApp","./base/order"], function(app,Order) {
	app.initPage = function() {};
	//选择的模式 默认是为订单选择
	var type = app.UrlParams.selectType; //
	if(window.WebViewJavascriptBridge){//如果是在ios下显示applePay
		$("#applePay").show();
	}
	//开始执行
	app.init = function() {
		if(type == 1) {
			$("#btn").show();
			//默认微信
			$("#check10").addClass("active");
			payway = 10;
		} else {
			if(localStorage.selectedPayway) {
				$("#check" + localStorage.selectedPayway).addClass("active");
			}
		}
		if(type != 1){
			if(app.UrlParams.type != 4 && app.UrlParams.type != 8 && app.UrlParams.type != 10) {
				app.getSysParam("CODLIMIT", function(data) {
					$.each(data, function(i, item) {
						if(item.innercode == "MYRIAD") {
							if(parseFloat(app.UrlParams.money) > parseFloat(item.paramvalue)) {
								$("#hdhk").show();
							}
						}
					});
				}, "biz");
			}
            if(app.UrlParams.type == 10){
                app.getSysParam("CODLIMIT", function(data) {
                    $.each(data, function(i, item) {
                        if(item.innercode == "PLANT") {
                            if(parseFloat( app.UrlParams.money) > parseFloat( item.paramvalue)) {
                                $("#hdhk").show();
                            }
                        }
                    });
                },"biz");
            }
		}
		if(app.UrlParams.money > 10000) {
			$("#wxTip").show();
		}
	};
	var payway = null;
	app.clickCk = function(e, pw) {
		$(".paycheckBtn.active").removeClass("active");
		$(e).find(".paycheckBtn").addClass("active");
		payway = pw;
		localStorage.selectedPayway = payway;
		//如果选择类型是充值
		if(type == 1) {
			if(pw == 10 && app.UrlParams.money > 10000) {
				$("#wxTip").show();
			} else {
				$("#wxTip").hide();
			}
		} else {
			setTimeout(function() {
				app.onNativeBack(); //返回上一页
			}, 10)
		}

	}
	// 缓存中获取员工信息
	function getEmployeeno() {
		var currDate = new Date();
		var time = currDate.getTime();
		var currEmployee = app.getLocalObject("cmy_employee");
		if(!currEmployee) {
			return "";
		}
		if(time > currEmployee.time) {
			localStorage.removeItem("cmy_employee");
			return;
		}
		return currEmployee.employeeno;
	}

	app.next = function() {
		if(payway) { //10/50
			if(app.UrlParams.replay == 99) {
				var data = {
					loginedtoken: localStorage.loginedToken,
					money: app.UrlParams.money,
					couponId: app.UrlParams.couponId,
					payway: Order.paywayMap[payway],
					mobile: app.UrlParams.mobile,
					staffNo: app.UrlParams.staffNo ? app.UrlParams.staffNo : '',
	                giveamount:app.UrlParams.giveamount
				};
				// 准备员工工号
				var employeeno = getEmployeeno();
				console.log(employeeno)
				if(employeeno) {
					data.employeeno = employeeno;
				}

				Order.submitOrder(data, 99, function(order) {
					console.log(data);
					var oid = order.id;
					var ono = order.orderno;
					var money = order.actualpaied;
					var type = order.type;
					var virtualfee = order.virtualfee / 1000;
					var replay = app.UrlParams.replay;
					var growUp = order.sprices;
					var giveamount = order.giveamount?order.giveamount:0;
					app.replace("../payment/confirmpay.html?type=" +
						type + "&money=" + money + "&ono=" +
						ono + "&oid=" + oid + "&payway=" + payway + "&growUp=" + growUp + "&virtualfee=" + virtualfee + "&replay=" + replay + "&giveamount="+giveamount);
				});
			} else {
				var data = {
					loginedtoken: localStorage.loginedToken,
					money: app.UrlParams.money,
					couponId: app.UrlParams.couponId,
					payway: Order.paywayMap[payway],
					staffNo: app.UrlParams.staffNo ? app.UrlParams.staffNo : '',
	                giveamount:app.UrlParams.giveamount
				};
				// 准备员工工号
				var employeeno = getEmployeeno();
				if(employeeno) {
					data.employeeno = employeeno;
				}
				Order.submitOrder(data, 5, function(order) {
					console.log(data);
					var oid = order.id;
					var ono = order.orderno;
					var money = order.actualpaied;
					var type = order.type;
					var virtualfee = order.virtualfee / 1000;
					var giveamount = order.giveamount?order.giveamount:0;
					var sprice = order.sprices;
					app.replace("../payment/confirmpay.html?type=" +
						type + "&money=" + money + "&ono=" +
						ono + "&oid=" + oid + "&payway=" + payway + "&virtualfee=" + virtualfee + "&giveamount=" + giveamount + "&sprice=" + sprice);
				});
			}
		} else {
			app.tipInfo("请选择支付方式");
		}

	}
	return app;
});