import re

with open('apk_unpacked/classes.dex', 'rb') as f:
    data1 = f.read()
with open('apk_unpacked/classes2.dex', 'rb') as f:
    data2 = f.read()
data = data1 + data2

# Search around NetworkModule
for m in re.finditer(b'NetworkModule', data):
    start = max(0, m.start() - 500)
    end = min(len(data), m.end() + 1500)
    chunk = data[start:end]
    printable = "".join(chr(b) if 32 <= b < 127 else " " for b in chunk)
    print("=== NetworkModule CHUNK ===")
    print(printable)
    print()

