//用户基本信息
define(["base/baseApp", "dialog", "picker"], function(app, dialog, Picker) {
	//最后请求时的参数
	var param = {
		gender:1,
		birthday:"1980-01-01"
	};
	app.param = param;
	//查询用户信息
	function queryUserInfo() {
		var action = "member/usersinfoext/personalView.do"
		app.POSTRequest_m(action, {
			success: function(data) {
				if(data.resultCode == 1) {
					var info = data.resultObj;
					if(info == null) { //没有填写过
						initClick(true);
						initPicker();
						sexPicker();
						familyPicker();
					} else { //填写过
						initClick(false);
						initInfo(info);
						familyPicker();
					}
				} else {
					app.tipInfo(data.resultMsg);
				}
			}
		});
	}
	/**
	 * 提交用户信息 
	 */
	function submitUserInfo(){
		var action = "member/usersinfoext/personalEdit.do"
		app.POSTRequest_m(action, {
			data:param,
			loading:"保存中...",
			success: function(data) {
				if(data.resultCode == 1) {
					app.success("保存成功");
					setTimeout(function(){
						if(app.UrlParams.back && localStorage.setUserinfoBackUrl){
							var setUserinfoBackUrl = localStorage.setUserinfoBackUrl;
                            localStorage.setUserinfoBackUrl = "";
                            app.href(setUserinfoBackUrl);
						} else {
                            app.replace(location.href);
						}
					},1000)
				} else {
					app.tipInfo(data.resultMsg);
				}
			}
		});
	};
	app.next = function(){
		if(!param.realname){
			app.tipInfo("请编辑姓名");
			return;
		}
        if(!param.birthday){
            app.tipInfo("请编辑生日");
            return;
        }
        var familycount = $("#fmnum");
        var val = familycount.text();
        param.familycount = parseFloat(val)?parseFloat(val):'';
		submitUserInfo();
	}
	/**
	 * 初始化用户信息
	 * @param {Object} info
	 */
	function initInfo(info) {
		console.log(info);
		param = info;
		//真名
		$("#realName").val(info.realname);
		//签名
		$("#autograph").val(info.signature);
		//性别
		if(info.gender != 1) {//女
//			$(".sexBtn.active").removeClass("active");
//			$(".sexBtn").eq(1).addClass("active");
            $(".sexBtn").text('女');
		}else{
			$(".sexBtn").text('男');
		}
		//生日
		$("#birthday").text(info.birthday.split(" ")[0]);
		app.initPickerByDay(info.birthday);
		//家庭人数
		if(info.familycount) {
			$("#fmnum").text(info.familycount + "人");
		}
		
		
		//职业
		$("#occupation").val(info.occupation);
		//喜好
		if(info.likes) {
			userLikes = info.likes.split(",");
			if(systemLikes){
				//判断当前是否被选中
				for(var i = 0; i < userLikes.length; i++) {
					var id = userLikes[i];
					$("[likeid='"+id+"']").addClass("active");
				}
			}
		}
		//自选的爱好
		$("#likes").val(info.extlikes);
		//忌口
		$("#jikou").val(info.taboos);
	}
	//用户上次选择的喜好
	var userLikes = null;
	//系统设置的喜好
	var systemLikes = null;
	
	/**
	 * 显示偏好设置
	 */
	function showLikes() {
		var temp = app.getTempBySelector("#likestemp");
		$.each(systemLikes, function(index, item) {
			if(userLikes) {
				//判断当前是否被选中
				for(var i = 0; i < userLikes.length; i++) {
					if(userLikes[i] == item.id) {
						item.selected = true;
						break;
					}
				}
			}
			$("#likes").before(temp(item));
		});
	}
	/**
	 * 加载偏好
	 */
	function loadLikes() {
		app.getSysParam("LIKES", function(data) {
			systemLikes = data;
			showLikes();
		}, "biz");
	}

	//根据选择的生日初始化日期选择控件
	app.initPickerByDay = function(birthday) {
		var timeAry = birthday.split("-");
		var yearIndex = parseInt(timeAry[0]) - yearStart;
		var monthIndex = parseInt(timeAry[1]) - 1;
		var dayIndex = parseInt(timeAry[2]) - 1;
		var selectedIndex = [yearIndex, monthIndex, dayIndex];
		initPicker(selectedIndex);
	}
	var yearStart = 1900;
	//生日选择数据
	var timeData = (function() {
		//起始年

		var yeayEnd = new Date().getFullYear();
		var data = [
			[],
			[],
			[]
		];
		for(var i = yearStart; i <= yeayEnd; i++) {
			data[0].push({
				text: i,
				value: i
			});
		}
		for(var i = 1; i <= 12; i++) {
			data[1].push({
				text: get2NumStr(i),
				value: get2NumStr(i)
			});
		}
		for(var i = 1; i <= 31; i++) {
			data[2].push({
				text: get2NumStr(i),
				value: get2NumStr(i)
			});
		}
		return data;
	})();
	app.init = function() {
		loadLikes(); //查询喜好业务参数
		queryUserInfo(); //查询用户信息
	};
	/**
	 * 初始化点击项目
	 * @param {Object} isInited
	 */
	function initClick(isNotInited) {
		if(isNotInited) { //没有初始化信息的
			//点击姓名
			$(".item").eq(0).click(app.clickRealName);
			var realNameInput = $(".item").eq(0).find("input");
			realNameInput.blur(function(){
				param.realname = realNameInput.val();
			});
			$("#fmnum").click(app.clickFamily);
			$(".sexBtn").click(app.clickSex);
			$(".item").eq(3).click(app.clickBrithday);
		}else{
			$(".item").eq(0).find("input").attr("readonly","readonly");
		}
		
		$("#fmnum").click(app.clickFamily);
		var autograph = $("#autograph");
		//点击个性签名
		$(".item").eq(1).click(function(){
			autograph.focus();
		});
		autograph.blur(function(){
			param.signature = autograph.val();
		});
		//点击家庭人数
//		$(".item").eq(4).click(function(){
//          
//		});
//		familycount.blur(function(){
//			familycount[0].type="text";
//			var val = familycount.val();
//			if(val){
//				val = Number(val);
//				alert(val);
//				param.familycount = val;
//			}else{
//				param.familycount = "";
//				familycount.val("")
//			}
//		});
		var occupation = $("#occupation");
		//点击职业
		$(".item").eq(5).click(function(){
			occupation.focus();
		});
		occupation.blur(function(){
			param.occupation = occupation.val();
		})
		
		var jikou = $("#jikou");
		//点击忌口
		$(".item").eq(7).click(jikou.focus);
		jikou.blur(function(){
			param.taboos = jikou.val()
		});
		//点击其他喜好
		$("#likes").blur(function(){
			param.extlikes = $("#likes").val();
		})
	}
	//点击喜好
	app.clickLikes = function(id,el){
		$("[likeid='"+id+"']").toggleClass("active");
		var els = $(".likiesbtn.active");
		var ary = [];
		for(var i=0;i<els.length;i++){
			ary.push($(els[i]).attr("likeid"));
		}
		param.likes = ary.join(",");
	};
	//点击其他喜好
	app.clickextlikes = function(){
		var dialog = new auiDialog();
		dialog.prompt({
			title: "编辑喜好",
			text: '请输入您的喜好',
			buttons: ['取消', '确定']
		}, function(ret) {
			if(ret.buttonIndex == 2) {
				var name = ret.text.trim();
				param.extlikes = name;
				$("#likes").val(name);
			}
			dialog.close();
		}, true);
	
	};
	//点击家庭人数
	app.clickjikou = function() {
		var dialog = new auiDialog();
		dialog.prompt({
			title: "编辑忌口",
			text: '请输入您的忌口',
			buttons: ['取消', '确定']
		}, function(ret) {
			if(ret.buttonIndex == 2) {
				var name = ret.text.trim();
				param.taboos = name;
				$("#jikou").text(name);
			}
			dialog.close();
		}, true);
	};
	//点击家庭人数
	app.clickFmnum = function() {
		var dialog = new auiDialog();
		dialog.prompt({
			title: "编辑家庭人数",
			text: '请输入您的家庭人数',
			buttons: ['取消', '确定']
		}, function(ret) {
			if(ret.buttonIndex == 2) {
				var name = ret.text.trim();
				if(/^\d{1,3}$/.test(name)) {
					param.familycount = name;
					$("#fmnum").text(name + "人");
				} else {
					app.tipInfo("请输入正确的人数");
					return;
				}
			}
			dialog.close();
		}, true);
	};
	//点击职业
	app.clickoccupation = function() {
		var dialog = new auiDialog();
		dialog.prompt({
			title: "编辑职业",
			text: '请输入您的职业',
			buttons: ['取消', '确定']
		}, function(ret) {
			if(ret.buttonIndex == 2) {
				var name = ret.text.trim();
				param.occupation = name;
				$("#occupation").text(name);
			}
			dialog.close();
		}, true);
	};
	//点击个性签名
	app.clickAutograph = function() {
		var dialog = new auiDialog();
		dialog.prompt({
			title: "编辑个性签名",
			text: '请输入您的签名',
			buttons: ['取消', '确定']
		}, function(ret) {
			if(ret.buttonIndex == 2) {
				var name = ret.text.trim();
				if(name.length > 0) {
					param.signature = name;
					$("#autograph").text(name);
				}
			}
			dialog.close();
		}, true);
	};
	//点击姓名
	app.clickRealName = function() {
		$(".item").eq(0).find("input").focus();
	};
	/**
	 * 初始化性别选择控件
	 */
	function sexPicker(){
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
		    var sixtime = selectedVal[0];
		    if(sixtime == 0){
		    	param.gender = "0";
		    }else{
		    	param.gender = "1";
		    }
		    $(".sexBtn").text(sixtime == 1?'男':'女');
	    });
		app.picker2 = picker;
	}
	
	/**
	 * 初始化家庭选择控件
	 */
	function familyPicker(){
		var picker = new Picker({
			data: [
				[{
					text: "1人",
					value: 0
				}, {
					text: "2人",
					value: 1
				},{
					text: "3人",
					value: 2
				}, {
					text: "4人",
					value: 3
				},{
					text: "5人",
					value: 4
				}, {
					text: "6人",
					value: 5
				},{
					text: "7人",
					value: 6
				}, {
					text: "8人",
					value: 7
				},{
					text: "9人",
					value: 8
				}, {
					text: "10人",
					value: 9
				}]
		    ],
	    selectedIndex: [0],
	    title: '选择家庭人数'
		});
		picker.on('picker.select', function(selectedVal, selectedIndex) {
		    var sixtime = people(selectedVal[0]);
		    $("#fmnum").text(sixtime);
	    });
		app.picker3 = picker;
	}
	
	function people(index){
        var str ="";
        switch (index)
        {   case 0:
                str="1人";
                break;
            case 1:
                str="2人";
                break;
            case 2:
                str="3人";
                break;
            case 3:
                str="4人";
                break;
            case 4:
                str="5人";
                break;
            case 5:
                str="6人";
                break;
            case 6:
                str="7人";
            break;   
            case 7:
                str="8人";
                break;
            case 8:
                str="9人";
                break;
            case 9:
                str="10人";
                break;    
        }
        return str;
    }
	
	/**
	 * 初始化日期选择控件
	 */
	function initPicker(selectedIndex) {
		var picker = new Picker({
			data: timeData,
			selectedIndex: selectedIndex ? selectedIndex : [80, 0, 0],
			title: '选择生日'
		});
		//当选择变化时
		picker.on('picker.change',
			function(index, selectedIndex) {
				var year = timeData[0][picker.selectedIndex[0]].value;
				var momth = timeData[1][picker.selectedIndex[1]].value;
				changeDays(year, momth);
			});
		picker.on('picker.select', function(selectedVal, selectedIndex) {
			var year = timeData[0][picker.selectedIndex[0]].value;
			var momth = timeData[1][picker.selectedIndex[1]].value;
			var day = timeData[2][picker.selectedIndex[2]].value;
			var daytime = year + "-" + momth + "-" + day;
			$("#birthday").text(daytime);
			param.birthday = daytime;
		});
		app.picker1 = picker;
	}
	/**
	 * 将数字转成两位字符串
	 */
	function get2NumStr(i) {
		if(i < 10) {
			return "0" + i;
		}
		return i;
	}
	//改变日期
	function changeDays(year, momth) {
		var data = [];
		var days = 30;
		//大月
		if(momth == 1 || momth == 3 ||
			momth == 5 || momth == 7 ||
			momth == 8 || momth == 10 ||
			momth == 12
		) {
			days = 31;
		}
		//二月
		if(momth == 2) {
			days = 28;
			//润年days = 29
			if((year % 4 == 0) && (year % 100 != 0 || year % 400 == 0)) {
				days = 29;
			}
		}
		//计算日期
		for(var i = 1; i <= days; i++) {
			data.push({
				text: get2NumStr(i),
				value: get2NumStr(i)
			});
		}
		//根系第三列
		app.picker.refillColumn(2, data);
	}

	app.clickBrithday = function() {
		app.picker1.show();
	};
    app.clickSex = function() {
    	app.picker2.show();
    }
    app.clickFamily = function(){
    	app.picker3.show();
    }
	return app;
});