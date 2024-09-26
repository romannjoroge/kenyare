import { FILE_TYPE_PROMPT } from "./constants.js";
import { promptAI } from "./openai/index.js";

interface FileTypes {
    claims_statements: string,
    treaty_files: string
}

export default async function getFileType(data: Record<string, string>): Promise<FileTypes> {
    try {
        let fileTypes: FileTypes = {claims_statements: "", treaty_files: ""};

        // Ask ChatGPT for file type
        console.log(JSON.stringify(data));

        let response = await promptAI(FILE_TYPE_PROMPT, JSON.stringify(data));
        if(response) {
            let parsedResponse = JSON.parse(response);
            console.log("Parsed =>", parsedResponse);
            parsedResponse.forEach((r) => {
                if (Object.keys(r).includes("claims_statements")) {
                    fileTypes.claims_statements = r['claims_statements'];
                } else {
                    fileTypes.treaty_files = r['treaty_files']
                }
            });
            return fileTypes;
        } else {
            throw "No Response From ChatGPT";
        }
    } catch(err) {
        console.log("Error Getting File Types =>", err);
        throw "Error Getting File Types";
    }
}
