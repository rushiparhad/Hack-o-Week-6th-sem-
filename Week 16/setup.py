"""
Quick setup script for Windows users
Run this to start the entire application
"""

import os
import sys
import subprocess
import time

def run_command_in_new_terminal(command, title):
    """Run a command in a new terminal window"""
    if sys.platform == "win32":
        # Windows CMD
        full_command = f'start "{title}" cmd /k {command}'
        os.system(full_command)
    else:
        # For other OS
        print(f"Please run in terminal: {command}")

def main():
    print("""
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║    🏥  Real-Time Alert System Dashboard - Auto Setup          ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
    """)

    # Get the current directory
    base_path = os.path.dirname(os.path.abspath(__file__))
    backend_path = os.path.join(base_path, "backend")
    frontend_path = os.path.join(base_path, "frontend")

    # Check if directories exist
    if not os.path.exists(backend_path):
        print("❌ Backend directory not found!")
        return
    if not os.path.exists(frontend_path):
        print("❌ Frontend directory not found!")
        return

    print("✅ Directories found")
    print(f"📁 Backend: {backend_path}")
    print(f"📁 Frontend: {frontend_path}")
    print()

    # Install backend dependencies
    print("📦 Installing backend dependencies...")
    os.chdir(backend_path)
    if os.system("npm install") != 0:
        print("❌ Failed to install backend dependencies")
        return
    print("✅ Backend dependencies installed")
    print()

    # Install frontend dependencies  
    print("📦 Installing frontend dependencies...")
    os.chdir(frontend_path)
    if os.system("npm install") != 0:
        print("❌ Failed to install frontend dependencies")
        return
    print("✅ Frontend dependencies installed")
    print()

    # Start backend
    print("🚀 Starting backend server...")
    backend_cmd = f"cd {backend_path} && npm start"
    run_command_in_new_terminal(backend_cmd, "Alert System - Backend")
    print("✅ Backend started in new terminal")
    print()

    # Wait a bit for backend to start
    print("⏳ Waiting for backend to start (5 seconds)...")
    time.sleep(5)

    # Start frontend
    print("🚀 Starting frontend...")
    frontend_cmd = f"cd {frontend_path} && npm run dev"
    run_command_in_new_terminal(frontend_cmd, "Alert System - Frontend")
    print("✅ Frontend started in new terminal")
    print()

    print("""
╔════════════════════════════════════════════════════════════════╗
║                   🎉 Setup Complete!                          ║
║                                                                ║
║  📍 Backend:  http://localhost:5000                           ║
║  📍 Frontend: http://localhost:5173 (should open automatically)║
║                                                                ║
║  ⚠️  Keep both terminal windows open while using the app     ║
║                                                                ║
║  📚 See README.md for full documentation                      ║
╚════════════════════════════════════════════════════════════════╝
    """)

    print("Press any key to close this window...")
    input()

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"❌ Error: {e}")
        print("Please set up manually by following SETUP.md")
