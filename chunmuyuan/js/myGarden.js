//购物车
define(["base/baseApp", "./base/baseCar"], function(app, car) {

	var dialog = new auiDialog();
    
    app.init = function() {
    	
	};
	app.goGarden = function(){
		if(!app.checkLogin()){
            app.toLoginPage(location.href,true);
		} else {
            app.href("../game/game.html");
		}
	};


	return app;
});