//浏览历史
define(["./base/baseApp", "refresher"], function(app, refresher) {
	//变量定义
	var msgId = app.UrlParams.id;
	//变量定义结束
	if(!app.checkLogin()) {
		app.toLoginPage(location.href);
		return;
	}
	//初始化
	app.init = function() {
		loadMsg();
	};
	//显示消息
	function showMsg(data) {
		var title = data.title;
		app.changeDOCTitle(title);
		var time = data.createtime;
		$("#time").text(time);
		$("#msg").text(data.content);
	}
	

	function loadMsg() {
		app.POSTRequest("weixin/mall/notice/detail.do", {
			data: {
				noticeId: msgId
			},
			success: function(data) {
				if(data.resultCode == 1) {
					showMsg(data.resultObj);
					setRead();
				} else {
					app.tipInfo(data.resultMsg);
				}
			}
		})
	}
	
	function setRead() {
		app.POSTRequest("weixin/mall/notice/read.do", {
			data: {
				noticeId: msgId
			},
			success: function(data) {
				if(data.resultCode == 1) {
				} else {
					app.tipInfo(data.resultMsg);
				}
			}
		})
	}
	
	
	return app;
});