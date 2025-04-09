import React, { useState, useEffect } from 'react';
import './CodingPractice.css';

const CodePractice = () => {
  // Questions state
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [filter, setFilter] = useState('all');
  const [topicFilter, setTopicFilter] = useState('all');
  
  // Code editor state
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Progress tracking
  const [progress, setProgress] = useState({
    easy: { solved: 0, total: 0 },
    medium: { solved: 0, total: 0 },
    hard: { solved: 0, total: 0 }
  });

  // All available topics
  const topics = [
    'Array', 'String', 'Linked List', 'Stack', 'Queue', 
    'Tree', 'BST', 'Graph', 'Heap', 'Sorting', 
    'Searching', 'Dynamic Programming', 'Backtracking',
    'Greedy', 'Divide and Conquer', 'Bit Manipulation',
    'Math', 'Geometry', 'Design', 'Hash Table'
  ];

  // Load questions with 100 problems
  useEffect(() => {
    const mockQuestions = generateMockQuestions();
    setQuestions(mockQuestions);
    
    // Calculate total questions by difficulty
    const easyCount = mockQuestions.filter(q => q.difficulty === 'easy').length;
    const mediumCount = mockQuestions.filter(q => q.difficulty === 'medium').length;
    const hardCount = mockQuestions.filter(q => q.difficulty === 'hard').length;
    
    setProgress({
      easy: { solved: 0, total: easyCount },
      medium: { solved: 0, total: mediumCount },
      hard: { solved: 0, total: hardCount }
    });
  }, []);

  // Set the first question as current when questions load
  useEffect(() => {
    if (questions.length > 0 && !currentQuestion) {
      setCurrentQuestion(questions[0]);
      setCode(questions[0].boilerplate[language] || '');
    }
  }, [questions, currentQuestion, language]);

  // Update code when language or question changes
  useEffect(() => {
    if (currentQuestion) {
      setCode(currentQuestion.boilerplate[language] || '');
    }
  }, [language, currentQuestion]);

  // Filter questions by difficulty and topic
  const filteredQuestions = questions.filter(q => {
    const matchesDifficulty = filter === 'all' || q.difficulty === filter;
    const matchesTopic = topicFilter === 'all' || q.topics.includes(topicFilter);
    return matchesDifficulty && matchesTopic;
  });

  // Handle question selection
  const handleQuestionSelect = (question) => {
    setCurrentQuestion(question);
    setOutput('');
  };

  // Mock run code function
  const handleRun = () => {
    setIsRunning(true);
    setOutput('Running test cases...\n\n');
    
    // Simulate code execution with test case results
    setTimeout(() => {
      let outputText = 'Running test cases...\n\n';
      currentQuestion.testCases.forEach((testCase, index) => {
        const randomSuccess = Math.random() > 0.3;
        outputText += `Test Case ${index + 1}: ${randomSuccess ? '✓ Passed' : '✗ Failed'}\n`;
        outputText += `Input: ${testCase.input}\n`;
        outputText += `Expected Output: ${testCase.output}\n`;
        if (!randomSuccess) {
          outputText += `Your Output: ${testCase.output.replace(/\]/, randomSuccess ? ']' : '1]')}\n`;
        }
        outputText += '\n';
      });
      
      const allPassed = Math.random() > 0.3;
      if (allPassed) {
        outputText += '\nAll test cases passed!';
      } else {
        outputText += '\nSome test cases failed.';
      }
      
      setOutput(outputText);
      setIsRunning(false);
    }, 1500);
  };

  // Mock submit code function
  const handleSubmit = () => {
    setIsSubmitting(true);
    setOutput('Submitting solution...\n\n');
    
    // Simulate submission
    setTimeout(() => {
      const randomSuccess = Math.random() > 0.5;
      let outputText = 'Submitting solution...\n\n';
      
      if (randomSuccess) {
        outputText += '✓ Solution Accepted!\n';
        outputText += `Runtime: ${(Math.random() * 100).toFixed(2)} ms (beats ${(Math.random() * 100).toFixed(0)}%)\n`;
        outputText += `Memory: ${(Math.random() * 50).toFixed(2)} MB (beats ${(Math.random() * 100).toFixed(0)}%)\n`;
        
        // Update progress if not already solved
        if (currentQuestion && !currentQuestion.solved) {
          const difficulty = currentQuestion.difficulty;
          setProgress(prev => ({
            ...prev,
            [difficulty]: {
              ...prev[difficulty],
              solved: prev[difficulty].solved + 1
            }
          }));
          
          // Mark question as solved
          setQuestions(prev => 
            prev.map(q => 
              q.id === currentQuestion.id ? { ...q, solved: true } : q
            )
          );
        }
      } else {
        outputText += '✗ Solution Rejected\n';
        outputText += 'Wrong answer for some test cases\n';
      }
      
      setOutput(outputText);
      setIsSubmitting(false);
    }, 2000);
  };

  // Generate 100 mock questions
  const generateMockQuestions = () => {
    const questionTemplates = [
      {
        title: 'Two Sum',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        difficulty: 'easy',
        topics: ['Array', 'Hash Table'],
        companies: ['Amazon', 'Google', 'Adobe', 'Apple', 'Microsoft'],
        examples: [
          {
            input: 'nums = [2,7,11,15], target = 9',
            output: '[0,1]',
            explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
          }
        ],
        testCases: [
          { input: '[2,7,11,15], 9', output: '[0,1]' },
          { input: '[3,2,4], 6', output: '[1,2]' }
        ],
        boilerplate: {
          javascript: 'function twoSum(nums, target) {\n  // Your code here\n};',
          python: 'def twoSum(nums, target):\n    # Your code here\n    pass'
        }
      },
      // More templates...
    ];

    const allQuestions = [];
    const difficulties = ['easy', 'medium', 'hard'];
    const companiesList = [
      'Amazon', 'Google', 'Microsoft', 'Facebook', 'Apple',
      'Adobe', 'Netflix', 'Uber', 'Twitter', 'LinkedIn',
      'Goldman Sachs', 'JPMorgan', 'Bloomberg', 'Oracle', 'Salesforce'
    ];

    // Generate 100 questions by varying the templates
    for (let i = 1; i <= 100; i++) {
      const template = questionTemplates[i % questionTemplates.length];
      const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
      const companyCount = Math.floor(Math.random() * 5) + 1;
      const companies = [];
      
      for (let j = 0; j < companyCount; j++) {
        const randomCompany = companiesList[Math.floor(Math.random() * companiesList.length)];
        if (!companies.includes(randomCompany)) {
          companies.push(randomCompany);
        }
      }

      allQuestions.push({
        id: i,
        title: `${template.title} ${i}`,
        description: template.description,
        difficulty,
        topics: [...template.topics],
        companies,
        examples: [...template.examples],
        testCases: [
          { input: '[2,7,11,15], 9', output: '[0,1]' },
          { input: '[3,2,4], 6', output: '[1,2]' }
        ],
        boilerplate: {
          javascript: `function solution${i}(input) {\n  // Your code here\n};`,
          python: `def solution${i}(input):\n    # Your code here\n    pass`
        }
      });
    }

    return allQuestions;
  };

  return (
    <div className="code-practice-container">
      <div className="header">
        <h1>Code Practice</h1>
        <div className="progress-summary-header">
          <div className="progress-item">
            <span>Total: {questions.length}</span>
          </div>
          <div className="progress-item easy">
            <span>Easy: {progress.easy.solved}/{progress.easy.total}</span>
          </div>
          <div className="progress-item medium">
            <span>Medium: {progress.medium.solved}/{progress.medium.total}</span>
          </div>
          <div className="progress-item hard">
            <span>Hard: {progress.hard.solved}/{progress.hard.total}</span>
          </div>
        </div>
      </div>
      
      <div className="main-content">
        {/* Left sidebar - Questions list */}
        <div className="questions-sidebar">
          <div className="filters-container">
            <div className="difficulty-filters">
              <h4>Difficulty:</h4>
              <button 
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button 
                className={`filter-btn ${filter === 'easy' ? 'active' : ''}`}
                onClick={() => setFilter('easy')}
              >
                Easy
              </button>
              <button 
                className={`filter-btn ${filter === 'medium' ? 'active' : ''}`}
                onClick={() => setFilter('medium')}
              >
                Medium
              </button>
              <button 
                className={`filter-btn ${filter === 'hard' ? 'active' : ''}`}
                onClick={() => setFilter('hard')}
              >
                Hard
              </button>
            </div>
            
            <div className="topic-filter">
              <h4>Topics:</h4>
              <select
                value={topicFilter}
                onChange={(e) => setTopicFilter(e.target.value)}
                className="topic-selector"
              >
                <option value="all">All Topics</option>
                {topics.map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="questions-list">
            {filteredQuestions.map(question => (
              <div 
                key={question.id}
                className={`question-item ${currentQuestion?.id === question.id ? 'active' : ''} ${question.solved ? 'solved' : ''}`}
                onClick={() => handleQuestionSelect(question)}
              >
                <div className="question-title-container">
                  <span className="question-title">{question.title}</span>
                  <span className={`difficulty-badge ${question.difficulty}`}>
                    {question.difficulty}
                  </span>
                  {question.solved && <span className="solved-checkmark">✓</span>}
                </div>
                <div className="question-meta">
                  <span className="question-topics">
                    {question.topics.join(', ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Middle section - Question description */}
        <div className="question-section">
          {currentQuestion ? (
            <>
              <div className="question-header">
                <h2>{currentQuestion.title}</h2>
                <div className="question-tags">
                  <span className={`difficulty-badge ${currentQuestion.difficulty}`}>
                    {currentQuestion.difficulty}
                  </span>
                  {currentQuestion.topics.map(topic => (
                    <span key={topic} className="topic-tag">{topic}</span>
                  ))}
                </div>
              </div>
              
              <div className="question-description">
                <p>{currentQuestion.description}</p>
                
                {currentQuestion.examples.map((example, index) => (
                  <div key={index} className="example">
                    <h4>Example {index + 1}:</h4>
                    <div className="example-io">
                      <div className="input">
                        <strong>Input:</strong> {example.input}
                      </div>
                      <div className="output">
                        <strong>Output:</strong> {example.output}
                      </div>
                      {example.explanation && (
                        <div className="explanation">
                          <strong>Explanation:</strong> {example.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                <div className="constraints">
                  <h4>Constraints:</h4>
                  <ul>
                    <li>2 ≤ nums.length ≤ 10<sup>4</sup></li>
                    <li>-10<sup>9</sup> ≤ nums[i] ≤ 10<sup>9</sup></li>
                    <li>-10<sup>9</sup> ≤ target ≤ 10<sup>9</sup></li>
                    <li>Only one valid answer exists.</li>
                  </ul>
                </div>
                
                <div className="companies-asked">
                  <h4>Asked by:</h4>
                  <div className="company-tags">
                    {currentQuestion.companies.map(company => (
                      <span key={company} className="company-tag">{company}</span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="no-question-selected">
              <p>Select a question from the sidebar to begin</p>
            </div>
          )}
        </div>
        
        {/* Right section - Code editor and output */}
        <div className="code-section">
          <div className="code-header">
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="language-selector"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
            </select>
            
            <div className="question-stats">
              <span>Acceptance: {Math.floor(Math.random() * 30) + 50}%</span>
              <span>Submissions: {Math.floor(Math.random() * 10000)}</span>
            </div>
          </div>
          
          <div className="code-editor">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck="false"
            />
          </div>
          
          <div className="output-console">
            <div className="console-tabs">
              <button className="console-tab active">Test Results</button>
              <button className="console-tab">Submission</button>
            </div>
            <pre>{output || 'Run your code to see output here...'}</pre>
          </div>
          
          <div className="action-buttons">
            <button 
              onClick={handleRun} 
              disabled={isRunning || isSubmitting}
              className="run-button"
            >
              {isRunning ? 'Running...' : 'Run'}
            </button>
            <button 
              onClick={handleSubmit} 
              disabled={isRunning || isSubmitting}
              className="submit-button"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodePractice;