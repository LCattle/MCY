define([], function() {
	var net = {};
	net.netConfig = {
		runType: "dev",
		//前端页面根目录
		pageRoot:"/chunmuyuan",
		//商城服务host前缀
		server: {
			dev: "http://test.springwoods.com/ctower-mall-app/",
			test: "http://112.74.57.203/ctower-mall-app/",
			release: "",
		},
		//基础服务host前缀
		server_i: {
			dev: "http://test.springwoods.com/ctower-mall-i/",
			test: "http://112.74.57.203/ctower-mall-i/",
			release: "",
		},
		//会员服务host前缀
		server_m: {
			dev: "http://test.springwoods.com/ctower-member/",
			test: "http://112.74.57.203/ctower-member/",
			release: "",
		},
		//商品详情页面数据地址
		server_d: {
			dev: "http://test.springwoods.com/static_detail/",
			test: "http://112.74.57.203/static_detail/",
			release: ""
		},
		
		//图片服务host前缀
		imgServer: {
			dev: "http://test.springwoods.com/uploaded/image",
			test: "http://112.74.57.203/uploaded/image",
			release: "",
		},
	};
	//获取图片路径
	net.getImgPath = function(url) {
		var server = this.netConfig.imgServer[this.netConfig.runType];
		return server + url
	};
	//获取小图路径
	net.getThumbPath = function(url) {
		return this.getImgPath("/thumb" + url);
	};
	//获取中图
	net.getMiddelPath = function(url) {
		return this.getImgPath("/middel" + url);
	};
	net.getNetServer = function(type) {
		if(type === "i") {
			return this.netConfig.server_i[this.netConfig.runType];
		} else if(type === "m") {
			return this.netConfig.server_m[this.netConfig.runType];
		} else if(type == "d") {
			return this.netConfig.server_d[this.netConfig.runType];
		}
		return this.netConfig.server[this.netConfig.runType];
	};
	/**
	 * @param {Object} action
	 * @param {Object} obj
	 */
	net.GETRequest_i = function(action, obj) {
		$.ajax(this.getRequestObj(this.getNetServer("i"), action, obj, "GET"));
	}
	net.GETRequest_m = function(action, obj) {
		$.ajax(this.getRequestObj(this.getNetServer("m"), action, obj, "GET"));
	}
	net.GETRequest = function(action, obj) {
		$.ajax(this.getRequestObj(this.getNetServer(), action, obj, "GET"));
	};
	/**
	 * @param {Object} action
	 * @param {Object} obj
	 */
	net.POSTRequest_i = function(action, obj) {
		$.ajax(this.getRequestObj(this.getNetServer("i"), action, obj, "POST"));
	}
	net.POSTRequest_m = function(action, obj) {
		$.ajax(this.getRequestObj(this.getNetServer("m"), action, obj, "POST"));
	}
	net.POSTRequest = function(action, obj) {
		$.ajax(this.getRequestObj(this.getNetServer(), action, obj, "POST"));
	}
	net.getRequestObj = function(server, action, obj, method) {
        var _action = action;
		var default_ = {
			url: server + _action,
			type: method,
			dataType: "json"
		};
		var err = obj.error;
		obj = jQuery.extend(obj, default_);
		//		obj.headers = {
		//          "login-token": 1234
		//     };
		/**写入登录信息*/
		if(obj.data) {
			obj.data.loginedtoken = localStorage.loginedToken;
			obj.data.v = new Date().getTime();
			obj.data.platformSource = 2;
		} else {
			obj.data = {
				v: new Date().getTime(),
				platformSource :2,
				loginedtoken: localStorage.loginedToken
			};
		}
		if(obj.loading) {
			app.loading(obj.loading);
			obj.loading = undefined;
			var comp = obj.complete;
			obj.complete = function() {
				app.hideLoading();
				if(comp && comp instanceof Function) {
					comp();
				}
			}
		}
		obj.error = function(error, status) {
			app.tipInfo("网络错误,请检查网络连接情况");
			if(app.netConfig.runType == "dev") {
				console.log(error);
			}
			if(err && err instanceof Function) {
				err(error, status);
			}
		}
		if(this.netConfig.runType == "dev") {
			console.log(obj);
		}
		return obj;
	}
	return net;
});