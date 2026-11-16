from dump_dex_strings import parse_dex_strings

s1 = parse_dex_strings('apk_unpacked/classes.dex')
s2 = parse_dex_strings('apk_unpacked/classes2.dex')
all_strings = s1 + s2

# Find strings that have a slash and lowercase words, e.g. "path/to"
paths = set()
for s in all_strings:
    if '/' in s and not s.startswith(('L', '[', 'http', 'content', 'android', 'androidx', 'com/', 'org/', 'io/', 'java/', 'kotlin/')):
        if all(c.isalnum() or c in '/_-?=&{}' for c in s):
            paths.add(s)

print(f"Total clean relative paths: {len(paths)}")
for p in sorted(paths):
    print("  ", p)

