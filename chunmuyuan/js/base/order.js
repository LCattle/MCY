define([], function() {
	var orderservice = {
		//获取支付方式
		getPayWay: function(payway) {
			switch(payway) {
				case "10":
					return "微信支付";
				case "80":
					return "支付宝";
				case "90":
					return "Apple Pay";
				case "100":
					return "游戏兑换";
				case "20":
					return "余额支付";
				case "30":
					return "货到付款";
				case "40":
					return "线下转账";
				case "50":
					return "银联支付";
				case "60":
					return "活动赠送";
				default:
					return "";
			}
		},
		paywayMap: {
			10: "wx",
			40: "offline",
			30: "cod",
			20: "balance",
			80: "alipay",
			90: "apple",
			50: "union"
		},
		getLogistics: function(status) {
			switch(status) {
				case "1":
					return "待发货";
				case "2":
					return "已拣货待出库";
				case "3":
					return "已出库";
				case "4":
					return "已签收";
				case "5":
					return "已拒收";
				case "6":
					return "待拣货";
				case "7":
					return "待自提";
				case "8":
					return "已自提";
				default:
					return "";
			}
		},
		type: {
			1: "自选菜订单",
			2: "宅配订单"
		},
		getBtnGroupId: function(order) {
			var orderType = order.type;
			var orderStatus = order.status;
			var payStatus = order.paystatus;
			var payway = order.payway;
			var deliverystatus = order.deliverystatus;
			var comstatus = order.commentstatus;
			var billing = order.billing; // 1未开发票 2已开发发票
			var btns = {};
			btns.btnDetail = true;
			if(orderStatus == 1) { //已提交
				if(payStatus == "20" &&
					(orderType == "3" || orderType == "4" || orderType == "5" ||
						orderType == "6" || orderType == "10")) {
					if(billing == '1') {
						btns.btnInvoice = true;
					} else if(billing == '2') {
						btns.btnLookInvoice = true;
					}

				}
				if(payStatus == "10" && payway == "40") {
					btns.btnPay = true;
					btns.btnCancle = false;
					return btns;
				}
				if(payStatus == "10" && payway == "30" && deliverystatus == '1'){
                	btns.btnPay = false;
                    btns.btnCancle = true;
                    return btns;
                }
				if(payStatus == "10" && payway != "30" && payway != "40") { //线下付款的
					btns.btnPay = true;
					btns.btnCancle = true;
					return btns;
				}
				if(deliverystatus != 1 && payway == 30) { //货到付款的要加一个按钮显示二维码
					btns.btnQrcode = true;
					return btns;
				}
				if(order.type == 3 && deliverystatus == 1 && payway == 30) { //实体卡订单
					btns.btnCancle = true;
					return btns;
				}
				btns.btnLogistic = true;
				return btns
			} else if(orderStatus == 2) { //已完成
				if(payStatus == "20" &&
					(orderType == "3" || orderType == "4" || orderType == "5" ||
						orderType == "6" || orderType == "10")) {
					if(billing == '1') {
						btns.btnInvoice = true;
					} else if(billing == '2') {
						btns.btnLookInvoice = true;
					}
				}
				btns.btnLogistic = true;
				btns.btnDelete = true;
				if(comstatus == 0) { //未评论
					btns.btnCommend = true;
					return btns;
				}
				return btns;
			} else if(orderStatus == 3) { //关闭
				btns.btnDelete = true;
				return btns;
			} else {
				btns.btnDelete = true;
				return btns;
			}
			return btns;
		},
		getStatus: function(order) {
			var orderStatus = order.status;
			var payStatus = order.paystatus;
			var payway = order.payway;
			var deliverystatus = order.deliverystatus;
			var comstatus = order.commentstatus;
			var deliverymode = order.deliverymode;
			var order_type = order.type;
			if(orderStatus == 1) { //已提交
				if(order_type == 9) {
					if(payStatus == "10") { //货到付款的
						return {
							text: "待支付",
							status: 1
						};
					} else {
						var res = {};
						var isnet = true;
						if(deliverystatus == "1" || deliverystatus == "2") {
							res = {
								text: "待发货",
								status: 2
							};
						} else if(deliverystatus == "6") {
							res = {
								text: "待拣货",
								status: 3
							}
						} else {
							res = {
								text: "配送中",
								status: 3
							}
						}
						return res;
					}
				} else {
					if(payStatus == "10" && payway != "30") { //货到付款的
						return {
							text: "待支付",
							status: 1
						};
					}
					//已付款
					if((deliverystatus == "1" || deliverystatus == "2") && deliverymode == "30") {
						return {
							text: "待自提",
							status: 2
						};
					}
					if(deliverystatus == "1" || deliverystatus == "2") {
						return {
							text: "待发货",
							status: 2
						};
					}
					if(deliverystatus == "6" && deliverymode == "30") {
						return {
							text: "待自提",
							status: 3
						}
					}
					if(deliverystatus == "6") {
						return {
							text: "待拣货",
							status: 3
						}
					}
					if(deliverystatus == "7") {
						return {
							text: "待自提",
							status: 3
						}
					}
					if(deliverystatus == "8") {
						return {
							text: "已自提",
							status: 4
						}
					}
					if(deliverymode == "30") {
						return {
							text: "待自提",
							status: 3
						}
					}
					return {
						text: "配送中",
						status: 3
					}
				}

			} else if(orderStatus == 2) {
				return {
					text: "已完成",
					status: 4
				};
			} else if(orderStatus == 3) {
				return {
					text: "已取消",
					status: 5
				};
			} else {
				return {
					text: "已关闭",
					status: 6
				}
			}
		},
		//删除订单
		delOrder: function(orderId, callBack) {
			app.POSTRequest("weixin/mall/order/operateOrder.do", {
				data: {
					orderId: orderId,
					operateType: 1
				},
				success: function(data) {
					if(data.resultCode == 1) {
						callBack();
					} else {
						app.tipInfo(data.resultMsg);
					}
				}
			});
		},
		//取消订单
		cancleOrder: function(orderId, callBack) {
			app.POSTRequest("weixin/mall/order/operateOrder.do", {
				data: {
					orderId: orderId,
					operateType: 0
				},
				success: function(data) {
					if(data.resultCode == 1) {
						callBack();
					} else {
						app.tipInfo(data.resultMsg);
					}
				}
			});
		},
		//签收订单
		signOrder: function(orderId, callBack) {

		},
		getOrder: function(oid, callBack) {
			app.POSTRequest("weixin/mall/order/orderDetail.do", {
				data: {
					orderId: oid
				},
				success: function(data) {
					if(data.resultCode == 1) {
						callBack(data.resultObj);
					} else {
						app.tipInfo(data.resultMsg);
					}
				}
			});
		},
		//提交订单方法
		/**
		 * 
		 * @param {Object} data 提交订单需要的数据
		 * @param {Object} type 提交订单的类型
		 * @param {Object} callback 订单生成后的回调 参数order
		 */
		submitOrder: function(data, type, callback) {
			var action = "";
			if(type == 1 || type == 2) { //自选菜宅配套餐
				action = "weixin/mall/order/newEntityGoodsSubmitOrder.do";
			} else if(type == 3) { //实体卡
				action = "weixin/mall/order/newGiftCardSubmitOrder.do";
			} else if(type == 5) { //充值卡
				action = "weixin/mall/order/newDefineRecharge.do";
			} else if(type == 4) { //电子卡
				action = "weixin/mall/order/newVirtualCardSubmitOrder.do";
			} else if(type == 8) {
				action = "weixin/mall/order/couponGoodSubmitOrder.do";
			} else if(type == 10) {
				action = "weixin/mall/order/plantGoodsSubmitOrder.do";
			} else if(type == 99) {
				action = "weixin/mall/orderdk/defineDKRecharge.do";
			} else if(type == 9) { //游戏兑换
				action = "weixin/mall/order/entityGameVegeOrder.do";
			}
			if(action) {
				app.POSTRequest(action, {
					data: data,
					//var data = {
					//    loginedtoken:localStorage.loginedToken,
					//    money:app.price,
					//    //skuid: app.UrlParams.skuid,
					//    payway: Order.paywayMap[payway],
					//    staffNo:app.UrlParams.staffNo?app.UrlParams.staffNo:''
					//};
					loading: "订单提交中...",
					success: function(data) {
						console.log(data);
						if(data.resultCode == 1) {
							callback(data.resultObj);
						} else {
							app.tipInfo(data.resultMsg);
						}
					}
				});
			}
		}

	}
	return orderservice;
});