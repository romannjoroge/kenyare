import "dotenv/config";
import { url } from "inspector";
import { readPdfPages } from "pdf-text-reader";
import { promptAI } from "../openai/index.js";
import { EXCLUSION_RULES, GET_COVERED_RULES, GET_PERIOD_RULES, GET_TOTAL_PAID_RULES } from "../constants.js";

interface TreatyDetails {
    period: string,
    type: string,
    cedant: string,
    covered: string[],
    exclusions: string[]
}

export async function extractDetailsFromTreaty(pdfPath: string): Promise<TreatyDetails> {
    let extracted =  {
        period: "",
        type: "",
        cedant: "",
        covered: [],
        exclusions: []
    };

    let reinsuredFound: boolean = false;
    let periodFound: boolean = false;
    let typeFound: boolean = false;

    const pages = await readPdfPages({url: pdfPath});
    for (let page of pages) {
        console.log("Page => ", page);
        let entirePage = "";
        page.lines.forEach((line) => {
            entirePage = `${entirePage} ${line}`
        })

        let inclusionContent = await promptAI(GET_COVERED_RULES, entirePage);
        if(inclusionContent) {
            let inclusionBody = JSON.parse(inclusionContent);
            if(inclusionBody['found'] === true) {
                console.log("Inclusions Found =>", inclusionBody)
                extracted.covered.push(...inclusionBody['inclusions'])
            }
        }

        let exclusionsContent = await promptAI(EXCLUSION_RULES, entirePage);
        if(exclusionsContent) {
            let exclusionsBody = JSON.parse(exclusionsContent);
            if(exclusionsBody['found'] === true) {
                console.log("Exclusions Found =>", exclusionsBody)
                extracted.exclusions.push(...exclusionsBody['exclusions'])
            }
        }

        if (periodFound === false) {
            let periodContent = await promptAI(GET_PERIOD_RULES, entirePage);
            if(periodContent) {
                console.log("Response from ChatGPT =>", periodContent);
                let periodObject = JSON.parse(periodContent);
                if(periodObject['found'] === true) {
                    console.log("Page contains period => ", entirePage);
                    extracted.period = periodObject['period'];
                    periodFound = true
                }
            }
        }

        for (let line of page.lines) {
            if (line === "") {
                continue
            }

            if (typeFound === false) {
                if(line.includes("Type: ")) {
                    extracted.type = line.replace("Type: ", "");
                    typeFound = true;
                }            
            }

            if (reinsuredFound === false) {
                if(line.includes("Reinsured: ")) {
                    extracted.cedant = line.replace("Reinsured: ", "");
                    reinsuredFound = true;
                }            
            }

        }
    }

    return extracted;
}


export async function extractDetailsFromStatement(pdfPath: string): Promise<StatementDetails> {
    let extracted =  {
        total_paid: 0
    };

    let totalPaidFound = false;

    const pages = await readPdfPages({url: pdfPath});
    for (let page of pages) {
        console.log("Page => ", page);
        let entirePage = "";
        page.lines.forEach((line) => {
            entirePage = `${entirePage} ${line}`
        })

        if(totalPaidFound === false) {
            let totalPaid = await promptAI(GET_TOTAL_PAID_RULES, entirePage);
            if(totalPaid) {
                let totalPaidBody = JSON.parse(totalPaid);
                if(totalPaidBody['found'] === true) {
                    console.log("Total Paid Found =>", totalPaidBody)
                    extracted.total_paid = totalPaidBody['total']
                }
            }
        }
    }

    return extracted;
}

async function test() {
    try {
        const extracted = await extractDetailsFromStatement("./data/BICOR-MEDICAL QS-3RD QTR 2020-  KENYA RE- NAIROBI.PDF");
        console.log(extracted);
    } catch(err) {
        console.log("Error Extracting Text", err);
    }
}

test();
