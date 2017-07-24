define(["./base/baseApp"], function(app) {
	var lessonId = null;
	Date.prototype.format = function (fmt) { //author: meizz 
	    var o = {
	        "M+": this.getMonth() + 1, //月份 
	        "d+": this.getDate(), //日 
	        "h+": this.getHours(), //小时 
	        "m+": this.getMinutes(), //分 
	        "s+": this.getSeconds(), //秒 
	        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
	        "S": this.getMilliseconds() //毫秒 
	    };
	    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	    for (var k in o)
	    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	    return fmt;
   };
	
	app.init = function(){
		app.POSTRequest('/weixin/mall/lectureuser/lecture.do' , {
			data : {
				loginedtoken:localStorage.loginedToken
			},
			success:function(data){
				console.log(data);
				lessonId = data.resultObj.id;
				if(data.resultCode == 1 && data.resultObj.signup == 2){
					$("#name").text(data.resultObj.name);
					$("#lecturer").text(data.resultObj.teacher);
					if(data.resultObj.timetype == 2){
						$("#time").text("敬请期待");
					}else{
						$("#time").text(data.resultObj.starttime.substr(0,16));
					}
                    $("#address").text(data.resultObj.address);
					$("#minute").html(data.resultObj.detail);
					$(".record").show();
					app.POSTRequest('/weixin/mall/lectureuser/myLecture.do' , {
						data : {
							loginedtoken:localStorage.loginedToken,
						},
						success:function(data){
							console.log(data);
							
							showkobe(data.resultObj);
						}
					})
				}else if(data.resultCode == 1 && data.resultObj.signup == 1){
					$("#name").text(data.resultObj.name);
					$("#lecturer").text(data.resultObj.teacher);
					if(data.resultObj.timetype == 2){
						$("#time").text("敬请期待");
					}else{
						$("#time").text(data.resultObj.starttime.substr(0,16));
					}
                    $("#address").text(data.resultObj.address);
					$("#minute").html(data.resultObj.detail);
					$("#joinBtn").show();
				}else {
					app.tipInfo(data.resultMsg);
				}
			}
		})
		app.commTemplat = app.getTempBySelector("#recordTemplate");
	}
	
	app.toJoin = function(){
		app.POSTRequest('/weixin/mall/lectureuser/signUp.do' , {
			data : {
				loginedtoken:localStorage.loginedToken,
				lectureid:lessonId
			},
			success:function(data){
				console.log(data);
				if(data.resultCode == 1){
					$("#joinBtn").hide();
					$(".record").show();
					location.replace(location.href);
				}else{
					app.tipInfo(data.resultObj);
				}
			}
		})
	}
	
	function showkobe(data){
		$.each(data, function(i, item) {
				$(".lesson").append(app.commTemplat(item))
		});
	}
	return app;
})