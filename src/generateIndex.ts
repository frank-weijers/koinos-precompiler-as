import { TsStructure } from "./interface";

function getAllMethods(
  ts: TsStructure,
  entryPoints: string[] = []
): TsStructure[] {
  const allMethods: TsStructure[] = [];
  const methodsToAdd = ts.methods.filter(
    (m) => !entryPoints.includes(m.entryPoint)
  );
  if (methodsToAdd.length > 0)
    allMethods.push({ ...ts, methods: methodsToAdd });
  ts.methods.forEach((m) => entryPoints.push(m.entryPoint));
  ts.extends.forEach((e) => {
    allMethods.push(...getAllMethods(e, entryPoints));
  });

  return allMethods;
}

export function generateIndex(tsStructure: TsStructure) {
  const { className, protoAs, hasAuthorize } = tsStructure;
  const maxReturnBuffer = 1024;

  const allMethods = getAllMethods(tsStructure);

  return `import { System, Protobuf${
    hasAuthorize ? ", authority" : ""
  } } from "koinos-sdk-as";
import { ${className} } from "./${className}";${protoAs
    .map((p) => {
      return `
import { ${p} } from "./proto/${p}";`;
    })
    .join("")}

const entryPoint = System.getEntryPoint();
const argsBuffer = System.getContractArguments();
let returnBuffer = new Uint8Array(${maxReturnBuffer});
const contract = new ${className}();

switch (entryPoint) {
  ${allMethods
    .map((t) => {
      return `/* class ${t.className} */
    
  ${t.methods
    .map((m) => {
      return `// ${m.name}
  case ${m.entryPoint}: {${
        m.argType
          ? `
    const args = Protobuf.decode<${m.argType}>(argsBuffer, ${m.argType}.decode);`
          : ""
      }
    ${m.isVoid ? "" : "const result = "}contract.${m.name}(${
        m.argType ? "args" : ""
      });
    ${
      m.isVoid
        ? `returnBuffer = new Uint8Array(0);`
        : `returnBuffer = Protobuf.encode(result, ${m.retType}.encode);`
    }
    break;
  }

  `;
    })
    .join("")}`;
    })
    .join("")}default: {
    System.exitContract(1);
    break;
  }
}

System.setContractResult(returnBuffer);
System.exitContract(0);
`;
}

export default generateIndex;
