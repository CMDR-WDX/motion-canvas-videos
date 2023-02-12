import {defineConfig} from "vite"
// vite.config.ts
import glob from "glob";
import motionCanvas from '@motion-canvas/vite-plugin';


// taken from https://github.com/motion-canvas/motion-canvas/issues/324#issue-1581205447

export default defineConfig({
  plugins: [
    motionCanvas({
      // Will automatically grab all top-level folders inside `./src/projects/` and 
      // expose them as projects. These folders should contain an `index.ts` file 
      // that exports the project configuration.
      project: glob.sync("./src/projects/*.ts"),
    }),
  ],
});