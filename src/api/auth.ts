import { fetchApi } from "./fetch";

export const postSignupLoginMutation = async ({
  username,
  hashedPassword,
  isLogin,
}: {
  username: string;
  hashedPassword: string;
  isLogin: boolean;
}) => {
  if (isLogin) {
    return fetchApi("POST", "/login", {
      username,
      password: hashedPassword,
    });
  } else {
    return fetchApi("POST", "/signup", {
      username,
      password: hashedPassword,
    });
  }
};
