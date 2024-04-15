
import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const TEMP_DIR = '/tmp';

const executePythonCode = (code: string): string => {
    const scriptPath = path.join(TEMP_DIR, 'script.py');
    fs.writeFileSync(scriptPath, code);
    
    try {
        const result = execSync(`python ${scriptPath}`, { timeout: 5000 }).toString();
        return result;
    } catch (error) {
        return (error as Error).message;
    } finally {
        // Clean up temporary file
        fs.unlinkSync(scriptPath);
    }
};

const executeJavaCode = (code: string): string => {
    const javaFilePath = path.join(TEMP_DIR, 'Main.java');
    fs.writeFileSync(javaFilePath, code);

    try {
        execSync(`javac ${javaFilePath}`, { timeout: 5000 });

        const runResult = execSync(`java -classpath ${TEMP_DIR} Main`, { timeout: 5000 }).toString();
        return runResult;
    } catch (error) {
        return (error as Error).message;
    } finally {
        // Clean up temporary file
        fs.unlinkSync(javaFilePath);
        const classFilePath = path.join(TEMP_DIR, 'Main.class');
        if (fs.existsSync(classFilePath)) {
            fs.unlinkSync(classFilePath);
        }
    }
};

const executeCppCode = (code: string): string => {
    const cppFilePath = path.join(TEMP_DIR, 'temp.cpp');
    fs.writeFileSync(cppFilePath, code);
    
    try {
        execSync(`g++ ${cppFilePath} -o ${TEMP_DIR}/main`, { timeout: 5000 });

        const runResult = execSync(`${TEMP_DIR}/main`, { timeout: 5000 }).toString();
        return runResult;
    } catch (error) {
        return (error as Error).message;
    } finally {
        // Clean up temporary files
        fs.unlinkSync(cppFilePath);
        const mainFilePath = path.join(TEMP_DIR, 'main');
        if (fs.existsSync(mainFilePath)) {
            fs.unlinkSync(mainFilePath);
        }
    }
};

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
    const language = event.queryStringParameters?.language || 'python';
    const code = event.queryStringParameters?.code || '';

    let result: string;

    // Validate language
    const supportedLanguages = ['python', 'java', 'cpp'];
    if (!supportedLanguages.includes(language)) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Unsupported language.' }),
        };
    }

    // Validate code length
    const maxCodeLength = 2000; // Set a limit on code length to prevent large inputs
    if (code.length > maxCodeLength) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Code length exceeds the limit.' }),
        };
    }

    // Execute the provided code
    if (language === 'python') {
        result = executePythonCode(code);
    } else if (language === 'java') {
        result = executeJavaCode(code);
    } else if (language === 'cpp') {
        result = executeCppCode(code);
    } else {
        result = `Unsupported language: ${language}`;
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ body: result }),
    };
};