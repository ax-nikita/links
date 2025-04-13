const
	AX_LOADER_ATTR_SVG = window.AX_LOADER_ATTR_SVG = 'svgLoader',
	AX_LOADER_ATTR_EL = window.AX_LOADER_ATTR_EL = 'domLoader',
	AX_LOADER_ATTR_WAITING = window.AX_LOADER_ATTR_WAITING = 'awaiting',
	AX_LOADER_ATTR_SPA = window.AX_LOADER_ATTR_SPA = 'min';

window.ax_lib_info = {
	version: "2.31",
	last_update: "30.04.2022"
};

Object.defineProperty(Object.prototype, "reIndexArr", {
	enumerable: false,
	writable: true
});

Object.defineProperty(Array.prototype, "reIndexArr", {
	enumerable: false,
	writable: true
});

Object.prototype.reIndexArr = function () {
	let arr = [];
	for (const k in obj) {
		arr.push(this[k]);
	};
	return arr;
};

Array.prototype.reIndexArr = function () {
	let arr = [];
	this.forEach(e => {
		arr.push(e);
	});
	return arr;
};

function axQS(s) {
	return document.querySelector(s);
};

function axQSA(s) {
	return document.querySelectorAll(s);
};

axNode = class axNode {
	constructor(tag) {
		let
			node;

		if (tag.match(/[\[\.]/)) {

			let
				classes = [],
				attributes = [],

				classReg = /\.[\w-]+/g,
				attributeReg = /\[.+?]/g;

			classes = tag.match(classReg);
			tag = tag.replaceAll(classReg, '');

			attributes = tag.match(attributeReg);
			tag = tag.replaceAll(attributeReg, '');

			node = document.createElement(tag);

			if (classes && classes.length > 0) {
				classes = classes.map(cls => cls.slice(1));
				node.axClass(classes.join(' '));
			};

			if (attributes && attributes.length > 0) {
				attributes.forEach(attr => {
					attr = attr.slice(1, -1);
					attr = attr.split('=');
					if (attr[1] === undefined) {
						attr[1] = '';
					};
					node.setAttribute(attr[0], attr[1]);
				});
			}
		} else {
			node = document.createElement(tag)
		}

		return node;
	};
	axClass(cls = null) {
		let
			d = this;
		if (typeof (d) != "object" || d.tagName == undefined)
			return false;
		if (cls !== null)
			d.className = cls;
		else
			return d.className;
		return d;
	};
	axVal(val = null) {
		switch (this.tagName) {
			case 'TEXTAREA':
			case 'INPUT':
				this.baseValue = 'value';
				break;
			case 'IMG':
				this.baseValue = 'src';
				break;
			default:
				this.baseValue = 'innerHTML';
				break;
		};
		this.axVal = function (val = null) {
			if (val !== null) {
				this[this.baseValue] = val;
				return this;
			} else {
				return this[this.baseValue];
			};
		};
		return this.axVal(val);
	};
	axFlash(style = false, value = false, time = 160) {
		let
			node = this;
		if (style == 'tiktak12') {
			node.axFlashTimer--;
		} else if (node.axFlashTimer > 0) {
			node.axFlashTimer = 10;
			return;
		} else {
			node.axFlashStyle = [];
			node.axFlashType = '';
			node.axFlashVal = '';
			node.axFlashTimer = 10;
			if (!style) {
				style = "green";
				node.axFlashStyle = [
					['background-color', node.style['background-color']]
				];
				node.style['background-color'] = style;
			} else {
				style = style.split('&&');
				style.forEach(e => {
					e = e.split('=');
					if (e.length == 1) {
						node.axFlashStyle.push(['background-color', node.style['background-color']]);
						node.style['background-color'] = e[0];
					} else {
						node.axFlashStyle.push([e[0], node.style[e[0]]]);
						node.style[e[0]] = e[1];
					};
				});
			};
			if (value !== false) {
				node.axFlashVal = node.axVal();
				if (node.axFlashVal === false) {
					node.axFlashVal = '';
				};
				node.axVal(value);
				if (node.type == 'password') {
					node.axFlashType = node.type;
					node.type = 'text';
				};
			};
		};
		if (node.axFlashTimer <= 0) {
			node.axFlashStyle.forEach(e => {
				node.style[e[0]] = e[1];
			});
			if (node.axFlashType != '') {
				node.type = node.axFlashType;
			};
			if (value != '') {
				node.axVal(node.axFlashVal);
			}
			node.axFlashTimer = 0;
		} else {
			setTimeout(() => {
				node.axFlash('tiktak12');
			}, time);
		};
	};
	axAttribute(name, value = undefined) {
		if (value === undefined) {
			return this.getAttribute(name);
		} else {
			this.setAttribute(name, value);
			return this;
		};
	};
	axQS(s) {
		return this.querySelector(s);
	};
	axQSA(s) {
		return this.querySelectorAll(s);
	};
	componentLoader(exceptions = []) {
		let
			attributes = Object.keys(axComponentLoader.attributes),
			selector = [];

		attributes.forEach((v) => {
			if (!exceptions.includes(v)) {
				selector.push('[' + v + ']');
			}
		});

		this.axQSA(
			selector.join(',')
		).forEach((el) => {
			attributes.forEach((attr) => {
				if (el.getAttribute(attr) !== null) {
					axComponentLoader.attributes[attr].executeFunctions(el);
				};
			});
		});

		return this;
	};
};

axComponentLoader = class axComponentLoader {
	static attributes = {};
	static appendFunction(attr, func) {
		let
			attributes = axComponentLoader.attributes;
		if (attributes[attr] === undefined) {
			attributes[attr] = [func];
		} else {
			attributes[attr].push(func);
		}
	}
};

axComponentLoader.appendFunction(AX_LOADER_ATTR_SVG, (el) => {
	let
		node = (new axLoaderSVG(el.getAttribute(AX_LOADER_ATTR_SVG))).content;
	el.replaceWith(node);
});

axComponentLoader.appendFunction(AX_LOADER_ATTR_EL, (el) => {
	let
		node = (new axLoader(el.getAttribute(AX_LOADER_ATTR_EL))).content;
	el.replaceWith(node);
});


axComponentLoader.appendFunction('spa', (el) => {
	el.addEventListener('click', function (e) {
		e.preventDefault();
		let
			href = this.getAttribute('href');

		if (href == '#') {
			return false;
		};

		let
			url = new axURL(href, { save_history: true });

		url.update();

		url.addGetParam(AX_LOADER_ATTR_EL);

		let
			newMain = new axLoader(url.urlPath);

		//newMain.setSelector('title');
		//axQS('title').replaceWith(newMain.content);
		newMain.setSelector('main');
		axQS('main').replaceWith(newMain.content);
	});
});

axDataIdElements = class axDataIdElements {
	constructor(id) {
		this.elements = axQSA('[data-id~="' + id + '"]');
	}
	updateAll(func) {
		this.elements.forEach((el) => {
			func(el);
		});
	}
	removeAll() {
		this.elements.forEach((el) => {
			el.remove();
		});
	}
};

axComponentLoader.appendFunction('data-id', (el) => {
	let
		mf = axModularFunction,
		ids = el.axAttribute('data-id').split(' ');

	ids.forEach(id => {
		if (typeof (mf.functions[id]) == 'object') {
			mf.functions[id].executeFunctions(el);
		} else {
			if (!axModularFunction.waitingElements[id]) {
				axModularFunction.waitingElements[id] = [];
			}
			axModularFunction.waitingElements[id].push(el);
		}
	});
});

(() => {
	let
		obj = Object.getOwnPropertyNames(axNode.prototype);
	obj.forEach(method => {
		if (method !== 'constructor')
			Element.prototype[method] = axNode.prototype[method];
	})
})();

function sleep(ms) {
	const d = Date.now();
	let cD = null;
	do {
		cD = Date.now();
	} while (cD - d < ms);
};

axRequest = class axRequest {
	baseDIR = ''; 					// базовый префикс для url
	type = 'auto'; 					// тип запроса auto/post/get
	responseType = 'text'; 	// responseType
	dataTemplate = {}; 			// Базовые параметры для dataTemplate
	saveLoadData = false; 	// Кеширование ответов
	requestHeaders = {}; 		// Заголовки
	static loadData = {};		// Ячейка хранения кеша

	// dir - куда отправляется запрос
	// obj - передаем настройки
	constructor(dir, obj = {}) {
		this.dir = dir;
		Object.assign(this, obj);
		return true;
	};

	// удаояем кеш запроса
	clearSavedData() {
		this.constructor.loadData[this.baseDIR + this.dir] = {};
	};

	execute(data, func) {
		let
			xhr = new XMLHttpRequest(),
			dataKeys,
			href = this.baseDIR + this.dir,
			loadData,
			type = this.type;

		if (typeof (data) == 'object') {
			data = Object.assign(data, this.dataTemplate);

			if (Object.keys(data).length == 0) {
				if (type == "auto") {
					type = "GET";
				};
			} else {
				if (type == "auto") {
					type = "POST";
				};
				if (type == "GET") {
					let
						url = new axURL(href);
					url.addGetParamObj(data);
					href = url.urlPath;
				} else {
					data = data.toFormData();
				}
			}
		}

		xhr.open(type, href);

		for (const header in this.requestHeaders) {
			xhr.setRequestHeader(header, this.requestHeaders[header]);
		}

		if (this.saveLoadData) {
			dataKeys = Object.keys({});
			if (!this.constructor.loadData[href]) {
				this.constructor.loadData[href] = {};
			};
			loadData = this.constructor.loadData[href];

			if (dataKeys.done) {
				if (loadData.value) {
					func(loadData.value);
					return true;
				}
			} else {
				for (var key of dataKeys) {
					let
						value = data.get(key);
					if (!loadData[key]) {
						loadData[key] = {};
					}
					loadData = loadData[key];
					if (typeof (value) === 'object') {
						value = JSON.stringify(value);
					}
					if (!loadData[value]) {
						loadData[value] = {};
					}

					loadData = loadData[value];
				}
				if (loadData.value) {
					func(loadData.value);
					return true;
				}
			}
		}

		xhr.send(data);

		xhr.responseType = this.responseType;

		xhr.onload = () => {
			let
				xhrResponseData = xhr.response;
			if (loadData) {
				loadData.value = xhrResponseData;
			}
			func(xhrResponseData);
		};

		if (this.progress != undefined)
			xhr.onprogress = function (event) {
				let load = event.loaded / event.total;
				this.progress(load);
			};

		return true;
	};
};

Object.defineProperty(Object.prototype, "toFormData", {
	enumerable: false,
	writable: true
});

Object.defineProperty(Array.prototype, "toFormData", {
	enumerable: false,
	writable: true
});

Object.defineProperty(FormData.prototype, "axAppend", {
	enumerable: false,
	writable: true
});

Object.prototype.toFormData = function (form = false, prefix = '') {
	if (!form) {
		form = new FormData();
	}

	for (const k in this) {
		form.axAppend(k, this[k], prefix);
	};

	return form
};

Array.prototype.toFormData = function (form = false, prefix = '') {
	if (!form) {
		form = new FormData();
	}

	this.forEach((v, k) => {
		form.axAppend(k, v, prefix);
	});
	return form;
};

FormData.prototype.axAppend = function (k, v, prefix = '') {
	if (prefix != '') {
		k = prefix + "[" + k + "]";
	}

	if (typeof (v) == 'object') {
		v.toFormData(this, k);
	} else {
		this.append(k, v);
	}
};

Object.defineProperty(Number.prototype, "prepareToString", {
	enumerable: false,
	writable: true
});

Number.prototype.prepareToString = function (length = 2, zero = '0') {
	return (zero.repeat(length - 1) + this).slice(-length);
};

axDate = class axDate {
	constructor(str = false) {
		this.date = str;
	}
	getSeconds() {
		return parseInt(new Date().getTime() / z)
	}
	getDataObj(mod = 0) {
		let
			str = this.date,
			thisDate;
		if (str) {
			str = str.replace(/\s+/g, 'T') + "Z";

			str = Date.parse(str) + mod;

			thisDate = new Date(str);
		} else {
			thisDate = new Date();
		};
		return thisDate;
	}
	getPHPServerDate() {
		return this.getPrepareDate(2, -differenceDate);
	}
	getPrepareDate(type = 1, mod = 0) {
		let
			thisDate = this.getDataObj(mod);

		let
			Minutes = thisDate.getMinutes().prepareToString(),
			Hours = thisDate.getHours().prepareToString(),
			Day = thisDate.getDate().prepareToString(),
			Month = (thisDate.getMonth() + 1).prepareToString(),
			Year = " " + thisDate.getFullYear();
		Year = Year[3] + Year[4];
		if (type == 1) return Hours + ":" + Minutes;
		if (type == 2) return Hours + ":" + Minutes + " " + Day + "." + Month + "." + Year;
	};
};

axGlossary = class axGlossary {
	static lib;
	static localStorageKey = 'glossary_';
	static glossariesPath = 'resources/glossaries/glossary_';

	static get(type, key, obj = false) {
		let
			string = this.lib[type][key];
		if (!string) {
			return key;
		}

		if (obj) {
			let
				r = new RegExp('%(' + Object.keys(obj).join('|') + ')%', 'gum'),
				replacer = (match, p1) => {
					return obj[p1];
				};

			string = string.replace(r, replacer);
		}
		return string;
	}

	static load() {
		let
			data = localStorage[this.localStorageKey + axCookie.getValue('lang')];

		if (!data) {
			this.pullFromApi();
		} else {
			let
				dataObj = JSON.parse(data);

			if (dataObj.time > Date.now()) {
				this.lib = dataObj.data;
			} else {
				this.pullFromApi();
			}
		}
	}

	static pullFromApi() {
		if (!axCookie.getValue('lang')) {
			return;
		}
		let
			api = new axRequest(this.glossariesPath + axCookie.getValue('lang') + '.json');

		api.execute({}, (r) => {
			let data;
			try {
				data = {
					time: Date.now() + 1440000,
					data: JSON.parse(r)
				};
			} catch (error) {
				return;
			}

			localStorage.setItem(this.localStorageKey + axCookie.getValue('lang'), JSON.stringify(data));
			this.lib = data.data;
		});
	}
};

axNotification = class axNotification {
	static list = [];
	static glossary_class = axGlossary;

	static box(html) {
		let
			box = new axNode('div');

		box.innerHTML = html;
		box.classList.add('box-1', 'notification');
		box.run = this.run;
		box.runtimer = this.runtimer;
		box.noti_class = this;

		return box;
	}

	static error(html = false, classname = false) {
		if (html === false) {
			html = this.glossary().get('main', 'message');
		}
		let
			box = this.box(html);

		box.classList.add('error');
		if (classname !== false) {
			box.classList.add(classname);
		}

		box.run();
	}

	static glossary() {
		return this.glossary_class;
	}

	static message(html = false, classname = false) {
		if (html === false) {
			html = this.glossary().get('main', 'message');
		}

		let
			box = this.box(html);

		box.classList.add('message');
		if (classname !== false) {
			box.classList.add(classname);
		}

		box.run();
	}

	static success(html = false, classname = false) {
		if (html === false) {
			html = this.glossary().get('main', 'success');
		}

		let
			box = this.box(html);

		box.classList.add('success');
		if (classname !== false) {
			box.classList.add(classname);
		}

		box.run();
	}

	static warning(html = false, classname = false) {
		if (html === false) {
			html = this.glossary().get('main', 'warning');
		}

		let
			box = this.box(html);

		box.classList.add('warning');
		if (classname !== false) {
			box.classList.add(classname);
		}

		box.run();
	}

	static append(el) {
		axQS('body').append(el);
		let
			height = el.clientHeight;
		this.list.forEach(element => {
			let
				bottom = parseInt(element.style['bottom']) + height + 10;

			element.style['bottom'] = bottom + 'px';
		});
		this.list.push(el);
	}

	static remove(el) {
		let
			index = this.list.indexOf(el);
		this.list.splice(index, 1);
		el.remove();
	}

	static run() {
		let
			bottom = parseInt(this.style['bottom']);

		if (isNaN(bottom)) {
			this.style['opacity'] = 1;
			this.style['bottom'] = 10 + 'px';
			this.noti_class.append(this);
			window.addEventListener('mousemove', () => {
				setTimeout(() => { this.run() }, 4000);
			}, { once: true });
		} else if (this.style['opacity'] < 0.01) {
			this.noti_class.remove(this);
		} else {
			bottom += 10;
			this.style['bottom'] = bottom + 'px';
			this.style['opacity'] = this.style['opacity'] - (0.11 - (this.style['opacity'] / 15));
			setTimeout(() => { this.run() }, 30);
		}
	}
};

axNodeConection = class axNodeConection {
	constructor(class1, class2, class3 = false, type = false) {
		let
			tags = [],
			tags2 = [];
		if (!class3) {
			class3 = 'active';
		};
		if (Array.isArray(class1)) class1.forEach(e => {
			tags = tags.concat(axQSA(e));
		});
		else tags = axQSA(class1);
		if (Array.isArray(class2)) class2.forEach(e => {
			tags2 = tags2.concat(axQSA(e));
		});
		else tags2 = axQSA(class2);
		if (tags == undefined || tags2 == undefined) return false;

		function axModalLoc() {
			tags2.forEach(e => {
				if (e.className == e.axModalClass) {
					e.className += ' ' + class3;
					if (type) document.addEventListener('click', () => {
						e.className = e.axModalClass;
					}, true);
				} else {
					e.className = e.axModalClass;
				};
			});
		};

		tags2.forEach(e => {
			if (e.axModalClass == undefined) {
				e.axModalClass = e.className;
			};
		});

		tags.forEach(e => {
			e.addEventListener('click', axModalLoc);
		});
	};
};

axCookie = class axCookie {
	static getValue(name) {
		let matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
		return matches ? decodeURIComponent(matches[1]) : undefined;
	};
	static setValue(name, value, options = {}) {
		options = {
			path: '/',
			...options
		};
		if (options.expires instanceof Date) {
			options.expires = options.expires.toUTCString();
		};
		let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);
		for (let optionKey in options) {
			updatedCookie += "; " + optionKey;
			let optionValue = options[optionKey];
			if (optionValue !== true) {
				updatedCookie += "=" + optionValue;
			};
		};
		document.cookie = updatedCookie;
	};
	static deleteCookie(name) {
		setCookie(name, "", {
			'max-age': -1
		});
	};
};

