type ZhTransformOptions = {
  normalizeLunarMonthAlias?: boolean;
  normalizeLunarDayAlias?: boolean;
};

const BASE_REPLACEMENTS: Array<[string, string]> = [
  ["鸡", "雞"],
  ["马", "馬"],
  ["龙", "龍"],
  ["猪", "豬"],
  ["阴", "陰"],
  ["阳", "陽"],
];

const applyAll = (text: string, replacements: Array<[string, string]>): string => {
  let result = text;
  for (const [from, to] of replacements) {
    result = result.split(from).join(to);
  }
  return result;
};

export const toTraditionalChinese = (
  text: string,
  options: ZhTransformOptions = {},
): string => {
  const {
    normalizeLunarMonthAlias = true,
    normalizeLunarDayAlias = true,
  } = options;

  let result = applyAll(text, BASE_REPLACEMENTS);

  if (normalizeLunarMonthAlias) {
    result = applyAll(result, [
      ["腊月", "十二月"],
      ["臘月", "十二月"],
      ["冬月", "十一月"],
    ]);
  }

  if (normalizeLunarDayAlias) {
    result = applyAll(result, [
      ["廿", "二十"],
      ["卅", "三十"],
    ]);
  }

  return result;
};

