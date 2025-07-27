## Project Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/hd77alu/techmap.git
   cd techmap
   ```
2. **Switch to the frontend branch:**
   ```bash
   git checkout techmapfront
   ```

3. **Configure environment variables**
- Make sure the `.env` part of the gitignore file or delete it when you are done
- Create a `.env` file in `backend/` with:

   ```env
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   SESSION_SECRET=your_session_secret
   ```

4. **Install backend dependencies**

   ```bash
   npm install
   ```

5. **Initialize and seed the database**

   ```bash
   npm run setup
   ```

6. **Start the server**

   ```bash
   npm start
   ```

7. **Open the url**
 Open your browser at `http://localhost:3000`.

---

8. **login using Google to see the sample data**


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

## 2. Git Workflow & Best Practices

- **Always work on the `techmapfront` branch or a feature branch based off it.**
- **Before starting work each day:**
  ```bash
  git checkout techmapfront
  git pull origin techmapfront
  git pull origin main  # To get backend updates
  ```
- **If needed create a feature branch for features:**
  ```bash
  git checkout -b feature-name
  ```

- **Commit messages:** Use clear, conventional commit messages.

---

## Conflict Avoidance & Resolution

- **Always pull the latest changes before starting work and before pushing.**
- **Communicate with your teammate about what you are working on.**
- **If you encounter a conflict:**
- **Never force-push to shared branches.**

---

## Quality & Testing

- Test on Chrome, Firefox, and mobile viewports.
- Ensure responsive design and accessibility.

---

**Final Notes:**
- Always work on a branch (`techmapfront` or feature branch).
- Pull latest changes before starting and before pushing.
- Communicate regularly to avoid duplicate work and conflicts.
- Use clear commit messages and review code before merging.