function getDownloadUrl() {
    // Get download link element from the page
    // #main > div.work > ul > li.download > ul > li:nth-child(5) > a
    const link = document.querySelector("#main > div.work > ul > li.download > ul > li:nth-child(5) > a");

    // Return actual link or empty string if not found
    if (!link) {
        return "";
    }
    return link.href;
}

async function getDownload(tabId, options) {
    // Inject script to get download URL
    const response = await chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: getDownloadUrl
    });
    const url = response[0].result;

    // If not found
    if (url === "") {
        return {
            success: false,
            message: "Download link not found."
        }
    }

    // Create new document
    const response2 = await createDocument(url, options);
    if (!response2) {
        return {
            success: false,
            message: "Something went wrong. :("
        }
    }
    return {
        success: true,
        message: "Document created successfully. Wait for download."
    }
    // const response2 = await chrome.runtime.sendMessage({
    //     type: "STYLE_HTML",
    //     url: url
    // });
    // return response2;
}

async function onButtonClick() {
    const urlPrefix = "https://archiveofourown.org/works/";

    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const options = {
        foregroundColor: document.getElementById("foreground").value,
        backgroundColor: document.getElementById("background").value
    };

    if (tabs[0].url.startsWith(urlPrefix)) {
        const response = await getDownload(tabs[0].id, options);
        document.getElementById("output").textContent = response.message;
    }
    else {
        document.getElementById("output").textContent = "The extension cannot be used on this page.";
    }
}

document.getElementById("btn").addEventListener("click", onButtonClick);