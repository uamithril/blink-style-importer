function notifyMessage(word) {
	return false;
	console.info('Blink extension says: ' + word);
}

function saveToStorage(styles, url) {
	return false;
	chrome.storage.sync.get(function (items) {
		if (Object.keys(items).length > 0 && items.data) {
			notifyMessage('Find data, adding new');
			items.data.push({pageUrl: url, blinkStyle: styles});

			chrome.storage.sync.set(items, function () {
				notifyMessage('Data successfully saved to the storage!');
			});
		} else {
			notifyMessage('No Data, create new');
			items.data = [{pageUrl: url, blinkStyle: styles}];

			chrome.storage.sync.set(items, function () {
				notifyMessage('Data successfully saved to the storage!');
			});
		}
	});
}

function readFromStorage() {
	return false;
	chrome.storage.sync.get(null, function (obj) {
		console.log(obj);
	});
}

function removeStylesOnPage() {
	let blinkStyles = document.getElementById('blinkStyles');

	if (blinkStyles === null) {
		notifyMessage('Blink style Not exist');
		return false;
	} else {
		notifyMessage('Blink style Exist');
		document.getElementsByTagName('body')[0].removeChild(blinkStyles);
		notifyMessage('Styles Removed');
		return true;
	}
}

function currentStylesOnPage() {
	let blinkStyles = document.getElementById('blinkStyles');

	if (blinkStyles === null) {
		notifyMessage('Blink style Not exist, cant load');
		return false;
	} else {
		notifyMessage('Blink style Exist, try to load');
		return blinkStyles.innerHTML;
	}
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	notifyMessage("Something happening from the extension");
	let dataUrl = request.dataUrl || {};
	let data = request.data || {};

	function addStylesOnPage() {
		removeStylesOnPage();
		let styles = document.createElement('style');
		styles.type = 'text/css';
		styles.id = 'blinkStyles';
		styles.innerHTML = data;
		document.getElementsByTagName('body')[0].appendChild(styles);
		notifyMessage('Styles Added');
		return true;
	}


	if (request.greeting === "sendData") {
		if (addStylesOnPage()) {
			saveToStorage(data, dataUrl);
			sendResponse({currentData: data, success: true});
		} else {
			sendResponse({success: false});
		}
	} else if (request.greeting === "removeData") {
		if (removeStylesOnPage()) {
			chrome.storage.sync.clear();
			sendResponse({success: true});
		} else {
			chrome.storage.sync.clear();
			sendResponse({success: false});
		}
	} else if (request.greeting === "loadData") {
		if (currentStylesOnPage()) {
			readFromStorage();
			sendResponse({currentData: currentStylesOnPage(), success: true});
		} else {
			readFromStorage();
			sendResponse({success: false});
		}
	}
});