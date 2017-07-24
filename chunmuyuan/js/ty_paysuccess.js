//支付成功
define(["base/baseApp", "./base/order"], function(app, Order) {

	app.initPage = function() {};
	app.toOrder = function() {
		location.href = "../html/orderDetails.html?oid=" + app.UrlParams.oid;
	};
	//开始执行
	app.init = function() {
		loadOrder();
	};

	//加载订单
	function loadOrder() {

		Order.getOrder(app.UrlParams.oid, function(order) {
			loadUser(order);
			$("#logisticsbox .app-text-orange").html(app.getPriceStr(0));
			if(order.type == 1 || order.type == 2) {
				showAddress(order);
				
				$("#paystatus").html("您已支付成功<br>待发货");
				showVarval(order.virtualfee);
			} else if(order.type == app.ORDER_TYPE_ENTITY_CARD ||
				order.type == app.ORDER_TYPE_ELECTRONIC_CARD) { //实体卡和电子卡
				
				$("#number").html(app.getPriceStr(order.sprices));
				$("#priceLable").text("商品金额：");
				var deposit = order.deposit;
				if(deposit && deposit > 0) { //有定金券，并且大于0
					$("#depositbox").show();
					$("#depositbox .app-text-orange").html("-" + app.getPriceStr(deposit));
				} else {
					deposit = 0;
				}
				$("#paystatus").css("border-bottom","none");
				if(order.payway == "30") { //货到付款显示提示
					$("#shsmbox").show();
					$("#paystatus").html("待发货");
				}else{
					$("#paystatus").html("您已支付成功<br>待发货");
				}
				
				if(order.type == app.ORDER_TYPE_ELECTRONIC_CARD) { //电子卡
					$("#dzktsbox").show();
					$("#paystatus").html("您的订单已经完成");
				} else { //实体卡显示地址
					showAddress(order);
				}
				$("#totalbox").show();
				$("#totalbox .app-text-orange").html(app.getPriceStr(order.actualpaied));
			}
		});
	}

	//显示地址
	function showAddress(order) {
		var oaddModel = order.oaddModel;
		var infos = "收货人：" + oaddModel.consignee;
		infos += "<br>手机号码：" + oaddModel.mobile;
		infos += "<br>地区：" + oaddModel.provincename + " " + oaddModel.cityname + " " + oaddModel.countyname;
		infos += "<br>详细地址：" + oaddModel.detailaddress;
		$("#infos").html(infos);
	}

	//显示扣减的虚拟斤数
	function showVarval(num) {
		$("#priceLable").text("支付斤数：");
		$("#number").text(app.getKg(num));
	}
	//显示余额，小于3就提示
	function showBalance(varval) {
		$("#varvalbox").show();
		if(varval < 3000) {
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
			}

		});
	}
	return app;
});