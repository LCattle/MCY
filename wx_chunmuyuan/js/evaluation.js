define(['./base/baseApp'], function(app) {
	var order = app.getLocalObject("evaorder");
	if(!order) { //如果没有选择订单
		//history.back();
		location.href = '../html/orderList.html';
	}

	app.init = function() {
		if(order.type != 8){
			$("#wlpj").show();
		}
		if(order.type != app.ORDER_TYPE_RECHARGE_CARD
			&& order.type != app.ORDER_TYPE_ELECTRONIC_CARD
		) {
			initGoods(); //初始化商品信息
			$("#goodsList textarea").focus(function(){
				$('#footer').removeClass("aui-bar-tab");
				$('.confir_sum_order').css('background','none');
			});
			$("#goodsList textarea").blur(function(){
				$('#footer').addClass("aui-bar-tab");
			})
		} else {
			$("#goodsList").parent().hide();
		}
		initStarts(); //初始化评星功能
	};
	//点击提交
	app.submit = function() {
			var data = app.getOrderEvaluation();
			var goodsComm = app.getGoodsEvaluation();
			if(data && goodsComm) {
				data.productComment = JSON.stringify(goodsComm);
				app.POSTRequest("weixin/mall/comment/postComment.do", {
					data: data,
					loading: "处理中...",
					success: function(data) {
						if(data.resultCode == 1) {
							app.tipInfo("评论成功，谢谢您的反馈");
							setTimeout(function() {
								//history.back();
								location.href = '../html/orderList.html';
							}, 2000);
						} else {
							app.tipInfo(data.resultMsg);
						}
					}
				});
			}
		}
		//获取商品的评价
	app.getGoodsEvaluation = function() {
		var goods = order.items;
		var evaluations = [];
		var flag = true;

		$.each(goods, function(index, item) {
			try {
				var text = $("#textarea_" + item.skuid).val().replace(/([\ud800-\udbff][\u0000-\uffff])/g,'').trim();
				if(text.length > 0) {
					if(text.length < 1) {
						app.tipInfo("商品评论要多于1个字哦")
						flag = false;
					}
					evaluations.push({
						skuid: item.skuid,
						comment: text
					});
				}
			} catch(e) {}
		});
		return flag ? evaluations : null;
	};
	/**
	 *获取评星级别 
	 */
	function getStarLv(id){
		var lv_int = $(id+" .icon-wuxing-tianchong").length;
		var lv_float = $(id+" .icon-starhalf").length==1?0.5:0;
		return lv_int + lv_float;
	}
	//获取订单相关评论
	app.getOrderEvaluation = function() {
			var describeStarts = getStarLv("#describeStarts");
			if(describeStarts < 0.5) {
				app.tipInfo("请对描述相符评星");
				return;
			}
			var logisticsStarts = getStarLv("#logisticsStarts");
			if(order.type == 8){
				logisticsStarts = 5;
			}
			if(logisticsStarts < 0.5) {
				app.tipInfo("请对物流服务评星");
				return;
			}
			var serviceStarts = getStarLv("#serviceStarts");
			if(serviceStarts < 0.5) {
				app.tipInfo("请对服务态度评星");
				return;
			}
			var text = $("#ordertextarea").val().replace(/([\ud800-\udbff][\u0000-\uffff])/g,'').trim();
			if(text.length > 0 && text.length < 1) {
				app.tipInfo("订单评语要多于1个字哦");
				return;
			}
			var nike = $("#nikeCheck").hasClass("active") ? "Y" : "N";
			return {
				descPoint: describeStarts,
				deliveryPoint: logisticsStarts,
				attitudePoint: serviceStarts,
				orderComment: text,
				isanonymous: nike,
				orderId: order.id
			}
		}
		//初始化商品
	function initGoods() {
		var goods = order.items;
		var cardtemp = app.getTempBySelector("#cardTemplate");
		var goodsTemp = app.getTempBySelector("#goodsTemp");
		$.each(goods, function(index, item) {
			if(item.ordertype == app.ORDER_TYPE_OPTION ||
				item.ordertype == app.ORDER_TYPE_PACKAGE) {
				$("#goodsList").append(goodsTemp(item));
			} else if(item.ordertype == 8) {
                var ggqTemplate = app.getTempBySelector("#ggqTemplate");
                $("#goodsList").append(ggqTemplate(item));
            } else{
				$("#goodsList").append(cardtemp(item));
			}

		});
	}

	function initStarts() {
		$(".startsbox i").click(function(e) {
			var stars = $(this).parent().find("i");
			var index = stars.length - 1;
			for(var i = 0; i < stars.length; i++) {
				var el = stars[i];
				if(el === this) {
					index = i;
//					var x = e.offsetX;
//					var left = this.offsetLeft;
//					var len = $(this).width();
//					if((left+len/2)>x){
//						$(el).removeClass("icon-wuxing-tianchong");
//						$(el).removeClass("icon-wuxing2");
//						$(el).addClass("icon-starhalf");
//					}else{
//						$(el).addClass("icon-wuxing-tianchong");
//						$(el).removeClass("icon-starhalf");
//						$(el).removeClass("icon-wuxing2");
//					}
				}
				if(i > index) {
					$(el).removeClass("icon-wuxing-tianchong");
					$(el).removeClass("icon-starhalf");
					$(el).addClass("icon-wuxing2");
				} else 
//				if(i<index)
				{
					$(el).addClass("icon-wuxing-tianchong");
					$(el).removeClass("icon-starhalf");
					$(el).removeClass("icon-wuxing2");
				}
			}
		});
	}
	return app;
});