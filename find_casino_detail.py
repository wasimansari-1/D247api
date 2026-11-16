import re

with open('apk_unpacked/classes.dex', 'rb') as f:
    dex = f.read()

pos = dex.find(b'CasinoDetailResponse')
while pos != -1:
    chunk = dex[max(0, pos-200):min(len(dex), pos+2000)]
    for s in re.findall(b'[\x20-\x7e]{3,}', chunk):
        s_str = s.decode('utf-8', 'ignore')
        if any(c in s_str for c in ['/', 'api', 'detail', 'get', 'post']):
            print("CasinoDetail string:", s_str)
    pos = dex.find(b'CasinoDetailResponse', pos + 1)

