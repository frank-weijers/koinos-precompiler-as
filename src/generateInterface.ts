import { TsStructure } from "./interface";

export function generateInferface(tsStructure: TsStructure) {
  const { className, protoAs, methods, hasAuthorize } = tsStructure;

  return `import { System, Protobuf${
    hasAuthorize ? ", authority" : ""
  } } from "koinos-sdk-as";${protoAs
    .map((p) => {
      return `
import { ${p} } from "./proto/${p}";`;
    })
    .join("")}

export class ${className} {
  _contractId: Uint8Array;

  /**
   * Create an instance of a ${className} contract
   * @example
   * ${"```"}ts
   *   const contract = new ${className}(Base58.decode("1DQzuCcTKacbs9GGScFTU1Hc8BsyARTPqe"));
   * ${"```"}
   */
  constructor(contractId: Uint8Array) {
    this._contractId = contractId;
  }${methods
    .map((m) => {
      return `${m.comment}
  ${m.name}(${m.argType ? `args: ${m.argType}` : ""}): ${m.retType} {
    const argsBuffer = ${
      m.argType
        ? `Protobuf.encode(args, ${m.argType}.encode);`
        : "new Uint8Array(0);"
    }
    ${
      m.isVoid ? "" : "const resultBuffer = "
    }System.callContract(this._contractId, ${m.entryPoint}, argsBuffer);
    ${
      m.isVoid
        ? "return;"
        : `return Protobuf.decode<${m.retType}>(resultBuffer, ${m.retType}.decode);`
    }
  }`;
    })
    .join("")}
}
`;
}

export default generateInferface;
