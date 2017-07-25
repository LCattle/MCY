/**
 * 封装一些购物车的基本操作
 */
define([], function() {

	var car = {
		sum: 0, //总数
		data: {}, //具体的商品数据
		isSynchro: false,
		isNetBack: true,
		getLocal: function() {
			var data = app.getLocalObject("cardShoppingCar");
			if(data) {
				return data.data;
			}
			return {};
		},
		save: function() { //保存到
			app.setLocalObjet("cardShoppingCar", {
				isSynchro: this.isSynchro,
				data: this.data
			});
		},
		toAryData: function() {
			var ary = [];
			$.each(this.data, function(i, item) {
				ary.push(item);
			});
			return ary;
		},
		getSkus: function() { //获取所有的sku
			var str = "";
			$.each(this.data, function(i, item) {
				if(item){
					str += "," + item.skuid;
				}
			});
			return str.replace(",", "");
		},
		init: function(callback) {
			if(app.checkLogin()) {
				this.getCar(callback);
			} else {
				var data = app.getLocalObject("cardShoppingCar");
				if(data) {
					this.isSynchro = data.isSynchro;
					this.setData(data.data);
				}
				callback();
			}
		},
		setData: function(data) { //设置购物车数据，并计算总值
			this.data = {};
			this.sum = 0;
			var me = this;
			$.each(data, function(i, item) {
				if(data instanceof Array) {
					if(item && item.skuid) {
						me.sum += item.skucount;
						me.data[item.skuid + ""] = item;
					}
				} else {
					if(item) {
						me.sum += item.skucount;
						me.data[i] = item;
					}
				}
			});
			this.save();
		},
		addLocal: function(skuid, num) {
			num = num ? num : 1;
			var skuCount = num;
			var sku = this.data[skuid];
			if(sku) {
				sku.skucount += num;
			} else {
				this.data[skuid] = {
					skuid: skuid,
					skucount: num
				};
			}
			this.sum += num;
			this.save();
		},
		add: function(skuid, num, callBack) { //添加操作
			this.isNetBack = false;
			num = num ? num : 1;
			var skuCount = num;
			var sku = this.data[skuid];
			if(sku) {
				skuCount = sku.skucount + num;
			}
			if(app.checkLogin()) { //登录走网络
				app.POSTRequest("weixin/mall/shoppingcart/shoppingCartAddOrDeduction.do", {
					data: {
						productId: skuid,
						number: skuCount,
						cartType:"cart"
					},
					loading: "处理中...",
					success: function(data) {
						car.isNetBack = true;
						if(data.resultCode == 1 || data.resultCode == -1) {
							car.addLocal(skuid, num);
							callBack();
						} else {
							app.tipInfo("操作失败：" + data.resultMsg);
						}
					},
					error: function() {
						car.isNetBack = true;
					}
				});
			} else { //未登录走本地
				car.addLocal(skuid, num);
				callBack();
				car.isNetBack = true;
			}
		},
		minus: function(skuid, num, callBack) { //扣减操作
			car.isNetBack = false;
			if(app.checkLogin()) {
				var sku = this.data[skuid];
				num = num ? num : 1;
				var count = 0;
				if(sku) {
					if((sku.skucount - num) < 1) { //扣减完后
					} else { //扣减不完全
						count = sku.skucount - num;
					}
				}
				app.POSTRequest("weixin/mall/shoppingcart/shoppingCartAddOrDeduction.do", {
					data: {
						productId: skuid,
						number: count,
						cartType:"cart"
					},
					loading: "处理中...",
					success: function(data) {
						if(data.resultCode == 1 || data.resultCode == -1) {
							car.minusLocal(skuid, num);
							callBack();
						} else {
							app.tipInfo("操作失败：" + data.resultMsg);
						}
						car.isNetBack = true;
					},
					error: function() {
						car.isNetBack = true;
					}
				});
			} else {
				this.minusLocal(skuid, num);
				callBack();
				car.isNetBack = true;
			}
		},
		minusLocal: function(skuid, num) { //扣减操作
			var sku = this.data[skuid];
			num = num ? num : 1;
			if(sku) {
				if((sku.skucount - num) < 1) { //扣减完后
					this.sum -= sku.skucount;
					this.data[skuid] = undefined;
				} else { //扣减不完全
					this.sum -= num;
					sku.skucount -= num;
				}
				this.isSynchro = false; //设置成未同步
				this.save();
			}
		},
        setNum: function(skuid, num, callBack) { //扣减操作
            car.isNetBack = false;
            if(app.checkLogin()) {
                num = num ? num : 1;
                var count = 0;
                app.POSTRequest("weixin/mall/shoppingcart/shoppingCartAddOrDeduction.do", {
                    data: {
                        productId: skuid,
                        number: num,
                        cartType:"cart"
                    },
                    loading: "处理中...",
                    success: function(data) {
                        if(data.resultCode == 1 || data.resultCode == -1) {
                            car.setNumLocal(skuid, num);
                            callBack();
                        } else {
                            app.tipInfo("操作失败：" + data.resultMsg);
                        }
                        car.isNetBack = true;
                    },
                    error: function() {
                        car.isNetBack = true;
                    }
                });
            } else {
                this.setNumLocal(skuid, num);
                callBack();
                car.isNetBack = true;
            }
        },
		setNumLocal:function(skuid, num){
            var sku = this.data[skuid];
            if(sku) {
                if(num == 0) { //扣减完后
                    this.sum -= sku.skucount;
                    this.data[skuid] = undefined;
                } else { //扣减不完全
                    this.sum += num - sku.skucount;
                    sku.skucount = num;
                }
                this.isSynchro = false; //设置成未同步
                this.save();
            }
		},
		removeLocal: function(ids) {
			ids = ids.toString().split(",");
			for(var i = 0; i < ids.length; i++) {
				var sku = this.data[ids[i]];
				if(sku) {
					this.sum -= sku.skucount;
					this.data[ids[i]] = undefined;
				}
			}
			this.save();
		},
		remove: function(skuid, callBack, error) {
			this.isNetBack = false;
			if(app.checkLogin()) {
				app.POSTRequest("weixin/mall/shoppingcart/shoppingCartDelete.do", {
					data: {
						productIds: skuid,
						cartType:"cart"
					},
					loading: "处理中...",
					success: function(data) {
						if(data.resultCode == 1 || data.resultCode == -1) {
							car.removeLocal(skuid);
							callBack();
						} else {
							if(error && error instanceof Function)
								error();
							app.tipInfo("操作失败：" + data.resultMsg);
						}
						car.isNetBack = true;
					},
					error: function() {
						if(error && error instanceof Function)
							error();
						car.isNetBack = true;
					}
				});
			} else {
				this.removeLocal(skuid);
				callBack();
				car.isNetBack = true;
			}
		},
		/**
		 *网络同步操作 
		 */
		netSynchro: function() {
			this.isSynchro = true;
		},
		/**
		 * 从网路获取购物车
		 */
		getCar: function(callBack) {
			this.isNetBack = false;
			app.POSTRequest("weixin/mall/shoppingcart/shoppingCartDetail.do", {
				data: {
					cartType:"cart"
					},
				success: function(data) {
					if(data.resultCode == 1 || data.resultCode == -1) {
						car.setData(data.resultObj);
					} else {
						app.tipInfo(data.resultMsg);
					}
					callBack();
					car.isNetBack = true;
				},
				error: function() {
					callBack();
					car.isNetBack = true;
				}
			});
		}
	}
	return car;
});