const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const session = require('telegraf/session')
const logger = require('./log4js').log4js//logger
const func = require('./func')
require('dotenv').config()
const bot = new Telegraf(process.env.BOT_TOKEN, {username: process.env.BOT_ID})

//session
bot.use(session())
////bot start
bot.startPolling()

let msgArr = new Array()//save msg array

//osmosis
bot.command('staking', (ctx) =>{
	//delete existing message
	if(typeof msgArr[ctx.chat.id] != 'undefined'){
		bot.telegram.deleteMessage(ctx.chat.id, msgArr[ctx.chat.id]).catch(err=>{
			logger.error(err)
		})
	}
	//show message
	ctx.reply(`Please wait..`).then((m) => {
		let msg = func.getMessage('osmosis')//get message
		msgArr[m.chat.id] = m.message_id
		//edit message
		bot.telegram.editMessageText(m.chat.id, m.message_id, m.message_id, msg, Extra.HTML()).catch(err=>{				
			logger.error(`=======================osmosis main1=======================`)
			logger.error(err)
			bot.telegram.editMessageText(m.chat.id, m.message_id, m.message_id, `Sorry! bot has error.`)
		})
	})
}).catch(err=>{
	bot.telegram.reply(`Sorry! bot has error.`)
	logger.error(err)
})