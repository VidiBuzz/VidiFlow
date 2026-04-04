import subprocess
import os
import sys

def add_logo_overlay(input_video, logo_image, output_video):
    """
    Overlays a logo on the bottom right corner of a video using ffmpeg.
    Requires ffmpeg to be installed and in the system PATH.
    """
    
    # Check if files exist
    if not os.path.exists(input_video):
        print(f"❌ Error: Input video not found: {input_video}")
        return False
    if not os.path.exists(logo_image):
        print(f"❌ Error: Logo image not found: {logo_image}")
        return False

    # Define overlay position (Bottom Right with 20px padding)
    # filter_complex syntax: "overlay=W-w-20:H-h-20"
    # W = main video width, w = overlay width
    # H = main video height, h = overlay height
    
    cmd = [
        "ffmpeg",
        "-i", input_video,
        "-i", logo_image,
        "-filter_complex", "overlay=W-w-20:H-h-20",
        "-c:a", "copy",  # Copy audio stream without re-encoding
        "-y",            # Overwrite output file if exists
        output_video
    ]
    
    print(f"🎬 Processing video: {input_video}...")
    print(f"   Overlaying logo: {logo_image}")
    print(f"   Output target:   {output_video}")
    print("   Please wait, this may take a moment...")

    try:
        # Run ffmpeg command
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        if result.returncode == 0:
            print(f"\n✅ Success! Video saved to: {output_video}")
            return True
        else:
            print(f"\n❌ ffmpeg failed with error:\n{result.stderr}")
            return False
            
    except FileNotFoundError:
        print("\n❌ Error: 'ffmpeg' command not found. Please ensure FFmpeg is installed and in your system PATH.")
        return False
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
        return False

if __name__ == "__main__":
    # Configuration
    INPUT_VIDEO = "smartchannel.vidishop.mp4"
    LOGO_IMAGE = "VidiSmart_logo_preview.png" # Default local logo
    OUTPUT_VIDEO = "smartchannel.vidishop.branded.mp4"

    # Allow command line arguments overrides
    if len(sys.argv) > 1:
        INPUT_VIDEO = sys.argv[1]
    if len(sys.argv) > 2:
        LOGO_IMAGE = sys.argv[2]
    if len(sys.argv) > 3:
        OUTPUT_VIDEO = sys.argv[3]

    print("--- VidiSmart Video Logo Overlay Tool ---")
    add_logo_overlay(INPUT_VIDEO, LOGO_IMAGE, OUTPUT_VIDEO)
