//订单列表
define(["base/baseApp", "refresher", "animate", "./base/basePage", "./base/order"],
	function(app, refresher, animate, page, Order) {
		app.Order = Order;
		app.Page = page;
		app.selectedState = app.UrlParams.state;
		app.selectedState = parseInt(app.selectedState ? app.selectedState : -1);
		$("#list0").hide();
		$("#list" + app.selectedState).show();
		var tab = new auiTab({
			element: document.getElementById("tab"),
			index: app.selectedState + 2
		}, function(ret) {
			page.reset();
			app.pageRefresher.resetload();
			var old = app.selectedState;
			if(app.selectedState > ret.index - 2) { //选中的在左边
				$("#wrapper")[0].scrollTop = 0;
				$("#list" + old).animateCss("slideOutRight", function() {
					if(old != app.selectedState)
						$("#list" + old).hide();
				});
				app.selectedState = ret.index - 2; //设置选择情况
				loadData();
				$("#list" + app.selectedState).show();
				$("#list" + app.selectedState).animateCss("slideInLeft");
			} else { //选中的在右边
				$("#wrapper")[0].scrollTop = 0;
				$("#list" + old).animateCss("slideOutLeft", function() {
					if(old != app.selectedState)
						$("#list" + old).hide();
				});
				app.selectedState = ret.index - 2; //设置选择情况
				loadData();
				$("#list" + app.selectedState).show();
				$("#list" + app.selectedState).animateCss("slideInRight");
			}
		});

		function addProducts(data, id, tid) {
			var el = $("#list" + app.selectedState + " #orderItem" + id);
			$.each(data, function(i, it) {
				el.append(app.getTempBySelector("#" + tid)(it));
			});
		}
		//绘制信息 
		app.addList = function(data) {
			if(page.pageIndex == 1) {
				$("#list" + app.selectedState).empty();
			}
			for(var i = 0; i < data.length; i++) {
				var order = data[i];
				if(data[i].isneworder == 'Y'){
					order.statusStr =
						Order.getStatus(order).text;
					var btnGroup = Order.getBtnGroupId(order);
					order = jQuery.extend(order, order, btnGroup);
					var btns = app.getTempBySelector("#btnGroup")(order);
					var tempId = (order.type == 1 || order.type == 2 || order.type == 7) ?
						"produtsTemplate" : "cardTemplate";
					var kobe = order.orderno.substring(0,2);
					if(kobe == "LQ"){
						tempId = "giftTemplate";
					}
					$("#list" + app.selectedState).append(this.template(order));
					$("#list" + app.selectedState + " #btnbox_" + order.id).html(btns);
					addProducts(order.items, order.id, tempId);	
				}else{
					order.statusStr =
					    Order.getStatus(order).text;
					var btnGroup = Order.getBtnGroupId(order);
					order = jQuery.extend(order, order, btnGroup);
					var btns = app.getTempBySelector("#btnGroup")(order);
					var tempId1 = (order.type == 1 || order.type == 2 || order.type == 7) ?
						"produtsTemplate1" : "cardTemplate";
					if(order.type == 1 || order.type == 2 || order.type == 9) {
					    order.priceHtml = app.getKg(order.virtualfee);
					} else {
						order.priceHtml = app.getPriceStr(order.sprices);
					}
					$("#list" + app.selectedState).append(this.template1(order));
					$("#list" + app.selectedState + " #btnbox_" + order.id).html(btns);
					addProducts(order.items, order.id, tempId1);
				}
			}
			var h = $(window).height() - $("#tab").height();
			//2680  623
			var nowh = $("#list" + app.selectedState).height();
			$("#list").css("height", Math.max(h, nowh) + "px");
			if(!page.data || page.data.length == 0) {
				var tips = {
					"-1": "您还没有任何订单",
					0: "您还没有待支付订单",
					1: "您还没有待收货订单",
					2: "您还没有待评价订单"
				}
				app.emptyList("#list" + app.selectedState, tips[app.selectedState]);
			}
		};

		//初始化下拉刷新
		function initRefresh() {
			app.pageRefresher = refresher.initDropload("#wrapper",
				function(me) {
					page.reset();
					me.noData(false);
					loadData();
				},
				function(me) {
					if(page.hasNextPage) {
						loadData();
					} else {
						me.noData();
						me.resetload();
					}
				});
		}
		app.postUUid = "";
		//加载商品数据
		function loadData() {
			var uuid = app.uuid();
			app.postUUid = uuid;
			var status = app.selectedState;
			app.POSTRequest("weixin/mall/order/queryOrdersByStatus.do", {
				data: {
					beginPage: page.pageIndex,
					status: status,
					pageSize: page.pageSize
				},
				success: function(data) {
					if(uuid != app.postUUid){
						console.log(uuid);
						console.log(app.postUUid);
						return;
					}
					app.pageRefresher.resetload();
					if(data.resultCode === "1") {
						if(status == app.selectedState) {
							if(data.basePageObj) {
								page.hasNextPage = data.basePageObj.hasNextPage;
								page.addData(data.basePageObj.dataList); //往page添加数据
								app.addList(data.basePageObj.dataList);
							} else {
								page.hasNextPage = false;
								page.addData([]); //往page添加数据
								app.addList([]);
							}
							page.pageIndex++;
						}
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
		app.initPage = function() {
			this.template = this.getTempBySelector("#orderTemplate");
			this.template1 = this.getTempBySelector("#orderTemplate1");
			this.productItem = this.getTempBySelector("#produtsTemplate");
			var h = $(window).height() - $("#tab").height();
			$("#list").css("width", $(window).width() + "px");
			$("#list").css("min-height", h + "px");
			$("#wrapper").css("height", h + "px");
			$("#wrapper").css("overflow", "scroll");
		};
		//去支付
		app.toPay = function(id) {
			var order = app.Page.getObj("id", id);
			var str = order.actualpaied;
			var confirmpaypage = "../html/confirmpay.html";
			var newlypaypage = "../payment/newlyPay.html";
			if(isInAppEnviroment()) {
				confirmpaypage = "../payment/confirmpay.html";
				newlypaypage = "../payment/newlyPay.html";
			}

			if(order.type == app.ORDER_TYPE_OPTION ||
				order.type == app.ORDER_TYPE_PACKAGE) {
				location.href = confirmpaypage+"?oid=" + order.id + "&ono=" + order.orderno +
					"&money=" + str + "&type=" + order.type;
			} else if(order.type == 3 && order.payway == '40') {
				app.href("../html/offlinePay.html?oid=" + order.id);
			} else {
				location.href = newlypaypage +"?oid=" + order.id + "&ono=" + order.orderno +
					"&money=" + order.actualpaied +
					"&type=" + order.type + "&payway=" + order.payway +
					"&virtualfee=" + order.virtualfee / 1000 + "&couponfee=" + order.couponfee + "&giveamount=" + order.giveamount;
			}
		};
		//去详情
		app.toDetail = function(id, orderno) {
			var reg=new RegExp("^LQ");     
			if(reg.test(orderno)){
				location.href = "../html/giftDetails.html?oid=" + id;
			} else {
				location.href = "../html/orderDetails.html?oid=" + id;
			}
		};
		//去活动详情页
		app.toPurchaseDetail = function(id) {
			location.href = "../html/purchaseDetails.html?oid=" + id;
		}
		//查看物流详情
		app.toLogisticsDetails = function(id) {
			location.href = "../html/logisticsDetails.html?oid=" + id;
		};
		//去评论
		app.toCommend = function(id) {
			var order = page.getObj("id", id);
			app.setLocalObjet("evaorder", order);
			location.href = "../html/evaluation.html?oid=" + id;
		};
		app.applyInvoice = function(id) {
			var order = page.getObj("id", id);
			app.href("../html/applyInvoice.html?oid=" + id + "&otype=" + order.type);
		}
		//去修改
		app.toAmend = function(id) {
			localStorage.selectztAddress = "";
			localStorage.selectAddress = "";
			location.href = "../html/amend.html?oid=" + id;
		}
		//取消订单
		app.cancleOrder = function(id) {
			var dialog = new auiDialog();
			order = page.getObj("id", id);
			dialog.alert({
				title: "提示",
				msg: '是否取消该订单?',
				buttons: ['取消', '确定']
			}, function(ret) {
				if(ret.buttonIndex == 2) {
					Order.cancleOrder(id, function() {
						order.status = 4;
						var el = $("#list" + app.selectedState + " #skuitem_" + id);
						el.hide();
						order.btnCancle = false;
						order.btnPay = false;
						order.statusStr =
							Order.getStatus(order).text;
						var btnGroup = Order.getBtnGroupId(order);
						order = jQuery.extend(order, order, btnGroup);
						var btns = app.getTempBySelector("#btnGroup")(order);
						var tempId = (order.type == 1 || order.type == 2 || order.type == 7 || order.type == 9) ?
							"produtsTemplate" : "cardTemplate";
//						if(order.type == 1 || order.type == 2) {
//							order.priceHtml = app.getKg(order.virtualfee);
//						} else {
//							order.priceHtml = app.getPriceStr(order.sprices);
//						}
						el.before(app.template(order));
						el.remove();
						$("#list" + app.selectedState + " #btnbox_" + order.id).html(btns);
						addProducts(order.items, order.id, tempId);

					});
				}
			});
		};
		//开始执行
		app.init = function() {
			initRefresh();
			loadData();
		};
		return app;
	});