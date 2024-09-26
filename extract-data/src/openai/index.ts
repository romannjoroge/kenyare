import OpenAI from "openai";
import "dotenv/config";

export const openai = new OpenAI({
    organization: process.env.OPEN_AI_ORG_ID ?? "",
    project: process.env.OPEN_AI_PROJ_ID ?? "",
});

export async function promptAI(rules: string, prompt: string): Promise<string | null> {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {role: "system", content: rules},
                {role: "user", content: prompt}
            ]
        });

        return completion.choices[0].message.content;
    } catch(err) {
        console.log("Error Getting Result: ", err);
        throw "Could Not Get Result";
    }
}
