const os = require('os');
const childProcess = require('child_process');

const exec = script => new Promise((resolve, reject) =>
	childProcess.exec(script, (error, stdout, stderr) =>
		resolve(stdout.toString())));

class Sizer {
	static dirSizeScript(dir) {
		/* override */
	}

	static fileSizeScript(dir, file) {
		/* override */
	}

	static parseOutputBytes(string) {
		/* override */
	}

	static listDirsScript(dir) {
		/* override */
	}

	static listFilesScript(dir) {
		/* override */
	}

	static parseOutputList(string) {
		/* override */
	}

	static async dirSize(dir) {
		let output = await exec(this.dirSizeScript(dir));
		return this.parseOutputBytes(output);
	}

	static async fileSize(dir, file) {
		return this.parseOutputBytes(await exec(this.fileSizeScript(dir, file)));
	}

	static async listDirs(dir) {
		return this.parseOutputList(await exec(this.listDirsScript(dir)));
	}

	static async listFiles(dir) {
		return this.parseOutputList(await exec(this.listFilesScript(dir)));
	}
}

const robocopyCommonFlags = '/L /XJ /R:0 /NP /BYTES /NFL /NDL /NJH /MT:64';

class WindowSizer extends Sizer {
	static dirSizeScript(dir) {
		return `robocopy.exe "${dir}" c:\\fakepathduh /E ${robocopyCommonFlags}`;
	}

	static fileSizeScript(dir, file) {
		return `robocopy.exe "${dir}" c:\\fakepathduh ${file} ${robocopyCommonFlags}`;
	}

	static parseOutputBytes(string) {
		let bytes = string.match(/Bytes :\s+(\d+)/);
		return bytes ? bytes[1] : -1;
	}

	static listDirsScript(dir) {
		return `dir "${dir}" /b /a:d`;
	}

	static listFilesScript(dir) {
		return `dir "${dir}" /b /a:-d`;
	}

	static parseOutputList(string) {
		return string.split('\n').filter(a => a);
	}
}

class LinuxSizer extends Sizer {
	static dirSizeScript(dir) {
		return `du -sB1 ${dir}`;
	}

	static fileSizeScript(dir, file) {
		return `du -sB1 ${dir}/${file}`;
	}

	static parseOutputBytes(string) {
		return string.match(/^(\d+)/)[1];
	}

	static listDirsScript(dir) {
		return `find ${dir} -mindepth 1 -maxdepth 1 -type d -printf '%f\\n'`;
	}

	static listFilesScript(dir) {
		return `find ${dir} -mindepth 1 -maxdepth 1 -not -type d -printf '%f\\n'`;
	}

	static parseOutputList(string) {
		return string.split('\n').filter(a => a);
	}
}

module.exports = os.platform() === 'linux' ? LinuxSizer : WindowSizer;

// let basePath = '/usr/local/google/home/manukh/personal/git-split';
// let basePath = 'C:/users/manukh/personal/calc';
// module.exports.dirSize(basePath).then(a => console.log(a));
// module.exports.fileSize(basePath, 'readme.md').then(a => console.log(a));
// module.exports.listDirs(basePath).then(a => console.log(a));
// module.exports.listFiles(basePath).then(a => console.log(a));
