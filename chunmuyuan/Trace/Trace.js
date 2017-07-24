define(["./base/baseApp", "../lib/aui/script/aui-slide"],
	function(app, slide) {
	    $(".massage li").click(function(){
	    	  var i = $(this).index();//下标第一种写法
	    	  console.log(i);
	    	  $(this).addClass("active").siblings().removeClass();
	    	  $('.line_chart_pic li').eq(i).show().siblings().hide();
	    	  
	    })	    	    	   	    
    $(document).ready(function(){
        var temperature = new Highcharts.Chart({        
                chart:{              	   
                   renderTo: 'main',//加载路径
                   type:'spline',//图表类型
                   spacingTop: 60,
		           spacingRight: 30,
		           spacingBottom: 0,
		           spacingLeft: 10
                },
                exporting:{
                   // 是否允许导出
                   enabled:false,
                },              
                legend: {
                   layout: 'horizontal',//图例水平显示
                   align:'center',
                   enabled:true,
//                 borderColor:'red',
//                 borderWidth:2,
                   itemStyle:{
                   	   fontSize:30,
                   	   fontWeight:'normal',                  	   
                   },
                   y:20,
                   x:0,
                },  
                tooltip:{
                	enabled:false,//图例提示框,不显示
                },
                title:{
                   text:''
                },             
                xAxis: {
                   categories: ['1', '2', '3', '4', '5', '6','7', '8', '9', '10', '11', '12'],
                   // 坐标轴的标签
                    labels:{   
                   	   style:{
                   	   	fontSize:'20px',
                   	   	fontWeight:'normal'
                   	   },
                       align: 'center',// 标签位置                    
                       formatter: function(){ // 标签格式化
                           return this.value;
                       },                                          
                    },            
                    tickInterval: 1,// X轴的步进值，决定隔多少个显示一个                  
                },              
                yAxis:{
                	plotBands:[{
                		from:18,
                		to:28,
                		color:'#fde8cd',
                	}],
                	title:{
                		text:''
                	},
               	    //lineColor:'red',//Y轴颜色
               	    //lineWidth:3,//Y轴宽度,默认是0
                    max:36,   
                    min:0,
                    labels:{
                   	   style:{
                   	   	fontSize:'20px'//Y轴字体大小
                   	   },                      
                       align: 'right',// 标签位置                     
                       formatter: function(){// 标签格式
                           return this.value + '(°C)';
                       }
                    },
                    // y轴的步进值，决定隔多少个显示一个
                    tickInterval: 6,                               
                },   
			    plotOptions: {//数据点选项	
			    	series:{//取消图例点击事件
			    		events:{
			    			legendItemClick:function(e){
			    				return false;
			    			}
			    		}
			    	},
			        spline: {
			            lineWidth: 5,//线条宽度	
			            lineColor:'#01764a',//线条颜色						 
			            shadow: false,			            
			        },
			        
			    },
                series: [{
               	      name:'气象温度',
                      data: [],    
                      animation:false,//取消动画效果
                      marker:{			        	
			        		radius:10,//节点大小
			        		fillColor:'#01764a',//节点颜色			        		
			          },  
                }
                ,{
                	name:'适宜温度',
                	data:[20],
                	animation:false,
                	marker:{
                		radius:10,
                		fillColor:'#fde8cd',
                		symbol:'square'//曲线点类型
                	}
                }
                ],
                credits:{
                	enabled:false//右下角官网链接
                },
        });                                                                       
        var dampness = new Highcharts.Chart({        
                chart:{              	   
                   renderTo: 'easy',//加载路径
                   type:'spline',//图表类型
                   spacingTop: 60,
		           spacingRight: 30,
		           spacingBottom: 0,
		           spacingLeft: 10
                },
                exporting:{
                   // 是否允许导出
                   enabled:false,
                },              
                legend: {
                   layout: 'horizontal',//图例水平显示
                   align:'center',
                   enabled:true,
//                 borderColor:'red',
//                 borderWidth:2,
                   itemStyle:{
                   	   fontSize:30,
                   	   fontWeight:'normal',                  	   
                   },
                   y:20,
                   x:0,
                },  
                tooltip:{
                	enabled:false,//图例提示框,不显示
                },
                title:{
                   text:''
                },             
                xAxis: {
                   categories: ['1', '2', '3', '4', '5', '6','7', '8', '9', '10', '11', '12'],
                   // 坐标轴的标签
                    labels:{   
                   	   style:{
                   	   	fontSize:'20px',
                   	   	fontWeight:'normal'
                   	   },
                       align: 'center',// 标签位置                    
                       formatter: function(){ // 标签格式化
                           return this.value;
                       },                                          
                    },            
                    tickInterval: 1,// X轴的步进值，决定隔多少个显示一个                  
                },              
                yAxis:{              	
                	title:{
                		text:''
                	},
               	    //lineColor:'red',//Y轴颜色
               	    //lineWidth:3,//Y轴宽度,默认是0
                    max:100,
                    min:50,
                    labels:{
                   	   style:{
                   	   	fontSize:'20px'//Y轴字体大小
                   	   },                      
                       align: 'right',// 标签位置                     
                       formatter: function(){// 标签格式
                           return this.value + '(%)';
                       }
                    },
                    // y轴的步进值，决定隔多少个显示一个
                    tickInterval: 10,                               
                },   
			    plotOptions: {//数据点选项				    	
			    	series:{//取消图例点击事件
			    		events:{
			    			legendItemClick:function(e){
			    				return false;
			    			}
			    		}
			    	},
			        spline: {
			            lineWidth: 5,//线条宽度				           					 
			            shadow: false,//阴影效果			            
			        },
			        
			    },
                series: [{
               	      name:'相对湿度',
                      data: [60, 52, 80, 57, 87, 62, 91, 54, 64, 58, 71, 62],    
                      animation:false,//取消动画效果
                      lineColor:'#01764a',//线条颜色	
                      marker:{			        	
			        		radius:10,//节点大小
			        		fillColor:'#01764a',//节点颜色			        		
			          },  
                }
                ,{
                	name:'适宜湿度',
                	data:[80,80,80,80,80,80,80,80,80,80,80,80],
                	animation:false,
                	lineColor:'#fac57f',
                	marker:{
                		radius:10,
                		fillColor:'#fac57f',
                		symbol:'square'//曲线点类型
                	}
                }],
                credits:{
                	enabled:false//右下角官网链接
                },
        });              
        var beam = new Highcharts.Chart({        
                chart:{              	   
                   renderTo: 'lake',//加载路径
                   type:'spline',//图表类型
                   spacingTop: 60,
		           spacingRight: 30,
		           spacingBottom: 0,
		           spacingLeft: 10
                },
                exporting:{
                   // 是否允许导出
                   enabled:false,
                },              
                legend: {
                   layout: 'horizontal',//图例水平显示
                   align:'center',
                   enabled:true,
//                 borderColor:'red',
//                 borderWidth:2,
                   itemStyle:{
                   	   fontSize:30,
                   	   fontWeight:'normal',                  	   
                   },
                   y:20,
                   x:0,
                },  
                tooltip:{
                	enabled:false,//图例提示框,不显示
                },
                title:{
                   text:''
                },             
                xAxis: {
                   categories: ['1', '2', '3', '4', '5', '6','7', '8', '9', '10', '11', '12'],
                   // 坐标轴的标签
                    labels:{   
                   	   style:{
                   	   	fontSize:'20px',
                   	   	fontWeight:'normal'
                   	   },
                       align: 'center',// 标签位置                    
                       formatter: function(){ // 标签格式化
                           return this.value;
                       },                                          
                    },            
                    tickInterval: 1,// X轴的步进值，决定隔多少个显示一个                  
                },              
                yAxis:{              	
                	title:{
                		text:''
                	},
               	    //lineColor:'red',//Y轴颜色
               	    //lineWidth:3,//Y轴宽度,默认是0
                    max:400,
                    min:60,
                    labels:{
                   	   style:{
                   	   	fontSize:'20px'//Y轴字体大小
                   	   },                      
                       align: 'right',// 标签位置                     
                       formatter: function(){// 标签格式
                           return this.value + '(瓦特/m²)';
                       }
                    },
                    // y轴的步进值，决定隔多少个显示一个
                    tickInterval: 50,                               
                },   
			    plotOptions: {//数据点选项				    	
			    	series:{//取消图例点击事件
			    		events:{
			    			legendItemClick:function(e){
			    				return false;
			    			}
			    		}
			    	},
			        spline: {
			            lineWidth: 5,//线条宽度				           					 
			            shadow: false,//阴影效果			            
			        },
			        
			    },
                series: [{
               	      name:'实际光照',
                      data: [60, 52, 80, 57, 87, 62, 91, 54, 64, 58, 71, 62],    
                      animation:false,//取消动画效果
                      lineColor:'#01764a',//线条颜色	
                      marker:{			        	
			        		radius:10,//节点大小
			        		fillColor:'#01764a',//节点颜色			        		
			          },  
                }
                ,{
                	name:'适宜光照',
                	data:[80,80,80,80,80,80,80,80,80,80,80,80],
                	animation:false,
                	lineColor:'#fac57f',
                	marker:{
                		radius:10,
                		fillColor:'#fac57f',
                		symbol:'square'//曲线点类型
                	}
                }],
                credits:{
                	enabled:false//右下角官网链接
                },
        });    
        
        app.POSTRequest("region/tracebackTimingtraceback.do", {
			data: {
			  orderid : '100000',
	          skusn : 'BC1002'
			},
			success: function(data) {
               console.log(data);
               var record = JSON.parse(data.resultObj[0].cotwojson);
               var Xdata = [];
               var Series = [];
               for(var i=0;i<record.length;i++){
               	   Xdata.push(record[i].CO2.split(",")[0]);
               	   Series.push(record[i].CO2.split(",")[1]);
               } 

        var carbon = new Highcharts.Chart({        
                chart:{              	   
                   renderTo: 'jeep',//加载路径
                   type:'spline',//图表类型
                   spacingTop: 60,
		           spacingRight: 30,
		           spacingBottom: 0,
		           spacingLeft: 10
                },
                exporting:{
                   // 是否允许导出
                   enabled:false,
                },              
                legend: {
                   layout: 'horizontal',//图例水平显示
                   align:'center',
                   enabled:true,
//                 borderColor:'red',
//                 borderWidth:2,
                   itemStyle:{
                   	   fontSize:30,
                   	   fontWeight:'normal',                  	   
                   },
                   y:20,
                   x:0,
                },  
                tooltip:{
                	enabled:false,//图例提示框,不显示
                },
                title:{
                   text:''
                },             
                xAxis: {
                   categories: Xdata,
                   // 坐标轴的标签
                    labels:{   
                   	   style:{
                   	   	fontSize:'20px',
                   	   	fontWeight:'normal'
                   	   },
                       align: 'center',// 标签位置                    
                       formatter: function(){ // 标签格式化
                           return this.value;
                       },                                          
                    },            
                    tickInterval: 1,// X轴的步进值，决定隔多少个显示一个                  
                },              
                yAxis:{              	
                	title:{
                		text:''
                	},
               	    //lineColor:'red',//Y轴颜色
               	    //lineWidth:3,//Y轴宽度,默认是0
                    max:1000,
                    min:300,
                    labels:{
                   	   style:{
                   	   	fontSize:'20px'//Y轴字体大小
                   	   },                      
                       align: 'right',// 标签位置                     
                       formatter: function(){// 标签格式
                           return this.value + '';
                       }
                    },
                    // y轴的步进值，决定隔多少个显示一个
                    tickInterval: 100,                               
                },   
			    plotOptions: {//数据点选项				    	
			    	series:{//取消图例点击事件
			    		events:{
			    			legendItemClick:function(e){
			    				return false;
			    			}
			    		}
			    	},
			        spline: {
			            lineWidth: 5,//线条宽度				           					 
			            shadow: false,//阴影效果			            
			        },
			        
			    },
                series: [{
               	      name:'相对湿度',
                      data:Series,    
                      animation:false,//取消动画效果
                      lineColor:'#01764a',//线条颜色	
                      marker:{			        	
			        		radius:10,//节点大小
			        		fillColor:'#01764a',//节点颜色			        		
			          },  
                }
                ,{
                	name:'适宜湿度',
                	data:[380,480,580,680,780,880,980,680,380,580,780,380],
                	animation:false,
                	lineColor:'#fac57f',
                	marker:{
                		radius:10,
                		fillColor:'#fac57f',
                		symbol:'square'//曲线点类型
                	}
                }
                ],
                credits:{
                	enabled:false//右下角官网链接
                },
            });
            
        	},
		});    
            
            
        });       
		//接口分三种
		/**
		 * app.POSTRequest() -- 商城相关接口
		 * app.POSTRequest_i() -- 基础服务相关接口
		 * app.POSTRequest_m() -- 用户相关的相关接口
		 */
		
		$('.like').click(function(e){
			var src = $(this).children().attr('src');
			$(".carrousel").find("img").attr( "src", src );
			$(".carrousel").fadeIn( 200 );
			
		})
		$('.carrousel').click(function(){
			$(".carrousel").fadeOut( 200 );
			$(".carrousel").find("img").attr( "src", "" );
		})
		
		
		
		
		//开始执行轮播
		function startSlide() {
			app.slide = new auiSlide({
				container: document.getElementById("aui-slide"),
				//"width": $(window).width(),//宽度
				"height":$('.outer').height(),//高度
				"speed": 500,//速度
				"loop": true,//是否循环
				"pageShow": false,//是否显示分页器
				currentPage:function(index){//当滑动到第几页
					$(".page-items.active").removeClass("active");
					$(".page-items").eq(index).addClass("active");
				}
			})
			var len = $("#aui-slide").find(".aui-slide-node").length;
			for(var i=0;i<len;i++){
				if(i==0){
					$(".page-wrap").append('<div class="page-items active"></div>').hide();
				}if(i==1){
					$('.aui-slide-node');
				}else{
					$(".page-wrap").append('<div class="page-items"></div>').show();
				}
			}
			
		}
		app.init = function() {
			startSlide();
		};
		return app;
	});