import re

with open('apk_unpacked/classes.dex', 'rb') as f:
    data1 = f.read()
with open('apk_unpacked/classes2.dex', 'rb') as f:
    data2 = f.read()
data = data1 + data2

def find_context(term, n=300):
    for m in re.finditer(re.escape(term), data):
        start = max(0, m.start() - n)
        end = min(len(data), m.end() + n)
        chunk = data[start:end]
        printable = "".join(chr(b) if 32 <= b < 127 else " " for b in chunk)
        print(f"=== MATCH for {term} ===")
        print(printable)
        print()

find_context(b'BackendInterceptor')
find_context(b'provideMainApi')