axEvents = class axEvents {
	constructor() {
		let
			obj = Object.getOwnPropertyNames(this);
		obj.forEach(method => {
			if (method !== 'constructor')
				this[method]();
		})
	};
	optimizedResize() {
		var throttle = function (type, name, obj) {
			obj = obj || window;
			var running = false;
			var func = function () {
				if (running) {
					return;
				}
				running = true;
				requestAnimationFrame(function () {
					obj.dispatchEvent(new CustomEvent(name));
					running = false;
				})
			};
			obj.addEventListener(type, func);
		};
		throttle("resize", "optimizedResize");
	};
};

new axEvents;

axLazy = class axLazy {
	advance = 50;
	elements = [];
	constructor(selector) {
		axQSA(selector + '[lazy-src]').forEach(e => {
			let cords = e.getBoundingClientRect();
			if (Math.max(cords.left, cords.top) != 0 && cords.top - cords.height < window.innerHeight) {
				e.src = e.getAttribute('lazy-src');
			} else {
				if (axLazy.elements.length != 0) {
					axLazy.elements.push(e);
					this.InfinityLoad();
					window.addEventListener('click', this.lazyDooble);
					window.addEventListener('optimizedResize', this.lazyDooble);
					window.addEventListener('wheel', this.lazyDooble);
				} else {
					axLazy.elements.push(e);
				};
			};
		});
	};
	lazyLoad() {
		for (let i = 0; i < axLazy.elements.length; i++) {
			let e = axLazy.elements[i],
				cords = e.getBoundingClientRect();
			if (Math.max(cords.left, cords.top) != 0 && cords.top - cords.height + ((cords.height < 100) ? cords.height : 100) < window.innerHeight) {
				e.src = e.getAttribute('lazy-src');
				axLazy.elements.splice(i, 1);
				i--;
			};
		};
	};
	lazyDooble() {
		this.lazyLoad();
		setTimeout(this.lazyLoad, 50);
		setTimeout(this.lazyLoad, 150);
	};
	InfinityLoad() {
		this.lazyLoad();
		setTimeout(this.InfinityLoad, 200);
	};
};

