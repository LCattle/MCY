define([],function(a,b){
    var defalut_ = {
    		 domUp : {
            domClass   : 'dropload-up',
            domRefresh : '<div class="dropload-refresh">↓下拉刷新</div>',
            domUpdate  : '<div class="dropload-update">↑释放更新</div>',
            domLoad    : '<div class="dropload-load"><span class="loading"></span>加载中...</div>'
        },
        domDown : {
            domClass   : 'dropload-down',
            domRefresh : '<div class="dropload-refresh">↑上拉加载更多</div>',
            domLoad    : '<div class="dropload-load"><span class="loading"></span>加载中...</div>',
            domNoData  : '<div class="dropload-noData"></div>'
        },
        initDropload :function(selector,loadUpFn,loadDownFn){
        		return $(selector).dropload({
        			domUp:this.domUp,
        			domDown:this.domDown,
        			loadUpFn:loadUpFn,
        			loadDownFn:loadDownFn
        		});
        }
    };
     return defalut_;
});
