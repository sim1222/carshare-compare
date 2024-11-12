"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import * as JPH from "japanese-holidays";

// Fictional car rental companies and their pricing models

type RentalCompany = {
  name: string;
  // baseFee: number;
  // dailyRate: number;
  /**
   * Mileage rate per 1KM
   */
  // mileageRate: number;
  // noNOC: boolean;
  // noNOCFee: number;

  calculateFee: (
    startDay: Date,
    endDay: Date,
    mileage: number
  ) => {
    fees: {
      totalFee: number;
      timeFee: number;
      mileageFee: number;
      noNOCFee: number;
    };
    info: {
      feePerKm: number;
      hourPack?: {
        name: string;
        fee: number;
      };
    };
  };
};

const getHourMin = (
  startDay: Date,
  endDay: Date
): {
  hours: number;
  minutes: number;
} => {
  const hours = (endDay.getTime() - startDay.getTime()) / 1000 / 60 / 60;
  const minutes = (endDay.getTime() - startDay.getTime()) / 1000 / 60;
  return {
    hours,
    minutes,
  };
};

const checkDateSmallerThanHour = (date: Date, hour: number): boolean => {
  return date.getHours() < hour || (date.getHours() == hour && date.getMinutes() == 0 );
};

const checkIsHoliday = (date: Date): boolean => {
  return JPH.isHolidayAt(date) != undefined || [0, 6].includes(date.getDay())
  // return false;
} 