String.prototype.сonvertToNode = function (sel = false, setting = {}) {
	let
		el = new axNode('div');
	el.innerHTML = this.trim();

	if (setting.axComponentLoader !== false) {
		el.componentLoader(setting.axComponentLoaderExceptions);
	}

	if (sel) {
		return el.axQSA(sel);
	} else {
		return [el.firstChild];
	};
};

baseAxLoader = class baseAxLoader {
	baseDIR = '';
	contentBuffer = {};
	idCounter = 0;
	skeletonTag = 'div';
	constructor(loader, obj = {}) {
		Object.assign(this, obj);
		Object.assign(loader, this);
		return obj;
	};
};

axLoader = class axLoader {
	selector = false;
	leadUpFunctions = [];
	leadUpFunction(node) {
		this.leadUpFunctions.executeFunctions(node);
		return node;
	};
	addLeadUpFunction(f) {
		this.leadUpFunctions.push(f);
		return this;
	};
	removeAllLeadUpFunctions() {
		this.leadUpFunctions = [];
	};
	constructor(name, obj = {}) {
		Object.assign(this, obj);
		this.name = name;
		this.dir = (obj.dir === undefined || obj.dir === false) ? this.constructor.baseDIR : obj.dir;
		if (obj.selector !== undefined) {
			this.setSelector(obj.selector);
		};
		this.skeletonTag = this.constructor.skeletonTag;
		return this;
	};
	get content() {
		let
			constructor = this.constructor,
			buffer = constructor.contentBuffer;
		if (!buffer[this.dir]) {
			buffer[this.dir] = {};
			buffer[this.dir][this.name] = new constructor.bufferCel(this);
		} else if (!buffer[this.dir][this.name]) {
			buffer[this.dir][this.name] = new constructor.bufferCel(this);
		};

		let
			node = buffer[this.dir][this.name].getPreparedValue(this);
		node.reload = this.reload;
		node.axLoader = this;
		return node;
	};
	reload() {
		this.replaceWith(this.axLoader.content);
	};
	setSelector(sel = false) {
		this.selector = sel;
		if (/^[a-z]+$/.test(sel)) {
			this.skeletonTag = sel;
		} else {
			this.skeletonTag = this.constructor.skeletonTag;
		};
	};
	rewrite() {
		if (!this.constructor.contentBuffer[this.dir]) {
			this.constructor.contentBuffer[this.dir] = {};
		};
		this.constructor.contentBuffer[this.dir][this.name] = undefined;
		return this.content;
	};
};

