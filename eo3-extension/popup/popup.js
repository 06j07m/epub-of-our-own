const urlPrefix = "https://archiveofourown.org/works/";

function testFunction(tab) {
    // #main > div.work > ul > li.download > ul > li:nth-child(5) > a
    const link = document.querySelector("#main > div.work > ul > li.download > ul > li:nth-child(5) > a");
    const msg = link ? link.href : "Not foudn";
    alert(msg);
}


document.getElementById("btn").addEventListener("click", () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0].url.startsWith(urlPrefix)) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: testFunction
            })
        } else {
            document.getElementById("output").textContent = "The extension cannot be used on this page.";
        }
    });
});