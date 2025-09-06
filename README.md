Text-to-SQL Web Application
This is a full-stack web application that translates natural language questions into SQL queries, executes them against a PostgreSQL database, and presents the results in a user-friendly format, including a data table and a chart visualization.

🚀 Features
Natural Language to SQL: Use the power of a Large Language Model (LLM) to convert plain English questions into valid PostgreSQL queries.

Dynamic Data Visualization: View your query results in a formatted table and a dynamically generated chart.

Real-time Interaction: The application provides instant feedback, including a loading spinner and error messages.

Modular Architecture: The project is built using a modern MERN-like stack (React, Express, Node.js) with PostgreSQL, making it scalable and easy to maintain.

🛠️ Technology Stack
Frontend:

React: A JavaScript library for building the user interface.

Vite: A fast build tool for the development environment.

Chart.js: A popular library for creating interactive charts.

Marked: A lightweight library to render Markdown tables as HTML.

CSS: Custom CSS for a clean, modern, and responsive design.

Backend:

Node.js: A JavaScript runtime for the server-side logic.

Express: A minimal and flexible Node.js web application framework.

PostgreSQL: A powerful, open-source relational database.

Groq API: Provides the LLM that powers the natural language to SQL conversion.

node-postgres (pg): The client library for connecting to and interacting with PostgreSQL.

dotenv: A library to manage environment variables securely.

⚙️ Setup and Installation
1. Backend Setup
Clone the repository and navigate to the server directory:

cd server

Install the dependencies:

npm install

Set up your PostgreSQL database:
Create a new PostgreSQL database and ensure you have the necessary user credentials.

Create a .env file:
In the server directory, create a .env file and add your database and API credentials.

PG_USER=your_username
PG_HOST=localhost
PG_DB=your_database_name
PG_PASSWORD=your_password
PG_PORT=5432
GROQ_API_KEY=your_groq_api_key

Replace the placeholder values with your actual credentials.

Run database migrations:
Create the necessary tables by running the following SQL commands in your PostgreSQL client:

Start the backend server:

npm start

The server will run on http://localhost:3000.

2. Frontend Setup
Navigate to the client directory:

cd client

Install the dependencies:

npm install

Start the React development server:

npm run dev

The frontend will be available at http://localhost:5173 (or a similar address).

📝 Usage
Once both the backend and frontend servers are running, open your browser and navigate to the frontend URL. Enter a natural language question about your database schema, and the application will provide a corresponding SQL query, a result table, and a chart visualization.

Example Prompts:

show me the total number of employees in each department

what is the average salary of employees in the sales department?

list all projects with a budget over 70000

show all employees and the projects they are on