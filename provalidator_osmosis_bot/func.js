const fetch = require('sync-fetch')
require('dotenv').config()
const logger = require('./log4js').log4js//logger
const fs = require('fs')
const numeral = require('numeral')

function getMessage(coin){
	let msg = ``
	let price = ``
	let maxTokens = ``
	let stakedTokens = ``
	let totalTokens = ``
	let stakedPercent = ``
	let totalPercent = ``
	let teamTokens = ``
	let communityTokens = ``
	let communityPercent = ``
		
	try {
		//no file = create
		let file = `./json/${coin}.json`
		let rJson = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : ''
		var wdate = fs.existsSync(file) ? parseInt(rJson.wdate) + (60 * 1000) : 0
		var cdate = parseInt(new Date().getTime())
		
		if(coin == 'osmosis'){
			let osmosisInfo = getOsmosisInfo()
			msg = `🧪 <b>오스모시스 ($OSMO)</b>\nㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ\n\n`
			if( wdate <  cdate) {
				price = getPrice()
				priceUsd = price[0].toFixed(2)
				priceKrw = price[1].toFixed(0)
				maxTokens = (osmosisInfo.max_tokens/ 1000000).toFixed(0)
				stakedTokens = (osmosisInfo.bonded_tokens / 1000000 ).toFixed(0)
				stakedPercent = (stakedTokens / maxTokens * 100).toFixed(0)
				notStakedTokens = maxTokens - stakedTokens
				notStakedPercent = (notStakedTokens / maxTokens * 100).toFixed(0)
				prvDetail = getProvalidatorDetail()//get provalidator detail info
				prvRank = prvDetail.rank
				prvRate = (prvDetail.rate * 100)
				prvTokens = (prvDetail.tokens/ 1000000).toFixed(0)
				
				let wJson = {
					"priceUsd" : priceUsd,
					"priceKrw" : priceKrw,
					"maxTokens" : maxTokens,
					"stakedTokens" : stakedTokens,
					"stakedPercent" : stakedPercent,
					"notStakedTokens" : notStakedTokens,
					"notStakedPercent" : notStakedPercent,
					"prvRank" : prvRank,
					"prvTokens" : prvTokens,
					"prvRate" :  prvRate,
					"wdate" : new Date().getTime()
				}
				fs.writeFileSync(file, JSON.stringify(wJson))
			}else{
				priceUsd = rJson.priceUsd
				priceKrw = rJson.priceKrw
				maxTokens = rJson.maxTokens
				stakedTokens = rJson.stakedTokens
				stakedPercent = rJson.stakedPercent
				notStakedTokens = rJson.notStakedTokens
				notStakedPercent = rJson.notStakedPercent
				prvRank = rJson.prvRank
				prvRate = rJson.prvRate
				prvTokens = rJson.prvTokens
			}
			msg += `🥩<b>스테이킹</b>\n\n`
			msg += `💰<b>가격: $${priceUsd} (약 ${numberWithCommas(priceKrw)}원)</b>\n\n`
			msg += `🔐본딩: ${numberWithCommas(stakedTokens)} (${stakedPercent}%)\n\n`
			msg += `🔓언본딩: ${numberWithCommas(notStakedTokens)} (${notStakedPercent}%)\n\n`
			msg += `⛓️최대 공급량: ${numberWithCommas(maxTokens)} (100%)\n\n`
			//msg += `<b>프로밸리와 $OSMO 스테이킹 하세요❤️</b>\n\n`
			//msg += `<b>🏆검증인 순위: #${prvRank}</b>\n\n`
			//msg += `<b>🔖수수료: ${prvRate}%</b>\n\n`
			//msg += `<b>🤝위임량: ${numberWithCommas(prvTokens)}</b>\n\n`
			msg += `ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ\n`
			msg += `<b>프로밸리(<a href='https://provalidator.com' target='_blank'>Provalidator</a>) 검증인 만듦</b>\n`
		}	

		return msg
	}catch(err){
		logger.error(`=======================func error=======================`)
		logger.error(err)
		return null
	}
}

