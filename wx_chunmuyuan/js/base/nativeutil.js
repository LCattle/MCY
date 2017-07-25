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
	 * 打开扫码
	 */
	window.nativeOpenScan = function(callBack) {
		//安卓
		if(window.mobile &&
			window.mobile.startScan instanceof Function) {
			var fucId = uuid();
			window.androidCallBacks[fucId] = function(data) {
				callBack(data);
			}
			window.mobile.startScan("window.androidCallBacks['"+fucId+"']");
			return true;
		}
		//IOS
		if(window.WebViewJavascriptBridge){
			WebViewJavascriptBridge.callHandler("mobileStartScan",callBack);
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
		//安卓
		if(window.mobile &&
			window.mobile.changeTitle instanceof Function) {
			window.mobile.changeTitle(title);
			return true;
		}
		//IOS
		if(window.WebViewJavascriptBridge){
			WebViewJavascriptBridge.callHandler("changeTitle",title);
			return true;
		}
		return false;
	}
	
	/**
	 * 呼叫电话号码
	 * 原生方法：callPhone
	 * 参数： num 字符串
	 */
	window.nativeCallPhone = function(num){
		//安卓
		if(window.mobile &&
			window.mobile.callPhone instanceof Function) {
			window.mobile.callPhone(num);
			return true;
		}
		//IOS
		if(window.WebViewJavascriptBridge){
			WebViewJavascriptBridge.callHandler("callPhone",num);
			return true;
		}
		return false;
	}
	/**
	 * 获取联系人
	 * 原生方法：getContacts
	 * 参数:callBack 方法 回传参数 数组 例[{"name":'张三',"tel":"13999999999"},{"name":'张三',"tel":"13999999999"}]
	 */
	window.nativeGetContacts = function(callBack){
		//安卓
		if(window.mobile &&
			window.mobile.getContacts instanceof Function) {
			var fucId = uuid();
			window.androidCallBacks[fucId] = function(data) {
				callBack(data);
			}
			window.mobile.getContacts("window.androidCallBacks['"+fucId+"']");	
			return true;
		}
		//IOS
		if(window.WebViewJavascriptBridge){
			WebViewJavascriptBridge.callHandler("getContacts",callBack);
			return true;
		}
		return false;
	}
	/**
	 * 联合登录
	 * 原生方法: jointLogin
	 * 参数 type 字符串: type=wx表示调用微信登录，type=qq表示调用qq登录
	 * 参数 callBack 方法: 回传参数 param 对象：{jointToken:'登录获取的token'} 
	 */
	window.nativeJointLogin = function(type,callBack){
		//安卓
		if(window.mobile &&
			window.mobile.jointLogin instanceof Function) {
			var fucId = uuid();
			window.androidCallBacks[fucId] = function(data) {
				callBack(data);
			}
			window.mobile.jointLogin(type,"window.androidCallBacks['"+fucId+"']");	
			return true;
		}
		//IOS
		if(window.WebViewJavascriptBridge){
			WebViewJavascriptBridge.callHandler("jointLogin",type,callBack);
			return true;
		}
		return false;
	}
	/**
	 * 触发分享
	 * @param {Object} param {'title':'测试分享的标题','content':'测试分享的内容','url':'http://www.baidu.com'};
	 * @param {Object} callBack 回调方法 回传参数 param{status:0}status=0用户取消，1成功，-1失败
	 * 原生方法openShare
	 */
	window.nativeOpenShare = function(param,callBack){
		//安卓
		if(window.mobile &&
			window.mobile.openShare instanceof Function) {
			var fucId = uuid();
			window.androidCallBacks[fucId] = function(data) {
				callBack(data);
			}
			window.mobile.openShare(JSON.stringify(param),"window.androidCallBacks['"+fucId+"']");	
			return true;
		}
		//IOS
		if(window.WebViewJavascriptBridge){
			WebViewJavascriptBridge.callHandler("openShare",param,callBack);
			return true;
		}
		return false;
	}
	/**
	 * 注册返回事件处理方法
	 * 原生方法名称 registBackFunc
	 * 原生需要注意的是设置一个标志，每次新开页面标志设为false，如果我注册了返回方法，标志设为true
	 * 再点击返回时，如果标志为true，安卓调用 app.onNativeBack(),IOS调用注册好的onNativeBack
	 * 
	 */
	window.nativeRegistBackFunc = function(){
		//安卓
		if(window.mobile &&
			window.mobile.registBackFunc instanceof Function) {
			window.mobile.registBackFunc();	
			return true;
		}
		//IOS
		if(window.WebViewJavascriptBridge){
			bridge.registerHandler("onNativeBack",function(){
				app.onNativeBack();
			});
			WebViewJavascriptBridge.callHandler("registBackFunc");
			return true;
		}
		return false;
	}
	/**
	 * 注册右侧分享按钮
	 * 原生方法：registShareBtn
	 * 参数：param 对象:{'title':'测试分享的标题','content':'测试分享的内容','url':'http://www.baidu.com'};
	 * 需要注意的是 每次打开新页面都需隐藏分享按钮，如果注册了再显示
	 */
	window.nativeRegistShareBtn = function(param){
		//安卓
		if(window.mobile &&
			window.mobile.registShareBtn instanceof Function) {
			window.mobile.registShareBtn(JSON.stringify(param));	
			return true;
		}
		//IOS
		if(window.WebViewJavascriptBridge){
			WebViewJavascriptBridge.callHandler("registShareBtn",param);
			return true;
		}
		return false;
	}
})();