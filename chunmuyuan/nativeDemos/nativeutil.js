(function() {
	//安卓回调方法集合
	window.androidCallBacks = {};
	//初始化IOS
	function setupWebViewJavascriptBridge(callback) {
		if(window.WebViewJavascriptBridge) {
			return callback(WebViewJavascriptBridge);
		}
		if(window.WVJBCallbacks) {
			return window.WVJBCallbacks.push(callback);
		}
		window.WVJBCallbacks = [callback];
		var WVJBIframe = document.createElement('iframe');
		WVJBIframe.style.display = 'none';
		WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__';
		document.documentElement.appendChild(WVJBIframe);
		setTimeout(function() {
			document.documentElement.removeChild(WVJBIframe)
		}, 0)
	}
	setupWebViewJavascriptBridge(function(bridge) {})
		//初始化IOS结束
		/**生成uuid*/
	function uuid() {
		var s = [];
		var hexDigits = "0123456789abcdef";
		for(var i = 0; i < 36; i++) {
			s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
		}
		s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
		s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
		s[8] = s[13] = s[18] = s[23] = "-";
		var uuid = s.join("");
		return uuid;
	};
	/**
	 * 判断当前运行环境是否是app
	 */
	window.isInAppEnviroment = function(){
		//安卓
		if(window.mobile ) {
			return true;
		}
		//IOS
		if(window.WebViewJavascriptBridge){
			return true;
		}
		return false;
	}
	/**
	 * 打开扫码
	 */
	window.nativeOpenScan = function(callBack) {
		var data = {
			funcName: "startScan",
			callBack: callBack
		};
		//安卓
		if(window.callAndroidFunc(data)) {
			return true;
		}
		data.funcName = mobileStartScan;
		//IOS
		if(window.callIOSFunc(data)) {
			return true;
		}
		return false;
	}

	/**
	 * 改变标题栏
	 * 原生方法:changeTitle
	 * 参数 title，字符串类型
	 */
	window.nativeChangeTitle = function(title) {
		var data = {
			funcName: "changeTitle",
			param: title,
			paramType: 2
		};
		return callNativeFunc(data);
	};
	/**
	 * 呼叫电话号码
	 * 原生方法：callPhone
	 * 参数： num 字符串
	 */
	window.nativeCallPhone = function(num) {
		var data = {
			funcName: "callPhone",
			param: num,
			paramType: 2
		};
		return callNativeFunc(data);
	};
	/**
	 * 获取联系人
	 * 原生方法：getContacts
	 * 参数:callBack 方法 回传参数 数组 例[{"name":'张三',"tel":"13999999999"},{"name":'张三',"tel":"13999999999"}]
	 */
	window.nativeGetContacts = function(callBack) {
		var data = {
			funcName: "getContacts",
			callBack: callBack
		};
		return callNativeFunc(data);
	};
	/**
	 * 联合登录
	 * 原生方法: jointLogin
	 * 参数 type 字符串: type=wx表示调用微信登录，type=qq表示调用qq登录
	 * 参数 callBack 方法: 回传参数 param 对象：{jointToken:'登录获取的token'} 
	 */
	window.nativeJointLogin = function(type, callBack) {
		var data = {
			funcName: "jointLogin",
			param: type,
			paramType: 2,
			callBack: callBack
		};
		return callNativeFunc(data);
	};
	/**
	 * 触发分享
	 * @param {Object} param {'title':'测试分享的标题','content':'测试分享的内容','url':'http://www.baidu.com'};
	 * @param {Object} callBack 回调方法 回传参数 param{status:0}status=0用户取消，1成功，-1失败
	 * 原生方法openShare
	 */
	window.nativeOpenShare = function(param, callBack) {
		var data = {
			funcName: "openShare",
			param: param,
			paramType: 1,
			callBack: callBack
		};
		return callNativeFunc(data);
	};
	
	
	/**
	 * 注册返回事件处理方法
	 * 原生方法名称 registBackFunc
	 * 原生需要注意的是设置一个标志，每次新开页面标志设为false，如果我注册了返回方法，标志设为true
	 * 再点击返回时，如果标志为true，安卓调用 app.onNativeBack(),IOS调用注册好的onNativeBack
	 * 
	 */
	window.nativeRegistBackFunc = function() {
		var data = {
			funcName: "registBackFunc",
		};
		return callNativeFunc(data);
	};
	/**
	 * 注册右侧分享按钮
	 * 原生方法：registShareBtn
	 * 参数：param 对象:{'title':'测试分享的标题','content':'测试分享的内容','url':'http://www.baidu.com'};
	 * 需要注意的是 每次打开新页面都需隐藏分享按钮，如果注册了再显示
	 */
	window.nativeRegistShareBtn = function(param) {
		var data = {
			funcName: "registShareBtn",
			param:param,
			paramType:1
		};
		return callNativeFunc(data);
	};
	
	
	
	/**
	 * 调用原生支付
	 * 原生方法：openPay
	 * @param {Object} param 支付参数 ，回调方法
	 * @param {Object} callBack
	 */
	window.nativeOpenPay = function(param, callBack) {
		var data = {
			funcName: "openPay",
			param: param,
			paramType: 1,
			callBack: callBack
		};
		return callNativeFunc(data);
	};

	/**
	 * 获取版本信息
	 * 原生方法：getVersion
	 * @param {Object} callBack
	 */
	window.nativeGetVersion = function(callBack) {
		var data = {
			funcName: "getVersion",
			callBack: callBack
		};
		return callNativeFunc(data);
	};
	/**
	 * 执行检查更新操作
	 * 原生方法：checkUpdate
	 * @param {Object} callBack
	 */
	window.nativeCheckUpdate = function() {
		var data = {
			funcName: "checkUpdate",
		};
		return callNativeFunc(data);
	};
	/**
	 * 获取推送开关状态
	 * 原生方法:getPushSwitchStatus
	 * callBack 回传参数 {status:'T'} status T-开启 F-关闭 
	 */
	window.nativeGetPushSwitchStatus = function(callBack){
		var data = {
			funcName: "getPushSwitchStatus",
			callBack: callBack
		};
		return callNativeFunc(data);
	};
	/**
	 * 设置推送状态
	 * 原生方法：setPushSwitchStatus
	 * status T-开启 F-关闭
	 * @param {Object} status
	 */
	window.nativeSetPushSwitchStatus = function(status){
		var data = {
			funcName: "setPushSwitchStatus",
			param: status,
			paramType:2
		};
		return callNativeFunc(data);
	};
	/**
	 * 获取本地消息列表
	 * 原生方法：getMsgList
	 * @param {Object} callBack
	 */
	window.nativeGetMsgList=function(callBack){
		var data = {
			funcName: "getMsgList",
			callBack:callBack
		};
		return callNativeFunc(data);
	};
	/**
	 * 设置本地消息为已读
	 * 原生方法：setMsgReaded
	 * @param {Object} id 消息的唯一标识
	 */
	window.nativeSetMsgReaded = function(id){
		var data = {
			funcName: "setMsgReaded",
			param: id,
			paramType:2
		};
		return callNativeFunc(data);
	};
	/**
	 * 删除本地消息
	 * 原生方法:delMsgById
	 * @param {Object} id 消息的唯一标识
	 */
	window.nativeDelMsgById = function(id){
		var data = {
			funcName: "delMsgById",
			param: id,
			paramType:2
		};
		return callNativeFunc(data);	
	};
	/**
	 * 隐藏标题栏
	 * 原生方法：hideTitleBar
	 */
	window.nativeHideTitleBar = function(){
		var data = {
			funcName: "hideTitleBar",
		};
		return callNativeFunc(data);	
	};
	
	/**
	 * 调用原生方法
	 * @param {Object} data
	 */
	window.callNativeFunc = function(data) {
		//安卓
		if(callAndroidFunc(data)) {
			return true;
		}
		//IOS
		if(callIOSFunc(data)) {
			return true;
		}
		return false;
	};
	/**
	 * 抵用一个安卓方法
	 * @param {Object} funcName 要调用的参数名称
	 * @param {Object} param 传入的参数
	 * @param {Object} callBack 回调方法
	 */
	window.callAndroidFunc = function(data) {
		var funcName = data.funcName;
		if(window.mobile &&
			window.mobile[funcName] instanceof Function) {
			var param = null
			if(data.paramType) {
				param = data.param;
				if(data.paramType == 1) {
					param = JSON.stringify(param);
				}
			}
			var callBack = data.callBack;
			if(callBack) { //如果有回调
				var fucId = uuid();
				window.androidCallBacks[fucId] = function(data) {
					callBack(data);
				}
				if(param) {
					window.mobile[funcName](param, "window.androidCallBacks['" + fucId + "']");
				} else {
					window.mobile[funcName]("window.androidCallBacks['" + fucId + "']");
				}
			} else { //没有回调
				if(param) {
					window.mobile[funcName](param);
				} else {
					window.mobile[funcName]();
				}
			}
			return true;
		}
		return false;
	};
	/**
	 * 调用一个IOS方法
	 * @param {Object} data
	 */
	window.callIOSFunc = function(data) {
		var funcName = data.funcName;
		if(window.WebViewJavascriptBridge) {
			param = data.param;
			var callBack = data.callBack;
			if(callBack) { //如果有回调
				if(param) {
					WebViewJavascriptBridge.callHandler(funcName, param, callBack);
				} else {
					WebViewJavascriptBridge.callHandler(funcName, callBack);
				}
			} else { //没有回调
				if(param) {
					WebViewJavascriptBridge.callHandler(funcName, param);
				} else {
					WebViewJavascriptBridge.callHandler(funcName);
				}
			}
			return true;
		}
		return false;
	};

})();