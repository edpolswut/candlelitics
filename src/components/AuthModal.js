import React, { useState } from 'react';
import './AuthModal.css';
import { toast } from 'react-toastify';

import { loginUser, registerUser, saveAuthData } from '../services/api';

function AuthModal({ type, onClose, isDarkTheme, onLoginSuccess }) {

  const [registerData, setRegisterData] = useState({
    login: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    imagem: null,
    fileName: '',
  });

  const [loginData, setLoginData] = useState({
    email: '',
    senha: '',
  });

  const [errors, setErrors] = useState({});
  const [loginErrors, setLoginErrors] = useState({});

  const validateRegisterForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!registerData.login.trim()) {
      newErrors.login = 'O usuário é obrigatório';
    } else if (registerData.login.trim().length < 3) {
      newErrors.login = 'O usuário deve ter pelo menos 3 caracteres';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(registerData.login)) {
      newErrors.login = 'O usuário só pode conter letras, números, - e _';
    }

    if (!registerData.email.trim()) {
      newErrors.email = 'O e-mail é obrigatório';
    } else if (!emailRegex.test(registerData.email)) {
      newErrors.email = 'Digite um e-mail válido';
    }

    if (!registerData.senha) {
      newErrors.senha = 'A senha é obrigatória';
    } else if (registerData.senha.length < 6) {
      newErrors.senha = 'A senha deve ter pelo menos 6 caracteres';
    } else if (registerData.senha.length > 50) {
      newErrors.senha = 'A senha não pode exceder 50 caracteres';
    }

    if (!registerData.confirmarSenha) {
      newErrors.confirmarSenha = 'Confirme sua senha';
    } else if (registerData.senha !== registerData.confirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateLoginForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!loginData.email.trim()) {
      newErrors.email = 'O e-mail é obrigatório';
    } else if (!emailRegex.test(loginData.email)) {
      newErrors.email = 'Digite um e-mail válido';
    }

    if (!loginData.senha) {
      newErrors.senha = 'A senha é obrigatória';
    } else if (loginData.senha.length < 6) {
      newErrors.senha = 'A senha deve ter pelo menos 6 caracteres';
    }

    setLoginErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegisterChange = (e) => {
    const { name, value, files } = e.target;

    setErrors((prev) => ({ ...prev, [name]: '' }));

    if (files?.[0]) {
      const file = files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        setRegisterData((prev) => ({
          ...prev,
          [name]: reader.result,
          fileName: file.name,
        }));
      };

      reader.readAsDataURL(file);
    } else {
      setRegisterData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;

    setLoginData((prev) => ({ ...prev, [name]: value }));

    setLoginErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (!validateRegisterForm()) return;

    try {
      await registerUser(registerData);

      toast.success('Cadastro realizado com sucesso');
      onClose();

    } catch (err) {
      toast.error(err.erro || 'Erro ao cadastrar');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (!validateLoginForm()) return;

    try {
      const data = await loginUser(loginData);

      const user = saveAuthData(data);

      if (onLoginSuccess) onLoginSuccess(user);

      toast.success('Login realizado com sucesso');
      onClose();

    } catch (err) {
      toast.error(err?.erro || 'Email ou senha inválidos');
    }
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        data-theme={isDarkTheme ? 'dark' : 'light'}
        onClick={(e) => e.stopPropagation()}
      >

        <div className="modal-header">
          <h2>
            <i className={`fas ${type === 'login' ? 'fa-sign-in-alt' : 'fa-user-plus'}`}></i>{' '}
            {type === 'login' ? 'Entrar na Conta' : 'Criar Conta'}
          </h2>

          <button className="modal-close" onClick={onClose}>×</button>
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
                  value={registerData.login}
                  onChange={handleRegisterChange}
                />
                {errors.login && <span className="error-message">{errors.login}</span>}
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="text"
                  name="email"
                  className="form-input"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  placeholder="seu.email@exemplo.com"
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label>Senha</label>
                <input
                  type="password"
                  name="senha"
                  className="form-input"
                  value={registerData.senha}
                  onChange={handleRegisterChange}
                />
                {errors.senha && <span className="error-message">{errors.senha}</span>}
              </div>

              <div className="form-group">
                <label>Confirmar Senha</label>
                <input
                  type="password"
                  name="confirmarSenha"
                  className="form-input"
                  value={registerData.confirmarSenha}
                  onChange={handleRegisterChange}
                />
                {errors.confirmarSenha && (
                  <span className="error-message">{errors.confirmarSenha}</span>
                )}
              </div>

              {/* FILE UPLOAD 100% INTACTO */}
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
                      {registerData.fileName || 'Clique para selecionar sua foto'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={onClose}>
                  Cancelar
                </button>

                <button type="submit" className="btn-confirm">
                  Cadastrar
                </button>
              </div>

            </form>

          ) : (

            <form onSubmit={handleLoginSubmit}>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="text"
                  name="email"
                  className="form-input"
                  value={loginData.email}
                  onChange={handleLoginChange}
                />
                {loginErrors.email && (
                  <span className="error-message">{loginErrors.email}</span>
                )}
              </div>

              <div className="form-group">
                <label>Senha</label>
                <input
                  type="password"
                  name="senha"
                  className="form-input"
                  value={loginData.senha}
                  onChange={handleLoginChange}
                />
                {loginErrors.senha && (
                  <span className="error-message">{loginErrors.senha}</span>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={onClose}>
                  Cancelar
                </button>

                <button type="submit" className="btn-confirm">
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
