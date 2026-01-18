import { genkit } from "genkit";
import { googleAI } from "./plugin";
import { config } from 'dotenv';

config();

export const ai = genkit({
  plugins: [
    googleAI(),
  ],
});
