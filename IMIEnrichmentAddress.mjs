import find from "./lib/find.mjs";
import bangou from "./lib/bangou.mjs";
import util from "./lib/util.mjs";

/* // response
{
  "@type": "場所型",
  "住所": {
    "@type": "住所型",
    "表記": "霞が関2-1-10",
    "都道府県": "東京都",
    "都道府県コード": "http://data.e-stat.go.jp/lod/sac/C13000",
    "市区町村": "千代田区",
    "市区町村コード": "http://data.e-stat.go.jp/lod/sac/C13101",
    "町名": "霞が関",
    "丁目": "2",
    "番地": "1",
    "号": "10"
  },
  "地理座標": {
    "@type": "座標型",
    "緯度": "35.675551",
    "経度": "139.750413"
  }
}
*/
const makeAddressJSON = r => {
  const res = {
    "@type": "住所型",
    // "表記": r.adr.pref + r.adr.city + (r.adr.town || "") + (r.adr.tail),
    "都道府県": r.adr.pref,
    "都道府県コード": "http://data.e-stat.go.jp/lod/sac/C" + r.lgcodepref,
    "市区町村": r.adr.city,
    "市区町村コード": "http://data.e-stat.go.jp/lod/sac/C" + r.lgcode,
  };
  if (r.adr.town && r.adr.town.match(/^(.+)(\d+)$/)) {
    res["町名"] = RegExp.$1;
    res["丁目"] = RegExp.$2;
  }
  return res;
};

// 住所から緯度経度付き場所型を返す
const enrich = async function(src) {
  const dst = typeof src === 'string' ? {
    "@context": "https://imi.go.jp/ns/core/context.jsonld",
    "@type": "場所型",
    "住所": {
      "@type": "住所型",
      "表記": src
    }
  } : JSON.parse(JSON.stringify(src));

  const targets = [];

  const dig = function(focus, parent) {
    if (Array.isArray(focus)) {
      focus.forEach(a => dig(a));
    } else if (typeof focus === 'object') {
      if (focus["@type"] === "住所型" && focus["表記"]) {
        targets.push(parent && parent["@type"] === "場所型" ? parent : focus);
      }
      Object.keys(focus).forEach(key => {
        dig(focus[key], focus);
      });
    }
  };
  dig(dst, null);

  if (targets.length === 0) {
    return Promise.resolve(dst);
  }

  const promises = targets.map(async target => {
    try {
      const address = target["住所"] || target;
      const response = await find(address["表記"]);
      // console.log(address["表記"], response);
      
      const json = makeAddressJSON(response);
      Object.keys(json).forEach(key => address[key] = json[key]);

      // console.log(response.adr.tail);
      const stail = response.adr.tail;
      const tail = bangou(stail.startsWith("-") ? stail.substring(1) : stail);
      Object.keys(tail).forEach(key => {
        address[key] = tail[key];
      });
      if (response.latlng && target !== address) {
        const ll = response.latlng.split(",");
        target["地理座標"] = {
          "@type": "座標型",
          "緯度": ll[0],
          "経度": ll[1],
        };
      }
      // console.log(target);
      // Promise.resolve(target);
      return target;
    } catch (e) {
      // console.log(e);
      util.put(target, "メタデータ", {
        "@type": "文書型",
        "説明": "該当する地名が見つかりません"
      });
      return target;
      /*
      if (response.multipleChoice) {
        util.put(target, "メタデータ", {
          "@type": "文書型",
          "説明": "該当する地名が複数あります"
        });
        return Promise.resolve(target);
      }
      */
    }
  });
  return await Promise.all(promises);
};
export default enrich; // async
