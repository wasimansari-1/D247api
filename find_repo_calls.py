import re

with open('apk_unpacked/classes.dex', 'rb') as f:
    dex = f.read()

def search_strings_in_file(class_name):
    print(f"\n==================== {class_name} ====================")
    for m in re.finditer(re.escape(class_name.encode('utf-8')), dex):
        pos = m.start()
        chunk = dex[max(0, pos-100):min(len(dex), pos+1500)]
        strs = re.findall(b'[\x20-\x7e]{3,}', chunk)
        for s in strs:
            s_str = s.decode('utf-8', 'ignore')
            if any(k in s_str for k in ['/', 'http', 'api', 'get', 'post', 'list', 'data', 'event', 'game', 'table', 'market']):
                print("  ", s_str)

search_strings_in_file('SportsRepository')
search_strings_in_file('MatchDetailRepository')
search_strings_in_file('CasinoRepository')

