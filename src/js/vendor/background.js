let notifyMessage = word => {
  //return false;
  console.log('Blink extension background script says: ', word);
};

let initBackground = () => {
  console.log('test');
};
//initBackground();

let extractHostname = url => {
  let hostname;
  if (url.indexOf("://") > -1) {
    hostname = url.split('/')[2];
  }
  else {
    hostname = url.split('/')[0];
  }
  hostname = hostname.split(':')[0];
  return hostname;
};

let enableIcon = (id) => {
  chrome.browserAction.setIcon({
    tabId: id,
    path: {
      '128': 'img/icons/icon128on.png'
    }
  });
};
let disableIcon = (id) => {
  chrome.browserAction.setIcon({
    tabId: id,
    path: {
      '128': 'img/icons/icon128.png'
    }
  });
};

let pageLoad = {
  init: (pageUrl, tabId) => {
    chrome.tabs.sendMessage(tabId, {
      greeting: "loadDataAndSave",
      pageUrl: pageUrl
    }, response => {
      notifyMessage('Send data to page');
      if (response !== undefined && response.success === true) {
        enableIcon(tabId);
        notifyMessage('Loaded current ' + pageUrl + ' styles');
      }
      else {
        disableIcon(tabId);
        notifyMessage('No styles yet for ' + pageUrl);
      }
    });
  }
};

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (!/^http?.*$/.test(tab.url)) {
    notifyMessage('Page not correct ' + tab.url);
    return true;
    /*run only if page not correct*/
  }
  if (tab.status === 'complete') {
    let pageUrl = extractHostname(tab.url);
    pageLoad.init(pageUrl, tabId);
  }
});

chrome.extension.onMessage.addListener(function (request, sender) {
  if (!/^http?.*$/.test(sender.tab.url)) {
    notifyMessage('Page not correct ' + sender.tab.url);
    return true;
    /*run only if page not correct*/
  }
  if (request === 'iconEnable') {
    enableIcon(sender.tab.id);
    notifyMessage('Icon Enabled');
  }
  else if (request === 'iconDisable') {
    disableIcon(sender.tab.id);
    notifyMessage('Icon Disabled');
  }
});

//start firebase
const firebaseConfig = {
  apiKey: "AIzaSyBrXAGQBSqnvkd-DF2yW8TP1SYuQqEaAao",
  databaseURL: "https://blink-style-importer.firebaseio.com",
  storageBucket: "blink-style-importer.appspot.com"
};
firebase.initializeApp(firebaseConfig);


/**
 * initApp handles setting up the Firebase context and registering
 * callbacks for the auth status.
 *
 * The core initialization is in firebase.App - this is the glue class
 * which stores configuration. We provide an app name here to allow
 * distinguishing multiple app instances.
 *
 * This method also registers a listener with firebase.auth().onAuthStateChanged.
 * This listener is called when the user is signed in or out, and that
 * is where we update the UI.
 *
 * When signed in, we also authenticate to the Firebase Realtime Database.
 */
function initApp() {
  // Listen for auth state changes.
  firebase.auth().onAuthStateChanged(function(user) {
    notifyMessage('User state change detected from the Background script of the Chrome Extension:', user);
  });
}

window.onload = function() {
  initApp();
};