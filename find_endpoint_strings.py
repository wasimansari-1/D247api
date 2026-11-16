from dump_dex_strings import parse_dex_strings

s1 = parse_dex_strings('apk_unpacked/classes.dex')
s2 = parse_dex_strings('apk_unpacked/classes2.dex')
all_strings = set(s1 + s2)

# Known endpoints from screenshots: tablelist, treedata, userdata, gamedataPrivate, highlighthomePrivate, lastresults2, launchother, check
known = ['tablelist', 'treedata', 'userdata', 'lastresults2', 'launchother', 'buttonlist', 'check', 'book']
found_known = [s for s in all_strings if any(k in s for k in known)]
print("Known endpoints found in string table:", found_known)

# Potential API paths (words with letters and digits, maybe starting with lowercase)
potential_paths = [s for s in all_strings if 4 <= len(s) <= 25 and s.isascii() and s.replace('_', '').replace('-', '').isalnum()]
print(f"Total potential paths: {len(potential_paths)}")

# Check for paths matching our pattern
candidates = [s for s in potential_paths if any(w in s.lower() for w in ['match', 'sport', 'event', 'casino', 'table', 'market', 'high', 'detail', 'game', 'result'])]
print("Candidates related to sports/casino:")
for c in sorted(candidates)[:40]:
    print("  ", c)

