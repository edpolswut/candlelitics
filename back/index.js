const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const https = require('https');

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
                expiresIn: '24h'
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
        const { ticker, tipoGrafico, x, y, w, h, tipoAtivo, cor } = req.body;

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
      (Id_Dashboard, Ticker, TipoGrafico, X, Y, W, H, TipoAtivo, Cor)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [dashboardId, ticker, tipoGrafico, x, y, w, h, tipoAtivo || 'stock', cor || '#00b746']
  );

    res.status(201).json({
        id: resultado.insertId,
        ticker,
        tipoGrafico,
        tipoAtivo,
        cor: cor || '#00b746',
        x, y, w, h
    });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            erro: 'Erro ao criar card'
        });
    }
});

app.put('/api/cards/:id', auth, async (req, res) => {
    try {
        const { ticker, tipoGrafico, tipoAtivo, cor } = req.body;

    const [resultado] = await db.query(
        `UPDATE Cards
        SET Ticker = ?, TipoGrafico = ?, TipoAtivo = ?, Cor = ?
        WHERE Id = ?`,
        [ticker, tipoGrafico, tipoAtivo, cor, req.params.id]
    );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ erro: 'Card não encontrado' });
        }

        res.json({
            id: req.params.id,
            ticker,
            tipoGrafico,
            tipoAtivo
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ erro: 'Erro ao atualizar card' });
    }
});

app.put('/api/cards/:id/layout', auth, async (req, res) => {
    try {
        const { x, y, w, h } = req.body;

        // Garante que o tamanho mínimo seja respeitado ao salvar
        const finalW = Math.max(w, 2);
        const finalH = Math.max(h, 3);

        await db.query(
            `UPDATE Cards
            SET X = ?, Y = ?, W = ?, H = ?
            WHERE Id = ?`,
            [x, y, finalW, finalH, req.params.id]
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

app.get('/api/quote/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        const httpsAgent = new https.Agent({
            rejectUnauthorized: true,
        });
        const { range = '1mo', interval = '1d', assetType = 'stock' } = req.query;
        const API_KEY = 'ie2zCfzxZAY3SysfiKnZM9';
        
        let stockCode = symbol;
        let url;

        const axiosConfig = {
            httpsAgent,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            }
        };
        
        if (assetType === 'crypto') {
            stockCode = `${symbol.toUpperCase()}USDT`;
            
            let startTime;
            const now = new Date();
            
            if (range === '1d') now.setDate(now.getDate() - 1);
            else if (range === '5d') now.setDate(now.getDate() - 5);
            else if (range === '1y') now.setFullYear(now.getFullYear() - 1);
            else now.setMonth(now.getMonth() - 1);
            startTime = now.getTime();

            url = `https://api4.binance.com/api/v3/klines?symbol=${stockCode}&interval=${interval}&startTime=${startTime}`;
            
            const localHttpsAgent = new https.Agent({ rejectUnauthorized: false });
            const response = await axios.get(url, { 
                httpsAgent: localHttpsAgent 
            });
            const klines = response.data;

            // Adapta a resposta da Binance para o formato que o frontend espera
            const historicalDataPrice = klines.map(k => ({
                date: Math.floor(k[0] / 1000), // Converte de milissegundos para segundos
                open: parseFloat(k[1]),
                high: parseFloat(k[2]),
                low: parseFloat(k[3]),
                close: parseFloat(k[4]),
                volume: parseFloat(k[5])
            }));

            // Monta a resposta final no formato esperado
            return res.json({
                symbol: stockCode,
                currency: 'USD',
                historicalDataPrice: historicalDataPrice
            });

        } else {
            stockCode = symbol.includes('.') ? symbol : `${symbol.toUpperCase()}.SA`;
            url = `https://brapi.dev/api/quote/${stockCode}?range=${range}&interval=${interval}&token=${API_KEY}`;
            const response = await axios.get(url, { httpsAgent });
            if (!response.data.results || response.data.results.length === 0) {
                return res.status(404).json({ error: 'Símbolo não encontrado' });
            }
            res.json(response.data.results[0]);
        }
    } catch (error) {
        if (error.response) {
            console.error('\n--- ERRO DA API EXTERNA ---');
            console.error(`Status HTTP: ${error.response.status}`);
            console.error(`URL Tentada: ${error.config.url}`);
            console.error('Resposta do Servidor:', error.response.data);
            console.error('---------------------------\n');
            
            if (error.response.status === 403) {
                return res.status(403).json({ error: 'A API bloqueou o acesso. Verifique o terminal do servidor.' });
            }
            if (error.response.status === 400) {
                return res.status(400).json({ error: 'Ativo inválido ou formato incorreto.' });
            }}
        console.error('Erro ao buscar dados da API externa:', error.message);
        res.status(500).json({ error: 'Falha ao buscar dados do ativo' });
    }
});

app.get('/api/crypto/available', async (req, res) => {
    try {
        const availablePopularCoins = [
            "BTC", "ETH", "BNB", "SOL", "XRP", "DOGE", "ADA", "AVAX", "SHIB", "DOT", 
            "TRX", "LINK", "MATIC", "LTC", "BCH", "ICP", "UNI", "NEAR", "INJ", "GRT"
        ];

        res.json({ coins: availablePopularCoins });

    } catch (error) {
        console.error('Erro ao buscar criptomoedas disponíveis:', error);
        res.status(500).json({ error: 'Falha ao buscar lista de criptomoedas' });
    }
});
// ==========================================================

app.listen(process.env.PORT, () => {
    console.log(`Servidor rodando na porta ${process.env.PORT}`);
});