define(["../lan-res/ch_res"], function(defaultLan) {
	var LAN = {
		defaultLan: defaultLan
	};
	LAN.changeLan = function(res) {
		require(
			[
				'../lan-res/' + res
			],
			function(lan_res) {
				LAN.defaultLan = Jqurey.extend(lan_res,LAN.defaultLan);
				var lans = $("[lan-res]");
				LAN.changeNodeList(lans);
			}
		);
	}
	LAN.changeNodeList = function(lans) {
		for(var i = 0; i < lans.length; i++) {
			var el = $(lans[i]);
			var key = el.attr("lan-res");
			var text = this.defaultLan[key];
			if(text !== null && text !== undefined&&el[0] instanceof HTMLInputElement) {
				el.val(text)
			} else {
				el.text(text);
			}

		}
	}
	LAN.init = function() {
		var lans = $("[lan-res]");
		this.changeNodeList(lans);
	};
	/**
	 * 获取设置语言的字符串
	 * @param {Object} str
	 */
	LAN.getLanStr = function(str) {
		var div = document.createElement("div");
		div.innerHTML =str;
		this.setElLan(div);
		return div.innerHTML;
	}
	/**
	 * 扫描一个元素和他下面所有的节点，并完成"语言"赋值
	 * @param {Object} el
	 */
	LAN.setElLan = function(el) {
		var nodes = el.childNodes;
		if(el.getAttribute){
			var lanKey = el.getAttribute("lan-res");
			if(lanKey) {
				if(el instanceof HTMLInputElement) {
					el.value = this.defaultLan[lanKey];
				} else {
					el.innerHTML = this.defaultLan[lanKey];
				}
				return;
			}
		}
		if(nodes && nodes.length > 0) {
			for(var i = 0; i < nodes.length; i++) {
				this.setElLan(nodes[i]);
			}
		}
	}
	return LAN;
});