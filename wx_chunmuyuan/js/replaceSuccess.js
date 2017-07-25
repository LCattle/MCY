//充值成功
define(["base/baseApp", "./base/order"], function(app, Order) {

	app.initPage = function() {};
	//开始执行
	app.init = function() {
	    var Token = app.getLocalObject("loginedToken");
		var Type = app.UrlParams.type;
		localStorage.rechare_other_price = "";
		localStorage.rechare_other_price = "";
		$("#balance").text("¥" + (Number(app.UrlParams.virtualfee) + Number(app.UrlParams.giveamount)));
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