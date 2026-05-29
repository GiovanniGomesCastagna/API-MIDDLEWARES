const hoje = new Date().toLocaleDateString("sv-SE", {
  timeZone: "America/Sao_Paulo",
});


const dataInserida = new Date("2026-05-26").toISOString().split('T')[0];


if (dataInserida >= hoje) {
  console.log("é válido ");
} else {
  console.log(`n é válido`);
}

console.log(hoje);
console.log(dataInserida);
