const log4js = require('log4js')

//logger
log4js.configure({
    appenders: { 
    	provalidator_osmosis_bot: { 
			type: 'dateFile', 
			filename: './provalidator_osmosis_bot.log',
		    compress: true
    	} 
    },
    categories: { 
    	default: { 
    		appenders: ['provalidator_osmosis_bot'], 
    		level: 'debug' 
    	} 
    }
})

const logger = log4js.getLogger('provalidator_osmosis_bot')

// console.log(logger)
module.exports = {
   log4js : logger
}