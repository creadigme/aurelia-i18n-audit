import * as express from 'express';
import { Server } from 'http';

export class FakeI18NBackend {
  private readonly _app: express.Express;
  private _server: Server;

  private static readonly _FAKE_I18N = {
    EASY: {
      FR: {
        STOP: 'Stop',
        START: 'Start',
        PAUSE: 'Pause',
        NOT_USED: 'Another One',
      },
    },
  };

  public port: number = 8085;

  constructor() {
    this._app = express();
    this._app.get('/i18n/:ns/:lang', function (req, res) {
      const ns = req.params.ns ? req.params.ns.toUpperCase() : '';
      const lang = req.params.lang ? req.params.lang.toUpperCase() : '';
      if (FakeI18NBackend._FAKE_I18N[ns] && FakeI18NBackend._FAKE_I18N[ns][lang]) {
        res.json(FakeI18NBackend._FAKE_I18N[ns][lang]);
      } else {
        res.json({});
      }
    });
  }

  public start(port: number = 8085): Promise<boolean> {
    this.port = port;
    return new Promise((resolve, reject) => {
      try {
        this._server = this._app.listen(this.port, () => {
          console.log(`Fake i18n backend at http://localhost:${this.port}`);
          resolve(true);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  public stop() {
    if (this._server) {
      this._server.close();
    }
  }
}
