//激活成功
define(["base/baseApp", "../lib/aui/script/aui-slide"], function(app,slide) {
	if(app.UrlParams.turnUrl){
		if(!app.checkLogin()){
			app.toLoginPage(app.UrlParams.turnUrl,true);
		}else{
			app.replace(app.UrlParams.turnUrl)
		}
	}else{
		app.gotoIndexPage();
	}
	return app;
});