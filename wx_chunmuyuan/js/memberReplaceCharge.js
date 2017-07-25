//充值卡列表　//充值列表
define(["base/baseApp", "./base/basePage", "./base/recharge"], function(app, page, recharge) {
	page.pageSize = 1000; //取出全部数据
    var type = 1; // type 1、选择充值  2、自定义充值
    var activityMap = {};
    var rechare_other_price = localStorage.rechare_other_price;
    localStorage.rechare_other_price = "";
     //定义选择支付页面的路径
    //app环境下走payment下的
    var selectPayPage = isInAppEnviroment()?"../payment/selectPay.html":"../html/selectPay.html";
	app.initPage = function() {
		app.cardWidth = $("#list").width() / 2 - 4;
		app.cardHeight = app.cardWidth / 340 * 220;
	};
	var phonedata;
	// 初始化信息
    function init(){
        //decideInput();
        
        $(".footer_bar").show();
        if(rechare_other_price){
        	var recharge_price_arr = rechare_other_price.split("_");
        	console.log(recharge_price_arr)
        	$(".telPhone").val(recharge_price_arr[2]);
//	        if(recharge_price_arr[0] == 1){
//	            $("#productList div[data-price="+recharge_price_arr[1]+"]").trigger("click");
//	            $("#amount").val(recharge_price_arr[1]);
////              $("#exchangement").css('display','block');
//	        } else if(recharge_price_arr[0] == 2){
//	            $("#amount").val(recharge_price_arr[1]);
//	            $("#amount").trigger("click");
//	            $("#amount").trigger("keyup");
//	        }else{
//	            $("#productList div[data-price=998]").trigger("click");
//	        }
        }
    }
	
    function showCoupon() {
        var param = {price:app.price};
        getOtherCoupon();
        if(!app.price){
            $("#nextBtn").removeClass("btn_disable");
            app.coupon = null;
            $("#couponLi").hide();
            return;
        }
    }

	function getOtherCoupon(){
		app.POSTRequest("weixin/mall/orderdk/queryDKMemberCoupon.do", {
                data: {
                    loginedtoken: localStorage.loginedToken,
                    mobile:$(".telPhone").val().trim(),
                    money:app.price,
                },
                success: function(data) {
                	console.log(data)
                	phonedata=data.resultObj.user;
                	console.log(phonedata);
                	if(app.price != "" && app.price>=998){
                    	levels(phonedata);
                    	console.log(phonedata)
                    }
	                //levels(phonedata);
                	if(data && data.resultCode === "1"){
                		var res=data.resultObj.coupon;
                	}
                    $("#nextBtn").removeClass("btn_disable");
		            var couponValue = 0;
		            if(res && res.length > 0){
		            	decideChecket();
		                app.coupon = res[0];
		                var useCoupon = app.getLocalObject("use_coupon");
//		                $("#couponLi").removeClass("aui-list-item-arrow");
		                if(useCoupon){
		                    app.coupon = useCoupon;
		                    localStorage.use_coupon = "";
		                }
		                $("#couponLi").on("click",function () {
		                	var price = app.price - couponValue;
					            if(price < 0) {
					                price = 0;
					            }
		                    $("#price").html(app.getPriceStr(price)); //绑定付款金额
		                	$("#couponLi").find(".checkBtn").addClass("active");
		    	            $("#buyGifts").find(".checkBtn").removeClass("active");
		                    localStorage.rechare_other_price = type+"_"+app.price;
		                    localStorage.BackUrl = location.href;
		                });
		                if(res && res.length > 1){
		                    $("#couponLength").text(res.length);
//		                    $("#couponLi").addClass("aui-list-item-arrow");
//		                    $("#couponLi").on("click",function () {
//		                    	localStorage.checkButton = 1;
//		                    	var mobile=$(".telPhone").val().trim();
//		                        localStorage.rechare_other_price = type+"_"+app.price + "_" + mobile;
//		                        localStorage.BackUrl = location.href;
//		                        localStorage.otherTel= $(".telPhone").val().trim();
//		                        app.href("selectCoupon.html?price=" + app.price +"&flag="+true+"&mobile="+mobile+"&couponId="+app.coupon.id + "&back=true");
//		                    });
		                    $("#couponMore").show();
		                }
		                if(app.coupon.value > 0){
		                    couponValue = app.coupon.value;
		                    $("#coupon").text("￥" + app.coupon.value);
		                    $("#couponLi").show();
		                    if($("#buyGifts").css("display") == 'none'){
		                    	var pric = Number(app.price) - Number(couponValue);
					            if(pric < 0) {
					                pric = 0;
					            }
		                        $("#price").html(app.getPriceStr(pric)); //绑定付款金额
		                    	//$("#price").text(app.price - couponValue);
		                    }
		                    if($("#buyGifts").css("display") == 'block'){
		                    	$("#price").html(app.getPriceStr(app.price));
		                    	$("#buyGifts").find(".checkBtn").addClass("active");
		                    }
		                }
		            } else {
		                app.coupon = null;
		                $("#couponLi").hide();
		                $(".checkBtn").hide();
		                $("#couponLi").find(".checkBtn").removeClass("active");
                        $("#buyGifts").find(".checkBtn").removeClass("active");
		                $(".footer_bar").css("height","2.2rem");
		                $("#price").html(app.getPriceStr(app.price));
		            }
		    }
		            });				
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

        $("#productList div[data-price]").unbind("click");
		$("#nextBtn").removeAttr("onclick").css("background","#cccccc");
		$("#depositBox").hide();
        $("#buyGifts").on('click',function(){
        	$("#couponLi").find(".checkBtn").removeClass("active");
        	$("#buyGifts").find(".checkBtn").addClass("active");
        	 $("#price").html(app.getPriceStr(app.price));
        })
		$(".telPhone").on("keyup",function () {
            $(".telPhone").val($(".telPhone").val().replace(/\D/g,""));
		})
		
		$(".code").on("keyup",function () {
            $(".code").val($(".code").val().replace(/\D/g,""));
		})
		
//		$(".telPhone").blur(function(){
//			checkData(this);
//			getTel();
//			$(".cz li").children().removeClass('active').find(".checkButton").removeClass('active');
//			$("#couponLi").hide();
//	        $("#price").html("");
//	        $(".footer_bar").css("height","2.2rem");
//	       
//		})
		
		
		
		
		
		
		
		
        $("#amount").blur(function(){
            $(this).removeClass("active");
        });

        var tid = null;

        $("#amount").on("keyup",function () {
            $("#amount").val($("#amount").val().replace(/\D/g,""));
            app.price = $("#amount").val();
            $("#nextBtn").addClass("btn_disable");
            if(tid){
                clearTimeout(tid);
               
            }
            tid = setTimeout(function () {
                var price=$("#amount").val().trim();
                console.log(price);
                $(".chong.active").removeClass("active");
                $(".checkButton.active").removeClass("active");
                if(price<998){
                    $("#price").text("");
                    $("#level").html("");
                    $(".tishi").css('display','block');
//                  $("#exchangement").css('display','none');
                    $("#buyGifts").hide();
                    $("#couponLi").hide();
                }else if(price>=998){
//                  $("#exchangement").css('display','block');
                    $(".tishi").css('display','none');
                    if(price == 998){
                        $(".chong.active").removeClass("active");
                        $(".checkButton.active").removeClass("active");
                        $("#productList div[data-price=998]").addClass("active");
                        $("#productList div[data-price=998]").find(".checkButton").addClass("active");
                        $("#productList div[data-price=998]").trigger("click");
                    }
                    if(price == 1888){
                    	$(".chong.active").removeClass("active");
                    	$(".checkButton.active").removeClass("active");
                    	$("#productList div[data-price=1888]").addClass("active");
                    	$("#productList div[data-price=1888]").find(".checkButton").addClass("active");
                    	$("#productList div[data-price=1888]").trigger("click");
                    }
                    if(price == 3999){
                    	$(".chong.active").removeClass("active");
                    	$(".checkButton.active").removeClass("active");
                    	$("#productList div[data-price=3999]").addClass("active");
                    	$("#productList div[data-price=3999]").find(".checkButton").addClass("active");
                    	$("#productList div[data-price=3999]").trigger("click");
                    }
                    if(price == 7666){
                    	$(".chong.active").removeClass("active");
                    	$(".checkButton.active").removeClass("active");
                    	$("#productList div[data-price=7666]").addClass("active");
                    	$("#productList div[data-price=7666]").find(".checkButton").addClass("active");
                    	$("#productList div[data-price=7666]").trigger("click");
                    }
                    if(price == 14888){
                    	$(".chong.active").removeClass("active");
                    	$(".checkButton.active").removeClass("active");
                    	$("#productList div[data-price=14888]").addClass("active");
                    	$("#productList div[data-price=14888]").find(".checkButton").addClass("active");
                    	$("#productList div[data-price=14888]").trigger("click");
                    }
                }else if(price != "" && price>=998){
                    	levels(phonedata);
                    	console.log(phonedata)
                    }
                app.price = price;
                
		        var couponKg = activityMap[app.price];
		        if(couponKg){
		            $("#buySong").text(couponKg.toFixed(2));
		            $("#buyGifts").show();
		        } else {
		            $("#buySong").text();
		            $("#buyGifts").hide();
		        }
		        
                //匹配兑换斤数
                app.countPounds();
                var price = price - app.userOrdermoney;
                if(app.coupon && app.coupon.value > 0){
                    price -= app.coupon.value;
                }
                if(price < 0) {
                    price = 0;
                }
                $("#price").html(app.getPriceStr(price)); //绑定实际付款金额
                if(app.price<998){
                    $("#price").text("");
//                  $("#exchangement").css('display','none');
                }
                showCoupon();
            },400);
        });
	};



		








	//手机号验证
	function checkData(obj){
        var phone = $(obj).val();
	    if(!(/^1(3|4|5|7|8)\d{9}$/.test(phone))){ 
	        app.tipInfo("您输入的手机号码有误");
            $("#productList div[data-price]").unbind("click");
	        $(".cz li").children().removeClass('active').find(".checkButton").removeClass('active');
	        $("#amount").attr("disabled","disabled");
	        $("#nextBtn").removeAttr("onclick").removeClass("app-bg-orange");
	        $("#couponLi").hide();
	        $("#price").html("");
	        return false;
	    } else{
	    	$("#amount").removeAttr("disabled");
            $("#productList div[data-price]").bind("click",function(){
                var couponKg = activityMap[$(this).data("price")];
                if(couponKg){
                    $("#buySong").text(couponKg.toFixed(2));
                    $("#buyGifts").show();
                } else {
                    $("#buySong").text();
                    $("#buyGifts").hide();
                }
                app.clickMoney(this);
            });
	    	$("#nextBtn").attr("onclick","app.clickNext()").addClass("app-bg-orange");
            recharge.showBuygifts(function (rechargepamount,addamount) {
                $("#productList div[data-price="+rechargepamount+"]").find("#buy").show();
                activityMap[rechargepamount] = addamount;
            });
	    }
	    	    
	    
    }

	

	//获取验证码
	app.getCode = function() {
		var phone=$.trim($(".telPhone").val())
		if(phone.length > 0){
			if(!(/^1(3|4|5|7|8)\d{9}$/.test(phone))){ 
		        app.tipInfo("您输入的手机号码有误");
	            $("#productList div[data-price]").unbind("click");
		        $(".cz li").children().removeClass('active').find(".checkButton").removeClass('active');
		        $("#amount").attr("disabled","disabled");
		        $("#nextBtn").removeAttr("onclick").removeClass("app-bg-orange");
		        $("#couponLi").hide();
		        $("#price").html("");
		        return false;
	    	}else{
		    	$("#amount").removeAttr("disabled");
	            $("#productList div[data-price]").bind("click",function(){
	                app.clickMoney(this);
	            });
		    	$("#nextBtn").attr("onclick","app.clickNext()").addClass("app-bg-orange");
	            recharge.showBuygifts(function (rechargepamount,addamount) {
	                $("#productList div[data-price="+rechargepamount+"]").find("#buy").show();
	                activityMap[rechargepamount] = addamount;
	            });
		    }
	    	
	    	getTel();
			$(".cz li").children().removeClass('active').find(".checkButton").removeClass('active');
			$("#couponLi").hide();
	        $("#price").html("");
	        $(".footer_bar").css("height","2.2rem");
	    	
	    	
		}else{
			app.tipInfo("请输入您的手机号码");
		}
		
		if(phone) {
			this.getCodeFromNet(phone);
		}
	};

	function levels(el){
			var exper= parseInt(el.experience);
			var experPrice = exper+parseInt(app.price);
			if(app.price < 998){
				$("#level").html("");
			}else if( app.price >= (188-exper) && experPrice <= 1887 ){
				$("#level").html("升级铜卡会员，尊享蔬果9折优惠");
			}else if(app.price >= (1888-exper) && experPrice <= 3998 ){
				$("#level").html("升级银卡会员，尊享蔬果88折优惠");
			}else if(app.price >= (3999-exper) && experPrice <= 7665 ){
				$("#level").html("升级金卡会员，尊享蔬果86折优惠");
			}else if(app.price >= (7666-exper) && experPrice <= 14887 ){
				$("#level").html("升白金卡会员，尊享蔬果83折优惠");
			}else if(app.price >= (14888-exper) && el.level != 6 ){
				$("#level").html("升级钻石卡会员，尊享蔬果8折优惠");
			}else if(el.level == 6){
				$("#level").html("钻石卡会员尊享蔬果8折优惠");
			}
		}
		
		
		
		function getTel(){
	        app.POSTRequest("/weixin/mall/orderdk/queryDKMemberCoupon.do",{
                data: {
                	loginedToken: localStorage.loginedToken,
                    mobile:$(".telPhone").val().trim(),
                    money:app.price
                },
                success: function(data){
                	if(data && data.resultCode === "1"){
                	   var otherUser=data.resultObj.deposit;
                	   app.userOrdermoney = otherUser ? otherUser : 0;
				        if(app.userOrdermoney != 0) {
				            $("#depositBox").slideDown(200, function() {
				
				            });
				            $("#deposit").text(otherUser); //设置定金券
				        } else {
				            $("#depositBox").hide(); //设置定金券
				        }

                	}
                	
    			}
	        })        
        }
		
		
		
		
		function validateCode() {
			var code = $.trim($("#code").val());
			if(code.length > 0) {
				if(/^\d{6}$/.test(code)) {
					return code;
				}
				app.tipInfo("请输入6位数字短信验证码")
			} else {
				app.tipInfo("请输入短信验证码")
			}
		};



	//发送短信
	app.getCodeFromNet = function(phone) {
		this.POSTRequest_i("infrastructure/msgcode/send/send.do", {
			data: {
				mobile: phone
			},
			success: function(data) {
				if(data.resultCode === "1") {
					app.getCodeTime = 60;
					getCodeTimeEnd = false;
					$(".getCodeBtn").addClass("disable").css("color","#999999");
					if(timer != null){
						clearTimeout(timer)
					}
					timeCount();
				} else {
					app.tipInfo(data.resultMsg);
				}
				console.log(data);
			},
			loading: "获取验证码..."
		});
	};
	
	
	
	
	
	
	
	app.getCodeTimeEnd = true;
	app.getCodeTime = 0;
	var timer = null;
	function timeCount() {
			if(app.getCodeTime > 1) {
				var str = app.getCodeTime >= 10 ? app.getCodeTime : "0" + app.getCodeTime;
				$(".getCodeBtn").text("(" + str + ")重新获取");
			timer =	setTimeout(timeCount, 1000);
				app.getCodeTime--;
			} else {
				$(".getCodeBtn").text("重新获取");
				$(".getCodeBtn").removeClass("disable").css("color","#333333");
				app.getCodeTimeEnd = true;
			}
		};
	

	
	









    
    function userLevel(index){
        var str ="";
        switch (index)
        {
            case 1:
                str="p";
                break;
            case 2:
                str="t";
                break;
            case 3:
                str="y";
                break;
            case 4:
                str="j";
                break;
            case 5:
                str="b";
                break;
            case 6:
                str="z";
            break;    
        }
        return str;
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
				location.href = "../html/selectPay.html?skuid=" + app.selectedSku;
			}
		});
	}
	app.price = 0;

    //选择充值定额金额
    app.clickMoney = function(e) {
    	
        if($("#nextBtn").hasClass("btn_disable")){
            return;
        }
        type = 1;
        $("#amount").val("");
        $("#nextBtn").addClass("btn_disable");
//      $("#exchangement").css('display','block');
        $(".tishi").css('display','none');
        $(".checkButton.active").removeClass("active");
        $(e).find(".checkButton").addClass("active");
        $(".chong.active").removeClass("active");
        $(e).addClass("active");
        var price=$(e).find("span").text().replace(/[^0-9]/ig,"");
         $("#amount").val(price);
        app.price = price;
        var couponKg = activityMap[app.price];
        if(couponKg){
            $("#buySong").text(couponKg.toFixed(2));
            $("#buyGifts").show();
        } else {
            $("#buySong").text();
            $("#buyGifts").hide();
        }
        app.countPounds();
        showCoupon();
    }
    //选择充值自定义金额
    app.clickZMoney = function(e) {
        type = 2;
        app.coupon = null;
        $("#nextBtn").addClass("btn_disable");
        $("#couponLi").hide();
        $(".footer_bar").css("height","2.2rem");
        $("#exchange").text("");
        $("#price").html(app.getPriceStr(($("#amount").val()*1)));
        //$("#amount").val("");
        $(".checkButton.active").removeClass("active");
        $(e).find(".checkButton").addClass("active");
        $(".chong.active").removeClass("active");
        $(e).addClass("active");
        $("#amount").trigger("keyup");
        
    }

    //自定义充值卡匹配兑换斤数
    app.countPounds= function(){
            app.POSTRequest("/weixin/mall/orderdk/countDKPounds.do", {
                data: {
                    loginedToken: localStorage.loginedToken,
                    money:app.price
                },
                success: function(data) {
                    console.log(data);
                    if(data.resultCode == 1) {
//                      $("#exchangement").css('diaplay','block');
                        var exchange=  $("#exchange").text(Number(data.resultObj).toFixed(2)+"kg");
                    }else if(data.resultCode == 0){
                        //app.tipInfo(data.resultMsg);
                    }
                }
            });
    }
