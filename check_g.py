import os

g_path = r"G:\VidiPitch"
mnt_g = "/mnt/g/VidiPitch"

if os.path.exists(g_path):
    print(f"Listing {g_path}:")
    for item in os.listdir(g_path):
        print(item)
elif os.path.exists(mnt_g):
    print(f"Listing {mnt_g}:")
    for item in os.listdir(mnt_g):
        print(item)
else:
    print(f"Could not find {g_path} or {mnt_g}")

import http.client
try:
    conn = http.client.HTTPConnection("localhost", 3500)
    conn.request("GET", "/")
    r = conn.getresponse()
    print("localhost:3500 response", r.status)
except Exception as e:
    print("Could not connect to 3500:", e)
