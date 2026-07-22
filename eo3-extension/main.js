function getGoogleFonts() {
    // Temporary? list of Google Fonts and their corresponding query parameters
    return {
        "Atkinson Hyperlegible": "ital,wght@0,400;0,700;1,400;1,700",
        "Crimson Pro": "ital,wght@0,200..900;1,200..900",
        "EB Garamond": "ital,wght@0,400..800;1,400..800",
        "Inter": "ital,opsz,wght@0,14..32,100..900;1,14..32,100..900",
        "Lato": "ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900",
        "Libre Baskerville": "ital,wght@0,400..700;1,400..700",
        "Libre Franklin": "ital,wght@0,100..900;1,100..900",
        "Lora": "ital,wght@0,400..700;1,400..700",
        "Merriweather": "ital,opsz,wght@0,18..144,300..900;1,18..144,300..900",
        "Neuton": "ital,wght@0,200;0,300;0,400;0,700;0,800;1,400",
        "Noto Sans": "ital,wght@0,100..900;1,100..900",
        "Noto Serif": "ital,wght@0,100..900;1,100..900",
        "Nunito Sans": "ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000",
        "Open Sans": "ital,wght@0,300..800;1,300..800",
        "PT Sans": "ital,wght@0,400;0,700;1,400;1,700",
        "PT Serif": "ital,wght@0,400;0,700;1,400;1,700",
        "Playfair Display": "ital,wght@0,400..900;1,400..900",
        "Roboto Slab": "wght@100..900",
        "Roboto": "ital,wght@0,100..900;1,100..900",
        "Source Sans 3": "ital,wght@0,200..900;1,200..900"
    };
}

function getDefaultFonts() {
    // Web safe fonts
    return [ 
        "Arial",  
        "Verdana",  
        "Tahoma",  
        "Trebuchet MS",  
        "Times New Roman",  
        "Georgia",  
        "Garamond",  
        "Courier New"
    ];
}
  
function getFileName(url) {
    // Gets filename (without extension) from URL of format
    // https://blabla/downloads/123456/filename.html?updatedat=123456
    const regex = /\/([^\/]+)\.html/;
    const match = url.match(regex);
    if (match) {
        return match[1];
    }
    return "fic";
}

function getFontLink(fontName) {
    const googleFonts = getGoogleFonts();
    const defaultFonts = getDefaultFonts();

    // Return font name if valid font, and url if needed
    if (Object.hasOwn(googleFonts, fontName)) {
        return [fontName, `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, "+")}:${googleFonts[fontName]}&display=swap`];
    } 
    else if (defaultFonts.includes(fontName)) {
        return [fontName, ""];
    }
    // Otherwise use default 
    else {
        return ["Times New Roman", ""];
    }
}

async function createDocument(downloadUrl, options) {
    try {
        const [mainFontName, mainFontLink] = getFontLink(options.mainFont);
        const [titleFontName, titleFontLink] = getFontLink(options.titleFont);

        const newStyle = `
        @media print {
            @page {
                margin: 0.75in;
                /* works in calibre?? */
                background-color: ${options.backgroundColor};
                @bottom-center {
                    font-size: 0.75em;
                    content: counter(page);
                }
            }
            body {
                color: ${options.foregroundColor};
            }
            a {
                text-decoration: none;
            }
            /* a::after {
                content: " (" attr(href) ")";
            } */    
        }

        body {
            font-family: ${mainFontName}, "Times New Roman", serif;
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
            font-family: ${titleFontName}, "Times New Roman", serif;
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
            font-family: ${titleFontName}, "Times New Roman", serif;
        }

        .meta > p, #endnotes > p {
            font-weight: bold;
            text-align: center;
            margin-top: 3em;
            margin-bottom: 0;
            font-family: ${titleFontName}, "Times New Roman", serif;
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

        const filename = getFileName(downloadUrl);

        // Get HTML content from the download URL and parse it
        const response = await fetch(downloadUrl);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        // Update existing style element
        const styleElement = doc.querySelector("head > style");
        styleElement.textContent = newStyle;

        // Create new elements for the Google Fonts links if needed
        if (mainFontLink != "" || titleFontLink != "") {
            const fontLink1 = doc.createElement("link");
            fontLink1.rel = "preconnect";
            fontLink1.href = "https://fonts.googleapis.com";

            const fontLink2 = doc.createElement("link");
            fontLink2.rel = "preconnect";
            fontLink2.href = "https://fonts.gstatic.com";
            fontLink2.crossOrigin = "anonymous";

            // Insert the new font links before the existing style element
            styleElement.insertAdjacentElement("beforebegin", fontLink1);
            styleElement.insertAdjacentElement("beforebegin", fontLink2);
        }
        
        if (mainFontLink != "") {
            const fontLink3 = doc.createElement("link");
            fontLink3.rel = "stylesheet";
            fontLink3.href = mainFontLink;
            styleElement.insertAdjacentElement("beforebegin", fontLink3);
        }

        if (titleFontLink != "") {
            const fontLink4 = doc.createElement("link");
            fontLink4.rel = "stylesheet";
            fontLink4.href = titleFontLink;
            styleElement.insertAdjacentElement("beforebegin", fontLink4);
        }

        // Create new HTML file from modified document and make it into a blob
        const newHtml = "<!DOCTYPE html>\n" + doc.documentElement.outerHTML;
        const blob = new Blob(
            [newHtml],
            { type: "text/html" }
        );

        // Generate download link for blob
        const newDownloadUrl = URL.createObjectURL(blob);

        // Create temporary element to trigger download
        const a = document.createElement("a");
        a.href = newDownloadUrl;
        a.download = filename + "_styled.html";
        a.click();

        // Release URL
        URL.revokeObjectURL(newDownloadUrl);

        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}