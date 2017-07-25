//用户中心
define(["base/baseApp", "../lib/aui/script/aui-slide", "base/baseCar"], function(app, slide, baseCar) {
	//初始化底部栏
	function initTab() {
		var tab = new auiTab({
			element: document.getElementById("footer"),
			index: 4
		}, function(ret) {
			if(ret.index == 1) {
				app.replace("../index.html");
			} else if(ret.index == 3) {
				app.replace("./shoppingCar.html");
			} else if(ret.index == 2) {
				app.replace("../liveVideo/index.html");
			} else {
				app.replace(location.href);
			}
		});
	}
	app.initPage = function() {
		var footerH = $("footer")[0].clientHeight;
		$(".userCenterContentBox").css({
			"bottom": (footerH) + "px",
			"overflow": "auto"
		})
	};
	//开始执行
	app.init = function() {
		initTab();
		loadUser();
		$("#zsgwbox").show();
		$("#zsgwbox").on("click", function() {
			app.href("../html/exclusiveConsultant.html?no=" + app.zsgwno);
		});
		baseCar.init(function() {
			if(baseCar.sum > 0) {
				var sum = baseCar.sum > 99 ? 99 : baseCar.sum;
				$("#carNum").show().text(sum);
			}
		});
		$("#quick1").click(function(){
			app.href("../html/quickPay.html?money=998");
		})
		$("#quick2").click(function(){
			app.href("../html/quickPay.html?money=1888");
		})
		$("#quick3").click(function(){
			app.href("../html/quickPay.html?money=3999");
		})
	};
	app.zsgwno = '';
	app.toUserInfo = function() {
		this.gotoPageCheck("userInfo.html");
	};
	/**
	 * 跳转页面前检查登录
	 * @param {Object} url
	 */
	app.gotoPageCheck = function(url) {
		if(this.checkLogin()) {
			app.href(url);
		} else {
			this.toLoginPage(location.href);
		}
	}

	function setNum(num, id) {
		if(num > 0) {
			num = num > 99 ? 99 : num;
			$("#"+id).show().text(num);
		}
	}

	function loadOrderNums() {
		app.POSTRequest("weixin/mall/order/showOrdersCount.do", {
			success: function(data) {
				if(data.resultCode == 1) {
					setNum(data.resultObj.noComment,"daipingjia");
					setNum(data.resultObj.noReceive,"daishouhuo");
					setNum(data.resultObj.noPay,"daifukuan");
				} else {

				}
			}
		})
	}
	function initUser(data) {
		if(data) {
			console.log(data);
            var mobile = data.mobile;
            var nickname = data.nickname;
            var cashMoney = data.cashMoney;
            var str1 = userLevel(parseInt(data.level));
            nickname = nickname ? nickname : mobile;
            $("#nickname").text(nickname);
            $(".information1 span").text(data.integral);
            $("#kobe").text('¥' + cashMoney);
            $(".vip_right").text(str1);
			loadOrderNums();
			if(data.consultantno) {
				getMyConsultant(data.consultantno);
			}
			if(data.avatar) {
				$("#hit").attr("src", app.getImgPath(data.avatar).replace("/image/", ""));
			} else {
                $("#hit").attr("src", "../imgs/xq-images/photo.png");
			}
			$(".Head").show();
		}
	}
    
    function userLevel(index){
        var str ="";
        switch (index)
        {
            case 1:
                str="普通用户";
                break;
            case 2:
                str="铜卡会员";
                break;
            case 3:
                str="银卡会员";
                break;
            case 4:
                str="金卡会员";
                break;
            case 5:
                str="白金卡会员";
                break;
            case 6:
                str="钻石卡会员";
            break;    
        }
        return str;
    }
    
	function loadUser() {
		app.getUser(initUser, function() {
			$("#nickname").text("未登录");
		});
	}
	//获取专属会员信息
	function getMyConsultant(no) {
		app.zsgwno = no;
		var action = "member/consultant/myConsultant.do";
		app.POSTRequest_m(action, {
			data: {
				consultantno: no
			},
			success: function(data) {
				if(data.resultCode == 1) {
					var zsgw = data.resultObj;
					if(zsgw) {

						try {
							$("#zsgwname").text(zsgw.name);
							if(zsgw.operLogo)
								$("#zsgwimg").attr("src", app.getImgPath(zsgw.operLogo));
							$("#zsgwbox").show();
							var mobile = zsgw.mobile;
							$("#zsgwmobile").text(mobile);
							$("#zsgwmobile").parent().click(function(event) {
								app.stopBubble(event);
								location.href = "tel://" + mobile;
							});
							$("#zsgwbox").removeClass("aui-list-item-arrow");
							$("#zsgwbox .aui-list-item-right").show();
						} catch(e) {}
					}
				} else {
					app.tipInfo(data.resultMsg);
				}
			}
		})
	}
	return app;
});