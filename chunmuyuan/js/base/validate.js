//验证工具
define([], function() {
	var validate = {};
	/**
	 * 检查字符串是否为空
	 * @param str 字符串
	 * @returns true 或 false; true表示为数字
	 */
	validate.checkIsEmpty = function(str) {
		if(str != null && typeof(str) == "string") {
			str = str.trim();
		}
		if(null != str && "" != str) {
			return false;
		}
		return true;
	};
	/**验证是否为正整数
	 * @param str
	 * @returns
	 */
	validate.checkNumber = function(str) {
		return /^[1-9]\d*$/.test(str);

	};

	/**
	 * 判断BigDecimal
	 * 
	 * @param str
	 */
	validate.checkDecimalSize = function(str, pattern) {
		if(BIGDECIMAL_PATTERN_FIVE_TWO != pattern && BIGDECIMAL_PATTERN_SEVEN_TWO != pattern) {
			return false;
		}
		if(!checkDecimal(str)) {
			return false;
		}
		var intPart = str.split(".")[0];
		var decimalPart = str.split(".")[1];
		var intPartSize = 0;
		var decimalPartSize = 0;
		if(BIGDECIMAL_PATTERN_FIVE_TWO == pattern) {
			intPartSize = 5;
			decimalPartSize = 2;
		} else if(BIGDECIMAL_PATTERN_SEVEN_TWO != pattern) {
			intPartSize = 7;
			decimalPartSize = 2;
		}
		if(intPart.length > intPartSize || decimalPart.length > decimalPartSize) {
			return false;
		} else {
			return true;
		}
	};

	/**
	 * 检查输入的一串字符是否全部是数字
	 * 
	 * @param str
	 *            字符串
	 * @returns true 或 false; true表示为数字
	 */
	validate.checkNum = function(str) {
		if(checkHasFull(str)) {
			return false;
		}
		return str.match(/\D/) == null;
	}

	/**
	 * 检查输入的一串字符是否全部是数字或者英文
	 * @param str 字符串
	 * @returns true 或 false; true表示为数字或者英文
	 */
	validate.checkUperCapsNum = function(str) {
		for(var i = 0; i < str.length; i++) {
			var strTmp = str.charAt(i);
			if(!(/[A-Z0-9]/.test(strTmp))) {
				return false;
			}
		}
		return true;
	};
	/**
	 * 检查输入的一串字符是否为小数
	 * @param str 字符串
	 * @returns true 或 false; true表示为小数
	 */
	validate.checkDecimal = function(str) {
		if(str.match(/^-?\d+(\.\d+)?$/g) == null) {
			return false;
		} else {
			return true;
		}
	};
	/**
	 * 检查输入的一串字符是否全部是数字或者英文
	 * @param str  字符串
	 * @returns true 或 false; true表示为数字或者英文
	 */
	validate.checkEnNum = function(str) {
		for(var i = 0; i < str.length; i++) {
			var strTmp = str.charAt(i);
			if(!(/[A-Za-z0-9]/.test(strTmp))) {
				return false;
			}
		}
		return true;
	};
	/**
	 * 检查输入的一串字符是否全部是数字或者英文
	 * @param str  字符串
	 * @returns true 或 false; true表示为数字或者英文
	 */
	validate.checkEnNum = function(str) {
		for(var i = 0; i < str.length; i++) {
			var strTmp = str.charAt(i);
			if(!(/[A-Za-z0-9]/.test(strTmp))) {
				return false;
			}
		}
		return true;
	};

	/**
	 * 检查输入的一串字符是否全部是数字或者英文或半角-或者空格
	 * @param str      字符串
	 * @returns true 或 false; true表示为数字或者英文
	 */
	validate.checkEnNumDashOrSpace = function(str) {
		for(var i = 0; i < str.length; i++) {
			var strTmp = str.charAt(i);
			if(strTmp == ' ') {
				continue;
			} else {
				if(!(/[A-Za-z0-9-]/.test(strTmp))) {
					return false;
				}
			}
		}
		return true;
	};
	/**
	 * 检查输入的一串字符是否全部是英文
	 * @param str  字符串
	 * @returns true 或 false; true表示为数字或者英文
	 */
	validate.checkEnDashOrSpace = function(str) {
		for(var i = 0; i < str.length; i++) {
			var strTmp = str.charAt(i);
			if(!(/[A-Za-z]/.test(strTmp))) {
				return false;
			}
		}

		return true;
	};
	/**
	 * 格式化小数
	 * @param {Object} src
	 * @param {Object} pos
	 */
	validate.fomatFloat = function(src, pos) {      
		return Math.round(src * Math.pow(10, pos)) / Math.pow(10, pos);  
	};
	/**
	 * 检查输入的一串字符是否为整型数据
	 * @param str  字符串
	 * @returns true 或 false; true表示为小数
	 */
	validate.checkInteger = function(str) {
		if(str.match(/^[-+]?\d*$/) == null) {
			return false;
		} else {
			return true;
		}
	};
	/**
	 * 检查输入的一串字符是否是字符
	 * @param str字符串
	 * @returns true 或 false; true表示为全部为字符 不包含汉字
	 */
	validate.checkStr = function(str) {
		if(/[^\x00-\xff]/g.test(str)) {
			return false;
		} else {
			return true;
		}
	};
	/**
	 * 检查输入的一串字符是否包含汉字
	 * @param str         字符串
	 * @returns true 或 false; true表示包含汉字
	 */
	validate.checkChinese = function(str) {
		if(escape(str).indexOf("%u") != -1) {
			return true;
		} else {
			return false;
		}
	};

	/**
	 * 检查输入的邮箱格式是否正确
	 * @param str
	 *  字符串 /[A-Za-z0-9_-]+[@](\S*\.)(net|com|cn|org|cc|tv|[0-9]{1,3})(\S*)/g
	 * @returns true 或 false; true表示格式正确
	 */
	validate.checkEmail = function(str) {
		var reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
		if(reg.test(str)) {
			return true;
		} else {
			return false;
		}
	};
	/**
	 * 检查输入的手机号码格式是否正确
	 * @param str 字符串
	 * @returns true 或 false; true表示格式正确
	 */
	validate.checkMobilePhone = function(str) {
		if(str.match(/^(?:1\d{2})-?\d{5}(\d{3}|\*{3})$/) == null) {
			return false;
		} else {
			return true;
		}
	};
	/**
	 * 检查输入的邮政编码是否正确
	 * @param str
	 * @returns {Boolean}
	 */
	validate.post = function(str) {
		if(str.match(/^[1-9][0-9]{5}$/) == null) {
			return false;
		} else {
			return true;
		}
	};
	/**
	 * 检查输入的固定电话号码是否正确
	 * @param str  字符串
	 * @returns true 或 false; true表示格式正确
	 */
	validate.checkTelephone = function(str) {
		var filter = /^(([0\+]\d{2,3}-)?(0\d{2,3})-)?(\d{7,8})(-(\d{1,}))?$/;
		return filter.test(str);
	};
	/**
	 * 检查输入的身份证号是否正确
	 * @param str  字符串
	 * @returns true 或 false; true表示格式正确
	 */
	validate.checkCard = function(str) {
		// 15位数身份证正则表达式
		var arg1 = /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$/;
		// 18位数身份证正则表达式
		var arg2 = /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[A-Z])$/;
		if(str.match(arg1) == null && str.match(arg2) == null) {
			return false;
		} else {
			return true;
		}
	};
	/**
	 * 检查输入的字符是否具有特殊字符
	 * @param str  字符串
	 * @returns true 或 false; true表示包含特殊字符 主要用于注册信息的时候验证
	 */
	validate.checkQuote = function(str) {
		var items = new Array("~", "`", "!", "@", "#", "$", "%", "^", "&", "*", "{", "}", "[", "]", "(", ")");
		items.push(":", ";", "'", "|", "\\", "<", ">", "?", "/", "<<", ">>", "||", "//");
		items.push("select", "delete", "update", "insert", "create", "drop", "alter", "trancate");
		str = str.toLowerCase();
		for(var i = 0; i < items.length; i++) {
			if(str.indexOf(items[i]) >= 0) {
				return true;
			}
		}
		return false;
	};
	/**
	 * 判断是否包含全角
	 * @param str
	 */
	validate.checkHasFull = function(str) {
		for(var i = 0; i < str.length; i++) {
			strCode = str.charCodeAt(i);
			if((strCode > 65248) || (strCode == 12288)) {
				return true;
				break;
			}
		}
		return false;
	};
	/**
	 * 验证日期格式
	 * 
	 * @param strValue
	 * @returns {Boolean}
	 */
	validate.validateDate = function(strValue) {
		var objRegExp = /^\d{4}(\/)\d{1,2}\1\d{1,2}$/;
		if(!objRegExp.test(strValue)) {
			return false;
		} else {
			var arrayDate = strValue.split(RegExp.$1);
			var intDay = parseInt(arrayDate[2], 10);
			var intYear = parseInt(arrayDate[0], 10);
			var intMonth = parseInt(arrayDate[1], 10);

			var day = arrayDate[2].split("");
			if(day == null || day.length < 2) {
				return false;
			}

			if(intMonth > 12 || intMonth < 1) {
				return false;
			}

			var arrayLookup = {
				'01': 31,
				'03': 31,
				'04': 30,
				'05': 31,
				'06': 30,
				'07': 31,
				'08': 31,
				'09': 30,
				'10': 31,
				'11': 30,
				'12': 31
			};
			if(arrayLookup[arrayDate[1]] != null) {
				if(intDay <= arrayLookup[arrayDate[1]] && intDay != 0)
					return true;
			}

			if(intMonth - 2 == 0) {
				var booLeapYear = (intYear % 4 == 0 && (intYear % 100 != 0 || intYear % 400 == 0));
				if(((booLeapYear && intDay <= 29) || (!booLeapYear && intDay <= 28)) && intDay != 0)
					return true;
			}
		}
		return false;
	};
	/**
	 * 比较2个日期大小
	 * @param str1
	 * @param str2
	 * @param expression
	 * @returns {Boolean}
	 */
	validate.validateCompare = function(str1, str2, expression) {
		switch(expression) {
			case '>':
			case 'gt':
				return str1 > str2;
			case '>=':
				return str1 >= str2;
			case '==':
			case 'eq':
				return str1 == str2;
			case '<=':
				return str1 <= str2;
			case '<':
			case 'lt':
				return str1 < str2;
			default:
				return true;
		}
		return true;
	};
	/**
	 * 验证是否为网址
	 * @param str_url
	 * @returns {Boolean}
	 */
	validate.checkURL = function(str_url) {
		var strRegex = "^((https|http|ftp|rtsp|mms)?://)" +
			"?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" //ftp的user@
			+
			"(([0-9]{1,3}\.){3}[0-9]{1,3}" // IP形式的URL- 199.194.52.184
			+
			"|" // 允许IP和DOMAIN（域名）
			+
			"([0-9a-z_!~*'()-]+\.)*" // 域名- www.
			+
			"([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\." // 二级域名
			+
			"[a-z]{2,6})" // first level domain- .com or .museum
			+
			"(:[0-9]{1,4})?" // 端口- :80
			+
			"((/?)|" // a slash isn't required if there is no file name
			+
			"(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$";
		var re = new RegExp(strRegex);
		//re.test()
		if(re.test(str_url)) {
			return(true);
		} else {
			return(false);
		}
	};
	return validate;
});