//购物车
define(["base/baseApp", "./base/baseCar"], function(app, car) {

	var dialog = new auiDialog();
    
    app.init = function() {
    	
	};
	app.toRecharge = function(){
		if(!app.checkLogin()){
            app.toLoginPage(location.href,true);
		} else {
            nativeAccount();
		}
	};
    app.goMission = function(){
    	if(!app.checkLogin()){
            app.toLoginPage(location.href,true);
		} else {
            app.href("../html/app_mission.html");
		}
    }

	return app;
});