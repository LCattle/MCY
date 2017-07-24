//我的账号，积分，成长值
define(["base/baseApp", "refresher", "animate","./base/basePage"], function(app, refresher, animate,page) {
	var actions = ['integralDetail.do','experienceDetail.do','distributionPoundDetail.do'];
	var titles = ["我的积分","我的成长值","我的账户"];
	var actionObj = [{title:"积分总值","desc":"积分值","unit":"分","icon":"icon-jifen"},
					{title:"我的成长值","desc":"成长值","unit":"点","icon":"icon-"},
					{title:"我的充值记录","desc":"我的充值记录","unit":"点","icon":"icon-"}];
	var actionIndex = 0;
    var dialog = new auiDialog({});
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
        initEvent();
	};
	
	//设置总额
	function setCount(data){
		if(data){
			var count = data.integral;
			if(actionIndex==1){
				count = data.experience;
			}else if(actionIndex ==2){
				count = (data.virtualmoney/1000).toFixed(2);
			}
			$("#countNum").text(count?count:0);
			if(actionIndex == 0){
                var iSize = parseInt(count/10000);
                if(count>=16000){
                	$("#jfdh .card_div").addClass("card_enable");
                	$("#jfdh .card_div[data-value=16000]").addClass("active");
                }else if(count>=10000){
                	$("#jfdh .card_div[data-value=2000]").addClass("card_enable");
                	$("#jfdh .card_div[data-value=4000]").addClass("card_enable");
                	$("#jfdh .card_div[data-value=10000]").addClass("card_enable");
                	$("#jfdh .card_div[data-value=10000]").addClass("active");
                }else if(count>=4000){
                	$("#jfdh .card_div[data-value=2000]").addClass("card_enable");
                	$("#jfdh .card_div[data-value=4000]").addClass("card_enable");
                	$("#jfdh .card_div[data-value=4000]").addClass("active");
                }else if(count>=2000){
                	$("#jfdh .card_div[data-value=2000]").addClass("card_enable");
                	$("#jfdh .card_div[data-value=2000]").addClass("active");
                }
                
                if(count>=2000){
                    $("#tipDetail").text("选择您要兑换的积分数");
                    $("#operate_bar").show();
                } else {
                	$("#tipDetail").text("积分2000起兑哦，赶紧下单买菜赚取积分吧~");
                    $("#red_close_btn").show();
                }
//				if(iSize >= 1){
//              	if(iSize > 4){
//                      $("#jfdh .card_div[data-value=40000]").addClass("active");
//					} else {
//                      $("#jfdh .card_div[data-value="+(iSize*10000)+"]").addClass("active");
//					}
//                  $("#tipDetail").text("选择您要兑换的积分数");
//                  $("#operate_bar").show();
//				} else {
//                  $("#tipDetail").text("积分10000起兑哦，赶紧下单买菜赚取积分吧~");
//                  $("#red_close_btn").show();
//				}
			}
		}
		
	}
	function loadUser() {
		app.getUser(setCount,function(){
			app.toLoginPage(location.href);
		});
	}

	function initEvent(){
		$("#exchange_btn").on("click", function () {
//			$("#jfdh").show();
			app.href("../userCenter/integralExchange.html")
        });
		$("#jfdh .card_div").on("click", function () {
			if($(this).hasClass("card_enable")){
                $("#jfdh .card_div").removeClass("active");
                $(this).addClass("active");
			}
        });
        $("#exchange_confirm").on("click", function () {
        	if($(this).hasClass("query_net")){
				return;
			}
            $(this).addClass("query_net");
			if($("#jfdh .card_div.card_enable").length > 0){
                if($("#jfdh .card_div.card_enable.active").length == 0){
                	app.tipInfo("请选择兑换斤数");
                	return;
				}

                var integral = $("#jfdh .card_div.card_enable.active").data("value");

                app.POSTRequest_m("member/exchange/updateAccountBalance.do", {
                    data:{
                        integral:integral
                    },
                    success: function(data) {
                        $(this).removeClass("query_net");
						console.log(data);
						if(!data){
                            app.tipInfo("积分兑换接口异常");
                            return;
						}
						if(data.resultCode == "1"){
                            dialog.alert({
                                title:"提示",
                                msg: "恭喜您，兑换成功",
                                buttons:['确定']
                            },function (ret) {
                                if(ret.buttonIndex == 1){
                                    app.replace("myIntegral.html?action=0");
                                }
                            });
						} else {
                            app.tipInfo(data.resultMsg);
						}
                    },
					error:function () {
                        $(this).removeClass("query_net");
                    }
                });
			} else {
                app.tipInfo("您的积分不足1万，不能兑换");
			}
		});
        $("#exchange_cancel").on("click", function () {
            $("#jfdh").hide();
        });
        $("#red_close_btn").on("click", function () {
            $("#jfdh").hide();
        });
	}
	return app;
});