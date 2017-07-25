//购物车
define(["base/baseApp", "./base/baseCar"], function(app, car) {
	app.getCookbookone();
    app.init = function() {
    	app.arr1 = app.cookbook.split(",")[0];
    	app.arr2 = app.cookbook.split(",")[1];
	};
	app.toRecharge = function(){
		if(!app.checkLogin()){
            app.toLoginPage("../goods/goodsDetails.html?pid=s" + app.arr1,true);
		} else {
            app.href("../../../goods/goodsDetails.html?pid=s" + app.arr1);
		}
	};
	app.toReplace = function(){
		if(!app.checkLogin()){
			app.toLoginPage("../goods/goodsDetails.html?pid=s" + app.arr2,true);
		}else{
			app.href("../../../goods/goodsDetails.html?pid=s" + app.arr2);
		}
	}
	return app;
});