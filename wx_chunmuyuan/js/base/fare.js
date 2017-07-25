define([],function(){
	var fareValue={};
	fareValue.vegetableFare=function(orderPrice){
		var paramValue ='';
		var fare=0;
		app.getSysParam("VEGETABLEORDER",function(data){
	            $.each(data,function(i,item){
	                if(item.innercode=='FARE'){
	                	paramValue = item.paramvalue;
	                }
	            })
	        },'biz');
	    if(paramValue != '' && paramValue != null){
	    	var arr= [];
	    	if(paramValue.indexOf(',')>0){
	    		arr=paramValue.split(',');
	    	}else{
	    		arr[0]=paramValue;
	    	}
	    	for(var i=0;i<arr.length;i++){
	    		var param=[];
	    		param=arr[i].split(':');
	    		var strFare = param[1];//物流费
	    		var arrParam =[];
	    		arrParam=param[0].split('-');
	    		var start = arrParam[0];//本物流费对应的订单起始值
	    		var end = arrParam[1];//本物流费对应的订单结束值
	    		if(i==arr.length-1 && arr.length==1 && orderPrice*1<=start*1){
	    			fare=strFare;
	    			return fare;
	    		}
	    		if(orderPrice*1>=start*1 && orderPrice*1<end*1){
	    			fare=strFare;
	    			return fare;
	    		}else if(orderPrice*1>=end*1){
	    			fare=0;
	    			return fare;
	    		}
	    	}
	    }
	}
	return fareValue;
});