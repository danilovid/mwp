"use client";

import { useActionState } from "react";
import { changePassword, createUser } from "../../actions";
import { Message, Submit } from "../../ui";

const col = { display: "flex", flexDirection: "column", gap: 12 } as const;

export function PasswordForm() {
  const [state, action] = useActionState(changePassword, null);
  return (
    <form action={action} style={col}>
      <label className="field">
        Текущий пароль
        <input name="current" type="password" required autoComplete="current-password" />
      </label>
      <label className="field">
        Новый пароль (от 10 символов)
        <input name="next" type="password" required minLength={10} autoComplete="new-password" />
      </label>
      <Submit>Сменить пароль</Submit>
      <Message state={state} />
    </form>
  );
}

export function UserForm() {
  const [state, action] = useActionState(createUser, null);
  return (
    <form action={action} style={col}>
      <label className="field">
        Логин
        <input name="login" required pattern="[a-zA-Z0-9._\-]{3,40}" autoComplete="off" />
      </label>
      <label className="field">
        Пароль (от 10 символов)
        <input name="password" type="password" required minLength={10} autoComplete="new-password" />
      </label>
      <Submit>Добавить</Submit>
      <Message state={state} />
    </form>
  );
}
