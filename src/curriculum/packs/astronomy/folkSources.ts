/**
 * The source of each constellation's folk names and story in the locales
 * (`starMapper.constellations.<id>.folk` / `.story`). A folk key without an
 * entry here fails `packs.test.ts`. The quoted passages are in khe-meta
 * `plans/study-star-sky.md` "Sources".
 */
const MT46 = {
  title: 'A. Kuperjanov, „Sandivanker”. Mäetagused 46 (2010)',
  url: 'https://www.folklore.ee/tagused/nr46/kuperjanov.pdf',
};

export const FOLK_SOURCES: Readonly<Record<string, { title: string; url: string }>> = {
  ursa_major: MT46,
  ursa_minor: MT46,
  delphinus: MT46,
  orion: {
    title: 'A. Kuperjanov, „Libamütoloogilised taevakaardid”. Mäetagused 30 (2005)',
    url: 'https://www.folklore.ee/tagused/nr30/libamyto.pdf',
  },
  pegasus: {
    title: 'A. Kuperjanov, „Libamütoloogilised taevakaardid”. Mäetagused 30 (2005)',
    url: 'https://www.folklore.ee/tagused/nr30/libamyto.pdf',
  },
  cygnus: {
    title: 'A. Kuperjanov, „Linnutee”. Mäetagused 16 (2001)',
    url: 'https://www.folklore.ee/tagused/nr16/cps.pdf',
  },
  lyra: {
    title: 'A. Lintrop, uskumuste kartoteek: tähtkujud (H II 71, 584, Kadrina)',
    url: 'https://www.folklore.ee/~aado/maailm/kujud.htm',
  },
};
