import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Plot from 'react-plotly.js';

import './App.css';

const App = () => {
  // State variables
  const [file, setFile] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [currentMode, setCurrentMode] = useState(null); // 'topToBottom', 'bottomToTop', 'random'
  const [isStarted, setIsStarted] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [frenchInput, setFrenchInput] = useState('');
  const [englishInput, setEnglishInput] = useState('');
  const [showFrenchAnswer, setShowFrenchAnswer] = useState(false);
  const [showEnglishAnswer, setShowEnglishAnswer] = useState(false);
  const [isFrenchCorrect, setIsFrenchCorrect] = useState(null);
  const [isEnglishCorrect, setIsEnglishCorrect] = useState(null);
  const [stats, setStats] = useState([]);
  const [hasCompletedRound, setHasCompletedRound] = useState(false);
  const [currentInputMode, setCurrentInputMode] = useState('french'); // 'french' or 'english'
  const [showPerformanceGraph, setShowPerformanceGraph] = useState(false);
  
  // Refs
  const fileInputRef = useRef(null);
  const frenchInputRef = useRef(null);
  const englishInputRef = useRef(null);
  
  // Handle file upload
  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      readFile(uploadedFile);
    }
  };
  
  useEffect(() => {
    if (currentInputMode === 'french' && frenchInputRef.current) {
      frenchInputRef.current.focus();
    } else if (currentInputMode === 'english' && englishInputRef.current) {
      englishInputRef.current.focus();
    }
  }, [currentInputMode]);

  
  // Read and parse the CSV file
  const readFile = async (uploadedFile) => {
    try {
      // Read the file using FileReader
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target.result;
        
        Papa.parse(fileContent, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setFlashcards(results.data.map((row, index) => ({
              id: index,
              english: row.English,
              french: row.French,
              frenchCorrect: 0,
              frenchIncorrect: 0,
              englishCorrect: 0,
              englishIncorrect: 0
            })));
            
            // Initialize stats array
            setStats(results.data.map((row, index) => ({
              id: index,
              english: row.English,
              french: row.French,
              frenchCorrect: 0,
              frenchIncorrect: 0,
              englishCorrect: 0,
              englishIncorrect: 0
            })));
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
          }
        });
      };
      reader.readAsText(uploadedFile);
    } catch (error) {
      console.error('Error reading file:', error);
    }
  };
  
  // Start the flashcard session
  const startSession = (mode) => {
    setCurrentMode(mode);
    setIsStarted(true);
    setCurrentCardIndex(0);
    setCurrentInputMode('french');
    
    // Arrange cards based on selected mode
    let arrangedCards = [...flashcards];
    if (mode === 'random') {
      arrangedCards = shuffleArray(arrangedCards);
    }
    // For topToBottom and bottomToTop, we use the original order
    
    setFlashcards(arrangedCards);
    setShowFrenchAnswer(false);
    setShowEnglishAnswer(false);
    setFrenchInput('');
    setEnglishInput('');
    setIsFrenchCorrect(null);
    setIsEnglishCorrect(null);
    setHasCompletedRound(false);
    setShowPerformanceGraph(false);
    
    // Focus on the French input
    // setTimeout(() => {
    //   if (frenchInputRef.current) {
    //     frenchInputRef.current.focus();
    //   }
    // }, 100);
    
    // Speak the French word
    speakFrenchWord(arrangedCards[0].french);
  };
  
  // Shuffle array (Fisher-Yates algorithm)
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };
  
  // Speak a French word using browser's Speech Synthesis
  const speakFrenchWord = (word) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Create and configure the utterance
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9; // Slightly slower
      utterance.pitch = 1;
      utterance.volume = 1;
      
      // Get available voices and try to select a French one
      setTimeout(() => {
        const voices = window.speechSynthesis.getVoices();
        const frenchVoice = voices.find(voice => voice.lang.includes('fr'));
        if (frenchVoice) {
          utterance.voice = frenchVoice;
        }
        
        // Speak the word
        window.speechSynthesis.speak(utterance);
        
        // Log for debugging
        console.log('Speaking French word:', word);
      }, 100);
    } else {
      console.log('Speech synthesis not supported in this browser');
    }
  };
  
  // // Handle French input submission
  // const handleFrenchSubmit = (e) => {
  //   if (e) e.preventDefault();
    
  //   // Skip if we've already shown the answer
  //   if (showFrenchAnswer) return;
    
  //   const currentCard = flashcards[currentCardIndex];
  //   const isCorrect = frenchInput.trim().toLowerCase() === currentCard.french.trim().toLowerCase();
    
  //   console.log("French check:", {
  //     input: frenchInput,
  //     correct: currentCard.french,
  //     isCorrect: isCorrect
  //   });
    
  //   // Update states to show feedback
  //   setIsFrenchCorrect(isCorrect);
  //   setShowFrenchAnswer(true);
    
  //   // Update stats
  //   const updatedStats = [...stats];
  //   if (isCorrect) {
  //     updatedStats[currentCard.id].frenchCorrect += 1;
  //   } else {
  //     updatedStats[currentCard.id].frenchIncorrect += 1;
  //   }
  //   setStats(updatedStats);
    
  //   // Move to English input after a short delay
  //   setTimeout(() => {
  //     setCurrentInputMode('english');
  //     if (englishInputRef.current) {
  //       englishInputRef.current.focus();
  //     }
  //   }, 1500); // Give user time to see the feedback
  // };
  
  const handleFrenchSubmit = (e) => {
    if (e) e.preventDefault();
  
    if (showFrenchAnswer) return;
  
    const currentCard = flashcards[currentCardIndex];
    const isCorrect = frenchInput.trim().toLowerCase() === currentCard.french.trim().toLowerCase();
  
    setIsFrenchCorrect(isCorrect);
    setShowFrenchAnswer(true);
  
    const updatedStats = [...stats];
    if (isCorrect) {
      updatedStats[currentCard.id].frenchCorrect += 1;
    } else {
      updatedStats[currentCard.id].frenchIncorrect += 1;
    }
    setStats(updatedStats);
  };
  
  // Handle English input submission
  const handleEnglishSubmit = (e) => {
    if (e) e.preventDefault();
    
    // Skip if we've already shown the answer
    if (showEnglishAnswer) return;
    
    const currentCard = flashcards[currentCardIndex];
    const isCorrect = englishInput.trim().toLowerCase() === currentCard.english.trim().toLowerCase();
    
    console.log("English check:", {
      input: englishInput,
      correct: currentCard.english,
      isCorrect: isCorrect
    });
    
    // Update states to show feedback
    setIsEnglishCorrect(isCorrect);
    setShowEnglishAnswer(true);
    
    // Update stats
    const updatedStats = [...stats];
    if (isCorrect) {
      updatedStats[currentCard.id].englishCorrect += 1;
    } else {
      updatedStats[currentCard.id].englishIncorrect += 1;
    }
    setStats(updatedStats);
  };
  
  const nextCard = () => {
    const nextIndex = (currentCardIndex + 1) % flashcards.length;  // Wraps to zero at end
  
    setCurrentCardIndex(nextIndex);
    setFrenchInput('');
    setEnglishInput('');
    setShowFrenchAnswer(false);
    setShowEnglishAnswer(false);
    setIsFrenchCorrect(null);
    setIsEnglishCorrect(null);
    setCurrentInputMode('french');
  
    // Focus on the French input again
    setTimeout(() => {
      if (frenchInputRef.current) {
        frenchInputRef.current.focus();
      }
    }, 100);
  
    // Speak the next French word
    speakFrenchWord(flashcards[nextIndex].french);
  };
  
  
  // Save stats to a CSV file
  const saveStats = () => {
    const csvData = stats.map((stat) => ({
      English: stat.english,
      French: stat.french,
      FrenchCorrect: stat.frenchCorrect,
      FrenchIncorrect: stat.frenchIncorrect,
      EnglishCorrect: stat.englishCorrect,
      EnglishIncorrect: stat.englishIncorrect,
      FrenchNetScore: stat.frenchCorrect - stat.frenchIncorrect,
      EnglishNetScore: stat.englishCorrect - stat.englishIncorrect
    }));
    
    const csv = Papa.unparse(csvData);
    const now = new Date();
    const dateTimeString = now.toISOString().replace(/[:.]/g, '-');
    const fileName = `${dateTimeString}_expressions.csv`;
    
    // Create and download CSV file
    downloadFile(csv, fileName, 'text/csv');
    
    // Also generate HTML content for saving
    const htmlContent = generateChartHtml(dateTimeString);
    const htmlFileName = `${dateTimeString}_performance.html`;
    downloadFile(htmlContent, htmlFileName, 'text/html');
    
    return dateTimeString;
  };
  
  // Helper function to download a file
  const downloadFile = (content, fileName, contentType) => {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  
  // Generate HTML file with chart
  const generateChartHtml = (dateTimeString) => {
    const data = getPerformanceData();
    
    // Create a simple HTML template with embedded chart data
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>French Flashcard Performance - ${dateTimeString}</title>
  <script src="https://unpkg.com/react@17/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/recharts@2.1.9/umd/Recharts.min.js"></script>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
    .container { max-width: 1000px; margin: 0 auto; }
    .chart-container { height: 500px; margin-bottom: 30px; }
    .summary { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 30px; }
    .summary-card { padding: 15px; border-radius: 8px; }
    .card-title { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
    .card-subtitle { font-size: 14px; color: #666; }
    h1, h2 { color: #333; }
    .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <h1>French Flashcard Performance Report</h1>
    <p>Generated on: ${new Date().toLocaleString()}</p>
    
    <div id="chart" class="chart-container"></div>
    
    <h2>Summary Statistics</h2>
    <div class="summary">
      <div class="summary-card" style="background-color: #e6f7ff;">
        <div class="card-title">${data.reduce((sum, item) => sum + item.frenchCorrect + item.englishCorrect, 0)}</div>
        <div class="card-subtitle">Total Correct Answers</div>
      </div>
      <div class="summary-card" style="background-color: #fff2e6;">
        <div class="card-title">${data.reduce((sum, item) => sum + item.frenchIncorrect + item.englishIncorrect, 0)}</div>
        <div class="card-subtitle">Total Incorrect Answers</div>
      </div>
      <div class="summary-card" style="background-color: #e6ffe6;">
        <div class="card-title">${Math.round((data.reduce((sum, item) => sum + item.frenchCorrect + item.englishCorrect, 0) / 
          (data.reduce((sum, item) => sum + item.frenchCorrect + item.frenchIncorrect + item.englishCorrect + item.englishIncorrect, 0) || 1)) * 100)}%</div>
        <div class="card-subtitle">Overall Accuracy Rate</div>
      </div>
      <div class="summary-card" style="background-color: #f2e6ff;">
        <div class="card-title">${data.length}</div>
        <div class="card-subtitle">Expressions Practiced</div>
      </div>
    </div>
    
    <h2>Detailed Results</h2>
    <table border="1" style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background-color: #f2f2f2;">
          <th style="padding: 8px; text-align: left;">French Expression</th>
          <th style="padding: 8px; text-align: left;">English Translation</th>
          <th style="padding: 8px; text-align: center;">French Correct</th>
          <th style="padding: 8px; text-align: center;">French Incorrect</th>
          <th style="padding: 8px; text-align: center;">English Correct</th>
          <th style="padding: 8px; text-align: center;">English Incorrect</th>
          <th style="padding: 8px; text-align: center;">French Net Score</th>
          <th style="padding: 8px; text-align: center;">English Net Score</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(item => `
        <tr>
          <td style="padding: 8px;">${item.fullExpression}</td>
          <td style="padding: 8px;">${item.englishTranslation}</td>
          <td style="padding: 8px; text-align: center;">${item.frenchCorrect}</td>
          <td style="padding: 8px; text-align: center;">${item.frenchIncorrect}</td>
          <td style="padding: 8px; text-align: center;">${item.englishCorrect}</td>
          <td style="padding: 8px; text-align: center;">${item.englishIncorrect}</td>
          <td style="padding: 8px; text-align: center; ${item.frenchNetScore > 0 ? 'color: green;' : item.frenchNetScore < 0 ? 'color: red;' : ''}">${item.frenchNetScore}</td>
          <td style="padding: 8px; text-align: center; ${item.englishNetScore > 0 ? 'color: green;' : item.englishNetScore < 0 ? 'color: red;' : ''}">${item.englishNetScore}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
    
    <div class="footer">
      Generated by French Flashcard App
    </div>
  </div>

  <script>
    // Chart data
    const data = ${JSON.stringify(data)};
    
    // Create the chart
    const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = Recharts;
    
    const renderChart = () => {
      ReactDOM.render(
        React.createElement(ResponsiveContainer, { width: '100%', height: '100%' },
          React.createElement(BarChart, { 
            data: data,
            margin: { top: 20, right: 30, left: 20, bottom: 70 } 
          },
            React.createElement(CartesianGrid, { strokeDasharray: '3 3' }),
            React.createElement(XAxis, { 
              dataKey: 'name', 
              angle: -45, 
              textAnchor: 'end',
              height: 100
            }),
            React.createElement(YAxis, { 
              label: { value: 'Net Score', angle: -90, position: 'insideLeft' } 
            }),
            React.createElement(Tooltip),
            React.createElement(Legend),
            React.createElement(Bar, { 
              dataKey: 'frenchNetScore', 
              name: 'French Net Score',
              fill: '#8884d8'
            }),
            React.createElement(Bar, { 
              dataKey: 'englishNetScore', 
              name: 'English Net Score',
              fill: '#82ca9d'
            })
          )
        ),
        document.getElementById('chart')
      );
    };
    
    // Initialize the chart when the page loads
    window.onload = renderChart;
  </script>
</body>
</html>
    `;
    
    return htmlContent;
  };
  
  const getBubbleChartData = () => {
    const filteredStats = stats.filter(
      (stat) =>
        stat.frenchCorrect +
        stat.frenchIncorrect +
        stat.englishCorrect +
        stat.englishIncorrect >
        0
    );
  
    const frenchData = filteredStats.map((stat) => ({
      word: stat.french,
      translation: stat.english,
      totalAttempts: stat.frenchCorrect + stat.frenchIncorrect,
      netScore: stat.frenchCorrect - stat.frenchIncorrect,
    }));
  
    const englishData = filteredStats.map((stat) => ({
      word: stat.english,
      translation: stat.french,
      totalAttempts: stat.englishCorrect + stat.englishIncorrect,
      netScore: stat.englishCorrect - stat.englishIncorrect,
    }));
  
    return { frenchData, englishData };
  };
  
  
  // Prepare performance data for the chart
  const getPerformanceData = () => {
    return stats
      .filter(stat => (stat.frenchCorrect + stat.frenchIncorrect + stat.englishCorrect + stat.englishIncorrect) > 0) // Only include practiced words
      .map(stat => {
        // Truncate long expressions
        const displayText = stat.french.length > 15 
          ? stat.french.substring(0, 15) + '...' 
          : stat.french;
          
        return {
          name: displayText,
          fullExpression: stat.french,
          frenchCorrect: stat.frenchCorrect,
          frenchIncorrect: stat.frenchIncorrect,
          englishCorrect: stat.englishCorrect,
          englishIncorrect: stat.englishIncorrect,
          frenchNetScore: stat.frenchCorrect - stat.frenchIncorrect,
          englishNetScore: stat.englishCorrect - stat.englishIncorrect,
          englishTranslation: stat.english
        };
      })
      .sort((a, b) => a.frenchNetScore - b.frenchNetScore); // Sort by French net score
  };
  
  // Show performance graph
  const showGraph = () => {
    saveStats();
    setShowPerformanceGraph(true);
  };

//   // Then, your useEffects come afterward
// useEffect(() => {
//   const handleEnterKey = (event) => {
//     if (event.key === 'Enter') {
//       if (showEnglishAnswer && !hasCompletedRound) {
//         event.preventDefault();
//         nextCard();
//       } else if (hasCompletedRound) {
//         event.preventDefault();
//         showGraph();
//       }
//     }
//   };

//   window.addEventListener('keydown', handleEnterKey);

//   return () => window.removeEventListener('keydown', handleEnterKey);
// }, [showEnglishAnswer, hasCompletedRound, nextCard, showGraph]);

useEffect(() => {
  const handleEnterKey = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      if (currentInputMode === 'french') {
        if (!showFrenchAnswer) {
          handleFrenchSubmit();  // Check French
        } else {
          // Move explicitly to English
          setCurrentInputMode('english');
          setTimeout(() => englishInputRef.current && englishInputRef.current.focus(), 100);
        }
      } else if (currentInputMode === 'english') {
        if (!showEnglishAnswer) {
          handleEnglishSubmit();  // Check English
        } else {
          nextCard();  // Move to next card after English
        }
      }
    }
  };

  window.addEventListener('keydown', handleEnterKey);
  return () => window.removeEventListener('keydown', handleEnterKey);
}, [
  currentInputMode,
  showFrenchAnswer,
  showEnglishAnswer,
  handleFrenchSubmit,
  handleEnglishSubmit,
  nextCard,
]);

  
  // Go back to home screen
  const goToHomeScreen = () => {
    setIsStarted(false);
    setShowPerformanceGraph(false);
  };
  
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-md shadow-sm">
          <p className="font-medium mb-1">{data.fullExpression}</p>
          <p className="text-sm text-gray-600">Translation: {data.englishTranslation}</p>
          <div className="mt-2 mb-1 border-t pt-2">
            <p className="font-medium">French Performance:</p>
            <p className="text-sm text-green-600">Correct: {data.frenchCorrect}</p>
            <p className="text-sm text-red-600">Incorrect: {data.frenchIncorrect}</p>
            <p className="text-sm font-medium">Net Score: {data.frenchNetScore}</p>
          </div>
          <div className="mt-2 border-t pt-2">
            <p className="font-medium">English Performance:</p>
            <p className="text-sm text-green-600">Correct: {data.englishCorrect}</p>
            <p className="text-sm text-red-600">Incorrect: {data.englishIncorrect}</p>
            <p className="text-sm font-medium">Net Score: {data.englishNetScore}</p>
          </div>
          <p className="text-sm text-gray-600 mt-2 border-t pt-2">
            Total Attempts: {data.frenchCorrect + data.frenchIncorrect + data.englishCorrect + data.englishIncorrect}
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className={`mx-auto bg-white rounded-xl shadow-md overflow-hidden ${showPerformanceGraph ? 'max-w-4xl' : 'max-w-md md:max-w-2xl'}`}>
        <div className="p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">French Flashcard App</h1>
            
            {showPerformanceGraph ? (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Performance Summary</h2>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="text-lg font-medium text-gray-700 mb-3">Performance by Expression</h3>
                  <p className="text-gray-600 mb-4">
                    The chart below shows your net score (correct - incorrect) for each expression you practiced.
                  </p>
                  
                  <div className="w-full h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getPerformanceData()}
                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45} 
                          textAnchor="end"
                          interval={0}
                          height={100}
                        />
                        <YAxis 
                          label={{ value: 'Net Score', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar 
                          dataKey="frenchNetScore" 
                          name="French Net Score"
                          fill="#8884d8"
                          barSize={20}
                        />
                        <Bar 
                          dataKey="englishNetScore" 
                          name="English Net Score"
                          fill="#82ca9d"
                          barSize={20}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="w-full h-[800px] my-8 bg-white p-4 rounded-lg shadow-md">
  <h3 className="text-xl font-semibold mb-4">Attempts per Word (French & English)</h3>
  <Plot
    data={[
      {
        x: getBubbleChartData().frenchData.map((d) => d.word),
        y: getBubbleChartData().frenchData.map((d) => d.netScore),
        text: getBubbleChartData().frenchData.map(
          (d) =>
            `${d.word} (${d.translation})<br>Attempts: ${d.totalAttempts}<br>Net Score: ${d.netScore}`
        ),
        mode: 'markers',
        marker: {
          size: getBubbleChartData().frenchData.map((d) => d.totalAttempts * 5),
          color: getBubbleChartData().frenchData.map((d) => d.totalAttempts),
          colorscale: 'Portland',
          showscale: true,
          colorbar: { title: 'Attempts (French)' },
          opacity: 0.8,
          line: { width: 1, color: '#444' },
        },
        name: 'French Guesses',
        xaxis: 'x1',
        yaxis: 'y1',
      },
      {
        x: getBubbleChartData().englishData.map((d) => d.word),
        y: getBubbleChartData().englishData.map((d) => d.netScore),
        text: getBubbleChartData().englishData.map(
          (d) =>
            `${d.word} (${d.translation})<br>Attempts: ${d.totalAttempts}<br>Net Score: ${d.netScore}`
        ),
        mode: 'markers',
        marker: {
          size: getBubbleChartData().englishData.map((d) => d.totalAttempts * 5),
          color: getBubbleChartData().englishData.map((d) => d.totalAttempts),
          colorscale: 'Jet',
          showscale: true,
          colorbar: { title: 'Attempts (English)' },
          opacity: 0.8,
          line: { width: 1, color: '#444' },
        },
        name: 'English Guesses',
        xaxis: 'x2',
        yaxis: 'y2',
      },
    ]}
    layout={{
      grid: { rows: 2, columns: 1, pattern: 'independent', roworder: 'top to bottom' },
      xaxis: { title: 'French Words', tickangle: -45 },
      yaxis: { title: 'Net Score (French guesses)' },
      xaxis2: { title: 'English Words', tickangle: -45 },
      yaxis2: { title: 'Net Score (English guesses)' },
      margin: { l: 60, r: 20, t: 60, b: 120 },
      hovermode: 'closest',
      height: 800,
      title: 'Net Score per Word (French & English guesses)',
    }}
    style={{ width: '100%', height: '100%' }}
    useResizeHandler
  />
</div>



                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-700 mb-3">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {(() => {
                      const data = getPerformanceData();
                      return (
                        <>
                          <div className="bg-blue-50 p-4 rounded-md">
                            <p className="text-xl font-medium text-blue-800">{data.reduce((sum, item) => sum + item.frenchCorrect + item.englishCorrect, 0)}</p>
                            <p className="text-sm text-blue-600">Total Correct</p>
                          </div>
                          <div className="bg-orange-50 p-4 rounded-md">
                            <p className="text-xl font-medium text-orange-800">{data.reduce((sum, item) => sum + item.frenchIncorrect + item.englishIncorrect, 0)}</p>
                            <p className="text-sm text-orange-600">Total Incorrect</p>
                          </div>
                          <div className="bg-green-50 p-4 rounded-md">
                            <p className="text-xl font-medium text-green-800">
                              {Math.round((data.reduce((sum, item) => sum + item.frenchCorrect + item.englishCorrect, 0) / 
                                (data.reduce((sum, item) => sum + item.frenchCorrect + item.frenchIncorrect + item.englishCorrect + item.englishIncorrect, 0) || 1)) * 100)}%
                            </p>
                            <p className="text-sm text-green-600">Accuracy Rate</p>
                          </div>
                          <div className="bg-purple-50 p-4 rounded-md">
                            <p className="text-xl font-medium text-purple-800">{data.length}</p>
                            <p className="text-sm text-purple-600">Words Practiced</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
                
                <div className="mt-6 flex space-x-4">
                  <button
                    onClick={goToHomeScreen}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-md transition duration-200"
                  >
                    Return to Home
                  </button>
                  <button
                    onClick={() => {
                      const timestamp = saveStats();
                      alert(`Reports saved to:\n- ${timestamp}_expressions.csv\n- ${timestamp}_performance.html`);
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-md transition duration-200"
                  >
                    Download Reports
                  </button>
                </div>
              </div>
            ) : !isStarted ? (
              <div>
                {file ? (
                  <div className="mb-6">
                    <p className="text-green-600 font-medium mb-2">✓ File loaded: {file.name}</p>
                    <p className="text-gray-600 mb-4">{flashcards.length} expressions loaded</p>
                    
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <h2 className="text-lg font-semibold text-gray-700 mb-3">Select Study Mode</h2>
                      <div className="grid grid-cols-1 gap-3">
                        <button
                          onClick={() => startSession('topToBottom')}
                          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition duration-200"
                        >
                          Top to Bottom
                        </button>
                        <button
                          onClick={() => startSession('bottomToTop')}
                          className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-md transition duration-200"
                        >
                          Bottom to Top
                        </button>
                        <button
                          onClick={() => startSession('random')}
                          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition duration-200"
                        >
                          Random Order
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6">
                    <p className="text-gray-600 mb-4">Upload a CSV file with English and French translations</p>
                    <button 
                      onClick={() => fileInputRef.current.click()}
                      className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition duration-200"
                    >
                      Select File
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".csv"
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            ) : hasCompletedRound ? (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Session Complete!</h2>
                <p className="text-gray-600 mb-6">You've completed all {flashcards.length} expressions.</p>
                
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={() => startSession(currentMode)}
                    className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition duration-200"
                  >
                    Restart Session
                  </button>
                  <button
                    onClick={showGraph}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition duration-200"
                  >
                    View Performance Graph
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Card {currentCardIndex + 1} of {flashcards.length}
                    </h2>
                    <span className="text-sm text-gray-500">
                      Mode: {currentMode === 'topToBottom' ? 'Top to Bottom' : 
                             currentMode === 'bottomToTop' ? 'Bottom to Top' : 'Random'}
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg mb-6">
                    {currentInputMode === 'french' ? (
                      <div>
                        <p className="text-gray-700 mb-2">Listen and type the French expression:</p>
                        <button 
                          onClick={() => speakFrenchWord(flashcards[currentCardIndex].french)}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 py-1 px-3 rounded-md mb-4 transition duration-200"
                        >
                          Play Again 🔊
                        </button>
                        
                        <form onSubmit={handleFrenchSubmit}>
                          <input
                            type="text"
                            ref={frenchInputRef}
                            value={frenchInput}
                            onChange={(e) => setFrenchInput(e.target.value)}
                            placeholder="Type the French expression..."
                            className="w-full p-2 mb-3 border rounded-md"
                            disabled={showFrenchAnswer}
                          />
                          
                          {!showFrenchAnswer && (
                            <button
                              type="submit"
                              onClick={handleFrenchSubmit}
                              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition duration-200"
                            >
                              Check French
                            </button>
                          )}
                        </form>
                        
                        {showFrenchAnswer && (
                          <div className={`p-3 rounded-md mb-4 ${isFrenchCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            <p className="font-medium text-lg">{isFrenchCorrect ? 'Correct! ✓' : 'Incorrect ✗'}</p>
                            <p>The correct French expression is:</p>
                            <p className="font-bold mt-1 text-lg">{flashcards[currentCardIndex].french}</p>
                          </div>
                        )}
                        {showFrenchAnswer && currentInputMode === 'french' && (
  <button
    onClick={() => {
      setCurrentInputMode('english');
      setTimeout(() => {
        if (englishInputRef.current) englishInputRef.current.focus();
      }, 100);
    }}
    className="mt-4 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition duration-200"
  >
    To Translation →
  </button>
)}

                      </div>
                    ) : (
                      <div>
                        <p className="text-gray-700 mb-2">Now type the English translation:</p>
                        <p className="text-lg font-semibold text-gray-800 mb-4">{flashcards[currentCardIndex].french}</p>
                        
                        <form onSubmit={handleEnglishSubmit}>
                          <input
                            type="text"
                            ref={englishInputRef}
                            value={englishInput}
                            onChange={(e) => setEnglishInput(e.target.value)}
                            placeholder="Type the English translation..."
                            className="w-full p-2 mb-3 border rounded-md"
                            disabled={showEnglishAnswer}
                          />
                          
                          {!showEnglishAnswer && (
                            <button
                              type="submit"
                              onClick={handleEnglishSubmit}
                              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition duration-200"
                            >
                              Check English
                            </button>
                          )}
                        </form>
                        
                        {showEnglishAnswer && (
                          <div className={`p-3 rounded-md mb-4 ${isEnglishCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            <p className="font-medium">{isEnglishCorrect ? 'Correct! ✓' : 'Incorrect ✗'}</p>
                            <p>The correct English translation is:</p>
                            <p className="font-bold mt-1">{flashcards[currentCardIndex].english}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between">
                    {showEnglishAnswer && (
                      <button
                        onClick={nextCard}
                        className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-md transition duration-200"
                      >
                        Next Card →
                      </button>
                    )}
                    
                    <button
                      onClick={showGraph}
                      className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition duration-200 ml-auto"
                    >
                      End Session
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  
  

  );
};

export default App;