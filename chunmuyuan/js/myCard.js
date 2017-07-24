define(["base/baseApp", "refresher", "animate", "./base/basePage","swipe"], 
	function(app, refresher, animate, page,swipe){
		
	app.addList = function(data) {
		console.log(data)
		if(page.pageIndex == 1) {
			$("#list").empty();
		}
		for(var i = 0; i < data.length; i++) {
			reGeshi(data[i]);
			$("#list").append(this.template(data[i]));
		}
		if(!page.data || page.data.length == 0) {
			app.emptyList("#list");
		}
		var temp1 = app.getTempBySelector("#picTemp");
		var temp2 = app.getTempBySelector("#allTemp");
		$.each(data,function(i,item){
			var piclist=item.pmms;
			var el;
			if(piclist.length > 0){
				var picurls = Array();
				$.each(piclist,function(i,item1){
					 picurls.push(item1.path);
				});
				item.picurls = picurls.join(',');
				$.each(piclist,function(i,item1){
					var tmpItem = item1;
					console.log(tmpItem)
					tmpItem.getHeight = function(index) {
						if(this.imgs.length > index) {
							return this.height;
						}
						return 0;
					}
					tmpItem.getImgPath = function(index) {
						if(this.imgs.length > index) {
							var path = null;
							if(item.creatname){
								path = app.getImgPath(this.imgs[index]).replace('/image/thumb/', '/')
							}else{
								path = app.getImgPath(this.imgs[index]).replace('/image/', '/')
							}
							return path;
						}
						return '';
					}
					//计算图片高度
					tmpItem.height = ($(window).width() - app.REM2PX(4.8)) / 3;
					tmpItem.imgs = item.picurls.split(",");
					if(tmpItem.imgs.length==1){
						if(!tmpItem.imgs[0]){
							tmpItem.imgs = [];
						}
					}
					el = $(temp1(tmpItem));
					el.find(".imgbox").click(function() {
						var index = $(this).attr("index");
						var id = $(this).attr("comid");
						var comms = piclist;
						for(var i=0;i<comms.length;i++){
							var selectItem = comms[i];
							if(selectItem.id == id){
								app.openSwipe(index,selectItem );
								return
							}
						}
					});
				});
				$(".piclist_"+item.id).append(el);
			}
			
			var pcms=item.pcms;

			$.each(pcms, function(i,item2) {
				var obj = $("#list");
				obj.find(".comlist_"+item.id).append(temp2(item2));
				diguiComment(item2.children, temp2, item.id, obj);
			});
			
			$(".comlist_" + item.id).find("li").eq(1).nextAll().hide();
			
			var likes=item.isLike;
			if(likes>0){
				$("#praise_"+item.id).css("color","#fc9304")
			}
			
			if($("#likes_"+item.id).html()>99){
				$("#likes_"+item.id).html("+99")
			}
			
			if(item.creatname != ""){
				var spanLength=$("#contents_" + item.id+" span");
				var contentAll=[];
				var spanContent;
				spanLength.each(function(i,item){
					var spanContent= $(item).html();
					contentAll.push(spanContent);
				})
				$("#contents_" + item.id).html(contentAll).find("img").remove();
			}
		});
		
	};
	
	
	app.addComment = function(data) {
		console.log(data)
		if(page.pageIndex == 1) {
			$("#list-comment").empty();
		}
		for(var i = 0; i < data.length; i++) {
			reGeshi(data[i]);
			$("#list-comment").append(this.template(data[i]));
		}
		if(!page.data || page.data.length == 0) {
			app.emptyList("#list-comment");
		}
		
		var h = $(window).height() - $("#tab").height();
			var nowh = $("#list" + app.selectedState).height();
		
		var temp1 = app.getTempBySelector("#picTemp");
		var temp2 = app.getTempBySelector("#allTemp");
		$.each(data,function(i,item){
			var piclist=item.pmms;
			var el;
			if(piclist.length > 0){
				var picurls = Array();
				$.each(piclist,function(i,item1){
					 picurls.push(item1.path);
				});
				item.picurls = picurls.join(',');
				$.each(piclist,function(i,item1){
					var tmpItem = item1;
					console.log(tmpItem)
					tmpItem.getHeight = function(index) {
						if(this.imgs.length > index) {
							return this.height;
						}
						return 0;
					}
					tmpItem.getImgPath = function(index) {
						if(this.imgs.length > index) {
							var path = null;
							if(item.creatname){
								path = app.getImgPath(this.imgs[index]).replace('/image/thumb/', '/')
							}else{
								path = app.getImgPath(this.imgs[index]).replace('/image/', '/')
							}
							return path;
						}
						return '';
					}
					//计算图片高度
					tmpItem.height = ($(window).width() - app.REM2PX(4.8)) / 3;
					tmpItem.imgs = item.picurls.split(",");
					if(tmpItem.imgs.length==1){
						if(!tmpItem.imgs[0]){
							tmpItem.imgs = [];
						}
					}
					el = $(temp1(tmpItem));
					el.find(".imgbox").click(function() {
						var index = $(this).attr("index");
						var id = $(this).attr("comid");
						var comms = piclist;
						for(var i=0;i<comms.length;i++){
							var selectItem = comms[i];
							if(selectItem.id == id){
								app.openSwipe(index,selectItem );
								return
							}
						}
					});
				});
				$(".piclist_"+item.id).append(el);
			}
			
			var pcms=item.pcms;

			$.each(pcms, function(i,item2) {
				var obj = $("#list-comment");
				obj.find(".comlist_"+item.id).append(temp2(item2));
				diguiComment(item2.children, temp2, item.id, obj);
			});
			
			$(".comlist_" + item.id).find("li").eq(1).nextAll().hide();
			
			var likes=item.isLike;
			if(likes>0){
				$("#praise_"+item.id).css("color","#fc9304")
			}
			
			if($("#likes_"+item.id).html()>99){
				$("#likes_"+item.id).html("+99")
			}
			
			if(item.creatname != ""){
				var spanLength=$("#contents_" + item.id+" span");
				var contentAll=[];
				var spanContent;
				spanLength.each(function(i,item){
					var spanContent= $(item).html();
					contentAll.push(spanContent);
				})
				$("#contents_" + item.id).html(contentAll).find("img").remove();
			}
		});
		
	};
	
	
	
	
	function diguiComment(children, temp, itemId, obj){
		if(undefined != children && children.length>0){
			$.each(children, function(idx,item){
				obj.find(".comlist_"+itemId).append(temp(item));
				diguiComment(item.children, temp, itemId, obj);
			});
		}
	}
	
	
	//格式
	function reGeshi(data){
		var content = data.content;
		//data.content = content.replaceAll("\n","<br>");
		data.content = content.replace(/(\r\n)|(\n)/g, "<br/>");
		return data;
	}
	
	
	
	
	/**
	 * 初始化查看大图主键
	 */
	function initSwiper(index) {
		//alert(123);
		app.mySwiper = new Swiper('.swiper-container', {
			initialSlide: index,
			onTransitionEnd: function(swiper) {
				//alert(111);
				if(app.mySwiper)
					setPicNumber();
			},
			onInit: function(swiper) {
				//alert(22);
				app.mySwiper = swiper;
				setPicNumber();
			}
		});
	}

	function setPicNumber() {
		//alert(4);
		var index = app.mySwiper.realIndex + 1;
		var total = $(".swiper-wrapper .swiper-slide").length;
		if(total <= 0) { //如果没有就关闭大图显示
			app.closeSwipe();
		}
		$(".numbers").text(index + "/" + total);
	};
	/**
	 * 关闭大图
	 */
	app.closeSwipe = function() {
		$(".dlg_bg").hide();
		$("#picshowpanel").hide();
	};
	/**
	 * 显示大图
	 */
	app.openSwipe = function(index, item) {
		
		if(app.mySwiper) {
			app.mySwiper.removeAllSlides();
			app.mySwiper.destroy(true, true);
			$(".swiper-container").css({
				height: "100%"
			})
			$(".swiper-wrapper").html('');
		}
		var bigimgteamp = app.getTempBySelector("#bigimgtemp");
		//item.imgs=item.picurls.split(",");
		console.log(item);
		for(var i = 0; i < item.imgs.length; i++) {
			$(".swiper-wrapper").append(bigimgteamp({
				url: item.getImgPath(i)
			}));
		}
		$(".dlg_bg").show();
		$("#picshowpanel").show();
		$(".numbers").text((index) + "/" + item.imgs.length);
		initSwiper(index - 1);
	};

	
	
	
	
	
	
	
	
	
	//帖子跳到详情页
	
	app.tieDetail=function(id_value,names){
		if(names != ""){
			location.href = "../html/tieDetails.html?id=" + id_value+"&vals="+0;
		}else{
			location.href = "../html/tieDetailsUser.html?id=" + id_value+"&vals="+0;
		}
		//location.href = "../html/tieDetails.html?id=" + id_value+"&vals="+0;
	}
	
	
	/**
	 * 点击评论显示评论输入框
	*/
	app.showComment = function(pid, pcid) {
			$("#pcid_" + pid).val(pcid);
			$(".shuru").hide();
			$("#send_" + pid).attr("disabled",false)
			if(pcid == 0) {
				$(".shuru_" + pid).show().find('.cont').focus().attr("placeholder", "");
			} else {
				var names = $("#li_" + pcid).find(".nicknames").html()
				$(".shuru_" + pid).show().find('.cont').focus().attr("placeholder", "@" + names);
			}
			$("#footer").hide();
			$(".shuru .cont").blur(function() {
				if($("#content_" + pid).val() == "") {
					$(".shuru_" + pid).hide();
					$("#footer").show();
				}

			});

		}
	
	/**
	点赞
	id 为帖子的id
	*/
	app.dianzan = function(id){
		var data = {
			loginedtoken:localStorage.loginedToken,
			id:id,
			status:2
		};
		app.POSTRequest_m("member/tie/likesAndKeeps.do", {
				data: data,
				success: function(data) {
					if(data.resultCode == 1) {
						var num = Number($("#likes_"+id).html());
						$("#likes_"+id).html(++num);
						$("#praise_"+id).css("color","#fc9304");
					} else {
						app.tipInfo(data.resultMsg);
					}
					
				}
		});
		
	}
	
	
	
	/**
	 * 发送评论
	 */
	app.saveComment = function(id_value){
		var temp = app.getTempBySelector("#allTemp");
		var content = $("#content_" + id_value).val().replace(/([\ud800-\udbff][\u0000-\uffff])/g, '').trim();
		var pcid = $("#pcid_"+id_value).val();
		$("#send_" + id_value).attr("disabled",true)
		if(content.length > 0 && content.length < 1) {
			app.tipInfo("帖子评论要多于1个字哦");
			$("#send_" + id_value).attr("disabled",false)
			return;
		}
		var data = {
			loginedtoken:localStorage.loginedToken,
			pid:id_value,
			content:content,
			postcommentsource:'app',
			pcid:pcid
		};
		app.POSTRequest_m("member/tiecomment/saveTieComment.do", {
				data: data,
				success: function(data) {
					console.log(data)
					if(data.resultCode == 1) {
						$("#send_" + id_value).attr("disabled",true)
						var res = data.resultObj;
						var str = '<li pid="'+res.id+'" id="li_'+res.id+'" onclick="app.showComment('+res.pid+', '+res.id+')" style="font-size: 0.75rem;">';
						if(res.pcid == 0){
							str += '<div class="comments-content" style="color: #949494;">';
							str += '<span class="nicknames" style="color: #333333;" >' + (res.username == "" ?res.mobile:res.username) + '</span>：';
							str += '<span>' + res.content + '</span><div>';
						}else{
							str += '<div style="color: #949494;">';
							str += '<span class="nicknames" style="color: #333333;">' +(res.username == "" ?res.mobile:res.username) + '</span>回复<span class="next_nicknames" style="color: #333333;">' + res.replyname + '</span>:'
							str += '<span class="comment_p" >' + res.content + '</span></div>';
						}
						str += 	'</li>';
						console.log(str);
						if(res.pcid == 0){
							$('.comlist_'+res.pid).append(str);
						}else{
							$('#li_'+ res.pcid).append(str);
						}
						
						if($("#send_"+id_value).attr("send_ms") == 0){
							app.ckreplay("#replaybtn_"+res.pid,res.pid);
							$("#send_"+id_value).attr("send_ms","1")
						}
						$(".comlist_"+id_value).css("display","block");
						$("#content_"+id_value).val('');
						$(".shuru_"+id_value).hide();
						//$("#footer").show();
						var num = Number($("#comments_"+id_value).html());
						++num;
						$("#comments_"+id_value).html(num);
						$("#comments1_"+id_value).html(num);
					} else {
						app.tipInfo(data.resultMsg);
					}
				},
				error: function() {
					$("#send_" + id_value).attr("disabled",false)
				}
		});
	}
	
	//初始化下拉刷新
	function initRefresh() {
		app.pageRefresher = refresher.initDropload("#wrapper", function(me) {
			$('#wrapper1').unbind();//解绑函数
			page.reset();
			me.noData(false);
			loadDataTie();
		}, function(me) {
			if(page.hasNextPage) {
				loadDataTie();
			} else {
				me.noData();
				me.resetload();
			}
		});
		//app.pageRefresher._threshold = 300;
	}
	
	function initRefresh1() {
		app.pageRefresher1 = refresher.initDropload("#wrapper1", function(me) {
			page.reset();
			me.noData(false);
			replyTieList();
		}, function(me) {
			if(page.hasNextPage) {
				replyTieList();
			} else {
				me.noData();
				me.resetload();
			}
		});
		
	}
	
	
	//初始化页面
	app.initPage = function() {
		this.template = this.getTempBySelector("#itemtemp");
		var h = $(window).height() - $("#tab").height();
		$("#list").css("min-height", h + "px");
		$("#wrapper").css("height", h + "px");
		$("#wrapper").css("overflow", "scroll");
		$("#list-comment").css("min-height", h + "px");
		$("#wrapper1").css("height", h + "px");
		$("#wrapper1").css("overflow", "scroll");
	};

	
	//我发布的帖子
	function loadDataTie(){
		var data = {
			loginedtoken:localStorage.loginedToken,
			beginPage: page.pageIndex,
			pageSize: 5,
			cid:0
		};
		
		app.POSTRequest_m("member/tie/myTieList.do", {
				data: data,
				success: function(data) {
					app.pageRefresher.resetload();
					if(data.resultCode === "1") {
						page.hasNextPage = data.basePageObj.hasNextPage;
						page.addData(data.basePageObj.dataList); //往page添加数据
						app.addList(data.basePageObj.dataList);
						page.pageIndex++;
					}else{
						app.tipInfo(data.resultMsg);
					}
				},
				error: function() {
					app.pageRefresher.resetload();
				}
		});
	}
	
	//我评论过的帖子
	
	function replyTieList(){
		var data = {
			loginedtoken:localStorage.loginedToken,
			beginPage: page.pageIndex,
			pageSize: 5,
			_lk_status: 4,
			cid:0
		};
		
		app.POSTRequest_m("member/tie/replyTieList.do", {
				data: data,
				success: function(data) {
					app.pageRefresher1.resetload();
					if(data.resultCode === "1") {
						page.hasNextPage = data.basePageObj.hasNextPage;
						page.addData(data.basePageObj.dataList); //往page添加数据
						app.addComment(data.basePageObj.dataList);
						page.pageIndex++;
					}else{
						app.tipInfo(data.resultMsg);
					}
				},
				error: function() {
					app.pageRefresher1.resetload();
				}
		});
	}
	
	
	
	
	

	//开始执行
	app.init = function() {
		initRefresh();
		loadDataTie();
		//initRefresh1()
	};
	
	
	
	
	//帖子切换
        var tab = new auiTab({
        element:document.getElementById("tab"),
        index:1,
        repeatClick:false
	    },function(ret){
	    	console.log(ret)
	        if(ret.index == 1) {
	        	$('#wrapper1').unbind();//解绑函数
				$(".myComment").hide();
				$(".publish").show();
				page.pageIndex = 1;
				$("#list-comment").empty();
				$("#wrapper1").find(".dropload-down").remove();
				$(".aui-tab-item").unbind('click');
				loadDataTie();
			} else if(ret.index == 2){
				//$('#wrapper').unbind();//解绑函数
				$(".myComment").show();
				$(".publish").hide();
				$("#list").empty();
				initRefresh1();
				page.pageIndex = 1;
				replyTieList();
			}
	    });
	
	
	
	
	
	/**
	查看全部回复 id帖子的ID
	*/
	
	app.ckreplay =function(val, id){
		if($(val).attr("data") == 0){
			$('.comlist_'+id).empty();
			var data = {
				pid:id,
				pageSize:1000,
				beginPage:1
			};
			app.POSTRequest_m("member/tiecomment/listTieComment.do", {
				data: data,
				success: function(data) {
					if(data.resultCode == 1) {
						var temp2 = app.getTempBySelector("#allTemp");
						$.each(data.basePageObj.dataList, function(i,item) {
							$(".comlist_"+item.pid).append(temp2(item));
							var obj = $("#tz_"+id).parent();
							console.log(obj)
							diguiComment(item.children, temp2, item.pid,obj);
						});
					} else {
						app.tipInfo(data.resultMsg);
					}	
				}
			});

			$(val).siblings().find("li").eq(1).nextAll().show();
			$(val).html("收起").attr("data","1");
		}else if($(val).attr("data") == 1){
			$(val).siblings().find("li").eq(1).nextAll().hide();
			$(val).show();
			var comments = $('#comments_'+id).html();
			$(val).html("查看全部<span id='comments1_"+id+"'>"+comments+"</span>条回复").attr("data","0");
			$("#send_"+id).attr("send_ms","0")
		}
	}
	
	//	分享
		app.shares = function(id,names){
			var contents=$("#contents_"+id).text().trim();
			if(contents.length > 80){
				contents=contents.substring(0,80)+"...";
			}
			
			if(names != ""){
				nativeOpenShare({
				content: contents,
				title: $("#tiltle_"+id).text().trim(),
				url: "http://"+location.host+"/static/appchunmuyuan/html/tieDetails.html?id=" + id+"&vals="+"0"
				},function(data){
					var obj=JSON.parse(data)
					if(obj.status == 1 ){
						fxtie(id);
					}else if(obj.status == 0){
						app.tipInfo("分享取消！");
					}else{
						app.tipInfo("分享失败！");
					}
				});
			}else{
				nativeOpenShare({
				content: contents,
				title: $("#tiltle_"+id).text().trim(),
				url: "http://"+location.host+"/static/appchunmuyuan/html/tieDetailsUser.html?id="+id+"&vals="+"0"
				},function(data){
					//alert(data);
					var obj=JSON.parse(data)
					if(obj.status == 1 ){
						fxtie(id);
					}else if(obj.status == 0){
						app.tipInfo("分享取消！");
					}else{
						app.tipInfo("分享失败！");
					}
				});
				
			}
		}
	
		
		function fxtie(id) {
			app.POSTRequest_m("member/tie/likesAndKeeps.do", {
				data: {
					loginedtoken: localStorage.loginedToken,
					id: id,
					status: 5
				},
				success: function(data) {
					if(data.resultCode == 1) {
						var nums = Number($("#shares_" + id).html());
						$("#shares_" + id).html(++nums);
						app.tipInfo("分享成功");
					}
				}
			});
		}


	//举报
	app.saveJubaoTie = function(){
		var data = {
			id:$('#jubaoVal').val(),
			loginedtoken:localStorage.loginedToken,
		}
		app.POSTRequest_m("member/tie/tipTie.do", {
				data: data,
				success: function(data) {
					if(data.resultCode == 1) {
						$('#jubaoVal').val('');
						$(".masking-in").removeClass("masking-in").addClass("masking");
    					$("#report_j").hide();
    					$("#publishTie").show()
						app.tipInfo(data.resultMsg);
					} else {
						//app.tipInfo(data.resultMsg);
					}
					
				}
		});
	}

	   app.shows=function(id){
	   	$('#jubaoVal').val(id)
	  	$(".masking").removeClass("masking").addClass("masking-in");
	  	$("#report_j").show();
	  	$("#publishTie").hide()
	    }
    
	    app.qx_remove=function(){
	    	$(".masking-in").removeClass("masking-in").addClass("masking");
	    	$("#report_j").hide();
	    	$("#publishTie").show()
	    }
	
		app.masking=function(){
			$(".masking-in").removeClass("masking-in").addClass("masking");
	    	$("#report_j").hide();
	    	$("#publishTie").show()
		}
	
	
	
	
	
	
	
	
	
	
	
	return app;
})