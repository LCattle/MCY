define(["base/baseApp", "refresher", "animate", "./base/basePage", "dialog", "swipe"],
	function(app, refresher, animate, page, dialog, swipe) {

		//圈子的id
		var circleid = app.UrlParams.circleid;
		var flag = true; //全局变量 控制显示与隐藏
		var i = 0; //tab 切换tab
		var tab = new auiTab({
			element: document.getElementById("tab"),
			index: 1,
			repeatClick: false
		}, function(ret) {
			page.reset();
			app.pageRefresher.resetload();
			if(app.pageRefresher1) {
				app.pageRefresher1.resetload();
			}

			if(ret.index == 1) { //选中的在左边
				i = 1;
				//$('#wrapper1').unbind()
				$("#all_tiezi").show();
				$("#all_quanzi").hide();
				$("#wrapper")[0].scrollTop = 0;
				$(".newDetails").hide();
				$("#dynTemp1").show();
				$("#list").show();
				$("html").css("background", "#EEEEEE")
				showBtn(flag, i);
				loadData(circleid);
				loadIstop(circleid);
				$("#quanziMember").empty();
				$("#all_tiezi .dropload-down").show()
				$(".bgPeople").hide();
			} else if(ret.index == 2) { //选中的在右边
				i = 2;
				$("#all_tiezi").hide();
				$("#all_quanzi").show()
				$("#wrapper1")[0].scrollTop = 0;
				$("#dynTemp1").empty().hide();
				$(".newDetails").show();
				$("html").css("background", "#FFFFFF");
				$("#list").empty().hide();
				$("#all_tiezi .dropload-down").hide()
				if(!app.pageRefresher1) {
					initRefresh1();
				}
				loadMember(circleid);

			}
		});

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
					var obj = $("#list");
					obj.find(".comlist_" + item.id).append(temp2(item2));
					diguiComment(item2.children, temp2, item.id, obj);
				});
				
				$(".comlist_" + item.id).find("li").eq(1).nextAll().hide();
				
				var likes = item.isLike;
				if(likes > 0) {
					$("#praise_" + item.id).css("color", "#fc9304")
				}

				if($("#likes_" + item.id).html() > 99) {
					$("#likes_" + item.id).html("+99")
				}

				if(item.creatname != "") {
					var spanLength = $("#contents_" + item.id + " span");
					var contentAll = [];
					var spanContent;
					spanLength.each(function(i, item) {
						var spanContent = $(item).html();
						contentAll.push(spanContent);
					})
					$("#contents_" + item.id).html(contentAll).find("img").remove();
				}
			});

		};

		//显示回复评论
		function diguiComment(children, temp, itemId) {
			if(undefined != children && children.length > 0) {
				$.each(children, function(idx, item) {
					$(".comlist_" + itemId).append(temp(item));
					diguiComment(item.children, temp, itemId);
				});
			}
		}

		//帖子跳到详情页

		app.tieDetail = function(id_value, names) {
			if(names != "") {
				location.href = "../html/tieDetails.html?id=" + id_value + "&vals=" + 0;
			} else {
				location.href = "../html/tieDetailsUser.html?id=" + id_value + "&vals=" + 0;
			}
		}

		app.nofind = function(img) {
			img.src = "../imgs/xq-images/photo.png";
			img.onerror = null;
		}

		//发布帖子
		app.publishTie = function() {
			location.href = "sendCircle.html?circleid=" + circleid;

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

		//加入圈子
		app.partQuazi = function() {
			var data = {
				loginedtoken: localStorage.loginedToken,
				id: circleid,
				circleusersource: 'app'
			};
			app.POSTRequest_m("member/circle/partCircle.do", {
				data: data,
				success: function(data) {
					console.log(data);
					if(data.resultCode === "1") {
						if($(".aui-active").attr("data-item-order") == 1) {
							loadData(circleid);
						}
						app.tipInfo(data.resultMsg);
						$(".joinCircle").hide();
						$(".bgPeople").hide();
						var num = $("#pknum").html();
						$("#pknum").html(++num);
						flag = true;
						showBtn(flag, i);
					} else {
						app.tipInfo(data.resultMsg);
					}
				},
				error: function() {
					app.pageRefresher.resetload();
				}
			});
		}

		//退出圈子
		app.quitQuanzi = function() {

			var dialog = new auiDialog();

			dialog.alert({
				title: "弹出提示",
				msg: '是否退出圈子',
				buttons: ['取消', '确定']
			}, function(ret) {
				console.log(ret)
				if(ret.buttonIndex == 1) {

				} else if(ret.buttonIndex == 2) {
					var data = {
						loginedtoken: localStorage.loginedToken,
						id: circleid
					};
					app.POSTRequest_m("member/circle/quitCircle.do", {
						data: data,
						success: function(data) {
							if(data.resultCode === "1") {
								app.pageRefresher.resetload();
								app.tipInfo(data.resultMsg);
								$(".joinCircle").show();
								$("#delBtn").hide();
								location.href = "allCircle.html";
							} else {
								app.tipInfo(data.resultMsg);
							}
						},
						error: function() {
							app.pageRefresher.resetload();
						}
					});
				}
			})

		}

		function initRefresh() {
			app.pageRefresher = refresher.initDropload("#wrapper",
				function(me) {
					page.reset();
					me.noData(false);
					$("#dynTemp1").empty();
					loadData(circleid);
					loadIstop(circleid)
				},
				function(me) {
					if(page.hasNextPage) {
						loadData(circleid);
					} else {
						me.noData();
						me.resetload();
					}
				});

		}

		function initRefresh1() {
			app.pageRefresher1 = refresher.initDropload("#wrapper1",
				function(me) {
					page.reset();
					me.noData(false);
					$("#quanziMember").empty();
					loadMember(circleid);

				},
				function(me) {
					if(page.hasNextPage) {
						loadMember(circleid);
					} else {
						me.noData();
						me.resetload();
					}
				});

		}

		function loadData(circleid) {
			var data = {
				loginedtoken: localStorage.loginedToken,
				beginPage: page.pageIndex,
				pageSize: 3,
				circleid: circleid,
				cid: 0,
			};
			app.POSTRequest_m("member/tie/tieList.do", {
				data: data,
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

		//判断是否加圈子
		function loadMember(circleid) {
			var data = {
				loginedtoken: localStorage.loginedToken,
				circleid: circleid,
				beginPage: page.pageIndex,
				pageSize: 16
			};
			app.POSTRequest_m("member/circleuser/judgeByMember.do", {
				data: data,
				success: function(data) {
					if(app.pageRefresher1) {
						//$("#quanziMember").empty()
						app.pageRefresher1.resetload();
					}
					if(data.resultCode == 1) {
						if($(".aui-active").attr("data-item-order") == 1) {
							var temp = app.getTempBySelector("#memberTemp"); //圈子信息
							page.hasNextPage = data.basePageObj.hasNextPage;
							page.addData(data.basePageObj.dataList);
							$.each(data.basePageObj.dataList, function(i, item) {
								$("#quanziMember").append(temp(item));
							});
							flag = true;
							showBtn(flag, 2);
							page.pageIndex++;
						} else {
							flag = true;
							showBtn(flag, 0);
						}
						
						$(".joinCircle").hide();
						$(".bgPeople").hide()
					} else {
						page.hasNextPage = false;
						flag = false;
						showBtn(flag, 0);
						$(".joinCircle").show()
						if($(".aui-active").attr("data-item-order") == 1) {
							$(".bgPeople").show()
						}

					}

				},
				error: function() {
					app.pageRefresher1.resetload();
				}
			});
		}

		//初始化页面
		app.initPage = function() {
			this.template = this.getTempBySelector("#gdsTemp");
			var h = $(window).height() - $("#tab").height() - $("#quanziInfo").height() - 0.5 * 20 - $("#footer").height() - 0.75 * 20;
			$("#list").css("width", $(window).width() + "px");
			$("#list1").css("width", $(window).width() + "px");
			$("#list").css("min-height", h + "px");
			$("#list1").css("min-height", h + "px");
			$("#wrapper").css("overflow", "scroll");
			$("#wrapper").css("height", h + "px");
			$("#wrapper1").css("overflow", "scroll");
			$("#wrapper1").css("height", h + "px");
		};
		//开始执行
		app.init = function() {
			initRefresh();
			loadData(circleid);
			loadDataInfo(circleid);
			loadIstop(circleid);
			loadMember(circleid);

		};

		/**
		 * 点击评论显示评论输入框
		 */
		app.showComment = function(pid, pcid) {
			$("#pcid_" + pid).val(pcid);
			$(".shuru").hide();
			$("#send_" + pid).attr("disabled", false)
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
			$("#send_" + id_value).attr("disabled", true)
			if(content.length > 0 && content.length < 1) {
				app.tipInfo("帖子评论要多于1个字哦");
				$("#send_" + id_value).attr("disabled", false)
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
					if(data.resultCode == 1) {
						$("#send_" + id_value).attr("disabled", true)
						var res = data.resultObj;
						var str = '<li pid="' + res.id + '" id="li_' + res.id + '" onclick="app.showComment(' + res.pid + ', ' + res.id + ')" style="font-size: 0.75rem;">';
						if(res.pcid == 0) {
							str += '<div class="comments-content" style="color: #949494;">';
							str += '<span class="nicknames" style="color: #333333;" >' + (res.username == "" ? res.mobile : res.username) + '</span>：';
							str += '<span>' + res.content + '</span><div>';
						} else {
							str += '<div style="color: #949494;">';
							str += '<span class="nicknames" style="color: #333333;">' + (res.username == "" ? res.mobile : res.username) + '</span>回复<span class="next_nicknames" style="color: #333333;">' + res.replyname + '</span>:'
							str += '<span class="comment_p" >' + res.content + '</span></div>';
						}
						str += '</li>';
						//console.log(str);
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
					$("#send_" + id_value).attr("disabled", false)
				}
			});
		}

		//点赞
		//id 为帖子的idtieList
		app.dianzan = function(id) {
			var data = {
				loginedtoken: localStorage.loginedToken,
				id: id,
				status: 2
			};
			app.POSTRequest_m("member/tie/likesAndKeeps.do", {
				data: data,
				success: function(data) {
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
		//显示图片和评论
		function dataRow(list) {
			var temp = app.getTempBySelector("#gdsTemp");
			var temp1 = app.getTempBySelector("#picTemp");
			var temp2 = app.getTempBySelector("#allTemp");
			$.each(list, function(i, item) {
				var piclist = item.pmms;
				$(".all_content").append(temp(item));
				$.each(piclist, function(i, item1) {
					$(".piclist_" + item.id).append(temp1(item1));
				})

				var pcms = item.pcms;

				$.each(pcms, function(i, item2) {
					$(".comlist_" + item.id).append(temp2(item2));
					diguiComment(item2.children, temp2, item.id);
				});

			})
		}

		//圈子信息
		function loadDataInfo(circleid) {
			var data = {
				id: circleid
			};
			app.POSTRequest_m("member/circle/quanziInfo.do", {
				data: data,
				success: function(data) {
					if(data.resultCode == 1) {
						var temp = app.getTempBySelector("#infoTemplate"); //圈子信息
						$("#quanziInfo").append(temp(data.resultObj));

					} else {
						app.tipInfo(data.resultMsg);
					}
				}
			});
		}
		//精华帖 member/tie/topTie.do
		function loadIstop(circleid) {
			var data = {
				circleid: circleid,
				beginPage: 1,
				pageSize: 5
			}
			app.POSTRequest_m("member/tie/topTie.do", {
				data: data,
				success: function(data) {
					if(data.resultCode == 1) {
						console.log(data)
						page.hasNextPage = data.basePageObj.hasNextPage;
						page.addData(data.basePageObj.dataList);
						var temp = app.getTempBySelector("#dynTemp"); //圈子信息
						$.each(data.basePageObj.dataList, function(i, item) {
							console.log(item)
							$("#dynTemp1").append(temp(item));
						});

					} else {
						app.tipInfo(data.resultMsg);
					}
				}
			});
		}

		//显示加入圈子的按钮
		function showBtn(flag, i) {
			switch(i) {
				case 0:
					if(flag) {
						$('#partQuanzi').hide();
						$('#partQuanziBtn').hide();
						$('#publishBtn').show();
						//$("#delBtn").show();
					} else {
						$('#partQuanzi').show();
						$('#partQuanziBtn').show();
						$('#publishBtn').hide();
						$("#delBtn").hide();
					}
					break;
				case 1:
					if(flag) {
						$("#delBtn").hide();
						$('#publishBtn').show();
						$('#partQuanzi').hide();
						$('#partQuanziBtn').hide();
					} else {
						$("#delBtn").hide();
						$('#publishBtn').hide();
						$('#partQuanzi').show();
						$('#partQuanziBtn').show();
					}
					break;
				case 2:
					if(flag) {
						$("#delBtn").show();
						$('#publishBtn').hide();
						$('#partQuanzi').hide();
						$('#partQuanziBtn').hide();
					} else {
						$("#delBtn").hide();
						$('#publishBtn').hide();
						$('#partQuanzi').show();
						$('#partQuanziBtn').show();
					}
					break;
			}

		}

		/**
		查看全部回复 id帖子的ID
		*/
		app.ckreplay = function(val, id) {
			console.log(val)
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

		//	分享
		app.shares = function(id, names) {
			var contents = $("#contents_" + id).text().trim();
			if(contents.length > 80) {
				contents = contents.substring(0, 80) + "...";
			}

			if(names != "") {
				nativeOpenShare({
					content: contents,
					title: $("#tiltle_" + id).text().trim(),
					url: "http://" + location.host + "/static/appchunmuyuan/html/tieDetails.html?id=" + id + "&vals=" + "0"
				}, function(data) {
					var obj = JSON.parse(data)
					if(obj.status == 1) {
						fxtie(id);
					} else if(obj.status == 0) {
						app.tipInfo("分享取消！");
					} else {
						app.tipInfo("分享失败！");
					}
				});
			} else {
				nativeOpenShare({
					content: contents,
					title: $("#tiltle_" + id).text().trim(),
					url: "http://" + location.host + "/static/appchunmuyuan/html/tieDetailsUser.html?id=" + id + "&vals=" + "0"
				}, function(data) {
					//alert(data);
					var obj = JSON.parse(data)
					if(obj.status == 1) {
						fxtie(id);
					} else if(obj.status == 0) {
						app.tipInfo("分享取消！");
					} else {
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

		//添加好友

		app.appendAfriend = function(tel) {
			nativeOpenAppendAFriend(tel)
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
			$("#footer").hide();
		}

		app.qx_remove = function() {
			$(".masking-in").removeClass("masking-in").addClass("masking");
			$("#report_j").hide();
			$("#footer").show()
		}

		app.masking = function() {
			$(".masking-in").removeClass("masking-in").addClass("masking");
			$("#report_j").hide();
			$("#footer").show()
		}
		return app;
	});