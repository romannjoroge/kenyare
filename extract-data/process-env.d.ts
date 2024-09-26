declare global {
    namespace NodeJS {
        interface ProcessEnv {
            OPENAI_API_KEY: string,
            OPEN_AI_ORG_ID: string,
            OPEN_AI_PROJ_ID: string,
            PYTHON_URL: string
        }
    }
}

export {}
