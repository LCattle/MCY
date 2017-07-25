define([], function() {
	var	_CMY = {
			init: function(opts) {
				console.log('能进来？');
				var _t = this;
				_t.opts = {
					page_view: opts.page_view || 'default page / index',
					clickDom: $(opts.clickDom),
					attrKey: 'data-type'
				}
				_t._opt = $.extend({}, opts, _t.opts);
				//_t._tm();
				_t.datas = {
					page: _t.opts.page_view,
					lists: [], // 记录点击哪些按钮
					positions: [] // 记录用户在页面停留的区域
				}
				_t._g();
				_t.topValue = 0, // 上次滚动条到顶部的距离  
					_t.interval = null; // 定时器 
				// 监听滚动条 
				document.onscroll = function() {
					if(_t.interval == null) // 未发起时，启动定时器，1秒1执行  
						_t.interval = setInterval(function() {
							_t._getPositions();
						}, 800);
					_t.topValue = document.documentElement.scrollTop;
				}

				$(window).bind('beforeunload', function() {
					_t._leavePage();
				})
			},
			// 每个按钮的点击拦截
			_g: function() {
				var _t = this;
				_t._opt.clickDom.unbind('click').on('click', function(e) {
					var _d = $(this);
					console.log('点击了吗？');
					var btnName = _d.attr(_t.opts.attrKey);
					var otherVal = _d.text() || '';
					_t.datas.lists.push({
						type: 'click',
						dataTime: new Date().getTime(),
						btnName: btnName,
						other_value: otherVal
					});
					console.log(_t.datas);
					window.localStorage.datas = JSON.stringify(_t.datas);
					return;
				});
			},
			// 滑动
			_tm: function() {
				// 根据页面的顶部，来获取距离顶部的位置，再根据整个视图的高度计算出停留在哪个区域
				console.log('网页可见区域：');
				console.log(document.body.clientWidth);
				console.log(document.body.clientHeight);
				console.log('网页可见区域，包含边线：');
				console.log(document.body.offsetWidth);
				console.log(document.body.offsetHeight);
				console.log('网页正文全文：');
				console.log(document.body.scrollWidth);
				console.log(document.body.scrollHeight);
				console.log('网页被卷去高左：');
				console.log(document.body.scrollTop);
				console.log(document.body.scrollLeft);
				console.log('网页正文部分：');
				console.log(window.screenTop);
				console.log(window.screenLeft);
				console.log('屏幕分辨率：');
				console.log(window.screen.height);
				console.log(window.screen.width);
				console.log('屏幕可用工作区域：');
				console.log(window.screen.availHeight);
				console.log(window.screen.availWidth);
			},
			//  获取停留的位置
			_getPositions: function() {
				var _t = this;
				// 判断此刻到顶部的距离是否和1秒前的距离相等
				var endScrollTopVal = document.documentElement.scrollTop;
				if(endScrollTopVal == _t.topValue) {
					clearInterval(_t.interval);
					// 获取到停留的位置
					// 1.屏幕可工作的区域
					var winSH = window.screen.height;
					var winSW = window.screen.width;
					// 2.网页可见高度
					var bodyH = document.body.clientHeight;
					// 3.网页被卷去的高度
					var docuScrollTop = document.body.scrollTop;
					var t = bodyH - (bodyH - docuScrollTop); // 得到停留区域的顶部
					var b = bodyH - (bodyH - (t + winSH)); // 得到停留区域的底部
					_t.datas.positions.push({
						t: t,
						b: b
					});
					console.log(_t.datas);
					_t.interval = null;
				}
			},
			_leavePage: function() {
				var _t = this;

			}
		}
		return _CMY;
});