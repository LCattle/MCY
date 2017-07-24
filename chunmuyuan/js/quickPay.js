//选择支付方式-充值卡 //充值金额
define(["base/baseApp", "./base/order","./base/recharge"], function(app, Order, recharge) {
	var price = 0;
	var originPrice=0;
	var giveamount = 0;
	app.initPage = function() {};
    if(window.WebViewJavascriptBridge){//如果是在ios下显示applePay
		$("#applePay").show();
	}
	//开始执行
	app.init = function() {
        if(!app.checkLogin()){
            app.toLoginPage(location.href,false);
            return;
        }
        originPrice = price = app.UrlParams.money;
        recharge.countPounds(originPrice,function (data) {
            $("#exchange").text(Number(data).toFixed(2)+"kg");
        });
		$("#wx-pay").trigger("click");
        queryActivity();
        queryCoupon();
        selectChoiceMax();
        showChoiceLi();
        showPrice();

		$(".choice-div.active").on("click",function () {
		    $(".choice-div.active .checkBtn").removeClass("active");
            var checkbtn = $(this).find(".checkBtn");
            // if(checkbtn.hasClass("active")){
             //    checkbtn.removeClass("active");
             //    showChoiceLi();
			// } else {
                checkbtn.addClass("active");
                showChoiceLi();
			//}
            showPrice();
        });
		
	};

	// 选择优先级 最高的优惠
	function selectChoiceMax(){
        if($(".choice-div.active").length > 0){
            var maxLevel = 0;
            $(".choice-div.active").each(function () {
                var divLevel = $(this).data("level");
                if(maxLevel < divLevel){
                    maxLevel = divLevel;
                }
            });
            $(".choice-div.active[data-level="+maxLevel+"]").find(".checkBtn").addClass("active");
        }
    }

    /**
	 * 显示优惠选择li
     */
	function showChoiceLi() {
        var maxlevel = 0;
        $(".choice-div.active .checkBtn.active").each(function(){
        	var divLevel = $(this).closest(".choice-div").data("level");
        	if(maxlevel < divLevel){
                maxlevel = divLevel;
			}
        });
        $(".choice-li").each(function(){
            var liLevel = $(this).data("level");
            if(maxlevel == liLevel){
                var liSelector = $(this).data("selector");
                if($("#"+liSelector+" .checkBtn").hasClass("active")){
                    $(this).addClass("active");
                } else {
                    $(this).removeClass("active");
				}
            } else {
                $(this).removeClass("active");
			}
        });
    }

    /**
	 * 查询活动
     */
	function queryActivity() {
        giveamount = recharge.getGiveAmount(originPrice);
        if(giveamount){
            $("#activity").text("¥" + Number(giveamount).toFixed(2));
            $("#activityLi").addClass("active");
            $("#activityDiv").addClass("active");
        }
    }

    /**
	 * 显示实付金额
     */
    function showPrice() {
        var couponValue = 0;
        if(app.coupon && app.coupon.value && $("#couponLi").hasClass("active")){
            couponValue = app.coupon.value;
		}
        price = originPrice - couponValue;
        if(price < 0) {
            price = 0;
        }
        $("#finapay").text("¥" + price.toFixed(2)); //绑定付款金额
        $("#finapayLi").show();
    }

    /**
	 * 查询优惠劵
     */
	function queryCoupon() {

        var param = {
            price:app.UrlParams.money,
            loginedToken : localStorage.loginedToken,
            couponType : 1,
            couponStatus : 1
        }
        //快速充值
        app.coupon = null;
        app.getCoupon(param,function (res) {
            console.log(res);
            var couponValue = 0;
            if(res && res.length > 0){
                app.coupon = res[0];
                var useCoupon = app.getLocalObject("use_coupon");
                if(useCoupon){
                    app.coupon = useCoupon;
                    localStorage.use_coupon = "";
                }
                // if(res && res.length > 1){
                // $("#couponLength").text(res.length);
                //     $("#couponLi").addClass("aui-list-item-arrow");
                //     $("#couponLi").on("click",function () {
                //         localStorage.BackUrl = location.href;
                //         app.href("selectCoupon.html?price=" + app.UrlParams.money + "&couponId="+app.coupon.id + "&back=true");
                //     });
                //     $("#couponMore").show();
                // }
                if(app.coupon.value > 0){
                    couponValue = app.coupon.value;
                    $("#coupon").text("¥" + app.coupon.value);
                    $("#couponDiv").addClass("active");
                }
            }else {
                app.coupon = null;
            }
        });
    }
	var payway = 10;
	app.clickCk = function(e, pw) { //10/50
		$("#paywayUl .checkBtn.active").removeClass("active");
		$(e).find(".checkBtn").addClass("active");
		payway = pw;
		if(pw==10&&app.UrlParams.money>10000){
			$("#wxTip").show();
		}else{
			$("#wxTip").hide();
		}
	}
    // 缓存中获取员工信息
    function getEmployeeno(){
        var currDate = new Date();
        var time = currDate.getTime();
        var currEmployee = app.getLocalObject("cmy_employee");
        if(!currEmployee){
            return "";
        }
        if(time > currEmployee.time){
            localStorage.removeItem("cmy_employee");
            return;
        }
        return currEmployee.employeeno;
    }

	app.next = function() {
		if(payway) {  //10/50
				var data = {
	                loginedtoken:localStorage.loginedToken,
	                money:app.UrlParams.money,
	                payway: Order.paywayMap[payway],
	                staffNo:app.UrlParams.staffNo?app.UrlParams.staffNo:''
	            };
            	if(app.coupon && app.coupon.value && $("#couponLi").hasClass("active")){
                    data.couponId = app.coupon.id;
				}

				if(giveamount && $("#activityLi").hasClass("active")){
                    data.giveamount = giveamount;
				}
	            // 准备员工工号
	            var employeeno = getEmployeeno();
	            if(employeeno){
	                data.employeeno = employeeno;
	            }
				Order.submitOrder(data, 5, function(order) {
	                console.log(data);
	                var oid = order.id;
					var ono = order.orderno;
					var money = order.actualpaied;
					var type = order.type;
					var virtualfee = order.virtualfee/1000;
					app.href("../payment/confirmpay.html?type=" +
						type + "&money=" + money + "&ono=" +
						ono + "&oid=" + oid + "&payway=" + payway+"&virtualfee="+virtualfee +
                        "&giveamount="+(data.giveamount?data.giveamount:"") + "&sprice=" + order.sprices);
				});
		} else {
			app.tipInfo("请选择支付方式");
		}
		
	}
	return app;
});