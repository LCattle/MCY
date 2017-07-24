//礼品卡激活
define(["base/baseApp", "base/wxconfig"], function(app, wx) {

	app.initPage = function() {
		document.querySelector('#pwdInput').addEventListener('click', function(event) {
			(this || delegate.obj).focus();
		}, false);
		document.querySelector('#pwdInput').click();
	};
	app.openScan = function() {
		if(isInAppEnviroment()){
			nativeOpenScan(function(res) {
				app.setCard(res);
			});
			return;
        }
		wx.getWxObj().scanQRCode({
			needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
			scanType: ["qrCode", "barCode"], // 可以指定扫二维码还是一维码，默认二者都有
			success: function(res) {
				var result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
				var result = result.split(",");
				app.setCard(result[result.length-1]);
			}
		});
	}
	app.setCard = function(result) {
		$("#cardInput").val(result);
		$("#pwdInput").focus()
	};
	//激活卡
	function activete(card, pwd,lt) {
		//网络校验卡号密码
		app.POSTRequest("weixin/mall/tastecard/verify.do", {
			data: {
				cardno: card,
				pwd: pwd,
				loginedtoken: lt
			},
			success: function(data) {
				if(data.resultCode == 1) {
					var tastecardid = data.resultObj.id;
					var skuid = data.resultObj.skuid;
					location.href = "../html/tiYan.html?tastecardid="+tastecardid+"&skuid="+skuid;
				} else {
					app.tipInfo(data.resultMsg);
				}
			}
		});
	}

	//点击提交
	app.submit = function() {
		var card = $("#cardInput").val().toString().trim();
		var pwd = $("#pwdInput").val().toString().trim();
		var lt = localStorage.loginedToken;
		
		if(card == "") {
			app.tipInfo("请输入卡号");
			return;
		}
		if(pwd == "") {
			app.tipInfo("请输入密码");
			return;
		}
		card = card.toUpperCase();
        pwd = pwd.toUpperCase();
		activete(card,pwd,lt);
	};
	//开始执行
	app.init = function() {
        if(!app.checkLogin()){
            app.toLoginPage(location.href);
            return;
        }
        if(!isInAppEnviroment()){
        		wx.getJS_SDK();
        }
	};
	return app;
});