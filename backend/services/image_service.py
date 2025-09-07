import os
import requests
import base64
from dotenv import load_dotenv

load_dotenv()

STABILITY_API_KEY = os.getenv("STABILITY_API_KEY")
if not STABILITY_API_KEY:
    raise ValueError("⚠️ STABILITY_API_KEY not found in .env file.")

STABILITY_API_URL = "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image"

def generate_image(prompt: str, scene_number: int):
    try:
        headers = {
            "Authorization": f"Bearer {STABILITY_API_KEY}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

        payload = {
            "text_prompts": [
                {"text": prompt}
            ],
            "cfg_scale": 7,
            "height": 1024,
            "width": 1024,
            "samples": 1,
            "steps": 30
        }

        response = requests.post(STABILITY_API_URL, headers=headers, json=payload)

        if response.status_code != 200:
            return f"Error: {response.text}"

        data = response.json()

        # Get base64 encoded image string
        image_base64 = data["artifacts"][0]["base64"]

        # Properly decode base64 to bytes
        image_bytes = base64.b64decode(image_base64)

        # Save to file
        output_path = f"static/scene_{scene_number}.png"
        with open(output_path, "wb") as f:
            f.write(image_bytes)

        return output_path

    except Exception as e:
        return f"Error generating image: {str(e)}"
