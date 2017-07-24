//登录
define(["base/baseApp", "animate", "./base/validate", "./base/baseCar", "./base/baseCardCar"], function(app, animate, validate, car, baseCardCar) {
	//定义变量
	var user2ThirdLoginMsg = app.getLocalObject("user2ThirdLoginMsg");
	//变量定义结束

	//切换到验证码页
	app.changePage = function() {
		$(".panle").hide();
		$("#loginBox1").show();
	};

	app.init = function() {
		$("#header").attr("src", user2ThirdLoginMsg.headimgurl);
		$("#userName").text(user2ThirdLoginMsg.nickname);
	};

	/**
	 * 验证手机号
	 */
	app.validatePhone = function() {
		var phone = $.trim($("#phone").val());
		if(phone.length > 0) {
			if(validate.checkMobilePhone(phone)) {
				return phone;
			}
			app.tipInfo("请输入正确的手机号码");
		} else {
			app.tipInfo("请输入您的手机号码");
		}
	};
	app.validateCode = function() {
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

	function timeCount() {
		if(app.getCodeTime > 1) {
			var str = app.getCodeTime >= 10 ? app.getCodeTime : "0" + app.getCodeTime;
			$(".getCodeBtn").text("(" + str + ")重新获取");
			setTimeout(timeCount, 1000);
			app.getCodeTime--;
		} else {
			$(".getCodeBtn").text("重新获取");
			$(".getCodeBtn").removeClass("disable");
			app.getCodeTimeEnd = true;
		}
	};
	app.getCodeTimeEnd = true;
	app.getCodeTime = 0;

	/**
	 * 点击获取验证码
	 */
	app.getCode = function() {
		if(this.getCodeTimeEnd) {
			var phone = this.validatePhone();
			if(phone) {
				this.getCodeFromNet(phone, '');
			}
		}
	};

	/**
	 * 通过网络请求获取code
	 * @param {Object} phone
	 */
	app.getCodeFromNet = function(phone) {
		this.POSTRequest_m("member/usersinfo/sendMsgCode.do", {
			data: {
				mobile: phone,
				type: 1 //登录
			},
			success: function(data) {
				if(data.resultCode === "1") {
					app.getCodeTime = 60;
					getCodeTimeEnd = false;
					$(".getCodeBtn").addClass("disable");
					timeCount();
				} else {
					app.tipInfo(data.resultMsg);
				}
				console.log(data);
			},
			loading: "获取验证码..."
		});
	};
	/**
	 * 验证码
	 */
	app.checkCode = function() {
		var phone = this.validatePhone();
		if(!phone) {
			return;
		}
		var code = this.validateCode();
		if(!code) {
			return;
		}
		app.POSTRequest_m("member/usersinfo/checkMsgCode.do", {
			data: {
				mobile: phone,
				type: 3,
				code: code
			},
			success: function(data) {
				if(data.resultCode == 1) {
					//存储正确的电话号和验证码
					app.phone = phone;
					app.code = code;
					app.changePage();
				} else {
					app.tipInfo(data.resultMsg);
				}
			}
		})
	};
	//点击下一步
	app.clickLogin = function() {
		var phone = app.validatePhone();
		if(!phone) {
			return;
		}
		var code = app.validateCode();
		if(code) {
			app.POSTRequest_m("member/user2thirdLogin/user2ThirdBind.do", {
				data: {
					mobile: phone,
					code: code,
					openid: user2ThirdLoginMsg.thirdopenid,
					type: user2ThirdLoginMsg.thirdtype
				},
				loading: "登录中...",
				success: function(data) {
					if(data.resultCode === "1") {
						app.onLogined(data.resultObj);
					} else {
						app.tipInfo(data.resultMsg);
					}
				}
			});
		}
	};
		
	/**登陆后执行*/
	app.onLogined = function(data) {
		if(!data.hasOwnProperty("token")) {
			localStorage.loginedToken = data;
		} else {
			localStorage.loginedToken = data.token;
		}
		oldBack(data);
	};

	function oldBack(data) {
		function back() {
			if(app.UrlParams.back && localStorage.loginBackUrl) {
				app.replace(localStorage.loginBackUrl);
			} else {
				app.replace("../html/userCenter.html");
			}
		}
		if(!app.shouldSycCar) {
			back();
		} else {
			setTimeout(function() {
				sycCar(back);
			}, 10)
		}
	}

	/**
	 * 同步购物车
	 * @param {Object} callBack
	 */
	function sycCar(callBack) {
		var data = car.getLocal();
		var pids = "";
		var nums = "";
		$.each(data, function(i, item) {
			if(item) {
				pids += "," + item.skuid;
				nums += "," + item.skucount;
			}
		});
		pids = pids.replace(",", "");
		nums = nums.replace(",", "");
		//参数准备完成
		app.POSTRequest("weixin/mall/shoppingcart/merge.do", {
			data: {
				productIds: pids,
				numbers: nums,
				cartType: "basket"
			},
			success: function(data) {
				sycCardcar(callBack);
			},
			error: function() {
				sycCardcar(callBack);
			}
		});
	};
	//同步购物车
	function sycCardcar(callBack) {
		var data = baseCardCar.getLocal();
		var pids = "";
		var nums = "";
		$.each(data, function(i, item) {
			if(item) {
				pids += "," + item.skuid;
				nums += "," + item.skucount;
			}
		});
		pids = pids.replace(",", "");
		nums = nums.replace(",", "");
		//参数准备完成
		app.POSTRequest("weixin/mall/shoppingcart/merge.do", {
			data: {
				productIds: pids,
				numbers: nums,
				cartType: "cart"
			},
			success: function(data) {
				callBack();
			},
			error: function() {
				callBack();
			}
		});
	}	
		
	return app;
});