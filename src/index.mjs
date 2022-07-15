import express from 'express';
import session from 'express-session';
import passport from 'passport';
import mongoose from 'mongoose';
import connectEnsureLogin from 'connect-ensure-login';
import User from './models/user.mjs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

mongoose
    .connect('mongodb://localhost/passport-auth')
    .then(() => {
        console.log('Connected to MongoDB');

        app.use(
            session({
                secret: 'r8q,+&1LM3)CD*zAGpx1xm{NeQhc;#',
                resave: false,
                saveUninitialized: false,
                cookie: {
                    // 10 Seconds
                    maxAge: 10 * 1000,
                },
            })
        );

        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));

        app.use(passport.initialize());
        app.use(passport.session());

        passport.use(User.createStrategy());

        passport.serializeUser(User.serializeUser());
        passport.deserializeUser(User.deserializeUser());

        User.register({ username: 'candy', active: false }, 'cane');
        User.register({ username: 'starbuck', active: false }, 'redeye');

        app.get('/', (req, res) => {
            res.sendFile(__dirname + '/static/index.html');
        });

        app.get('/login', (req, res) => {
            res.sendFile(__dirname + '/static/login.html');
        });

        app.get(
            '/dashboard',
            connectEnsureLogin.ensureLoggedIn(),
            (req, res) => {
                res.send(`Hello ${req.user.username}. Your session ID is ${req.sessionID} 
             and your session expires in ${req.session.cookie.maxAge} 
             milliseconds.<br><br>
             <a href="/logout">Log Out</a><br><br>
             <a href="/secret">Members Only</a>`);
            }
        );

        app.get('/secret', connectEnsureLogin.ensureLoggedIn(), (req, res) => {
            res.sendFile(__dirname + '/static/secret-page.html');
        });

        app.get('/logout', function (req, res) {
            req.logout();
            res.redirect('/login');
        });

        app.post(
            '/login',
            passport.authenticate('local', { failureRedirect: '/' }),
            function (req, res) {
                console.log(req.user);
                res.redirect('/dashboard');
            }
        );

        app.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    })
    .catch((err) => {
        console.log(err);
    });
