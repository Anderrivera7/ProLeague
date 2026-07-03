import { readFileSync } from "fs";
import { parseFc26Csv } from "../src/lib/fc-data/csv-parser";

const csvPath =
  process.argv[2] ?? "c:/Users/User/Downloads/FC26_20250921.csv";

const rows = parseFc26Csv(readFileSync(csvPath, "utf8"));
const france = rows.filter(
  (r) => r.nationalityId === 18 && r.nationJerseyNumber != null
);
console.log("Total rows:", rows.length);
console.log("France squad:", france.length);
france
  .sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0))
  .forEach((p) =>
    console.log(
      `${p.overall} ${p.name} ${p.nationPosition} #${p.nationJerseyNumber}`
    )
  );
