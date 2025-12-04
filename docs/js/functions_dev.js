// variables
var $window = $(window), gardenCtx, gardenCanvas, $garden, garden;
var clientWidth = $(window).width();
var clientHeight = $(window).height();
var offsetX, offsetY;

$(function () {
	function initLoveScene() {
		$loveHeart = $("#loveHeart");
		offsetX = $loveHeart.width() / 2;
		offsetY = $loveHeart.height() / 2 - 55;
	    $garden = $("#garden");
	    gardenCanvas = $garden[0];
		gardenCanvas.width = $("#loveHeart").width();
	    gardenCanvas.height = $("#loveHeart").height()
	    gardenCtx = gardenCanvas.getContext("2d");
	    gardenCtx.globalCompositeOperation = "source-over";
	    garden = new Garden(gardenCtx, gardenCanvas);
		
		var contentWidth = $loveHeart.outerWidth(true) + $("#code").outerWidth(true);
		$("#content").css("width", contentWidth);
		var contentHeight = Math.max($loveHeart.outerHeight(true), $("#code").outerHeight(true));
		$("#content").css("height", contentHeight);
		$("#content").css("margin-top", Math.max(($window.height() - $("#content").height()) / 2, 10));
		$("#content").css("margin-left", Math.max(($window.width() - $("#content").width()) / 2, 10));

	    // renderLoop
	    setInterval(function () {
	        garden.render();
	    }, Garden.options.renderSpeed);
	}

    LoveLock.init(initLoveScene);
});

$(window).resize(function() {
    var newWidth = $(window).width();
    var newHeight = $(window).height();
    if (newWidth != clientWidth && newHeight != clientHeight) {
        location.replace(location);
    }
});

function getHeartPoint(angle) {
	var t = angle / Math.PI;
	var x = 19.5 * (16 * Math.pow(Math.sin(t), 3));
	var y = - 20 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
	return new Array(offsetX + x, offsetY + y);
}

function startHeartAnimation() {
	var interval = 30;
	var angle = 10;
	var heart = new Array();
	var totalStars = 0;
	// 略微提高填充密度
	var maxStars = 260;
	var animationTimer = setInterval(function () {
		var point = getHeartPoint(angle);
		var draw = true;
		// 减小最小距离，让星星更密集一些
		var minDistance = 5;
		
		// 检查距离，避免星星太密集
		for (var i = 0; i < heart.length; i++) {
			var p = heart[i];
			var distance = Math.sqrt(Math.pow(p[0] - point[0], 2) + Math.pow(p[1] - point[1], 2));
			if (distance < minDistance) {
				draw = false;
				break;
			}
		}
		
		if (draw && totalStars < maxStars) {
			heart.push(point);
			garden.createParticle(point[0], point[1]);
			totalStars++;
		}
		
		angle += 0.2;
		if (angle >= 30) {
			clearInterval(animationTimer);
			// 继续渲染动画，让星星闪烁
			setTimeout(function() {
			showMessages();
			}, 2000);
		}
	}, interval);
}

