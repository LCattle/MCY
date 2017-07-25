define([], function() {
	var util = {
		/**
		 * 转换为货币格式  
		 * @param number	数字
		 * @param places	精度
		 * @param symbol	金钱符号
		 * @param thousand	千位 符号
		 * @param decimal	小数点符号
		 * @return ￥1,000.00  这种格式
		 */
		formatMoney: function(number, places, symbol, thousand, decimal) {
			number = number || 0;
			places = !isNaN(places = Math.abs(places)) ? places : 2;
			symbol = symbol !== undefined ? symbol : "￥";
			thousand = thousand || ",";
			decimal = decimal || ".";
			var negative = number < 0 ? "-" : "",
				i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + "",
				j = (j = i.length) > 3 ? j % 3 : 0;
			return symbol + negative + (j ? i.substr(0, j) + thousand : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : "");
		},
		/**
		 * url 默认值是当前页面的路径
		 * 获取连接上的参数，以对象的方式返回*/
		getUrlParams: function(url) {
			if(!url)
				url = location.search; //获取url中"?"符后的字串 
			var theRequest = new Object();
			if(url.indexOf("?") != -1) {
				var str = url.substr(url.indexOf("?") + 1);
				strs = str.split("&");
				for(var i = 0; i < strs.length; i++) {
					theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);//key=value
				}
			}
			return theRequest;
		},
		/**通过id去寻找temp字符串，得到一个temp function*/
		getTempBySelector: function(Selector) {
			var temp = $(Selector).text();
			return this.getTemp(temp);
		},
		/**通过temp字符串，得到一个temp function*/
		getTemp: function(temp) {
			var expList = temp.match(/<@{1}.{0,}?>{1}/ig);
			return function(it) {
				var html = temp;
				if(expList){
					for(var i = 0; i < expList.length; i++) {
						var exp = expList[i];
						var evalExp = exp.replace(/^<@{1}/, "").replace(/>{1}$/, "").replace(/Eval/g, "_Eval");
						try {
							var result = eval(evalExp);
							html = html.replace(exp, result);
						} catch(e) {
							console.error("[" + e.message + "]" + evalExp);
						}
					}
                }
				return html;
			}
		}
	};
	util.stopBubble = function(e) {
		if(e.stopPropagation) {
			e.stopPropagation(); // 阻止事件冒泡
		} else {
			e.cancelBubble = true; // IE8及之前版本，阻止事件冒泡
		}
	}
	util.UrlParams = util.getUrlParams();
	/**生成uuid*/
	util.uuid = function() {
		var s = [];
		var hexDigits = "0123456789abcdef";
		for(var i = 0; i < 36; i++) {
			s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
		}
		s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
		s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
		s[8] = s[13] = s[18] = s[23] = "-";
		var uuid = s.join("");
		return uuid;
    };
	/**关闭顶部弹出消息*/
	util.closeTips = function(uid) {
		$("#" + uid).animateCss("fadeOutUp", function() {
			$("#" + uid).remove();
		});
	};
	/**顶部弹出消息*/
	util.tipInfo = function(msg) {
		var box = $("#tipmsgbox");
		if(box.length<1){
			$("body").append("<div id='tipmsgbox' class='apptipsbox'></div>");
			box = $("#tipmsgbox");
		}
		if(box.find(".aui-tips").length>1){
			box.find(".aui-tips").eq(0).remove();
		}
		var uid = this.uuid();
		var html = "<div id='" + uid + "' class=\"aui-tips aui-margin-b-15\" >" +
			"<i class=\"aui-iconfont aui-icon-info\"></i>" +
			"<div class=\"aui-tips-title aui-ellipsis-1\">" + msg + "</div>" +
			"<i class=\"aui-iconfont aui-icon-close\" tapmode onclick=\"app.closeTips('" + uid + "')\"></i>" +
			"</div>";
		box.append(html);
		$("#" + uid).animateCss("fadeInDown", function() {
			setTimeout(function() {
				app.closeTips(uid);
			}, 1500);
		});
	};
	/**
	 * 获取localStorage中的值并转换成json对象
	 * 依赖$对象
	 * @param {Object} key
	 */
	util.getLocalObject = function(key) {
		if(localStorage.hasOwnProperty(key)) {
			var str = localStorage[key];
			if(str != null && str !== undefined) {
				try {
					return $.parseJSON(str);
				} catch(e) {
					return null;
				}
			}
		}
		return null;
	};
	/**
	 * getlocalstorage 设置一个对象
	 * @param {Object} key 键
	 * @param {Object} value 值
	 */
	util.setLocalObjet = function(key, value) {
		localStorage[key] = JSON.stringify(value);
	};
	//换算成千克
	util.getKg = function(num) {
		return(num / 1000).toFixed(2) + "kg";
	};
	//换算成金额显示
	util.getPriceStr = function(num) {
		num = app.formatMoney(num, 2, "", ",", ".");
		var ary = num.split(".");
		num = "<span style='font-size:0.6rem'>￥</span>" + ary[0] + ".<span style='font-size:0.7rem;'>" + ary[1] + "</span>"
		return num
	}
	util.changeDOCTitle = function(title) {
		var $body = $('body');　　
		document.title = title;
		var $hide = $("<div style='display:none'></div>").appendTo($body);
		// hack在微信等webview中无法修改document.title的情况
		var $iframe = $('<iframe src="/favicon.ico"></iframe>').on('load', function() {　　
			setTimeout(function() {　　
				$iframe.off('load').remove();
				$($hide).remove();　　
			}, 0)　　
		}).appendTo($hide)
	}
    /**
     * 将数据转化成url的search部分
     */
    util.dataToSearchStr = function(data) {
        var keys = [];
        for(key in data) {
            keys.push(key);
        }
        keys.sort(function(k1, k2) {
            return(k1 > k2) ? -1 : 1;
        });
        var str = "";
        for(var i = 0; i < keys.length; i++) {
            key = keys[i];
            str += "&" + key + "=" + data[key];
        }
        return str.replace("&", "");
    };
    /**
     * rem转换px值
     */
    util.REM2PX = function(rem) {
        var htmlFontSize = parseFloat($("html").css("font-size"));
        return rem * htmlFontSize;
    };
	return util;
});