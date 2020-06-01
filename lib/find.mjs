// import util from "./util.mjs";
import { getLGCode } from "https://code4sabae.github.io/lgcode/lgcode.mjs";
import { getGeocode } from "https://code4sabae.github.io/geocode/geocode.mjs";
// import { getGeocode } from "../../geocode/geocode.mjs";

const CHOME = [
  "〇", "一", "二", "三", "四", "五", "六", "七", "八", "九",
  "十", "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九",
  "二十", "二十一", "二十二", "二十三", "二十四", "二十五", "二十六", "二十七", "二十八", "二十九",
  "三十", "三十一", "三十二", "三十三", "三十四", "三十五", "三十六", "三十七", "三十八", "三十九",
  "四十", "四十一", "四十二", "四十三", "四十四", "四十五", "四十六", "四十七", "四十八", "四十九",
  "五十", "五十一", "五十二", "五十三", "五十四", "五十五", "五十六", "五十七", "五十八", "五十九",
  "六十", "六十一", "六十二", "六十三", "六十四", "六十五", "六十六", "六十七", "六十八", "六十九",
  "七十", "七十一", "七十二", "七十三", "七十四", "七十五", "七十六", "七十七", "七十八", "七十九",
  "八十", "八十一", "八十二", "八十三", "八十四", "八十五", "八十六", "八十七", "八十八", "八十九",
  "九十", "九十一", "九十二", "九十三", "九十四", "九十五", "九十六", "九十七", "九十八", "九十九"
];

const normalizeAddress = adr => {
  adr = adr.replace(/\s/g, "");
  // 十三丁目 -> 13-
  if (adr.match(/^(.*[^十一二三四五六七八九])([十一二三四五六七八九]+)(丁目)(.*)$/)) {
    const r = [RegExp.$1, CHOME.indexOf(RegExp.$2)]
    if (RegExp.$4.length > 0) {
      r.push("-");
      r.push(RegExp.$4);
    }
    return r.join("");
  }
  return adr;
};

const parseAddress = address => {
  // const normalized = util.simplify(address).replace(/\s/g, "");
  const normalized = normalizeAddress(address);
  if (normalized.match(/^(.+[都道府県])(.+[郡])(.+[町村])(.*)$/)) {
    return { pref: RegExp.$1, city: RegExp.$3, tail: RegExp.$4 };
  } else if (normalized.match(/^(.+[都道府県])(.+[区市町村])(.*)$/)) {
    return { pref: RegExp.$1, city: RegExp.$2, tail: RegExp.$3 };
  }
  throw new Error("parseAddress error: " + address);
}

const find = async address => {
  const adr = parseAddress(address);
  const lgcode = getLGCode(adr.pref, adr.city);
  const lgcodepref = Math.floor(lgcode / 1000) * 1000;
  const geocode = await getGeocode(lgcode);
  if (geocode) {
    for (let i = adr.tail.length; i > 0; i--) {
      const chome = adr.tail.substring(0, i);
      const latlng = geocode[chome];
      if (latlng) {
        adr.town = chome;
        adr.tail = adr.tail.substring(chome.length);
        return { adr, lgcode, lgcodepref, latlng };
      }
    }
  }
  return { adr, lgcode, lgcodepref };
};

/*


  // 正解と末尾をもとに丁目コードを追加して返す
  const fix = function(hit, tail) {
    if (hit.chome > 0) {
      if (!tail.trim().match(/^[0-9０-９一二三四五六七八九十〇]+/)) {
        return {
          code: hit.code,
          tail: tail,
          expectedChome: hit.chome,
          actualChome: null
        };
      }
      let chome = tail.trim().match(/^[0-9０-９一二三四五六七八九十〇]+/)[0];
      let rest = tail.trim().substring(chome.length);
      chome = util.k2h(util.z2h(chome));
      if (chome.match(/^([0-9]+)$/)) {
        while (chome.length < 3) chome = "0" + chome;
        rest = rest.replace(/^(丁目|\-)/, "");
        if (hit.chome < parseInt(chome)) return {
          code: hit.code,
          tail: rest,
          expectedChome: hit.chome,
          actualChome: parseInt(chome)
        };
        return {
          code: hit.code + chome,
          tail: rest
        };
      }
    }
    return {
      code: hit.code + (hit.code.length === 9 ? "000" : ""),
      tail: tail
    }
  };

  console.log("n", normalized);

  // 市区町村にヒットする場合
  for (let i = normalized.length; i >= 0; i--) {
    const head = normalized.substring(0, i);
    const answer = upper[head];
    if (answer !== undefined) {
      if (answer.length > 1) {
        return {
          multipleChoice: true
        };
      }
      let latest = answer[0];
      while (latest.next) latest = latest.next;
      for (let j = normalized.length; j > i; j--) {
        const body = normalized.substring(i, j);
        const tail = normalized.substring(j).trim();
        const hit = latest.children.find(child => body === child.label);
        if (hit !== undefined) {
          return fix(hit, tail);
        }
      }
      return {
        code: answer[0].code,
        tail: normalized.substring(i)
      };
    }
  }

  // 市区町村にヒットしない場合
  for (let i = normalized.length; i >= 0; i--) {
    const head = normalized.substring(0, i);
    const hit = lower[head];
    if (hit !== undefined) {
      const tail = normalized.substring(i).trim();
      return fix(hit, tail);
    }
  }

  return null;
};
*/

export default find;
