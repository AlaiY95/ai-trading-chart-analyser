// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import AnalysisResult from './components/AnalysisResult';
import { ChartAnalysis, parseAnalysis } from './lib/types';

interface AnalysisResponse {
  success?: boolean;
  analysis?: string;
  error?: string;
  details?: string;
  timestamp?: string;
}

export default function Home() {
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [parsedAnalysis, setParsedAnalysis] = useState<ChartAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  // Load saved analysis on component mount
  useEffect(() => {
    const savedResult = localStorage.getItem('lastAnalysisResult');
    const savedParsed = localStorage.getItem('lastParsedAnalysis');
    
    if (savedResult) {
      try {
        const parsedResult = JSON.parse(savedResult);
        setResult(parsedResult);
      } catch (error) {
        console.error('Failed to load saved result:', error);
      }
    }
    
    if (savedParsed) {
      try {
        const parsedAnalysisData = JSON.parse(savedParsed);
        setParsedAnalysis(parsedAnalysisData);
      } catch (error) {
        console.error('Failed to load saved analysis:', error);
      }
    }
  }, []);

  // Save analysis whenever it changes
  useEffect(() => {
    if (result) {
      localStorage.setItem('lastAnalysisResult', JSON.stringify(result));
    }
  }, [result]);

  useEffect(() => {
    if (parsedAnalysis) {
      localStorage.setItem('lastParsedAnalysis', JSON.stringify(parsedAnalysis));
    }
  }, [parsedAnalysis]);

  const testAnalysis = async () => {
    setLoading(true);
    setResult(null);
    setParsedAnalysis(null);
    
    try {
      console.log('Calling API...');
      const response = await fetch('/api/analyze-chart');
      const data: AnalysisResponse = await response.json();
      
      setResult(data);
      
      if (data.success && data.analysis) {
        const parsed = parseAnalysis(data.analysis);
        if (parsed) {
          setParsedAnalysis(parsed);
          console.log('Parsed analysis:', parsed);
        }
      }
    } catch (error) {
      console.error('Network error:', error);
      setResult({ 
        error: 'Network error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
    
    setLoading(false);
  };

  const clearAnalysis = () => {
    setResult(null);
    setParsedAnalysis(null);
    localStorage.removeItem('lastAnalysisResult');
    localStorage.removeItem('lastParsedAnalysis');
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-4xl font-bold text-center mb-8">
        AI Trading Chart Analyzer
      </h1>
      
      <div className="text-center mb-8 space-x-4">
        <button 
          onClick={testAnalysis}
          disabled={loading}
          className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {loading ? 'Analyzing Chart...' : 'Test Chart Analysis'}
        </button>
        
        {(result || parsedAnalysis) && (
          <button 
            onClick={clearAnalysis}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 font-semibold"
          >
            Clear Analysis
          </button>
        )}
      </div>
      
      {/* Show saved analysis indicator */}
      {parsedAnalysis && result?.timestamp && (
        <div className="text-center mb-4">
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            Last analysis: {new Date(result.timestamp).toLocaleString()}
          </span>
        </div>
      )}
      
      {/* Show the beautiful parsed analysis */}
      {parsedAnalysis && (
        <AnalysisResult analysis={parsedAnalysis} />
      )}
      
      {/* Show errors */}
      {result && !result.success && (
        <div className="bg-white border rounded-lg p-6 shadow-sm max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-red-600 mb-2">Analysis Failed</h2>
          <p className="text-red-700 mb-2">{result.error}</p>
          {result.details && (
            <p className="text-sm text-gray-600">{result.details}</p>
          )}
        </div>
      )}
    </main>
  );
}