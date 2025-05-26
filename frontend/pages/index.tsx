import React, { useState, useEffect } from 'react';

interface AnalysisResult {
  url: string;
  status_code: number;
  load_time: number;
  title: string;
  meta_tags: Record<string, string>;

  issues: {
    type: string;
    severity: 'high' | 'medium' | 'low';
    description: string;
    recommendation: string;
  }[];
}

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [captchaId, setCaptchaId] = useState('');
  const [captchaImageUrl, setCaptchaImageUrl] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');

  useEffect(() => {
    const loadCaptcha = async () => {
      try {
        const res = await fetch('/api/captcha');
        const data = await res.json();
        setCaptchaId(data.captcha_id);
        setCaptchaImageUrl(data.captcha_svg);
      } catch (err) {
        setError('Failed to load CAPTCHA');
      }
    };

    loadCaptcha();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          captcha_id: captchaId,
          captcha_answer: captchaAnswer.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to analyze URL');

        // Reload CAPTCHA
        const newCaptcha = await fetch('/api/captcha');
        const newCaptchaData = await newCaptcha.json();
        setCaptchaId(newCaptchaData.captcha_id);
        setCaptchaImageUrl(newCaptchaData.captcha_svg);
        return;
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setResult(null);
    setUrl('');
    setCaptchaAnswer('');
    setError(null);

    // Refresh CAPTCHA
    try {
      const res = await fetch('/api/captcha');
      const data = await res.json();
      setCaptchaId(data.captcha_id);
      setCaptchaImageUrl(data.captcha_svg);
    } catch {
      setError('Failed to reload CAPTCHA');
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>SEO Analysis Tool</h1>
      </header>

      <div className="input-container">
        <form onSubmit={handleSubmit}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL to analyze"
            required
            className="url-input"
            disabled={!!result} // disable after success
          />

          {!result && (
            <div className="captcha-container">
              <label>Enter the text from the image:</label>
              <br />
              {captchaImageUrl && (
                <img
                  src={captchaImageUrl}
                  alt="CAPTCHA"
                  className="captcha-image"
                />
              )}
              <input
                type="text"
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                required
                className="captcha-input"
                placeholder="Enter CAPTCHA"
              />
            </div>
          )}

          {!result ? (
            <button type="submit" disabled={loading} className="analyze-button">
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              className="analyze-button"
            >
              Analyze Another URL
            </button>
          )}
        </form>
      </div>

      {error && <div className="error-message">{error}</div>}

      {result && (
        <div className="results">
          <h2>Analysis Results</h2>

          <div className="page-info">
            <h3>Page Information</h3>
            <p>
              <strong>URL:</strong> {result.url}
            </p>
            <p>
              <strong>Status Code:</strong> {result.status_code}
            </p>
            <p>
              <strong>Load Time:</strong> {result.load_time.toFixed(2)}s
            </p>
            <p>
              <strong>Title:</strong> {result.title}
            </p>
          </div>

          <div className="meta-tags">
            <h3>Meta Tags</h3>
            {Object.keys(result.meta_tags).length > 0 ? (
              <ul>
                {Object.entries(result.meta_tags).map(
                  ([name, content], index) => (
                    <li key={index}>
                      <strong>{name}:</strong> {content}
                    </li>
                  ),
                )}
              </ul>
            ) : (
              <p>No meta tags found</p>
            )}
          </div>

          <div className="issues">
            <h3>SEO Issues</h3>
            {result.issues.length > 0 ? (
              <ul>
                {result.issues.map((issue, index) => (
                  <li key={index} className={`issue ${issue.severity}`}>
                    <div className="issue-type">
                      <strong>Issue Type:</strong> {issue.type}
                    </div>
                    <div className="issue-message">
                      <strong>Issue:</strong> {issue.description}
                    </div>

                    <div className="issue-recommendation">
                      <strong>Recommendation:</strong> {issue.recommendation}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No issues found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
