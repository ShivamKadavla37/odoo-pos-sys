# Odoo POS Cafe (Hackathon Scaffold)

This project has been restructured! It now holds both the React/Tailwind frontend UI and the FastAPI/Postgres backend infrastructure.

## Stack Overview
| Feature              | Tech Used           |
| -------------------- | ------------------- |
| POS UI               | React               |
| Styling              | Tailwind            |
| API                  | FastAPI             |
| Orders DB            | PostgreSQL          |
| Kitchen Live Updates | WebSockets          |
| UPI QR               | Python QR generator |

---

## 💻 1. Running the Frontend
1. Navigate to the frontend directory:
   \`\`\`bash
   cd frontend
   \`\`\`
2. Install NodeJS dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Run the Vite development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## ⚙️ 2. Running the Backend
1. Navigate to the backend directory:
   \`\`\`bash
   cd backend
   \`\`\`
2. Install Python dependencies:
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`
3. Run the FastAPI development server:
   \`\`\`bash
   uvicorn main:app --reload --port 8000
   \`\`\`

Your backend will boot up at \`http://127.0.0.1:8000\`. Check out \`http://127.0.0.1:8000/docs\` for an interactive swagger interface to test the Python QR generation endpoint!
