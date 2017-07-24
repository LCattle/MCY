define(["base/baseApp"], function(app) {

    var dialog = new auiDialog();

    app.init = function() {

    };
    app.toRecharge = function(){
        if(!app.checkLogin()){
            app.toLoginPage(location.href,true);
        } else {
            bindCoupon();
        }
    };

    /**
     * 绑定优惠券
     * @param batchid
     */
    function bindCoupon() {
        app.POSTRequest("weixin/mall/activity/getCoupon.do",{
            data:{
                activity:"77ACTIVITY"
            },
            loading:"&nbsp;&nbsp;&nbsp;&nbsp;领取中。。。",
            success:function (data) {
                if(!data){
                    dialog.alert({
                        title:"提示",
                        msg:'接口异常',
                        buttons:['确定']
                    });
                    return;
                }
                if(data.resultCode == "1"){
                    $(".mydailog").show();
                } else {
                    dialog.alert({
                        title:"提示",
                        msg:data.resultMsg,
                        buttons:['确定']
                    });
                }
            }
        });
    }

    return app;
});