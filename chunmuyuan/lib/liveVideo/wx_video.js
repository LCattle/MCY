define(["../../js/base/baseApp", "../../js/base/wxconfig"], function(app, wxconfig) {
	var wx = wxconfig.getWxObj();

	wxconfig.getJS_SDK();
	//微信授权成功
	wx.ready(function() {
		//检查网络情况
		wx.getNetworkType({
			success: function(res) {
				var networkType = res.networkType; // 返回网络类型2g，3g，4g，wifi
			}
		});
	});
});