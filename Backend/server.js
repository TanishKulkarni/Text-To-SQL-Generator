import express from 'express';
import cors from 'cors';
import { getDbSchema, executeSql } from './db.js';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Groq SDK
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

/**
 * Formats a given database result set into a markdown table and chart data.
 * @param {Array<object>} data The array of query results.
 * @returns {object} An object with markdownTable and chartData.
 */
const formatResponseData = (data) => {
    if (!data || data.length === 0) {
        return {
            markdownTable: "| No Data |",
            chartData: { labels: [], datasets: [] }
        };
    }

    const headers = Object.keys(data[0]);
    const markdownTable = `| ${headers.join(' | ')} |\n| ${headers.map(() => '---').join(' | ')} |\n| ${data.map(row => headers.map(header => row[header]).join(' | ')).join(' |\n| ')} |`;

    const chartData = {
        labels: data.map(row => row[headers[0]]),
        datasets: [{
            label: headers[1],
            data: data.map(row => parseFloat(row[headers[1]]))
        }]
    };

    return { markdownTable, chartData };
};

// Define a simple test route to ensure the server is running
app.get('/', (req, res) => {
    res.status(200).send('Text-to-SQL backend is running!');
});

// Main API endpoint to handle text-to-SQL queries
app.post('/api/query', async (req, res) => {
    const userPrompt = req.body.prompt;
    if (!userPrompt) {
        return res.status(400).json({ error: 'Prompt is required.' });
    }

    try {
        // Dynamically fetch the database schema
        const dbSchema = await getDbSchema();

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile", // Using a stable, supported model
            messages: [
                {
                    "role": "system",
                    "content": "You are a world-class SQL query generator. Respond only with a single, valid PostgreSQL SQL query. Do not include any other text, explanations, or code block formatting. The user will provide a database schema and a prompt. Your task is to generate a valid SQL query based on this information."
                },
                {
                    "role": "user",
                    "content": `PostgreSQL schema:\n${dbSchema}\n\nUser prompt: "${userPrompt}"`
                }
            ]
        });

        let sqlQuery = completion.choices[0]?.message?.content;
        
        if (!sqlQuery) {
            return res.status(500).json({ error: "LLM did not generate a valid SQL query." });
        }
        
        // Extract the SQL query using a regular expression to handle various output formats
        const sqlMatch = sqlQuery.match(/(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER)[\s\S]*/i);
        if (sqlMatch && sqlMatch[0]) {
            sqlQuery = sqlMatch[0].trim();
        }

        // Execute the generated SQL query against the database
        const queryResult = await executeSql(sqlQuery);
        
        // Format the real database results for the frontend
        const { markdownTable, chartData } = formatResponseData(queryResult);
        
        res.status(200).json({
            sql: sqlQuery,
            markdownTable,
            chartData
        });

    } catch (error) {
        console.error('API or database error:', error);
        res.status(500).json({ error: `Failed to process your query: ${error.message}` });
    }
});

app.listen(port, () => {
    console.log(`Text-to-SQL backend is running at http://localhost:${port}`);
});

export default app;
