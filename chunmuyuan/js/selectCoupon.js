define(["base/baseApp"], function(app) {
    var coupons = {};
    var currCouponId = app.UrlParams.couponId;
    var flag = app.UrlParams.flag;
    var mobile = app.UrlParams.mobile;
    app.init = function () {
        var vegetable = app.UrlParams.vegetable;
    	if(vegetable){
    		loadVegetablecoupon();
    	}else{
    		loadCoupon();
    	}
    };
       
    function render(res) {
        if(res && res.length > 0){
            var temp = app.getTempBySelector("#couponTemplate");
            $.each(res,function (i,it) {
                it.starttime = it.starttime.split(" ")[0].replace(/-/g,".");
                it.endtime = it.endtime.split(" ")[0].replace(/-/g,".");
                $("#couponSection").append(temp(it));
                coupons[it.id] = it;
            });
            $("#couponSection .aui-list-item[data-id="+currCouponId+"] .checkBtn").addClass("active");
            app.setLocalObjet("use_coupon",coupons[currCouponId]);
        } else {
            var temp = app.getTempBySelector("#noDataTemplate");
            $("#couponSection").append(temp({}));
        }
    }

    function loadCoupon() {
        var couponParam = {};
        couponParam.skuids = app.UrlParams.skuids;
        couponParam.price = app.UrlParams.price;
        couponParam.couponType = 1;
        couponParam.couponStatus = 1;
       	if(flag=="true"){
        	app.POSTRequest("weixin/mall/orderdk/queryDKMemberCoupon.do", {
                data: {
                    mobile: mobile,
                    money:app.UrlParams.price
                },
                success: function(data) {
                	console.log(data)
                	if(data && data.resultCode === "1"){
                		render(data.resultObj.coupon);
                	}
                }
          });
        }else{
	        app.getCoupon(couponParam,render);
        }
    }
    
    function loadVegetablecoupon(){
    	var couponParam = {};
        couponParam.skuids = app.UrlParams.skuids;
        couponParam.price = app.UrlParams.price;
        app.getVegetable(couponParam,render);
    }
    app.selectOne = function (_self) {
        $("#couponSection .aui-list-item .checkBtn").removeClass("active");
        $(_self).find(".checkBtn").addClass("active");
        app.setLocalObjet("use_coupon",coupons[$(_self).data("id")]);
        var back = app.UrlParams.back;
        if(back == "true"){
            app.href(localStorage.BackUrl);
        }
    };

    return app;
});