var LoveLock = (function () {
	var overlay, card, input, hint, button, toggle, expectedPass, expectedCompact;
	var unlocked = false;
	var unlockCallbacks = [];

	function addUnlockCallback(callback) {
		if (typeof callback !== 'function') {
			return;
		}
		if (unlocked) {
			callback();
		} else {
			unlockCallbacks.push(callback);
		}
	}

	function flushUnlockCallbacks() {
		if (!unlockCallbacks.length) {
			return;
		}
		var queue = unlockCallbacks.slice(0);
		unlockCallbacks = [];
		for (var i = 0; i < queue.length; i++) {
			try {
				queue[i]();
			} catch (err) {
				if (window.console && console.error) {
					console.error(err);
				}
			}
		}
	}

	function normalize(str) {
		return str.replace(/\s+/g, ' ').trim().toLowerCase();
	}

	function setHint(message, color) {
		if (!hint) return;
		hint.text(message).css('color', color || '#999');
	}

	function showError(message) {
		card && card.addClass('love-lock-error');
		setTimeout(function () { card && card.removeClass('love-lock-error'); }, 400);
		setHint(message || '暗号好像不太对，再试试看～', '#d63384');
	}

	function bindInputEvents() {
		if (!input || !input.length) return;
		input.unbind('keypress');
		input.bind('keypress', function (e) {
			var key = e.key || e.keyCode;
			if (key === 'Enter' || key === 13) {
				handleSubmit();
			}
		});
	}

	function changeInputType(targetType) {
		if (!input || !input.length) return;
		var domInput = input[0];
		var typeChanged = true;
		try {
			domInput.setAttribute('type', targetType);
		} catch (err) {
			typeChanged = false;
		}
		if (typeChanged && domInput.type === targetType) {
			return;
		}
		var newInput = input.clone();
		newInput.attr('type', targetType);
		newInput.val(input.val());
		input.replaceWith(newInput);
		input = newInput;
		bindInputEvents();
	}

	function togglePasswordVisibility() {
		if (!input || !toggle) return;
		var isHidden = toggle.hasClass('is-hidden');
		if (isHidden) {
			changeInputType('text');
			toggle.removeClass('is-hidden');
		} else {
			changeInputType('password');
			toggle.addClass('is-hidden');
		}
		var dom = input[0];
		if (dom && dom.focus) {
			dom.focus();
			var length = input.val().length;
			if (dom.setSelectionRange) {
				dom.setSelectionRange(length, length);
			}
		}
	}

	function unlock() {
		if (!overlay) return;
		card && card.addClass('love-lock-success');
		setHint('欢迎回到我们的秘密花园 💗', '#2ec4b6');
		overlay.addClass('love-lock-hidden');
		$('body').removeClass('love-locked');
		setTimeout(function () { overlay.remove(); }, 700);
		unlocked = true;
		flushUnlockCallbacks();
	}

	function handleSubmit() {
		if (!input) return;
		var value = input.val();
		if (!value.trim()) {
			showError('先写下一句暗号吧～');
			return;
		}
		var normalized = normalize(value);
		var compact = normalized.replace(/\s+/g, '');
		if (normalized === expectedPass || compact === expectedCompact) {
			unlock();
		} else {
			showError('暗号好像不太对，再想想？');
		}
	}

	return {
		init: function (onReady) {
			if (onReady) addUnlockCallback(onReady);
			overlay = $('#loveLockOverlay');
			if (!overlay.length) {
				unlocked = true;
				$('body').removeClass('love-locked');
				flushUnlockCallbacks();
				return;
			}
			card = $('#loveLockCard');
			input = $('#loveLockInput');
			hint = $('#loveLockHint');
			button = $('#loveLockBtn');
			toggle = $('#loveLockToggle');
			expectedPass = normalize(window.atob('aSBsb3ZlIHlvdSBtb3JlIHRoYW4gaSBjYW4gc2F5'));
			expectedCompact = expectedPass.replace(/\s+/g, '');
			$('body').addClass('love-locked');
			button.bind('click', handleSubmit);
			bindInputEvents();
			if (toggle.length) {
				toggle.addClass('is-hidden');
				toggle.bind('click', togglePasswordVisibility);
			}
			setTimeout(function () {
				input.trigger('focus');
			}, 500);
		},
		onUnlock: addUnlockCallback
	};
})();

(function($) {
	$.fn.typewriter = function() {
		this.each(function() {
			var $ele = $(this), str = $ele.html(), progress = 0;
			$ele.html('');
			var timer = setInterval(function() {
				var current = str.substr(progress, 1);
				if (current == '<') {
					progress = str.indexOf('>', progress) + 1;
				} else {
					progress++;
				}
				$ele.html(str.substring(0, progress) + (progress & 1 ? '_' : ''));
				if (progress >= str.length) {
					clearInterval(timer);
				}
			}, 75);
		});
		return this;
	};
})(jQuery);

function timeElapse(date){
	var current = Date();
	var seconds = (Date.parse(current) - Date.parse(date)) / 1000;
	var days = Math.floor(seconds / (3600 * 24));
	seconds = seconds % (3600 * 24);
	var hours = Math.floor(seconds / 3600);
	if (hours < 10) {
		hours = "0" + hours;
	}
	seconds = seconds % 3600;
	var minutes = Math.floor(seconds / 60);
	if (minutes < 10) {
		minutes = "0" + minutes;
	}
	seconds = seconds % 60;
	if (seconds < 10) {
		seconds = "0" + seconds;
	}
	var result = "<span class=\"digit\">" + days + "</span> days <span class=\"digit\">" + hours + "</span> hours <span class=\"digit\">" + minutes + "</span> minutes <span class=\"digit\">" + seconds + "</span> seconds"; 
	$("#elapseClock").html(result);
}

function showMessages() {
	adjustWordsPosition();
	$('#messages').fadeIn(5000, function() {
		showLoveU();
	});
}

function adjustWordsPosition() {
	$('#words').css("position", "absolute");
	$('#words').css("top", $("#garden").position().top + 195);
	$('#words').css("left", $("#garden").position().left + 70);
}

function adjustCodePosition() {
	$('#code').css("margin-top", ($("#garden").height() - $("#code").height()) / 2);
}

function showLoveU() {
	$('#loveu').fadeIn(3000);
}