// Augment NodeJS namespace to type process.env.API_KEY correctly without shadowing the global process variable
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
    [key: string]: string | undefined;
  }
}
