"use client";

import { useActionState } from "react";
import { loginAction } from "../actions";
import { Message, Submit } from "../ui";
import s from "../admin.module.css";

export function LoginForm() {
  const [state, action] = useActionState(loginAction, null);
  return (
    <div className={s.loginWrap}>
      <form action={action} className={s.loginCard}>
        <div className={s.brand} style={{ color: "var(--ink)", padding: 0 }}>
          <span className={s.brandBar} />
          MWP <small>админка</small>
        </div>
        <h1>Вход</h1>
        <label className="field">
          Логин
          <input name="login" required autoComplete="username" autoCapitalize="none" />
        </label>
        <label className="field">
          Пароль
          <input name="password" type="password" required autoComplete="current-password" />
        </label>
        <Message state={state} />
        <Submit>Войти</Submit>
      </form>
    </div>
  );
}
