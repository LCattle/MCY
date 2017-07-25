define([], function() {
	return {
		data: null,
		pageIndex: 1, //默认值都可修改
		pageSize: 10,
		addData: function(data) { //追加数据
			if(this.data) {
				this.data = this.data.concat(data);
			} else {
				this.data = data;
			}
		},
		hasNextPage: true,
		reset: function() {
			this.pageIndex = 1;
			this.hasNextPage = true;
			this.data = null;
		},
		getObj: function(key, value) {
			if(this.data) {
				for(var i = 0; i < this.data.length; i++) {
					var item = this.data[i];
					if(item && item[key] == value) {
						return item;
					}
				}
			}
			return null;
		}
	}
});