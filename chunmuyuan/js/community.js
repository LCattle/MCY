define(["base/baseApp", "refresher", "animate", "./base/basePage", "popup", "base/net", "swipe"],
	function(app, refresher, animate, page, popup, net, swipe) {
		
		
		if(!app.checkLogin()) {
			app.toLoginPage(location.href);
			return;
		}
		
		
		var activity = localStorage.getItem("activity");
		localStorage.activity = "";

		var storeCid = localStorage.getItem("bks");
		localStorage.bks = "";
		//绘制信息
		app.addList = function(data) {
			console.log(data)
			if(page.pageIndex == 1) {
			$("#list .tiezi_content").remove();
		}
		for(var i = 0; i < data.length; i++) {
			if(page.pageIndex == 1){
				$("#listSmall").append(this.template(data[i]));
			}else{
				$("#list").append(this.template(data[i]));
			}
			
		}
			if(!page.data || page.data.length == 0) {
				app.emptyList("#list");
			}
			var temp1 = app.getTempBySelector("#picTemp");
			var temp2 = app.getTempBySelector("#allTemp");
			$.each(data, function(i, item) {

				var piclist = item.pmms;
				var el;
				if(piclist.length > 0) {
					var picurls = Array();
					$.each(piclist, function(i, item1) {
						picurls.push(item1.path);
					});
					item.picurls = picurls.join(',');
					$.each(piclist, function(i, item1) {
						var tmpItem = item1;
						//console.log(tmpItem)
						tmpItem.getHeight = function(index) {
							if(this.imgs.length > index) {
								return this.height;
							}
							return 0;
						}
						tmpItem.getImgPath = function(index) {
							if(this.imgs.length > index) {
								//var path = app.getImgPath(this.imgs[index]).replace('/image/', '')
								var path = null;
								if(item.creatname) {
									path = app.getImgPath(this.imgs[index]).replace('/image/thumb/', '/')
								} else {
									path = app.getImgPath(this.imgs[index]).replace('/image/', '/')
								}
								return path;
							}
							return '';
						}
						//计算图片高度
						tmpItem.height = ($(window).width() - app.REM2PX(4.8)) / 3;
						tmpItem.imgs = item.picurls.split(",");
						if(tmpItem.imgs.length == 1) {
							if(!tmpItem.imgs[0]) {
								tmpItem.imgs = [];
							}
						}
						el = $(temp1(tmpItem));
						el.find(".imgbox").click(function() {
							var index = $(this).attr("index");
							var id = $(this).attr("comid");
							var comms = piclist;
							for(var i = 0; i < comms.length; i++) {
								var selectItem = comms[i];
								if(selectItem.id == id) {
									app.openSwipe(index, selectItem);
									return
								}
							}
						});
					});
					$(".piclist_" + item.id).append(el);
				}

				var pcms = item.pcms;
	
				$.each(pcms, function(i, item2) {
					$(".comlist_" + item.id).append(temp2(item2));
					diguiComment(item2.children, temp2, item.id);
				});
				
				$(".comlist_" + item.id).find("li").eq(1).nextAll().hide();
				//点赞
				var likes = item.isLike;
				if(likes > 0) {
					$("#praise_" + item.id).css("color", "#fc9304")
				}


				if($("#likes_" + item.id).html() > 99) {
					$("#likes_" + item.id).html("+99")
				}
				//帖子格式
				if(item.creatname != ""){
					var spanLength=$("#contents_" + item.id+" p");
					var contentAll=[];
					var spanContent;
					spanLength.each(function(i,item){
						var spanContent= $(item).text();
						contentAll.push(spanContent);
					})
					$("#contents_" + item.id).html(contentAll).find("img").remove();
				}
				
				
				
				
			});

			

		};

		function diguiComment(children, temp, itemId) {
			if(undefined != children && children.length > 0) {
				$.each(children, function(idx, item) {
					$(".comlist_" + itemId).append(temp(item));
					diguiComment(item.children, temp, itemId);
				});
			}
		}
		//格式
		function reGeshi(data) {
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
			//console.log(item);
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
		
		
		app.openSwipe1 = function(index, pics){
			if(app.mySwiper) {
				app.mySwiper.removeAllSlides();
				app.mySwiper.destroy(true, true);
				$(".swiper-container").css({
					height: "100%"
				})
				$(".swiper-wrapper").html('');
			}
			var bigimgteamp = app.getTempBySelector("#bigimgtemp");
			for(var i = 0; i < pics.length; i++) {
				$(".swiper-wrapper").append(bigimgteamp({
					url: pics[i]
				}));
			}
			$(".dlg_bg").show();
			$("#picshowpanel").show();
			$(".numbers").text((index) + "/" + pics.length);
			initSwiper(index - 1);
		}
			
		
		//	板块数据加载
		function plate() {
			app.POSTRequest_m("member/tielanmu/tieList.do", {
				data: {
					beginPage: 1,
					pageSize: 20
				},
				async: false,
				success: function(data) {
					//console.log(data)
					if(data.resultCode == 1) {
						app.blanks(data);
						if(storeCid && storeCid != "undefined") {
							$("#bkcid_" + storeCid).addClass("ave");
							selectCid = storeCid;
							storeCid = "";
							localStorage.removeItem('bks')
						} else if(selectCid && selectCid != "undefined") {
							$("#bkcid_" + selectCid).addClass("ave");
						} else {
							$("#allPlate").addClass("ave");
						}

					} else {
						//app.tipInfo(data.resultMsg);
					}
				}
			});
		}

		app.blanks = function(data) {
			var temp3 = app.getTempBySelector("#blockTemp") //板块绘制
			var blanksList = data.basePageObj.dataList;
			$.each(blanksList, function(i, item) {
				$(".blanks").append(temp3(item));
			});
		}

		//选择板块

		var selectCid = undefined;

		app.bkCid = function(cid) {

			$("#bkcid_" + cid).addClass("ave").siblings().removeClass("ave");
			if(cid == undefined) {
				$(".all_bankuai").addClass("ave").siblings().removeClass("ave");
			}
			if(cid != selectCid) {
				$("#list").empty();
				var str='';
					str='<div class="dropload-down" ><div class="dropload-load"><span class="loading"></span>加载中...</div></div>';
					$("#list").append(str)
				selectCid = cid;
				page.reset();
				app.pageRefresher.noData(false); //置为有数据
				app.pageIndex = 1;
				loadDataTie();
			}
		}

		//加载贴子数据
		function loadDataTie() {
			var cid = $('.ave').attr('cid');
			var data = {
				loginedtoken: localStorage.loginedToken,
				beginPage: page.pageIndex,
				pageSize: 5,
				circleid: 0,
				cid: cid,
			};
			app.POSTRequest_m("member/tie/tieList.do", {
				data: data,
				success: function(data) {
					//console.log(data)
					app.pageRefresher.resetload();
					if(data.resultCode === "1") {
						page.hasNextPage = data.basePageObj.hasNextPage;
						page.addData(data.basePageObj.dataList); //往page添加数据
						app.addList(data.basePageObj.dataList);
						if(page.pageIndex == "1"){
							setTimeout(function(){
						        $("#list").html($("#listSmall").html());
						        $("#listSmall").empty();
						        $("#list").find(".imgbox").click(function() {
									var index = $(this).attr("index");
									var id = $(this).attr("comid");
									var $picBox = $(this).closest("div[layout]");
									var pics = [];
									$picBox.find(".imgbox").each(function(i,item){
										var dataUrl = $(this).data("url");
										if(dataUrl){
											pics.push(dataUrl);
										}
									});
									app.openSwipe1(index,pics);
								});
						    }, 1000);
						}
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

		//活动

		app.listItemTemp = app.getTempBySelector("#listItemTemp"); //模板
		app.pageIndex1 = 1;
		app.pageSize1 = 5;
		app.hasNextPage1 = true;

		//	活动数据
		function activityData() {
			var data = {
				beginPage: app.pageIndex1,
				pageSize: 15
			};

			app.POSTRequest("weixin/mall/offlineactivity/activityLists.do", {
				data: data,
				success: function(data) {
					if(data.resultCode == 1) {
						app.hasNextPage1 = data.basePageObj.hasNextPage;
						if(app.pageIndex1 == 1) {
							$("#list-activity").empty();
						}
						if(data.basePageObj.dataList.length == 0) {
							app.emptyList("#list-activity", "没有活动")
						} else {
							showData(data.basePageObj.dataList);
						}
						app.pageIndex1++;
					} else {
						app.tipInfo(data.resultMsg);
					}

					app.pageRefresher.resetload();
					app.pageRefresher.noData(app.hasNextPage);
				},
				error: function() { //保存重置
					app.pageRefresher.resetload();
				}
			});
		}

		//初始化页面
		app.initPage = function() {
			this.template = this.getTempBySelector("#gdsTemp");
			var h = $(window).height();
			$("#list").css("min-height", h + "px");
			$("#wrapper").css("height", h + "px");
			$("#wrapper").css("overflow", "scroll");
			$("#list-activity").css("min-height", h + "px");

		};

		function showData(data) {
			var temp = app.getTempBySelector("#itemtemp")
			$.each(data, function(i, item) {
				item.pic = app.getImgPath(item.activitypic);
				var dateStart = new Date(item.regstarttime.replace(/-/g, "/"));
				var dateEnd = new Date(item.activityendtime.replace(/-/g, "/"));
				var dateNow = new Date();
				if(dateNow.getTime() < dateStart.getTime()) {
					item.showNum = false;
				} else {
					item.showNum = true;
				}

				//计算活动状态
				if(item.activitystatus == 3) {
					item.stateFlag = "yijieshu.png"; //已结束
				} else if(dateNow.getTime() < dateStart.getTime()) {
					item.stateFlag = "weikaishi.png"; //未开始

				} else if(dateNow.getTime() < dateEnd.getTime()) {
					item.stateFlag = "jinxingzhong.png"; //进行中
				} else {
					item.stateFlag = "yijieshu.png"; //已结束
				}
				//计算显示时间
				item.timeStr =
					dateStart.Format("MM-dd hh:mm");
				item.timeStr += " ~ " +
					dateEnd.Format("MM-dd hh:mm");
				$("#list-activity").append(temp(item));
			});
		}

		//帖子的初始化下拉刷新
		function initRefresh() {
			app.pageRefresher = refresher.initDropload("#wrapper", function(me) {
				if($(".aui-active").attr("data-item-order") == 0) {
					page.reset();
					me.noData(false);
					var str='';
					str='<div class="dropload-down" ><div class="dropload-load"><span class="loading"></span>加载中...</div></div>';
					$("#list").append(str)
					loadDataTie();
					$(".all_bankuai").siblings().remove();
					plate();
				}
				if($(".aui-active").attr("data-item-order") == 1) {
					page.reset();
					me.noData(false);
					app.pageIndex1 = 1;
					activityData();
				}
			}, function(me) {
				if(page.hasNextPage && $(".aui-active").attr("data-item-order") == 0) {
					loadDataTie();

				} else if(app.hasNextPage1 && $(".aui-active").attr("data-item-order") == 1) {
					activityData();
				} else {
					me.noData();
					me.resetload();

				}
			});
			app.pageRefresher._threshold = 300;

		}

		//活动跳转详情页
		app.toDetails = function(id) {
			app.href("../activity/activity.html?id=" + id);
		};

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
		 * 发送评论
		 */
		app.saveComment = function(id_value) {
			var temp = app.getTempBySelector("#allTemp");
			var content = $("#content_" + id_value).val().replace(/([\ud800-\udbff][\u0000-\uffff])/g, '').trim();
			$("#send_" + id_value).attr("disabled",true)
			if(content.length > 0 && content.length < 1) {
				app.tipInfo("帖子评论要多于1个字哦");
				$("#send_" + id_value).attr("disabled",false)
				return;
			}
			var pcid = $("#pcid_" + id_value).val();
			var data = {
				loginedtoken: localStorage.loginedToken,
				pid: id_value,
				content: content,
				postcommentsource: 'app',
				pcid: pcid
			};

			app.POSTRequest_m("member/tiecomment/saveTieComment.do", {
				data: data,
				success: function(data) {
					console.log(data)
					if(data.resultCode == 1) {
						$("#send_" + id_value).attr("disabled",true)
						var res = data.resultObj;
						var str = '<li pid="' + res.id + '" id="li_' + res.id + '" onclick="app.showComment(' + res.pid + ', ' + res.id + ')" style="font-size: 0.75rem;">';
						if(res.pcid == 0) {
							str += '<div class="comments-content" style="color: #949494;">';
							str += '<span class="nicknames" style="color: #333333;" >' + (res.username == "" ?res.mobile:res.username) + '</span>：';
							str += '<span>' + res.content + '</span><div>';
						} else {
							str += '<div style="color: #949494;">';
							str += '<span class="nicknames" style="color: #333333;">' +(res.username == "" ?res.mobile:res.username) + '</span>回复<span class="next_nicknames" style="color: #333333;">' + res.replyname + '</span>:'
							str += '<span class="comment_p" >' + res.content + '</span></div>';
						}
						str += '</li>';
						if(res.pcid == 0) {
							$('.comlist_' + res.pid).append(str);
						} else {
							$('#li_' + res.pcid).append(str);
						}
						if($("#send_" + id_value).attr("send_ms") == 0) {
							app.ckreplay("#replaybtn_" + res.pid, res.pid);
							$("#send_" + id_value).attr("send_ms", "1")
						}
						$(".comlist_" + id_value).css("display", "block");
						$("#content_" + id_value).val('');
						$(".shuru_" + id_value).hide();
						$("#footer").show();
						var num = Number($("#comments_" + id_value).html());
						++num;
						$("#comments_" + id_value).html(num);
						$("#comments1_" + id_value).html(num);
						
						
						
					} else {
						app.tipInfo(data.resultMsg);
					}
				},
				error: function() {
					$("#send_" + id_value).attr("disabled",false)
				}
			});
		}

		//开始执行
		app.init = function() {
			initRefresh();
			mesScroll();
			rolling();
			activity = activity ? activity : 0;
			createTab(activity * 1 + 1);
			renderTab({ index: activity * 1 + 1 });
			
			 setTimeout(function(){
		    	$(".maskings").hide();
		        app.hideLoading();
		    }, 400)
		};

		//帖子跳到详情页

		app.tieDetail = function(id_value,names) {
			localStorage.bks = $('.ave').attr('cid');
			localStorage.alls = $('.ave').attr('alls');
			if(names != ""){
				location.href = "../html/tieDetails.html?id=" + id_value;
			}else{
				location.href = "../html/tieDetailsUser.html?id=" + id_value;
			}
			
		}

		//消息滚动
		function mesScroll() {
			var temer = setInterval(
				function autoScroll() {
					$(".radioms").find(".list").animate({
						marginTop: "-1.5rem"
					}, 500, function() {
						$(this).css({ marginTop: "0px" }).find("li:first").appendTo(this);
					})
				}, 3000)
		}

		var html = '';

		function rolling() {
			app.POSTRequest_m("member/tienotice/tieNoticeList.do", {
				data: {
					pageSize: 3,
					beginPage: 1
				},
				//async: false,
				success: function(data) {
					//console.log(data)
					if(data.resultCode == 1) {
						showRolling(data);
						$(".radioms").html(html);
						html = "";
					} else {
						app.tipInfo(data.resultMsg);
					}
				}
			});
		}

		function showRolling(list) {
			if(list.basePageObj.dataList.length == 0) {
				return;
			} else {
				html += '		<ul class="list">'
				for(var i = 0; list.basePageObj.dataList.length > i; i++) {
					html += '			<li>' + list.basePageObj.dataList[i].title + '</li>'
				}
				html += '		</ul>'
			}
		}

		//渲染tab 
		function renderTab(ret) {
			page.reset();
			app.pageRefresher.resetload();
			if(ret.index == 1) {
				plate();
				$("#bankuai").show();
				localStorage.activity = 0;
				page.pageIndex = 1
				$(".all_tiezi").show()
				$("#list").show();
				$('#list-activity').empty();
				$(".activitymore").hide();
				$("#footer").show();
				app.pageIndex = 1;
				var str='';
				str='<div class="dropload-down" ><div class="dropload-load"><span class="loading"></span>加载中...</div></div>';
				$("#list").append(str)
				loadDataTie();
			} else if(ret.index == 2) {
				localStorage.activity = 1;
				$("#list").empty().hide();
				$(".all_tiezi").hide();
				$('.activitymore').show();
				$("#footer").hide();
				app.pageIndex1 = 1;
				activityData();
				$("#allPlate").siblings().remove()
				//initRefresh();
			} else if(ret.index == 3) {
				localStorage.activity = 0;
				app.href("../html/myCircle.html");
			}
		}

		//帖子切换
		function createTab(index) {
			new auiTab({
				element: document.getElementById("tab"),
				index: index,
				repeatClick: false
			}, function(ret) {
				renderTab(ret);
			});
		}

		/**
		点赞
		id 为帖子的id
		*/
		app.dianzan = function(id) {
			var data = {
				loginedtoken: localStorage.loginedToken,
				id: id,
				status: 2
			};
			app.POSTRequest_m("member/tie/likesAndKeeps.do", {
				data: data,
				success: function(data) {
					//console.log(data)
					if(data.resultCode == 1) {
						var num = Number($("#likes_" + id).html());
						$("#likes_" + id).html(++num);
						$("#praise_" + id).css("color", "#fc9304");

					} else {
						app.tipInfo(data.resultMsg);
					}

				}
			});

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

		/**
		查看全部回复 id帖子的ID
		*/

		app.ckreplay = function(val, id) {
			//console.log(val)
			if($(val).attr("data") == 0) {
				$('.comlist_' + id).empty();
				var data = {
					pid: id,
					pageSize: 1000,
					beginPage: 1
				};
				app.POSTRequest_m("member/tiecomment/listTieComment.do", {
					data: data,
					success: function(data) {
						//console.log(data)
						if(data.resultCode == 1) {
							var temp2 = app.getTempBySelector("#allTemp");
							$.each(data.basePageObj.dataList, function(i, item) {
								$(".comlist_" + item.pid).append(temp2(item));
								diguiComment(item.children, temp2, item.pid);
							});
						} else {
							app.tipInfo(data.resultMsg);
						}
					}
				});

				$(val).siblings().find("li").eq(1).nextAll().show();
				$(val).html("收起").attr("data", "1");
			} else if($(val).attr("data") == 1) {
				$(val).siblings().find("li").eq(1).nextAll().hide();
				$(val).show();
				var comments = $('#comments_' + id).html();
				$(val).html("查看全部<span id='comments1_" + id + "'>" + comments + "</span>条回复").attr("data", "0");
				$("#send_" + id).attr("send_ms", "0")
			}
		}

		//举报
		app.saveJubaoTie = function() {
			var data = {
				id: $('#jubaoVal').val(),
				loginedtoken: localStorage.loginedToken,
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

		app.shows = function(id) {
			$('#jubaoVal').val(id)
			$(".masking").removeClass("masking").addClass("masking-in");
			$("#report_j").show();
			$("#publishTie").hide()
		}

		app.qx_remove = function() {
			$(".masking-in").removeClass("masking-in").addClass("masking");
			$("#report_j").hide();
			$("#publishTie").show()
		}

		app.masking = function() {
			$(".masking-in").removeClass("masking-in").addClass("masking");
			$("#report_j").hide();
			$("#publishTie").show()
		}

		return app;
	})