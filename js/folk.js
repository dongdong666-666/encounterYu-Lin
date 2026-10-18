/* =========================================================
   folk.js —— 民俗拾趣：展开 / 收起故事
   只操作 .folk-toggle 与其 aria-controls 指向的内容
   ========================================================= */
(function () {
	var buttons = document.querySelectorAll(".folk-toggle");
	Array.prototype.forEach.call(buttons, function (button) {
		var panelId = button.getAttribute("aria-controls");
		var panel = panelId ? document.getElementById(panelId) : null;
		if (!panel) {
			return;
		}
		button.addEventListener("click", function () {
			var expanded = button.getAttribute("aria-expanded") === "true";
			var next = !expanded;
			panel.hidden = !next;
			button.setAttribute("aria-expanded", next ? "true" : "false");
			button.textContent = next ? "收起故事" : "展开故事";
		});
	});
})();
