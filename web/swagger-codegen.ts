import fs from "node:fs";
import path from "node:path";
import { generateApi } from "swagger-typescript-api";

const savePath = path.resolve(process.cwd(), "./shared/typedefs/");
const swaggerUrl = process.env["SWAGGER_URL"] ?? "http://localhost:3000/swagger-json";

function toSnakeUpperCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1_$2")
    .replace(/[\s\-./]+/g, "_")
    .toUpperCase();
}

function transformFileContent(fileContent: string) {
  const faultyEnumRegex = new RegExp(/export enum (I(\w+))/g);
  const enums = [...fileContent.matchAll(faultyEnumRegex)];

  let updatedFileContent = fileContent;

  for (const [, enumCurrentName, enumActualName] of enums) {
    if (!enumCurrentName || !enumActualName) {
      continue;
    }

    updatedFileContent = updatedFileContent.replaceAll(enumCurrentName, enumActualName);
  }

  // Replace invalid boolean enums with `as const` objects
  const booleanEnumRegex = /export enum (\w+) \{([^}]*(?:= (?:true|false))[^}]*)\}/g;

  updatedFileContent = updatedFileContent.replace(
    booleanEnumRegex,
    (_match, enumName: string, enumBody: string) => {
      const members = enumBody
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean)
        .map((m) => {
          const [key, value] = m.split("=").map((s) => s.trim());
          return `  ${key}: ${value}`;
        })
        .join(",\n");

      return `export const ${enumName} = {\n${members},\n} as const;\nexport type ${enumName} = (typeof ${enumName})[keyof typeof ${enumName}]`;
    },
  );

  return updatedFileContent;
}

/* NOTE: all fields are optional expect one of `input`, `url`, `spec` */
generateApi({
  output: savePath,
  url: swaggerUrl,
  fileName: "api",

  defaultResponseAsSuccess: false,
  generateClient: false,
  generateRouteTypes: false,
  generateResponses: true,
  toJS: false,
  extractRequestParams: true,
  extractRequestBody: true,
  extractEnums: true,
  unwrapResponseData: false,
  defaultResponseType: "void",
  cleanOutput: false,
  enumNamesAsValues: false,
  moduleNameFirstTag: false,
  generateUnionEnums: false,
  typePrefix: "I",
  typeSuffix: "",
  enumKeyPrefix: "",
  enumKeySuffix: "",
  addReadonly: true,
  sortTypes: true,

  hooks: {
    onFormatTypeName: (formattedName, rawTypeName, schemaType) => {
      if (schemaType !== "enum-key") {
        return formattedName;
      }
      if (!rawTypeName) {
        return formattedName;
      }

      return toSnakeUpperCase(rawTypeName) ?? formattedName;
    },
  },
})
  .then(({ files }) => {
    files.forEach(({ fileContent, fileName, fileExtension: fileExtensionWithDot }) => {
      const transformedFileContent = transformFileContent(fileContent);

      const fullFilePath = path.resolve(savePath, `${fileName}${fileExtensionWithDot}`);

      fs.writeFileSync(fullFilePath, transformedFileContent);
    });
  })
  .catch((e) => console.error(e));
