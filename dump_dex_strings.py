import struct

def parse_dex_strings(filename):
    with open(filename, 'rb') as f:
        data = f.read()

    # DEX header
    magic = data[:8]
    if not magic.startswith(b'dex\n'):
        return []

    string_ids_size = struct.unpack('<I', data[0x38:0x3c])[0]
    string_ids_off = struct.unpack('<I', data[0x3c:0x40])[0]

    strings = []
    for i in range(string_ids_size):
        offset = string_ids_off + (i * 4)
        string_data_off = struct.unpack('<I', data[offset:offset+4])[0]
        
        # Read MUTF-8 length (ULEB128)
        p = string_data_off
        length = 0
        shift = 0
        while True:
            byte = data[p]
            p += 1
            length |= (byte & 0x7f) << shift
            if (byte & 0x80) == 0:
                break
            shift += 7

        # Read null-terminated string
        end = data.find(b'\x00', p)
        if end != -1:
            s_bytes = data[p:end]
            try:
                strings.append(s_bytes.decode('utf-8', 'ignore'))
            except:
                pass

    return strings

s1 = parse_dex_strings('apk_unpacked/classes.dex')
s2 = parse_dex_strings('apk_unpacked/classes2.dex')
all_strings = set(s1 + s2)
print(f"Total extracted strings from DEX: {len(all_strings)}")

# Search for interesting keywords
keywords = ['tablelist', 'gamedata', 'treedata', 'score', 'highlighthome', 'odds', 'd247', 'domain', 'diamond']
for kw in keywords:
    matches = [s for s in all_strings if kw in s.lower()]
    print(f"\nKeyword [{kw}] ({len(matches)} matches):")
    for m in sorted(matches)[:15]:
        print("  ", m)

