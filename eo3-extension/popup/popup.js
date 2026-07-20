function getDownloadUrl() {
    // #main > div.work > ul > li.download > ul > li:nth-child(5) > a
    const link = document.querySelector("#main > div.work > ul > li.download > ul > li:nth-child(5) > a");
    if (!link) {
        return "";
    }
    return link.href;
}

async function getDownload(tabId) {
    const response = await chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: getDownloadUrl
    });
    const url = response[0].result;

    if (url === "") {
        return {
            success: false,
            message: "Download link not found."
        }
    }

    const response2 = await chrome.runtime.sendMessage({
        type: "STYLE_HTML",
        url: url
    });
    return response2;
}

async function onButtonClick() {
    const urlPrefix = "https://archiveofourown.org/works/";

    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tabs[0].url.startsWith(urlPrefix)) {
        const response = await getDownload(tabs[0].id);
        document.getElementById("output").textContent = response.message;
    }
    else {
        document.getElementById("output").textContent = "The extension cannot be used on this page.";
    }
}

document.getElementById("btn").addEventListener("click", onButtonClick);