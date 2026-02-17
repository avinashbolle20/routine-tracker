from app import create_app

app = create_app('development')

if __name__ == '__main__':
    print("Starting server on http://localhost:5000")
    print("API endpoints:")
    print("  POST /api/auth/register - Register new user")
    print("  POST /api/auth/login - Login")
    print("  GET  /api/health - Health check")
    app.run(host='0.0.0.0', port=5000, debug=True)