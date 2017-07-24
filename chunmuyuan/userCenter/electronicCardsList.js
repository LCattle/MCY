/**
 * Created by wuxuanhua on 17/5/8.
 */

define(["base/baseApp", "dialog", "refresher", "./base/basePage"], function(app, dialog, refresher, page) {

	//获取页面模版
	var Cards = app.getTempBySelector("#cardsTemplate"); //电子卡

	//初始化
	app.init = function() {
		initRefresh();
		getCardsList();
	};

	//初始化页面
	app.initPage = function() {
		var h = $(window).height();
		$("#list").css("min-height", h + "px");
		$("#wrapper").css("height", h + "px");
		$("#wrapper").css("overflow", "scroll");
	};

	//初始化下拉刷新
	function initRefresh() {
		app.pageRefresher = refresher.initDropload("#wrapper", function(me) {
			page.reset();
			me.noData(false);
			getCardsList();
		}, function(me) {
			if(page.hasNextPage) {
				getCardsList();
			} else {
				me.noData();
				me.resetload();
			}
		});
	}

	function drawList(dataList) {
		dataList = dataList || [];
		if(page.pageIndex == 1) {
			$("#list").empty();
			if(dataList.length == 0) {
				app.emptyList("#list", "还没有电子卡哦")
			}
		}
		var listsHtml = '';
		dataList.forEach(function(item, index) {
			item.start = item.start.split(" ")[0];
			item.end = item.end.split(" ")[0];
			if(item.sendFlag == "Y") {
				item.canActive = item.status == "0"
			} else {
				item.canActive = (item.buyFlag == 'N' && item.status == "0")
			}

			if(item.status == 0) {
				item.activateImg = '<img id="activate" src="../imgs/user-center/not-activated.png">';
			} else {
				item.activateImg = '<img id="activate" src="../imgs/user-center/activated.png">';
			}
			//sendFlag Y：可赠送，N：不可赠送
			//status 0：未激活，1：已激活
			listsHtml += Cards(item); //未激活
		});
		$("#list").append(listsHtml);
	}

	//获取电子卡列表
	function getCardsList() {
		app.POSTRequest("weixin/mall/card/queryCards.do", {
			data: {
				beginPage: page.pageIndex,
				pageSize: page.pageSize
			},
			loading: "加载中...",
			success: function(data) {
				app.pageRefresher.resetload();
				if(data.resultCode === "1") {
					page.hasNextPage = data.basePageObj.hasNextPage;

					var dataList = data.resultObj || [];
					page.addData(dataList); //往page添加数据

					drawList(dataList);

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

	//激活
	app.doActivate = function(cardNo) {
		var dialog = new auiDialog({});
		dialog.alert({
			title: "",
			msg: '确定要激活该张卡？',
			buttons: ['取消', '确定']
		}, function(ret) {
			if(ret.buttonIndex == 2) {
				activeteAction(cardNo);
			}
		});
	};

	//激活卡
	function activeteAction(cardNo) {
		app.POSTRequest("weixin/mall/card/activateCardUnPwd.do", {
			data: {
				cardNo: cardNo
			},
			loading: "提交中...",
			success: function(data) {
				if(data.resultCode == '1') {
					app.success("激活成功");
					$("#" + cardNo).find('.aui-list-item-right').hide();
					$("#" + cardNo).find('#activate').attr('src', '../imgs/user-center/activated.png');
					$("#" + cardNo).find('#send-card').hide();
				} else {
					app.tipInfo(data.resultMsg);
				}
			}
		});
	}

	//赠送
	app.doGive = function(cardNo) {
		nativeOpenSelectAFriend(function(data) {
			if(app.isString(data)) {
				data = $.parseJSON(data);
			}
			if(data.code == 1) {
				var f = data.friendInfo;
				if(f && f.length > 0) {
					give(cardNo, f[0].knowid, (f[0].remark ? f[0].remark : f[0].knowmobile));
				}
			}
		});
	};

	function give(cardNo, consigneeId, phone) {
		var dialog = new auiDialog({});
		dialog.alert({
			msg: '确定要将该卡赠送给好友（' + phone + '）？',
			buttons: ['取消', '确定']
		}, function(ret) {
			if(ret.buttonIndex == 2) {
				app.sendCardAction(cardNo, consigneeId);
			}

		});
	}
	//赠送卡
	app.sendCardAction = function(cardNo, consigneeId) {
		app.POSTRequest("weixin/mall/card/sendCard.do", {
			data: {
				cardNo: cardNo,
				consigneeId: consigneeId
			},
			success: function(data) {
				if(data.resultCode == '1') {
					app.success("赠送成功");
					$("#" + cardNo).find('.aui-list-item-right').hide();
					$("#" + cardNo).find('#send-card').hide();
				} else {
					app.tipInfo(data.resultMsg);
				}
			}
		});
	}

	return app;
});