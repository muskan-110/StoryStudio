from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from io import BytesIO
import os

def export_story_to_pdf(scenes, output_path):
    """
    Export story scenes with their images to a PDF file
    
    Args:
        scenes (list): List of scene dictionaries containing text and image paths
        output_path (str): Path where the PDF should be saved
    """
    c = canvas.Canvas(output_path, pagesize=A4)
    width, height = A4
    margin = 50
    text_width = width - 2 * margin
    
    for scene in scenes:
        # Add scene title
        c.setFont("Helvetica-Bold", 16)
        c.drawString(margin, height - margin, f"Scene {scene['index'] + 1}")
        
        # Add scene text
        c.setFont("Helvetica", 12)
        text = scene['text']
        y = height - margin - 30
        
        # Wrap text
        words = text.split()
        line = []
        for word in words:
            line.append(word)
            line_width = c.stringWidth(' '.join(line), "Helvetica", 12)
            if line_width > text_width:
                line.pop()
                c.drawString(margin, y, ' '.join(line))
                line = [word]
                y -= 15
            
        if line:
            c.drawString(margin, y, ' '.join(line))
        
        # Add image if available
        image_path = os.path.join('static', f'scene_{scene["index"] + 1}.png')
        if os.path.exists(image_path):
            img = ImageReader(image_path)
            img_width = 300
            img_height = 200
            img_x = (width - img_width) / 2
            img_y = y - img_height - 20
            c.drawImage(img, img_x, img_y, width=img_width, height=img_height)
            y = img_y
        
        # Add page break if not the last scene
        if scene != scenes[-1]:
            c.showPage()
            
    c.save()
    return output_path