import sys

# Heavenly stems and earthly branches
stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

def gregorian_to_jd(year, month, day):
    if month <= 2:
        year -= 1
        month += 12
    a = year // 100
    b = 2 - a + a // 4
    jd = int(365.25 * (year + 4716)) + int(30.6001 * (month + 1)) + day + b - 1524.5
    return jd

def get_day_pillar(year, month, day):
    jd = gregorian_to_jd(year, month, day)
    day_index = int(jd - 2415010.5) % 60
    stem_index = day_index % 10
    branch_index = day_index % 12
    return stems[stem_index] + ' ' + branches[branch_index]

def get_hour_branch(hour):
    # hour is 0-23
    branch_index = (hour + 1) // 2 % 12
    return branches[branch_index]

def get_hour_stem(day_stem_index, hour_branch_index):
    group = day_stem_index % 5
    zi_stem_index = (group * 2) % 10
    hour_stem_index = (zi_stem_index + hour_branch_index) % 10
    return stems[hour_stem_index]

def get_year_pillar(year, month, day):
    # Approximate Li Chun date
    li_chun_day = 4 if (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0) else 5
    if month < 2 or (month == 2 and day < li_chun_day):
        year -= 1
    stem_index = (year - 4) % 10
    branch_index = (year - 4) % 12
    return stems[stem_index] + ' ' + branches[branch_index], stem_index

def get_month_branch(month, day):
    # Approximate start days for bazi months (1-indexed for branches starting from Yin=2)
    start_days = [0, 6, 5, 6, 5, 6, 7, 8, 8, 8, 8, 7, 6]  # index 1 for Jan, etc.
    if day < start_days[month]:
        bazi_month = month - 1
    else:
        bazi_month = month
    if bazi_month == 0:
        bazi_month = 12
    # bazi_month 1=Feb(Yin=2), but since adjusted, for Jan if before, previous Zi=0
    # But approximate
    branch_index = (bazi_month + 1) % 12  # adjust to match Yin=2 for Feb (2+1)%12=3 wait, let's map
    # Better mapping
    # For bazi, the month branch index (Yin=2 for first month after Li Chun)
    # To simplify, use the list
    bazi_month_branches = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0]  # Jan Chou=1, Feb Yin=2, ... Dec Zi=0
    branch_index = bazi_month_branches[(month - 1) % 12]
    # Adjust if day < start
    if day < start_days[month]:
        branch_index = (branch_index - 1) % 12
    return branches[branch_index], branch_index

def get_month_stem(year_stem_index, month_branch_index):
    group = year_stem_index % 5
    yin_stem_index = (group * 2 + 2) % 10
    # Month number from Yin as 1
    month_num = (month_branch_index - 2 + 12) % 12 + 1
    stem_index = (yin_stem_index + month_num - 1) % 10
    return stems[stem_index]

def main():
    if len(sys.argv) != 5:
        print("Usage: python bazi.py <year> <month> <day> <hour>")
        sys.exit(1)
    
    year = int(sys.argv[1])
    month = int(sys.argv[2])
    day = int(sys.argv[3])
    hour = int(sys.argv[4])
    
    if not (1 <= month <= 12 and 1 <= day <= 31 and 0 <= hour <= 23):
        print("Invalid date or time.")
        sys.exit(1)
    
    # Year pillar
    year_pillar, year_stem_index = get_year_pillar(year, month, day)
    
    # Month pillar
    month_branch, month_branch_index = get_month_branch(month, day)
    month_stem = get_month_stem(year_stem_index, month_branch_index)
    month_pillar = month_stem + ' ' + month_branch
    
    # Day pillar
    day_pillar = get_day_pillar(year, month, day)
    day_stem = day_pillar.split()[0]
    day_stem_index = stems.index(day_stem)
    
    # Hour pillar
    hour_branch = get_hour_branch(hour)
    hour_branch_index = branches.index(hour_branch)
    hour_stem = get_hour_stem(day_stem_index, hour_branch_index)
    hour_pillar = hour_stem + ' ' + hour_branch
    
    print("Four Pillars (Bazi):")
    print(f"Year Pillar: {year_pillar}")
    print(f"Month Pillar: {month_pillar}")
    print(f"Day Pillar: {day_pillar}")
    print(f"Hour Pillar: {hour_pillar}")

if __name__ == "__main__":
    main()