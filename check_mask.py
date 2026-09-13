from PIL import Image
import sys

img = Image.open('test-out.jpg')
img.thumbnail((128, 128))
pixels = list(img.getdata())
# Check how many pixels are purely red or heavily red
red_count = 0
for r, g, b in pixels:
    if r > 200 and g < 50 and b < 50:
        red_count += 1

print(f"Total pixels: {len(pixels)}")
print(f"Red pixels: {red_count}")
