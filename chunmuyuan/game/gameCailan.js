//我的收藏
define(["base/baseApp", "refresher", "swipe"],
	function(app, refresher, animate, page, swipe) {
		//变量定义
		app.mySwiper = null;

		//变量定义结束
		app.tab = new auiTab({
			element: document.getElementById("tab"),
			index: 1
		}, function(ret) {
			app.mySwiper.slideTo(ret.index - 1, 200, function() {

			});
			if(ret.index == 1) {
				app.showEdit();
			} else {
				app.hideEdit();
			}
		});

		//隐藏编辑状态
		app.hideEdit = function() {
			$("#editBtn").text("编辑");
			$(".listItem").css("padding-left", "0.75rem");
			$("#footer").hide();
			$("#wrapper").css("height", app.listH + "px");
			$(".checkBtn").removeClass("active");
		};
		//显示编辑状态
		app.showEdit = function() {
			$("#editBtn").text("取消");
			$(".listItem").css("padding-left", "0.25rem");
			$("#wrapper").css("height", (app.listH - app.footerH) + "px");
			$("#footer").show();

		};

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
			var winH = $(window).height();
			var headH = $("#tab").height();
			app.footerH = $("#footer").height();
			var h = winH - headH;
			app.listH = h;
			$("#list").css("width", $(window).width() + "px");
			$("#list").css("min-height", h + "px");
			$(".swiper-container").css("min-height", h + "px");
			$("#wrapper").css("height", h + "px");
			$("#wrapper").css("overflow", "scroll");
		};
		app.init = function() {
			app.mySwiper = new Swiper('.swiper-container', {
				loop: false,
				initialSlide: 0,
				touchRatio: 0
			});
//			initRefresh();
		};
		return app;
	});