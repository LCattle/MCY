define(['./base/baseApp', "./base/order"], function(app, Order) {
    if(!app.UrlParams.orderid) {
		app.gotoIndexPage();
	} else {
		Order.getOrder(app.UrlParams.orderid, function(order) {
			console.log(order);
			if(order.dk && order.order){//���ֵ
				var dkorder = order.order;
				app.replace("../html/replaceSuccess.html?virtualfee="+dkorder.sprices+"&growUp="+dkorder.sprices+"&giveamount="+dkorder.giveamount);
			} else {
				var money = order.sprices;
			var html = "rechargeSuccess";
			if(order.type == app.ORDER_TYPE_ELECTRONIC_CARD
				|| order.type == app.ORDER_TYPE_ENTITY_CARD
			    || order.type == 8 || order.type == app.ORDER_PLANTER_MACHINE){
				html = "paysuccess";
			}else if(order.type == 9){
				html = "purchaseSuccess";
			}
			app.replace("../html/"+html+".html?type=" +
				order.type + "&ono=" + order.orderno +
				"&money=" + money + "&oid=" + order.id + "&payway=" + order.payway+"&virtualfee="+order.virtualfee/1000+
			    "&giveamount="+(order.giveamount?order.giveamount:""));
			}
		})
	}
	return app;
});