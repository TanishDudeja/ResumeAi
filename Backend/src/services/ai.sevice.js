const { GoogleGenAI, Type } = require("@google/genai")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})


const interviewReportSchema = {
    type: Type.OBJECT,
    properties: {
        matchScore: { type: Type.INTEGER, description: "A score between 0 and 100 indicating how well the candidate's profile matches the job description" },
        technicalQuestions: {
            type: Type.ARRAY,
            description: "Technical questions that can be asked in the interview along with their intention and how to answer them",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING, description: "The technical question can be asked in the interview" },
                    intention: { type: Type.STRING, description: "The intention of interviewer behind asking this question" },
                    answer: { type: Type.STRING, description: "How to answer this question, what points to cover, what approach to take etc." }
                },
                required: ["question", "intention", "answer"]
            }
        },
        behavioralQuestions: {
            type: Type.ARRAY,
            description: "Behavioral questions that can be asked in the interview along with their intention and how to answer them",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING, description: "The technical question can be asked in the interview" },
                    intention: { type: Type.STRING, description: "The intention of interviewer behind asking this question" },
                    answer: { type: Type.STRING, description: "How to answer this question, what points to cover, what approach to take etc." }
                },
                required: ["question", "intention", "answer"]
            }
        },
        skillGaps: {
            type: Type.ARRAY,
            description: "List of skill gaps in the candidate's profile along with their severity",
            items: {
                type: Type.OBJECT,
                properties: {
                    skill: { type: Type.STRING, description: "The skill which the candidate is lacking" },
                    severity: { type: Type.STRING, description: "The severity of this skill gap (low, medium, or high)" }
                },
                required: ["skill", "severity"]
            }
        },
        preparationPlan: {
            type: Type.ARRAY,
            description: "A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively",
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.INTEGER, description: "The day number in the preparation plan, starting from 1" },
                    focus: { type: Type.STRING, description: "The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc." },
                    tasks: { type: Type.ARRAY, description: "List of tasks to be done on this day to follow the preparation plan", items: { type: Type.STRING } }
                },
                required: ["day", "focus", "tasks"]
            }
        },
        title: { type: Type.STRING, description: "The title of the job for which the interview report is generated" }
    },
    required: ["matchScore", "technicalQuestions", "behavioralQuestions", "skillGaps", "preparationPlan", "title"]
}

async function generateInterviewReport({ resume, selfDescription, jobDescription }, retries = 3, delayMs = 18000) {
    const prompt = `Generate an interview report for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}
`

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: interviewReportSchema,
            }
        });

        return JSON.parse(response.text);

    } catch (error) {
        // Catch the specific 429 and 503 status codes when the API limits are hit or experiencing high demand
        if ((error.status === 429 || error.status === 503) && retries > 0) {
            console.warn(`[Rate Limit or High Demand ${error.status}] Waiting ${delayMs / 1000} seconds before retrying. Retries left: ${retries}`);
            
            // Pause the execution for the delay time (18 seconds)
            await new Promise(resolve => setTimeout(resolve, delayMs));
            
            // Call the function again recursively, passing the exact same object and reducing the retry count
            return generateInterviewReport({ resume, selfDescription, jobDescription }, retries - 1, delayMs);
        }
        
        // If the error is NOT a 429 or 503, or we run out of retries, throw it to the controller
        console.error("Gemini API Error:", error.message || error);
        throw error;
    }
}



async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4", margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()

    return pdfBuffer
}

async function generateResumePdf({ resume, selfDescription, jobDescription }, retries = 3, delayMs = 18000) {

    const resumePdfSchema = {
        type: Type.OBJECT,
        properties: {
            html: { type: Type.STRING, description: "The HTML content of the resume which can be converted to PDF using any library like puppeteer" }
        },
        required: ["html"]
    }

    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: resumePdfSchema,
            }
        });

        const jsonContent = JSON.parse(response.text);

        const pdfBuffer = await generatePdfFromHtml(jsonContent.html);

        return pdfBuffer;

    } catch (error) {
        if ((error.status === 429 || error.status === 503) && retries > 0) {
            console.warn(`[Rate Limit or High Demand ${error.status}] Waiting ${delayMs / 1000} seconds before retrying generateResumePdf. Retries left: ${retries}`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
            return generateResumePdf({ resume, selfDescription, jobDescription }, retries - 1, delayMs);
        }
        
        console.error("Gemini API Error:", error.message || error);
        throw error;
    }
}

module.exports = { generateInterviewReport, generateResumePdf }