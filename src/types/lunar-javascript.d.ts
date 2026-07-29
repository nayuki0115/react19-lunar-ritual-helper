declare module "lunar-javascript" {
  export class Lunar {
    static fromYmd(year: number, month: number, day: number): Lunar;

    getDay(): number;
    getDayInChinese(): string;
    getMonth(): number;
    getMonthInChinese(): string;
    getYear(): number;
    getYearInGanZhi(): string;
    getYearShengXiao(): string;
  }

  export class Solar {
    static fromYmd(year: number, month: number, day: number): Solar;

    getLunar(): Lunar;
  }
}
