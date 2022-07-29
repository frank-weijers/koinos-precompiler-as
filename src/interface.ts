export interface Abi {
  methods: {
    [x: string]: {
      entry_point: number;
      argument?: string;
      return?: string;
      read_only?: boolean;
      "read-only"?: boolean;
      description?: string;
    };
  };
  types: string;
  koilib_types: unknown;
}

export interface TsStructure {
  className: string;
  protoAs: string[];
  methods: {
    name: string;
    comment: string;
    entryPoint: string;
    argType: string;
    retType: string;
    isVoid: boolean;
  }[];
  hasAuthorize: boolean;
}

export interface TypeModel {
  typeName: string;
}

export interface Argument {
  name: string;
  type: TypeModel;
}
