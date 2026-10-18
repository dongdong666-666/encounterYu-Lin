/* =========================================================
   serve.js —— 本地静态预览服务器（仅用于开发预览，不参与网站功能）
   运行：node serve.js
   访问：http://localhost:8000/
   说明：支持 Range 请求，视频拖动进度条时可以正常 seek。
   ========================================================= */

const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 8000;

const MIME = {
	".html": "text/html; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".js": "text/javascript; charset=utf-8",
	".json": "application/json; charset=utf-8",
	".md": "text/markdown; charset=utf-8",
	".txt": "text/plain; charset=utf-8",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".png": "image/png",
	".webp": "image/webp",
	".gif": "image/gif",
	".svg": "image/svg+xml",
	".mp4": "video/mp4",
	".webm": "video/webm",
	".ico": "image/x-icon"
};

const server = http.createServer((req, res) => {
	if (req.method !== "GET" && req.method !== "HEAD") {
		res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
		res.end("只支持 GET / HEAD");
		return;
	}

	let urlPath;
	try {
		urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
	} catch (error) {
		res.writeHead(400);
		res.end("Bad Request");
		return;
	}

	// 阻止目录穿越
	let target = path.normalize(path.join(ROOT, urlPath));
	if (target !== ROOT && !target.startsWith(ROOT + path.sep)) {
		res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
		res.end("Forbidden");
		return;
	}

	fs.stat(target, (statErr, stats) => {
		if (!statErr && stats.isDirectory()) {
			target = path.join(target, "index.html");
		}

		fs.stat(target, (err, fileStats) => {
			if (err || !fileStats.isFile()) {
				res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
				res.end("404 Not Found: " + urlPath);
				return;
			}

			const type = MIME[path.extname(target).toLowerCase()] || "application/octet-stream";
			const range = req.headers.range;

			if (range) {
				const match = /bytes=(\d*)-(\d*)/.exec(range);
				if (match) {
					let start = match[1] ? Number(match[1]) : 0;
					let end = match[2] ? Number(match[2]) : fileStats.size - 1;
					if (start > end || start >= fileStats.size) {
						res.writeHead(416, { "Content-Range": "bytes */" + fileStats.size });
						res.end();
						return;
					}
					end = Math.min(end, fileStats.size - 1);
					res.writeHead(206, {
						"Content-Type": type,
						"Content-Length": end - start + 1,
						"Content-Range": "bytes " + start + "-" + end + "/" + fileStats.size,
						"Accept-Ranges": "bytes",
						"Cache-Control": "no-cache"
					});
					if (req.method === "HEAD") {
						res.end();
						return;
					}
					fs.createReadStream(target, { start, end }).pipe(res);
					return;
				}
			}

			res.writeHead(200, {
				"Content-Type": type,
				"Content-Length": fileStats.size,
				"Accept-Ranges": "bytes",
				"Cache-Control": "no-cache"
			});
			if (req.method === "HEAD") {
				res.end();
				return;
			}
			fs.createReadStream(target).pipe(res);
		});
	});
});

server.listen(PORT, "127.0.0.1", () => {
	console.log("遇见玉林 · 本地预览：http://localhost:" + PORT + "/");
	console.log("按 Ctrl + C 停止服务");
});
