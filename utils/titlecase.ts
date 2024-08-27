import { apStyleTitleCase } from "ap-style-title-case";

/**
 * Collection of "stop words" that are not capitalized unless they are the first or last word in the title.
 *
 * This is for Indonesian language.
 *
 * References:
 * - https://ivanlanin.wordpress.com/2020/01/21/kapitalisasi-judul/
 * - https://penerbitdeepublish.com/kapitalisasi-judul/
 */
const idStopwords = [
  "di",
  "ke",
  "dari",
  "pada",
  "dalam",
  "yaitu",
  "kepada",
  "daripada",
  "untuk",
  "bagi",
  "ala",
  "bak",
  "tentang",
  "mengenai",
  "sebab",
  "secara",
  "terhadap",
  "di",
  "ke",
  "dari",
  "dalam",
  "atas",
  "oleh karena",
  "oleh sebab",
  "oleh",
  "kepada",
  "terhadap",
  "akan",
  "dengan",
  "tentang",
  "sampai",
  "dan",
  "serta",
  "atau",
  "tapi",
  "tetapi",
  "namun",
  "melainkan",
  "padahal",
  "sedangkan",
  "yang",
  "agar",
  "supaya",
  "biar",
  "biarpun",
  "jika",
  "kalau",
  "jikalau",
  "asal",
  "asalkan",
  "bila",
  "manakala",
  "sejak",
  "semenjak",
  "sedari",
  "sewaktu",
  "tatkala",
  "ketika",
  "sementara",
  "begitu",
  "seraya",
  "selagi",
  "selama",
  "sambil",
  "demi",
  "setelah",
  "sesudah",
  "sebelum sehabis",
  "selesai",
  "seusai",
  "hingga",
  "sampai",
  "andaikan",
  "seandainya",
  "umpamanya",
  "sekiranya",
  "biar",
  "biarpun",
  "walau",
  "walaupun",
  "sekalipun",
  "sungguh",
  "sungguhpun",
  "kendati",
  "kendatipun",
  "seakan-akan",
  "seolah-olah",
  "sebagaimana",
  "seperti",
  "sebagai",
  "laksana",
  "ibarat",
  "daripada",
  "alih-alih",
  "sebab",
  "karena",
  "sehingga",
  "sampai",
  "maka",
  "makanya",
  "oh",
  "dong",
  "sih",
  "wow",
  "yuk",
  "lho",
  "kok",
  "para",
  "si",
  "sih",
  "sang",
  "pun",
  "per",
];
/**
 * Collection of "stop words" that are not capitalized unless they are the first or last word in the title.
 *
 * This is for English language", "based on AP Style.
 *
 * References:
 * - https://www.npmjs.com/package/ap-style-title-case#algorithm
 */
const enStopwords = [
  "a",
  "an",
  "and",
  "at",
  "but",
  "by",
  "for",
  "in",
  "nor",
  "of",
  "on",
  "or",
  "so",
  "the",
  "to",
  "up",
  "yet",
];

/**
 * Collection of "stop words" that are not capitalized unless they are the first or last word in the title.
 *
 * This is a combination of both English and Indonesian stop words.
 */
const allStopWords = [...enStopwords, ...idStopwords];

/**
 * Convert a text to title case.
 *
 * @param text The text to convert to title case.
 * @param lang The language to use for stop words. Default is "all".
 */
export default (text: string, lang?: "en" | "id" | "all" | string): string => {
  const preferLang = ["en", "id", "all"].includes(lang ?? "all") ? lang : "all";

  const preferStopWords = preferLang === "all" ? allStopWords : preferLang === "id" ? idStopwords : enStopwords;

  return apStyleTitleCase(text, {
    stopwords: preferStopWords,
  });
};
