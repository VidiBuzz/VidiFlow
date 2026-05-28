import os
import time
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv("m:/code/vidismart/.env")
api_key = os.environ.get("GEMINI_API_KEY")

genai.configure(api_key=api_key)

video_path = r"G:\CBP.AcePortal.Acct.electronic-refund-enrollment.mp4"
output_path = r"G:\CBP.AcePortal.Acct.electronic-refund-enrollment_Transcript.txt"

print(f"Uploading {video_path} to Gemini...")
video_file = genai.upload_file(path=video_path)

print(f"Completed upload: {video_file.uri}")
print("Waiting for file processing to complete...")

while video_file.state.name == "PROCESSING":
    print(".", end="", flush=True)
    time.sleep(10)
    video_file = genai.get_file(video_file.name)

if video_file.state.name == "FAILED":
    print("\nFile processing failed.")
    exit(1)

print("\nProcessing complete. Generating transcript...")

model = genai.GenerativeModel(model_name="gemini-1.5-pro")

# Prompt the model to transcribe the video
prompt = "Please provide a highly accurate, full word-for-word text transcript of this entire video. Do not include summary or commentary, just the transcript."

response = model.generate_content(
    [video_file, prompt],
    request_options={"timeout": 600}
)

with open(output_path, "w", encoding="utf-8") as f:
    f.write(response.text)

print(f"Transcript successfully saved to {output_path}")

# Clean up the file from Gemini
genai.delete_file(video_file.name)
print("Cleaned up file from Gemini servers.")
