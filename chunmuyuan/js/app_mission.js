define(["base/baseApp"],function(app){
	app.init = function(){
		app.POSTRequest_m("member/usertask/myTaskList.do", {
			data:{
                loginedToken: localStorage.loginedToken,
                tasktype:1,
                beginPage:1,
                pageSize:99
			},
			success: function(data) {
				if(data.resultCode === "1") {
				     console.log(data);
				     var kobe = data.basePageObj.dataList;
				     $.each(kobe, function(i,item) {
					    var temp = app.getTempBySelector("#goodsTemp");
					    var $oneTask = $(temp(item));
					    $("#goodsList").append($oneTask);
					    if(item.status == 1){
					    	$oneTask.find(".right_box").text("未完成");
					    	$oneTask.find(".right_box").css({"background-color":"#4ed983","color":"#fff"});  
					    	
					    }else{
					    	$oneTask.find(".right_box").text("已完成").css("color","#ccc");
					    }
				     });
				      $(".right_box").click(function(){
				      	    $("#total").text($(this).attr("data-content"));
				      	    $("#content").text($(this).attr("data-name"));
				      	    app.missionUrl = $(this).attr("data-url");
				      	    app.status = $(this).attr("data-status");
				      	    $("#imgPath").attr("src",app.getImgPath($(this).attr("data-img")));
				      	    var heights = document.body.clientHeight;//可视区域高度
				            var tops = $(document).scrollTop(); //滚动条到顶部的垂直高度
				            $(".strategyPic").css({"margin-top":tops,"height":heights}).show();
							$(".strategyPic").on("touchmove",function(e){
								app.stopBubble(e);
								e.preventDefault();
							});
				        })
				      $(".white").bind('click',function(){
				      	    if(app.status == 1){
				      	    	app.href(app.missionUrl);
				      	    }
				      })
				      $(".strategyPic").click(function(){
				            $(".strategyPic").hide();
				      })
				} else {
					app.tipInfo(data.resultMsg);
				}
			}
		});
	}
	return app;
});