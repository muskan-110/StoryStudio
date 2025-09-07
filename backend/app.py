from flask import Flask
from flask_cors import CORS
from routes.story_routes import story_bp
from routes.image_routes import image_bp  # renamed to image_bp
from routes.scene_routes import scene_bp
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Enable CORS
CORS(app)

# Register routes
app.register_blueprint(story_bp, url_prefix="/story")
app.register_blueprint(image_bp, url_prefix="/api")
app.register_blueprint(scene_bp, url_prefix="/scene")
if __name__ == "__main__":
    if not os.getenv("COHERE_API_KEY"):
        raise ValueError("⚠️ Please set COHERE_API_KEY in your .env file.")
    print("✅ COHERE_API_KEY found. App starting...")
    app.run(debug=True)