new baseAxLoader(axLoader);

selectorsBuffer = class selectorsBuffer {
	value = false;
	buffer = {};
	getValue(obj, selector) {
		if (this.buffer[selector] == undefined || this.buffer[selector].value == undefined) {
			this.rememberValue(obj, selector);
			return obj.value.сonvertToNode(selector)[0];
		} else {
			return this.buffer[selector].value.сonvertToNode()[0];
		};
	};
	rememberValue(obj, selector) {
		if (this.buffer[selector] == undefined || !this.buffer[selector].load) {
			let
				node = obj.value.сonvertToNode(selector, { axComponentLoader: false })[0];

			this.buffer[selector] = {};
			this.buffer[selector].load = false;
			if (node.nodeName == '#text') {
				this.buffer[selector].value = node.nodeValue;
			} else {
				this.buffer[selector].value = node.outerHTML;
			}

			//this.waitingLoader(node, selector);
		};
	};
	clearBuffer() {
		this.buffer = {};
	};
	waitingLoader(node, selector) {
		if (node.nodeName == '#text') {
			this.buffer[selector].value = node.nodeValue;
			this.buffer[selector].load = false;
		} else if (node.axQS('svg[' + AX_LOADER_ATTR_SVG + '], [' + AX_LOADER_ATTR_EL + '], [' + AX_LOADER_ATTR_WAITING + ']') == undefined) {
			this.buffer[selector].value = node.outerHTML;
			this.buffer[selector].load = false;
		} else {
			setTimeout(() => {
				this.waitingLoader(node, selector);
			}, 50);
		}
	};
};

