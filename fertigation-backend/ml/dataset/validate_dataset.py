import csv
from collections import Counter

with open("fertigation_dataset.csv", "r") as file:
    reader = csv.DictReader(file)
    data = list(reader)

print("Total rows:", len(data))

fertilizer_classes = [row["Fertilizer_Need"] for row in data]
class_counts = Counter(fertilizer_classes)

print("\nClass distribution:")
for cls, count in class_counts.items():
    percentage = (count / len(data)) * 100
    print(f"{cls}: {count} ({percentage:.2f}%)")
