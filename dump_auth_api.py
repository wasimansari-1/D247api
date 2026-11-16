import re

with open('apk_unpacked/classes.dex', 'rb') as f:
    dex = f.read()

pos = dex.find(b'Lcom/apps/project/data/network/retrofit/api/AuthApi;')
print(f"AuthApi pos: {pos}")
if pos != -1:
    chunk = dex[max(0, pos-200):min(len(dex), pos+3000)]
    for s in re.findall(b'[\x20-\x7e]{3,}', chunk):
        s_str = s.decode('utf-8', 'ignore')
        print("  ", s_str)

