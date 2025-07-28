# Techmap: Personalized Career Readiness Platform

Techmap is a responsive web application designed to empower Software Engineering students by bridging the gap between academic learning and industry demand. Through personalized learning-style assessments, curated resource recommendations, trend visualizations, and a simple resume-analysis tool, Techmap helps students optimize their skill development and increase their employability.

---

## Usage
Go to [Render](https://techmap-sy4z.onrender.com/)
& Watch This [Demo Video](https://screenrec.com/share/XZctJCGTUW)

---
## 🚀 Key Features

* **Google OAuth 2.0 Authentication**
  Seamless user registration and login with Google Sign-In, plus profile creation and session management.

* **Learning Style Assessment**
  Interactive quiz that captures each student’s preferred learning modality (Visual, Auditory, Kinesthetic, Reading/Writing) and stores results to tailor recommendations.

* **Personalized Resource Recommendations**
  Dynamic filtering of tutorials, articles, and courses based on recorded learning styles and technical interests.

* **Industry Project Listings**
  Pre-defined, GitHub-linked project ideas categorized by domain (FinTech, Healthcare, Gaming, Data Science) to inspire real-world practice.

* **Trends Dashboard**
  Simple bar and pie charts displaying trending programming languages, frameworks, and job roles sourced from pre-curated JSON data.

* **Visual Board**
  A board to Visualize and track your tech career goals.

* **Basic Resume Analysis**
  Keyword-based parsing of pasted or uploaded CV text to suggest relevant projects or skills directly from the project database.

---

## 🛠️ Technology Stack

| Layer           | Technologies                               |
| --------------- | ------------------------------------------ |
| **Backend**     | Node.js, Express.js, Passport Google-OAuth |
| **Database**    | SQLite3                                    |
| **Frontend**    | HTML5, Tailwind CSS, Vanilla JavaScript    |
| **Charting**    | Chart.js (via CDN)                         |
| **Environment** | dotenv, CORS, Express-Session, Body-Parser |

---

## ⚙️ Installation & Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/hd77alu/techmap.git
   cd techmap/Backend
   ```

2. **Install backend dependencies**

   ```bash
   npm install
   ```

3. **Initialize and seed the database**

   ```bash
   npm run setup
   ```
   
   Or run individually:
   ```bash
   npm run init-db    # Create tables
   npm run seed       # Seed CSV data
   ```

4. Google OAuth Setup

A. **Create OAuth Credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to APIs & Services → Credentials
   - Create OAuth 2.0 Client ID for web application

B. **Configure Redirect URIs:**
   - **URI:** `http://localhost:3000/auth/google/callback`

5.  **Configure environment variables**
 Create a `.env` file in `backend/` with:
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   SESSION_SECRET=your_session_secret
   ```
   
7.  **Start the server**

   ```bash
   npm start
   ```

8. **Serve the frontend**
   Open your browser at `http://localhost:3000`.

---

## 📡 API Endpoints

| Route                          | Method | Description                                     |
| ------------------------------ | ------ | ----------------------------------------------- |
| `/auth/google`                 | GET    | Initiate Google OAuth flow                      |
| `/auth/google/callback`        | GET    | Google OAuth callback                           |
| `/auth/logout`                 | GET    | End user session and logout                     |
| `/api/styles`                  | GET    | Retrieve current user’s learning styles         |
| `/api/styles`                  | POST   | Submit a new learning style assessment          |
| `/api/resources?style={style}` | GET    | Fetch resources matching a style                |
| `/api/projects`                | GET    | List all project ideas                          |
| `/api/trends`                  | GET    | Get trending languages, frameworks, and roles   |
| `/api/resume`                  | POST   | Analyze resume text and suggest skills/projects |

---

## 🔍 Database Schema Overview

See `backend/models/init.sql` for full details. Key tables:

* **users**: Stores Google ID, username, email, and last login date.
* **learning\_styles**: Tracks each user’s style with timestamps.
* **resources**: Catalog of learning materials tagged by style and tech.
* **projects**: Pre-defined project ideas with GitHub links.
* **trending\_data**: Static or pre-curated trend scores by category.
* **resume\_data**: Stores raw resume text for keyword analysis.

---

## 🧑‍🤝‍🧑 Contributors & Roles

| Name                    | Email                                                           | Role               |
| ----------------------- | --------------------------------------------------------------- | ------------------ |
| Jesse Kisaale Walusansa | [j.walusansa@alustudent.com](mailto:j.walusansa@alustudent.com) | Backend Engineer   |
| Andrew Ogayo            | [a.ogayo@alustudent.com](mailto:a.ogayo@alustudent.com)         | Backend Engineer   |
| Mathew Ainomugisha      | [m.ainomugis@alustudent.com](mailto:m.ainomugis@alustudent.com) | Backend Engineer   |
| Bakhit Mahamat          | [b.mahamat@alustudent.com](mailto:b.mahamat@alustudent.com)     | Backend Engineer   |
| Hamed Alfatih           | [h.abdalgade@alustudent.com](mailto:h.abdalgade@alustudent.com) | Frontend Developer |
| Phillip Mulindwa        | [p.mulindwa@alustudent.com](mailto:p.mulindwa@alustudent.com)   | Frontend Developer |
| Karabo Divine           | [k.divine@alustudent.com](mailto:k.divine@alustudent.com)       | Frontend Developer |

---

## 📈 Future Enhancements

* Real-time job-board API integration (LinkedIn, Indeed).
* Advanced AI/ML résumé parsing with NLP.
* User-generated resource contribution and project creation.
* Collaborative features and forums.
* Native mobile applications for iOS/Android.

---

*Crafted by The Blueprint Team.*
