//订单详情
define(["base/baseApp", "./base/order"], function(app, Order) {

	app.initPage = function() {};
	//开始执行
	app.init = function() {
		if(app.checkLogin()) {
			loadOrder();
		} else {
			app.toLoginPage(location.href);
		}
		//获取用户，拼接imurl
		app.getUser(function(data) {
			app.imLinkUrlReal = app.imLinkUrl + "&nickName=" + data.crmnickname + "&customerId=" + data.crmnickname;
		});
	};

	//显示价格
	function showPrice(price) {
		$("#price").html(app.getPriceStr(price));
		$("#priceLable").text("商品金额");
	}
	app.order = null;
	//加载订单
	function loadOrder() {
		Order.getOrder(app.UrlParams.oid, function(order) {
			console.log(order);
			if(order.deliverymode == 30){
				$('.Name').hide();
				$('#addressPhone').hide();
		    }
			if(order.reducePound != 0){
				$("#derate").show();
				$("#actual").show();
				$("#freeprice").text(order.reducePound/1000 + 'kg');
				$("#actualprice").text(((order.virtualfee - order.reducePound)/1000).toFixed(2) + 'kg');
			}
//			if(payStatus == "10"){
//				$("#orderStatus").text("待支付");
//			}else if(payStatus == "20"){
//				app.POSTRequest("/weixin/mall/orderhd/isGroup.do", {
//					data: {
//						loginedtoken: localStorage.loginedtoken
//					},
//					success: function(data) {
//						if(data.resultCode == 'true') {
//							$("#orderStatus").text('待发货');
//						} else {
//							$("#orderStatus").text('待成团');
//						}
//					}
//			    });
//			}
			app.order = order;
			showStatus(order);
			showPayType(order);
			showLogInfo(order);
			showBtns(order);
			showLogistics(order);
			$("#logisticsprice").html("+ " + app.getPriceStr(0));
			app.orderType = order.type;
			if((order.type == 1 || order.type == 9 || order.type == 3)&&(order.message != "")){
				$(".jordan").show();
				$(".kobe").text("备注: " + order.message);
			}
			if(order.type == 1 || order.type == 9 || order.type == 7) {
				showDeliveryTime(order);
				showAddress(order);
				showVarval(order.virtualfee);
				if(order.type == 1 || order.type == 7) {
					showProduct1(order);
				} else {
					showProduct2(order);
				}
			}
			var deposit = order.deposit;
			if(deposit && deposit > 0) {
				$("#depositbox").show();
				$("#depositbox .app-text-orange").html("- " + app.getPriceStr(deposit));
			}
            var couponfee = order.couponfee;
            if(couponfee && couponfee > 0) {
                $("#couponBox").show();
                $("#coupon").html("- " + app.getPriceStr(couponfee));
            }
			if(order.type == 5) {
				showProduct3(order);
				showPrice(order.sprices);
				$("#totalbox").show();
				$("#totalbox .app-text-orange").html(app.getPriceStr(order.actualpaied));
			}

			if(order.type == app.ORDER_TYPE_ELECTRONIC_CARD ||
				order.type == app.ORDER_TYPE_ENTITY_CARD ||
				order.type == app.ORDER_TYPE_OFFLINE_CARD) {
				showProduct3(order);
				showPrice(order.sprices);
				if(order.type == app.ORDER_TYPE_ELECTRONIC_CARD) {
					loadUser(order)
				} else {
					showAddress(order);
				}

				$("#totalbox").show();
				$("#totalbox .app-text-orange").html(app.getPriceStr(order.actualpaied));
			}

            if(order.type == 8){
                loadUser(order);
                showPrice(order.sprices);
                $("#totalbox .app-text-orange").html(app.getPriceStr(order.actualpaied));
                $("#totalbox").show();
                showProduct8(order);
			}
		});
	}


	//显示地址
	function showAddress(order) {
		try {
			$("#address").show(); //显示地址
			var oaddModel = order.oaddModel;
			$("#addressName").text(oaddModel.consignee);

            var str = oaddModel.fulladdress;
            str = str.replace(/:/g,"").replace(/：/g,"");

            var index1 = str.indexOf("联系人");
            var str1 = str.substring(0,index1).trim();
            var str2 = str.substring(index1 + 3).trim();

            index1 = str2.indexOf("-");
            var str3 = str2.substring(0,index1 - 3).trim();
            var str4 = str2.substring(index1 - 3).trim().replace(/-/g,"");
            
            var varhtml = str3 + " " +str4 + "<br />";
            varhtml += str1;
            

			$("#addressFull").html(varhtml);


			$("#addressPhone").text(oaddModel.mobile);
		} catch(e) {
			$("#address").hide();
		}

	}
	//显示支付方式
	function showPayType(order) {
		$("#payType").text(Order.getPayWay(order.payway));
	}
	//显示最新的订单日志
	function showLogistics(order) {
		var log = order.logs[0];
		$("#LogisticsStatusbox").show();
		$("#LogisticsStatusbox").click(function() {
			app.toLogisticsDetails(order.id);
		});
		$("#LogisticsStatus").text(log.descript);
		$("#delivertime").text(log.createtime);
	}
	//显示配送时间
	function showDeliveryTime(order) {
		$("#targetdeliverydatebox").show(); //显示配送日期
		$("#targetdeliverydate").text(order.targetdeliverydate.split(" ")[0]);
	}
	//显示订单状态
	function showStatus(order) {    
		var status = Order.getStatus(order);
		$("#orderStatus").text(status.text);
		var iconMap = {
			1: "icon-zhifu",
			2: "icon-daifahuo2",
			3: "icon-daifahuo1",
			6: "icon-jiaoyiguanbi",
			5: "icon-qianshou101",
			4: "icon-qianshou101",
			7: "icon-shizhong"
		}
		$("#orderStatusIcon").addClass(iconMap[status.status]);
	}
	//显示订单日志信息
	function showLogInfo(order) {
		$("#orderloginfo").append("<p>订单编号：" + order.orderno + "</p>");
		if(order.paylogid) {
			$("#orderloginfo").append("<p>交易流水号：" + order.paylogid + "</p>");
		}
		$("#orderloginfo").append("<p>创建时间：" + order.createtime + "</p>");
		if(order.paytime) {
			$("#orderloginfo").append("<p>付款时间：" + order.paytime + "</p>");
		}
		if(order.delivertime)
			$("#orderloginfo").append("<p>发货时间：" + order.delivertime + "</p>");
		if(order.finishtime)
			$("#orderloginfo").append("<p>成交时间：" + order.finishtime + "</p>");
	}
	//显示按钮组
	function showBtns(order) {
		var group = Order.getBtnGroupId(order);
		order = jQuery.extend(order, order, group);
		var temp = app.getTempBySelector("#btnGroup");
		if((!group.btnCancle) && (!group.btnCommend) && (!group.btnQrcode) && (!group.btnDelete)) {
			$("#footer").hide();
			$("#downlow").show();
		}
		$("#btns").html(temp(order));
	}
	//显示商品1-自选菜
	function showProduct1(order) {
		var data = order.items;
		var temp = app.getTempBySelector("#gdsTemp1");
		$.each(data, function(i, item) {
			if(item) {
				if(i > 4) {
					item.hide = true;
				}
				$("#goodsList").append(temp(item));
			}
		});
		if(data.length > 5) {
			$("#goodsList").append(app.getTempBySelector("#showMoreTemp")({}));
		}
	}
	//显示商品-卡
	function showProduct3(order) {
		var data = order.items;
		var temp = app.getTempBySelector("#gdsTemp3");
		$.each(data, function(i, item) {
			console.log(item);
			if(item) {
				if(i > 4) {
					item.hide = true;
				}
				$("#goodsList").append(temp(item));
			}
		});
		if(data.length > 5) {
			$("#goodsList").append(app.getTempBySelector("#showMoreTemp")({}));
		}
	}
	//显示宅配套餐商品
	function showProduct2(order) {
		var item = order.items[0];
		var temp = app.getTempBySelector("#gdsTemp2");
		$("#goodsList").append(temp(item));
		var combo = item["comboItems"];
		temp = app.getTempBySelector("#gdsTemp4");
		$.each(combo, function(i, it) {
			it.traceback = item.traceback == "true";
			$("#skubox_" + item.id).append(temp(it));
		})
	}
    //显示观光卡商品
    function showProduct8(order) {
        var data = order.items;
        var temp = app.getTempBySelector("#gdsTemp8");
        $.each(data, function(i, item) {
            console.log(item);
            if(item) {
                if(i > 4) {
                    item.hide = true;
                }
                $("#goodsList").append(temp(item));
            }
        });
        if(data.length > 5) {
            $("#goodsList").append(app.getTempBySelector("#showMoreTemp")({}));
        }
    }
	app.toTrace = function(flag, sn) {
		if(flag)
			app.replace("../Trace/projectTempDemo.html?orderid=" + app.order.id + "&skusn=" + sn);
	};
	//显示扣减的虚拟斤数
	function showVarval(num) {
		$("#priceLable").text("商品斤数：");
		$("#price").text((num / 1000).toFixed(2) + "kg");
	}
	//显示余额，小于3就提示
	function showBalance(varval) {
		$("#varvalbox").show();
		if(varval < 3) {
			$("#balanceTip").show();
		} else {
			$("#balanceTip").hide();
		}

		$("#varval").text(varval + "kg");
	}
	//加载用户信息
	function loadUser(order) {
		app.getUser(function(user) {
			if(order.type == app.ORDER_TYPE_ELECTRONIC_CARD) {
				$("#addressdzk").show();
				$("#userMobile").text(user.mobile);
			}
			if(order.type==8){
                $("#addressggq").show();
                $("#ggqUserMobile").text(user.mobile);
			}
		});
	};
	//去支付
	app.toPay = function(id) {
		var order = app.order;
		if(order.type == app.ORDER_TYPE_OPTION ||
			order.type == app.ORDER_TYPE_PACKAGE) {
			app.replace("../html/confirmpay.html?oid=" + order.id + "&ono=" + order.orderno +
				"&money=" + order.virtualfee + "&type=" + order.type);
		} else {
			app.replace("../html/confirmpay.html?oid=" + order.id + "&ono=" + order.orderno +
				"&money=" + order.actualpaied +
				"&type=" + order.type + "&payway=" + order.payway +
				"&virtualfee=" + order.virtualfee / 1000);
		}
	};

	//去评论
	app.toCommend = function(id) {
		app.setLocalObjet("evaorder", app.order);
		app.replace("../html/evaluation.html?oid=" + id);
	};

	//查看订单日志
	app.toLogisticsDetails = function(id) {
		app.replace("../html/logisticsDetails.html?oid=" + id);
	};
	//取消订单
	app.cancleOrder = function(id) {
		var dialog = new auiDialog();
		dialog.alert({
			title: "提示",
			msg: '是否取消该订单?',
			buttons: ['取消', '确定']
		}, function(ret) {
			if(ret.buttonIndex == 2) {
				Order.cancleOrder(id, function() {
					app.replace(location.href);
				});
			}
		});
	};
	//删除订单订单
	app.DeleteOrder = function(id) {
		var dialog = new auiDialog();
		dialog.alert({
			title: "提示",
			msg: '是否删除该订单?',
			buttons: ['取消', '确定']
		}, function(ret) {
			if(ret.buttonIndex == 2) {
				Order.delOrder(id, function() {
					dialog.remove();
					var dialog1 = new auiDialog();
					dialog1.alert({
						title: "提示",
						msg: '删除成功',
						buttons: ['确定']
					}, function(ret) {
						//history.back();
						app.replace('../html/orderList.html');
					});
				});
			}
		});
	};
	//返回商城首页
	app.toHome = function(){
		app.gotoIndexPage();
	}
	//显示，隐藏套餐下的内容
	app.showCombo = function(e, id) {
		$(e).toggleClass("active");
		if($(e).hasClass("active")) {
			$("#skubox_" + id).slideDown(200);
		} else {
			$("#skubox_" + id).slideUp(200);
		}
	}

	//商品展开动画
	function showProductAnimation(list, index) {
		if(list[index]) {
			$(list[index]).slideDown(100, function() {
				showProductAnimation(list, index + 1);
			});
		}
	}
	//商品收起动画
	function hideProductAnimation(list, index) {
		if(list[index]) {
			$(list[index]).slideUp(20, function() {
				hideProductAnimation(list, index - 1);
			});
		}
	}
	//显示二维码
	app.showCode = function() {
		$("body").append("<div class='dlg_bg' ></div>");
		$("body").append("<div onclick='app.hideCode()' id='qrcodebox' style='position:fixed;z-index:1000;top:0;bottom:0;width:100%;'><div class='center_outter' style='width:100%;height:100%'><div class='center_inner'><img src='" + app.order.qrcode.replace("/image/", "") + "' width='70%'></div></div></div>")
		$("#qrcodebox").on("touchmove", function(e) {
			app.stopBubble(e);
			e.preventDefault();
		});
		$(".dlg_bg").on("touchmove", function(e) {
			app.stopBubble(e);
			e.preventDefault();
		});
		$("#qrcodebox").animateCss("zoomIn");
	};
	//隐藏二维码
	app.hideCode = function() {
		$("#qrcodebox").animateCss("zoomOut", function() {
			$(".dlg_bg").remove();
			$("#qrcodebox").remove();
		});
	};
	//页面点击 查看更多/收起
	app.clickShowMore = function(e) {
		var text = $(e).find(".aui-text-center").text();
		var list = $("#goodsList .none");
		if(text == "查看更多") {
			showProductAnimation(list, 0);
			$(e).find(".aui-text-center").text("收起");
		} else {
			hideProductAnimation(list, list.length - 1);
			$(e).find(".aui-text-center").text("查看更多");
		}
	}
	return app;
});