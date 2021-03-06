define(["https://res.wx.qq.com/open/js/jweixin-1.1.0.js"], function(wx) {
	var wxconfig = {
		appid: "wx1b59d9abab8caa33",
		authorzationurl: "https://open.weixin.qq.com/connect/oauth2/authorize",
		wxauthorization: function(rurl) {
			var url = this.authorzationurl +
				'?appid=' + this.appid +
				'&redirect_uri=' + encodeURIComponent(rurl) +
				'&response_type=code&scope=snsapi_base&state=123#wechat_redirect';
			location.replace(url);
		},
		//获取微信对象
		getWxObj: function() {
			return wx;
		},
		//获取js-sdk授权签名
		getJS_SDK : function() {
			app.POSTRequest_i("infrastructure/wx/mp/getJSSDKConfig.do", {
				data: {
					url: encodeURIComponent(location.href)
				},
				success: function(data) {
					if(data.resultCode == 1)
						wxconfig.JsSDKConfig(data.resultObj);
				}
			});
		},
		//js-所需的功能列表 支付，选择图片
		jsApiList: ["chooseWXPay", "chooseImage", "uploadImage", "getNetworkType", "scanQRCode"],
		//js-sdk配置数据
		JsSDKConfig: function(data) {
			var config = {
				debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
				appId: wxconfig.appid, // 必填，公众号的唯一标识
				timestamp: data.timestamp, // 必填，生成签名的时间戳
				nonceStr: data.noncestr, // 必填，生成签名的随机串
				signature: data.signature, // 必填，签名，见附录1
				jsApiList: wxconfig.jsApiList // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
			}
			wx.config(config);
		}
	}
	return wxconfig;
});