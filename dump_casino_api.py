import re

with open('apk_unpacked/classes.dex', 'rb') as f:
    dex = f.read()

# Search for methods in CasinoApi
pos = dex.find(b'Lcom/apps/project/data/network/retrofit/api/CasinoApi;')
chunk = dex[max(0, pos-200):min(len(dex), pos+4000)]

# Extract strings of length >= 3
for s in re.findall(b'[\x20-\x7e]{3,}', chunk):
    print("  ", s.decode('utf-8', 'ignore'))

