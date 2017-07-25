define(["base/commonutil", "base/net", "language", "animate", "base/constant","base/baiducount", "base/nativeutil", "base/analysis"], function(commonutil, net, language, animate, constant,baiducount,nativeutil,analysis) {
	//app对象是常用工具类的衍生
	var app = jQuery.extend({
		appBefore: function() {}, //init前调用
		appAfter: function() {} //init后调用
	}, commonutil);
	app = jQuery.extend(app, constant);
	app = jQuery.extend(app, net);
	app.language = language;
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
	app.loading = function(msg) {
		this.toast.loading({
			title: msg
		});
	}
	app.hideLoading = function(msg) {
			this.toast.hide();
		}
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
		//app初始化后一步
		if(this.appAfter && this.appAfter instanceof Function) {
			this.appAfter();
		}
		//区分环境
		if(app.netConfig.runType == "dev" || app.netConfig.runType == "test") {
			app.changeDOCTitle("测试" + document.title);
		}
	};
	window.app = app;
	/**跳回首页*/
	app.gotoIndexPage = function() {
		location.href = "../index.html";
	};
	/**跳转到购物车*/
	app.gotoSpCaPage = function() {
		if(location.pathname.indexOf("index.html") > -1) {
			location.href = "./html/spcar.html";
		} else {
			location.href = "./spcar.html";
		}
	}

	/**
	 * 登录token自动续期
	 */
	function autoRenewal() {
		var loginTime = localStorage.loginTime;
		var loginedToken = localStorage.loginedToken;
		loginTime = loginTime ? loginTime : 0;
		if(loginedToken) {
			var now = new Date().getTime();
			var delay = 1000 * 60 * 60;
			var c = now - loginTime;
			if(c > (delay)) {
				app.POSTRequest_m("member/token/tokenValidate.do", {
					async: false,
					success: function(data) {
						if(data.resultCode == 1) {
							localStorage.loginTime = new Date().getTime();
						} else { //无线调用app的登录失效
							//TODO 添加登录验证 重要
							localStorage.loginTime = 0;
							localStorage.loginedToken = '';
						}
					}
				});
			} else { //定时 和上次差一小时的时候去续期
				setTimeout(autoRenewal, c);
			}
		}
	}
	autoRenewal();
	/**
	 *检查是否登录，仅限本地检查与服务器情况可能不符合 
	 */
	app.checkLogin = function() {
		var loginedToken = localStorage.loginedToken;
		if(loginedToken) {
            var flag = false;
            app.POSTRequest_m("member/token/tokenValidate.do", {
                async: false,
                success: function(data) {
                    if(data.resultCode == 1) {
                        flag =  true;
                    } else {
                        flag =  false;
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
		if(backUrl) {
			localStorage.loginBackUrl = backUrl;
			if(replace) {
				if(window.isInAppEnviroment()) {
					app.replace(app.netConfig.pageRoot+"/html/loginNew.html?back=true");
				} else {
					app.replace(app.netConfig.pageRoot+"/html/login.html?back=true");
				}
			} else {
				if(window.isInAppEnviroment()) {
					app.href(app.netConfig.pageRoot+"/html/loginNew.html?back=true");
				} else {
					app.href(app.netConfig.pageRoot+"/html/login.html?back=true");
				}
			}
			return;
		}
		if(window.isInAppEnviroment()) {
			app.href(app.netConfig.pageRoot+"/html/loginNew.html");
		} else {
			app.href(app.netConfig.pageRoot+"/html/login.html");
		}
	}

	//空列表处理方法
	app.emptyList = function(id, msg) {
			msg = msg ? msg : "这里什么都没有哦~"
			$(id).html("<div style='height:2rem;'></div><div class='null'></div><div class='aui-text-center app_text_gray'>" + msg + "</div>");
		}
		//获取用户
	app.getUser = function(callBack, noLogin) {
        app.POSTRequest_m("member/baseInfo/getMemberBaseInfo.do", {
        	async : false, 
            success: function(data) {
                if(data.resultCode === "1") {
                	app.getSysParam("LEVELRULES",function (levelParams) {
                		var lv_map = {};
						$.each(levelParams,function (i,it) {
                            lv_map[it.innercode] = it.paramname;
                        });
                        data.resultObj.levelName = lv_map[data.resultObj.level];
                        app.setLocalObjet("userInfo", data.resultObj);
                        if(callBack && callBack instanceof Function)
                            callBack(data.resultObj);
                    },"biz");
                } else if(data.resultCode === "-1") {
                    if(noLogin && noLogin instanceof Function)
                        noLogin();
                } else {
                    app.tipInfo(data.resultMsg);
                }
            }
        });
    };

    /**
	 * 获取用户优惠券
     * @param callBack
     * @param noLogin
     */
    app.getCoupon = function(param, callBack, noLogin) {
        var defaultParam = {
            couponType:1,
            couponStatus:1
        }
        param = $.extend(defaultParam,param);
        app.POSTRequest("weixin/mall/order/showMemberCoupon.do", {
		async:false,
        	data:param,
            success: function(data) {
                if(data && data.resultCode === "1") {
                    if(callBack && callBack instanceof Function)
                        callBack(data.resultObj);
                } else if( data &&  data.resultCode === "-1") {
                    if(noLogin && noLogin instanceof Function)
                        noLogin();
                } else {
                    app.tipInfo(data.resultMsg);
                }
            }
        });
    }
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
	app.getStartFee = function(){
        app.getSysParam("VEGETABLEORDER",function (data) {
            $.each(data,function (i,it) {
                if(it.innercode == "STARTCASH"){
                    if(it.paramvalue){
                        app.startCash = it.paramvalue*1;
                    }
                }
            });
        },"biz");
	};
	//获取菜谱页面的系统参数
    app.cookbook = [];
    app.getCookbookone = function(){
        app.getSysParam("COOKBOOK",function (data) {
            $.each(data,function (i,it) {
                if(it.innercode == "CB1"){
                    if(it.paramvalue){
                    	app.cookbook = it.paramvalue;
                    }
                }
            });
        },"biz");
	};
	app.cookbookss = [];
	app.getCookbookthree = function(){
		app.getSysParam("COOKBOOK",function (data) {
            $.each(data,function (i,it) {
                if(it.innercode == "CB3"){
                    if(it.paramvalue){
                    	app.cookbookss = it.paramvalue;
                    }
                }
            });
        },"biz");
	}
	app.cookbooks = [];
	app.getCookbooktwo = function(){
		app.getSysParam("COOKBOOK",function (data) {
            $.each(data,function (i,it) {
                if(it.innercode == "CB2"){
                    if(it.paramvalue){
                    	app.cookbooks = it.paramvalue;
                    }
                }
            });
        },"biz");
	}
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

	app.href = function(url){
		if(!url || url === "#"){
			return;
		}
        location.href = overwriteUrl(url);
	}

	app.replace = function(url){
        var varUrl = overwriteUrl(url);
        location.replace(varUrl);
	}

    app.recordeEmployeeno = function(){
        var employeeno = app.UrlParams.employeeno;
        var currDate = new Date();
        var time = currDate.getTime();
        if(!employeeno){
            var currEmployee = app.getLocalObject();
            if(currEmployee && time > currEmployee.time){
                localStorage.removeItem("cmy_employee");
            }
            return;
        }
        time += 24*60*60*1000;
        var employee = {
            "employeeno":employeeno,
            "time":time
        };

        app.setLocalObjet("cmy_employee", employee);
    };


	return app;
});