import { describe, it, expect, makeDirname } from "https://taisukef.github.io/denolib/nodelikeassert.mjs"
const __dirname = makeDirname(import.meta.url)

import enrich from "../IMIEnrichmentAddress.mjs";

const spec = __dirname + "/../spec";

describe('imi-enrichment-address#main', function() {

  describe("spec", function() {
    const files = [];
    const ifiles = Deno.readDirSync(spec);
    for (const f of ifiles) { files.push(f) }
    files.filter(file => file.name.match(/json$/)).forEach(file => {
      describe(file.name, function() {
        const json = JSON.parse(Deno.readTextFileSync(`${spec}/${file.name}`))
        json.forEach(a => {
          it(a.name, async () => {
            const json = await enrich(a.input)
            expect(json).deep.equal(a.output);
          });
        });
      });
    });
  });

});
