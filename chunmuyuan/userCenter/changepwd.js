//登录
define(["base/baseApp", "./base/validate"], function(app, validate) {
	//定义变量
	//变量定义结束
	
	if(!app.checkLogin()){
		app.toLoginPage(location.href);
	}

	//点击下一步
	app.clickNext = function() {
		//重置密码
		app.resetPwd();
	};
	function checkIsSome(){
		var oldpwd = $.trim( $("#oldpwd").val());
		if(oldpwd.length == 0) {
			return;
		}
		var pwd1 = $.trim( $("#pwd1").val());
		if(pwd1.length == 0) {
			return;
		}
		if(oldpwd == pwd1){
			app.tipInfo("原密码与新密码不能一致");
		}
	}
	 $("#oldpwd").bind("change",checkIsSome);
	 $("#pwd1").bind("change",checkIsSome);
	app.resetPwd = function() {
		var oldpwd = $.trim( $("#oldpwd").val());
		if(oldpwd.length == 0) {
			app.tipInfo("请输入原密码");
			return;
		}
		var pwd1 = $.trim( $("#pwd1").val());
		if(pwd1.length == 0) {
			app.tipInfo("请输入新密码");
			return;
		}
		if(pwd1.length < 6 || pwd1.length > 20) {
			app.tipInfo("请输入6-20位密码");
			return;
		}
		var pwd2 = $.trim( $("#pwd2").val());
		if(pwd2.length == 0) {
			app.tipInfo("请确认新密码");
			return;
		}
		if(pwd2 != pwd1) {
			app.tipInfo("两次输入的密码不一致");
			return;
		}
		if(oldpwd==pwd1){
			app.tipInfo("原密码与新密码不能一致");
			return;
		}
		changePwdFromNet(oldpwd,pwd1);
	};
	/**
	 * @param {Object} phone 电话号
	 * @param {Object} code 短信验证码
	 * @param {Object} pwd 密码
	 */
	function changePwdFromNet(oldpwd,pwd1) {
		app.POSTRequest_m("member/usersinfo/changePwd.do", {
			data: {
				oldpassword:oldpwd,
				newpassword:pwd1
			},
			loading: "保存中...",
			success: function(data) {
				if(data.resultCode == 1) {
					new auiDialog().alert({
						title:"",
						msg:"密码修改成功",
						buttons:["确定"]
					},function(ret){
						app.toLoginPage();
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