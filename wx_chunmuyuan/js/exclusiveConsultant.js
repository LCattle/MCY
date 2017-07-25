define(["./base/baseApp"], function(app) {
	//获取专属会员信息
	function getMyConsultant(no) {
		var action = "member/consultant/myConsultant.do";
		app.POSTRequest_m(action, {
			data: {
				consultantno: no
			},
			success: function(data) {
				if(data.resultCode == 1) {
					var zsgw = data.resultObj;
					console.log(zsgw);
					if(zsgw) {
						try {
							$("#name").text(zsgw.name);
							$("#number").text(no);
							$("#phone").text(zsgw.mobile);
							app.call = function() {
								location.href = "tel://" + zsgw.mobile;
							}
							if(zsgw.serviceScore) {
								app.initStar(zsgw.serviceScore);
							}
							if(zsgw.operLogo)
								$("#pic").attr("src", app.getImgPath(zsgw.operLogo));
							if(zsgw.wechatpic) {
								$("#wxpic").attr("src", app.getImgPath(zsgw.wechatpic))
							}
						} catch(e) {}
					}
				} else {
					app.tipInfo(data.resultMsg);
				}
			}
		})
	}
	if(app.UrlParams.no){
		app.POSTRequest_m('member/usercomment/isComment.do',{
			data:{
				loginedtoken:localStorage.loginedToken,
				consultantno:app.UrlParams.no   
			},
			success:function(data){
				console.log(data);
				if(data.resultObj.commentFlag == 'true'){
					initStarts();
					$("#marking").show();
				}else{
					$('#marking').hide();
					$("#todayMarking").show();
					app.Kobe(data.resultObj.lastPoint);
				}
			}
		})
		getMyConsultant(app.UrlParams.no);
		$('.clearfix li').click(function(){
				if($(this).find('i').hasClass('icon-damuzhi')){
					$(this).find('i').removeClass('icon-damuzhi orange').addClass('icon-damuzhizhaoxia');
				}else if($(this).find('i').hasClass('icon-damuzhizhaoxia')){
					$(this).find('i').removeClass('icon-damuzhizhaoxia').addClass('icon-damuzhi orange');
				}else if($(this).find('i').hasClass('icon-unie60b')){
					$(this).find('i').removeClass('icon-unie60b').addClass('icon-down orange');
				}else if($(this).find('i').hasClass('icon-down')){
					$(this).find('i').removeClass('icon-down orange').addClass('icon-unie60b');
				}
		})
	}	
	else {
		$("#tip").show();
	}
	app.initStar = function(serviceScore) {
		$("#serviceScore").text(parseFloat(serviceScore).toFixed(1));
		var els = $("#starts i.iconfont")
		for(var i = 0; i < 5; i++) {
			var INT = parseInt(serviceScore);
			var FLOAT = serviceScore - INT;
			if(INT > i) {
				els.eq(i).removeClass("icon-starhalf")
					.removeClass("icon-wuxing2")
					.addClass("icon-wuxing-tianchong");
			} else {
				if(serviceScore > i && FLOAT >= 0.5) {
					els.eq(i).addClass("icon-starhalf")
						.removeClass("icon-wuxing-tianchong")
						.removeClass("icon-wuxing2");
				} else {
					els.eq(i).addClass("icon-wuxing2")
						.removeClass("icon-wuxing-tianchong")
						.removeClass("icon-starhalf");
				}
			}
		}

	}
	app.Kobe = function(serviceScore) {
		var els = $("#lastBox i.iconfont")
		for(var i = 0; i < 5; i++) {
			var INT = parseInt(serviceScore);
			var FLOAT = serviceScore - INT;
			if(INT > i) {
				els.eq(i).removeClass("icon-starhalf")
					.removeClass("icon-wuxing2")
					.addClass("icon-wuxing-tianchong");
			} else {
				if(serviceScore > i && FLOAT >= 0.5) {
					els.eq(i).addClass("icon-starhalf")
						.removeClass("icon-wuxing-tianchong")
						.removeClass("icon-wuxing2");
				} else {
					els.eq(i).addClass("icon-wuxing2")
						.removeClass("icon-wuxing-tianchong")
						.removeClass("icon-starhalf");
				}
			}
		}

	}
	function initStarts(){
		$('#startsBox i').click(function(e){
			$('#serviceGrade').show();
			$('.wxCount').hide().prev().show();
			$("#checkmore").bind('click',function(){
				$("#moreLi").show();
				$("#checkmore").hide();
			})	
		    var stars = $(this).parent().find('i');
		    var index = stars.length - 1;
			for(var i = 0; i<stars.length; i++){
				var el = stars[i];
				if(el === this){
					index = i;
				}
				if(i > index){
					$(el).removeClass("icon-wuxing-tianchong");
					$(el).removeClass("icon-starhalf");
					$(el).addClass("icon-wuxing2");
				}else
				{
//					$(el).addClass("icon-wuxing-tianchong");
//					$(el).removeClass("icon-starhalf");
//					$(el).removeClass("icon-wuxing2");
                    if(index == 0){
                    	$(el).addClass("icon-wuxing-tianchong");
					    $(el).removeClass("icon-starhalf");
					    $(el).removeClass("icon-wuxing2");
					    $(".serviceAttidude1").html("服务态度差 ");
					    $(".serviceAttidude2").html("产品介绍不清楚 ");
					    $(".serviceAttidude3").html("非常不专业 ");
					    $(".serviceAttidude4").html("没有耐心 ");
					    $(".serviceAttidude5").html("沟通不行 ");
					    $(".serviceAttidude6").html("体验很差 ");
					    $(".clearfix").find("i").removeClass("icon-damuzhizhaoxia icon-damuzhi orange").addClass("icon-unie60b");
                    }else if(index == 1){
                    	$(el).addClass("icon-wuxing-tianchong");
					    $(el).removeClass("icon-starhalf");
					    $(el).removeClass("icon-wuxing2");
					    $(".serviceAttidude1").html("服务态度不好 ");
					    $(".serviceAttidude2").html("产品介绍不全面 ");
					    $(".serviceAttidude3").html("服务不专业 ");
					    $(".serviceAttidude4").html("没什么耐心 ");
					    $(".serviceAttidude5").html("沟通能力一般 ");
					    $(".serviceAttidude6").html("体验不好 ");
					    $(".clearfix").find("i").removeClass("icon-damuzhizhaoxia icon-damuzhi orange").addClass("icon-unie60b");
                    }else if(index == 2){
                    	$(el).addClass("icon-wuxing-tianchong");
					    $(el).removeClass("icon-starhalf");
					    $(el).removeClass("icon-wuxing2");
					    $(".serviceAttidude1").html("服务态度一般 ");
					    $(".serviceAttidude2").html("产品介绍较一般 ");
					    $(".serviceAttidude3").html("服务一般 ");
					    $(".serviceAttidude4").html("需要更加有耐心 ");
					    $(".serviceAttidude5").html("沟通能力需提升 ");
					    $(".serviceAttidude6").html("体验一般 ");
					    $(".clearfix").find("i").removeClass("icon-damuzhizhaoxia icon-damuzhi orange").addClass("icon-unie60b");
                    }else if(index == 3){
                    	$(el).addClass("icon-wuxing-tianchong");
					    $(el).removeClass("icon-starhalf");
					    $(el).removeClass("icon-wuxing2");
					    $(".serviceAttidude1").html("服务态度很好 ");
					    $(".serviceAttidude2").html("产品介绍很全面 ");
					    $(".serviceAttidude3").html("服务很专业,用心 ");
					    $(".serviceAttidude4").html("有耐心,亲和 ");
					    $(".serviceAttidude5").html("沟通愉快 ");
					    $(".serviceAttidude6").html("体验很不错 ");
					    $(".clearfix").find("i").removeClass("icon-unie60b orange icon-damuzhi").addClass("icon-damuzhizhaoxia");
                    }else if(index == 4){
                    	$(el).addClass("icon-wuxing-tianchong");
					    $(el).removeClass("icon-starhalf");
					    $(el).removeClass("icon-wuxing2");
					    $(".serviceAttidude1").html("服务态度好棒 ");
					    $(".serviceAttidude2").html("产品介绍很到位 ");
					    $(".serviceAttidude3").html("服务很专业,周到 ");
					    $(".serviceAttidude4").html("很有耐心,亲和 ");
					    $(".serviceAttidude5").html("沟通很愉快 ");
					    $(".serviceAttidude6").html("非常棒的体验 ");
					    $(".clearfix").find("i").removeClass("icon-unie60b orange icon-damuzhi").addClass("icon-damuzhizhaoxia");
                    }
				}
			}
			$('#serviceGrade').html(byIndexLeve(index));
		});
	}
	
	app.Submit_evaluation = function(){
		var index =0 ;
		var lastVal = $('#TextArea1').val().replace(/([\ud800-\udbff][\u0000-\uffff])/g,'').trim();
		var str = [];
		var iary = $('.clearfix i');
		var arr = $("#startsBox i");
		for(var i=0;i<iary.length;i++){
			if(iary.eq(i).hasClass('orange')){
				str.push(iary.eq(i).parent().text());
			}
		}
		for(var j=0;j<arr.length;j++){
			if(arr.eq(j).hasClass("icon-wuxing-tianchong")){
				index++;
			}
		}
        var str1 = str.join("");
		app.POSTRequest_m('member/usercomment/joinComment.do',{
			data:{
				loginedtoken : localStorage.loginedToken,
				consultantno : app.UrlParams.no,
				point : index,
			    label : str1,         
				content : lastVal
			},
			success:function(data){
				console.log(data);
				if(data.resultCode == '1'){
					$(".wxCount").show();
					$('#marking').hide();
					$(".givemark").hide();
					$("#todayMarking").show();
					app.Kobe(data.resultObj);
					app.replace(location.href);
				}
			}
		})
	}
	function byIndexLeve(index){
        var str ="";
        switch (index)
        {
            case 0:
                str="非常不满意，服务很差";
                break;
            case 1:
                str="不满意，服务较差";
                break;
            case 2:
                str="服务一般，需要改善";
                break;
            case 3:
                str="较满意，但仍可改善";
                break;
            case 4:
                str="非常满意，无可挑剔";
                break;
        }
        return str;
    }
	return app;
});