const rentalCompanies: RentalCompany[] = [
  {
    name: "タイムズカーシェア",
    calculateFee: (startDay, endDay, mileage) => {
      const { hours, minutes } = getHourMin(startDay, endDay);

      function isNightPackApplyable(startDay: Date, endDay: Date) {
        // startDayの18:00から翌日の9:00の範囲を設定
        const startLimit = new Date(startDay);
        startLimit.setHours(18, 0, 0, 0); // 18:00

        const endLimit = new Date(startDay);
        endLimit.setDate(endLimit.getDate() + 1); // 翌日
        endLimit.setHours(9, 0, 0, 0); // 9:00

        // 日付が翌日を越えている場合、9:00までの間にあるか判定
        if (startDay.getHours() >= 0 && startDay.getHours() < 9) {
          const morningLimit = new Date(startDay);
          morningLimit.setHours(9, 0, 0, 0); // startDayの9:00
          return endDay <= morningLimit;
        }

        // 通常の範囲内チェック
        return startDay >= startLimit && endDay <= endLimit;
      }

      let timeFee = 0;
      let mileageFee = 0;

      const feeCalculateBaseMin = 15; // 15min
      const baseFee = 220;

      const feePerKm = 20;

      const exceptedMileageFee = feePerKm * mileage;

      const baseCount = Math.ceil(minutes / feeCalculateBaseMin);

      const nonPackFee = baseFee * baseCount;

      timeFee = nonPackFee;

      const hourPackFees = [
        {
          hours: 6,
          fee: 4290,
        },
        {
          hours: 12,
          fee: 5500,
        },
        {
          hours: 24,
          fee: 6600,
        },
        {
          hours: 36,
          fee: 8800,
        },
        {
          hours: 48,
          fee: 9900,
        },
        {
          hours: 72,
          fee: 14300,
        },
      ];

      const nightPackFee = 2640;

      const hourPack = hourPackFees.find((pack) => hours <= pack.hours);
      const hourPackApplied = hourPack && timeFee > hourPack.fee;
      if (hourPackApplied) {
        timeFee = hourPack.fee;
      }

      let nightPackApplied = false;

      if (
        isNightPackApplyable(startDay, endDay) &&
        timeFee + exceptedMileageFee > nightPackFee + exceptedMileageFee
      ) {
        nightPackApplied = true;
        timeFee = nightPackFee;
      }

      if (hours > 6 || nightPackApplied) {
        mileageFee += exceptedMileageFee;
      }

      if (hours > 72) {
        timeFee = hourPackFees[5].fee + Math.ceil((hours - 72) / 24) * 2640;
      }

      const noNOCFeeParDay = 550;

      const noNOCFee = Math.ceil(hours / 24) * noNOCFeeParDay;

      return {
        fees: {
          totalFee: timeFee + mileageFee + noNOCFee,
          timeFee,
          mileageFee,
          noNOCFee,
        },
        info: {
          feePerKm: feePerKm,
          hourPack: nightPackApplied
            ? {
                name: "ナイトパック",
                fee: nightPackFee,
              }
            : hourPackApplied
            ? {
                name: `${hourPack.hours}時間パック`,
                fee: hourPack.fee,
              }
            : undefined,
        },
      };
    },
  },
  {
    name: "TOYOTA SHARE",
    calculateFee: (startDay, endDay, mileage) => {
      const { hours, minutes } = getHourMin(startDay, endDay);

      let timeFee = 0;
      let mileageFee = 0;

      const feeCalculateBaseMin = 15; // 15min
      const baseFee = 220;

      const feePerKm = 16;

      const exceptedMileageFee = feePerKm * mileage;

      const baseCount = Math.ceil(minutes / feeCalculateBaseMin);

      const nonPackFee = baseFee * baseCount;

      timeFee = nonPackFee;

      const hourPackFees = [
        {
          hours: 6,
          fee: 5610,
        },
        {
          hours: 12,
          fee: 5940,
        },
        {
          hours: 24,
          fee: 7810,
        },
      ];

      const hourPack = hourPackFees.find((pack) => hours <= pack.hours);
      const hourPackApplied = hourPack && timeFee > hourPack.fee;
      if (hourPackApplied) {
        timeFee = hourPack.fee;
      }

      if (hours > 6) {
        mileageFee += exceptedMileageFee;
      }

      function calculateExceededFee(hours: number): number {
        const exceededFeePerHour = 1210;
        const exceededFeePerDay = 6600;

        const exceededHours = hours - 24;
        const exceededDays = Math.ceil((exceededHours + 1) / 24);
        const exceededHoursInLastDay = exceededHours % 24;

        if (exceededHoursInLastDay > exceededFeePerDay / exceededFeePerHour) {
          return exceededFeePerDay * exceededDays;
        } else {
          return (
            exceededFeePerHour * exceededHoursInLastDay +
            exceededFeePerDay * (exceededDays - 1)
          );
        }
      }

      if (hours > 24) {
        timeFee = hourPackFees[2].fee + calculateExceededFee(hours);
      }

      const noNOCFeeParDay = 1650;

      let noNOCFee = Math.ceil(hours / 24) * noNOCFeeParDay;

      if (hours < 6) {
        noNOCFee = 330;
      }

      return {
        fees: {
          totalFee: timeFee + mileageFee + noNOCFee,
          timeFee,
          mileageFee,
          noNOCFee,
        },
        info: {
          feePerKm: feePerKm,
          hourPack: hourPackApplied
            ? {
                name: `${hourPack.hours}時間パック`,
                fee: hourPack.fee,
              }
            : undefined,
        },
      };
    },
  },
  {
    name: "ENEOSカーシェア",
    calculateFee: (startDay, endDay, mileage) => {
      const { hours, minutes } = getHourMin(startDay, endDay);

      let timeFee = 0;
      let mileageFee = 0;

      const feeCalculateBaseMin = 15; // 15min
      const baseFee = 198;

      const feePerKm = 18;

      const exceptedMileageFee = feePerKm * mileage;

      const baseCount = Math.ceil(minutes / feeCalculateBaseMin);

      const nonPackFee = baseFee * baseCount;

      timeFee = nonPackFee;

      const hourPackFees = [
        {
          hours: 6,
          fee: 3960,
        },
        {
          hours: 12,
          fee: 5500,
        },
        {
          hours: 24,
          fee: 6600,
        },
        {
          hours: 36,
          fee: 8800,
        },
        {
          hours: 48,
          fee: 9900,
        },
        {
          hours: 72,
          fee: 14300,
        },
      ];

      const hourPack = hourPackFees.find((pack) => hours <= pack.hours);
      const hourPackApplied = hourPack && timeFee > hourPack.fee;
      if (hourPackApplied) {
        timeFee = hourPack.fee;
      }

      if (hours > 6) {
        mileageFee += exceptedMileageFee;
      }

      const noNOCFeeParDay = 660;

      const noNOCFee = Math.ceil(hours / 24) * noNOCFeeParDay;

      if (hours > 72) {
        return {
          fees: {
            totalFee: 0,
            timeFee: 0,
            mileageFee: 0,
            noNOCFee: 0,
          },
          info: {
            feePerKm: 0,
            hourPack: {
              name: "❌",
              fee: 0,
            },
          },
        };
      }

      return {
        fees: {
          totalFee: timeFee + mileageFee + noNOCFee,
          timeFee,
          mileageFee,
          noNOCFee,
        },
        info: {
          feePerKm: feePerKm,
          hourPack: hourPackApplied
            ? {
                name: `${hourPack.hours}時間パック`,
                fee: hourPack.fee,
              }
            : undefined,
        },
      };
    },
  },
  {
    name: "やさしいカーシェア",
    calculateFee: (startDay, endDay, mileage) => {
      const { hours, minutes } = getHourMin(startDay, endDay);

      let timeFee = 0;
      let mileageFee = 0;

      const feeCalculateBaseMin = 15; // 15min
      const baseFee = 250;

      const feePerKm = 20;

      const exceptedMileageFee = feePerKm * mileage;

      const baseCount = Math.ceil(minutes / feeCalculateBaseMin);

      const nonPackFee = baseFee * baseCount;

      timeFee = nonPackFee;

      const hourPackFees = [
        {
          hours: 1,
          fee: 800,
        },
        {
          hours: 6,
          fee: 4800,
        },
        {
          hours: 12,
          fee: 6800,
        },
        {
          hours: 24,
          fee: 8800,
        },
        {
          hours: 48,
          fee: 17600,
        },
        {
          hours: 72,
          fee: 26400,
        },
      ];

      const hourPack = hourPackFees.find((pack) => hours <= pack.hours);
      const hourPackApplied = hourPack && timeFee > hourPack.fee;
      if (hourPackApplied) {
        timeFee = hourPack.fee;
      }

      if (hours > 6) {
        mileageFee += exceptedMileageFee;
      }

      const noNOCFee = 550;

      if (hours > 72) {
        return {
          fees: {
            totalFee: 0,
            timeFee: 0,
            mileageFee: 0,
            noNOCFee: 0,
          },
          info: {
            feePerKm: 0,
            hourPack: {
              name: "❌",
              fee: 0,
            },
          },
        };
      }

      return {
        fees: {
          totalFee: timeFee + mileageFee + noNOCFee,
          timeFee,
          mileageFee,
          noNOCFee,
        },
        info: {
          feePerKm: feePerKm,
          hourPack: hourPackApplied
            ? {
                name: `${hourPack.hours}時間パック`,
                fee: hourPack.fee,
              }
            : undefined,
        },
      };
    },
  },
  {
    name: "EveryGo",
    calculateFee: (startDay, endDay, mileage) => {
      // 17yen/km
      // 550yen /use
      // night pack 21-07
      
      
      const TYPE = "entry";
      const plans: {
        [index: string]: {
          weekdays: {
            quarter: number;
            four: number;
          };
          eight: number;
          sixteen: number;
          night: number;
          extend: number;
        };
      } = {
        entry: {
          weekdays: {
            quarter: 200,
            four: 2780,
          },
          eight: 4780,
          sixteen: 5780,
          night: 2500,
          extend: 75,
        },
        basic: {
          weekdays: {
            quarter: 250,
            four: 3280,
          },
          eight: 6080,
          sixteen: 7780,
          night: 3100,
          extend: 75,
        },
        middle: {
          weekdays: {
            quarter: 300,
            four: 3780,
          },
          eight: 6780,
          sixteen: 8780,
          night: 3700,
          extend: 96,
        },
        premium: {
          weekdays: {
            quarter: 350,
            four: 4780,
          },
          eight: 8780,
          sixteen: 9980,
          night: 4600,
          extend: 95,
        },
      };
      
      const mileageFee = mileage * 17;
      const { hours, minutes } = getHourMin(startDay, endDay);
      
      // max 167hrs = 1week
      if (hours > 167 ) {
        return {
          fees: {
            totalFee: 0,
            timeFee: 0,
            mileageFee: 0,
            noNOCFee: 0,
          },
          info: {
            feePerKm: 0,
            hourPack: {
              name: "❌",
              fee: 0
            }
          },
        };
      }
      
      const shortFee = checkIsHoliday(startDay) ? undefined : Math.ceil(minutes / 15) * plans[TYPE].weekdays.quarter;
      const fourPack = (() => {
        if (checkIsHoliday(startDay)) return undefined
        if ( hours < 4) {
          return [plans[TYPE].weekdays.four, plans[TYPE].weekdays.four, 0]
        } else {
          const short = Math.ceil((minutes - 4 * 60) / 15) * plans[TYPE].weekdays.quarter
          return [plans[TYPE].weekdays.four + short, plans[TYPE].weekdays.four, short];
        }
      })();
      const eightPack = (()=>{
        if ( hours < 8 ) return [plans[TYPE].eight, plans[TYPE].eight, 0]
        const short = Math.ceil((minutes - 8 * 60) / 15) * plans[TYPE].extend
        return [plans[TYPE].eight + short, plans[TYPE].eight, short];
      })()
      const sixteenPack = (()=>{
        if ( hours < 16 ) return [plans[TYPE].sixteen, plans[TYPE].sixteen, 0]
        const short = Math.ceil((minutes - 16 * 60) / 15) * plans[TYPE].extend
        return [plans[TYPE].sixteen + short, plans[TYPE].sixteen, short];
      })()
      const nightPack = (()=>{
        if ( 
          hours <= 10 &&
          (startDay.getHours() >= 21 || checkDateSmallerThanHour(startDay, 7)) &&
          (endDay.getHours() >= 21 || checkDateSmallerThanHour(endDay, 7))
        ) {
          return plans[TYPE].night
        } else {
          return undefined
        }
      })()
      const packs: [number[] | undefined, string][] = [
        [shortFee ? [shortFee, 0, shortFee] : undefined, "15分料金[平日]"],
        [fourPack, "4時間[平日]"],
        [eightPack, "8時間"],
        [sixteenPack, "16時間"],
        [nightPack ? [nightPack, nightPack, 0] : undefined, "ナイトパック"],
      ]
      let fees: [number[] | undefined, string] = [[9999999999999999999999999999, 0, ], ""]
      // [ [totalFee, packFee, timeFee] , name ]
      for (const pack of packs ) {
        if (pack[0] == undefined) {
          continue
        }
        if ( fees[0]![0] > (pack[0][0])) {
          fees = pack
        }
      }

      if (fees[0]![2] && fees[0]![1]) {
        // if extended
        return {
          fees: {
            totalFee: fees[0]![0] + 550 + mileageFee,
            timeFee: fees[0]![2],
            mileageFee,
            noNOCFee: 550,
          },
          info: {
            feePerKm: 17,
            hourPack: {
              name: `${fees[1]} ${fees[0]![1]}円 延長`, // うしろにfees.hourPack.feeがconcatされる
              fee: fees[0]![2] // hourPackではないけど
            }
          },
        };
      } else {
        return {
          fees: {
            totalFee: fees[0]![0] + 550 + mileageFee,
            timeFee: fees[0]![2],
            mileageFee,
            noNOCFee: 550,
          },
          info: {
            feePerKm: 17,
            hourPack: {
              name: fees[1],
              fee: fees[0]![1]
            }
          },
        };
      }
    },
  },
  {
    name: "eシェアモビ",
    calculateFee: (startDay, endDay, _) => {
      // 月額無料プラン
      // 保険330/24h

      const plans: {
        [index: string]: {
          short: number;
          six: number;
          twelve: number;
          oneday: number;
          night: {
            early: number;
            late: number;
            double: number;
            business: number;
          };
        };
      } = {
        e1: {
          short: 200,
          six: 4100,
          twelve: 7600,
          oneday: 9600,
          night: {
            early: 2600,
            late: 3000,
            double: 3800,
            business: 4300,
          },
        },
        e2: {
          short: 300,
          six: 5400,
          twelve: 9900,
          oneday: 12700,
          night: {
            early: 3300,
            late: 3800,
            double: 4800,
            business: 5400,
          },
        },
        e3: {
          short: 400,
          six: 6200,
          twelve: 11100,
          oneday: 14100,
          night: {
            early: 4000,
            late: 4500,
            double: 5500,
            business: 6200,
          },
        },
        e4: {
          short: 400,
          six: 7200,
          twelve: 12900,
          oneday: 16300,
          night: {
            early: 4600,
            late: 5200,
            double: 6400,
            business: 7200,
          },
        },
      };

      const TYPE = "e1"; // TODO: switch types

      const { hours, minutes } = getHourMin(startDay, endDay);

      // max 72hrs = 3days
      if (hours > 72 ) {
        return {
          fees: {
            totalFee: 0,
            timeFee: 0,
            mileageFee: 0,
            noNOCFee: 0,
          },
          info: {
            feePerKm: 0,
            hourPack: {
              name: "❌",
              fee: 0
            }
          },
        };
      }

      const shortFee = plans[TYPE].short * Math.ceil(minutes / 15);
      const isSixOk = hours <= 6 ? plans[TYPE].six : undefined;
      const isTwelveOk = hours <= 12 ? plans[TYPE].twelve : undefined;
      const isOnedayOk = hours <= 24 ? plans[TYPE].oneday : undefined;
      const isEarlyNightOk =
        hours <= 6 &&
        startDay.getHours() >= 18 &&
        (endDay.getHours() >= 18 || checkDateSmallerThanHour(endDay, 0))
          ? plans[TYPE].night.early
          : undefined;
      const isLateNightOk =
        hours <= 6 &&
        checkDateSmallerThanHour(startDay, 6) &&
        checkDateSmallerThanHour(endDay, 6)
          ? plans[TYPE].night.late
          : undefined;
      const isDoubleNightOk =
        hours <= 12 &&
        (startDay.getHours() >= 18 || checkDateSmallerThanHour(startDay, 6)) &&
        (endDay.getHours() >= 18 || checkDateSmallerThanHour(endDay, 6))
          ? plans[TYPE].night.double
          : undefined;
      const isBusinessNightOk =
        hours <= 17 &&
        (startDay.getHours() >= 17 || checkDateSmallerThanHour(startDay, 10)) &&
        (endDay.getHours() >= 17 || checkDateSmallerThanHour(endDay, 10))
          ? plans[TYPE].night.business
          : undefined;

      const packs = [
        [isEarlyNightOk, "アーリーナイトパック"],
        [isLateNightOk, "レイトナイトパック"],
        [isDoubleNightOk, "ダブルナイトパック"],
        [isBusinessNightOk, "ビジネスナイトパック"],
        [isSixOk, "6時間パック"],
        [isTwelveOk, "12時間パック"],
        [isOnedayOk, "24時間パック"],
      ];

      for (const pack of packs) {
        const packType = pack[0] as number;
        if (packType && packType < shortFee) {
          return {
            fees: {
              totalFee: packType + 330,
              timeFee: packType,
              mileageFee: 0,
              noNOCFee: 330,
            },
            info: {
              feePerKm: 0,
              hourPack: {
                name: pack[1] as string,
                fee: packType,
              },
            },
          };
        }
      }

      const days = Math.ceil(hours / 24);

      if (days > 1) {
        const totalFee = plans[TYPE].oneday * days;
        return {
          fees: {
            totalFee: totalFee + 330 * days,
            timeFee: totalFee,
            mileageFee: 0,
            noNOCFee: 330 * days,
          },
          info: {
            feePerKm: 0,
            hourPack: {
              name: "無限日パック",
              fee: totalFee,
            },
          },
        };
      }

      return {
        fees: {
          totalFee: shortFee + 330,
          timeFee: shortFee,
          mileageFee: 0,
          noNOCFee: 330,
        },
        info: {
          feePerKm: 0,
        },
      };
    },
  },
  {
    name: "トヨタレンタカー",
    calculateFee: (startDay, endDay, mileage) => {
      const { hours, minutes } = getHourMin(startDay, endDay);

      let timeFee = 0;
      let mileageFee = 0;

      const feeCalculateBaseMin = 15; // 15min
      const baseFee = 220;

      const feePerKm = 15;

      const exceptedMileageFee = feePerKm * mileage;

      const baseCount = Math.ceil(minutes / feeCalculateBaseMin);

      const nonPackFee = baseFee * baseCount;

      timeFee = nonPackFee;

      const hourPackFees = [
        {
          hours: 3,
          fee: 4312,
        },
        {
          hours: 6,
          fee: 6160,
        },
        {
          hours: 12,
          fee: 6600,
        },
        {
          hours: 24,
          fee: 8580,
        },
      ];

      const hourPack = hourPackFees.find((pack) => hours <= pack.hours);
      const hourPackApplied = hourPack;
      if (hourPackApplied) {
        timeFee = hourPack.fee;
      }

      mileageFee += exceptedMileageFee;

      if (hours > 24) {
        timeFee = hourPackFees[3].fee + Math.ceil((hours - 24) / 24) * 7260;
      }

      const noNOCFeeParDay = 1650;

      const noNOCFee = Math.ceil(hours / 24) * noNOCFeeParDay;

      return {
        fees: {
          totalFee: timeFee + mileageFee + noNOCFee,
          timeFee,
          mileageFee,
          noNOCFee,
        },
        info: {
          feePerKm: feePerKm,
          hourPack: hourPackApplied
            ? {
                name: `${hourPack.hours}時間パック`,
                fee: hourPack.fee,
              }
            : undefined,
        },
      };
    },
  },
  {
    name: "ニッポンレンタカー",
    calculateFee: (startDay, endDay, mileage) => {
      const { hours, minutes } = getHourMin(startDay, endDay);

      let timeFee = 0;
      let mileageFee = 0;

      const feeCalculateBaseMin = 15; // 15min
      const baseFee = 220;

      const feePerKm = 15;

      const exceptedMileageFee = feePerKm * mileage;

      const baseCount = Math.ceil(minutes / feeCalculateBaseMin);

      const nonPackFee = baseFee * baseCount;

      timeFee = nonPackFee;

      const hourPackFees = [
        {
          hours: 6,
          fee: 6380,
        },
        {
          hours: 12,
          fee: 6380,
        },
        {
          hours: 24,
          fee: 7920,
        },
      ];

      const hourPack = hourPackFees.find((pack) => hours <= pack.hours);
      const hourPackApplied = hourPack;
      if (hourPackApplied) {
        timeFee = hourPack.fee;
      }

      mileageFee += exceptedMileageFee;

      function calculateExceededFee(hours: number): number {
        const exceededFeePerHour = 1210;
        const exceededFeePerDay = 6710;

        const exceededHours = hours - 24;
        const exceededDays = Math.ceil((exceededHours + 1) / 24);
        const exceededHoursInLastDay = exceededHours % 24;

        if (exceededHoursInLastDay > exceededFeePerDay / exceededFeePerHour) {
          return exceededFeePerDay * exceededDays;
        } else {
          return (
            exceededFeePerHour * exceededHoursInLastDay +
            exceededFeePerDay * (exceededDays - 1)
          );
        }
      }

      if (hours > 24) {
        timeFee = hourPackFees[2].fee + calculateExceededFee(hours);
      }

      const noNOCFeeParDay = 1100;

      const noNOCFee = Math.ceil(hours / 24) * noNOCFeeParDay;

      return {
        fees: {
          totalFee: timeFee + mileageFee + noNOCFee,
          timeFee,
          mileageFee,
          noNOCFee,
        },
        info: {
          feePerKm: feePerKm,
          hourPack: hourPackApplied
            ? {
                name: `${hourPack.hours}時間パック`,
                fee: hourPack.fee,
              }
            : undefined,
        },
      };
    },
  },
  {
    name: "ニコニコレンタカー",
    calculateFee: (startDay, endDay, mileage) => {
      const { hours, minutes } = getHourMin(startDay, endDay);

      let timeFee = 0;
      let mileageFee = 0;

      const feeCalculateBaseMin = 15; // 15min
      const baseFee = 220;

      const feePerKm = 15;

      const exceptedMileageFee = feePerKm * mileage;

      const baseCount = Math.ceil(minutes / feeCalculateBaseMin);

      const nonPackFee = baseFee * baseCount;

      timeFee = nonPackFee;

      const hourPackFees = [
        {
          hours: 12,
          fee: 2420,
        },
        {
          hours: 24,
          fee: 4180,
        },
      ];

      const hourPack = hourPackFees.find((pack) => hours <= pack.hours);
      const hourPackApplied = hourPack;
      if (hourPackApplied) {
        timeFee = hourPack.fee;
      }

      mileageFee += exceptedMileageFee;

      function calculateExceededFee(hours: number): number {
        const exceededFeePerDay = 4180;

        const exceededHours = hours - 24;
        const exceededDays = Math.ceil(exceededHours / 24);

        return exceededFeePerDay * exceededDays;
      }

      if (hours > 24) {
        timeFee = hourPackFees[1].fee + calculateExceededFee(hours);
      }

      const noNOCFeeParDay = 2200;

      const noNOCFee = Math.ceil(hours / 24) * noNOCFeeParDay;

      return {
        fees: {
          totalFee: timeFee + mileageFee + noNOCFee,
          timeFee,
          mileageFee,
          noNOCFee,
        },
        info: {
          feePerKm: feePerKm,
          hourPack: hourPackApplied
            ? {
                name: `${hourPack.hours}時間パック`,
                fee: hourPack.fee,
              }
            : undefined,
        },
      };
    },
  },
  {
    name: "タイムズレンタカー",
    calculateFee: (startDay, endDay, mileage) => {
      const { hours, minutes } = getHourMin(startDay, endDay);

      let timeFee = 0;
      let mileageFee = 0;

      const feeCalculateBaseMin = 15; // 15min
      const baseFee = 220;

      const feePerKm = 15;

      const exceptedMileageFee = feePerKm * mileage;

      const baseCount = Math.ceil(minutes / feeCalculateBaseMin);

      const nonPackFee = baseFee * baseCount;

      timeFee = nonPackFee;

      const hourPackFees = [
        {
          hours: 6,
          fee: 3696,
        },
        {
          hours: 12,
          fee: 4488,
        },
        {
          hours: 24,
          fee: 5280,
        },
      ];

      const hourPack = hourPackFees.find((pack) => hours <= pack.hours);
      const hourPackApplied = hourPack;
      if (hourPackApplied) {
        timeFee = hourPack.fee;
      }

      mileageFee += exceptedMileageFee;

      function calculateExceededFee(hours: number): number {
        const exceededFeePerHour = 616;
        const exceededFeePerDay = 4488;

        const exceededHours = hours - 24;
        const exceededDays = Math.ceil(exceededHours / 24);
        const exceededHoursInLastDay = exceededHours % 24;

        if (exceededHoursInLastDay > exceededFeePerDay / exceededFeePerHour || exceededHoursInLastDay == 0) {
          return exceededFeePerDay * exceededDays;
        } else {
          return (
            exceededFeePerHour * exceededHoursInLastDay +
            exceededFeePerDay * (exceededDays - 1)
          );
        }
      }

      if (hours > 24) {
        timeFee = hourPackFees[1].fee + calculateExceededFee(hours);
      }

      const noNOCFeeParDay = 2200;

      const noNOCFee = Math.ceil(hours / 24) * noNOCFeeParDay;

      return {
        fees: {
          totalFee: timeFee + mileageFee + noNOCFee,
          timeFee,
          mileageFee,
          noNOCFee,
        },
        info: {
          feePerKm: feePerKm,
          hourPack: hourPackApplied
            ? {
                name: `${hourPack.hours}時間パック`,
                fee: hourPack.fee,
              }
            : undefined,
        },
      };
    },
  },
  {
    name: "オリックスレンタカー",
    calculateFee: (startDay, endDay, mileage) => {
      const { hours, minutes } = getHourMin(startDay, endDay);

      let timeFee = 0;
      let mileageFee = 0;

      const feeCalculateBaseMin = 15; // 15min
      const baseFee = 220;

      const feePerKm = 15;

      const exceptedMileageFee = feePerKm * mileage;

      const baseCount = Math.ceil(minutes / feeCalculateBaseMin);

      const nonPackFee = baseFee * baseCount;

      timeFee = nonPackFee;

      const hourPackFees = [
        {
          hours: 6,
          fee: 6160,
        },
        {
          hours: 12,
          fee: 6160,
        },
        {
          hours: 24,
          fee: 8250,
        },
      ];

      const hourPack = hourPackFees.find((pack) => hours <= pack.hours);
      const hourPackApplied = hourPack;
      if (hourPackApplied) {
        timeFee = hourPack.fee;
      }

      mileageFee += exceptedMileageFee;

      function calculateExceededFee(hours: number): number {
        const exceededFeePerHour = 1320;
        const exceededFeePerDay = 6160;

        const exceededHours = hours - 24;
        const exceededDays = Math.ceil(exceededHours / 24);
        const exceededHoursInLastDay = exceededHours % 24;

        console.log("or", exceededHours, exceededDays, exceededHoursInLastDay);
        console.log("or", exceededHoursInLastDay, exceededFeePerDay / exceededFeePerHour);

        if (exceededHoursInLastDay > exceededFeePerDay / exceededFeePerHour || exceededHoursInLastDay == 0) {
          return exceededFeePerDay * exceededDays;
        } else {
          console.log("e")
          return (
            exceededFeePerHour * exceededHoursInLastDay +
            exceededFeePerDay * (exceededDays - 1)
          );
        }
      }

      if (hours > 24) {
        timeFee = hourPackFees[1].fee + calculateExceededFee(hours);
      }

      const noNOCFeeParDay = 1100;

      const noNOCFee = Math.ceil(hours / 24) * noNOCFeeParDay;

      return {
        fees: {
          totalFee: timeFee + mileageFee + noNOCFee,
          timeFee,
          mileageFee,
          noNOCFee,
        },
        info: {
          feePerKm: feePerKm,
          hourPack: hourPackApplied
            ? {
                name: `${hourPack.hours}時間パック`,
                fee: hourPack.fee,
              }
            : undefined,
        },
      };
    },
  },
];

