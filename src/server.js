const path = require('path');
const fs = require('fs').promises;
const http = require('http');
const Sizer = require('./Sizer');

let getHtml = () => fs.readFile(path.resolve(__dirname, './index.html'));

let html = null; // getHtml();

http.createServer(async (request, response) => {
	const respondJson = async json => {
		response.writeHeader(200, {'Content-Type': 'application/json'});
		response.end(JSON.stringify(await json));
	};

	let [requestType, ...requestPath] = decodeURI(request.url).split('/').filter(a => a);
	let path = requestPath.join('/');
	let dir = requestPath.slice(0, -1).join('/');
	let file = requestPath.slice(-1)[0];

	console.log(request.url, requestType, path, dir, file);

	switch (requestType) {
		case 'dir-size':
			return respondJson(Sizer.dirSize(path));

		case 'file-size':
			return respondJson(Sizer.fileSize(dir, file));

		case 'list-dirs':
			return respondJson(Sizer.listDirs(path));

		case 'list-files':
			return respondJson(Sizer.listFiles(path));

		default:
			response.writeHeader(200, {'Content-Type': 'text/html'});
			response.end(await (html || getHtml()));
	}
}).listen(8081);