axLoader.bufferCel = class {
	loading = false;
	value = false;
	nodeArray = [];
	preparedSelectorsBuffer = new selectorsBuffer;
	requestParam = {};
	constructor(obj) {
		Object.assign(this, obj);
	};
	overwriteValue(obj) {
		this.value = false;
		this.loading = false;
		return this.getPreparedValue(obj);
	};
	get url() {
		return this.dir + this.name;
	};
	getPreparedValue(obj) {
		if (this.value === false && this.loading === false) {
			this.loading = true;

			let
				url = this.url,
				request = new axRequest(url, this.requestParam);

			request.execute({}, (r) => {
				if (this.loading === true) {
					this.preparedSelectorsBuffer.clearBuffer();
					this.value = r;
					this.nodeArray.forEach(el => {
						let
							newNode = el.loader.leadUpFunction(this.getNode(el.loader.selector));

						newNode.reload = el.reload;
						newNode.axLoader = el.axLoader;

						el.replaceWith(newNode);
					});
					this.nodeArray = [];
					this.loading = false;
				};
			});
		};
		return this.getValue(obj);
	};
	rewrite() {
		this.value = false;
		this.loading = false;
	};
	getValue(obj) {
		if (this.loading) {
			let
				newNode = new axNode(obj.skeletonTag);
			newNode.loader = {};
			newNode.loader.leadUpFunctions = obj.leadUpFunctions.slice();
			newNode.loader.leadUpFunction = obj.leadUpFunction;
			newNode.loader.selector = obj.selector;
			newNode.setAttribute(AX_LOADER_ATTR_WAITING, '');

			this.nodeArray.push(newNode);
			return newNode;
		} else {
			return obj.leadUpFunction(this.getNode(obj.selector));
		};
	};
	getNode(selector) {
		return this.preparedSelectorsBuffer.getValue(this, selector);
	};
};

axLoaderSVG = class axLoaderSVG extends axLoader {
	requestParam = {};
	selector = 'svg';
};

new baseAxLoader(axLoaderSVG, {
	skeletonTag: 'svg'
});

axLoaderSVG.bufferCel = class extends axLoader.bufferCel {
	constructor(obj) {
		super(obj);
		if (this.name.match(/\.svg$/i) === null) {
			this.name += '.svg';
		};
	};
};

Object.defineProperty(Object.prototype, "axJoin", {
	enumerable: false,
	writable: true
});

Object.defineProperty(Array.prototype, "axJoin", {
	enumerable: false,
	writable: true
});

Object.prototype.axJoin = function (prefix = '', separator = '&') {
	let
		arr = [];

	for (const key in this) {
		arr.push(prefix + key + '=' + this[key]);
	};

	return arr.join(separator);
};

Array.prototype.axJoin = function (prefix = '', separator = '&') {
	let
		arr = [];

	this.forEach((e, i) => {
		arr.push(prefix + i + '=' + e);
	});

	return arr.join(separator);
};


Object.defineProperty(Object.prototype, "executeFunctions", {
	enumerable: false,
	writable: true
});

Object.defineProperty(Array.prototype, "executeFunctions", {
	enumerable: false,
	writable: true
});

Object.prototype.executeFunctions = function (arg) {
	for (const key in this) {
		this[key](arg)
	};
};

Array.prototype.executeFunctions = function (arg) {
	this.forEach(f => f(arg));
};

axFunction = class axFunction {
	constructor(f) {
		if (!axFunction.load) {
			axFunction.functions.push(f);
		} else {
			f();
		};
	};
};

axFunction.functions = [];
axFunction.load = false;

axURL = class axURL {
	save_history = false;
	title = false;

	constructor(urlPath, obj = {}) {
		this.urlPath = urlPath;
		Object.assign(this, obj);
	};

	update() {
		if (!this.save_history) {
			window.history.replaceState({}, "", this.urlPath);
		} else {
			window.history.pushState({}, "", this.urlPath);
		};
		if (this.title) {
			document.title = this.title;
		};
	};

	addGetParam(name, value) {
		let
			delimeter = '?',
			added = '';

		if (this.urlPath.indexOf('?') > -1) {
			delimeter = '&';
		};

		if (value === undefined) {
			added = delimeter + name;
		} else {
			added = delimeter + name + '=' + value;
		};

		this.urlPath += added;
		return this;
	}

	addGetParamObj(obj) {
		let
			delimeter = '?';

		if (this.urlPath.indexOf('?') > -1) {
			delimeter = '&';
		};

		this.urlPath += delimeter + obj.axJoin();

		return this;
	}
};

axGet = class axGet {
	constructor() {
		if (!this.params && window.location.href.match(/.*\?.*/)) {
			this.params = {};
			window.location.href.replace(/.*\?/, '').split('&').forEach(value => {
				let
					tmp = value.split('=');
				this.params[tmp[0]] = tmp[1];
			});
		} else {
			this.getParam = () => {
				return undefined;
			}
		}
	};
	getParam(param) {
		return this.params[param];
	};
};

Number.prototype.axRange = function (a, b) {
	if (a < b) {
		return this >= a && this <= b;
	} else if (a > b) {
		return this <= a && this >= b;
	} else if (a == b) {
		return this == a;
	}
};

axCanvasElement = class axCanvasElement {
	kill = false;
	color = '#000000';
	reactive = false;
	eventStopper = false;
	events = {};

	constructor(x = 0, y = 0, width = 10, height = 10) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	drawFunction(canvas) {
		canvas.ctx.fillStyle = this.color;
		canvas.ctx.fillRect(this.x, this.y, this.width, this.height);
	}

	workFunctions(canvas) {
		this.drawFunction(canvas);
		this.updateFunction(canvas);
	}

	updateFunction(canvas) {
		return;
	}

	isThereCoord(x, y) {
		let
			el = this,
			bool = (x.axRange(el.x, el.x + el.width) && y.axRange(el.y, el.y + el.height));
		return bool;
	}
};

