//登录
define(["base/baseApp", "animate", "./base/validate", "./base/baseCar", "./base/baseCardCar"], function(app, animate, validate, car, baseCardCar) {
	//定义变量
	//变量定义结束

	/**登陆后执行*/
	app.onLogined = function(data) {
		localStorage.loginedToken = data;
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

	//跳转到获取验证码
	app.toGetCode = function() {
		var phone = app.validatePhone();

		if(phone) {
			if(!$(".checkBtn").hasClass("active")) {
				app.tipInfo("请阅读并同意注册协议")
				return;
			}
			app.POSTRequest_m("member/usersinfo/registerFist.do", {
				data: {
					mobile: phone
				},
				loading: "验证手机号码",
				success: function(data) {
					if(data.resultCode == 1) {
						app.phone = phone;
						$(".panle").eq(0).hide();
						$(".panle").eq(1).show();
						startCount();
					} else {
						app.tipInfo(data.resultMsg);
					}
				}
			});
		}
	};
	/**
	 * 点击注册
	 */
	app.register = function() {
		var pwd1 = $.trim( $("#pwd1").val());
		if(pwd1.length == 0) {
			app.tipInfo("请输入密码");
			return;
		}
		if(pwd1.length < 6 || pwd1.length > 20) {
			app.tipInfo("请输入6-20位密码");
			return;
		}
		var pwd2 = $.trim( $("#pwd2").val());
		if(pwd2.length == 0) {
			app.tipInfo("请确认密码");
			return;
		}
		if(pwd2 != pwd1) {
			app.tipInfo("两次输入的密码不一致");
			return;
		}
		//执行注册最后一步
		app.POSTRequest_m("member/usersinfo/registerThird.do", {
			data: {
				mobile: app.phone,
				code: app.code,
				password: pwd1
			},
			success: function(data) {
				if(data.resultCode == 1) {
					app.onLogined(data.resultObj);
				} else {
					app.tipInfo(data.resultMsg);
				}
			}
		})
	};
	//	15599186573
	/**
	 * 跳转到设置密码
	 */
	app.toSetPwd = function() {
			var code = app.validateCode();
			if(!code) {
				return
			}
			app.POSTRequest_m("member/usersinfo/checkMsgCode.do", {
				data: {
					mobile: app.phone,
					type: 2,
					code: code
				},
				success: function(data) {
					if(data.resultCode == 1) {
						//验证码
						app.code = code;
						$(".panle").eq(1).hide();
						$(".panle").eq(2).show();
					} else {
						app.tipInfo(data.resultMsg);
					}
				}
			});
		}
		/**
		 * 点击同意协议
		 */
	app.checkPro = function() {
		$(".checkBtn").toggleClass("active");
	}

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
			this.getCodeFromNet(app.phone, '');
		}
	};

	//开始执行
	app.init = function() {};
	/**
	 * 开启倒计时
	 */
	function startCount() {
		app.getCodeTime = 60;
		getCodeTimeEnd = false;
		$(".getCodeBtn").addClass("disable");
		timeCount();
	}
	/**
	 * 通过网络请求获取code
	 * @param {Object} phone
	 */
	app.getCodeFromNet = function(phone, code) {
		this.POSTRequest_m("member/usersinfo/sendMsgCode.do", {
			data: {
				mobile: phone,
				type: 2 //注册
			},
			success: function(data) {
				if(data.resultCode === "1") {
					startCount();
				} else {
					app.tipInfo(data.resultMsg);
				}
				console.log(data);
			},
			loading: "获取验证码..."
		});
	};

	//初始化密码显示与隐藏的点击事件
	$(".eye").click(function() {
		if($(this).hasClass("aui-icon-display")) {
			$(this).parent().prev()[0].type = "password";
			$(this).removeClass("aui-icon-display")
				.removeClass("aui-iconfont")
				.addClass("iconfont").addClass("icon-pwd-hide");
		} else {
			$(this).parent().prev()[0].type = "text";
			$(this).removeClass("iconfont")
				.removeClass("icon-pwd-hide")
				.addClass("aui-icon-display")
				.addClass("aui-iconfont");
		}
	});

	return app;
});