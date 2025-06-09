// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import AnalysisResult from './components/AnalysisResult';
import ImageUpload from './components/ImageUpload';
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
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Load saved analysis on component mount
  useEffect(() => {
    const savedResult = localStorage.getItem('lastAnalysisResult');
    const savedParsed = localStorage.getItem('lastParsedAnalysis');
    const savedImage = localStorage.getItem('lastUploadedImage');
    
    if (savedResult) {
      try {
        setResult(JSON.parse(savedResult));
      } catch (error) {
        console.error('Failed to load saved result:', error);
      }
    }
    
    if (savedParsed) {
      try {
        setParsedAnalysis(JSON.parse(savedParsed));
      } catch (error) {
        console.error('Failed to load saved analysis:', error);
      }
    }

    if (savedImage) {
      setUploadedImage(savedImage);
    }
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    if (result) localStorage.setItem('lastAnalysisResult', JSON.stringify(result));
  }, [result]);

  useEffect(() => {
    if (parsedAnalysis) localStorage.setItem('lastParsedAnalysis', JSON.stringify(parsedAnalysis));
  }, [parsedAnalysis]);

  useEffect(() => {
    if (uploadedImage) localStorage.setItem('lastUploadedImage', uploadedImage);
  }, [uploadedImage]);

  const analyzeUploadedChart = async (file: File) => {
    setLoading(true);
    setResult(null);
    setParsedAnalysis(null);
    
    try {
      // Store uploaded image for preview
      const reader = new FileReader();
      reader.onload = () => setUploadedImage(reader.result as string);
      reader.readAsDataURL(file);

      // Create FormData and send to API
      const formData = new FormData();
      formData.append('image', file);

      console.log('Uploading and analyzing chart...');
      const response = await fetch('/api/analyze-chart', {
        method: 'POST',
        body: formData,
      });

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
      console.error('Upload error:', error);
      setResult({ 
        error: 'Upload failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
    
    setLoading(false);
  };

  const testWithSampleChart = async () => {
    setLoading(true);
    setResult(null);
    setParsedAnalysis(null);
    setUploadedImage(null);
    
    try {
      console.log('Testing with sample chart...');
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
      console.error('Test error:', error);
      setResult({ 
        error: 'Test failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
    
    setLoading(false);
  };

  const clearAll = () => {
    setResult(null);
    setParsedAnalysis(null);
    setUploadedImage(null);
    localStorage.removeItem('lastAnalysisResult');
    localStorage.removeItem('lastParsedAnalysis');
    localStorage.removeItem('lastUploadedImage');
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          AI Trading Chart Analyzer
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Upload your trading charts and get instant AI-powered technical analysis with precise entry points, targets, and risk management.
        </p>
      </div>

      {/* Image Upload Section */}
      <ImageUpload onUpload={analyzeUploadedChart} loading={loading} />

      {/* Alternative Test Option */}
      <div className="text-center mb-8">
        <div className="flex items-center mb-4">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-gray-500 text-sm">OR</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>
        
        <button 
          onClick={testWithSampleChart}
          disabled={loading}
          className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 disabled:opacity-50 font-medium mr-4"
        >
          {loading ? 'Analyzing...' : 'Test with Sample Chart'}
        </button>

        {(result || parsedAnalysis) && (
          <button 
            onClick={clearAll}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 font-medium"
          >
            Clear All
          </button>
        )}
      </div>
      
      {/* Analysis timestamp */}
      {parsedAnalysis && result?.timestamp && (
        <div className="text-center mb-6">
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            Analysis completed: {new Date(result.timestamp).toLocaleString()}
          </span>
        </div>
      )}
      
      {/* Show the analysis */}
      {parsedAnalysis && (
        <AnalysisResult analysis={parsedAnalysis} />
      )}
      
      {/* Show errors */}
      {result && !result.success && (
        <div className="bg-white border border-red-200 rounded-lg p-6 shadow-sm max-w-4xl mx-auto">
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