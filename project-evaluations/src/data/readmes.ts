import { convertPathToProjectId } from "../utils";

const readmeFiles = import.meta.glob<string>("../../../subgraph/src/*/README.md", {
  eager: true,
  import: "default",
  query: "?raw",
});
const readmePaths = Object.keys(readmeFiles);

export const readmes = readmePaths.reduce<Record<string, string>>((accumulator, path) => {
  const projectId = convertPathToProjectId(path);

  if (!projectId) {
    return accumulator;
  }

  return {
    ...accumulator,
    [projectId]: readmeFiles[path] ?? "",
  };
}, {});
