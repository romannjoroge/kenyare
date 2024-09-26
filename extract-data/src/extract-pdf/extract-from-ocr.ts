import { readPdfPages } from "pdf-text-reader";
import { promptAI } from "../openai/index.js";
import { GET_TOTAL_PAID_RULES } from "../constants.js";

interface StatementDetails {
    claims: number,
    premium: number
}

const exampleStatement = `AFRO-ASIAN

INSURANCE SERVICES LTD

# frtertiatiorniHl insurance & Redisurvance BYORGrS *

Kenya Reinsurance Corporation Ltd. (Nairobi)
P. O. Box 30271

00100 Nairobi

Kenya

Date : 21-JAN-21
Your Ref :

Our Ref =: X09315/W14713
Contact : Yogesh Rane

TREATY STATEMENT _.

Reinsured +: BICOR Assurances Generales SA

Treaty : Medical Expenses Quota Share Treaty

Period : 01-JAN-20 to 31-DEC-20

Period of Account : Jul-Sep 2020
Cur : Burundian Franc

Additional Information : MEDICAL QS- 3RD QTR 2020- UY: 2020

DESCRIPTION

Premium
Paid Claims
Brokerage
Commission

BALANCE
TOTAL

Your 10% Share of Balance: BIF 1,184,675.25 DR

Premium Reserve B/Fwd
Premium Reserve Retained
Premium Reserve Released
Premium Reserve C/Fwd

100% Figures

DEBIT CREDIT

40,880,330.40

       

 

44,346,615.20
1,022,008.26
7,358,459.47

 
      
  
   

 
 

11,846,752.53

Peek Be ea Te .
52,727,082.9 52,727,082.93
 

Third Floor, 16 St.Clare Street, London EC3N 1LQ, United Kingdom.

t: +44(0)20 7375 7420 f: +44(0)20 7375 0972 e: info@afroasian-insurance.com web:www.afroasian-insurance.com
Registered in England No: 2197265. Authorised and regulated by the Financial Services Authority`;

export async function extractFromOCR(content: string): Promise<StatementDetails> {
    try {
        let extracted: StatementDetails = {claims: 0, premium: 0};
        const response = await promptAI(
            GET_TOTAL_PAID_RULES,
            content
        );
        if (response) {
            console.log("Response =>", response);
            const responseBody = JSON.parse(response);
            if(responseBody['found'] === true) {
                const rawClaims: string = responseBody['claims'];
                const parsedClaims = rawClaims.replaceAll(",", "");
                const rawPremim: string = responseBody['premium'];
                const parsedPremium = rawPremim.replaceAll(",", "");
                extracted.claims = Number.parseFloat(parsedClaims);
                extracted.premium = Number.parseFloat(parsedPremium);
                return extracted
            } else {
                throw "Could Not Extract From OCR";
            }
        } else {
            throw "Could Not Extract From OCR";
        }
    } catch(err) {
        console.log("Error Extracting From OCR", err);
        throw "Could Not Extract From OCR";
    }
}

async function test() {
    try {
        const response = await extractFromOCR(exampleStatement);
        console.log("Extracted Data => ", response);
    } catch(err) {
        console.log("Error Inteprating Statement", err);
        throw "Error Interprating Statement";
    }
}
test();
