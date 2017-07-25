//支付成功
define(["base/baseApp", "./base/order"], function(app, Order) {
    app.getStartFee();
	app.initPage = function() {};
	app.toOrder = function() {
		app.replace("../html/purchaseDetails.html?oid=" + app.UrlParams.oid);
	};
	//开始执行
	app.init = function() {
		loadOrder();
	};

	//加载订单
	function loadOrder() {
		var Token = app.getLocalObject("loginedToken");
		Order.getOrder(app.UrlParams.oid, function(order) {
			loadUser(order);
			if(order.type == 8){
                $("#infos_li").hide();
			}
			$("#logisticsbox .app-text-orange").html(app.getPriceStr(0));
			if((order.type == 1 || order.type == 2 || order.type == 3) && (order.message != "")){
				$("#remark").show();
				$(".kobe").text("备注： " + order.message);
			}
			if(order.type == 1 || order.type == 2 || order.type == 9) {
				$(".imgBox img").attr("src","../imgs/xq-images/zxc.png");
				$("#growUp").text("积分");
				$(".again").text("再去逛逛");
				if(app.UrlParams.reduce && (app.UrlParams.reduce != 0)){
					$("#freebox").show();
					$("#actualbox").show();
					$(".freedom").text(app.UrlParams.reduce + 'kg');
					$(".freeactual").text(((app.UrlParams.virtualfee - parseFloat(app.UrlParams.reduce))).toFixed(2) + 'kg');
				}else if(order.reducePound != 0){
					$("#freebox").show();
					$("#actualbox").show();
					$(".freedom").text(order.reducePound/1000 + 'kg');
					$(".freeactual").text(((order.virtualfee-order.reducePound)/1000).toFixed(2) + 'kg');
				}
				app.POSTRequest("weixin/mall/order/obtailValue.do", {
					data: {
						loginedtoken: Token,
						orderType:order.type
					},
					success: function(data) {
						if(data.resultCode == 1) {
							$("#integrate").text(parseInt(data.resultObj));
						} else {
							app.tipInfo(data.resultMsg);
						}
					}
		        });
				if(app.UrlParams.deliverymode==30){
                    if(app.UrlParams.modify == 1){
                        showAddress(order);
                        $("#paystatus").append("<h2 class='app-text-orange' style='display:inline'>订单修改成功!<span></h2>");
                        showVarval(order.modifyfee);
                        if(order.modifyfee>0){
                        	$(".disappear").show();
                        }
                    } else {
                        showAddress(order);
                        $("#paystatus").append("<h2 class='app-text-orange' style='display:inline'>您已支付成功!<span></h2>");
                        showVarval(order.virtualfee);
                        $(".disappear").show();
                    }
				}else{
                    if(app.UrlParams.modify == 1){
                        showAddress(order);
                        $("#paystatus").append("<h2 class='app-text-orange' style='display:inline'>订单修改成功!<span></h2>");
                        showVarval(order.modifyfee);
                        if(order.modifyfee>0){
                        	$(".disappear").show();
                        }
                    } else {
                        showAddress(order);
                        $("#paystatus").append("<h2 class='app-text-orange' style='display:inline'>您已支付成功!<span></h2>");
                        showVarval(order.virtualfee);
                        $(".disappear").show();
                    }
				}
			}
		});
	}

	//显示自选菜和宅配地址
	function showAddress(order) {
		var oaddModel = order.oaddModel;
		//var str = targetdeliverydate.split(" ");
		var infos = "收货人：" + oaddModel.consignee;
		infos += "<br>手机号码：" + oaddModel.mobile;
		infos += "<br>配送日期: " + order.dateWeek;
		infos += "<br>地区：" + oaddModel.provincename + " " + oaddModel.cityname + " " + oaddModel.countyname;
		infos += "<br>详细地址：" + oaddModel.detailaddress;
		$("#infos").html(infos);
	}
    //显示买卡的地址
    function showcardAddress(order) { 
		var oaddModel = order.oaddModel;
		var targetdeliverydate = order.targetdeliverydate;
		var str = targetdeliverydate.split(" ");
		var infos = "收货人：" + oaddModel.consignee;
		infos += "<br>手机号码：" + oaddModel.mobile;
		infos += "<br>地区：" + oaddModel.provincename + " " + oaddModel.cityname + " " + oaddModel.countyname;
		infos += "<br>详细地址：" + oaddModel.detailaddress;
		$("#infos").html(infos);
	}
	//显示扣减的虚拟斤数
	function showVarval(num) {
		$("#priceLable").text("商品斤数：");
		$("#number").text(app.getKg(num));
	}
	//显示余额，小于3就提示
	function showBalance(varval) {
		if(varval < app.startFee) {
			$("#balanceTip").show();
		} else {
			$("#balanceTip").hide();
		}
		$("#varval").text(app.getKg(varval));
	}
	//加载用户信息
	function loadUser(order) {
		app.getUser(function(user) {
			if(order.type == app.ORDER_TYPE_OPTION ||
				order.type == app.ORDER_TYPE_PACKAGE) {
				var varval = user.virtualmoney;
				showBalance(varval);
			} else if(order.type == app.ORDER_TYPE_ELECTRONIC_CARD) {
				var infos = "收货人：春沐源会员" 
				infos += "<br>收信手机号：" + user.mobile;
				$("#infos").html(infos);
			} else if(order.type == 8){
                $("#orderPhoneText").text(user.mobile);
			}

		});
	}
	return app;
});