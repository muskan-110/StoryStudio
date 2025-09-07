from flask import Blueprint, request, jsonify
from services.image_service import generate_image
import os

image_bp = Blueprint("image", __name__)

@image_bp.route("/generate_image", methods=["POST"])
def generate_image_route():
    try:
        data = request.json
        prompt = data.get("prompt")
        if not prompt:
            return jsonify({"error": "No prompt provided"}), 400

        # Save images inside /static folder
        image_path = os.path.join("static", "generated_image.png")
        os.makedirs("static", exist_ok=True)

        file_path = generate_image(prompt, image_path)

        return jsonify({
            "prompt": prompt,
            "image": file_path
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
