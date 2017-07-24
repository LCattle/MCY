//购物车
define(["base/baseApp", "./base/baseCar"], function(app, car) {

	var dialog = new auiDialog();
    
    app.init = function() {
    	
	};
	app.toRecharge = function(){
		if(!app.checkLogin()){
            app.toLoginPage("./yiyuangou.html",true);
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
                activity:"520ACTIVITY"
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
                    dialog.alert({
                        title:"提示",
                        msg:'领取成功！',
                        buttons:['前往充值']
                    },function(ret){
                        if(ret.buttonIndex == 1){
                        	app.href("./memberRecharge.html");
                        }
                    });
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