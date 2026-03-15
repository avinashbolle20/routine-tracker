@echo off
echo Setting up Routine Tracker for Windows...

:: Backend setup
echo Setting up backend...
cd backend

:: Create virtual environment
python -m venv venv

:: Activate virtual environment
call venv\Scripts\activate.bat

:: Install dependencies
pip install -r requirements.txt

:: Remove old database if exists
if exist routine_tracker.db del routine_tracker.db
if exist migrations rmdir /s /q migrations

:: Initialize database
flask db init
flask db migrate -m "Initial migration"
flask db upgrade

echo Backend setup complete!

:: Frontend setup
echo Setting up frontend...
cd ..\frontend

:: Clean and reinstall
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

npm install
npm install -D tailwindcss postcss autoprefixer

:: Initialize Tailwind config
npx tailwindcss init -p

echo.
echo ==========================================
echo Setup complete!
echo.
echo To start the application:
echo 1. Backend: cd backend ^&^& venv\Scripts\activate.bat ^&^& python run.py
echo 2. Frontend: cd frontend ^&^& npm run dev
echo.
echo Then open http://localhost:5173 in your browser
echo ==========================================
pause