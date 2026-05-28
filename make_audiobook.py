import os
import re
import sys
import subprocess

input_md = "C:\\Users\\James\\My Drive\\The_Speed_of_Agentic_Visual_AI.md"
output_mp3 = "G:\\The_Speed_of_Agentic_Visual_AI_Audiobook.mp3"
clean_txt = "book_clean.txt"

print(f"Reading markdown from {input_md}...")
with open(input_md, "r", encoding="utf-8") as f:
    text = f.read()

# Remove Markdown syntax to make it clean for TTS
# Remove images ![...](...)
text = re.sub(r'!\[.*?\]\(.*?\)', '', text)
# Remove links [...](...)
text = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', text)
# Remove formatting marks
text = text.replace('**', '')
text = text.replace('*', '')
text = text.replace('__', '')
text = text.replace('_', '')
text = text.replace('### ', '')
text = text.replace('## ', '')
text = text.replace('# ', '')
text = text.replace('---', '')

# Write out clean text
with open(clean_txt, "w", encoding="utf-8") as f:
    f.write(text)

print(f"Clean text written to {clean_txt}. Starting edge-tts generation...")
print("This may take a few minutes depending on the length of the book.")

# Run edge-tts via Python module to ensure it's in path
try:
    # using JennyNeural which is a very high quality, natural-sounding voice
    cmd = [
        sys.executable, "-m", "edge_tts",
        "--voice", "en-US-JennyNeural",
        "--rate", "+5%", # Slightly faster for audiobook feel
        "--file", clean_txt,
        "--write-media", output_mp3
    ]
    subprocess.run(cmd, check=True)
    print(f"\nSuccess! Audiobook saved to: {output_mp3}")
except Exception as e:
    print(f"An error occurred: {e}")

