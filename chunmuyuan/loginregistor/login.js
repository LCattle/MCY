//登录
define(["base/baseApp", "animate", "./base/validate", "./base/baseCar", "./base/baseCardCar"], function(app, animate, validate, car, baseCardCar) {
	//定义变量
	app.car = car; //购物车
	app.lockOpen = false; //验证码锁
	app.selectedTab = 0; //选择的tab 0：手机密码登录 1：手机验证码登录
	app.isOnAnimation = false; //时候在执行动画中
	//变量定义结束

	//切换tab
	app.switchTab = function(index) {
		if(app.selectedTab != index && !app.isOnAnimation) {
			app.selectedTab = index;
			app.isOnAnimation = true;
			if(app.selectedTab == 0) {
				$("#loginBox1").show();
				$("#loginBox1").animateCss("fadeInLeft");
				$("#loginBox2").animateCss("fadeOutRight", function() {
					$("#loginBox2").hide();
					app.isOnAnimation = false;
				});

			} else {
				$("#loginBox2").show();
				$("#loginBox2").animateCss("fadeInRight");
				$("#loginBox1").animateCss("fadeOutLeft", function() {
					$("#loginBox1").hide();
					app.isOnAnimation = false;
				});
			}
			$(".tabItem.active").removeClass("active");
			$(".tabItem").eq(index).addClass("active");
		}
	};

	//切换到登录成功页
	app.changePage = function() {

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
	//验证图形验证码
	app.validateImgCode = function() {
		var code = $.trim($("#imgcode").val());
		if(code.length > 0) {
			if(/^\d{4}$/.test(code)) {
				return code;
			}
			app.tipInfo("请输入4位数字图形验证码")
		} else {
			app.tipInfo("请输入图形验证码")
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
			if(app.lockOpen && phone) {
				var code = this.validateImgCode();
				if(code) {
					this.getCodeFromNet(phone, code);
				}
			} else {
				if(phone) {
					this.getCodeFromNet(phone, '');
				}
			}
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
	app.initPage = function() {
		//初始化联合登录的位置
		var winH = $(window).height();
		var conetn1H = $("#contentBox1").height();
		var h = (winH - conetn1H - 80) / 2
		$("#unitbox").css({
			"display": "block",
			"margin-top": h + "px"
		});
		//初始化联合登录的位置end
	};
	//之前是登录的情况
	app.shouldSycCar = null;
	//开始执行
	app.init = function() {
		app.shouldSycCar = !app.checkLogin();
	};
	/**
	 * 通过网络请求获取code
	 * @param {Object} phone
	 */
	app.getCodeFromNet = function(phone, code) {
		this.POSTRequest_m("member/usersinfo/sendMsgCode.do", {
			data: {
				mobile: phone,
				type: 6 //快速登录
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
	 *验证码 登录
	 * @param {Object} phone
	 */
	app.Login = function(phone, code) {
		this.POSTRequest_m("member/login/login.do", {
			data: {
				mobile: phone,
				code: code
			},
			success: function(data) {
				if(data.resultCode === "1") {
					app.onLogined(data.resultObj);
				} else {
					app.tipInfo(data.resultMsg);
				}
			},
			loading: "登录中"
		});
	};
	/**
	 * 验证码登录
	 */
	app.vCodeLogin = function() {
		var phone = this.validatePhone();
		if(!phone) {
			return;
		}
		var code = this.validateCode();
		if(code) {
			this.Login(phone, code);
		}
	};
	/**
	 * 密码登录
	 */
	app.pwdLogin = function() {
		var userName = $("#userName").val().trim();
		if(userName.length > 0) {
			if(!validate.checkMobilePhone(userName)) {
				app.tipInfo("请输入正确的手机号码");
				return;
			}

		} else {
			app.tipInfo("请输入您的手机号码");
			return;
		}
		var pwd = $("#password").val().trim();
		if(pwd.length < 0) {
			app.tipInfo("请输入您的密码");
			return;
		}
		pwdLogin(userName, pwd);
	};
	//密码登录
	function pwdLogin(mobile, password) { //做登录动作
		app.POSTRequest_m("member/login/loginByMobileAndPwd.do", {
			data: {
				mobile: mobile,
				password: password
			},
			success: function(data) {
				if(data.resultCode == "1") {
					app.onLogined(data.resultObj);
				} else {
					app.tipInfo(data.resultMsg);
				}
			}
		})
	}
	//点击登录
	app.clickLogin = function() {
		if(app.selectedTab == 1) {
			app.vCodeLogin();
		} else {
			app.pwdLogin();
		}
	}

	//初始化密码显示与隐藏的点击事件
	$("#eye").click(function() {
		if($(this).hasClass("aui-icon-display")) {
			$("#password")[0].type = "password";
			$(this).removeClass("aui-icon-display")
				.removeClass("aui-iconfont")
				.addClass("iconfont").addClass("icon-pwd-hide");
		} else {
			$("#password")[0].type = "text";
			$(this).removeClass("iconfont")
				.removeClass("icon-pwd-hide")
				.addClass("aui-icon-display")
				.addClass("aui-iconfont");
		}
	});
	//选择的第三方登录类型
	app.user2ThirdLogin = "";
	/**
	 * 点击联合登录
	 * @param {Object} type
	 */
	app.jointLogin = function(type) {
		app.user2ThirdLogin = type
		window.nativeJointLogin(type, function(data) {
			var access_token = typeCode = openid = "";
			if(window.mobile) {//安卓需要将字符串转对象
				data = $.parseJSON(data);
			}
			if(app.user2ThirdLogin == "wx") {
				access_token = data.access_token;
				openid = data.openid;
				typeCode = 1;
			} else if(app.user2ThirdLogin == "qq") {
				access_token = data.access_token;
				openid = data.openid;
				typeCode = 0;
			} else {
				access_token = data.accessToken;
				openid = data.uid;
				typeCode = 2;
			}
			app.user2ThirdLoginFunc(access_token, typeCode, openid);
		});
	};

	app.user2ThirdLoginFunc = function(access_token, type, openid) {
		$("#phone").val("?access_token="+access_token+"&type="+type+"&openid="+openid);
		app.POSTRequest_m("member/user2thirdLogin/user2ThirdLogin.do", {
			data: {
				access_token: access_token,
				type: type,
				openid: openid
			},
			loading: "验证中...",
			success: function(data) {
				if(data.resultCode == 2) { //未绑定用户
					app.setLocalObjet("user2ThirdLoginMsg", data.result);
					app.href("user2ThirdLogin.html");
				} else if(data.resultCode == 3) { //已经绑定用户
					app.onLogined(data.resultObj);
				} else {
					app.tipInfo(data.resultMsg);
				}
			}
		})
	};
	return app;
});