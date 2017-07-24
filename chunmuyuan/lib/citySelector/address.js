define([], function() {
	var data = [{
        "id": "19",
        "name": "广东",
        "child": [
            {
                "id": "1607",
                "name": "深圳市",
                "child": [
                    {
                        "id": "3155",
                        "name": "南山区"
                    },
                    {
                        "id": "3638",
                        "name": "罗湖区"
                    },
                    {
                        "id": "3639",
                        "name": "福田区"
                    },
                    {
                        "id": "4773",
                        "name": "宝安区"
                    },
                    {
                        "id": "6675",
                        "name": "光明新区"
                    },
                    {
                        "id": "6736",
                        "name": "坪山新区"
                    },
                    {
                        "id": "6737",
                        "name": "大鹏新区"
                    },
                    {
                        "id": "40152",
                        "name": "龙岗区"
                    },
                    {
                        "id": "47387",
                        "name": "盐田区"
                    },
                    {
                        "id": "47388",
                        "name": "龙华新区"
                    }
                ]
            },
            {
                "id": "47394",
                "name": "河源市",
                "child": [
                    {
                        "id": "47477",
                        "name": "源城区"
                    },
                    {
                        "id": "47478",
                        "name": "和平县"
                    },
                    {
                        "id": "47479",
                        "name": "龙川县"
                    },
                    {
                        "id": "47480",
                        "name": "东源县"
                    },
                    {
                        "id": "47481",
                        "name": "紫金县"
                    },
                    {
                        "id": "47482",
                        "name": "连平县"
                    }
                ]
            }
        ]
    }];
	var obj = {
		data: data,
		getChild: function(data, childId) {
			for(var i = 0; i < data.length; i++) {
				var pro = data[i]
				if(pro.id == childId) {
					return {
						data: pro,
						index: i
					}
				}
			}
		},
		getIAreaData: function(pid, cid, countyId) {
			var province = this.getChild(this.data, pid);
			if(!province) {
				return {
					vals: [],
					province: "",
					city: "",
					county: ""
				};
			}
			var city = this.getChild(province.data.child, cid);
			if(!city) {
				return {
					vals: [province.index],
					province: province.data.name,
					city: "",
					county: ""
				}
			}
			var county = this.getChild(city.data.child, countyId);
			if(!county) {
				return {
					vals: [province.index,city.index],
					province: province.data.name,
					city: city.data.name,
					county: ""
				}
			}
			return {
					vals: [province.index,city.index,county.index],
					province: province.data.name,
					city: city.data.name,
					county: county.data.name
			}
		}
	}
	return obj;
});