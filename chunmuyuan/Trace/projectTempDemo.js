define(["./base/baseApp",
		"../lib/aui/script/aui-slide",
		"../Trace/highcharts",
		"../Trace/suit",
	],
	function(app, slide) {
		require(["../Trace/exporting"], function() {
		});
		//获取路径参数
		var order = app.UrlParams.orderid;
		var sku = app.UrlParams.skusn;

		app.init = function() { //程序准备完成 相当于 $(functon(){....})
			//请求数据
			app.POSTRequest("region/tracebackTimingtraceback.do", {
				data: {
					orderid: order,
					skusn: sku
				},
				success: function(data) {
					if(data.resultCode == 1) { //请求成功
						retendPage(data.resultObj.tracebackModels);
						var wang = data.resultObj.skuModels.skuname;
						var li = app.getThumbPath(data.resultObj.skuModels.picpath);						
					    $('.text_middle').html(wang);
						$('.breed img').attr("src",li);
                        effect();    
					}else { //提示错误
						app.tipInfo(data.resultMsg);					
					}
				},
			});
		};
		//页面点击效果
		function effect(){	
			$('.like').click(function(e) {
				var src = $(this).children().attr('src');
				var heights = document.body.clientHeight;//可视区域高度
				var tops = $(document).scrollTop(); //滚动条到顶部的垂直高度
				$(".carrousel").css({"margin-top":tops,"height":heights}).show().find("img").attr("src", src);
				$(".carrousel").on("touchmove",function(e){
					app.stopBubble(e);
					e.preventDefault();
				});
			});
			$(".Authentication img").click(function(){					
				var src = $(this).attr('src');
				var heights = document.body.clientHeight;//可视区域高度
				var tops = $(document).scrollTop(); //滚动条到顶部的垂直高度										
				$(".carrousel").css({"margin-top":tops,"height":heights}).show().find("img").attr("src", src);							
				$(".carrousel").on("touchmove",function(e){
					app.stopBubble(e);
					e.preventDefault();
				});	
			});
			$('.carrousel').click(function(){
				$(".carrousel").hide();
				$(".carrousel").find("img").attr("src", "");						
			});	
		};	
		//渲染树 这里需要你去替换数据
		function retendTree(data) {
			var times = [];
			var descriptions = [];	
			//console.log(times);
			//console.log(descriptions);
			var pictures = [];
			if(data.gronodejson) { //如果数据存在
				var aryJson = $.parseJSON(data.gronodejson);
				//console.log(aryJson);
				for(var i = 0; i < aryJson.length; i++) {
					var ary = aryJson[i].Germination.split(",");
					times.push(ary[0].split(" ")[0]);
					descriptions.push(ary[1]);
					pictures.push(app.getThumbPath(ary[2]));
				}
			} else { //数据不存在，造假数据
				for(var i = 0; i < 6; i++) {
					times[i] = '';
					descriptions[i] = '';
					pictures[i] = '';
				}
			}
			for(var i = 1; i <= 6; i++) {
				data["time" + i] = times[i - 1]?times[i - 1]:'';
				data["description" + i] =descriptions[i - 1]?descriptions[i - 1]:'';
				data["picture" + i] =pictures[i - 1]?pictures[i - 1]:'';
			}
		}
		//渲染页面，已溯源码为标准
		function retendPage(data) {
			//先获取页面准备好的html模板
			var template = app.getTempBySelector("#pagetemplate");
			//遍历 数据填充页面
			$.each(data, function(index, item) {
				//处理树节点
				retendTree(item);
				//向你准备的容器填充页面
				$(".aui-slide-wrap").append(template(item));
				try { //处理温度图像
					temperature(".main" + item.id, item.temperaturejson, item.temperatureset);
					$(".main" + item.id).show().siblings().hide();
				} catch(e) {}
				try { //co2图表
					co2(".jeep" + item.id, item.cotwojson, item.cotwoset);
				} catch(e) {}
				try { //光照
					illumination(".lake" + item.id, item.illuminationjson, item.probatchnumber);
				} catch(e) {}
				try { //湿度
					humidity(".easy" + item.id, item.humidityjson, item.humidityset);
				} catch(e) {}
			});
			// 开始启动aui组件滚动页面
			startSlide(data.length);
			//点击事件初始化
			$(".massage li").click(function() {
				var i = $(this).index(); //下标第一种写法
				$(this).addClass("active").siblings().removeClass();
				$(this).parent().parent().next().find('li').eq(i).show().siblings().hide();
			})
		}
		//开始执行轮播
		function startSlide(len) {
			app.slide = new auiSlide({
				container: document.getElementById("aui-slide"),
				//"width": $(window).width(),//宽度
				"height": $('.outer').height(), //高度
				"speed": 700, //速度
				"loop": false, //是否循环
				"pageShow": false, //是否显示分页器
				currentPage: function(index) { //当滑动到第几页
					$(".page-items.active").removeClass("active");
					$(".page-items").eq(index % len).addClass("active");
				}
			})
			for(var i = 0; i < len; i++) {
				if(i == 0) {
					$(".page-wrap").append('<div class="page-items active"></div>');
				} else {
					$(".page-wrap").append('<div class="page-items"></div>');
				}
			}

		}
		//获取一个图标json的最基础的部分
		function getChartJson() {
			var json = {};
			json.chart = {
				renderTo: 'main', //加载路径
				type: 'spline', //图表类型			
			};
			json.exporting = {
				// 是否允许导出
				enabled: false,
			};
			json.legend = {
				layout: 'horizontal', //图例水平显示
				align: 'center',
				enabled: true,
				itemStyle: {
					fontSize: 30,
					fontWeight: 'normal',
				},
				y: 20,
				x: 0,
			};
			json.tooltip = {
				enabled: false, //图例提示框,不显示
			};
			json.plotOptions = { //数据点选项	
				series: { //取消图例点击事件
					events: {
						legendItemClick: function(e) {
							return true;
						}
					}
				},
				spline: {
					lineWidth: 5, //线条宽度	
					lineColor: '#01764a', //线条颜色						 
					shadow: false,
				},
			};
			json.title = {
				text: "",
			};
			json.credits = {
				enabled: false //右下角官网链接
			};
			return json;
		}
		//生成温度图表
		function temperature(id, record,fit) {
			var record = JSON.parse(record);
			var Xdata = [];			
			var Series = [];
			var Fit = parseInt(fit);
			for(var i = 0; i < record.length; i++) {
				var ary = record[i].AirTemperature.split(",");
				Xdata.push(ary[0]);
				Series.push(parseFloat(ary[1]));
			}
			
			var json = getChartJson();
			json.xAxis = {
				categories: Xdata,
				labels: {
					rotation:-45,
					style: {
						fontSize: '20px',
						fontWeight: 'normal'
					},
					align: 'center', // 标签位置                    
					formatter: function() { // 标签格式化
						return this.value;
					},
				},
			};
			json.yAxis = {
				title: {
					text: ''
				},
				max: 36,
				min: 0,
				labels: {
					style: {
						fontSize: '20px' //Y轴字体大小
					},
					align: 'right', // 标签位置                     
					formatter: function() { // 标签格式
						return this.value + '℃';
					}
				},
				// y轴的步进值，决定隔多少个显示一个
				tickInterval: 6,
			};
			json.series = [{
				name: '气象温度',
				data: Series,
				animation: false,
				lineColor: '#01764a',
				marker: {
					radius: 10, //节点大小
					fillColor: '#01764a', //节点颜色			        		
				},
			}, {
				name: '适宜温度',
				data: [Fit, Fit, Fit, Fit, Fit, Fit, Fit, Fit, Fit, Fit, Fit, Fit],
				animation: false,
				lineColor: '#fac57f',
				marker: {		
					fillColor: '#fac57f',
					radius: 8,
					symbol: 'square' //曲线点类型
				}
			}];
			
			if(Series.length == 12){
				$(id).highcharts(json);
			}else{
				$(id).html('<div class="spare">数据更新中......</div>')
			}
		}
		//生成co2图表
		function co2(id, record,fit) {
			var record = JSON.parse(record);
			var Xdata = [];
			var Series = [];
			var Fit = parseInt(fit);
			for(var i = 0; i < record.length; i++) {
				var ary = record[i].CO2.split(",");
				Xdata.push(ary[0]);
				Series.push(parseFloat(ary[1]));
			}
			var json = getChartJson();
			json.xAxis = {
				categories: Xdata,
				labels: {
					rotation:-45,
					style: {
						fontSize: '20px',
						fontWeight: 'normal'
					},
					align: 'center', // 标签位置                    
					formatter: function() { // 标签格式化
						return this.value;
					},
				},
			};
			json.yAxis = {
				title: {
					text: ''
				},
				max: 900,
				min: 200,
				labels: {
					style: {
						fontSize: '20px' //Y轴字体大小
					},
					align: 'right', // 标签位置                     
					formatter: function() { // 标签格式
						return this.value + 'ppm';
					}
				},
				// y轴的步进值，决定隔多少个显示一个
				tickInterval: 100,
			};
			json.series = [{
				name: 'CO2浓度',
				data: Series,
				animation: false,
				lineColor: '#01764a',
				marker: {
					radius: 10, //节点大小
					fillColor: '#01764a', //节点颜色			        		
				},
			}, {
				name: '适宜浓度',
				//data: [Fit, Fit, Fit, Fit, Fit, Fit, Fit, Fit, Fit, Fit, Fit, Fit],
				animation: false,
				lineColor: '#fac57f',
				marker: {
					radius: 8,
					fillColor: '#fac57f',
					symbol: 'square' //曲线点类型
				}
			}];
			if(Series.length == 12){
				$(id).highcharts(json);
			}else{
				$(id).html('<div class="spare">数据更新中......</div>')
			}		
		}
		//生成光照图表
		function illumination(id, record,fit) {
			var record = JSON.parse(record);
			var Xdata = [];
			var Series = [];
			var Fit = parseInt(fit);
			for(var i = 0; i < record.length; i++) {
				var ary = record[i].Illumination.split(",");
				Xdata.push(ary[0]);
				Series.push(parseFloat(ary[1]));
			}
			var json = getChartJson();
			json.xAxis = {
				categories: Xdata,
				labels: {
					rotation:-45,
					style: {
						fontSize: '20px',
						fontWeight: 'normal'
					},
					align: 'center', // 标签位置                    
					formatter: function() { // 标签格式化
						return this.value;
					},
				},
			};
			json.yAxis = {
				title: {
					text: ''
				},
				max: 350,
				min: 0,
				labels: {
					style: {
						fontSize: '20px' //Y轴字体大小
					},
					align: 'right', // 标签位置                     
					formatter: function() { // 标签格式
						return this.value + '瓦特/m²';
					}
				},
				// y轴的步进值，决定隔多少个显示一个
				tickInterval: 50,
			};
			json.series = [{
				name: '光照',
				data: Series,
				animation: false,
				lineColor: '#01764a',
				marker: {
					radius: 10, //节点大小
					fillColor: '#01764a', //节点颜色			        		
				},
			}, {
				name: '适宜光照',
				//data: [Fit, Fit, Fit, Fit, Fit, Fit, Fit, Fit, Fit, Fit, Fit, Fit],
				animation: false,
				lineColor: '#fac57f',
				marker: {
					radius: 8,
					fillColor: '#fac57f',
					symbol: 'square' //曲线点类型
				}
			}];
			if(Series.length == 12){
				$(id).highcharts(json);
			}else{
				$(id).html('<div class="spare">数据更新中......</div>')
			}			
		}
		//湿度图表
		function humidity(id, record,fit) {
			var record = JSON.parse(record);
			var Xdata = [];
			var Series = [];
			var Fit = parseInt(fit);
			for(var i = 0; i < record.length; i++) {
				var ary = record[i].AirHumidity.split(",");
				Xdata.push(ary[0]);
				Series.push(parseFloat(ary[1]));
			}
			var json = getChartJson();
			json.xAxis = {
				categories: Xdata,
				labels: {
					rotation:-45,
					style: {
						fontSize: '20px',
						fontWeight: 'normal'
					},
					align: 'center', // 标签位置                    
					formatter: function() { // 标签格式化
						return this.value;
					},
				},
			};
			json.yAxis = {
				title: {
					text: ''
				},
				max: 50,
				min: 0,
				labels: {
					style: {
						fontSize: '20px' //Y轴字体大小
					},
					align: 'right', // 标签位置                     
					formatter: function() { // 标签格式
						return this.value + '%';
					}
				},
				// y轴的步进值，决定隔多少个显示一个
				tickInterval: 10,
			};
			json.series = [{
				name: '相对湿度',
				data: Series,
				animation: false,
				lineColor: '#01764a',
				marker: {
					radius: 10, //节点大小
					fillColor: '#01764a', //节点颜色			        		
				},
			}, {
				name: '适宜湿度',
				data: [Fit, Fit, Fit, Fit, Fit, Fit, Fit, Fit, Fit, Fit, Fit, Fit],
				animation: false,
				lineColor: '#fac57f',
				marker: {
					radius: 8,
					fillColor: '#fac57f',
					symbol: 'square' //曲线点类型
				}
			}];
			if(Series.length == 12){
				$(id).highcharts(json);
			}else{
				$(id).html('<div class="spare">数据更新中......</div>')
			}		
		}
		return app;
	});