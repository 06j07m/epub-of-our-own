const newStyle = `
@media print {
    @page {
        margin: 0.75in;
        /* works in calibre?? */
        background-color: #f8f7f4;
        color: #1a1919;
        @bottom-center {
            font-size: 0.75em;
            content: counter(page);
        }
    }
    
    a {
        text-decoration: none;
    }
    /* a::after {
        content: " (" attr(href) ")";
    } */    
}

body {
    font-family: "Cardo", "Garamond", "Times New Roman", serif;
}

p.message {
    text-align: center;
    margin-top: 3em;
}

p.message b {
    font-size: 1.1em;
}

.meta dl.tags {
    border: 1px solid;
    padding: 1em;
    font-size: 0.9em;
}

.meta dd {
    margin: -1em 0 0 10em;
}

.meta h1 {
    font-size: 1.5em;
    text-align: center;
    margin-top: 3em;
    margin-bottom: 0.25em;
    page-break-before: always;
}

.meta .byline {
    text-align: center;
}

/* For works with chapters */
.meta h2 {
    font-size: 1.25em;
    text-align: center;
    margin-top: 2em;
    margin-bottom: 0.25em;
    page-break-before: always;
}

.meta > p, #endnotes > p {
    font-weight: bold;
    text-align: center;
    margin-top: 3em;
    margin-bottom: 0;
}

.meta > blockquote, #endnotes > blockquote {
    margin: 0 auto;
    width: 80%;
}

.meta .endnote-link {
    font-size: .8em;
    font-style: italic;
    width: 80%;
    margin: 1em auto;
}

#chapters {
    margin-top: 3em;
    page-break-before: always;
}

#chapters div.userstuff p {
    text-indent: 1.5em;
}

#afterword {
    page-break-before: always;
}

/* List child related works under the labeling dt */
#afterword .meta dd {
    margin: 1em 0 0 1em;
}

/* Invisible headings to help Calibre make a Table of Contents */
.toc-heading {
    display: none;
}`;

async function createDocument(downloadUrl) {
    try {
        const response = await fetch(downloadUrl);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const fontLink1 = doc.createElement("link");
        fontLink1.rel = "preconnect";
        fontLink1.href = "https://fonts.googleapis.com";

        const fontLink2 = doc.createElement("link");
        fontLink2.rel = "preconnect";
        fontLink2.href = "https://fonts.gstatic.com";
        fontLink2.crossOrigin = "anonymous";

        const fontLink3 = doc.createElement("link");
        fontLink3.rel = "stylesheet";
        fontLink3.href = "https://fonts.googleapis.com/css2?family=Cardo:ital,wght@0,400;0,700;1,400&display=swap";

        const styleElement = doc.querySelector("head > style");
        styleElement.insertAdjacentElement("beforebegin", fontLink1);
        styleElement.insertAdjacentElement("beforebegin", fontLink2);
        styleElement.insertAdjacentElement("beforebegin", fontLink3);

        styleElement.textContent = newStyle;

        const newHtml = "<!DOCTYPE html>\n" + doc.documentElement.outerHTML;

        const blob = new Blob(
            [newHtml],
            { type: "text/html" }
        );

        const newDownloadUrl = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = newDownloadUrl;
        a.download = "test.html";

        a.click();

        URL.revokeObjectURL(newDownloadUrl);

        return true;
    } catch (err) {
        return false;
    }
}

async function messageListener(message, sender, sendResponse) {
    if (message.type !== "STYLE_HTML") return;

    try {
        const downloadUrl = message.url;
        const success = await createDocument(downloadUrl);
        if (!success) {
            sendResponse({
                success: false,
                message: "Failed to create document."
            });
        }
        else {
            sendResponse({
                success: true,
                message: "Document created???"
           });
        }
    } catch (err) {
        sendResponse({
            success: false,
            message: err.message
        });
    }

    return true; // Keep the message channel open for the async response.
}

chrome.runtime.onMessage.addListener(messageListener);