//浏览历史
define(["./base/baseApp", "refresher", "swipe", '../lib/exif-js/exif_amd'], function(app, refresher, swipe, exif) {
	//变量定义
	app.imgboxwidth = 0;
	app.imgUrls = []; //选中图片的路径
	app.actId = app.UrlParams.id;
	//	//变量定义结束
	//	var ary = ['A','B','C','D','E','F','1','2',"3"];
	//	var max = 1024*1024*1.5;
	//	var l1k = 1024;
	//	var ary1k = [];
	//	var l2k = 2*1024;
	//	var ary2k = [];
	//	var l5k = 2*1024;
	//	var ary5k = [];
	//	var aryMax = [];
	//	for(var i=0;i<max;i++){
	//		if(i<l1k){
	//			ary1k.push(ary[i%9]);
	//		}
	//		if(i<l2k){
	//			ary2k.push(ary[i%9]);
	//		}
	//		if(i<l5k){
	//			ary5k.push(ary[i%9])
	//		}
	//		aryMax.push(ary[i%9]);
	//	}
	//	function test(data){
	//		$.ajax({
	//			type:"post",
	//			url:app.getNetServer()+"weixin/mall/shoppingcart/shoppingCartDetail.do",
	//			data:{
	//				testData:data.join('')
	//			},
	//			async:true,
	//			success:function(res){
	//				if(app.maxuplength){
	//					if(app.maxuplength<data.length){
	//						app.maxuplength = data.length
	//					}
	//				}else{
	//					app.maxuplength = data.length;
	//				}
	//			},
	//			error:function(e){
	//				console.log(e);
	//			}
	//		});
	//	}
	//	test(ary1k);
	//	test(ary2k);
	//	test(ary5k);
	//	test(aryMax);
	//初始化
	app.init = function() {
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
			var file = e.target.files[0];
			if(file) {
				addImg(file);
			}
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
				var trans = orient == 6;
				//ios才旋转
				trans = trans && isSpringWoodsIos();
//				log(trans);
//				log("orient:"+orient);
				app.getFIleBase64DataByCanvas(file, callBack,trans );
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
		var str = ""
		$.each(app.imgUrls, function(i, it) {
			if(!it.servicePath) { //如果有图片没上传成功,抛异常截止
				app.tipInfo("您的第" + (i + 1) + "图没上传成功");
				throw "您的第" + (i + 1) + "图没上传成功";
			}
			str += "," + it.servicePath;
		});
		if(str.length > 0) {
			str = str.substring(1);
		}
		return str;
	}
	//点击提交
	app.submit = function() {
		var picurls = getPicUrls();
		var text = $("textarea").val().toString().replace(/([\ud800-\udbff][\u0000-\uffff])/g, '').trim();
		//		if(picurls.length<4){//如果有照片可以不验证文字
		if(text.length < 5) {
			app.tipInfo("您输入的心得太少了");
			return;
		}
		//		}
		if(text.length > 200) {
			app.tipInfo("您输入的内容多余200个字");
			return;
		}
		app.POSTRequest("weixin/mall/offlinecomment/commentActivity.do", {
			data: {
				activityId: app.actId,
				picurls: picurls,
				note: text
			},
			success: function(data) {
				if(data.resultCode == 1) {
					$(".dlg_bg").show();
					$(".successDlg").show();
				} else {
					app.tipInfo(data.resultMsg);
				}
			}
		});
	}
	return app;
});