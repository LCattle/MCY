define(["base/commonutil", "base/net", "language", "animate", "base/constant", "base/baiducount", "base/nativeutil", "base/analysis"], function(commonutil, net, language, animate, constant, baiducount, nativeutil, analysis, fastclick) {
	//app对象是常用工具类的衍生
	var app = jQuery.extend({
		appBefore: function() {}, //init前调用
		appAfter: function() {} //init后调用
	}, commonutil);
	/**
	 * 保存堆栈信息
	 */
	app.saveHistoryStack = function() {
		sessionStorage.setItem("nativeUrlStack", JSON.stringify(app.historyStack));
	};
	/**
	 * 访问记录堆栈
	 */
	app.historyStack = []; { //初始化historyStack
		var stack = eval(sessionStorage.nativeUrlStack);
		if(stack && stack instanceof Array) {
			app.historyStack = stack;
		}
		var lastUrl = app.historyStack.pop();
		if(lastUrl) { //对比当前页面和上一个页面是否一致
			var index = location.href.indexOf("?");
			var url_1 = lastUrl.substring(0, (index == -1) ? lastUrl.length : index);
			index = location.href.indexOf("?");
			var url_2 = location.href.substring(0, (index == -1) ? location.href.length : index);
			if(url_1 != url_2) {
				app.historyStack.push(lastUrl);
			} else { //对比参数
				var params1 = app.getUrlParams(lastUrl);
				params1.v = 1;
				var params2 = app.getUrlParams(location.href);
				params2.v = 1;
				var str1 = app.dataToSearchStr(params1);
				var str2 = app.dataToSearchStr(params2);
				if(str1 != str2) {
					app.historyStack.push(lastUrl);
				}
			}
		}
		app.historyStack.push(location.href); //将当前页面推到堆栈
		app.saveHistoryStack();
	}
	app = jQuery.extend(app, constant);
	app = jQuery.extend(app, net);
	app.language = language;
	app.registerBackFunc = true; //默认需要注册返回事件
	app.registerShareBtn = false; //默认不需要注册分享按钮
	app.shareData = {
		title: '',
		content: '',
		url: ''
	}; //需要分享的数据
	app.toast = new auiToast();
	app.fail = function(msg) {
		this.toast.fail({
			title: msg,
			duration: 1500
		});
	}
	app.success = function(msg) {
		this.toast.success({
			title: msg,
			duration: 1500
		});
	}
	app.loading = function(msg, force) {
		if(!force) {
			if(isInAppEnviroment()) {
				return;
			}
		}
		this.toast.loading({
			title: msg
		});
	};
	app.hideLoading = function() {
		this.toast.hide();
	};
	//app开始方法，程序入口，需要重写app的init方法
	app.start = function() {
		this.language.init(); //初始化 国际化框架
		//初始化页面信息
		if(this.initPage && this.initPage instanceof Function) {
			window.onresize = this.initPage;
			this.initPage();
		}
		//app初始化前一步
		if(this.appBefore && this.appBefore instanceof Function) {
			this.appBefore();
		}
		app.recordeEmployeeno();
		//app初始化
		if(this.init && this.init instanceof Function) {
			console.log("init");
			this.init();
		}
		//是否需要注册返回按钮
		if(app.registerBackFunc) {
			window.nativeRegistBackFunc(app.onNativeBack);
		}
		//注册分享按钮
		if(app.registerShareBtn) {
			window.nativeRegistShareBtn(app.shareData);
		}
		//app初始化后一步
		if(this.appAfter && this.appAfter instanceof Function) {
			this.appAfter();
		}
		//区分环境
		//		if(app.netConfig.runType == "dev" || app.netConfig.runType == "test") {
		//			app.changeDOCTitle("测试" + document.title);
		//		}
	};
	window.app = app;
	/**跳回首页*/
	app.gotoIndexPage = function() {
		if(isInAppEnviroment()) {
			nativeOpenNativeView("indexPage");
		} else {
			location.href = "../index.html";
		}
	};
	/**跳转到购物车*/
	app.gotoSpCaPage = function() {
		if(location.pathname.indexOf("index.html") > -1) {
			location.href = "./html/spcar.html";
		} else {
			location.href = "../html/spcar.html";
		}
	};

	/**
	 * 登录token自动续期
	 */
	function autoRenewal() {
		var loginedToken = localStorage.loginedToken;
		if(loginedToken && loginedToken.length > 4) {
			app.POSTRequest_m("member/token/tokenValidate.do", {
				async: false,
				success: function(data) {
					if(data.resultCode == 1) {
						localStorage.loginTime = new Date().getTime();
					} else { //无线调用app的登录失效
						//TODO 添加登录验证 重要
						nativeSetShareData("loginedToken", "", 1);
						localStorage.loginTime = 0;
						localStorage.loginedToken = '';
					}
				}
			});
		} else {
			//TODO 添加登录验证 重要
			nativeSetShareData("loginedToken", "", 1);
			localStorage.loginTime = 0;
			localStorage.loginedToken = '';
		}
	}
	autoRenewal();
	/**
	 *检查是否登录，仅限本地检查与服务器情况可能不符合 
	 */
	app.checkLogin = function() {
		var loginedToken = localStorage.loginedToken;
		if(isInAppEnviroment()) {
			var isLogined = loginedToken && loginedToken.length > 4;
			return isLogined;
		}
		if(loginedToken) {
			var flag = false;
			app.POSTRequest_m("member/token/tokenValidate.do", {
				async: false,
				success: function(data) {
					if(data.resultCode == 1) {
						flag = true;
					} else {
						flag = false;
					}
				}
			});
			return flag;
		} else {
			return false;
		}
	};
	/**
	 *跳转到登录页 
	 */
	app.toLoginPage = function(backUrl, replace) {
		localStorage.loginBackUrl = backUrl;
		//如果是app环境 调登陆页
		if(window.isInAppEnviroment()) {
			var exData = null;
			if(backUrl) {
				if(backUrl.indexOf("../") == 0) {
					backUrl = bacUrl.replace("../", "");
				}
				if(backUrl.indexOf("./") == 0) {
					backUrl = bacUrl.replace("./", "");
				}
				if(backUrl.indexOf("/") == 0) {
					backUrl = bacUrl.replace("/", "");
				}
				if(backUrl.indexOf("http") != 0) {
					backUrl = app.netConfig.pageRoot + backUrl;
				}
				exData = {
					backUrl: backUrl
				};
			} else {
				exData = {
					backUrl: ''
				};
			}
			nativeOpenNativeView("loginPage", exData);
			return;
		}
		if(backUrl) {
			app.replace(app.netConfig.pageRoot + "/loginregistor/login.html?back=true");
			return;
			//			if(replace) {
			//				if(window.isInAppEnviroment()) {
			//					app.replace(app.netConfig.pageRoot + "/loginregistor/login.html");
			//				} else {
			//					app.replace(app.netConfig.pageRoot + "/html/login.html?back=true");
			//				}
			//			} else {
			//				if(window.isInAppEnviroment()) {
			//					nativeOpenNativeView("loginPage", {
			//						backUrl: backUrl
			//					});
			//				} else {
			//					app.href(app.netConfig.pageRoot + "/html/login.html?back=true");
			//				}
			//			}
			//			return;
		}
		//		if(window.isInAppEnviroment()) {
		//			nativeOpenNativeView("loginPage");
		//		} else {
		//			app.href(app.netConfig.pageRoot + "/html/login.html");
		//		}
		app.replace(app.netConfig.pageRoot + "/loginregistor/login.html");
	}

	//空列表处理方法
	app.emptyList = function(id, msg) {
		msg = msg ? msg : "这里什么都没有哦~"
		$(id).html("<div style='height:2rem;'></div><div class='null'></div><div class='aui-text-center app_text_gray'>" + msg + "</div>");
	};
	//获取用户
	app.getUser = function(callBack, noLogin) {
		app.POSTRequest_m("member/baseInfo/getMemberBaseInfo.do", {
			async: false,
			success: function(data) {
				if(data.resultCode === "1") {
					app.getSysParam("LEVELRULES", function(levelParams) {
						var lv_map = {};
						$.each(levelParams, function(i, it) {
							lv_map[it.innercode] = it.paramname;
						});
						data.resultObj.levelName = lv_map[data.resultObj.level];
						app.setLocalObjet("userInfo", data.resultObj);
						if(callBack && callBack instanceof Function)
							callBack(data.resultObj);
					}, "biz");
				} else if(data.resultCode === "-1") {
					if(noLogin && noLogin instanceof Function)
						noLogin();
				} else {
					app.tipInfo(data.resultMsg);
				}
			}
		});
	};

	// 带有会员等级名称
	app.getUserWithLevel = function(callBack, noLogin) {
		app.getUser(function(data) {
			app.getSysParam("LEVELRULES", function(levelParams) {
				var lv_map = {};
				$.each(levelParams, function(i, it) {
					lv_map[it.innercode] = it.paramname;
				});
				data.levelName = lv_map[data.level];
				if(callBack && callBack instanceof Function)
					callBack(data);
			}, "biz");
		}, noLogin);
	}

	/**
	 * 获取用户优惠券
	 * @param callBack
	 * @param noLogin
	 */
	app.getCoupon = function(param, callBack, noLogin) {
		var defaultParam = {
			couponType: 1,
			couponStatus: 1
		}
		param = $.extend(defaultParam, param);
		app.POSTRequest("weixin/mall/order/showMemberCoupon.do", {
			async: false,
			data: param,
			success: function(data) {
				if(data && data.resultCode === "1") {
					if(callBack && callBack instanceof Function)
						callBack(data.resultObj);
				} else if(data && data.resultCode === "-1") {
					if(noLogin && noLogin instanceof Function)
						noLogin();
				} else {
					app.tipInfo(data.resultMsg);
				}
			}
		});
	};
	/**
	 * 获取用户蔬菜券
	 * @param callBack
	 * @param noLogin
	 */
	app.getVegetable = function(param, callBack, noLogin) {
		var defaultParam = {
			couponType: 2,
			couponStatus: 1
		}
		param = $.extend(defaultParam, param);
		app.POSTRequest("weixin/mall/order/showMemberCoupon.do", {
			async: false,
			data: param,
			success: function(data) {
				if(data && data.resultCode === "1") {
					if(callBack && callBack instanceof Function)
						callBack(data.resultObj);
				} else if(data && data.resultCode === "-1") {
					if(noLogin && noLogin instanceof Function)
						noLogin();
				} else {
					app.tipInfo(data.resultMsg);
				}
			}
		});
	};
	/**
	 * 获取系统参数
	 * @param {Object} paramKey
	 */
	app.getSysParam = function(paramKey, callback, type) {
		this.POSTRequest("weixin/mall/paramGetParamList.do", {
			async: false,
			data: {
				groupcode: paramKey,
				type: type ? type : "sys"
			},
			success: function(data) {
				if(data.resultCode == 1) {
					callback(data.resultObj);
				}
			}
		});
	};

	/**
	 * 获取起送斤数
	 * @type {number}
	 */
	/*app.startFee = 2500;
	app.getStartFee = function(){
        app.getSysParam("VEGETABLEORDER",function (data) {
            $.each(data,function (i,it) {
                if(it.innercode == "STARTFEE"){
                    if(it.paramvalue){
                        app.startFee = it.paramvalue*1;
                    }
                }
            });
        },"biz");
	};*/
	/**
	 * 获取起送金额
	 * @type {number}
	 */
	app.startCash = 60;
	app.getStartFee = function() {
        app.getSysParam("VEGETABLEORDER", function(data) {
            $.each(data, function(i, it) {
                if(it.innercode == "STARTCASH") {
                    if(it.paramvalue) {
                        app.startCash = it.paramvalue * 1;
                    }
                }
            });
        }, "biz");
    };
	/**
	 * 给路径加上时间戳
	 * @param {Object} url
	 */
	function overwriteUrl(url) {
		var varUrl = url;
		if(url.indexOf("?") != -1) {
			varUrl = url.split("?")[0];
			var param = app.getUrlParams(url);
			param.v = new Date().getTime();
			varUrl = varUrl + "?" + app.dataToSearchStr(param);
		} else {
			var param = {
				v: new Date().getTime()
			};
			varUrl = varUrl + "?" + app.dataToSearchStr(param);
		}
		return varUrl;
	}

	app.href = function(url) {
		location.href = overwriteUrl(url);
	};

	app.replace = function(url) {
		var varUrl = overwriteUrl(url);
		app.historyStack.pop();
		app.saveHistoryStack();
		location.replace(varUrl);
	};

	app.recordeEmployeeno = function() {
		var employeeno = app.UrlParams.employeeno;
		var currDate = new Date();
		var time = currDate.getTime();
		if(!employeeno) {
			var currEmployee = app.getLocalObject();
			if(currEmployee && time > currEmployee.time) {
				localStorage.removeItem("cmy_employee");
			}
			return;
		}
		time += 24 * 60 * 60 * 1000;
		var employee = {
			"employeeno": employeeno,
			"time": time
		};

		app.setLocalObjet("cmy_employee", employee);
	};

	/**
	 * 该方法由原生触发
	 */
	app.onNativeBack = function() {
		app.historyStack.pop(); //排除当前页
		var url = app.historyStack.pop(); //取出上一页
		app.saveHistoryStack();
		if(!url) {
			nativeOpenNativeView("closePage")
			return;
		}
		app.href(url);
	};

	//查询最新版本信息
	app.getNewstVersion = function(callBack) {
		var appType = "OTHER"
		//安卓
		if(window.mobile) {
			appType = "ANDROID";
		}
		//IOS
		if(window.WebViewJavascriptBridge) {
			appType = "IOS";
		}
		app.POSTRequest("weixin/mall/appversion/versionDetail.do", {
			data: {
				appType: appType
			},
			success: function(data) {
				if(data.resultCode == 1) {
					callBack(data.resultObj);
				} else {
					app.tipInfo(data.resultMsg);
				}
			}
		})
	}

	app.formatDate = function(date, type) {
		if(typeof(date) == "string") {
			date = (date == "") ? new Date() : (new Date(String(date).replace(/-/g, '/')));
		}
		Date.prototype.Format = function(fmt) {
			var o = {
				"M+": this.getMonth() + 1, //月份
				"d+": this.getDate(), //日
				"h+": this.getHours(), //小时
				"m+": this.getMinutes(), //分
				"s+": this.getSeconds(), //秒
				"q+": Math.floor((this.getMonth() + 3) / 3), //季度
				"S": this.getMilliseconds() //毫秒
			};
			if(/(y+)/.test(fmt)) {
				fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
			}
			for(var k in o) {
				if(new RegExp("(" + k + ")").test(fmt)) {
					fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
				}
			}
			return fmt;
		};

		if(type === "datetime") {
			return date.Format("yyyy-MM-dd hh:mm:ss");
		} else if(type === "day") {
			return date.Format("yyyy-MM-dd");
		} else if(type === "month") {
			return date.Format("yyyy-MM");
		} else if(type === "time") {
			return date.Format("hh:mm");
		} else if(type === "day-time") {
			return date.Format("yyyy-MM-dd") + " " + date.Format("hh:mm");
		}
	};

	//舍去法截取一个小数
	app.floor = function(digit, length) {
		length = length ? parseInt(length) : 0;
		if(length <= 0) return Math.floor(digit);
		digit = Math.floor(digit * Math.pow(10, length)) / Math.pow(10, length);
		return digit;
	};

	//跳转第三方客服
	app.imLinkUrl = "http://a1.7x24cc.com/phone_webChat.html?accountId=N000000010545&chatId=cmyny-79469a20-3616-11e7-be00-57d3b327806f";
	if(!localStorage.imLinkUrlCustomerId) {
		localStorage.imLinkUrlCustomerId = app.uuid();
	}
	app.imLinkUrlReal = app.imLinkUrl + "&nickName=" + localStorage.imLinkUrlCustomerId + "&customerId=" + localStorage.imLinkUrlCustomerId;
	app.openImUrl = function() {
		if(isInSpringWoodsAndroid()) {
		app.changeDOCTitle("春沐源客服");
		}
		setTimeout(function() {
			app.href(app.imLinkUrlReal);
		}, 10)
		
	}

	//处理分享出去的页面跳转问题
//	if(!isInAppEnviroment()) {
//		var url = app.UrlParams.url;
//		var doc = window.document,
//			ifr = doc.createElement('iframe');
//		//创建一个隐藏的iframe
//		if(url){
//			ifr.src = "springwoods://app/share?" + location.search;
//		}else{
//			ifr.src = "springwoods://app/share?url=" + location.href;
//		}
//
//		ifr.style.cssText = 'display:none;border:0;width:0;height:0;';
//		doc.body.appendChild(ifr);//苹果
//		location.href = ifr.src;//安卓
//		setTimeout(function() {
//			if(location.href.indexOf("download/download.html") == -1)
//				location.href = "../download/download.html?url=" + location.href;
//		}, 2000);
//	}

	return app;
});