#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size):
    # Create a new image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Calculate dimensions based on size
    border_radius = max(4, size // 8)
    outer_margin = max(2, size // 16)
    inner_margin = max(4, size // 8)
    
    # Draw outer rounded rectangle (dark brown)
    draw.rounded_rectangle(
        [outer_margin, outer_margin, size - outer_margin, size - outer_margin],
        radius=border_radius,
        fill='#8B4513'  # Dark brown
    )
    
    # Draw inner rounded rectangle (lighter brown)
    draw.rounded_rectangle(
        [inner_margin, inner_margin, size - inner_margin, size - inner_margin],
        radius=border_radius - 2,
        fill='#D2691E'  # Chocolate brown
    )
    
    # Try to add text if size is large enough
    if size >= 32:
        try:
            # Try to use a system font
            font_size = max(12, size // 4)
            font = ImageFont.load_default()
            
            # Draw "C" in the center
            text = "C"
            bbox = draw.textbbox((0, 0), text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            
            x = (size - text_width) // 2
            y = (size - text_height) // 2 - size // 16
            
            draw.text((x, y), text, fill='white', font=font)
            
            # Add "CHOCO" text for larger icons
            if size >= 64:
                small_font_size = max(8, size // 8)
                small_text = "CHOCO"
                small_bbox = draw.textbbox((0, 0), small_text, font=font)
                small_text_width = small_bbox[2] - small_bbox[0]
                
                small_x = (size - small_text_width) // 2
                small_y = y + text_height + 2
                
                draw.text((small_x, small_y), small_text, fill='white', font=font)
                
        except Exception as e:
            print(f"Could not add text to {size}px icon: {e}")
    
    return img

def main():
    # Create assets directory if it doesn't exist
    os.makedirs('assets', exist_ok=True)
    
    # Icon sizes required by Chrome extension
    sizes = [16, 32, 48, 128]
    
    for size in sizes:
        icon = create_icon(size)
        filename = f'assets/icon-{size}.png'
        icon.save(filename, 'PNG')
        print(f"Created {filename}")

if __name__ == '__main__':
    main()