export function RentACarComparison() {
  const Today = new Date();
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(new Date().setHours(new Date().getHours() + 24))
  );
  const [usingTime, setUsingTime] = useState(0);
  const [mileage, setMileage] = useState(100);

  useEffect(() => {
    setUsingTime(getHourMin(startDate, endDate).hours)
  }, [startDate, endDate])

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Rent-a-Car Fee Comparison</CardTitle>
        <CardDescription>
          Compare rental fees based on your trip details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate" className="block">
                利用開始
              </Label>
              <DatePicker
                id="startDate"
                selected={startDate}
                onChange={(date) => date && setStartDate(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="yyyy/MM/dd HH:mm"
                minDate={Today}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="block">
                利用終了
              </Label>
              <DatePicker
                id="endDate"
                selected={endDate}
                onChange={(date) => date && setEndDate(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="yyyy/MM/dd HH:mm"
                minDate={Today}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="usingTime">利用時間 (時間)</Label>
            <Input
              id="usingTime"
              type="number"
              min="0"
              value={usingTime}
              onChange={(e) =>
              {
                setUsingTime(Math.max(0, parseInt(e.target.value) || 0))
                setEndDate(new Date(startDate.getTime() + (parseInt(e.target.value) || 0) * 60 * 60 * 1000))
              }
              }
            />
          </div>
          <div>
            <Label htmlFor="mileage">走行予定距離 (km)</Label>
            <Input
              id="mileage"
              type="number"
              min="0"
              value={mileage}
              onChange={(e) =>
                setMileage(Math.max(0, parseInt(e.target.value) || 0))
              }
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>サービス</TableHead>
              <TableHead>距離料金レート</TableHead>
              <TableHead>時間料金</TableHead>
              <TableHead>距離料金</TableHead>
              <TableHead>保険料金</TableHead>
              <TableHead>合計料金</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rentalCompanies.map((company) => {
              const result = company.calculateFee(startDate, endDate, mileage);
              return (
                <TableRow key={company.name}>
                  <TableCell>{company.name}</TableCell>
                  <TableCell>
                    {result.info.feePerKm.toLocaleString()}円/km
                  </TableCell>
                  <TableCell>
                    {result.info.hourPack
                      ? result.info.hourPack.name + " "
                      : "通常料金 "}
                    {result.info.hourPack ? result.info.hourPack.fee.toLocaleString() : result.fees.timeFee.toLocaleString()}円
                  </TableCell>
                  <TableCell>
                    {result.fees.mileageFee.toLocaleString()}円
                  </TableCell>
                  <TableCell>
                    {result.fees.noNOCFee.toLocaleString()}円
                  </TableCell>
                  <TableCell className="font-bold">
                    {result.fees.totalFee.toLocaleString()}円
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
