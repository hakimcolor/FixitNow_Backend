import app from './app';
import config from './config/index';

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}/api/health`);
});