axJson = class axJson {
	static setting = {
		li: false,
		ul: false,
		all_tools: true,
		hidden_object: true,
		hidden_dell: false,
		hidden_add: false,
		hidden_type: false,
		edit_keys: false,
		edit_values: false,
		object_display_name_key: 'name',
		array_display_name_key: 0,
		depth_set: [],
		key_set: {}
	};

	constructor(jsonOrObj) {
		if (typeof (jsonOrObj) == 'object') {
			this.data = jsonOrObj;
		} else {
			this.data = JSON.parse(jsonOrObj);
		}
	}

	static ul(obj, setting = {}) {
		if (setting.depth === undefined) {
			setting.depth = 0;
		} else {
			setting.depth++;
		}

		let
			ul = new axNode('ul.ax-json'),
			keys = Object.keys(obj);

		if (Array.isArray(obj)) {
			ul.classList.toggle('ax-json-array');
		}

		for (const key of keys) {
			ul.append(axJson.li(key, obj[key], setting));
		}
		ul.append(axJson.liCreate(setting));

		ul.isArray = Array.isArray(obj);

		ul.getJsonObj = axJson.getJsonObj;

		ul.searchKey = function (key) {
			return Array.from(this.childNodes).filter((li) => {
				return li.classList.contains('ax-json__item') && li.childNodes[1].childNodes[0].value == key;
			})
		};
		return ul;
	}

	static getJsonObj() {
		let
			childs = this.childNodes,
			object = {};

		childs.forEach((li) => {
			if (li.classList.contains('ax-json__item')) {
				let
					data = axJson.getJsonDataFromLi(li);
				object[data[0]] = data[1];
			}
		});

		if (this.isArray) {
			object = Object.values(object);
		}

		return object;
	}

	static getJsonDataFromLi(el) {
		let
			key_element = el.childNodes[1],
			value_element = el.childNodes[2],
			key = key_element.childNodes[0].value,
			type = key_element.childNodes[1].innerText,
			value;

		if (type == 'array' || type == 'object') {
			value = value_element.childNodes[1];
			value = value.getJsonObj();
		} else if (type == 'bool') {
			value = !!Number(value_element.childNodes[0].value);
		} else {
			value = value_element.childNodes[0];
			if (type == 'number') {
				value = Number(value.value);
			} else {
				value = value.value;
			}
		}
		return [key, value];
	}

	static liCreate(setting = {}) {
		let
			li = new axNode('li.ax-json__create-item'),
			button = new axNode('div.ax-json__create-button');

		button.innerText = 'add item +';

		button.addEventListener('click', function () {
			let
				data;

			if (li.previousElementSibling) {
				data = axJson.getJsonDataFromLi(li.previousElementSibling);
				if (li.parentElement.isArray) {
					data[0]++;
				}
			} else {
				if (li.parentElement.isArray) {
					data = [
						'0',
						'value'
					];
				} else {
					data = [
						'key_1',
						'value'
					];
				}
			}


			li.before(axJson.li(data[0], data[1]));
		});

		li.append(button);

		return li;
	}

	static li(key, val, setting = {}) {
		let
			type = axJson.takeType(val),
			li = new axNode('li.ax-json__item'),
			key_element = new axNode('div.ax-json__key-container'),
			key_element_key = new axNode('input[type=text].ax-json__key-input'),
			key_element_type = new axNode('div.ax-json__type-item'),
			dell = new axNode('div.ax-json__dell-item');

		key_element_type.jsonType = type;

		key_element_type.addEventListener('click', function () {
			let
				valueTypes = axJson.valueTypes,
				idType = valueTypes.indexOf(this.jsonType) + 1,
				nextType = valueTypes[(idType >= valueTypes.length) ? 0 : idType],
				newValue = 0;

			if (this.oldJsonValue == undefined) {
				this.oldJsonValue = axJson.getJsonDataFromLi(li)[1];
				this.oldJsonValueType = this.jsonType;
			}

			newValue = this.oldJsonValue;

			li.classList.remove('ax-json__' + this.jsonType);
			li.classList.add('ax-json__' + nextType);

			if (this.oldJsonValueType == 'object') {
				if (nextType == 'array') {
					newValue = Object.values(this.oldJsonValue);
				} else if (nextType != 'object') {
					newValue = JSON.stringify(this.oldJsonValue[Object.keys(this.oldJsonValue)[0]]);
				}
			} else if (this.oldJsonValueType == 'array') {
				if (nextType == 'object') {
					newValue = Object.assign({}, this.oldJsonValue);
				} else if (nextType != 'array') {
					newValue = JSON.stringify(this.oldJsonValue[0]);
				}
			} else {
				if (nextType == 'array') {
					newValue = [this.oldJsonValue];
				} else if (nextType == 'object') {
					newValue = { key_1: this.oldJsonValue };
				}
			}

			key_element_type.jsonType = nextType;
			key_element_type.innerText = nextType;

			let
				newValueElement = axJson.liValue(newValue, setting, nextType);

			newValueElement.addEventListener('input', () => {
				delete this.oldJsonValue;
			}, { once: true });

			li.childNodes[2].replaceWith(newValueElement);
		});

		dell.addEventListener('click', () => {
			li.remove();
		});

		dell.innerText = 'x';

		key_element_key.value = key;
		key_element_type.innerText = type;
		li.classList.add('ax-json__' + type);

		key_element.append(key_element_key, key_element_type);

		li.append(dell, key_element);

		li.append(axJson.liValue(val, setting, type));
		return li;
	}

	static liValue(val, setting = {}, type = false) {
		let
			val_element = new axNode('div.ax-json__value-container');
		if (type == false) {
			type = axJson.takeType(val);
		};
		if (typeof (val) == 'object') {
			let
				show_button = new axNode('button.ax-json__show-button'),
				show_button_i = new axNode('span'),
				ul = axJson.ul(val, setting),
				display_name = new axNode('div.ax-json__display-obj-name');

			if (axJson.getSetting(setting, 'hidden_object') === true) {
				ul.classList.toggle('hidden');
			} else {
				show_button.classList.toggle('active');
			}

			show_button.addEventListener('click', (e) => {
				show_button.classList.toggle('active');
				ul.classList.toggle('hidden');
				if (e.isTrusted == false) {
					return;
				}
				ul.axQSA('.ax-json__value-container > .ax-json__show-button.active').forEach((button) => {
					button.click(false);
				});
			});

			show_button_i.innerText = '>';
			show_button.append(show_button_i);

			let
				nameKey = axJson.getSetting(setting, type + '_display_name_key');

			function replaceName() {
				display_name.innerText = this.value;
			};

			if (nameKey !== false) {
				ul.childNodes.forEach((el) => {
					if (el.classList.contains('ax-json__item')) {
						el.childNodes[1].childNodes[0].addEventListener('input', function () {
							if (this.value == nameKey) {
								el.childNodes[2].childNodes[0].addEventListener('input', replaceName);
								display_name.innerText = el.childNodes[2].childNodes[0].value;
							} else {
								el.childNodes[2].childNodes[0].removeEventListener("mousedown", replaceName, false);
								display_name.innerText = (ul.isArray) ? ':array:' : ':object:';
							}
						});
						if (el.childNodes[1].childNodes[0].value == nameKey) {
							el.childNodes[2].childNodes[0].addEventListener('input', replaceName);
							display_name.innerText = el.childNodes[2].childNodes[0].value;
						};
					};
				});
				if (display_name.innerText == '') {
					display_name.innerText = (ul.isArray) ? ':array:' : ':object:';
				}
			};

			show_button.append(display_name);

			val_element.append(show_button);
			val_element.append(ul);
		} else if (type == 'bool') {
			let
				select = new axNode('select.ax-json__value-input');
			select.innerHTML = "<option value='0'>false</option><option value='1'>true</option>";
			select.childNodes[val + 0].setAttribute('selected', true);
			val_element.append(select);
		} else {
			let
				input = new axNode('input[type=' + type + '].ax-json__value-input');
			input.value = val;
			val_element.append(input);
		}
		return val_element;
	}

	static takeType(val) {
		let
			type;

		if (typeof (val) == 'object') {
			if (Array.isArray(val)) {
				type = 'array';
			} else {
				type = 'object';
			}
		} else {
			if (typeof (val) == 'number') {
				type = 'number';
			} else if (/^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(val)) {
				type = 'color';
			} else if (typeof (val) == 'boolean') {
				type = 'bool';
			} else {
				type = 'text';
			}
		};

		return type;
	}

	static getSetting(setting, prop) {
		if (setting.key && setting.key_set && setting.key_set[setting.key] && setting.key_set[setting.key][prop] !== undefined) {
			return setting.key_set[setting.key][prop];
		} else if (setting.depth_set && setting.depth_set[setting.depth] && setting.depth_set[setting.depth][prop] !== undefined) {
			return setting.depth_set[setting.depth][prop];
		} if (setting[prop] === undefined) {
			return axJson.setting[prop];
		} else {
			return setting[prop];
		}
	};

	static valueTypes = [
		'bool',
		'text',
		'number',
		'color',
		'array',
		'object'
	];
};

