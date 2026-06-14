const { PDFParse } = require("pdf-parse");
const { generateInterviewReport, generateResumePdf } = require("../services/ai.sevice")
const interviewReportModel = require("../models/interview.model")
/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {
    try {
        let resumeText = "";
        if (req.file && req.file.buffer) {
            // 1. Initialize the parser with the buffer
            const parser = new PDFParse({ data: req.file.buffer });
            
            // 2. Call getText() to extract the contents
            const parsedData = await parser.getText();
            resumeText = parsedData.text;
            
            // 3. Destroy the parser to prevent memory leaks
            await parser.destroy();
        }

        const { selfDescription, jobDescription } = req.body

        const interViewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription,
            jobDescription
        })

        // Sanitize AI response to match Mongoose enum constraints (lowercase)
        if (interViewReportByAi.skillGaps) {
            interViewReportByAi.skillGaps = interViewReportByAi.skillGaps.map(gap => ({
                ...gap,
                severity: gap.severity ? gap.severity.toLowerCase() : "medium" // default to medium if missing
            }));
        }

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription,
            jobDescription,
            ...interViewReportByAi,
            title: interViewReportByAi.title || "Untitled Position"
        })

        res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        })
    } catch (error) {
        console.error("Error generating report:", error);
        res.status(500).json({ message: "Failed to generate report", error: error.message || error });
    }
}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {

    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })
}


/** 
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}


/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params

    const interviewReport = await interviewReportModel.findById(interviewReportId)

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    const { resume, jobDescription, selfDescription } = interviewReport

    const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
    })

    res.send(pdfBuffer)
}

/**
 * @description Controller to delete interview report by interviewId.
 */
async function deleteInterviewReportController(req, res) {
    const { interviewId } = req.params;

    const deletedReport = await interviewReportModel.findOneAndDelete({ _id: interviewId, user: req.user.id });

    if (!deletedReport) {
        return res.status(404).json({
            message: "Interview report not found or you do not have permission to delete it."
        });
    }

    res.status(200).json({
        message: "Interview report deleted successfully."
    });
}

module.exports = { generateInterViewReportController, getInterviewReportByIdController, getAllInterviewReportsController, generateResumePdfController, deleteInterviewReportController }