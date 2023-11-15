import express from 'express';
import expressWs from 'express-ws';
import cookieParser from 'cookie-parser';
import * as WebSocket from 'ws';
import * as fs from 'fs';
import * as util from 'util';
import { RaceController } from './race/race-controller';
import { ErrorCode, Result, badRequest, notAllowed, result } from './race/types/result';
import { isInMessage } from './interfaces/message.interface';
import { createHash, createCipheriv, randomBytes } from 'crypto';
import { SecretsConfig } from './race/config/secret';
import { isCompetitionCreateInfo } from './race/interfaces/views.interface';
import { AddressInfo } from 'net';
// import { ParsedQs } from 'qs';

export class RaceServer {
  private readonly SERVER_PORT = 4006;
  private raceController: RaceController;
  private log_file = fs.createWriteStream(__dirname + '/debug.log', { flags: 'w' });
  private log_stdout = process.stdout;
  express: express.Express;
  expressWs: expressWs.Instance;

  private static statusMap: Record<ErrorCode, number> = {
    BadRequest: 400,
    DuplicateKey: 409,
    NotAllowed: 403,
    NotFound: 404,
  };
  private _allowed_tokens: Record<string, { login: string; password: string }>;
  private _key: Buffer;
  private _iv: Buffer;
  private response<Type>(response: express.Response, result: Result<Type>): void {
    response.setHeader('Access-Control-Allow-Origin', '*');
    if (result.err !== undefined) {
      response.status(RaceServer.statusMap[result.err.code]).send(result.err.message);
      return;
    }
    response.status(200).json(result.result);
  }
  private invalidType(response: express.Response, message: string) {
    response.status(RaceServer.statusMap.BadRequest).send(message);
  }
  private getAdminToken(request: express.Request): string | undefined {
    const token = request.cookies['token'];
    if (token === undefined || !(token in this._allowed_tokens)) return undefined;
    return token;
  }
  private hashPassword(password: string): string {
    const hash = createHash('sha256');
    return hash.update(password, 'utf-8').digest('base64');
  }
  private tokenize(login: string, passwordHash: string): string {
    const cipher = createCipheriv('aes-256-cbc', this._key, this._iv);
    let encr = cipher.update(
      `${SecretsConfig.TOKEN_SALT}${login}###${passwordHash}${SecretsConfig.TOKEN_SALT}`,
      'utf-8',
      'base64url',
    );
    encr += cipher.final('base64url');
    return encr;
  }
  constructor() {
    this._key = randomBytes(32);
    this._iv = randomBytes(16);
    const logins = [
      { login: 'rantrave', password: 'dfthtrue' },
      { login: 'w00deh', password: 'dfbossth' },
      { login: 'n0sf', password: 'dfcompsboss' },
    ];
    this._allowed_tokens = {};
    for (const l of logins) {
      this._allowed_tokens[this.tokenize(l.login, this.hashPassword(l.password))] = l;
      console.log(this.hashPassword(l.password));
    }

    this.express = express();
    this.expressWs = expressWs(this.express);
    // this.server = http.createServer(this.express);
    this.raceController = new RaceController();
    const app = this.expressWs.app;

    app.use(express.json());
    app.use(cookieParser());

    app.get('/assets/:resource(*)', async (req: express.Request, res: express.Response) => {
      console.log(__dirname + '/assets/' + req.params.resource);
      res.sendFile(__dirname + '/assets/' + req.params.resource);
    });

    app.get('/app.html', async (req: express.Request, res: express.Response) => {
      // res.sendFile(__dirname + '/../../../apps/race/src/pure-js.html');
      const html = await new Promise((r, j) =>
        fs.readFile('apps/race/src/pure-js.html', (err, b) => {
          if (err) j(err);
          else r(b);
        }),
      );
      res.status(200).setHeader('Content-Type', 'text/html').send(html);
    });

    app.route('/authorize').post((req: express.Request, res: express.Response) => {
      let token = this.getAdminToken(req);
      console.log(`TOKEN ${token}`);
      if (token !== undefined) {
        res.setHeader(
          'Set-Cookie',
          `token=${token}; Secure; Expires=${new Date(new Date().getTime() + 3600000).toUTCString()}`,
        );
        this.response(res, result(token));
        return;
      }
      const body = req.body;
      if (typeof body?.login !== 'string' || typeof body?.passwordHash !== 'string') {
        this.response(res, badRequest('bad login format'));
        return;
      }
      token = this.tokenize(body.login, body.passwordHash);
      if (token in this._allowed_tokens) {
        res.setHeader(
          'Set-Cookie',
          `token=${token}; Secure; Expires=${new Date(new Date().getTime() + 3600000).toUTCString()}`,
        );
        this.response(res, result(token));
        return;
      }
      this.response(res, notAllowed('bad login'));
    });
    app
      .route('/competitions')
      .post((req: express.Request, res: express.Response) => {
        const token = this.getAdminToken(req);
        if (!isCompetitionCreateInfo(req.body)) {
          this.invalidType(res, 'CompetitionRules expected at body');
          return;
        }
        this.response(res, this.raceController.createCompetition(req.body, token));
      })
      .get((req: express.Request, res: express.Response) => {
        const token = this.getAdminToken(req);
        this.response(res, this.raceController.listCompetitions(token));
      });
    app
      .route('/competitions/:competitionId')
      .get((req, res) => {
        const token = this.getAdminToken(req);
        this.response(res, this.raceController.getCompetition(req.params.competitionId, token));
      })
      .delete((req, res) => {
        const token = this.getAdminToken(req);
        this.response(res, this.raceController.removeCompetition(req.params.competitionId, token));
      });

    app
      .route('/competitions/:competitionId/players')
      .put((req, res) => {
        const token = this.getAdminToken(req);
        if (req.query.nick === undefined || typeof req.query.nick !== 'string') {
          this.invalidType(res, "Expected 'nick' query string parameter");
          return;
        }
        this.raceController
          .competitionAddPlayer(req.params.competitionId, token, req.query.nick)
          .then((r) => this.response(res, r));
      })
      .get((req, res) => {
        const v = this.raceController.getCompetition(req.params.competitionId, undefined);
        if (v.err !== undefined) {
          this.response(res, v);
          return;
        }
        res.json(v.result.players);
      })
      .delete((req, res) => {
        const token = this.getAdminToken(req);
        if (req.query.nick === undefined || typeof req.query.nick !== 'string') {
          this.invalidType(res, "Expected 'nick' query string parameter");
          return;
        }
        this.response(
          res,
          this.raceController.competitionRemovePlayer(req.params.competitionId, token, req.query.nick),
        );
      });
    app
      .route('/competitions/:competitionId/maps')
      .put((req, res) => {
        const token = this.getAdminToken(req);
        if (req.query.name === undefined || typeof req.query.name !== 'string') {
          this.invalidType(res, "Expected 'map' query string parameter");
          return;
        }
        this.raceController
          .competitionAddMapIntoPool(req.params.competitionId, token, req.query.name)
          .then((r) => this.response(res, r))
          .catch((r) => this.log(r));
      })
      .get((req, res) => {
        const v = this.raceController.getCompetition(req.params.competitionId, undefined);
        if (v.err !== undefined) {
          this.response(res, v);
          return;
        }
        res.json(v.result.mapPool);
      })
      .delete((req, res) => {
        const token = this.getAdminToken(req);
        if (req.query.name === undefined || typeof req.query.name !== 'string') {
          this.invalidType(res, "Expected 'map' query string parameter");
          return;
        }
        this.response(
          res,
          this.raceController.competitionRemoveMapFromPool(req.params.competitionId, token, req.query.name),
        );
      });

    app.post('/competitions/:competitionId/start', (req, res) => {
      const token = this.getAdminToken(req);
      this.raceController.competitionStart(req.params.competitionId, token).then((r) => this.response(res, r));
    });
    app
      .route('/competitions/:competitionId/rounds/:roundId')
      .post((req, res) => {
        const token = this.getAdminToken(req);
        const roundId = parseInt(req.params.roundId);
        if (isNaN(roundId)) {
          this.invalidType(res, "Expected 'roundId' to be round index");
          return;
        }
        this.response(res, this.raceController.createRound(req.params.competitionId, token, roundId));
      })
      .get((req, res) => {
        const token = this.getAdminToken(req);
        const roundId = parseInt(req.params.roundId);
        if (isNaN(roundId)) {
          this.invalidType(res, "Expected 'roundId' to be round index");
          return;
        }
        this.response(res, this.raceController.getRoundView(req.params.competitionId, roundId, token));
      });
    app.ws('/bracket/:competitionId/rounds/:roundId', (ws, req: express.Request) => {
      this.log(`new connection to ${req.params.competitionId}/${req.params.roundId}`);
      const competitionId = req.params.competitionId;
      const roundId = parseInt(req.params.roundId);
      const adminToken = this.getAdminToken(req);
      let userToken: string | undefined = undefined;

      if (req.query.token !== undefined && typeof req.query.token == 'string') {
        userToken = req.query.token;
      }
      if (isNaN(roundId)) {
        ws.send(JSON.stringify({ err: { code: 'BadRequest', message: "Expected 'roundId' to be round index" } }));
        ws.close();
        return;
      }
      const subscription = this.raceController.subscribeRound(competitionId, roundId, adminToken ?? userToken, (x) => {
        ws.send(JSON.stringify(result(x)));
      });
      console.log(subscription);
      if (subscription.err !== undefined) {
        console.log(`No connection ${RaceServer.statusMap[subscription.err.code]}`);
        try {
          ws.send(JSON.stringify(subscription));
          ws.close();
        } catch (e) {
          console.error(e);
        }
        console.log('Connection closed');
        return;
      }
      ws.send(JSON.stringify(this.raceController.getRoundView(competitionId, roundId, adminToken)));
      subscription.result.add(() => {
        ws.close(200);
      });

      ws.on('message', (msg) => {
        const message = JSON.parse(msg.toString('utf-8'));
        if (!isInMessage(message)) {
          this.log(`unknown message: ${msg.toString('utf-8')} from ${adminToken ?? userToken}`);
          return;
        }
        let res;
        switch (message.action) {
          case 'Update':
            ws.send(JSON.stringify(this.raceController.getRoundView(competitionId, roundId, adminToken)));
            break;
          // ws.send();
          case 'Ban':
            res = this.raceController.roundBan(competitionId, roundId, adminToken ?? userToken, message.mapIndex);
            if (res.err !== undefined) {
              this.log(`${message.action}: ${res.err.message}`);
              ws.send(JSON.stringify(res));
            }
            break;
          case 'Unban':
            res = this.raceController.roundUnban(competitionId, roundId, adminToken ?? userToken, message.mapIndex);
            if (res.err !== undefined) {
              this.log(`${message.action}: ${res.err.message}`);
              ws.send(JSON.stringify(res));
            }
            break;
          case 'Start':
          case 'Reset':
            res = this.raceController.roundSet(competitionId, roundId, adminToken ?? userToken, message.action);
            if (res.err !== undefined) {
              this.log(`${message.action}: ${res.err.message}`);
              ws.send(JSON.stringify(res));
            }
            break;
          case 'Complete':
            res = this.raceController.roundSet(competitionId, roundId, adminToken ?? userToken, message.winner);
            if (res.err !== undefined) {
              this.log(`${message.action}: ${res.err.message}`);
              ws.send(JSON.stringify(res));
            }
            break;
          default:
            break;
        }
      });

      ws.on('close', (_ws: WebSocket, code: number, reason: Buffer) => {
        this.log(`WebSocket closed [${code}]: ${reason?.toString('utf-8')}`);
        subscription.result.unsubscribe();
      });
    });
    const listener = app.listen(this.SERVER_PORT, () => {
      const serverAddress = listener.address() as AddressInfo;
      console.log(`Server started on ${serverAddress.port} :>`);
    });
  }
  private log(message: string): void {
    if (process.env.LOGS !== 'none') {
      this.log_file.write(Date.now() + ' | ' + util.format(message) + '\n');
      this.log_stdout.write(Date.now() + ' | ' + util.format(message) + '\n');
    }
  }
}
