import re

with open('apk_unpacked/classes.dex', 'rb') as f:
    dex = f.read()

# Find BackendInterceptor
pos = dex.find(b'BackendInterceptor')
while pos != -1:
    chunk = dex[max(0, pos-200):min(len(dex), pos+2000)]
    for s in re.findall(b'[\x20-\x7e]{3,}', chunk):
        s_str = s.decode('utf-8', 'ignore')
        if any(h in s_str.lower() for h in ['header', 'auth', 'token', 'cookie', 'user-agent', 'device', 'app', 'version', 'type']):
            print("Header candidate:", s_str)
    pos = dex.find(b'BackendInterceptor', pos + 1)

