import re

with open('apk_unpacked/classes.dex', 'rb') as f:
    dex1 = f.read()
with open('apk_unpacked/classes2.dex', 'rb') as f:
    dex2 = f.read()

dex = dex1 + dex2

# Find Retrofit annotations: Lretrofit2/http/POST; and Lretrofit2/http/GET;
for method in [b'Lretrofit2/http/POST;', b'Lretrofit2/http/GET;']:
    m_name = "POST" if b'POST' in method else "GET"
    pos = 0
    while True:
        idx = dex.find(method, pos)
        if idx == -1:
            break
        chunk = dex[max(0, idx-50):min(len(dex), idx+200)]
        strs = re.findall(b'[\x20-\x7e]{3,}', chunk)
        for s in strs:
            s_str = s.decode('utf-8', 'ignore')
            if not s_str.startswith('Lretrofit2') and not s_str.startswith('value'):
                print(f"[{m_name}] {s_str}")
        pos = idx + len(method)

