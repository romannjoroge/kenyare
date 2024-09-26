export const GET_PERIOD_RULES = `You are presented with a block that could specify a certain period. A period is indicated by saying something similar to signing hereon is in respect of the period effective from date X to date Y. If a period is found in the block I would like you to output the period in this format: '{"found": true, "period": "date X to date Y"}'. If the period is not the block I would like you to output '{"found": false}'. Do not output anything else`; 
export const EXCLUSION_RULES = `You are presented with a page that may have details of what's excluded from a policy. A page indicated what is excluded would have something like this: Exclusions: As per Original policy wording and in addtion: 1) Exclusion 1 2) Exclusion 2 etc. I would like if no exclusion is found for you to return '{"found": false}' otherwise return '{"found": true, "exclusions" ["Exclusion 1", "Exclusion 2"]}'. Do not output anything else` 
    export const GET_COVERED_RULES=`You are presented with a page that may have details of what's included in a policy. A page indicating what's in a policy would have something like this: Business Covered: 1) Item 1 2) Item 2 etc. I would like if no inclusions are found for you to return '{"found": false}' otherwise return '{"found": true, "inclusions" ["Item 1", "Item 2"]}'. Do not output anything else` 
        export const GET_TOTAL_PAID_RULES=`You are given a document containing values for premium, paid claims, brokerage and commission. I want you to determine the value for the paid claims X and of the premium Y. If found output '{"found": true, "claims": "X", "premium": "Y"}'. If not found return '{"found": false}'`;
export const FILE_TYPE_PROMPT=`The following text contains an a key value dictionary. The key is the name of a file, the value is the 1st 200 words of the file. Identify which file is the treaty file and which one is the claims statement.
Please identify the names of the files and return them as an array of objects in the following format(hint: borderaux is either an excel or csv file):
    [
    {{ "claims_statements": "file_name" }},
    {{ "treaty_files": "file_name" }}
]`;
export const COLUMN_NAMES_PROMPT=`The following text contains the headers of the columns in an insurance dataset. Please identify the relevant columns based on the criteria below:

    - Amount Paid and any subheadings under it. Do not include any limits.
    - Start date of the cover.
    - End date of the cover.
    - Date the claim was filled / created
    - Date the claim was paid/approved.
    - Policy holder ID.
    - Heading that denotes the treaty or benefits limit and any subheadings under it.

    Return the results as an array of objects in the following format:
    [
    { "amount": ("heading", "subHeading") }} or {{ "amount": "heading" },
    { "start_date": "start_date" },
    { "end_date": "end_date" },
    {"claim_date": "claim_date"},
    { "approval_date": "approval_date" },
    { "policy_holder_id": "policy_holder_id" },
    { "benefit_limit": ("heading", "subHeading") }} or {{ "benefit_limit": "heading" }
]`;
