/* =========================================================
   message.js —— 旅人树屋
   1. 给玉林留句话：昵称 + 留言，保存后可删除
   2. 我的旅行心愿：景点 / 美食 / 日期 / 备注
   3. 出游日历：切换月份、选择日期，与心愿日期联动
   数据全部保存在 localStorage，仅当前浏览器可见
   ========================================================= */
(function () {
	var KEYS = {
		messages: "yulin:messages",
		wishes: "yulin:wishes",
		plan: "yulin:plan"
	};

	var messageForm = document.getElementById("messageForm");
	var wishForm = document.getElementById("wishForm");
	var messageList = document.getElementById("messageList");
	var wishList = document.getElementById("wishList");
	var messageHint = document.getElementById("messageHint");
	var wishHint = document.getElementById("wishHint");
	var wishSpot = document.getElementById("wishSpot");
	var wishFood = document.getElementById("wishFood");
	var wishDate = document.getElementById("wishDate");
	var wishNote = document.getElementById("wishNote");
	var calendarBody = document.getElementById("calendarBody");
	var calendarTitle = document.getElementById("calendarTitle");
	var calendarNote = document.getElementById("calendarNote");
	var prevMonth = document.getElementById("prevMonth");
	var nextMonth = document.getElementById("nextMonth");

	function read(key, fallback) {
		try {
			var raw = window.localStorage.getItem(key);
			if (!raw) {
				return fallback;
			}
			var value = JSON.parse(raw);
			return value === null || value === undefined ? fallback : value;
		} catch (error) {
			return fallback;
		}
	}

	function write(key, value) {
		try {
			window.localStorage.setItem(key, JSON.stringify(value));
			return true;
		} catch (error) {
			return false;
		}
	}

	function makeId() {
		return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
	}

	function pad(number) {
		return number < 10 ? "0" + number : String(number);
	}

	function dateKey(year, month, day) {
		return year + "-" + pad(month + 1) + "-" + pad(day);
	}

	function todayKey() {
		var now = new Date();
		return dateKey(now.getFullYear(), now.getMonth(), now.getDate());
	}

	function formatTime(iso) {
		var date = new Date(iso);
		if (isNaN(date.getTime())) {
			return "";
		}
		return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate()) +
			" " + pad(date.getHours()) + ":" + pad(date.getMinutes());
	}

	function setHint(element, text, ok) {
		if (!element) {
			return;
		}
		element.textContent = text;
		element.className = ok ? "form-hint ok" : "form-hint";
	}

	/* ---------------- 留言 ---------------- */
	function renderMessages() {
		if (!messageList) {
			return;
		}
		var messages = read(KEYS.messages, []);
		messageList.innerHTML = "";
		if (!messages.length) {
			var empty = document.createElement("p");
			empty.className = "empty-tip";
			empty.textContent = "树屋里还没有留言，写下第一句吧。";
			messageList.appendChild(empty);
			return;
		}
		messages.slice().reverse().forEach(function (item) {
			var card = document.createElement("div");
			card.className = "note-item";

			var meta = document.createElement("p");
			meta.className = "note-meta";
			meta.textContent = item.name + " · " + formatTime(item.time);

			var text = document.createElement("p");
			text.className = "note-text";
			text.textContent = item.text;

			var del = document.createElement("button");
			del.type = "button";
			del.className = "note-del";
			del.setAttribute("data-del", item.id);
			del.textContent = "删除";

			card.appendChild(del);
			card.appendChild(meta);
			card.appendChild(text);
			messageList.appendChild(card);
		});
	}

	if (messageForm) {
		messageForm.addEventListener("submit", function (event) {
			event.preventDefault();
			var nameInput = document.getElementById("user");
			var textInput = document.getElementById("messageText");
			var name = nameInput ? nameInput.value.trim() : "";
			var text = textInput ? textInput.value.trim() : "";

			if (!name || !text) {
				setHint(messageHint, "昵称和留言都要写一点，再提交。", false);
				return;
			}

			var messages = read(KEYS.messages, []);
			messages.push({
				id: makeId(),
				name: name.slice(0, 20),
				text: text.slice(0, 300),
				time: new Date().toISOString()
			});
			var saved = write(KEYS.messages, messages);
			renderMessages();
			messageForm.reset();
			setHint(messageHint, saved ? "留言已保存在当前浏览器。" : "留言已显示，但浏览器禁用了本地存储，刷新后可能丢失。", saved);
		});
	}

	if (messageList) {
		messageList.addEventListener("click", function (event) {
			var button = event.target.closest ? event.target.closest("button[data-del]") : null;
			if (!button) {
				return;
			}
			if (!window.confirm("删除这条留言吗？")) {
				return;
			}
			var id = button.getAttribute("data-del");
			var messages = read(KEYS.messages, []).filter(function (item) {
				return item.id !== id;
			});
			write(KEYS.messages, messages);
			renderMessages();
			setHint(messageHint, "已删除这条留言。", true);
		});
	}

	/* ---------------- 心愿 ---------------- */
	function renderWishes() {
		if (!wishList) {
			return;
		}
		var wishes = read(KEYS.wishes, []);
		wishList.innerHTML = "";
		if (!wishes.length) {
			var empty = document.createElement("p");
			empty.className = "empty-tip";
			empty.textContent = "还没有写下心愿，先挑一个想去的地方吧。";
			wishList.appendChild(empty);
			return;
		}
		wishes.slice().reverse().forEach(function (item) {
			var card = document.createElement("div");
			card.className = "note-item";

			var meta = document.createElement("p");
			meta.className = "note-meta";
			meta.textContent = "心愿 · " + formatTime(item.time);

			var text = document.createElement("p");
			text.className = "note-text";
			var lines = [
				"想去：" + (item.spot || "还没定"),
				"想吃：" + (item.food || "还没定"),
				"计划：" + (item.date || "还没定")
			];
			if (item.note) {
				lines.push("想说的话：" + item.note);
			}
			text.textContent = lines.join("\n");

			var del = document.createElement("button");
			del.type = "button";
			del.className = "note-del";
			del.setAttribute("data-del", item.id);
			del.textContent = "删除";

			card.appendChild(del);
			card.appendChild(meta);
			card.appendChild(text);
			wishList.appendChild(card);
		});
	}

	if (wishForm) {
		wishForm.addEventListener("submit", function (event) {
			event.preventDefault();
			var spot = wishSpot ? wishSpot.value.trim() : "";
			var food = wishFood ? wishFood.value.trim() : "";
			var date = wishDate ? wishDate.value : "";
			var note = wishNote ? wishNote.value.trim() : "";

			if (!spot && !food && !date && !note) {
				setHint(wishHint, "至少写一个想去的地方、想吃的味道或日期，再保存。", false);
				return;
			}

			var wishes = read(KEYS.wishes, []);
			wishes.push({
				id: makeId(),
				spot: spot.slice(0, 30),
				food: food.slice(0, 30),
				date: date,
				note: note.slice(0, 200),
				time: new Date().toISOString()
			});
			var saved = write(KEYS.wishes, wishes);

			if (date) {
				selectedDate = date;
				write(KEYS.plan, selectedDate);
				var parts = date.split("-");
				if (parts.length === 3) {
					viewYear = Number(parts[0]);
					viewMonth = Number(parts[1]) - 1;
				}
				renderCalendar();
				updateCalendarNote();
			}

			renderWishes();
			wishForm.reset();
			if (wishDate) {
				wishDate.value = selectedDate || "";
			}
			setHint(wishHint, saved ? "心愿已保存在当前浏览器。" : "心愿已显示，但浏览器禁用了本地存储，刷新后可能丢失。", saved);
		});
	}

	if (wishList) {
		wishList.addEventListener("click", function (event) {
			var button = event.target.closest ? event.target.closest("button[data-del]") : null;
			if (!button) {
				return;
			}
			if (!window.confirm("删除这条心愿吗？")) {
				return;
			}
			var id = button.getAttribute("data-del");
			var wishes = read(KEYS.wishes, []).filter(function (item) {
				return item.id !== id;
			});
			write(KEYS.wishes, wishes);
			renderWishes();
			renderCalendar();
			setHint(wishHint, "已删除这条心愿。", true);
		});
	}

	/* ---------------- 出游日历 ---------------- */
	var now = new Date();
	var viewYear = now.getFullYear();
	var viewMonth = now.getMonth();
	var selectedDate = read(KEYS.plan, "") || "";

	function updateCalendarNote(message) {
		if (!calendarNote) {
			return;
		}
		if (message) {
			calendarNote.textContent = message;
			return;
		}
		if (selectedDate) {
			calendarNote.textContent = "已把 " + selectedDate + " 记为出游计划。这里只代表个人计划，不代表景区活动。";
		} else {
			calendarNote.textContent = "点选一个日期，会同时写入上面的“计划出游日期”；这里只代表个人计划，不代表景区活动。";
		}
	}

	function renderCalendar() {
		if (!calendarBody) {
			return;
		}
		if (calendarTitle) {
			calendarTitle.textContent = viewYear + "年" + (viewMonth + 1) + "月";
		}

		var wishes = read(KEYS.wishes, []);
		var wishDates = {};
		wishes.forEach(function (item) {
			if (item.date) {
				wishDates[item.date] = true;
			}
		});

		var firstDay = new Date(viewYear, viewMonth, 1).getDay();
		var daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
		var today = todayKey();

		calendarBody.innerHTML = "";
		var row = document.createElement("tr");
		var cellIndex = 0;

		function newCell() {
			var cell = document.createElement("td");
			row.appendChild(cell);
			cellIndex++;
			return cell;
		}

		for (var i = 0; i < firstDay; i++) {
			newCell().className = "empty";
		}

		for (var day = 1; day <= daysInMonth; day++) {
			if (cellIndex === 7) {
				calendarBody.appendChild(row);
				row = document.createElement("tr");
				cellIndex = 0;
			}
			var cell = newCell();
			var key = dateKey(viewYear, viewMonth, day);
			cell.className = "day";
			cell.textContent = String(day);
			cell.setAttribute("data-date", key);
			cell.setAttribute("tabindex", "0");
			cell.setAttribute("role", "button");
			cell.setAttribute("aria-label", key);
			if (key === today) {
				cell.className += " today";
			}
			if (key === selectedDate) {
				cell.className += " selected";
			}
			if (wishDates[key]) {
				cell.className += " has-wish";
			}
		}

		while (cellIndex > 0 && cellIndex < 7) {
			newCell().className = "empty";
		}
		calendarBody.appendChild(row);
	}

	function selectDate(key) {
		selectedDate = key;
		write(KEYS.plan, selectedDate);
		if (wishDate) {
			wishDate.value = selectedDate;
		}
		renderCalendar();
		updateCalendarNote("已把 " + key + " 记为出游计划，可以继续补充上面的心愿。");
	}

	if (calendarBody) {
		calendarBody.addEventListener("click", function (event) {
			var cell = event.target.closest ? event.target.closest("td.day") : null;
			if (cell && cell.getAttribute("data-date")) {
				selectDate(cell.getAttribute("data-date"));
			}
		});
		calendarBody.addEventListener("keydown", function (event) {
			var cell = event.target.closest ? event.target.closest("td.day") : null;
			if (cell && (event.key === "Enter" || event.key === " ")) {
				event.preventDefault();
				selectDate(cell.getAttribute("data-date"));
			}
		});
	}

	if (prevMonth) {
		prevMonth.addEventListener("click", function () {
			viewMonth--;
			if (viewMonth < 0) {
				viewMonth = 11;
				viewYear--;
			}
			renderCalendar();
		});
	}

	if (nextMonth) {
		nextMonth.addEventListener("click", function () {
			viewMonth++;
			if (viewMonth > 11) {
				viewMonth = 0;
				viewYear++;
			}
			renderCalendar();
		});
	}

	/* ---------------- 初始化 ---------------- */
	if (selectedDate) {
		var selectedParts = selectedDate.split("-");
		if (selectedParts.length === 3) {
			viewYear = Number(selectedParts[0]);
			viewMonth = Number(selectedParts[1]) - 1;
		}
	}
	renderMessages();
	renderWishes();
	renderCalendar();
	updateCalendarNote();
	if (wishDate && selectedDate) {
		wishDate.value = selectedDate;
	}
})();
