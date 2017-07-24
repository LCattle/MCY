//充值成功
define(["base/baseApp", "./base/order"], function(app, Order) {

	app.initPage = function() {};
	
	/**
	 * 检查有没有送种子
	 */
	function checkSeed(no) {
		app.POSTRequest("weixin/mall/meseed/budgetOrderSeed.do", {
			data: {
				orderno: no
			},
			success: function(data) {
				if(data.resultCode == 1) {
					$("body").append("<div class='dlg_bg'></div>")
					$("#seedsBox").click(function() {
						$(".dlg_bg").remove();
						$("#seedsBox").css({
							"visibility": "hidden"
						});
					})
					$("#seedsBox .title,.seedList").click(function(e) {
						app.stopBubble(e);
					})
					$(".dlgClose").click(function(e) {
						app.stopBubble(e);
						$(".dlg_bg").remove();
						$("#seedsBox").css({
							"visibility": "hidden"
						});
					})
					$("#seedsBox").css({
						"visibility": "visible"
					});
				}
			}
		})

	}
	//开始执行
	app.init = function() {
	    var Token = app.getLocalObject("loginedToken");
		var Type = app.UrlParams.type;
		if(app.UrlParams.oid){
			checkSeed(app.UrlParams.ono);
			app.changeDOCTitle("充值成功");
			if(app.UrlParams.payway == 40){
				$(".orderInfo").show();
				return;
			}
			$("#tipType").text("您已充值成功!");
			app.POSTRequest("weixin/mall/order/obtailValue.do", {
				data: {
					loginedtoken: Token,
					orderType:Type 
				},
				success: function(data) {
					if(data.resultCode == 1) {
						$("#integrate").text(parseInt(data.resultObj));
					} else {
						app.tipInfo(data.resultMsg);
					}
				}
		});
		}else{
			app.changeDOCTitle("激活成功");
		}
        var couponfee = app.UrlParams.couponfee*1;
        var giveamount = app.UrlParams.giveamount*1;
        giveamount = giveamount?giveamount:0;
        couponfee = couponfee?couponfee:0;
		var money = app.UrlParams.money*1;
		$("#balance").html(app.getPriceStr(money + couponfee + giveamount));
		$("#integrate").text(parseInt(app.UrlParams.growUp));
		$(".activeInfo").show();
	};
	app.toOrder = function(){
		location.href = "../html/orderDetails.html?oid="+app.UrlParams.oid;
	}
	
	//加载用户信息
	function loadUser() {
		app.getUser(function(user){
			var varval = user.virtualmoney;
			$("#balance").text(app.getKg(varval));
		});
	}
	return app;
});