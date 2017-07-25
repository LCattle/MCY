define(["base/baseApp"], function(app) {
    app.initPage = function () {};
    app.status = 1;
    app.isCallback = false;
    app.init = function () {
        $(".aui-bar-btn .aui-bar-btn-item").on("click",function () {
            if(app.isCallback){
                return;
            }
            if($(this).hasClass("active")){
                return;
            }
            $(".aui-bar-btn .aui-bar-btn-item").removeClass("active");
            $(this).addClass("active");
            app.status = $(this).index() + 1;
            loadCoupon();
        });

        loadCoupon();
    };
    
    function loadCoupon() {
        app.isCallback = true;
        $("#couponSection").empty();
        app.POSTRequest_m("member/coupon/getCouponInfo.do",{
            data:{
                status:app.status,
                beginPage:1,
                pageSize:2147483647,
            },
            loading:"加载中...",
            success:function(res){
                app.isCallback = false;
                if(res && res.resultCode == "1"
                    && res.basePageObj && res.basePageObj.dataList
                    && res.basePageObj.dataList.length > 0){
                    var temp = app.getTempBySelector("#couponTemplate");
                    $.each(res.basePageObj.dataList,function (i,it) {
                        it.starttime = it.starttime.split(" ")[0].replace(/-/g,".");
                        it.endtime = it.endtime.split(" ")[0].replace(/-/g,".");
                        $("#couponSection").append(temp(it));
                    });
                } else {
                    var temp = app.getTempBySelector("#noDataTemplate");
                    $("#couponSection").append(temp({}));
                }
            }
        });
    }

    return app;
});
