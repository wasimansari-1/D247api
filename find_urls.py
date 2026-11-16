from dump_dex_strings import parse_dex_strings

s1 = parse_dex_strings('apk_unpacked/classes.dex')
s2 = parse_dex_strings('apk_unpacked/classes2.dex')
all_strings = set(s1 + s2)

# Find all strings that look like domains or endpoints
urls = [s for s in all_strings if any(ext in s for ext in ['.com', '.net', '.org', '.io', '.in', '.live', '.xyz', '.tv'])]
filtered = [u for u in urls if not any(x in u for x in ['google', 'android', 'schema', 'w3.org', 'adobe', 'example', 'github', 'apache', 'kotlin', 'jetbrains', 'lottie'])]

print("=== DOMAINS / URLS IN APK ===")
for u in sorted(filtered):
    print("  ", u)

