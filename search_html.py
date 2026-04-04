import os
search_dir = "m:/code/vidismart"
search_str = "90-Day Money-Back Guarantee"
for root, dirs, files in os.walk(search_dir):
    for file in files:
        if file.endswith(".html"):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    if search_str in f.read():
                        print(f"Found in: {path}")
            except Exception as e:
                pass
