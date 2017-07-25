/**
 * 日期对象拓展格式化放 返回 yyyyMMDDHHmmss格式
 */
Date.prototype.toYYYYMMDDHHMMSS = function(){
	var y = this.getFullYear();
	var m = this.getMonth()+1;
	m = m<10?"0"+m:m;
	var d = this.getDate();
	d = d<10?"0"+d:d;
	var h = this.getHours();
	h = h<10?"0"+h:h;
	var mm = this.getMinutes();
	mm = mm<10?"0"+mm:mm;
	var ss = this.getSeconds();
	return y+""+m+""+d+""+h+""+mm+""+ss;
}
/**简单的日期格式化功能*/
Date.prototype.simpleFormat = function(reg){
	var y = this.getFullYear();
	var m = this.getMonth()+1;
	m = m<10?"0"+m:m;
	var d = this.getDate();
	d = d<10?"0"+d:d;
	var h = this.getHours();
	h = h<10?"0"+h:h;
	var mm = this.getMinutes();
	mm = mm<10?"0"+mm:mm;
	var ss = this.getSeconds();
	reg =reg.replace("yyyy",y);
	reg =reg.replace("MM",m);
	reg =reg.replace("dd",d);
	reg =reg.replace("hh",h);
	reg =reg.replace("mm",mm);
	return reg;
}
Date.prototype.Format = function (fmt) { //author: meizz 
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
}
/**
 * 拓展判断是否以某字符串结尾
 * @param {Object} str
 */
String.prototype.endWith = function(str){
	var len = str.length;
	if(this.length<len){
		return false;
	}
	var subStr = this.substring(this.length-len,this.length);
	return subStr===str;
}
//解决number 不能trim的问题
Number.prototype.trim = function(){
	return (this+"").trim();
};
//解决number 不能trim的问题
Number.prototype.trimAll = function(){
	return (this+"").trimAll();
};
/**
 * 拓展判断是否以某字符串开始
 * @param {Object} str
 */
String.prototype.startsWith = function(str){
	var len = str.length;
	if(this.length<len){
		return false;
	}
	var subStr = this.substring(0,len);
	return subStr===str;
}

if(!String.prototype.trim){
	String.prototype.trim = function(){
		return this.replace(/(^\s*)|(\s*$)/g,"");
	}
}
String.prototype.trimAll = function(){
		return this.replace(/\s*/g,"");
}

