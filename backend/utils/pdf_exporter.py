from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from io import BytesIO
import base64

def export_story_to_pdf(scenes):
    """
    Export story scenes with their images to a PDF in memory
    
    Args:
        scenes (list): List of scene dictionaries containing text and base64 image data
    
    Returns:
        BytesIO: PDF file as BytesIO object
    """
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
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
        
        # Add image if available (base64 data)
        if scene.get('image_data'):
            try:
                # Decode base64 image data
                image_data = base64.b64decode(scene['image_data'])
                img = ImageReader(BytesIO(image_data))
                img_width = 300
                img_height = 200
                img_x = (width - img_width) / 2
                img_y = y - img_height - 20
                c.drawImage(img, img_x, img_y, width=img_width, height=img_height)
                y = img_y
            except Exception as e:
                print(f"Error adding image to PDF: {e}")
        
        # Add page break if not the last scene
        if scene != scenes[-1]:
            c.showPage()
            
    c.save()
    buffer.seek(0)
    return buffer