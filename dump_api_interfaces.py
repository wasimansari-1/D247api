import re

with open('apk_unpacked/classes.dex', 'rb') as f:
    dex = f.read()

def dump_class_strings(class_descriptor):
    pos = dex.find(class_descriptor.encode('utf-8'))
    print(f"=== {class_descriptor} (pos {pos}) ===")
    if pos != -1:
        chunk = dex[max(0, pos-500):min(len(dex), pos+2000)]
        for s in re.findall(b'[\x20-\x7e]{3,}', chunk):
            s_str = s.decode('utf-8', 'ignore')
            print("  ", s_str)

dump_class_strings('Lcom/apps/project/data/network/retrofit/api/MainApi;')
dump_class_strings('Lcom/apps/project/data/network/retrofit/api/CasinoApi;')