axCE = axCanvasElement;

axCanvasElementSmart = class axCanvasElementSmart extends axCanvasElement {
	reactive = true;
	eventStopper = true;
	get hover() {
		return this.events.hover;
	}

	get click() {
		return this.events.click;
	}

	get mouseleave() {
		return this.events.mouseleave;
	}

	get mousemove() {
		return this.events.mousemove;
	}

	get mouseup() {
		return this.events.mouseup;
	}

	get mousedown() {
		return this.events.mousedown;
	}
};

axCanvasElementEvent = class axCanvasElementEvent {
	active = true;
	x;
	y;
	lifeTime = 1;
	stack = 1;

	constructor(obj = {}) {
		Object.assign(this, obj);
	}
};

axCES = axCanvasElementSmart;

eventStorage = class eventStorage {
	mousePosition;
	clickTrigger = 3;
	events = {};
	save(name, e) {
		let
			events = this.events;
		if (events['mouseleave']) {
			return;
		}
		switch (name) {
			case 'mousemove':
				this.mousePosition = e;
				if (events['mouseleave']) {
					delete events['mouseleave'];
				};
				events['mousemove'] = e;
				break;

			case 'mousedown':
				if (events['mouseup']) {
					delete events['mouseup'];
				};
				events['mousedown'] = e;
				break;

			case 'mouseup':
				if (events['mousedown']) {
					if (parseInt(events['mousedown'].layerX / this.clickTrigger) == parseInt(e.layerX / this.clickTrigger))
						events['click'] = e;
					delete events['mousedown'];
				};

				events['mouseup'] = e;
				break;

			case 'mouseleave':
				events = {};
				this.mousePosition = false;
				events['mouseleave'] = e;
				break;

			default:
				break;
		}

	}
	reset() {
		if (this.events['mousedown']) {
			let
				event = this.events['mousedown'];
			this.events = {
				mouseup: event
			};
		} else {
			this.events = {};
		}

	}
};

