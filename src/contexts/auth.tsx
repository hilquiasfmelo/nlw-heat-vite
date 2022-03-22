import { createContext, ReactNode, useCallback, useEffect, useState } from "react";

import { api } from "../services/api";

type User = {
  id: string;
  name: string;
  login: string;
  avatar_url: string;
}

type IAuthContextData = {
  user: User | null;
  signInURL: string;
  signOut: () => void;
}

interface IAuthResponse {
  token: string;
  user: {
    id: string;
    avatar_url: string;
    name: string;
    login: string;
  }
}

const AuthContext = createContext<IAuthContextData>({} as IAuthContextData);

type IAuthProvider = {
  children: ReactNode;
}

export function AuthProvider(props: IAuthProvider) {
  const [user, setUser] = useState<User | null>(null);

  const signInURL = `https://github.com/login/oauth/authorize?scope=user&client_id=24676daf6b4735d35c39&redirect_uri=http://localhost:3000`;

  // Função de logar o usuário na aplicação
  const signIn = useCallback(async (githubCode: string) => {
    const response = await api.post<IAuthResponse>('/authenticate', {
      code: githubCode
    });

    const { token, user } = response.data;

    localStorage.setItem('@dowhile:token', token);

    // Busca o token do cabeçalho headers
    api.defaults.headers.common.authorization = `Bearer ${token}`;

    setUser(user);
  }, []);

  // Função de deslogar o usuário da aplicação
  const signOut = useCallback(() => {
    setUser(null);

    localStorage.removeItem('@dowhile:token');
  }, []);

  // Carrega os dados do usuário vindo do Github
  useEffect(() => {
    const token = localStorage.getItem('@dowhile:token');

    if (token) {
      // Busca o token do cabeçalho headers
      api.defaults.headers.common.authorization = `Bearer ${token}`;

      api.get<User>('/user/profile').then(response => {
        setUser(response.data);
      });
    }
  }, []);

  // Carrega a função de login do usuário com o Github
  useEffect(() => {
    // Busca a URL que é retornada no navegador
    const url = window.location.href;
    const hasGithubCode = url.includes('?code=');

    if (hasGithubCode) {
      const [urlWithoutCode, githubCode] = url.split('?code=');

      // Remove o código da URL do navegador para que o usuário não veja
      window.history.pushState({}, '', urlWithoutCode);

      signIn(githubCode);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, signInURL, signOut }}>
      {props.children}
    </AuthContext.Provider>
  )
}

export { AuthContext };