//浏览历史
define(["./base/baseApp"], function(app) {
	//定义变量
	var informationId = app.UrlParams.id; //活动id
	//定义变量 end

	/**
	 * 加载活动信息
	 */
	function loadInformation() {
		app.POSTRequest("weixin/mall/informations/queryInformationDetail.do", {
			data: {
				id: informationId
			},
			success: function(data) {
				if(data.resultCode == 1) {
					showAct(data.resultObj);
				} else {
					app.tipInfo(data.resultMsg);
				}
			}
		})
	}

	function showAct(data) {
		$("#box").show();
		$("#title").text(data.title);
		$("#content").html(data.content);
		$("#content img").css({"width":"100%","display":"block"});
	}
	app.init = function() {
		loadInformation();
	};
	return app;
});