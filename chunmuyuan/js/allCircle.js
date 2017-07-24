define(["base/baseApp", "refresher", "animate", "./base/basePage"], 
		function(app, refresher, animate, page){
	
	var cid;
	//绘制信息
	app.addList = function(data) {
		console.log(data)
		if(page.pageIndex == 1) {
			$("#list").empty();
		}
		for(var i = 0; i < data.length; i++) {
			$("#list").append(this.template(data[i]));
			if(data[i].isPart==1){
				$("#list li").eq(i).find(".joins").hide();
			}		
		}
		if(!page.data || page.data.length == 0) {
			app.emptyList("#list");
		}
		
	};
	
	//初始化下拉刷新
	function initRefresh() {
		app.pageRefresher = refresher.initDropload("#wrapper", function(me) {
			page.reset();
			me.noData(false);
			loadData();
		}, function(me) {
			if(page.hasNextPage) {
				loadData(cid);
			} else {
				me.noData();
				me.resetload();
			}
		});
	}
	
	//加载圈子数据
	function loadData(cid) {
		var data = {
			loginedtoken:localStorage.loginedToken,
			beginPage: page.pageIndex,
			pageSize: page.pageSize
		};
		app.POSTRequest_m("member/circle/listCircle.do", {
			data:data,
			success: function(data) {
				app.pageRefresher.resetload();
				if(data.resultCode === "1") {
					page.hasNextPage = data.basePageObj.hasNextPage;
					page.addData(data.basePageObj.dataList); //往page添加数据
					app.addList(data.basePageObj.dataList);
					page.pageIndex++;
				} else if(data.resultCode === "-1") {
					app.toLoginPage(location.href);
				} else {
					app.tipInfo(data.resultMsg);
				}
			},
			error: function() {
				app.pageRefresher.resetload();
			}
		});

	}
	
	
	

	
	
	
	//初始化页面
	app.initPage = function() {
		this.template = this.getTempBySelector("#itemtemp");
		var h = $(window).height() - $("header").height();
		$("#list").css("min-height", h + "px");
		$("#wrapper").css("height", h + "px");
		$("#wrapper").css("overflow", "scroll");
	};
	

	
	//开始执行
	app.init = function() {
		initRefresh();
		loadData();
	};
	
	return app;
})
