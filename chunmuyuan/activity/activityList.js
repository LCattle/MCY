//浏览历史
define(["./base/baseApp", "refresher"], function(app, refresher) {
	//变量定义
	app.listItemTemp = app.getTempBySelector("#listItemTemp"); //模板
	app.pageIndex = 1;
	app.pageSize = 10;
	app.hasNextPage = true;
	//检查登录
	if(!app.checkLogin()) {
		app.toLoginPage(location.href);
		return;
	}
	//变量定义结束

	//初始化
	app.init = function() {
		initRefresh(); //初始化懒加载组件
		loadData();
	};
	
	function loadData(){
		app.POSTRequest("weixin/mall/offlineactivity/activityLists.do",{
			data:{
				beginPage:app.pageIndex,
				pageSize:app.pageSize
			},
			loading:"加载中...",
			success:function(data){
				console.log(data);
				if(data.resultCode==1){
					app.hasNextPage = data.basePageObj.hasNextPage;
					if(app.pageIndex==1){
						$("#list").empty();
					}
					showData(data.basePageObj.dataList);
					if($("#list .listItem").length==0){
						app.emptyList("#list","没有活动")
					}
					app.pageIndex++;
				}else{
					app.tipInfo(data.resultMsg);
				}
				
				app.pageRefresher.resetload();
				app.pageRefresher.noData(app.hasNextPage);
			},
			error:function(){//保存重置
				app.pageRefresher.resetload();
			}
		});
	}
	
	function resetPageInfo(){
		app.pageIndex = 1;
		app.pageRefresher.noData(false);
		
	}

	app.initPage = function() {
		var h = $(window).height();
		$("#list").css("min-height", h + "px");
		$("#wrapper").css("height", h + "px");
		$("#wrapper").css("overflow", "scroll");
	};

	function showData(data){
		var temp = app.getTempBySelector("#itemtemp")
		$.each(data, function(i,item) {
			item.pic = app.getImgPath(item.activitypic);
			var dateStart = new Date(item.regstarttime.replace(/-/g,"/"));
			var dateEnd = new Date(item.activityendtime.replace(/-/g,"/"));
			var dateNow = new Date();
			if(dateNow.getTime()<dateStart.getTime()){
				item.showNum = false;
			}else{
				item.showNum = true;
			}
			
			//计算活动状态
			if(item.activitystatus==3){
				item.stateFlag = "yijieshu.png";//已结束
			}else if(dateNow.getTime()<dateStart.getTime()){
				item.stateFlag = "weikaishi.png";//未开始
				
			}else if(dateNow.getTime()<dateEnd.getTime()){
				item.stateFlag = "jinxingzhong.png";//进行中
			}else{
				item.stateFlag = "yijieshu.png";//已结束
			}
			//计算显示时间
			item.timeStr =
				dateStart.Format("MM-dd hh:mm");
				item.timeStr += " ~ "+
				dateEnd.Format("MM-dd hh:mm");
			$("#list").append(temp(item));
		});
	}
	
	
	//初始化下拉刷新
	function initRefresh() {
		app.pageRefresher = refresher.initDropload("#wrapper",
			function(me) {
				resetPageInfo();
				loadData();
			},
			function(me) {
				if(app.hasNextPage){
					loadData();
				}else{
					me.resetload();
					me.noData();
				}
				
			});
	}
	app.toDetails = function(id){
		app.href("../activity/activity.html?id="+id);	
	};
	return app;
});