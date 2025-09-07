from services.story_service import generate_story
from services.image_service import generate_image

def generate_scenes_with_images(prompt, genre, tone, audience,
                                max_tokens=300, temperature=0.8, num_scenes=5):
    """
    Generates a story, splits it into scenes, and creates images for each scene.
    """

    # Generate full story from cohere
    story_text = generate_story(prompt, genre, tone, audience, max_tokens, temperature)

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
        image_path = generate_image(image_prompt, idx + 1)

        scenes.append({
            "scene": idx + 1,
            "text": scene_text,
            "image": image_path
        })

    return scenes
