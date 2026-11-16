import re

def search_keywords():
    with open('apk_unpacked/classes.dex', 'rb') as f:
        data1 = f.read()
    with open('apk_unpacked/classes2.dex', 'rb') as f:
        data2 = f.read()

    data = data1 + data2

    # Find context around diamondonline7
    for m in re.finditer(b'[^\x00-\x1f\x7f-\xff]{4,100}diamondonline7[^\x00-\x1f\x7f-\xff]{0,100}', data):
        print("DIAMOND_ONLINE:", m.group(0).decode('utf-8', 'ignore'))

    for m in re.finditer(b'[^\x00-\x1f\x7f-\xff]{4,100}sprintstaticdata[^\x00-\x1f\x7f-\xff]{0,100}', data):
        print("SPRINT_STATIC:", m.group(0).decode('utf-8', 'ignore'))

    # Find API paths (e.g. /api/)
    api_paths = set()
    for m in re.finditer(b'/(?:api|front|v1|v2|exchange)/[a-zA-Z0-9_/.-]+', data):
        api_paths.add(m.group(0).decode('utf-8', 'ignore'))

    print("\nAPI PATHS FOUND:")
    for p in sorted(api_paths):
        print("  ", p)

search_keywords()

