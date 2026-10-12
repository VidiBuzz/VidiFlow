#!/home/vidiman/.hermes/tools/python-3.14.7+202****0901-linux-x64/bin/python3
"""KittenTTS 2 CLI wrapper for Hermes command TTS provider.
Usage: kittenml-tts --text "..." --voice Rosie --output out.wav [--speed 1.0] [--model KittenML/kitten-tts-2]
"""
import argparse, sys, os

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--text", required=True)
    p.add_argument("--voice", default="Rosie")
    p.add_argument("--output", required=True)
    p.add_argument("--model", default="KittenML/kitten-tts-2")
    args = p.parse_args()

    from kittenml import KittenTTS
    import soundfile as sf

    model = KittenTTS(args.model)
    audio = model.generate(args.text, voice=args.voice)
    out = args.output
    if not out.endswith(".wav"):
        out = out.rsplit(".", 1)[0] + ".wav"
    sf.write(out, audio, 24000)
    print(out)

if __name__ == "__main__":
    main()
