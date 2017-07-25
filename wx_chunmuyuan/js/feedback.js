//意见反馈
define(["base/baseApp", "picker"], function(app,Picker) {
	app.initPage = function(){
	};
	//加载类型选项
	function loadTypies(){
		app.getSysParam("FEEDBACKTYPE",function(data){
			data = data.map(function(item,index){
				console.log(item);
				console.log(item.paramname+"  :  "+item.id)
				return{
					text:item.paramname,
					value:item.paramvalue
				}
			});
			$("#DeliveryDate").val(data[0].text);
			app.feedType = data[0].value;
			initPicker(data);
		},"biz")
	}
	//初始化选择器
	function initPicker(data) {
		var picker = new Picker({
			data: [
				data
			],
			selectedIndex: [0],
			title: '选择反馈类型'
		});
		picker.on('picker.select', function(selectedVal, selectedIndex) {
			$("#DeliveryDate").val(data[selectedIndex[0]].text);
			app.feedType = selectedVal[0];
		});
		$("#DeliveryDate").parent().parent().bind("click", function() {
			picker.show();
		});
	}
	//开始执行
	app.init = function() {
		loadTypies();
	};
	app.submit = function(){
		var feed = $("textarea").val().trim();
		if(feed.length<5){
			app.tipInfo("您输入的内容少于5个字");
			return;
		}
		submit(feed);
	}
	function submit(str){
		//TODO 网络提交
		app.POSTRequest("weixin/mall/feedback/postFeedBack.do",{
			data:{
				content:str,
				type:app.feedType
			},
			loading:"正在提交...",
			success:function(data){
				if(data.resultCode==1){
					app.tipInfo("感谢您的反馈！");
					setTimeout(function(){
						//window.history.back();
						location.href = '../html/userCenter.html';
					},2000);
				}else{
					app.tipInfo(data.resultMsg);
				}
			}
		});
	}
	return app;
});