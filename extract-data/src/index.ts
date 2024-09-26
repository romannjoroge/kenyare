import Express  from "express";
import { readPDF } from "./extract-pdf/read-pdf.js";
import getFileType from "./determine-file-type.js";
import { promptAI } from "./openai/index.js";
import { COLUMN_NAMES_PROMPT } from "./constants.js";
const app = Express();

app.use("/", Express.json());
interface FileDir {
    claims: string,
    treaty: string,
    statement: string
}

app.post("/process", async(req, res) => {
    try {
        // Get files from a folder (name)

        // Read content of the PDF files
        const data1 = await readPDF("data/BICOR-MEDICAL QS-3RD QTR 2020-  KENYA RE- NAIROBI.PDF");
        const data2 = await readPDF("data/BICOR-MEDICAL QS-3RD QTR 2020-  KENYA RE- NAIROBI.PDF");

        // Between the 2 PDF files determine which is treaty and which is statement
        let pdfFileTypes = await getFileType({"file_1.pdf": data1.substring(0, 200), "file_2.pdf": data2.substring(0, 200)});
        console.log("PDF File Types =>", pdfFileTypes);

        // Determine the types of the 3 files
        const fileTypes: FileDir = {claims: pdfFileTypes.claims_statements, treaty: pdfFileTypes.treaty_files, statement: "file_3.xlsx"};

        // Begin processing the claims
        
        return res.json({name: "Hello"});
    } catch(err: any) {
        console.log("Error =>", err);
        return res.status(500).json({message: err.toString()});
    }
});

app.post("/getColumnNames", async(req, res) => {
    try {
        let colsString = req.body.cols;
        console.log(colsString)
        let response = await promptAI(COLUMN_NAMES_PROMPT, colsString);
        if(response) {
            return res.json(response);
        } else {
            return res.status(500).json({message: "Could Not Get Col Names"});
        }
    } catch(err: any) {
        console.log("Error Getting Column Names =>", err);
        return res.status(500).json({message: err.toString()});
    }
});

const port = 6000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}...`);
})
