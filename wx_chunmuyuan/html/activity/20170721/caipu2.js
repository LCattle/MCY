//购物车
define(["base/baseApp", "./base/baseCar"], function(app, car) {
    app.getCookbooktwo();
    app.init = function() {
    	app.arr1 = Number(app.cookbooks);
	};
	app.toRecharge = function(){
		if(!app.checkLogin()){
            app.toLoginPage("../goods/goodsDetails.html?pid=s" + app.arr1,true);
		} else {
            app.href("../../../goods/goodsDetails.html?pid=s" + app.arr1);
		}
	};
	return app;
});