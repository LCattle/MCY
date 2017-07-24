//浏览历史
define(["./base/baseApp", "refresher", "swipe", '../lib/exif-js/exif_amd'], function(app, refresher, swipe, exif) {
	//变量定义
	app.imgboxwidth = 0;
	app.imgUrls = []; //选中图片的路径
	app.init = function() {
		plate();
		var boxwidth = $(window).width();
		app.imgboxwidth = (boxwidth - app.REM2PX(3.5)) / 4;
		$("#filePicker").css({
			width: app.imgboxwidth + "px",
			height: app.imgboxwidth + "px",
			"display": "inline-block"
		});
		$(".imgbox").not("#filePicker").css({
			width: app.imgboxwidth + "px",
			height: app.imgboxwidth + "px",
			"display": "inline-block"
		})
		$("#file-input").change(function(e) {
			//var file = e.target.files[0];
			var files = e.target.files;
			if (files.length > 9) {
				app.tipInfo('图片最多9张！');
				return;
			}
			var tempFile = '';
			for (var i = 0; i < files.length; i++) {
				tmepFile = files[i];
				if(tmepFile) {
					addImg(tmepFile);
				}
			}
			//if(file) {
			//	addImg(file);
			//}
			$("#file-input").val("");
		});
		app.bigimgteamp = app.getTempBySelector("#bigimgtemp");
		
	};

	function addImg(file) {
		if(!(/image\/\w+/.test(file.type))) {
			app.tipInfo("请选择图片");
			return;
		}
		var temp = app.getTempBySelector("#imgboxtemp");
		var item = {
			url: '', //保存本地路径
			uuid: app.uuid(), //生成的uuid，
			file: file //,文件对象
		}
		var $img = $(temp(item));
		app.imgUrls.push(item);
		if(app.imgUrls.length > 8) {
			$("#filePicker").hide();
		}
		getFileImgData(file, function(data) {
			item.url = data;
			$img.css('background-image', 'url(' + data + ')');
			uploadImg(item);
		});

		$("#filePicker").before($img);
		$("[uuid='" + item.uuid + "'] .process").show();
		$("[uuid='" + item.uuid + "'] .proMsgbox").hide();

	}

	function log(msg) {
		$('body').append("<div>" + msg + "</div>")
	}
	/**
	 * 判断是否旋转 并获取base64数据
	 */
	function getFileImgData(file, callBack) {
		var url = app.getFileLocalPath(file);
		var img = document.createElement("img");
		img.onload = function() {
			EXIF.getData(img, function() {
				var orient = EXIF.getTag(this, 'Orientation');
				console.log("orient"+(orient == 6));
				app.getFIleBase64DataByCanvas(file, callBack, orient == 6)
			});
		}
		img.src = url;
	}

	/**
	 * 关闭大图
	 */
	app.closeSwipe = function() {
		$(".dlg_bg").hide();
		$("#picshowpanel").hide();
	};
	/**
	 * 显示大图
	 */
	app.openSwipe = function(uuid) {
		if(app.mySwiper) {
			app.mySwiper.removeAllSlides();
			app.mySwiper.destroy(true, true);
		}
		var index = 0
		for(var i = 0; i < app.imgUrls.length; i++) {
			if(uuid == app.imgUrls[i].uuid) {
				index = i;
			}
			$(".swiper-wrapper").append(app.bigimgteamp(app.imgUrls[i]));
		}
		$(".dlg_bg").show();
		$("#picshowpanel").show();
		$(".numbers").text((index + 1) + "/" + app.imgUrls.length);
		initSwiper(index);
	};

	app.initPage = function() {
		
	};
	/**
	 * 删除上传失败的图
	 */
	app.DelUploadErr = function(uuid, event) {
		app.stopBubble(event);
		//删除小图
		$("[uuid=" + uuid + "]").remove();
		var index = 0;
		for(var i = 0; i < app.imgUrls.length; i++) {
			if(app.imgUrls[i].uuid == uuid) {
				index = i;
				break;
			}
		}
		//删除数组数据
		app.imgUrls.splice(index, 1);
		//显示
		$("#filePicker").show();
	}

	/**
	 * 点击删除
	 */
	app.clickTrash = function() {
		var dialog = new auiDialog();
		dialog.alert({
			title: "提示",
			msg: '是否删除第' + (app.mySwiper.realIndex + 1) + '张照片？',
			buttons: ['取消', '确定']
		}, function(ret) {
			if(ret.buttonIndex == 2) {
				var index = app.mySwiper.realIndex;
				//拿到uuid
				var uuid = $(app.mySwiper.slides[index]).attr("uuid");
				//删除大图
				app.mySwiper.removeSlide(index);
				setPicNumber();
				//删除小图
				$("[uuid=" + uuid + "]").remove();
				//删除数组数据
				app.imgUrls.splice(index, 1);
				//显示
				$("#filePicker").show();
			}
		});
	};

	function setPicNumber() {
		var index = app.mySwiper.realIndex + 1;
		var total = $(".swiper-wrapper .swiper-slide").length;
		if(total <= 0) { //如果没有就关闭大图显示
			app.closeSwipe();
		}
		$(".numbers").text(index + "/" + total);
	};
	/**
	 * 初始化查看大图主键
	 */
	function initSwiper(index) {
		$(".swiper-container").css({
			height: "100%"
		});
		app.mySwiper = new Swiper('.swiper-container', {
			initialSlide: index,
			onTransitionEnd: function(swiper) {
				if(app.mySwiper)
					setPicNumber();
			},
			onInit: function(swiper) {
				app.mySwiper = swiper;
				setPicNumber();
			}
		});
	}

	/**
	 *	上传图片 
	 * @param {Object} data
	 */
	function uploadImg(data) {
		$("[uuid='" + data.uuid + "'] .process").show();
		$("[uuid='" + data.uuid + "'] .proMsgbox1").show();
		$("[uuid='" + data.uuid + "'] .proMsgbox").hide();
		app.POSTRequest("weixin/mall/uploadImg/uploadImgBase64.do", {　
			data: {
				imgType: "offlinecomment",
				file: data.url.split(",")[1]
			},
			success: function(res) {
				if(res.resultCode == 1) {
					$("[uuid='" + data.uuid + "'] .process").hide();
					$("[uuid='" + data.uuid + "'] .proMsgbox1").hide();
					data.servicePath = res.resultObj.imgRelativePath;
				} else if(res.resultCode == -1) {
					app.toLoginPage(location.href);
				} else {
					$("[uuid='" + data.uuid + "'] .proMsgbox1").hide();
					$("[uuid='" + data.uuid + "'] .proMsgbox").show();
					$("[uuid='" + data.uuid + "'] .proMsgbox .proMsg").text("点击重传");　　　　　　
					app.tipInfo(res.resultMsg);
				}
			},
			error: function(e) {
				//网络错误
				$("[uuid='" + data.uuid + "'] .proMsgbox1").hide();
				$("[uuid='" + data.uuid + "'] .proMsgbox").show();
				$("[uuid='" + data.uuid + "'] .process").show();
				$("[uuid='" + data.uuid + "'] .proMsgbox .proMsg").text("点击重传");　　　　　　　　　
			}
		});
	}
	//点击重新上传
	app.reupload = function(uuid, event) {
		app.stopBubble(event); //阻止事件传递
		$.each(app.imgUrls, function(i, item) {
			if(item.uuid == uuid) {
				uploadImg(item);
			}
		})
	}
	//获取上传后的图片路径信息
	function getPicUrls() {
		var pathArr = new Array();
		$.each(app.imgUrls, function(i, it) {
			if(!it.servicePath) { //如果有图片没上传成功,抛异常截止
				app.tipInfo("您的第" + (i + 1) + "图没上传成功");
				throw "您的第" + (i + 1) + "图没上传成功";
			}
			var path ={
				img:it.servicePath
			}
			pathArr.push(path);
		});
		return pathArr;
	}
	//点击提交
	app.submit = function() {
		var pathArr = getPicUrls();
		var text = $("textarea").val().toString().replace(/([\ud800-\udbff][\u0000-\uffff])/g, '').trim();
		var title=$(".title").val().toString().replace(/([\ud800-\udbff][\u0000-\uffff])/g, '').trim();
		var cid=$(".ave").attr("cid");	
		//pathArr();
		$('.btnfilter').attr("disabled",true);
		if(title.length == ""){
			app.tipInfo("主题不能为空");
			$('.btnfilter').attr("disabled",false);
			return;
		}
		if(text.length == "") {
			app.tipInfo("输入的内容不能为空");
			$('.btnfilter').attr("disabled",false);
			return;
		}
		if(text.length > 2000) {
			app.tipInfo("您输入的内容超过2000个字");
			$('.btnfilter').attr("disabled",false);
			return;
		}
		
		
		if(cid == ""){
			app.tipInfo("请选择板块内容");
			$('.btnfilter').attr("disabled",false);
			return;
		}
		app.POSTRequest_m("member/tie/saveTie.do",{
			data:{
				cid:cid,
				title:title,
				content: text,
				paths:JSON.stringify(pathArr),
				loginedtoken:localStorage.loginedToken,
				postcommentsource:'app'
			},
			success:function(data){
				if(data.resultCode==1){
					app.tipInfo("发帖成功！");
					$('.btnfilter').attr("disabled",true);
				    setTimeout(function(){
						location.href="community.html"
					}, 2000)
				}else{
					//app.tipInfo(data.resultMsg);
				}
			},
			error: function() {
				$('.btnfilter').attr("disabled",false);
			}
		});
		
	}
	
	function plate(){
			app.POSTRequest_m("member/tielanmu/tieList.do", {
					data: {
						beginPage: 1,
						pageSize:10
					},
					success: function(data) {
						console.log(data)
						if(data.resultCode == 1) {
							app.blanks(data);
							$(".blanks .lis:first-child").addClass("ave");
						} else {
							//app.tipInfo(data.resultMsg);
						}
					}
			});
	}
	
	
	app.blanks=function(data){
	 	var temp3 = app.getTempBySelector("#blockTemp")//板块绘制
	 	var blanksList=data.basePageObj.dataList;
	 	$.each(blanksList,function(i,item){
			$(".blanks").append(temp3(item));
			});
 	}
	
	
	
	//选择板块
    $(".bankuai").on("click",".lis",function(){
    		$(this).addClass("ave").siblings().removeClass("ave")
    })
	
	
	return app;
});