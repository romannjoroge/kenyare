import "dotenv/config";
import { readPdfPages } from "pdf-text-reader";
import axios from "axios";
import "dotenv/config";

async function readScannedPDF(pdfPath: string): Promise<string[]> {
    try {
        const pages = await readPdfPages({url: pdfPath});
        let pdfContent = [];
        for (let page of pages) {
            let pageContent = "";
            page.lines.forEach((line) => {
                pageContent = `${pageContent} ${line}`
            })
            pdfContent.push(pageContent);
        }

        return pdfContent;
    } catch(err) {
        console.log("Error Reading PDF =>",err);
        throw "Error Reading PDF";
    }
}

export async function readPDF(pdfPath: string): Promise<string> {
    try {
        const data = await readScannedPDF(pdfPath);
        console.log("Data =>", data);

        const pages = data.length;
        let blankPages = 0;

        for (let page of data) {
            console.log("Page =>", page);
            if (page === "") {
                blankPages++;
            }
        }

        if (blankPages >= (pages % 2)) {
            let response = await axios.post(`${process.env.PYTHON_URL}/ocr`, {
                path: pdfPath
            });
            if(response.status !== 200) {
                throw "Could Not Read PDF";
            } else {
                return response.data as string;
            }
        }
        return data.join(" ");
    } catch(err) {
        console.log("Error reading PDF => ", err);
        throw "Could Not Read PDF";
    }
}

async function test() {
    try {
        const data = await readPDF("data/BICOR-MEDICAL QS-3RD QTR 2020-  KENYA RE- NAIROBI.PDF");
        console.log(data);
    } catch(err) {
        console.log("Error Getting PDF", err);
    }
}

