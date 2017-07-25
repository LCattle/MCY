define(["base/baseApp"], function(app) {

    var dialog = new auiDialog();

    app.init = function() {

    };
    app.toRecharge = function(){
        if(!app.checkLogin()){
            app.toLoginPage("./memberRecharge.html",true);
        } else {
            app.href("../../memberRecharge.html")
        }
    };

    return app;
});