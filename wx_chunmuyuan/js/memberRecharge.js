//充值卡列表　//充值列表
define(["base/baseApp", "./base/basePage","./base/recharge"], function(app, page, recharge) {
    page.pageSize = 1000; //取出全部数据
    var type = 1; // type 1、选择充值  2、自定义充值
    app.price = 0;
    var activityMap = {};
    var recharge_price = localStorage.recharge_price;
    if(!recharge_price){
        recharge_price = '1_998';
    }

    localStorage.recharge_price = "";
    //定义选择支付页面的路径
    //app环境下走payment下的
    var selectPayPage = isInAppEnviroment()?"../payment/selectPay.html":"../html/selectPay.html";
    app.initPage = function() {
        app.cardWidth = $("#list").width() / 2 - 4;
        app.cardHeight = app.cardWidth / 340 * 220;
    };

    // 初始化信息
    function init(){
        showHeadDiv();
        recharge.showBuygifts(function (rechargepamount,addamount) {
            $("#productList div[data-price="+rechargepamount+"]").find("#buy").show();
            activityMap[rechargepamount] = addamount;
        });
        showFooterBar();
        showContent();
    }

    function showHeadDiv(){
        personalUser();
        $("#iphone").text(app.userInfo.mobile);
        $("#virtualmoney").text(app.userInfo.cashMoney);
        app.userOrdermoney = app.userInfo.deposit ? app.userInfo.deposit : 0;
        if(app.userOrdermoney != 0) {
            $("#depositBox").show();
            $("#deposit").text(app.userInfo.deposit); //设置定金券
        } else {
            $("#deposit").text(app.userInfo.deposit); //设置定金券
        }
        $(".head_div").show();
    }

    function showFooterBar() {
        var decideBack = function () {
            if(app.UrlParams.staffNo){
                $("#zskfbox").val(app.UrlParams.staffNo);
            }
            $(".footer_bar").show();
            var recharge_price_arr = recharge_price.split("_");
            if(recharge_price_arr[0] == 1){
                $("#productList div[data-price="+recharge_price_arr[1]+"]").trigger("click");
                $("#amount").val(recharge_price_arr[1]);
//              $("#exchangement").css('display','block');
            } else if(recharge_price_arr[0] == 2){
                $("#amount").val(recharge_price_arr[1]);
                $("#amount").trigger("click");
                $("#amount").trigger("keyup");
            } else {
                $("#productList div[data-price=998]").trigger("click");
            }
        }
        decideInput(decideBack);
    }

    function showContent() {
        $(".content").css("top",$(".head_div").height());
        $(".content").css("bottom",$(".footer_bar").height());
        $(".content").show();
    }

    /**
     * 检查优惠
     */
    function checkMoney() {
        if(app.price<998){
            $("#price").text("");
            $(".tishi").css('display','block');
//          $("#exchangement").css('display','none');
            $("#buyGifts").hide();
            $(".chong.active").removeClass("active");
            $(".checkButton.active").removeClass("active");
            $("#couponLi").hide();
            return;
        }

//      $("#exchangement").css('display','block');
        $(".tishi").css('display','none');
		levels(app.userInfo)
        // 联动
        selectCard($("#productList div[data-price="+app.price+"]")[0]);
        $("#amount").val(app.price);
		
        if(activityMap[app.price]){
            $("#buySong").text(activityMap[app.price].toFixed(2));
            $("#buyGifts").show();
        } else {
            $("#buyGifts").hide();
        }
        showCoupon();
        recharge.countPounds(app.price,function (data) {
//          $("#exchangement").css('diaplay','block');
            var exchange=  $("#exchange").text(Number(data).toFixed(2)+"kg");
        });

        var price = app.price - app.userOrdermoney;
        if($("#couponLi").css("display") == 'block'
            && ($("#couponLi .checkBtn").hasClass("active")
            || $("#buyGifts").css("display") == 'none')
            && app.coupon && app.coupon.value){
            price -= app.coupon.value;
        }
        if(price < 0) {
            price = 0;
        }
        $("#price").text(price.toFixed(2)); //绑定付款金额
    }

    //判断单选框是否出现
    function decideChecket(){
        if(activityMap[app.price]){
            $(".checkBtn").show();
        }else{
            $(".checkBtn").hide();
        }
    }

    //开始执行
    app.init = function() {
        if(!app.checkLogin()){
            app.toLoginPage(location.href,false);
            return;
        }
        app.getUser(function (data){
            console.log(data);
            app.userInfo=data;
            init();
        },function(){
            app.tipInfo("获取用户信息失败");
        });

        $("#amount").blur(function(){
            $(this).removeClass("active");
        });
        var tid = null;
        $("#buyGifts").on('click',function(){
            $("#couponLi").find(".checkBtn").removeClass("active");
            $("#buyGifts").find(".checkBtn").addClass("active");
            var price = (app.price - app.userOrdermoney)?(app.price - app.userOrdermoney):0;
            $("#price").text(price.toFixed(2));
        });
        $("#amount").on("keyup",function () {
            $("#amount").val($("#amount").val().replace(/\D/g,""));
            app.price = $("#amount").val();
            $("#nextBtn").addClass("btn_disable");
            if(tid){
                clearTimeout(tid);
            }
            tid = setTimeout(function () {
                var price=$("#amount").val().trim();
                app.price = price;
                levels(app.userInfo)
                checkMoney();
            },400);
        });

        setInterval(function () {
            $(".content").css("top",$(".head_div").height());
            $(".content").css("bottom",$(".footer_bar").height());
        }, 50)


        $("#productList div[data-price]").on("click",function () {
            clickMoney(this);
        });
    };
	
	function levels(el){
		var exper= parseInt(el.experience);
		var experPrice = exper+parseInt(app.price);
		if(app.price < 998){
			$("#level").html("");
		}else if( app.price >= (188-exper) && experPrice <= 1887){
			$("#level").html("升级铜卡会员，尊享蔬果9折优惠");
		}else if(app.price >= (1888-exper) && experPrice <= 3998){
			$("#level").html("升级银卡会员，尊享蔬果88折优惠");
		}else if(app.price >= (3999-exper) && experPrice <= 7665){
			$("#level").html("升级金卡会员，尊享蔬果86折优惠");
		}else if(app.price >= (7666-exper) && experPrice <= 14887){
			$("#level").html("升白金卡会员，尊享蔬果83折优惠");
		}else if(app.price >= (14888-exper) && el.level != 6 ){
			$("#level").html("升级钻石卡会员，尊享蔬果8折优惠");
		}else if(el.level == 6){
			$("#level").html("钻石卡会员尊享蔬果8折优惠");
		}
	}
	
	
	
    /**
     * 选择充值卡片
     * @param e
     */
    function selectCard(e) {
        $(".checkButton.active").removeClass("active");
        $(e).find(".checkButton").addClass("active");
        $(".chong.active").removeClass("active");
        $(e).addClass("active");
    }

    //选择充值定额金额
    var clickMoney = function(e) {
        var price=$(e).find("span").text().replace(/[^0-9]/ig,"");
        app.price = price;
        type = 1;
        checkMoney();
    }

    //提示余额小于等于0的情况
    function showTipPrice() {
        var dialog = new auiDialog();
        dialog.alert({
            title: "温馨提示",
            msg: "订金券金额大于商品金额，不允许提交订单",
            buttons: ["确定"]
        }, function(ret) {
            if(ret.buttonIndex == 2) {
                location.href = selectPayPage+"?selectType=1&skuid=" + app.selectedSku + "&staffNo=" + $("#zskfbox").val().trim();
            }
        });
    }

    //选择充值自定义金额
    app.clickZMoney = function(e) {
        type = 2;
        app.coupon = null;
        $("#couponLi").hide();
        $("#exchange").text("");
        $(".checkButton.active").removeClass("active");
        $(e).find(".checkButton").addClass("active");
        $(".chong.active").removeClass("active");
        $(e).addClass("active");
        $("#amount").trigger("keyup");
    }

    //判断输入框是否显示
    function decideInput(decideBack){
        app.POSTRequest("/weixin/mall/order/queryMemberRecommender.do", {
            data: {
                loginedToken: localStorage.loginedToken,
            },
            success: function(data) {
                decideBack();
                if(data.resultObj == 'y'){
                    $('#concealInput').hide();
                }else{
                    $('#concealInput').show().parent().show().css("background-color","white");
                }
            },
            error: function () {
                decideBack();
            }
        });
    }
    //判断用户是否为符合要求的用户
    function personalUser(){
        app.POSTRequest("weixin/mall/orderdk/authority.do", {
            data: {},
            success: function(data) {
                console.log(data);
                if(data.resultObj=="true"){
                    $(".repay").show();
                }else{
                    $(".repay").hide();
                }
            }
        });
    }

    /**
     * 显示优惠券
     */
    function showCoupon() {
        var param = {
            price:app.price,
            couponType:1,
            couponStatus:1
        };
        if(!app.price){
            $("#nextBtn").removeClass("btn_disable");
            app.coupon = null;
            $("#couponLi").hide();
            //$(".footer_bar").css("height","4.25rem");
            return;
        }
        app.getCoupon(param,function (res) {
            $("#nextBtn").removeClass("btn_disable");
            var couponValue = 0;
            if(res && res.length > 0){
                decideChecket();
                app.coupon = res[0];
                var useCoupon = app.getLocalObject("use_coupon");
                if(useCoupon){
                    app.coupon = useCoupon;
                    localStorage.use_coupon = "";
                }
                $("#couponLi").on("click",function () {
                    var price = app.price - app.userOrdermoney - couponValue;
                    if(price < 0) {
                        price = 0;
                    }
                    $("#price").text(price.toFixed(2)); //绑定付款金额
                    $("#couponLi").find(".checkBtn").addClass("active");
                    $("#buyGifts").find(".checkBtn").removeClass("active");
                    localStorage.recharge_price = type+"_"+app.price;
                    localStorage.BackUrl = location.href;
                });
                if(res && res.length > 1){
                    $("#couponLength").text(res.length);
//                  $("#couponLi").addClass("aui-list-item-arrow");
//                  $("#couponLi").on("click",function () {
//                  	$("#couponLi").find(".checkBtn").addClass("active");
//      	            $("#buyGifts").find(".checkBtn").removeClass("active");
//                      localStorage.recharge_price = type+"_"+app.price;
//                      localStorage.BackUrl = location.href;
//                      app.href("selectCoupon.html?price=" + app.price + "&couponId="+app.coupon.id + "&back=true");
//                  });
                    $("#couponMore").show();
                }
                if(app.coupon.value > 0){
                    couponValue = app.coupon.value
                    $("#coupon").text("¥" + app.coupon.value);
                    $("#couponLi").show();
                }
            } else {
                app.coupon = null;
                $("#couponLi").hide();
                $("#couponLi").find(".checkBtn").removeClass("active");
                //$("#buyGifts").find(".checkBtn").removeClass("active");
                $(".checkBtn").hide();
            }

        });
    }




    //用户定金券金额
    app.userOrdermoney = 0;
    app.coupon = 0;
    app.selectedSku = null;

    //点击下一步(自定义充值)
    app.clickNext = function() {
        if($("#nextBtn").hasClass("btn_disable")){
            return;
        }
        var staffNo = $("#zskfbox").val().trim();
        if(app.price&&app.price>=998) {
            if(app.price <= 0) {
                showTipPrice();
                return;
            }
            var couponId = "";//优惠券
//          if((app.coupon && app.coupon.id) && ($("#couponLi").find(".checkBtn").hasClass("active") || $("#buyGifts").css("display") == "none")){
//              couponId = app.coupon.id;
//          }
            var giveamount = "";//买赠斤数
//          if($("#buyGifts").find(".checkBtn").hasClass("active")){
//          	giveamount = $("#buySong").text().replace(/[^0-9]/ig,"");
//          }
            if($("#buyGifts").css("display") == "block" && $("#couponLi").css("display") == 'none'){
                var buySong = $("#buySong").text().trim();
                if(buySong){
                    giveamount = parseInt(buySong);
                    if(isNaN(giveamount)){
                        giveamount = "";
                    }
                }
            }else if($("#buyGifts").css("display") == "none" && $("#couponLi").css("display") == 'block' && app.coupon && app.coupon.id){
                couponId = app.coupon.id;
            }else if($("#buyGifts").css("display") == "block" && $("#buyGifts").find(".checkBtn").hasClass("active")){
                var buySong = $("#buySong").text().trim();
                if(buySong){
                    giveamount = parseInt(buySong);
                    if(isNaN(giveamount)){
                        giveamount = "";
                    }
                }
            }else if($("#couponLi").css("display") == 'block' && $("#couponLi").find(".checkBtn").hasClass("active")){
                couponId = app.coupon.id;
            }else if($("#buyGifts").css("display") == "none" && $("#couponLi").css("display") == 'none'){
                couponId = "";
                giveamount = "";
            }

            if(isNaN(giveamount)){
                giveamount = "";
            }

            if(app.checkLogin()) {
                if(staffNo == ""){
                    location.href = selectPayPage+"?selectType=1&staffNo=" + staffNo+"&money="+app.price+"&couponId="+couponId+"&giveamount="+giveamount;
                } else if(staffNo.length != 11){
                    app.tipInfo("手机号输入长度不正确，请重新输入");
                } else if($("#concealInput").css("display")=="none"){
                    location.href = selectPayPage+"?selectType=1&staffNo=" + staffNo+"&money="+app.price+"&couponId="+couponId+"&giveamount="+giveamount;
                } else if(staffNo == app.userInfo.mobile){
                    app.tipInfo("推荐人不能是会员自己，请重新输入");
                } else if(staffNo.length == 11 && staffNo != app.userInfo.mobile) { //校验 手机号码编号
                    app.POSTRequest("/weixin/mall/order/queryMemberMobile.do", {
                        data: {
                            mobile: staffNo
                        },
                        success: function(data) {
                            console.log(data);
                            if(data.resultObj == 'y'){
                                location.href = selectPayPage+"?selectType=1&staffNo=" + staffNo+"&money="+app.price+"&couponId="+couponId+"&giveamount="+giveamount;
                            }else{
                                app.tipInfo("推荐人手机号码不是会员");
                            }
                        }
                    });
                }

            } else {
                var staffNo = $("#zskfbox").val().trim();
                app.toLoginPage(location.href+"?staffNo="+staffNo);
            }

        } else {
            app.tipInfo("998起充值，请输入正确的整数金额");
        }
    }
    app.addList = function() {
        var temp = app.getTempBySelector("#cardTemplate");
        $.each(page.data, function(i, item) {
            $("#list").append(temp(item));
        })
    };
    return app;
});