//地址选择
define(["base/baseApp", 'animate', "dialog"], function(app, animate, dialog) {
	app.initPage = function() {
		var h = $(window).height() - $("footer").height();
		$("#list").height(h);
	};
	var addressList = [];
	app.selected = function(id) {
		$.each(addressList, function(i, item) {
			if(item.id == id) {
				if(item.isDefault != 1) {
					app.setLocalObjet("yx_selectAddress",item);
					var backUrl = localStorage.selectAdressBackUrl;
					if(backUrl){
						//history.back();
						app.replace(backUrl);
					}else{
						app.replace("confirmOrder.html");
					}
				}
			}
		});
	}

	//跳转到编辑页面
	app.editAddress = function(id, e) {
		app.stopBubble(e);
		localStorage.addressBackUrl = location.href;
		location.href = "addressEdit_yx.html?addressId=" + id;
	};
	//开始执行
	app.init = function() {
		var selectAddress = app.getLocalObject("yx_selectAddress");
		if(selectAddress){
			app.selectedId = selectAddress.id;
		}
		loadAddress();
	};
	app.clickDel = function(id) {
		var dialog = new auiDialog();
		dialog.alert({
			title: "提示",
			msg: '是否删除该地址？',
			buttons: ['取消', '确定']
		}, function(ret) {
			if(ret.buttonIndex == 2) {
				delAddress(id);
			}
		})
	};

	function delAddress(id) {
		app.POSTRequest_m("member/address/addressDelete.do", {
			data: {
				useraddressId: id
			},
			loading: "处理中...",
			success: function(data) {
				if(data.resultCode == 1) {
					$("#address_" + id).animateCss("fadeOut", function() {
						$("#address_" + id).remove();
					});
				} else {
					app.tipInfo(data.resultMsg);
				}
			}
		});
	}
	/**
	 *加载地址信息 
	 */
	function loadAddress() {
		app.POSTRequest_m("member/address/addressLists.do", {
			data: {},
			loading: "数据加载中...",
			success: function(data) {
				if(data.resultCode == 1) {
					showAddreses(data.resultObj);
				} else {
					app.tipInfo(data.resultMsg);
				}
			}
		});
	}
	//显示地址信息
	function showAddreses(data) {
		var temp = app.getTempBySelector("#addressTemplate");
		addressList = data;
		$.each(data, function(i, item) {
			//算错选中的id
			if(app.selectedId==item.id){
				item.selected = true;
			}else if(!app.selectedId&&item.isdefault){
				item.selected = true;
			}
			$("#list").append(temp(item));
		});
	}
	//重新登录超时方法
	app.loginTimeOut = function() {
		app.toLoginPage(location.href);
	}
	return app;
});