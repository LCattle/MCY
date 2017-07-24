define(["./base/net"],function(net){
	var img = '<img class="refresherImg" src="'+net.netConfig.pageRoot+'/lib/dropload/img/01.png">';
	img += '<img class="refresherImg" src="'+net.netConfig.pageRoot+'/lib/dropload/img/02.png">';
	img += '<img class="refresherImg" src="'+net.netConfig.pageRoot+'/lib/dropload/img/03.png">';
	img += '<img class="refresherImg" src="'+net.netConfig.pageRoot+'/lib/dropload/img/04.png">';
	var imgload = '<img class="animated infinite swing refresherImg" src="'+net.netConfig.pageRoot+'/lib/dropload/img/01.png">';
	imgload += '<img class="animated infinite swing refresherImg" src="'+net.netConfig.pageRoot+'/lib/dropload/img/02.png">';
	imgload += '<img class="animated infinite swing refresherImg" src="'+net.netConfig.pageRoot+'/lib/dropload/img/03.png">';
	imgload += '<img class="animated infinite swing refresherImg" src="'+net.netConfig.pageRoot+'/lib/dropload/img/04.png">';
    var defalut_ = {
    		 domUp : {
            domClass   : 'dropload-up',
            domRefresh : '<div class="dropload-refresh">'+img+'</div>',
            domUpdate  : '<div class="dropload-update">'+img+'</div>',
            domLoad    : '<div class="dropload-load">'+imgload+'</div>'
        },
        domDown : {
            domClass   : 'dropload-down',
            domRefresh : '<div class="dropload-refresh">↑上拉加载更多</div>',
            domLoad    : '<div class="dropload-load"><span class="loading"></span>加载中...</div>',
            domNoData  : '<div class="dropload-noData">没有更多数据了</div>'
        },
        initDropload :function(selector,loadUpFn,loadDownFn){
        		return $(selector).dropload({
        			domUp:this.domUp,
        			domDown:this.domDown,
        			loadUpFn:loadUpFn,
        			loadDownFn:loadDownFn,
        			onStartPull:this.onStartPull,
        			onCancelPull:this.onCancelPull
        		});
        },
        
    };
     return defalut_;
});
