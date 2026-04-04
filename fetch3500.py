import urllib.request
try:
    html = urllib.request.urlopen("http://localhost:3500").read().decode("utf-8")
    with open("m:/code/vidismart/temp_localhost3500.html", "w", encoding="utf-8") as f:
        f.write(html)
    print("Success")
except Exception as e:
    print(f"Error: {e}")
