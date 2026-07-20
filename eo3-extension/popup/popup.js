const urlPrefix = "https://archiveofourown.org/works/";

document.getElementById("btn").addEventListener("click", () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0].url.startsWith(urlPrefix)) {
            document.getElementById("output").textContent = "The extension can be used on this page.";
        } else {
            document.getElementById("output").textContent = "The extension cannot be used on this page.";
        }
    });
});