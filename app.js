// TODO: Puppeteer 요청은 새로운 thread 혹은 process에서 실행하거나 Nodejs에서는 요청만 받은 후 Python 등 외부 프로세스에서 코드를 실행하는 방법을 생각해 보자

const fs = require('fs');
fs.readdir('drugimg', (err) => {
  if (err) {
    console.error('drugimg folder not found. drugimg folder will be created.');
    fs.mkdir('drugimg', (err) => {
      console.error(err);
    });
  }
});

const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const dotenv = require('dotenv');
dotenv.config();

// process.env.TZ = 'America/Los_Angeles';

// Routers
const indexRouter = require('./routes/index');
const cardinalRouter = require('./routes/cardinal');
const mongodRouter = require('./routes/mongod');

const cardinalPuppet = require('./middlewares/cardinal/cardinalPuppet');

const connect = require('./schemas');
const app = express();
app.set('port', process.env.PORT || 3001);
connect();

// MySql 서버 동기화
// const { sequelize } = require('./models');
// sequelize
//   .sync({ force: false })
//   .then(() => {
//     console.log('MySQL 데이터베이스 연결 성공');
//   })
//   .catch((err) => console.log(err));

app.use(cors());
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', indexRouter);
app.use('/cardinal', cardinalRouter);
app.use('/mongod', mongodRouter);

app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
  res.status(err.status || 500);
  // res.render('error');
});

const createServer = async () => {
  app.set('cardinalPuppet', await cardinalPuppet());
  app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 대기 중');
  });
};
createServer();
