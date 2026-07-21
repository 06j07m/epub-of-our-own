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