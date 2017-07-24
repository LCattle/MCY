//浏览历史
define(["./base/baseApp", "swipe"], function(app, swipe) {
	//定义变量
	var actId = app.UrlParams.id; //活动id
	//定义变量 end
	//检查登录
//	if(!app.checkLogin()) {
//		app.toLoginPage(location.href);
//		return;
//	}
	/**
	 * 加载活动信息
	 */
	function loadAct() {
		app.POSTRequest("weixin/mall/offlineactivity/activityDetail.do", {
			data: {
				activityId: actId
			},
			success: function(data) {
				if(data.resultCode == 1) {
					showAct(data.resultObj);
					$("#app").show();
				} else {
					app.tipInfo(data.resultMsg);
				}
			}
		})
	}

	function showAct(data) {
		app.activiyData = data;
		$("#title").text(data.activityname);
		nativeRegistShareBtn({
			content: data.activitymemo,
			title: data.activityname,
			url: location.href,
			imgUrl: app.getImgPath(data.activitypic)
		});
		$("#memo").text("简介：" + data.activitymemo);
		$("#actFull").html(data.activityillustration);
		$("#actFull img").css({
			width: "100%"
		});
		$("#registTime").text(doTime(data.regstarttime, data.regendtime));
		$("#actTime").text(doTime(data.activitystarttime, data.activityendtime));
		$("#actAddrees").text(data.cityname + " " + data.countyname + " " + data.fulladdress);
		app.comments = data.commentList;
		if(app.comments && app.comments.length > 0) {
			$("#xindebox").show();
			showComments(0, 3);
		}
		checkeRegend(data);
	}
	/**
	 * @param {Object} sIndex 起始角标
	 * @param {Object} eIndex 结束角标
	 */
	function showComments(sIndex, eIndex) {
		var temp = app.getTempBySelector("#xindetemp1");
		for(var i = sIndex;
			(i < eIndex) && (i < app.comments.length); i++) {
			var item = app.comments[i];
			if(item.note.length > 56) {
				item.note_s = item.note.substring(0, 56);
			}
			//计算头像
			if(item.avatar) {
				item.header = app.getImgPath(item.avatar).replace('/image/', '');
			} else {
				item.header = "../imgs/xq-images/photo.png";
			}
			//计算昵称
			if(item.nickname) {
				item.username = item.nickname;
			} else {
				item.username = "春沐源会员";
			}
			item.getHeight = function(index) {
				if(this.imgs.length > index) {
					return this.height;
				}
				return 0;
			}
			item.getImgPath = function(index) {
				if(this.imgs.length > index) {
					var path = app.getImgPath(this.imgs[index]).replace('/image/', '')
					return path;
				}
				return '';
			}
			//计算图片高度
			item.height = ($(window).width() - app.REM2PX(4.8)) / 3;
			item.imgs = item.picurls.split(",");
			if(item.imgs.length==1){
				if(!item.imgs[0]){
					item.imgs = [];
				}
			}
			var el = $(temp(item))
			el.find(".imgbox").click(function() {
				var index = $(this).attr("index");
				var id = $(this).attr("comid");
				console.log(app);
				var comms = app.activiyData.commentList;
				for(var i=0;i<comms.length;i++){
					var selectItem = comms[i];
					if(selectItem.id == id){
						app.openSwipe(index,selectItem );
						return
					}
				}
			});
			$("#xindebox").children().eq(1).append(el);
		}
		if(eIndex > app.comments.length) {
			$("#showMore").hide();
		}
	}
	//点击查看更多
	app.showMore = function() {
		var index = $("#xindebox").children().eq(1).children().length;
		showComments(index, index + 5);
	};
	//点击展开
	app.clickZhankai = function(el) {
		var temp = $(el).prev().text();
		var show = $(el).parent().parent().next().text();
		$(el).prev().text(show);
		$(el).parent().parent().next().text(temp);
		$(el).find("i").toggleClass("aui-icon-right aui-icon-down");
		if($(el).find("i").hasClass("aui-icon-down")) {
			$(el).find("span").text("收起");
		} else {
			$(el).find("span").text("展开");
		}
	}

	/**
	 * 设置底部按钮
	 * @param {Object} text 底部按钮文字
	 * @param {Object} bgcolor 背景颜色
	 * @param {Object} clickBack 回调方法
	 */
	function setFooterBtn(text, bgcolor, clickBack) {
		var btn = $("#footerBtn").css({
			background: bgcolor,
			color: "#fff"
		}).text(text);
		btn.unbind("click");
		if(clickBack) {
			btn.addClass("btnfilter");
			btn.bind("click", clickBack);
		}
	}
	//检查是否报名
	function checkeRegend(actData) {
		//报名人数是否已满
		var isFull = actData.allowamount <= actData.auditamount;
		//活动结束时间
		var endTime = new Date(actData.activityendtime.replace(/-/g, "/"));
		//活动报名结束时间
		var reganEndTime = new Date(actData.regendtime.replace(/-/g, "/"));
		//活动报名是否结束
		var isReganEnd = reganEndTime.getTime() <= new Date().getTime();
		//活动是否已结算
		var isActEnd = (endTime.getTime() <= new Date().getTime());
		//活动是否开始
		isReganStart = (app.parseDate(actData.regstarttime).getTime()) <= new Date().getTime()
		if(isReganStart) {
			$("#countNum").text(actData.virtualamount + "人已报名");
		} else {
			$("#countNum").hide();
		}
		if(!isReganEnd && isReganStart && !isFull) {
			$("#firends").show();
		}
		//请求用户与活动间的状态
		app.POSTRequest("weixin/mall/offlineenrolment/signupDetail.do", {
			data: {
				activityId: actId
			},
			success: function(data) {
				if(data.resultCode == 1) { //已报名
					//是否已参与
					var isJoin = data.resultObj.joinstatus == 2;
					if(isJoin) { //已参与
						var iscommanded = data.resultObj.iscomment != "0";
						if(!iscommanded) {
							$("#countNum").hide();
							setFooterBtn("发布心得", "#e87708", function() {
								app.href("actExperience.html?id=" + actId);
							});
						}
					} else {
						var auditstatus = data.resultObj.auditstatus;
						if(isActEnd) { //活动时间截止
							setFooterBtn("过期未参与", "#ddd");
						} else if(auditstatus == 0) {
							setFooterBtn("已报名", "#ddd");
						} else if(auditstatus == 1) {
							setFooterBtn("审核通过", "#0d6538");
						} else {
							setFooterBtn("审核不通过", "#0d6538");
						}
					}
				} else { //未报名
					if((actData.activitystatus == 3 && !isActEnd) || (isFull && !isActEnd) || (actData.activitystatus == 2 && !isActEnd && isReganStart)) {
						setFooterBtn("已满员", "#ddd");
					} else if(!isReganStart) {
						setFooterBtn("未开始", "#ddd");
					} else if(isActEnd) { //活动时间截止
						setFooterBtn("过期未参与", "#ddd");
					} else if(isReganEnd) { //报名时间截止
						setFooterBtn("已满员", "#ddd");
					} else { //点按钮执行报名
						setFooterBtn("报名", "#e87708", doRegend);
					}
				}
			}
		})

	}

	//报名
	function doRegend() {
		app.POSTRequest("weixin/mall/offlineenrolment/signupActivity.do", {
			data: {
				activityId: actId
			},
			loading: "正在报名...",
			success: function(data) {
				console.log(data);
				if(data.resultCode == 1) {
					app.activiyData.virtualamount++;
					$("#countNum").text(app.activiyData.virtualamount + "人已报名");
					setFooterBtn("已报名", "#ddd");
				} else {
					app.tipInfo(data.resultMsg);
				}
			}
		})
	}
	//处理时间显示
	function doTime(date1, date2) {
		var dateStart = new Date(date1.replace(/-/g, "/"));
		var dateEnd = new Date(date2.replace(/-/g, "/"));
		//计算显示时间
		var timeStr =
			dateStart.Format("yyyy-MM-dd hh:mm");
		timeStr += "~" +
			dateEnd.Format("yyyy-MM-dd hh:mm");
		return timeStr;

	};
	app.init = function() {
		loadAct();
	};

	app.invitation = function() {
		nativeOpenSelectAFriend(function(data) {
			var b = app.isString(data);
			if(b) {
				data = $.parseJSON(data);
			}
			if(data.code == 1) {
				var f = data.friendInfo;
				if(f && f.length > 0) {
					app.POSTRequest("weixin/mall/offlineactivity/invitingFriends.do", {
						data: {
							invitId: f[0].knowid,
							activityId: actId
						},
						success: function(data) {
							if(data.resultCode == 1) {
								new auiDialog().alert({
									msg: "成功邀请" + (f[0].remark ? f[0].remark : f[0].knowmobile),
									buttons: ["确定"]
								}, function() {
								});
							} else {
								app.tipInfo(data.resultMsg);
							}
						}
					});

				}

			}
		});
	}

	/**
	 * 初始化查看大图主键
	 */
	function initSwiper(index) {
		app.mySwiper = new Swiper('.swiper-container', {
			initialSlide: index,
			onTransitionEnd: function(swiper) {
				if(app.mySwiper)
					setPicNumber();
			},
			onInit: function(swiper) {
				app.mySwiper = swiper;
				setPicNumber();
			}
		});
	}

	function setPicNumber() {
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
		for(var i = 0; i < item.imgs.length; i++) {
			console.log(item.getImgPath(0))
			$(".swiper-wrapper").append(bigimgteamp({
				url: item.getImgPath(i)
			}));
		}
		$(".dlg_bg").show();
		$("#picshowpanel").show();
		$(".numbers").text((index) + "/" + item.imgs.length);
		initSwiper(index - 1);
	};
	return app;
});