from services.story_service import generate_story
from services.image_service import generate_image

def generate_scenes_with_images(prompt, genre, tone, audience,
                                max_tokens=300, temperature=0.8, num_scenes=5):
    """
    Generates a story, splits it into scenes, and creates images for each scene.
    """
    try:
        # Generate full story from cohere
        story_text = generate_story(prompt, genre, tone, audience, max_tokens, temperature)
        
        # Check if story generation failed
        if story_text.startswith("Error"):
            raise Exception(f"Story generation failed: {story_text}")

        # Split story into parts (naive split by sentences/paragraphs)
        story_parts = story_text.split(". ")
        scenes = []

        for idx in range(num_scenes):
            if idx < len(story_parts):
                scene_text = story_parts[idx].strip()
            else:
                scene_text = f"(Scene {idx+1} filler) Continue the story..."

            # Prompt for image
            image_prompt = f"{scene_text} -- illustration"
            image_base64 = generate_image(image_prompt, idx + 1)
            
            # Check if image generation failed
            if image_base64.startswith("Error"):
                print(f"Image generation failed for scene {idx + 1}: {image_base64}")

            scenes.append({
                "scene": idx + 1,
                "text": scene_text,
                "image": f"data:image/png;base64,{image_base64}" if not image_base64.startswith("Error") else None,
                "image_data": image_base64 if not image_base64.startswith("Error") else None
            })

        return scenes
        
    except Exception as e:
        print(f"Scene generation error: {str(e)}")
        raise e
