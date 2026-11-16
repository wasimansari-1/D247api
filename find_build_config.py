import re

with open('apk_unpacked/classes.dex', 'rb') as f:
    dex1 = f.read()

# Search for BuildConfig
for m in re.finditer(b'BuildConfig', dex1):
    pos = m.start()
    chunk = dex1[max(0, pos-200):min(len(dex1), pos+1000)]
    strs = re.findall(b'[\x20-\x7e]{4,}', chunk)
    for s in strs:
        s_str = s.decode('utf-8', 'ignore')
        if any(k in s_str for k in ['http', 'api', 'URL', 'Host', 'com', 'BASE', 'd247', 'domain', 'key']):
            print("BuildConfig string:", s_str)

