//浏览历史
define(["./base/baseApp", "refresher","swipe"], function(app, refresher,swipe) {
	//变量定义
	app.listItemTemp = app.getTempBySelector("#listItemTemp"); //模板
	app.pageIndex = 1;
	app.pageSize = 10;
	app.hasNextPage = true;
	
	//变量定义结束

	//初始化
	app.init = function() {
		initRefresh(); //初始化懒加载组件
		loadData();
		loadAd();
		$(".swiper-container").css({
			height:$(window).width()/3*2+"px"
		})
		
	};
	
	function initSwiper() {
		app.mySwiper = new Swiper('.swiper-container', {
			initialSlide: 0,
			autoplay:3000,
			loop:true
		});
	}
	/**
	 * 加载广告轮播
	 */
	function loadAd(){
		app.POSTRequest("weixin/mall/advertisement/getAdvertisementFormAdpostion.do",{
			data:{
				postion:"APP_INFORMATION_BANNER"
			},
			success:function(data){
				if(data.resultCode == 1){
					showAd(data.dataList);
				}else{
					app.tipInfo(data.resultMsg);
				}
			}
		})
	}
	//显示轮播广告
	function showAd(ary){
		//获取模板
		var temp = app.getTempBySelector("#adtemp");
		//填充数据到页面
		$.each(ary,function(i,item){
			//计算图片全路径
			item.img = app.getImgPath(item.imgpath);
			$(".swiper-wrapper").append(temp(item));
		});
		//初始化轮播组件
		initSwiper();
	}
	
	
	function loadData(){
		app.POSTRequest("weixin/mall/informations/queryInformationList.do",{
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
			item.img = app.getImgPath(item.icon);
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
		app.href("information.html?id="+id);	
	};
	return app;
});