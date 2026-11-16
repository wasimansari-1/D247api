from dump_dex_strings import parse_dex_strings

s1 = parse_dex_strings('apk_unpacked/classes.dex')
s2 = parse_dex_strings('apk_unpacked/classes2.dex')
all_strings = set(s1 + s2)

login_strings = [s for s in all_strings if any(k in s.lower() for k in ['login', 'auth', 'guest', 'demo']) and ('/' in s or 'api' in s.lower())]

print("=== AUTH & LOGIN STRINGS IN APK ===")
for s in sorted(login_strings):
    print("  ", s)

