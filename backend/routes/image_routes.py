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

        # Generate image and return base64
        image_base64 = generate_image(prompt, 1)

        return jsonify({
            "prompt": prompt,
            "image": f"data:image/png;base64,{image_base64}" if not image_base64.startswith("Error") else None,
            "image_data": image_base64 if not image_base64.startswith("Error") else None
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
