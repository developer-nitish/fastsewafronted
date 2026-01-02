const buildChatResponse = (message) => {
    const text = String(message || '').trim();
    const lower = text.toLowerCase();

    if (!text) {
        return "Please type a message so I can help.";
    }

    if (lower.includes('finance')) {
        return "For finance help, you can create a service request after login, or tell me what you need (loan, bookkeeping, budgeting).";
    }

    if (lower.includes('legal') || lower.includes('gst')) {
        return "For legal/GST help, please share your issue in 1-2 lines. You can also create a service request after login.";
    }

    if (lower.includes('land')) {
        return "For land verification/support, share your location/state and what you need (documents, verification, registry).";
    }

    if (lower.includes('construction')) {
        return "For construction, tell me the type of work (new construction/repair) and your approximate area (sqft).";
    }

    if (lower.includes('security')) {
        return "For security services, tell me the location, number of guards required, and shift timing.";
    }

    if (lower.includes('repair')) {
        return "For repair services, describe the issue and your location. A service provider can reach out after you submit a request.";
    }

    if (lower.includes('vendor')) {
        return "To register as a vendor, please sign up and select the appropriate user type, then update your profile details.";
    }

    return "Thanks! Please share a bit more detail (service type + location). If you’re logged in, you can also submit a service request from the dashboard.";
};

const chat = async (req, res) => {
    const { message } = req.body || {};

    res.json({
        response: buildChatResponse(message),
        pdf_generated: false
    });
};

const downloadPdf = async (req, res) => {
    res.status(404).json({
        success: false,
        message: 'PDF download is not configured on this deployment.'
    });
};

module.exports = { chat, downloadPdf };
