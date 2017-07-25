//购物车
define(["base/baseApp", "./base/baseCar"], function(app, car) {
    app.getCookbookthree();
    app.init = function() {
    	console.log(typeof(app.cookbookss));
    	app.arr1 = app.cookbookss.split(",")[2];
    	app.arr2 = app.cookbookss.split(",")[1];
    	app.arr3 = app.cookbookss.split(",")[0];
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
	app.toRemove = function(){
		if(!app.checkLogin()){
			app.toLoginPage("../goods/goodsDetails.html?pid=s" + app.arr3,true);
		}else{
			app.href("../../../goods/goodsDetails.html?pid=s" + app.arr3);
		}
	}
	return app;
});