define(['jquery', "css!../lib/animation/animate.min"], function() {
	$.fn.extend({
		animateCss: function(animationName, callBack) {
			var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
			this.addClass('animated ' + animationName).one(animationEnd, function() {
				$(this).removeClass('animated ' + animationName);
				if(callBack && callBack instanceof Function) {
					callBack();
				}
			});
		},
		animateCssInfinite: function(animationName, callBack) {
			var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
			this.addClass('animated infinite ' + animationName).one(animationEnd, function() {
				$(this).removeClass('animated infinite ' + animationName);
				if(callBack && callBack instanceof Function) {
					callBack();
				}
				console.log("stop");
			});
		},
		stopAnimate:function(){
			this.removeClass("animated infinite");
		}
		
	});

	var animate = {
		bounce: "bounce",
		flash: "flash",
		pulse: "pulse",
		rubberBand: "rubberBand",
		shake: "shake",
		headShake: "headShake",
		swing: "swing",
		tada: "tada",
		wobble: "wobble",
		jello: "jello",
		bounceIn: "bounceIn",
		bounceInDown: "bounceInDown",
		bounceInLeft: "bounceInLeft",
		bounceInRight: "bounceInRight",
		bounceInUp: "bounceInUp",
		bounceOut: "bounceOut",
		bounceOutDown: "bounceOutDown",
		bounceOutLeft: "bounceOutLeft",
		bounceOutRight: "bounceOutRight",
		bounceOutUp: "bounceOutUp",
		fadeIn: "fadeIn",
		fadeInDown: "fadeInDown",
		fadeInDownBig: "fadeInDownBig",
		fadeInLeft: "fadeInLeft",
		fadeInLeftBig: "fadeInLeftBig",
		fadeInRight: "fadeInRight",
		fadeInRightBig: "fadeInRightBig",
		fadeInUp: "fadeInUp",
		fadeInUpBig: "fadeInUpBig",
		fadeOut: "fadeOut",
		fadeOutDown: "fadeOutDown",
		fadeOutDownBig: "fadeOutDownBig",
		fadeOutLeft: "fadeOutLeft",
		fadeOutLeftBig: "fadeOutLeftBig",
		fadeOutRight: "fadeOutRight",
		fadeOutRightBig: "fadeOutRightBig",
		fadeOutUp: "fadeOutUp",
		fadeOutUpBig: "fadeOutUpBig",
		flipInX: "flipInX",
		flipInY: "flipInY",
		flipOutX: "flipOutX",
		flipOutY: "flipOutY",
		lightSpeedIn: "lightSpeedIn",
		lightSpeedOut: "lightSpeedOut",
		rotateIn: "rotateIn",
		rotateInDownLeft: "rotateInDownLeft",
		rotateInDownRight: "rotateInDownRight",
		rotateInUpLeft: "rotateInUpLeft",
		rotateInUpRight: "rotateInUpRight",
		rotateOut: "rotateOut",
		rotateOutDownLeft: "rotateOutDownLeft",
		rotateOutDownRight: "rotateOutDownRight",
		rotateOutUpLeft: "rotateOutUpLeft",
		rotateOutUpRight: "rotateOutUpRight",
		hinge: "hinge",
		rollIn: "rollIn",
		rollOut: "rollOut",
		zoomIn: "zoomIn",
		zoomInDown: "zoomInDown",
		zoomInLeft: "zoomInLeft",
		zoomInRight: "zoomInRight",
		zoomInUp: "zoomInUp",
		zoomOut: "zoomOut",
		zoomOutDown: "zoomOutDown",
		zoomOutLeft: "zoomOutLeft",
		zoomOutRight: "zoomOutRight",
		zoomOutUp: "zoomOutUp",
		slideInDown: "slideInDown",
		slideInLeft: "slideInLeft",
		slideInRight: "slideInRight",
		slideInUp: "slideInUp",
		slideOutDown: "slideOutDown",
		slideOutLeft: "slideOutLeft",
		slideOutRight: "slideOutRight",
		slideOutUp: "slideOutUp"
	};
	return animate;
});