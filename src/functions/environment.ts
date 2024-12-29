export const getEnvironment = (): "" | "local" | "staging" | "production" => {
    return (process.env.NODE_ENV as "local" | "staging" | "production") || "";
  };
  