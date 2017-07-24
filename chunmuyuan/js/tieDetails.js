define(["base/baseApp", "refresher", "animate", "./base/basePage","swipe"], 
	function(app, refresher, animate, page,swipe){
	
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
		$("#send_" + id_value).attr("disabled",true)
		if(content.length > 0 && content.length < 1) {
			app.tipInfo("帖子评论要多于1个字哦");
			$("#send_" + id_value).attr("disabled",false)
			return;
		}
		var pcid = $("#pcid_"+id_value).val();
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
						
						if($(".send_p").attr("send_ms") == 0){
							app.ckreplay("#replaybtn_"+res.pid,res.pid);
							$(".send_p").attr("send_ms","1")
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
	
	
	//初始化页面
	app.initPage = function() {
		this.template = this.getTempBySelector("#itemtemp");
		
	};

	
	//浏览的帖子
	function loadDataTie(){
		var data = {
			loginedtoken:localStorage.loginedToken,
			id:app.UrlParams.id
		};
		
		app.POSTRequest_m("member/tie/showTie.do", {
				data: data,
				success: function(data){
					console.log('------------');
					console.log(data);
					console.log('------------');
					if(data.resultCode === "1") {
						var temp = app.getTempBySelector("#itemtemp");
						$("#list").append(temp(data.resultObj));
						var temp1 = app.getTempBySelector("#picTemp");
						var temp2 = app.getTempBySelector("#allTemp");
						var obj=data.resultObj;

						
							
							
						$.each(obj.pcms, function(i,item2) {
							$(".comlist_"+item2.pid).append(temp2(item2));
							diguiComment(item2.children, temp2, item2.pid);
							
						});
						
						var likes=obj.isLike;
						if(likes>0){
							$("#praise_"+obj.id).css("color","#fc9304")
						}
		
						if($("#likes_"+obj.id).html()>99){
							$("#likes_"+obj.id).html("+99")
						}
						
						
						
						var vals=app.UrlParams.vals;
						if(vals == 0 ){
							$(".user_time .block_name").hide()
						}
					}else{
						app.tipInfo(data.resultMsg);
					}
				},
				error: function() {
					app.pageRefresher.resetload();
				}
		});
	}
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
	
	
	app.openSwipe1 = function(index, item) {
		
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
		for(var i = 0; i < item.length; i++) {
			$(".swiper-wrapper").append(bigimgteamp({
				url: item[i]
			}));
		}
		$(".dlg_bg").show();
		$("#picshowpanel").show();
		$(".numbers").text((index) + "/" + item.length);
		initSwiper(index - 1);
	};
	
	function diguiComment(children, temp, itemId){
		if(undefined != children && children.length>0){
			$.each(children, function(idx,item){
				$(".comlist_"+itemId).append(temp(item));
				diguiComment(item.children, temp, itemId);
			});
		}
	}
	
	
	
	

	//开始执行
	app.init = function() {
		loadDataTie();
		$(document).on('click','#contents img',function(){
			var index1 ;
			var src=$(this).attr("src");
			var piclist = [];
			$("#contents img").each(function(index, element){
				piclist.push($(element).attr("src"));
				if($(element).attr("src") == src){
					index1 = index+1;
				}
			});
			app.openSwipe1(index1, piclist);
		});
	};
	
	
	/**
	查看全部回复 id帖子的ID
	*/
	
	app.ckreplay =function(val, id){
		console.log(val)
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
							diguiComment(item.children, temp2, item.pid);
						});
					} else {
						app.tipInfo(data.resultMsg);
					}	
				}
			});

			$(val).siblings().removeClass("ckreplay");
			$(val).html("收起").attr("data","1");
		}else if($(val).attr("data") == 1){
			$(val).siblings().addClass("ckreplay");
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