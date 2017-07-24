//选择支付方式-充值卡
define(["./base/baseApp"], function(app) {
	app.init = function() {
		showLogo();
	}

	function showLogo() {
		$("#logo")
			.css("visibility", "visible")
			.animateCss("zoomIn", showCompany);
	}

	function showCompany() {
		$("#company")
			.css("visibility", "visible")
			.animateCss("fadeInLeft", function() {
				var els = $(".texts img");
				showTexts(els);
			});
	}

	function showTexts(els) {
		$.each(els, function(index, el) {
			setTimeout(function(){
				els.eq(index)
				.css("visibility", "visible")
				.animateCss("flipInY");
				if(index==els.length-1){
					showLine();
				}
			},index*200);
		})
	}
	
	function showLine(){
		$("#linehide").animate({"margin-left":"16rem"},500,function(){
			setTimeout(function(){
				app.replace("http://test.springwoods.com/static/appchunmuyuan/index_app.html");
			},500);
		});
	}
	
	return app;
});