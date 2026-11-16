from dump_dex_strings import parse_dex_strings

s1 = parse_dex_strings('apk_unpacked/classes.dex')
s2 = parse_dex_strings('apk_unpacked/classes2.dex')
all_strings = set(s1 + s2)

# Find strings related to LoginRequest
login_keys = [s for s in all_strings if any(k == s.lower() for k in ['username', 'password', 'user_name', 'pwd', 'captcha', 'valid', 'device_id', 'fcm_token', 'device_type', 'app_version'])]
print("Login keys found:", login_keys)

# Also check for endpoints starting with login
login_endpoints = [s for s in all_strings if 'login' in s.lower() and '/' in s]
print("\nLogin endpoints:")
for ep in sorted(login_endpoints)[:20]:
    print("  ", ep)

