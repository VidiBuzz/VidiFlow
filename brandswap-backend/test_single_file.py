#!/usr/bin/env python
"""
Test BrandSwap with a single file to verify it actually works
Run this BEFORE batch processing 465 files!
"""

import requests
import sys
from pathlib import Path

API_URL = "http://localhost:8080/api/brandswap/process"

def test_single_file(logo_path: Path, test_file: Path):
    """Test processing a single file"""

    print("="*60)
    print("BRANDSWAP SINGLE FILE TEST")
    print("="*60)
    print(f"Logo template: {logo_path}")
    print(f"Test file: {test_file}")
    print()

    if not logo_path.exists():
        print(f"❌ ERROR: Logo template not found at {logo_path}")
        return False

    if not test_file.exists():
        print(f"❌ ERROR: Test file not found at {test_file}")
        return False

    # Prepare request
    print("Uploading files to backend...")

    form_data = {
        'overlayText': (None, 'VidiSmart™'),
        'threshold': (None, '0.55'),
        'position': (None, 'bottom-right')
    }

    files = {
        'logo': ('template.png', open(logo_path, 'rb'), 'image/png'),
        'files': (test_file.name, open(test_file, 'rb'), 'image/png' if test_file.suffix in ['.png', '.jpg'] else 'video/mp4')
    }

    try:
        print("Sending request to:", API_URL)
        response = requests.post(API_URL, data=form_data, files=files, timeout=120)

        if response.status_code == 200:
            result = response.json()
            print("\n" + "="*60)
            print("✅ TEST PASSED!")
            print("="*60)
            print(f"Session ID: {result['sessionId']}")
            print()

            for r in result['results']:
                print(f"File: {r['filename']}")
                print(f"Status: {r['status']}")

                if r['status'] == 'processed':
                    print(f"✅ Logo detected and replaced!")
                    if 'confidence' in r:
                        print(f"Confidence: {r['confidence']}")
                    if 'cdnUrl' in r:
                        print(f"CDN URL: {r['cdnUrl']}")
                        print(f"\nDownload processed file from:")
                        print(f"  {r['cdnUrl']}")

                    # Check local output
                    output_path = Path(f"storage/output/{result['sessionId']}/{r['filename']}")
                    if output_path.exists():
                        print(f"\nLocal file saved to:")
                        print(f"  {output_path}")
                        print(f"  Size: {output_path.stat().st_size / 1024 / 1024:.2f} MB")

                    print("\n✅ BACKEND IS WORKING!")
                    print("Safe to process all 465 files.")
                    return True

                elif r['status'] == 'skipped':
                    print(f"⚠️  Logo NOT detected")
                    print(f"Reason: {r.get('reason', 'Unknown')}")
                    print("\n❌ DETECTION FAILED")
                    print("Try:")
                    print("  1. Lower threshold (0.3-0.4)")
                    print("  2. Use clearer logo template")
                    print("  3. Check logo is in bottom-right corner")
                    return False

                else:
                    print(f"❌ Error: {r.get('reason', 'Unknown')}")
                    return False

        else:
            print(f"\n❌ API Error: {response.status_code}")
            print(response.text)
            return False

    except requests.exceptions.Timeout:
        print("\n❌ Request timed out")
        print("Backend may be processing - check server logs")
        return False

    except Exception as e:
        print(f"\n❌ Request failed: {e}")
        return False

    finally:
        files['logo'][1].close()
        files['files'][1].close()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python test_single_file.py <logo_template.png> <test_file.jpg>")
        print("\nExample:")
        print("  python test_single_file.py ../images/notebooklm_logo_template.png ../images/test.jpg")
        sys.exit(1)

    logo = Path(sys.argv[1])
    test_file = Path(sys.argv[2])

    success = test_single_file(logo, test_file)

    if success:
        print("\n" + "="*60)
        print("NEXT STEP: Run batch processor")
        print("="*60)
        print("python batch_process_folder.py")
    else:
        print("\n" + "="*60)
        print("FIX THE ISSUES ABOVE FIRST")
        print("="*60)
        print("Do NOT run batch processor until single file test passes!")

    sys.exit(0 if success else 1)
