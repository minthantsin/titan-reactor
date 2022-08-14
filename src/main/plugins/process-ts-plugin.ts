import { resolve } from "path";
import * as tsm from "ts-morph";

const fn = (filename: string) => resolve(process.cwd(), filename);

export const removeImportDeclarations = (content: string, specifiers: string[] | true) => {
    const project = new tsm.Project({
        tsConfigFilePath: fn("./tsconfig.json"),
        compilerOptions: {
            isolatedModules: false,
            module: tsm.ModuleKind.CommonJS,
            target: tsm.ts.ScriptTarget.ESNext,
            allowJs: true,
        },
        skipAddingFilesFromTsConfig: true,
    });
    const file = project.createSourceFile("plugin.ts", content);
    for (const importDecl of file.getImportDeclarations()) {
        if (specifiers === true || specifiers.includes(importDecl.getModuleSpecifierValue())) {
            importDecl.remove();
        }
    }
    return file.getText(true);
}