import IMIEnrichmentAddress from "./IMIEnrichmentAddress.mjs";

console.log(await IMIEnrichmentAddress("福井県鯖江市新横江2-3-4"));
console.log(await IMIEnrichmentAddress("東京都世田谷区三軒茶屋二丁目"));
console.log(await IMIEnrichmentAddress("東京都"));
