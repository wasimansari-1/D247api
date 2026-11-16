with open('apk_unpacked/classes.dex', 'rb') as f:
    dex = f.read()

import re

for term in [b'getCasinoDetail', b'getCasinoUrl', b'getCasinoLastResults']:
    pos = dex.find(term)
    if pos != -1:
        chunk = dex[max(0, pos-200):min(len(dex), pos+1000)]
        for s in re.findall(b'[\x20-\x7e]{3,}', chunk):
            s_str = s.decode('utf-8', 'ignore')
            if any(k in s_str for k in ['/', 'api', 'front', 'http', 'casino', 'detail', 'url']):
                print(f"[{term.decode()}]:", s_str)

