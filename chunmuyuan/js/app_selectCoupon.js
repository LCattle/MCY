define(["base/baseApp"], function(app) {
	var coupons = {};
    app.isCallback = false;
    var currCouponId = app.UrlParams.couponId;
    app.status = 0;
    app.init = function () {
        $(".aui-bar-btn .aui-bar-btn-item").on("click",function () {
            $(".aui-bar-btn .aui-bar-btn-item").removeClass("active");
            $(this).addClass("active");
            app.status = $(this).index();
            if(app.status == 0){
            	loadCoupon1()
            }else if(app.status ==1){
            	loadCoupon2();
            }
        });
    };
    function loadCoupon1(){
    	$("#couponSection").empty();
//  	var skuids = "";
//      $.each(app.skus, function(i, item) {
//          skuids += "," + item.skuid ;
//      });
//      skuids = skuids.replace(",","");
//      var style = 1;
//      if(app.orderType == app.ORDER_TYPE_OPTION
//			|| app.orderType == app.ORDER_TYPE_PACKAGE) {
//			style = 2;	
//	    }
        var couponParam = {};
        couponParam.skuids = 4375;
        couponParam.price = 1888;
        couponParam.couponType = 1;
        couponParam.couponStatus = 1;
        app.getCoupon(couponParam,function (res) {
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
        })
        app.selectOne = function (_self) {
	        $("#couponSection .aui-list-item .checkBtn").removeClass("active");
	        $(_self).find(".checkBtn").addClass("active");
	        app.setLocalObjet("use_coupon",coupons[$(_self).data("id")]);
	        var back = app.UrlParams.back;
	        if(back == "true"){
	            app.href(localStorage.BackUrl);
	        }
        };
    }
    function loadCoupon2(){
    	$("#couponSection").empty();
	    	var skuids = "";
	        $.each(app.skus, function(i, item) {
	            skuids += "," + item.skuid ;
	        });
	        skuids = skuids.replace(",","");
	        var style = 1;
	        if(app.orderType == app.ORDER_TYPE_OPTION
				|| app.orderType == app.ORDER_TYPE_PACKAGE) {
				style = 2;	
		    }
	        var couponParam = {};
	        couponParam.skuids = skuids;
	        couponParam.price = app.UrlParams.price;
	        couponParam.couponType = style;
	        couponParam.couponStatus = 2;
	        app.getCoupon(couponParam,function (res) {
	        if(res && res.resultCode == "1"
                    && res.basePageObj && res.basePageObj.dataList
                    && res.basePageObj.dataList.length > 0){
                    var temp = app.getTempBySelector("#couponTemplate1");
                    $.each(res.basePageObj.dataList,function (i,it) {
                        it.starttime = it.starttime.split(" ")[0].replace(/-/g,".");
                        it.endtime = it.endtime.split(" ")[0].replace(/-/g,".");
                        $("#couponSection").append(temp(it));
                    });
            } else {
	            var temp = app.getTempBySelector("#noDataTemplate");
	            $("#couponSection").append(temp({}));
	        }
        })
    }
    return app;
});
