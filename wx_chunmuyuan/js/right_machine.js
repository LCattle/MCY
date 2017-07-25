define(["./base/baseApp","./base/rights"], function(app,rights) {
    var userLevel = 1;
    app.init = function () {
        app.getUser(initUser,function(){
        });
    };

    // 初始化用户
    function initUser(data) {
        if(!data){
            return;
        }
        userLevel = data.level;
        _init(userLevel);
    }

    //初始化
    function _init(userLevel) {
        if(userLevel < 6){
            return;
        } else {
            rights.queryRightLog(render);
            rights.queryMemberRightList(6,renderDetail);
        }
    }

    function render(rightLog) {
        console.log(rightLog);
        if(rightLog.surplusplanter > 0 ){
            $(".get_btn_row .get_btn").show();
            initEvent();
        }
    }

    function renderDetail(data){
        var temp = app.getTempBySelector("#detailItem");
        $("#details .detail-ul").empty();
        if(data.length > 0){
            $.each(data, function (i, item) {
                var tempData = $.extend({},item);
                if(!item.createtime){
                    tempData.createtime = "待确定";
                } else {
                    tempData.createtime = rights.dateFormat(item.createtime);
                }
                if(!item.goodsreceipttime){
                    tempData.goodsreceipttime = "待确定";
                } else {
                    tempData.goodsreceipttime = rights.dateFormat(item.goodsreceipttime);
                }
                $("#details .detail-ul").append(temp(tempData));
            });
            $("#details").show();
        }
    }

    function initEvent() {
        $(".get_btn_row .get_btn").on("click",function () {
            app.POSTRequest('/weixin/mall/memberrights/planter.do' , {
                data : {
                    loginedtoken:localStorage.loginedToken
                },
                success:function(data){
                    console.log(data);
                    if(data.resultCode=='1'){
                        $(".my_dialog").css("display","block");
                    }else{
                        app.tipInfo(data.resultMsg);
                    }
                }
            });
        });

        $(".my_dialog .get_btn").on("click",function () {
            app.replace("right_machine.html");
        });
    }

    return app;
});
