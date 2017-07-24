//我的收藏
define(["base/baseApp", "refresher", "animate", "./base/basePage", "swipe"],
	function(app, refresher, animate, page, swipe) {
		//变量定义
		app.mySwiper = null;
			
		//变量定义结束
		app.tab = new auiTab({
			element: document.getElementById("tab"),
			index: 1
		}, function(ret) {
			app.mySwiper.slideTo(ret.index-1,200,function(){
				
			});
		});
		
		
		//初始化下拉刷新
		function initRefresh() {
			app.pageRefresher = refresher.initDropload("#wrapper",
				function(me) {
					me.resetload();
				},
				function(me) {
					me.resetload();
				});
		}
		
		app.initPage = function() {
			this.template = this.getTempBySelector("#orderTemplate");
			this.productItem = this.getTempBySelector("#produtsTemplate");
			var h = $(window).height() - $("#tab").height();
			$("#list").css("width", $(window).width() + "px");
			$("#list").css("min-height", h + "px");
			$(".swiper-container").css("min-height",h+"px");
			$("#wrapper").css("height", h + "px");
			$("#wrapper").css("overflow", "scroll");
		};
		app.init = function(){
			app.mySwiper = new Swiper('.swiper-container', {
				loop: false,
				initialSlide:0,
				touchRatio:0
			});
			initRefresh();
		};
		return app;
	});