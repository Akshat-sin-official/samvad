@echo off
echo Starting Autonomous BRD Development Environment...
echo.

start cmd /k "cd backend && echo Activating Python environment... && python -m venv venv && call venv\Scripts\activate && echo Installing dependencies... && pip install -r requirements.txt && echo Starting Backend Server... && cd .. && uvicorn backend.main:app --reload --port 8080"
start cmd /k "cd frontend && echo Starting Frontend Server... && npm run dev"

echo Development environment started!
echo Backend:   http://localhost:8080
echo Frontend:  http://localhost:5173
echo.
pause
