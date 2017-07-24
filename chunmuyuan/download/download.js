define(["./base/baseApp"], function(app) {
//	var last = Date.now(),
//		doc = window.document,
//		ifr = doc.createElement('iframe');
//
//	//创建一个隐藏的iframe
//	ifr.src = "springwoods://app/share?url="+location.href;;
//	ifr.style.cssText = 'display:none;border:0;width:0;height:0;';
//	doc.body.appendChild(ifr);
//	location.href = ifr.src;
//	setTimeout(function() {
//		doc.body.removeChild(ifr);
//		//setTimeout回小于2000一般为唤起失败 
//		if(Date.now() - last < 2000) {
//			if(typeof onFail == 'function') {
//			} else {
//			}
//		} else {
//			if(typeof onSuccess == 'function') {
//			}
//		}
//	}, 2000);

	function isWwq() {//微信，微博，扣扣客户端的判断
		var ua = window.navigator.userAgent.toLowerCase();
		if(ua.match(/MicroMessenger/i) == 'micromessenger') {
			return true;
		}else if(ua.match(/WeiBo/i) == "weibo"){
			return true;
		}else if(ua.match(/QQ/i) == "qq"){
			return true;
		}else {
			return false;
		}
	}
	if(isWwq()) {
		$("body").append("<div class='dlg_bg'></div>");
		$(".cover").show();
	}
    $('.dlg_bg').click(function(){
    	$(this).hide();
    	$(".cover").hide();
    })
	var u = navigator.userAgent;
	var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端 
	var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端 
	var appType;
	if(isiOS) {
		appType = "IOS";
	} else {
		appType = "ANDROID";
	}
	$(".downBtn").click(function() {
		
		app.POSTRequest("weixin/mall/download/addDownLoad.do", {
			data: {},
			loading: '',
			success: function(data) {
				downloads();
			},
			error: function(){
				downloads();
			}
		});
		
	});
	
	function downloads(){
		app.POSTRequest("weixin/mall/appversion/versionDetail.do", {
			data: {
				appType: appType
			},
			loading: '',
			success: function(data) {
				if(data.resultCode == 1) {
					location.href = data.resultObj.updateurl;
				}
			}
		});
	}
		
		
	
	return app;
});