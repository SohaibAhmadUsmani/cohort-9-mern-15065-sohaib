const pino=require('pino');
const dev=process.env.NODE_ENV!== 'production';
const logger=pino(dev?{transport:{target:'pino-pretty'}}:{});
module.exports=logger;