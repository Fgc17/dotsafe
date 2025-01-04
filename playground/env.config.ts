import { tsenv } from "../src";

export default tsenv.config({
  loader: async () => {
    return {
      API_URL: "https://api.example.com",
      API_KEY: "1234567890",
    };
  },
});