function getProposal(num){
	let title = ''
	let jsonLocal = getProposalFromLocal(num)
	//PROPOSAL_STATUS_DEPOSIT_PERIOD | PROPOSAL_STATUS_VOTING_PERIOD | PROPOSAL_STATUS_PASSED | PROPOSAL_STATUS_REJECTED
	if(jsonLocal === 0 || jsonLocal === false){//not found json file from local
		let jsonServer = getProposalFromServer(num) //get server data 
		if(jsonServer === 203){//not found
			return "Not found proposal #" + num
		} else if(jsonServer === 500 || jsonServer === false){//internal error
			return "Sorry! bot has error."
		}else{
			title = jsonServer.title
		}
	} else {
		//proposal is not fixed
		if(jsonLocal.status === "PROPOSAL_STATUS_PASSED" || jsonLocal.status === "PROPOSAL_STATUS_REJECTED"){
			title = jsonLocal.title
		} else{
			let jsonServer = getProposalFromServer(num) //get server data
			title = jsonServer.title
		}
	}
	let prvDetail = getProvalidatorDetail()//get provalidator detail info
	let prvRank = prvDetail.rank
	let prvRate = (prvDetail.rate * 100)
	let prvTokens = (prvDetail.tokens/ 1000000).toFixed(0)
	let msg = `🧪 <b>오스모시스 ($OSMO) 거버넌스</b>\n`
	msg += `ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ\n\n`
	msg += `<b>🗳️프로포절</b>\n\n`
	msg += `#${num} ${title}\n\n`
	msg += `📌<a href='https://www.mintscan.io/osmosis/proposals/${num}'>https://www.mintscan.io/osmosis/proposals/${num}</a>\n\n`
	msg += `🔍다른 프로포절 검색은 [/proposal 숫자]\n\n`
//	msg += `<b>프로밸리와 $OSMO 스테이킹 하세요❤</b>\n\n`
//	msg += `<b>🏆검증인 순위: #${prvRank}</b>\n\n`
//	msg += `<b>🔖수수료: ${prvRate}%</b>\n\n`
//	msg += `<b>🤝위임량: ${numberWithCommas(prvTokens)}</b>\n\n`
	msg += `ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ\n`
	msg += `<b>프로밸리(<a href='https://provalidator.com'>Provalidator</a>) 검증인 만듦</b>`
	return msg
}

function getProposalFromServer(num){ //write Proposal json
	let json = fetch(process.env.OSMOSIS_API_URL+"/gov/proposal/"+num).json()
	let file = './json/proposals/' + num + '.json'
	let wJson = {}
	//logger.info(json)
	
	try{
		if(typeof json.proposal_id !== "undefined"){
			wJson = {
				"id" : json.proposal_id, 
				"title" : json.title, 
				"desc" : json.description, 
				"status" : json.proposal_status
			}
			fs.writeFileSync(file, JSON.stringify(wJson))
			return wJson
		} else{
			//203 not found , 500 error
			return json.error_code
		}		
	}catch(err){
		logger.error(`=======================getProposalFromServer error=======================`)
		logger.error(json)
		return false
	}
}

function getProposalFromLocal(num){//read Proposal json
	let file = './json/proposals/' + num + '.json'
	try{
		if(fs.existsSync(file)){
			return JSON.parse(fs.readFileSync(file))
		} else {
			return 0
		}
	} catch(err){
		logger.error(`=======================getProposalFromJson error=======================`)
		logger.error(json)
		return false
	}
}

function getLatestProposalNum(){
	let latestProposal = 0
	
	try{
		var files = fs.readdirSync('./json/proposals')
		var fileArr = []
		for(var i = 0; i < files.length; i++){			
			fileArr.push(parseInt(files[i].replace(/\.[^/.]+$/, "")))
		}
		latestProposal = (Math.max(...fileArr))
		return latestProposal
	} catch(err){
		return 0
	}
}

function numberWithCommas(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

function getPrice(){
	let json = fetch('https://api.coingecko.com/api/v3/simple/price?ids=osmosis&vs_currencies=usd,krw').json()
	return [json.osmosis.usd, json.osmosis.krw]
}

function getProvalidatorDetail(){
	let json = fetch(process.env.OSMOSIS_API_URL+"/staking/validators").json()
	let obj = {}
	for(var i in json){
		if(process.env.PROVALIDATOR_OPERATER_ADDRESS === json[i].operator_address){			
			obj.rank = json[i].rank
			obj.rate = json[i].rate
			obj.tokens = json[i].tokens
		}
	}
	return obj	
}

function getOsmosisInfo(){
	let json = fetch(process.env.OSMOSIS_API_URL+"/status").json()
	let returnArr = { 
		'bonded_tokens' : json.bonded_tokens,
		'not_bonded_tokens' : json.not_bonded_tokens,
		'max_tokens' :''
	}
	
//	for(var j in json.total_supply_tokens.supply){
//		if(json.total_supply_tokens.supply[j].denom == 'uosmo'){
//			returnArr.max_tokens = json.total_circulating_tokens.supply[j].amount
//			break
//		}
//	}
	returnArr.max_tokens = getOsmosisMaxTokens()
	return returnArr	
}

function getOsmosisMaxTokens(){	
	let json = fetch("https://osmosis.stakesystems.io/cosmos/bank/v1beta1/supply/uosmo").json()
	return json.amount.amount
}

module.exports = {
	getMessage : getMessage,
	getProvalidatorDetail : getProvalidatorDetail,
	getProposal : getProposal,
	getProposalFromServer : getProposalFromServer,
	getProposalFromLocal : getProposalFromLocal,
	getLatestProposalNum : getLatestProposalNum
}