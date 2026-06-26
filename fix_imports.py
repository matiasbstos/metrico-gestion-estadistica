import sys

with open("src/components/Dashboard.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if "const METRIC_LABELS = {" in line:
        skip = True
    if skip and "};" in line:
        skip = False
        continue
    if not skip:
        new_lines.append(line)

with open("src/components/Dashboard.jsx", "w", encoding="utf-8") as f:
    f.writelines(new_lines)
