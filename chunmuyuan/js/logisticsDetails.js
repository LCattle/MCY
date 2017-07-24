//物流详情
define(["base/baseApp", "base/order"], function(app, Order) {
	app.initPage = function() {};

	//开始执行
	app.init = function() {
		Order.getOrder(app.UrlParams.oid, function(order) {
			//			承运来源：顺丰快递<br/>
			//								订单编号：1238560368530235<br/>
			//								官方电话：010-22222222<br/>

			if(order.type == app.ORDER_TYPE_OPTION ||
				order.type == app.ORDER_TYPE_PACKAGE ||
				order.type == app.ORDER_TYPE_ENTITY_CARD ||
				order.type == 9
			) {
				showLogist(order)
			}
			showLogs(order);
		});
	};

	function showLogs(order) {
		console.log(order);
		var tempfrist = app.getTempBySelector("#fristTemp")
		var temp = app.getTempBySelector("#temp")
			//		for(var i = 1; i <= order.logs.length; i++) {
			//			item = order.logs[order.logs.length - i];
			//			if(i == 1) {
			//				$("#logs").append(tempfrist(item));
			//			} else {
			//				$("#logs").append(temp(item));
			//			}
			//		}
		for(var i = 0; i < order.logs.length; i++) {
			item = order.logs[i];
			if(i == 0) {
				$("#logs").append(tempfrist(item));
			} else {
				$("#logs").append(temp(item));
			}
		}
	}

	function showLogist(order) {
		console.log(order);
		$("#logisticsbox").show();
		if(order.type != 9){
			if(order.deliverymode == 30 && (order.deliverystatus >= 1 && order.deliverystatus <= 7)){
				$("#LogisticsStatus").text("待自提");
			}else if(order.deliverymode == 30 && order.deliverystatus == 8){
				$("#LogisticsStatus").text("已自提");
			}else{
				$("#LogisticsStatus").text(Order.getLogistics(order.deliverystatus));
			}
		}else{
			var status = Order.getStatus(order);
			$("#LogisticsStatus").text(status.text);
		}
		if(order.deliverystatus != 1) {
			var deliverymode = order.deliverymode;
			var deliveryno = order.orderno;
			if(order.type == app.ORDER_TYPE_ENTITY_CARD) {
				deliveryno = order.deliveryno;
			}
			app.getSysParam("DELIVERYMODE", function(data) {
				console.log(data);
				var server2name = ""
				for(var i = 0; i < data.length; i++) {
					var item = data[i];
					if(item.paramvalue == deliverymode) {
						server2name = item.paramname;
						break;
					}
				}
				server2name = server2name ? server2name : "春沐源自建物流"
				if(order.deliverymode == 30){
					$("#logisticsInfo").append("");
				}else{
					$("#logisticsInfo").append("承运来源：" + server2name + "<br/>");
				}
				
				if(deliverymode) { //如果不是自建物流
					$("#logisticsInfo").append("订单编号：" + deliveryno + "<br/>");
				}
				app.getSysParam("DELIVERYPHONE", function(data) {
					var phone = ""
					for(var i = 0; i < data.length; i++) {
						var item = data[i];
						if(item.innercode == deliverymode) {
							phone = item.paramvalue;
							break;
						}
					}
					phone = phone ? phone : "4009008838";
					$("#logisticsInfo").append("客服电话：<span onclick='location.href=\"tel://" + phone + "\"'>" + phone + "</span><br/>")
				}, "biz");
			})

		}
	}
	return app;
});