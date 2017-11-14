import * as path from "path";
import * as dotenv from "dotenv-safe";

const requireProcessEnv = (name: string) => {
  if (!process.env[name]) {
    throw new Error(`You must set the ${name} environment variable`);
  }
  return process.env[name];
};

if (process.env.NODE_ENV !== "production") {
  dotenv.load({
    path: path.join(__dirname, "../.env"),
    sample: path.join(__dirname, "../.env.example")
  });
}

const config: any = {
  all: {
    manageDomain: "manage.example.com",
    env: process.env.NODE_ENV || "development",
    root: path.join(__dirname, ".."),
    port: process.env.PORT || 9000,
    ip: process.env.IP || "0.0.0.0",
    defaultEmail: "no-reply@api.com",
    sendgridKey: requireProcessEnv("SENDGRID_KEY"),
    apiKey: requireProcessEnv("API_KEY"),
    jwtSecret: requireProcessEnv("JWT_SECRET"),
    mongo: {
      options: {
        db: {
          safe: true
        }
      }
    }
  },
  test: {
    mongo: {
      uri: "mongodb://localhost/api-test",
      options: {
        debug: false
      }
    }
  },
  development: {
    mongo: {
      uri: "mongodb://localhost/api-dev",
      options: {
        debug: true
      }
    }
  },
  production: {
    ip: process.env.IP || undefined,
    port: process.env.PORT || 8080,
    mongo: {
      uri: process.env.MONGODB_URI || "mongodb://localhost/api"
    }
  }
};

export default <Config>Object.assign({}, config.all, config[config.all.env]);
