import React, { useState } from 'react';
import { marked } from 'marked';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './index.css';

// Register Chart.js components and scales for the Bar chart
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function App() {
  // State variables for managing the application's data and UI state
  const [prompt, setPrompt] = useState('');
  const [sqlQuery, setSqlQuery] = useState('');
  const [markdownTable, setMarkdownTable] = useState('');
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle changes to the text area input
  const handlePromptChange = (event) => {
    setPrompt(event.target.value);
  };

  // Handle form submission and API call
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setSqlQuery('');
    setMarkdownTable('');
    setChartData(null);

    try {
      // Make a POST request to the backend API
      const response = await fetch('http://localhost:3000/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Something went wrong with the API call.');
      }

      const result = await response.json();
      setSqlQuery(result.sql);
      setMarkdownTable(result.markdownTable);
      setChartData(result.chartData);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Chart configuration options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: 'Inter, sans-serif',
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: 'Query Visualization',
        font: {
          family: 'Inter, sans-serif',
          size: 18,
          weight: 'bold',
        },
        color: '#1f2937',
      },
    },
    scales: {
      x: {
        ticks: {
          font: {
            family: 'Inter, sans-serif',
          },
        },
      },
      y: {
        ticks: {
          font: {
            family: 'Inter, sans-serif',
          },
        },
      },
    },
  };

  return (
    <div className="app-container">
      <div className="main-content">
        <h1 className="title">Text-to-SQL</h1>
        <p className="subtitle">Type your question in plain English</p>
        
        <form onSubmit={handleSubmit} className="form-container">
          <textarea
            id="prompt-input"
            rows="3"
            value={prompt}
            onChange={handlePromptChange}
            className="text-input"
            placeholder="e.g., 'Show me the total number of employees in each department.'"
            disabled={isLoading}
          ></textarea>
          <button
            type="submit"
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="path" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="fill" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </form>

        {error && (
          <div className="error-message" role="alert">
            <strong className="error-bold">Error:</strong>
            <span className="error-text">{error}</span>
          </div>
        )}

        {(sqlQuery || markdownTable || chartData) && (
          <div className="results-container">
            <div className="result-card">
              <h3 className="result-title">Generated SQL Query</h3>
              <pre className="code-block">
                <code>{sqlQuery}</code>
              </pre>
            </div>

            <div className="result-card">
              <h3 className="result-title">Query Results</h3>
              <div 
                className="markdown-table" 
                dangerouslySetInnerHTML={{ __html: marked(markdownTable || '') }} 
              />
            </div>

            {chartData && chartData.labels.length > 0 && (
              <div className="result-card">
                <h3 className="result-title">Visualization</h3>
                <div className="chart-container">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
