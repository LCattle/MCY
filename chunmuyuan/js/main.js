'use strict';
var reconfig = {
	paths: {
		dialog: '../lib/aui/script/aui-dialog',
		jquery: '../lib/jquery',
		tab: '../lib/aui/script/aui-tab',
		toast: '../lib/aui/script/aui-toast',
		expand: 'base/objectExpand',
		language: 'base/language',
		animate: "../lib/animation/animation",
		move: "../lib/animation/move.min",
		css: '../lib/requirejs/css',
		refresher: '../lib/dropload/refresher',
		popu: '../lib/toastr/scripts/toastr.popupMessage',
		picker: '../lib/picker/dist/picker.min',
		clipImg: '../lib/clipImg/jquery.photoClip',
		hammer: '../lib/clipImg/hammer',
		swipe: '../lib/swipe/swiper-3.4.1.min',
		webuploader: '../lib/webuploader/webuploader.min',
		popup: '../lib/aui/script/aui-popup',
		fastclick: '../lib/zepto/fastclick',
		scroll:	'../lib/aui/script/aui-scroll',
		app: "app"
	},
	map: {
		'*': {
			'css': 'css'
		}
	},
	shim: {
		webuploader: ['css!../lib/webuploader/webuploader.css'],
		refresher: ['../lib/dropload/dist/dropload', 'css!../lib/dropload/dist/dropload', "../lib/dropload/dist/jquery.scrollTo.min"],
		picker: [],
		swipe: ['css!../lib/swipe/swiper-3.4.1.min'],
		clipImg: ['../lib/clipImg/sonic', '../lib/clipImg/comm', 'hammer', '../lib/clipImg/iscroll-zoom'],
		language: ["jquery"],
		app: ["jquery", "dialog", "tab", "toast", "expand"]
	}
};
(function() {

	var currVersion = "";

	var xmlhttp;

	function initVersoin() {
		xmlhttp = null;
		if(window.XMLHttpRequest) { // code for all new browsers
			xmlhttp = new XMLHttpRequest();
		} else if(window.ActiveXObject) { // code for IE5 and IE6
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		}
		if(xmlhttp != null) {
			xmlhttp.onreadystatechange = state_Change;
			var href = location.href.split("chunmuyuan")[0] +
				"chunmuyuan/js/";
			xmlhttp.open("GET", href + "config.js?v=" + new Date().getTime(), false);
			xmlhttp.send(null);
		}
	}

	function state_Change() {
		if(xmlhttp.readyState == 4) { // 4 = "loaded"
			if(xmlhttp.status == 200) { // 200 = OK
				console.log(eval(xmlhttp.responseText));
				currVersion = eval(xmlhttp.responseText);
			} else {

			}
		}
	}
	initVersoin();
	if(currVersion) {
		reconfig.urlArgs = currVersion;
	}
	var el = document.querySelector("[data-app]");
	var appEnter = ""
	if(el) {
		appEnter = el.getAttribute("data-app");
	}
	if(appEnter) {
		reconfig.paths.app = appEnter;
	} else {
		var ary = location.pathname.split("/");
		var file = ary[ary.length - 1].split(".")[0];
		reconfig.paths.app = file;
	}
	require.config(reconfig);
	/**
	 * 5.12号改
	 * 先请求nativeutil，将loginToken获取
	 */
	require(
		[
			'base/nativeutil',
			"jquery"
		],
		function() {
			
			var b = nativeGetShareData("loginedToken", 1, function(val) {
				if(Object.prototype.toString.call(val) === "[object String]") {
					val = $.parseJSON(val);
				}
				//如果val存在 切 有value字段
				if(val && val.hasOwnProperty("value")) {
					val = val.value;
				} else {
					val = "";
				}
				//将登陆信息写入本地存储
				localStorage.loginedToken = val;
				require(["app"], function(app) {

					app.start();
				});
			})

			//如果不是原生执行，那么直接请求app
			if(!b) {
				require(["app"], function(app) {
					app.start();
				});
				return;
			}

		}
	);

})();