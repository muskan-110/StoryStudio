import os
import cohere
from dotenv import load_dotenv

load_dotenv()

cohere_api_key = os.getenv("COHERE_API_KEY")
if not cohere_api_key:
    raise ValueError("⚠️ COHERE_API_KEY not found in .env file.")

co = cohere.Client(cohere_api_key)

def generate_story(prompt, genre="general", tone="neutral", audience="general",
                   max_tokens=300, temperature=0.8):

    system_message = "You are a creative story generator."
    user_message = f"Write a story"
    if genre != "general":
        user_message += f" in the {genre} genre"
    if tone != "neutral":
        user_message += f" with a {tone} tone"
    if audience != "general":
        user_message += f" suitable for {audience}"
    user_message += f": {prompt}"

    try:
        # Use the single-message API
        response = co.chat(
            model="command-xlarge-nightly",
            message=f"{system_message}\n{user_message}",
            max_tokens=max_tokens,
            temperature=temperature
        )

        # Safe way to extract text
        if hasattr(response, "text") and response.text:
            return response.text.strip()
        elif hasattr(response, "generations") and response.generations:
            return response.generations[0].text.strip()
        else:
            return "Error: No story generated."

    except Exception as e:
        print(f"Story generation error: {str(e)}")
        return f"Error generating story: {str(e)}"
