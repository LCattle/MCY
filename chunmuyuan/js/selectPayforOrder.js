//选择支付方式-充值卡
define(["base/baseApp", "../lib/aui/script/aui-slide"], function(app, slide) {
	app.initPage = function() {};
	//开始执行
	app.init = function() {
		if(app.UrlParams.type != 4 && app.UrlParams.type != 8 && app.UrlParams.type != 10) {
			app.getSysParam("CODLIMIT", function(data) {
				$.each(data, function(i, item) {
					if(item.innercode == "MYRIAD") {
						if(parseFloat( app.UrlParams.money) > parseFloat( item.paramvalue)) {
							$("#hdhk").show();
						}
					}
				});
			},"biz");
		}
        if(app.UrlParams.type == 10){
            app.getSysParam("CODLIMIT", function(data) {
                $.each(data, function(i, item) {
                    if(item.innercode == "PLANT") {
                        if(parseFloat( app.UrlParams.money) > parseFloat( item.paramvalue)) {
                            $("#hdhk").show();
                        }
                    }
                });
            },"biz");
        }
		if(app.UrlParams.type == 3){
            app.getSysParam("OFFLINEPAY", function(data) {
                $.each(data, function(i, item) {
                    if(item.innercode == "PAYMENT") {
                        if(parseFloat(app.UrlParams.money) >= parseFloat( item.paramvalue)) {
                            $("#offlinePay").show();
                        }
                    }
                });
            },"biz");
		}
		if(app.UrlParams.money>10000){
			$("#wxTip").show();
		}
		if(localStorage.selectedPayway) {
			$("#check" + localStorage.selectedPayway).addClass("active");
		}
	};
	var payway = null;
	app.clickCk = function(e, pw) {
		$(".checkBtn.active").removeClass("active");
		$(e).find(".checkBtn").addClass("active");
		payway = pw;
		localStorage.selectedPayway = payway;
		setTimeout(function() {
			//history.back();
			location.href = localStorage.BackUrl;
		}, 10)
	}

	return app;
});