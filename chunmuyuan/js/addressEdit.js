//地址编辑
define(["base/baseApp", '../lib/citySelector/lArea', '../lib/citySelector/address', './base/validate', 'animate', 'css!../lib/citySelector/lArea'], function(app, area, address, validate, animate) {
	app.initPage = function() {};
	var area = new lArea();
	app.addVals = [];
	area.init({
		'trigger': '#address',
		'data': address.data,
		onselected: function(vals, provinceText, cityText, countyText) {
			app.addVals = vals;
			console.log(vals);
			$("#selectArea").text(provinceText + " " + cityText + " " + countyText);
		}
	});
	function validateData() {
		var name = $("#nameInput").val().toString().trim();
		if(validate.checkIsEmpty(name)) {
			app.tipInfo("请输入收货人姓名");
			$("#nameInput").parent().parent().animateCss(animate.shake);
			return;
		}
		if(name.length < 2) {
			app.tipInfo("请输入收货人姓名");
			$("#nameInput").parent().parent().animateCss(animate.shake);
			return;
		}
		var phone = $("#phoneInput").val().toString().trim();
		if(!validate.checkMobilePhone(phone)) {
			app.tipInfo("请输入正确的手机号码");
			$("#phoneInput").parent().parent().animateCss(animate.shake);
			return;
		}
		var selectArea = $("#selectArea").text().trim();
		if(validate.checkIsEmpty(selectArea)) {
			app.tipInfo("请选择所在地区");
			$("#selectArea").parent().parent().animateCss(animate.shake);
			return;
		}
		var details = $("textarea").val().trim();
		if(validate.checkIsEmpty(details)) {
			app.tipInfo("请填写详细地址");
			$("textarea").parent().parent().animateCss(animate.shake);
			return;
		}
		var def = $("#defCheck")[0].checked;
		var province = address.data[app.addVals[0]];
		var city = province.child[app.addVals[1]];
		var county = city.child[app.addVals[2]]
		return {
			consignee: name,
			mobile: phone,
			provinceId: province.id,
			cityId: city.id,
			countyId: county.id,
			detailAddress: details,
			isDefault: def ? 1 : 0
		}
	}
	/**
	 *保存成功后 
	 */
	function onSuccess(isdefault) {
		var backUrl = localStorage.addressBackUrl;
		backUrl = backUrl ? backUrl : 'addressList.html';
		localStorage.addressBackUrl = null;
		if(isdefault){
			localStorage.selectAddress="";
		}
		app.replace(backUrl);
		//window.history.back()
	}
	app.saveAddress = function() {
		var adData = validateData();
		if(adData) {
			var action = "member/address/addressSave.do";
			if(app.UrlParams.addressId) {
				action = "member/address/addressUpdate.do";
				adData.useraddressId =app.UrlParams.addressId; 
			}
			app.POSTRequest_m(action, {
				data: adData,
				success: function(data) {
					if(data.resultCode == 1) {
						onSuccess(adData.isDefault);
					} else {
						app.tipInfo(data.resultMsg);
					}
				}
			});
		}
	};
	//开始执行
	app.init = function() {
		var id = app.UrlParams.addressId;
		if(id){
			loadAddress(id);
			app.changeDOCTitle( "编辑地址");
		}else{
			app.changeDOCTitle( "添加地址");
		}
	};

	function loadAddress(id) {
		app.POSTRequest_m("member/address/addressDetail.do", {
			data: {
				useraddressId: id
			},
			loading:"数据加载中...",
			success: function(data) {
				if(data.resultCode == 1) {
					var areaData = address.getIAreaData(data.resultObj.provinceid, data.resultObj.cityid, data.resultObj.countyid);
					app.addVals = areaData.vals;
					area.value = areaData.vals;
					$("#selectArea").text(areaData.province+" "+areaData.city+" "+areaData.county);
					$("#nameInput").val(data.resultObj.consignee);
					$("#phoneInput").val(data.resultObj.mobile);
					$("textarea").val(data.resultObj.detailaddress);
					$("#defCheck")[0].checked = (data.resultObj.isdefault==1);
				} else {
					app.tipInfo(data.resultMsg);
				}
			}
		});
	}
	//重新登录超时方法
	app.loginTimeOut = function() {
//		app.toLoginPage(location.href);
	}
	return app;
});