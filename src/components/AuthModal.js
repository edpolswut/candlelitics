import React, { useState } from 'react';
import './AuthModal.css';

function AuthModal({ type, onClose, isDarkTheme }) {

  const [registerData, setRegisterData] = useState({
    login: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    imagem: null,
  });

  const [loginData, setLoginData] = useState({
    email: '',
    senha: '',
  });

  const handleRegisterChange = (e) => {
    const { name, value, files } = e.target;

    setRegisterData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;

    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (registerData.senha !== registerData.confirmarSenha) {
      alert('As senhas não coincidem!');
      return;
    }

    try {

      const resposta = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          login: registerData.login,
          email: registerData.email,
          senha: registerData.senha
        })
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        alert(dados.erro);
        return;
      }

      alert('Cadastro realizado com sucesso');

      onClose();

    } catch (err) {

      console.log(err);

      alert('Erro ao conectar com o servidor');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    try {

      const resposta = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: loginData.email,
          senha: loginData.senha
        })
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        alert(dados.erro);
        return;
      }

      localStorage.setItem('token', dados.token);

      alert('Login realizado com sucesso');

      onClose();

    } catch (err) {

      console.log(err);

      alert('Erro ao conectar com o servidor');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        data-theme={isDarkTheme ? 'dark' : 'light'}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>
            <i className={`fas ${type === 'login' ? 'fa-sign-in-alt' : 'fa-user-plus'}`}></i>
            {' '}
            {type === 'login'
              ? 'Entrar na Conta'
              : 'Criar Conta'}
          </h2>

          <button
            className="modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="modal-body">

          {type === 'register' ? (

            <form onSubmit={handleRegisterSubmit}>

              <div className="form-group">
                <label>Usuário</label>

                <input
                  type="text"
                  name="login"
                  className="form-input"
                  placeholder="Digite seu usuário"
                  value={registerData.login}
                  onChange={handleRegisterChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>

                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="Digite seu email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Senha</label>

                <input
                  type="password"
                  name="senha"
                  className="form-input"
                  placeholder="Digite sua senha"
                  value={registerData.senha}
                  onChange={handleRegisterChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirmar Senha</label>

                <input
                  type="password"
                  name="confirmarSenha"
                  className="form-input"
                  placeholder="Confirme sua senha"
                  value={registerData.confirmarSenha}
                  onChange={handleRegisterChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Imagem de Perfil</label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    name="imagem"
                    id="avatar-upload"
                    className="hidden-file-input"
                    accept="image/*"
                    onChange={handleRegisterChange}
                  />
                  <label htmlFor="avatar-upload" className="custom-file-label">
                    <i className="fas fa-cloud-upload-alt"></i>
                    <span className="file-name-text">
                      {registerData.imagem ? registerData.imagem.name : 'Clique para selecionar sua foto'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">

                <button
                  type="button"
                  className="btn-cancel"
                  onClick={onClose}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn-confirm"
                >
                  Cadastrar
                </button>

              </div>

            </form>

          ) : (

            <form onSubmit={handleLoginSubmit}>

              <div className="form-group">
                <label>Email</label>

                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="Digite seu email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Senha</label>

                <input
                  type="password"
                  name="senha"
                  className="form-input"
                  placeholder="Digite sua senha"
                  value={loginData.senha}
                  onChange={handleLoginChange}
                  required
                />
              </div>

              <div className="modal-footer">

                <button
                  type="button"
                  className="btn-cancel"
                  onClick={onClose}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn-confirm"
                >
                  Entrar
                </button>

              </div>

            </form>

          )}

        </div>
      </div>
    </div>
  );
}

export default AuthModal;