import { FormEvent, useContext, useState } from 'react';
import { VscGithubInverted, VscSignOut } from 'react-icons/vsc';

import { AuthContext } from '../../contexts/auth';
import { api } from '../../services/api';
import styles from './styles.module.scss';

export function SendMessageForm() {
  const { user, signOut } = useContext(AuthContext);
  const [text, setText] = useState('');

  async function handleSendMessage(event: FormEvent) {
    event.preventDefault();

    if (!text.trim()) {
      return;
    }

    await api.post('/message', { text });

    setText('');
  }

  return (
    <div className={styles.sendMessageFormWrapper}>
      <button onClick={signOut} className={styles.signOutButton}>
        <VscSignOut size={32} />
      </button>

      <header className={styles.userInformation}>
        <div className={styles.userImage}>
          <img src={user?.avatar_url} alt={user?.name} />
        </div>

        <strong className={styles.userName}>{user?.name}</strong>

        <span className={styles.userGithub}>
          <VscGithubInverted size={16} />
          {user?.login}
        </span>
      </header>

      <form onSubmit={handleSendMessage} className={styles.sendMessageForm}>
        <label htmlFor="text">Mensagem</label>
        <textarea
          name='text'
          id='text'
          placeholder='Qual sua expectativa para o evento?'
          onChange={event => setText(event.target.value)}
          value={text}
        />

        <button type='submit'>Enviar mensagem</button>
      </form>
    </div>
  )
}