from flask import Blueprint, request, jsonify
from services.scene_service import generate_scenes_with_images

scene_bp = Blueprint("scene_bp", __name__)

@scene_bp.route("/generate-story", methods=["POST"])
def generate_story_with_images():
    try:
        data = request.get_json()

        prompt = data.get("prompt", "")
        genre = data.get("genre", "general")
        tone = data.get("tone", "neutral")
        audience = data.get("audience", "general")
        max_tokens = int(data.get("max_tokens", 300))
        temperature = float(data.get("temperature", 0.8))
        num_scenes = int(data.get("num_scenes", 5))  # 👈 default = 5

        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400

        scenes = generate_scenes_with_images(
            prompt, genre, tone, audience,
            max_tokens, temperature, num_scenes
        )

        return jsonify({
            "prompt": prompt,
            "genre": genre,
            "tone": tone,
            "audience": audience,
            "num_scenes": num_scenes,
            "scenes": scenes
        })
        
    except Exception as e:
        print(f"Scene route error: {str(e)}")
        return jsonify({"error": str(e)}), 500

