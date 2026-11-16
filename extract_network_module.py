import re

# In DEX format, find class Lcom/apps/project/di/NetworkModule;
with open('apk_unpacked/classes.dex', 'rb') as f:
    dex1 = f.read()
with open('apk_unpacked/classes2.dex', 'rb') as f:
    dex2 = f.read()

def find_strings_in_class(dex, class_name):
    # Find all strings within 2000 bytes of the class name or references
    idx = 0
    while True:
        pos = dex.find(class_name.encode('utf-8'), idx)
        if pos == -1:
            break
        print(f"Found {class_name} at offset {pos}")
        chunk = dex[max(0, pos-200):min(len(dex), pos+2000)]
        # Extract ASCII strings of length >= 4
        strs = re.findall(b'[\x20-\x7e]{4,}', chunk)
        for s in strs:
            s_str = s.decode('utf-8', 'ignore')
            if any(k in s_str for k in ['http', 'api', 'baseUrl', 'com', 'token', 'header', 'auth', 'client', 'key']):
                print("   ->", s_str)
        idx = pos + len(class_name)

print("Checking classes.dex:")
find_strings_in_class(dex1, 'Lcom/apps/project/di/NetworkModule;')
print("\nChecking classes2.dex:")
find_strings_in_class(dex2, 'Lcom/apps/project/di/NetworkModule;')

