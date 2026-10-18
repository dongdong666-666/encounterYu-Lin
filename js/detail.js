/* =========================================================
   detail.js —— 光影玉林手风琴相册
   电脑端：鼠标移入展开；键盘聚焦后 Enter / 空格展开
   手机端：点按展开，再次点按收起
   ========================================================= */
(function () {
	var album = document.querySelector(".photo-album");
	if (!album) {
		return;
	}
	var images = Array.prototype.slice.call(album.querySelectorAll("img"));
	var caption = document.getElementById("photoCaption");

	function setCaption(img) {
		if (!caption) {
			return;
		}
		var text = img.getAttribute("data-caption") || img.getAttribute("alt") || "";
		caption.textContent = text ? "当前：" + text : "";
	}

	function isMobile() {
		return window.matchMedia("(max-width: 820px)").matches;
	}

	function syncAlbumState() {
		if (album.querySelector("img.active")) {
			album.classList.add("has-active");
		} else {
			album.classList.remove("has-active");
		}
	}

	function clearActive() {
		images.forEach(function (other) {
			other.classList.remove("active");
		});
		syncAlbumState();
	}

	function toggleActive(img) {
		var willOpen = !img.classList.contains("active");
		clearActive();
		if (willOpen) {
			img.classList.add("active");
		}
		syncAlbumState();
	}

	images.forEach(function (img) {
		img.setAttribute("tabindex", "0");
		img.setAttribute("role", "button");
		img.setAttribute("aria-label", (img.getAttribute("data-caption") || "玉林光影") + "，按 Enter 展开或收起");

		img.addEventListener("mouseenter", function () {
			setCaption(img);
			if (!isMobile()) {
				clearActive();
			}
		});
		img.addEventListener("focus", function () {
			setCaption(img);
		});
		img.addEventListener("blur", function () {
			if (!isMobile()) {
				img.classList.remove("active");
				syncAlbumState();
			}
		});
		img.addEventListener("click", function () {
			setCaption(img);
			if (isMobile()) {
				toggleActive(img);
			}
		});
		img.addEventListener("keydown", function (event) {
			if (event.key === "Enter" || event.key === " ") {
				event.preventDefault();
				setCaption(img);
				toggleActive(img);
			}
		});
	});

	if (images.length) {
		setCaption(images[0]);
	}
})();
