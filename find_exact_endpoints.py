from dump_dex_strings import parse_dex_strings

s1 = parse_dex_strings('apk_unpacked/classes.dex')
s2 = parse_dex_strings('apk_unpacked/classes2.dex')
all_strings = set(s1 + s2)

# Find all strings that look like relative API endpoints (e.g. contain letters and slash, no spaces, length 4..40)
endpoints = []
for s in all_strings:
    if 3 <= len(s) <= 50 and ' ' not in s and '\n' not in s:
        # Check if it looks like an endpoint
        if s.startswith(('api/', 'front/', '/api', '/front', 'casino/', 'sports/', 'match/')):
            endpoints.append(s)
        elif any(k in s for k in ['table', 'casino', 'odds', 'score', 'match', 'event', 'result', 'detail']) and '/' not in s:
            if s.islower() or (s[0].islower() and not s.endswith('Exception')):
                endpoints.append(s)

print("=== CANDIDATE API STRINGS ===")
for ep in sorted(set(endpoints)):
    print("  ", ep)

