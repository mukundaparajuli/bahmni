const asyncHandler = require("../middleware/async-handler");
const Document = require("../models/document");

exports.uploadToOpenMRS = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const document = Document.findById(id);

    if (!document) {
        const error = new Error("No document was found for this id");
        error.statusCode = 404;
        throw error;
    }

    if (document.status !== "approved") {
        return res.status(400).json({ error: "File not approved yet" });
    }


    // read the file from the filepath and store it to 
    const docForOpen = new FormData();
    form.append("document", fs.createReadStream(document.filePath))

    // upload to bahmni-openmrs

    // change the document status to uploaded
    document.status = "uploaded";

    document.save();
})