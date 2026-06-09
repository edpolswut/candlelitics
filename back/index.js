const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const db = require('./db');
const auth = require('./middleware/auth');

const app = express();

app.use(cors());

app.use(express.json({ limit: '10mb' }));

app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.get('/', (req, res) => {
    res.send('Backend funcionando');
});

app.post('/api/register', async (req, res) => {
    try {
        const { login, email, senha, imagem } = req.body;

        const senhaHash = await bcrypt.hash(senha, 10);

        const [usuarioCriado] = await db.query(
            'INSERT INTO Usuario (Login, Email, SenhaHash, Imagem) VALUES (?, ?, ?, ?)',
            [login, email, senhaHash, imagem]
        );

        await db.query(
            'INSERT INTO Dashboard (Id_Usuario, Nome) VALUES (?, ?)',
            [usuarioCriado.insertId, 'Meu Dashboard']
        );

        res.status(201).json({
            mensagem: 'Usuário criado com sucesso'
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            erro: 'Erro ao cadastrar usuário'
        });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        const [usuarios] = await db.query(
            'SELECT * FROM Usuario WHERE Email = ?',
            [email]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({
                erro: 'Email ou senha inválidos'
            });
        }

        const usuario = usuarios[0];

        const senhaCorreta = await bcrypt.compare(
            senha,
            usuario.SenhaHash
        );

        if (!senhaCorreta) {
            return res.status(401).json({
                erro: 'Email ou senha inválidos'
            });
        }

        const token = jwt.sign(
            {
                id: usuario.Id_Usuario,
                login: usuario.Login,
                email: usuario.Email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '2h'
            }
        );

        const imagemBase64 = usuario.Imagem ? usuario.Imagem.toString('utf-8') : null;

        res.json({
            mensagem: 'Login realizado com sucesso',
            token,
            login: usuario.Login,
            imagem: imagemBase64
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            erro: 'Erro ao fazer login'
        });
    }
});

app.get('/api/dashboards', auth, async (req, res) => {
    try {
        const [dashboards] = await db.query(
            'SELECT * FROM Dashboard WHERE Id_Usuario = ?',
            [req.usuario.id]
        );

        res.json(dashboards);

    } catch (err) {
        console.log(err);

        res.status(500).json({
            erro: 'Erro ao buscar dashboards'
        });
    }
});

app.post('/api/dashboards', auth, async (req, res) => {
    try {
        const { nome } = req.body;

        const [resultado] = await db.query(
            'INSERT INTO Dashboard (Id_Usuario, Nome) VALUES (?, ?)',
            [req.usuario.id, nome]
        );

        res.status(201).json({
            id: resultado.insertId,
            nome
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            erro: 'Erro ao criar dashboard'
        });
    }
});

app.get('/api/dashboards/principal/cards', auth, async (req, res) => {
    try {
        const [dashboards] = await db.query(
            'SELECT Id FROM Dashboard WHERE Id_Usuario = ? LIMIT 1',
            [req.usuario.id]
        );

        if (dashboards.length === 0) {
            return res.json([]);
        }

        const dashboardId = dashboards[0].Id;

        const [cards] = await db.query(
            'SELECT * FROM Cards WHERE Id_Dashboard = ?',
            [dashboardId]
        );

        res.json(cards);

    } catch (err) {
        console.log(err);

        res.status(500).json({
            erro: 'Erro ao buscar cards'
        });
    }
});

app.post('/api/dashboards/principal/cards', auth, async (req, res) => {
    try {
        const { ticker, tipoGrafico, x, y, w, h } = req.body;

        let [dashboards] = await db.query(
            'SELECT Id FROM Dashboard WHERE Id_Usuario = ? LIMIT 1',
            [req.usuario.id]
        );

        let dashboardId;

        if (dashboards.length === 0) {
            const [novoDashboard] = await db.query(
                'INSERT INTO Dashboard (Id_Usuario, Nome) VALUES (?, ?)',
                [req.usuario.id, 'Meu Dashboard']
            );

            dashboardId = novoDashboard.insertId;
        } else {
            dashboardId = dashboards[0].Id;
        }

        const [resultado] = await db.query(
            `INSERT INTO Cards
            (Id_Dashboard, Ticker, TipoGrafico, X, Y, W, H)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [dashboardId, ticker, tipoGrafico, x, y, w, h]
        );

        res.status(201).json({
            id: resultado.insertId,
            ticker,
            tipoGrafico,
            x,
            y,
            w,
            h
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            erro: 'Erro ao criar card'
        });
    }
});

app.put('/api/cards/:id/layout', auth, async (req, res) => {
    try {
        const { x, y, w, h } = req.body;

        await db.query(
            `UPDATE Cards
            SET X = ?, Y = ?, W = ?, H = ?
            WHERE Id = ?`,
            [x, y, w, h, req.params.id]
        );

        res.json({
            mensagem: 'Layout salvo com sucesso'
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            erro: 'Erro ao salvar layout'
        });
    }
});

app.delete('/api/cards/:id', auth, async (req, res) => {
    try {
        await db.query(
            'DELETE FROM Cards WHERE Id = ?',
            [req.params.id]
        );

        res.json({
            mensagem: 'Card deletado com sucesso'
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            erro: 'Erro ao deletar card'
        });
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Servidor rodando na porta ${process.env.PORT}`);
});