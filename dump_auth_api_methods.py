import struct

with open('apk_unpacked/classes.dex', 'rb') as f:
    dex = f.read()

# Let's find AuthApi class definition in DEX
# Type descriptor: Lcom/apps/project/data/network/retrofit/api/AuthApi;
type_str = b'Lcom/apps/project/data/network/retrofit/api/AuthApi;'
pos = dex.find(type_str)
print("AuthApi type pos:", pos)

# Search for strings starting with /api/ or relative paths that appear near AuthApi or are typical auth endpoints
from dump_dex_strings import parse_dex_strings
s1 = parse_dex_strings('apk_unpacked/classes.dex')
s2 = parse_dex_strings('apk_unpacked/classes2.dex')
all_strings = s1 + s2

auth_endpoints = [s for s in all_strings if any(k in s.lower() for k in ['login', 'auth', 'token', 'captcha', 'verify', 'user']) and '/' in s]
print("\nPossible Auth Endpoints:")
for ep in sorted(set(auth_endpoints)):
    if not any(x in ep for x in ['google', 'android', 'androidx', 'schema']):
        print("  ", ep)

