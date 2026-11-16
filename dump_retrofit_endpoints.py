import re

with open('apk_unpacked/classes.dex', 'rb') as f:
    dex = f.read()

# In DEX, strings have a string table. Let's find all strings containing 'api/' or 'front/' or 'gamedata' or 'score'
matches = set()
for m in re.finditer(b'[a-zA-Z0-9_.-]*/(?:front|api)/[a-zA-Z0-9_/?=&.-]+', dex):
    matches.add(m.group(0).decode('utf-8', 'ignore'))

for m in re.finditer(b'api/[a-zA-Z0-9_/?=&.-]+', dex):
    matches.add(m.group(0).decode('utf-8', 'ignore'))

print("=== DISCOVERED RETROFIT ENDPOINTS IN APK ===")
for path in sorted(matches):
    print("  ", path)

