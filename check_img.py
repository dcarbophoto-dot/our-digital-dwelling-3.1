from PIL import Image
import sys

try:
    img = Image.open('test.jpg')
    extrema = img.getextrema()
    print("Extrema (min, max) for each channel:", extrema)
    colors = img.getcolors(maxcolors=2)
    if colors:
        print("Image has very few colors:", colors)
    else:
        print("Image has many colors, not solid.")
except Exception as e:
    print(e)
