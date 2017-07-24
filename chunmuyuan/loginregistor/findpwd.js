//登录
define(["base/baseApp", "./base/validate"], function(app, validate) {
	//定义变量
	app.actionType = "checkCode"; //默认操作类型：验证手机号
	app.phone = null;
	app.code = null;
	//变量定义结束

	//切换到确认密码页
	app.changePage = function() {
		$("#loginBox1").hide();
		$("#loginBox2").show();
		$("#submitBtn").text("保 存");
		app.actionType = "setpwd"; //操作类型：设置密码
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
			this.getCodeFromNet(phone, '');
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
				type: 3 //忘记密码
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
	 * 登录
	 * @param {Object} phone
	 */
	app.Login = function(phone, code) {};
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
	app.clickNext = function() {

		if(app.actionType == "checkCode") {
			//验证验证码
			app.checkCode();
		} else {
			//重置密码
			app.resetPwd();
		}
	};
	app.resetPwd = function() {
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
		changePwdFromNet(app.phone, app.code, pwd1);
	};
	/**
	 * @param {Object} phone 电话号
	 * @param {Object} code 短信验证码
	 * @param {Object} pwd 密码
	 */
	function changePwdFromNet(phone, code, pwd) {
		app.POSTRequest_m("/member/usersinfo/changePwd.do", {
			data: {
				mobile: phone,
				code: code,
				password: pwd
			},
			loading: "保存中...",
			success: function(data) {
				if(data.resultCode == 1) {
					new auiDialog().alert({
						title:"",
						msg:"密码修改成功",
						buttons:["确定"]
					},function(ret){
						if(ret.buttonIndex==1){
							app.replace("../loginregistor/login.html");
						}
					});
				} else {
					app.tipInfo(data.resultMsg);
				}
			}
		});
	}

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