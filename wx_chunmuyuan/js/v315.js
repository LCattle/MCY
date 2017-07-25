define(["base/baseApp"], function(app){

    app.isnet = false;
    //开始执行
    app.init = function() {

        $(".get-btn").on("click",function () {
            if(app.isnet){
                return;
            }
            app.isnet = true;
            if(!app.checkLogin()){
                app.toLoginPage(location.href);
                return;
            }

            active();
        });

        $(".cancel-btn").on("click",function () {
            app.replace("../index.html");
        });

        $(".confirm_btn").on("click",function () {
            app.replace("../index.html");
        });

        $(".confirm").on("click",function () {
            app.replace("../index.html");
        });
    };

    var dialog = new auiDialog({});

    function active() {
        app.POSTRequest("weixin/mall/activity/activity.do", {
            data: {
                batchid:1915
            },
            success: function(data) {
                app.isnet = false;
                if(data && data.resultCode == 1) {
                    $(".my_dialog").show();
                } else {
                    var msg = "";
                    if(data.resultCode == -4){
                        msg = "您" +　data.resultMsg;
                    } else {
                        msg = data.resultMsg;
                    }
                    dialog.alert({
                        title:"提示",
                        msg: msg,
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

    return app;
});
