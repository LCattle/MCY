//用户基本信息
define(["base/baseApp", "dialog", "picker", "clipImg","base/timeselect"], function(app, dialog, Picker,clipImg,timeselect) {
	app.initPage = function() {};

	var body_width = $('body').width();
	var body_height = $('body').height();

	var birthdayPicker = timeselect.create();

	$("#clipbox .clip").photoClip({
		width: body_width * 0.8125,
		height: body_width * 0.8125,
		file: "#file",
		ok: "#clipBtn",
		loadStart: function() {
			app.loading("图片加载中...");
		},
		loadComplete: function() {
			app.hideLoading();
			$("#clipbox").show();
		},
		loadError:function(){
			app.hideLoading();
		},
		clipFinish: function(dataURL) {//当图片剪切完成
			app.POSTRequest_m("member/baseInfo/modifyAvatar.do",{
				data:{
					file:dataURL.split(",")[1],
					biz:0//图片类型为用户头像
				},
				loading:"正在上传...",
				success:function(data){
					if(data.resultCode==1){
						$('#hit').attr('src', dataURL);
					}else{
						data.tipInfo(data.resultMsg);
					}
				}
			})
			$("#clipbox").hide();
		}
	});
	app.clickHead = function(){
		$("#file").click();
//		app.loading("loading...");
//		setTimeout(function(){
//			app.hideLoading();
//		},2000)
	};
	//开始执行
	app.init = function() {
		initUser(this.getLocalObject("userInfo"));
		loadUser();
	};
	app.clickNickname = function() {
		var dialog = new auiDialog();
		dialog.prompt({
			title: "修改昵称",
			text: '请输入昵称',
			buttons: ['取消', '确定']
		}, function(ret) {
			if(ret.buttonIndex == 2) {
				var name = ret.text.trim();
				if(name.length > 0) {
					if(name.length > 20){
						app.tipInfo("请输入你的昵称过长");
						return;
					}
					modifyNickname(name);
				}else{
					app.tipInfo("请输入你的昵称");
					return;
				}
			}
            dialog.close();
		},true);
	};
	var picker = new Picker({
		data: [
			[{
				text: "男",
				value: 1
			}, {
				text: "女",
				value: 0
			}]
		],
		selectedIndex: [0],
		title: '选择性别'
	});
	picker.on('picker.select', function(selectedVal, selectedIndex) {
		modifyGender(selectedVal[0]);
	});

    /**
	 * 保存生日
     */
    function saveBirthday(daytime) {
		app.POSTRequest_m("member/usersinfo/updateBrithday.do",{
			data:{
				birthday:daytime
			},
			success:function (result) {
				console.log(result);
				if(result.resultCode == '1'){
                    $("#birthday").closest(".aui-list-item-inner").removeClass("aui-list-item-arrow");
                    $("#birthday").text(daytime);
				} else {
					app.tipInfo(result.resultMsg);
				}
            }
        });
    }

	function modifyGender(gender) {
		app.POSTRequest_m("member/baseInfo/modifyGender.do", {
			loading: "处理中...",
			data: {
				"gender": gender
			},
			success: function(data) {
				if(data.resultCode == 1) {
					$("#gender").text(gender == 1 ? "男" : "女");
				} else {
					app.tipInfo(data.resultMsg);
				}
			}
		});
	}

	app.clickGender = function() {
		picker.show();
	};
	
	app.clickBirthday = function (e) {
		if($(e).find(".aui-list-item-arrow").hasClass("aui-list-item-arrow")){
            birthdayPicker.picker.show();
		}
    };

	function modifyNickname(name) {
		app.POSTRequest_m("member/baseInfo/modifyNickname.do", {
			loading: "处理中...",
			data: {
				nickname: name
			},
			success: function(data) {
				if(data.resultCode == 1) {
					$("#nickname").text(name);
				} else {
					app.tipInfo(data.resultMsg);
				}
			}
		});
	}

	function initUser(data) {
		if(data) {
			var mobile = data.mobile;
			$("#mobile").text(mobile);
			var gender = data.gender;
			if(gender == "0") {
				$("#gender").text("女");
			} else if(gender == "1") {
				$("#gender").text("男");
			}
			if(data.avatar){
				$("#hit").attr("src",app.getImgPath(data.avatar).replace("/image/",""));
			}
            $("#hit").show();
			$("#memberLv").text(data.levelName);
			$("#experience").text(data.integral ? data.integral : 0);
			$("#integral").text(data.experience ? data.experience : 0);
			$("#nickname").text(data.nickname ? data.nickname : "");
			if(data.birthday){
                $("#birthday").text(data.birthday);
			} else {
                $("#birthday").closest(".aui-list-item-inner").addClass("aui-list-item-arrow");
                $("#birthday").text("生日当月有惊喜哦");
                birthdayPicker.initPicker('选择生日',saveBirthday);
			}
		}
	}
	//退出登录
	app.logout = function() {
		var dialog = new auiDialog();
		dialog.alert({
			"title":"提示",
			"msg":"是否确定退出春沐源",
			buttons:["取消","确定"]
		},function(ret){
			if(ret.buttonIndex==2){
				logout();
			}
		});
		
	};
	function logout(){
		app.POSTRequest_m("member/login/loginOut.do", {
			complete: function(e) {
				//清空本地存储的对象
				// localStorage.loginTime = 0;
				// localStorage.loginedToken = '';
				// localStorage.selectAddress = '';
				// localStorage.userInfo = '';
				// localStorage.removeItem("shoppingCar");
                localStorage.clear();
				app.replace("../index.html");
//				history.back();
			}
		});
	}
	function loadUser() {
		app.getUser(initUser, function() {
			app.toLoginPage(location.href);
		});
	}
	return app;
});