//  //判断输入框是否显示
//      function decideInput(){
//  	    app.POSTRequest("/weixin/mall/order/queryMemberRecommender.do", {
//              data: {
//                  loginedToken: localStorage.loginedToken,
//              },
//              success: function(data) {
//              	console.log(data.resultObj);
//                  if(data.resultObj == 'y'){    
//                  	$('#concealInput').hide();
//                  }else{           
//                      $('#concealInput').show().parent().show().css("background-color","white");
//                  }
//              }
//          });				
//  }

    //用户定金券金额
	app.userOrdermoney = 0;
    app.coupon = 0;
    app.selectedSku = null;

    //点击下一步(自定义充值)
    app.clickNext = function() {
        if($("#nextBtn").hasClass("btn_disable")){
            return;
        }
    	
    	var telPhone=$(".telPhone").val().trim();
        if(app.price&&app.price>=998) {
            if(app.price <= 0) {
                showTipPrice();
                return;
            }
            var couponId = "";
            var giveamount = "";
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
            	var mobile=$(".telPhone").val().trim();
            	var code = validateCode();
				if(code) {
					codeVerification(mobile,code);
					
					//验证短信
					function codeVerification(phone,code) {
						app.POSTRequest_i("infrastructure/msgcode/send/verification.do", {
							data: {
								mobile: phone,
								code:code
							},
							success: function(data) {
								if(data.resultCode === "1") {
									localStorage.rechare_other_price = type+"_"+app.price + "_" + phone;
							        localStorage.BackUrl = location.href;
					                localStorage.otherTel= $(".telPhone").val().trim();
					                console.log(selectPayPage)
						            app.href(selectPayPage+"?selectType=1&money="+app.price+"&mobile="+phone+"&replay="+99+"&couponId="+couponId+"&giveamount="+giveamount);
								}else{
									app.tipInfo('验证码错误,请重新输入')
								}
								
							}
							
							
						});
					};
				}
            	
                
            } else {
            	app.toLoginPage(location.href);
            }
            
            
            
            

        } else {
            app.tipInfo("998起充值，请输入正确的整数金额");
        }
    };
    
    
    
    
    

    function getGiveamount(){
        var giveamount = $("#productList .checkButton.active").closest("div[data-coupon]").data("coupon");
        return giveamount;
    }

	app.addList = function() {
		var temp = app.getTempBySelector("#cardTemplate");
		$.each(page.data, function(i, item) {
			$("#list").append(temp(item));
		})
	};
	return app;
});