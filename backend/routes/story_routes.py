from flask import Blueprint, request, jsonify, send_file
from services.story_service import generate_story
from utils.pdf_exporter import export_story_to_pdf
import os

story_bp = Blueprint("story_bp", __name__)

@story_bp.route("/generate", methods=["POST"])
def generate():
    data = request.get_json()

    prompt = data.get("prompt", "")
    genre = data.get("genre", "general")
    tone = data.get("tone", "neutral")
    audience = data.get("audience", "general")
    max_tokens = int(data.get("max_tokens", 300))
    temperature = float(data.get("temperature", 0.8))

    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400

    story = generate_story(prompt, genre, tone, audience, max_tokens, temperature)

    return jsonify({
        "genre": genre,
        "tone": tone,
        "audience": audience,
        "story": story
    })

@story_bp.route("/export-pdf", methods=["POST"])
def export_pdf():
    try:
        data = request.get_json()
        scenes = data.get('scenes', [])
        
        # Generate PDF in memory
        pdf_buffer = export_story_to_pdf(scenes)
        
        # Send the file
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name='story.pdf'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500
