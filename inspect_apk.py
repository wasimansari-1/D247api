import re
import os

def search_in_file(filepath):
    results = set()
    try:
        with open(filepath, 'rb') as f:
            data = f.read()
            # 1. Search ASCII/UTF-8
            for m in re.finditer(b'https?://[a-zA-Z0-9.-]+(?:/[a-zA-Z0-9_./?=&%-]*)?', data):
                results.add(m.group(0).decode('utf-8', 'ignore'))
            # 2. Search UTF-16LE
            utf16_str = data.decode('utf-16le', 'ignore')
            for m in re.finditer(r'https?://[a-zA-Z0-9.-]+(?:/[a-zA-Z0-9_./?=&%-]*)?', utf16_str):
                results.add(m.group(0))
            # 3. Search websocket
            for m in re.finditer(b'wss?://[a-zA-Z0-9.-]+(?:/[a-zA-Z0-9_./?=&%-]*)?', data):
                results.add(m.group(0).decode('utf-8', 'ignore'))
            # 4. Search package names and domains
            for m in re.finditer(r'[a-zA-Z0-9_-]+\.(?:com|org|net|live|in|pro|info|io|xyz)', utf16_str):
                results.add(m.group(0))
            for m in re.finditer(b'[a-zA-Z0-9_-]+\.(?:com|org|net|live|in|pro|info|io|xyz)', data):
                results.add(m.group(0).decode('utf-8', 'ignore'))
    except Exception as e:
        pass
    return results

all_urls = set()
for root, dirs, files in os.walk('apk_unpacked'):
    for file in files:
        if file.endswith(('.dex', '.xml', '.arsc', '.json', '.txt', '.properties', '.bin')) or 'assets' in root:
            fp = os.path.join(root, file)
            res = search_in_file(fp)
            all_urls.update(res)

filtered = [u for u in all_urls if not any(x in u for x in ['google', 'android', 'schema', 'w3.org', 'adobe', 'example', 'github', 'apache', 'kotlin', 'jetbrains'])]
filtered.sort()

print(f"Total discovered unique endpoints/domains: {len(filtered)}")
for u in filtered:
    print(u)

