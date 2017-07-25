define(["base/baseApp"], function(app){
    //开始执行
    app.init = function() {

    };

    var dialog = new auiDialog({});

    function yxActivityCheck(callback) {
        var lt = localStorage.loginedToken;
        var flag = false;
        app.POSTRequest("weixin/mall/activity/activity.do", {
            data: {
                loginedtoken: lt
            },
            success: function(data) {
                if(data && data.resultCode == 1) {
                    callback();
                } else {
                    dialog.alert({
                        title:"提示",
                        msg: data.resultMsg,
                        buttons:['确定']
                    },function(ret){
                        if(ret){
                            app.replace("../index.html");
                        }
                    });
                }
            }
        });
    }


    app.getSysParam("ACTIVITY",function (result) {
        $.each(result,function (index,obj) {
            if(obj.innercode == "SKUID"){
                $(".get-btn").on("click",function () {

                    if(!app.checkLogin()){
                        app.toLoginPage(location.href);
                        return;
                    }
                    var callback = function () {
                        app.replace("yxActivityOrder.html?skuid=" + obj.paramvalue);
                        return false;
                    };

                    yxActivityCheck(callback);
                });
            }
        });
    },"biz");



    $(".cancel-btn").on("click",function () {
        app.replace("../index.html");
    });

    return app;
});
