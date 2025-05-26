# SEO Analysis Tool

A full-stack web application that analyzes a given website URL for technical SEO issues. It detects missing or misconfigured tags, accessibility issues, and provides clear recommendations to improve your site’s SEO health.

---

## 🔍 What It Does

- Checks for missing or multiple `<title>` and `<h1>` tags
- Detects missing meta descriptions
- Verifies alt and title attributes on images
- Looks for missing canonical tags, favicons, and Open Graph metadata
- Flags `noindex` tags and missing language attributes
- Provides load time and HTTP status
- Includes CAPTCHA validation to prevent abuse

---

## 🧰 Tech Stack

| Layer      | Stack                        |
|------------|------------------------------|
| **Backend**| Node.js + Express            |
| **Frontend**| React (TypeScript)          |
| **CAPTCHA**| `svg-captcha`                |
| **HTML Parsing** | `jsdom`                |
| **Rate Limiting** | `express-rate-limit`  |
| **Unique IDs** | `uuid`                   |

---

## 📁 Project Structure

```
seo-analysis-tool/
├── backend/ # Node.js + Express server
│ ├── server.js
│ └── package.json
├── frontend/ # React frontend app
│ ├── src/
│ └── package.json
└── README.md # This file
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```
git clone https://github.com/your-username/seo-analysis-tool.git
cd seo-analysis-tool
```

---

### 2. Install & Start the Backend

```
cd backend
npm install
npm start
Starts on http://localhost:8000
```

---

### 3. Install & Start the Frontend

```
cd ../frontend
npm install
npm start
Starts on http://localhost:3000
```

---

🛡 CAPTCHA Protection
Before submitting a URL for analysis, users must solve a CAPTCHA to reduce spam and abuse. Each request is tied to a short-lived unique ID and validated server-side.

## 📊 Output

After analysis, users see:

- HTTP status code  
- Load time  
- Title tag  
- Extracted meta tags  
- List of SEO issues with severity and fix recommendations  

## ✅ Example Issues Detected

- Missing or duplicate `<h1>` tags  
- Missing meta description  
- Images without `alt` attributes  
- Missing `lang` attribute on `<html>`  
- Absence of canonical URL or favicon  
- `noindex` directive found  
- Missing Open Graph tags  