axCanvas = class axCanvas {
	elements = [];
	fpsCounter = [];
	fpsCalculationLength = 90;
	showFPS = false;
	eventStorage = new eventStorage();

	constructor(selectorOrElement, width = false, hight = false) {
		if (typeof (selectorOrElement) == 'string') {
			this.element = axQS(selectorOrElement);
		} else {
			this.element = selectorOrElement;
		}
		this.ctx = this.element.getContext('2d');
		if (!width) {
			this.width = this.element.width = this.element.clientWidth;
			this.height = this.element.height = this.element.clientHeight;
		} else {
			this.width = this.element.width = width;
			this.height = this.element.height = hight;
		}
		this.repeat = true;
		this.eventsElements = [];

		this.render = () => {
			if (this.repeat) {
				requestAnimationFrame(this.render);

				this.now = Date.now();
				this.elapsed = this.now - this.then;

				if (this.elapsed > this.fpsInterval) {
					this.then = this.now - (this.elapsed % this.fpsInterval);
					this.print();

					if (this.fpsCounter.length > this.fpsCalculationLength - 1) {
						this.fpsCounter.shift();
					};
					this.fpsCounter.push(this.now);

					if (this.showFPS) {
						this.printFPS();
					}
				}
			}
		};

		this.sortFuncElements = function (a, b) {
			return a.y - b.y || a.x - b.x;
		};

		this.getCursorCoords = () => {
			return false;
		};

		let
			listenerEvents = [
				'mousemove',
				'mousedown',
				'mouseup',
				'mouseleave'
			];

		listenerEvents.forEach((eventName) => {
			this.element.addEventListener(eventName, (e) => {
				this.eventStorage.save(eventName, e);
			});
		});
	}

	newElement(z = 0, x = 0, y = 0, width = 10, height = 10) {
		let
			element = new axCanvasElement(x, y, width, height);
		this.addElement(element, z);
		return element;
	}

	addElement(element, zIndex = 0) {
		if (!this.elements[zIndex]) {
			this.elements[zIndex] = [];
		}
		this.elements[zIndex].push(element);
		return this;
	}

	clear() {
		this.ctx.clearRect(0, 0, this.width, this.height);
	}

	stop() {
		this.repeat = false;
	}

	start(fps = 60) {
		this.fpsInterval = 1000 / fps;
		this.then = Date.now();
		this.render();
	}

	print() {
		this.clear();

		this.eventEngine();
		this.elements.forEach((zGroups, i1) => {
			zGroups.sort(this.sortFuncElements);
			this.elements[i1] = zGroups;
			zGroups.forEach((el, i2) => {
				if (el.kill == false) {
					el.workFunctions(this);
				} else {
					this.elements[i1].splice(i2, 1);
				}
			});
		});
	}

	searchElementsByCoords(x, y, filter = false) {
		let
			elements = [];
		this.elements.forEach((zGroups, i1) => {
			elements[i1] = [];
			zGroups.forEach((el) => {
				if (el.isThereCoord(x, y)) {
					if (filter) {
						if (el[filter]) {
							elements[i1].push(el);
						}
					} else {
						elements[i1].push(el);
					}
				}
			});
			elements[i1].sort(this.sortFuncElements);
		});

		return elements;
	}

	eventEngine() {
		let
			events = this.eventStorage.events,
			x,
			y;

		if (this.eventStorage.mousePosition) {
			events['hover'] = this.eventStorage.mousePosition;
		};

		if (this.eventStorage.mousePosition) {
			let
				coords = this.normalizeLayerCoordinates(this.eventStorage.mousePosition.layerX, this.eventStorage.mousePosition.layerY);
			x = coords[0];
			y = coords[1];
		};
		this.resetEvents();
		if (events['mouseleave'] || x === undefined) {
			let
				elementsArr = this.eventsElements,
				killEvent = [
					'hover',
					'mousedown',
				];
			elementsArr.forEach((el, i) => {
				if (el.events['hover']) {
					el.events['mouseleave'] = new axCanvasElementEvent({});
				};
				killEvent.forEach((event) => {
					if (el.events[event]) {
						delete el.events[event];
					};
				});
			});
		} else if (x != undefined) {
			let
				elements = this.searchElementsByCoords(x, y, 'reactive');
			if (events['mousemove']) {
				let
					elementsArr = this.eventsElements;
				elementsArr.forEach((el) => {
					if (el.events['hover'] && !el.isThereCoord(x, y)) {
						delete el.events['hover'];

						el.events['mouseleave'] = new axCanvasElementEvent({});
					};
				});
			};

			for (let i = elements.length - 1; i >= 0; i--) {
				let
					zGroup = elements[i];
				if (zGroup)
					for (let j = zGroup.length - 1; j >= 0; j--) {
						let
							element = zGroup[j];
						if (events['click']) {
							element.events['click'] = new axCanvasElementEvent({
								x: x,
								y: y
							});
						};
						if (events['mouseup']) {
							if (element.events['mousedown']) {
								if (
									element.events['mousedown'].stack < 3
									&&
									(parseInt(element.events['mousedown'].x / this.eventStorage.clickTrigger) == parseInt(x / this.eventStorage.clickTrigger))
								) {
									element.events['click'] = new axCanvasElementEvent({
										x: x,
										y: y
									});
								};
								delete element.events['mousedown'];
							};
							element.events['mouseup'] = new axCanvasElementEvent({
								x: x,
								y: y
							});
						};
						if (events['mousedown']) {
							element.events['mousedown'] = new axCanvasElementEvent({
								x: x,
								y: y
							});
						};
						if (events['mousemove']) {
							element.events['mousemove'] = new axCanvasElementEvent({
								x: x,
								y: y
							});
							element.events['hover'] = new axCanvasElementEvent();
						} else if (events['hover']) {
							element.events['hover'] = new axCanvasElementEvent();
						};

						this.eventsElements.push(element);
					}
			}
		}
		this.eventStorage.reset();
	}
	resetEvents() {
		let
			elementsArr = this.eventsElements,
			killEvent = [
				'click',
				'mousemove',
				'mouseup',
				'mouseleave'
			],
			length = elementsArr.length;
		for (let i = 0; i < length; i++) {
			let
				el = elementsArr[i];
			killEvent.forEach((event) => {
				if (el.events[event]) {
					delete el.events[event];
				}
			});
			if (Object.keys(el.events).length == 0) {
				elementsArr.splice(i, 1);
				i--;
				length = elementsArr.length;
			};
		};
		this.eventsElements = elementsArr;
	}
	printFPS() {
		this.ctx.font = '14px consolas';
		this.ctx.fillStyle = 'green';
		this.ctx.fillText(this.fps() + ' fps', this.width - 55, 14);
	}
	normalizeLayerCoordinates(layerX, layerY) {
		let
			x = Math.round(layerX / this.element.clientWidth * this.width),
			y = Math.round(layerY / this.element.clientHeight * this.height);
		return [x, y];
	}
	fps() {
		let
			l = this.fpsCounter.length;
		if (l < 5) {
			return 30;
		}
		let
			time = this.fpsCounter[l - 1] - this.fpsCounter[0],
			fps = parseInt(1000 / (time / l));
		return fps;
	}
};

axModularFunction = class axModularFunction {
	static functions = {};
	static waitingElements = {};

	constructor(id, func) {
		let
			mf = axModularFunction;
		if (typeof (mf.functions[id]) != 'object') {
			mf.functions[id] = [];
			if (mf.waitingElements[id]) {
				mf.waitingElements[id].forEach((el) => {
					func(el);
				});
			}
		}
		mf.functions[id].push(func);
		return true;
	}
};

new axModularFunction('ax_date', (el) => {
	let
		date = new axDate(el.innerText),
		dateType = el.getAttribute('type');

	datePrint = document.createTextNode(date.getPrepareDate(dateType, differenceDate));
	el.after(datePrint);
	el.remove();
});

document.addEventListener("DOMContentLoaded", () => {
	console.log('AxNikita JS ' + window.ax_lib_info.version + ' ' + window.ax_lib_info.last_update);
	axFunction.functions.executeFunctions();
	axQS('body').componentLoader();
	axFunction.load = true;
});