//我的账号，积分，成长值
define(["base/baseApp", "refresher", "animate","./base/basePage"], function(app, refresher, animate,page) {
	var actions = ['integralDetail.do','experienceDetail.do','cashMoneyDetail.do'];
	var titles = ["我的积分","我的成长值","我的账户"];
	var actionObj = [{title:"积分总值","desc":"积分值","unit":"分","icon":"icon-jifen"},
					{title:"我的成长值","desc":"成长值","unit":"点","icon":"icon-"},
					{title:"我的充值记录","desc":"我的充值记录","unit":"点","icon":"icon-"}];
	var actionIndex = 0;
	app.addList = function(data) {
		if(page.pageIndex==1){
			$("#listbox").empty();
		}
		for(var i = 0; i < data.length; i++) {
			$("#listbox").append(this.template(data[i]));
		}
	};
	//加载数据的方法
	function loadData(){
		app.POSTRequest_m("member/account/"+actions[actionIndex], {
			data:{
				beginPage:page.pageIndex,
				pageSize:page.pageSize
			},
			success: function(data) {
				app.pageRefresher.resetload();
				if(data.resultCode === "1") {
					if(data.basePageObj){
						page.hasNextPage = data.basePageObj.hasNextPage;
						page.addData(data.basePageObj.dataList);//往page添加数据
						app.addList(data.basePageObj.dataList);//会掉
						page.pageIndex++;
					}else{
						page.hasNextPage = false;
						page.addData([]);//往page添加数据
						app.addList([]);//会掉
					}
					
				} else if(data.resultCode === "-1"){
					app.toLoginPage(location.href);
				}else{
					app.tipInfo(data.resultMsg);
				}
			},
			error:function(){
				app.pageRefresher.resetload();
			}
		});
	}

	//初始化下拉刷新
	function initRefresh() {
		app.pageRefresher = refresher.initDropload("#wrapper", function(me) {
			page.reset();
			loadUser();
			loadData();
		}, function(me) {
			if(page.hasNextPage){
				loadData();
			}else{
				me.noData();
				me.resetload();
			}
		});
	};
	app.initPage = function() {
		var h = $(window).height() - $("header").height();
		$("#list").css("min-height", h + "px");
		$("#wrapper").css("height", h + "px");
		$("#wrapper").css("overflow", "scroll");
	};
	//开始执行
	app.init = function() {
		actionIndex = app.UrlParams.action;
		actionIndex = actionIndex?actionIndex:0;
		app.actionObj = actionObj[actionIndex];
		for(var i=0;i<3;i++){
			if(actionIndex!=i){
				$("#ac_"+(i+1)).remove();
			}else{
				this.template = this.getTempBySelector("#ac_t_"+(i+1));
				$("#ac_"+(i+1)).show();
			}
		}
		app.changeDOCTitle(titles[actionIndex]);
//		setCount(this.getLocalObject("userInfo"));
		initRefresh();
		loadUser();
		loadData();
	};
	
	app.kgAccount=function(){
		location.href = "../html/kgAccount.html?action=2";
	}
	
	
	//设置总额
	function setCount(data){
		if(data){
			var count = data.integral;
			if(actionIndex==1){
				count = data.experience;
			}else if(actionIndex ==2){
				count = data.cashMoney;
			}
			$("#countNum").text(count?count:0);
		}
		
	}
	function loadUser() {
		app.getUser(setCount,function(){
			app.toLoginPage(location.href);
		});
	}
	return app;
});