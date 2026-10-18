/* =========================================================
   common.js —— 手机端左侧导航开关
   电脑端原版侧栏完全不受影响：.box-toggle 默认 display:none
   ========================================================= */
(function () {
	var box = document.querySelector(".box");
	if (!box) {
		return;
	}
	var toggle = box.querySelector(".box-toggle");
	if (!toggle) {
		return;
	}

	function setOpen(open) {
		if (open) {
			box.classList.add("open");
		} else {
			box.classList.remove("open");
		}
		toggle.setAttribute("aria-expanded", open ? "true" : "false");
	}

	/* ---------------- 电脑端：鼠标靠近左边缘自动弹出 ---------------- */
	var desktopQuery = window.matchMedia("(min-width: 821px)");
	var hideTimer = null;
	var pointerX = 0;

	// 白色边缘提示：导航隐藏时露在屏幕左侧，点击/悬停可展开
	var navEdge = document.createElement("button");
	navEdge.type = "button";
	navEdge.className = "nav-edge";
	navEdge.setAttribute("aria-label", "展开左侧导航");
	navEdge.setAttribute("aria-controls", "sideNav");
	navEdge.setAttribute("aria-expanded", "false");
	navEdge.textContent = "›";
	document.body.appendChild(navEdge);

	function clearHideTimer() {
		if (hideTimer) {
			clearTimeout(hideTimer);
			hideTimer = null;
		}
	}

	function syncEdge(open) {
		navEdge.classList.toggle("is-open", open);
		navEdge.setAttribute("aria-expanded", open ? "true" : "false");
	}

	function hideNav() {
		box.classList.remove("nav-open");
		syncEdge(false);
	}

	function showNav() {
		if (!desktopQuery.matches) {
			return;
		}
		clearHideTimer();
		box.classList.add("nav-open");
		syncEdge(true);
	}

	function hideNavLater(keepForEdge) {
		if (!desktopQuery.matches) {
			return;
		}
		clearHideTimer();
		hideTimer = setTimeout(function () {
			if ((keepForEdge && pointerX <= 220) || box.matches(":hover") || box.contains(document.activeElement)) {
				return;
			}
			hideNav();
		}, 260);
	}

	navEdge.addEventListener("mouseenter", showNav);
	navEdge.addEventListener("click", function () {
		showNav();
		var firstLink = box.querySelector(".box-links a");
		if (firstLink) {
			firstLink.focus();
		}
	});

	// 只有脚本正常执行时才启用自动隐藏，避免 JS 失效后导航永久消失
	document.body.classList.add("nav-ready");

	document.addEventListener("mousemove", function (event) {
		if (!desktopQuery.matches) {
			return;
		}
		pointerX = event.clientX;
		if (event.clientX <= 18) {
			showNav();
		} else if (box.classList.contains("nav-open") && event.clientX > 220) {
			hideNavLater(true);
		}
	});

	box.addEventListener("mouseenter", showNav);
	box.addEventListener("mouseleave", function () {
		hideNavLater(true);
	});
	box.addEventListener("focusin", showNav);
	box.addEventListener("focusout", function () {
		hideNavLater(false);
	});

	window.addEventListener("resize", function () {
		if (!desktopQuery.matches) {
			clearHideTimer();
			hideNav();
		}
	});

	toggle.addEventListener("click", function (event) {
		event.stopPropagation();
		setOpen(!box.classList.contains("open"));
	});

	// 点击导航项后收起
	var links = box.querySelectorAll(".box-links a");
	for (var i = 0; i < links.length; i++) {
		links[i].addEventListener("click", function () {
			setOpen(false);
		});
	}

	// 点击侧栏外部或按 Esc 收起
	document.addEventListener("click", function (event) {
		if (box.classList.contains("open") && !box.contains(event.target)) {
			setOpen(false);
		}
	});
	document.addEventListener("keydown", function (event) {
		if (event.key !== "Escape") {
			return;
		}
		if (box.classList.contains("open")) {
			setOpen(false);
			toggle.focus();
		}
		if (box.classList.contains("nav-open")) {
			hideNav();
		}
	});
})();
